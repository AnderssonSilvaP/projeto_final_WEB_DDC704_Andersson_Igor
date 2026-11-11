const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const FinancialTransaction = require('../models/FinancialTransaction');
const Supply = require('../models/Supply');
const LabOrder = require('../models/LabOrder');
const TreatmentPlan = require('../models/TreatmentPlan');

const OPEN_LAB_STATUSES = ['enviado', 'em_producao', 'prova_agendada', 'ajustes_solicitados'];

// Operational health score on a -5.0 to +10.0 scale, derived from today's completion rate,
// monthly profitability and stock alerts. The response key keeps the name the client expects.
const computeEfficiencyScore = ({ todayTotal, completedToday, monthlyRevenue, monthlyExpenses, lowStockCount }) => {
  let score = 2.0;
  score += todayTotal > 0 ? (completedToday / todayTotal) * 3.5 : 1.0;
  if (monthlyRevenue > monthlyExpenses) {
    score += Math.min(3.5, (monthlyRevenue / (monthlyExpenses || 1)) * 1.5);
  }
  if (lowStockCount > 3) score -= 1.5;
  return Math.min(10.0, Math.max(-5.0, score));
};

const getExecutiveDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayAppointments, totalPatients, monthlyTransactions, lowStockCount, pendingLabOrders, pendingBudgets] =
      await Promise.all([
        Appointment.find({ date: today })
          .populate('patient', 'name phone eloScore')
          .populate('dentist', 'name specialty')
          .sort({ timeSlot: 1 }),
        Patient.countDocuments({ active: true }),
        FinancialTransaction.find({ date: { $gte: startOfMonth }, status: 'pago' }),
        Supply.countDocuments({ $expr: { $lte: ['$currentStock', '$minStock'] } }),
        LabOrder.countDocuments({ status: { $in: OPEN_LAB_STATUSES } }),
        TreatmentPlan.countDocuments({ status: 'pendente' }),
      ]);

    const todayTotal = todayAppointments.length;
    const completedToday = todayAppointments.filter((a) => a.status === 'concluido').length;
    const inProgressToday = todayAppointments.filter((a) => a.status === 'em_atendimento').length;
    const waitingRoomQueue = todayAppointments.filter((a) => a.status === 'aguardando');

    let monthlyRevenue = 0;
    let monthlyExpenses = 0;
    monthlyTransactions.forEach((t) => {
      if (t.type === 'receita') monthlyRevenue += t.amount;
      else if (t.type === 'despesa') monthlyExpenses += t.amount;
    });

    const score = Number(
      computeEfficiencyScore({ todayTotal, completedToday, monthlyRevenue, monthlyExpenses, lowStockCount }).toFixed(1)
    );

    res.json({
      success: true,
      stats: {
        todayTotal,
        completedToday,
        inProgressToday,
        waitingRoomCount: waitingRoomQueue.length,
        totalPatients,
        monthlyRevenue,
        monthlyExpenses,
        monthlyNetProfit: monthlyRevenue - monthlyExpenses,
        lowStockCount,
        pendingLabOrders,
        pendingBudgets,
        efficiency: {
          score,
          display: score >= 0 ? `+${score.toFixed(1)}` : score.toFixed(1),
          advantage: score > 0 ? 'Excelente Eficiência Operacional' : 'Atenção Operacional Necessária',
          evalBarPercentage: Math.min(100, Math.max(10, ((score + 5) / 15) * 100)),
        },
        waitingRoomQueue,
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
