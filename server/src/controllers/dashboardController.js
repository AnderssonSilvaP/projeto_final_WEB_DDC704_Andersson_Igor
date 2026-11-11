const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const FinancialTransaction = require('../models/FinancialTransaction');
const Supply = require('../models/Supply');
const LabOrder = require('../models/LabOrder');
const TreatmentPlan = require('../models/TreatmentPlan');

// @desc    Obter métricas táticas e executivas da clínica odontológica
// @route   GET /api/dashboard/stats
// @access  Private
const getExecutiveDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Consultas de Hoje
    const todayAppointments = await Appointment.find({ date: today })
      .populate('patient', 'name phone eloScore')
      .populate('dentist', 'name specialty')
      .sort({ timeSlot: 1 });

    const todayTotal = todayAppointments.length;
    const completedToday = todayAppointments.filter((a) => a.status === 'concluido').length;
    const inProgressToday = todayAppointments.filter((a) => a.status === 'em_atendimento').length;
    const waitingRoomToday = todayAppointments.filter((a) => a.status === 'aguardando');

    // 2. Pacientes
    const totalPatients = await Patient.countDocuments({ active: true });

    // 3. Financeiro do Mês
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyTransactions = await FinancialTransaction.find({
      date: { $gte: startOfMonth },
      status: 'pago',
    });

    let monthlyRevenue = 0;
    let monthlyExpenses = 0;
    monthlyTransactions.forEach((t) => {
      if (t.type === 'receita') monthlyRevenue += t.amount;
      else if (t.type === 'despesa') monthlyExpenses += t.amount;
    });

    // 4. Estoque com Alerta
    const allSupplies = await Supply.find();
    const lowStockCount = allSupplies.filter((s) => s.currentStock <= s.minStock).length;

    // 5. Próteses Pendentes
    const pendingLabOrders = await LabOrder.countDocuments({
      status: { $in: ['enviado', 'em_producao', 'prova_agendada', 'ajustes_solicitados'] },
    });

    // 6. Orçamentos Pendentes
    const pendingBudgets = await TreatmentPlan.countDocuments({ status: 'pendente' });

    // 7. Cálculo da "Barra de Avaliação Stockfish" da Clínica (Escala tática de -5.0 a +10.0)
    // Baseado na taxa de conclusão de hoje, rentabilidade mensal e ausência de rupturas de estoque
    let evalScore = 2.0; // Início equilibrado
    if (todayTotal > 0) {
      evalScore += (completedToday / todayTotal) * 3.5;
    } else {
      evalScore += 1.0;
    }
    if (monthlyRevenue > monthlyExpenses) {
      evalScore += Math.min(3.5, (monthlyRevenue / (monthlyExpenses || 1)) * 1.5);
    }
    if (lowStockCount > 3) {
      evalScore -= 1.5; // Penalidade por falta de insumos (blunder operacional)
    }

    const formattedEval = Math.min(10.0, Math.max(-5.0, evalScore)).toFixed(1);

    res.json({
      success: true,
      stats: {
        todayTotal,
        completedToday,
        inProgressToday,
        waitingRoomCount: waitingRoomToday.length,
        totalPatients,
        monthlyRevenue,
        monthlyExpenses,
        monthlyNetProfit: monthlyRevenue - monthlyExpenses,
        lowStockCount,
        pendingLabOrders,
        pendingBudgets,
        stockfishEvaluation: {
          score: Number(formattedEval),
          display: formattedEval >= 0 ? `+${formattedEval}` : formattedEval,
          advantage: formattedEval > 0 ? 'Excelente Eficiência Operacional' : 'Atenção Operacional Necessária',
          evalBarPercentage: Math.min(100, Math.max(10, ((Number(formattedEval) + 5) / 15) * 100)),
        },
        waitingRoomQueue: waitingRoomToday,
        todayAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExecutiveDashboardStats,
};
