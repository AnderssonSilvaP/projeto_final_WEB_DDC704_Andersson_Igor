const FinancialTransaction = require('../models/FinancialTransaction');
const User = require('../models/User');

// @desc    Listar transações financeiras
// @route   GET /api/financial/transactions
// @access  Private (Admin, Dentista com filtro próprio)
const getTransactions = async (req, res, next) => {
  try {
    const { type, status, category, startDate, endDate } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Se for dentista comum, vê apenas seus procedimentos e comissões
    if (req.user.role === 'dentista') {
      query.$or = [{ dentist: req.user._id }, { 'commission.dentist': req.user._id }];
    }

    const transactions = await FinancialTransaction.find(query)
      .populate('patient', 'name cpf')
      .populate('dentist', 'name specialty')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar lançamento financeiro (receita ou despesa)
// @route   POST /api/financial/transactions
// @access  Private (Admin, Recepção)
const createTransaction = async (req, res, next) => {
  try {
    const { type, category, description, amount, paymentMethod, status, patient, dentist } = req.body;

    let commissionData = { percentage: 0, amount: 0, isPaid: false };
    if (type === 'receita' && dentist) {
      const doc = await User.findById(dentist);
      const rate = doc?.commissionRate || 50;
      commissionData = {
        dentist: doc?._id,
        percentage: rate,
        amount: (amount * rate) / 100,
        isPaid: false,
      };
    }

    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;

    const transaction = await FinancialTransaction.create({
      type,
      category,
      description,
      amount,
      paymentMethod: paymentMethod || 'pix',
      status: status || 'pago',
      patient,
      dentist,
      commission: commissionData,
      receiptNumber,
    });

    const populated = await FinancialTransaction.findById(transaction._id)
      .populate('patient', 'name')
      .populate('dentist', 'name');

    res.status(201).json({
      success: true,
      message: 'Lançamento financeiro registrado com sucesso.',
      transaction: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter resumo executivo de fluxo de caixa e comissões
// @route   GET /api/financial/summary
// @access  Private
const getFinancialSummary = async (req, res, next) => {
  try {
    const transactions = await FinancialTransaction.find({ status: 'pago' });

    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalCommissionsPending = 0;

    const categoryBreakdown = {};

    transactions.forEach((t) => {
      if (t.type === 'receita') {
        totalRevenue += t.amount;
        if (t.commission && !t.commission.isPaid) {
          totalCommissionsPending += t.commission.amount || 0;
        }
      } else if (t.type === 'despesa') {
        totalExpenses += t.amount;
      }

      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    const netBalance = totalRevenue - totalExpenses;

    res.json({
      success: true,
      summary: {
        totalRevenue,
        totalExpenses,
        netBalance,
        totalCommissionsPending,
        categoryBreakdown,
        profitMarginPercentage: totalRevenue > 0 ? ((netBalance / totalRevenue) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Excluir lançamento (Apenas Admin)
// @route   DELETE /api/financial/transactions/:id
// @access  Private (Admin)
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await FinancialTransaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Lançamento não encontrado' });
    }
    res.json({ success: true, message: 'Transação excluída com sucesso.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  getFinancialSummary,
  deleteTransaction,
};
