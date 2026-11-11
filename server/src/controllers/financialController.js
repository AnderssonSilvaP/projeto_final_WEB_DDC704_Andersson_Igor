const FinancialTransaction = require('../models/FinancialTransaction');
const User = require('../models/User');
const { pick, newReceiptNumber, checkId, isValidId, sendNotFound, sendBadRequest } = require('./shared');

const FIELDS = ['type', 'category', 'description', 'amount', 'paymentMethod', 'status', 'patient', 'dentist'];
const DEFAULT_COMMISSION_RATE = 50;

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getTransactions = async (req, res, next) => {
  try {
    const { type, status, category, startDate, endDate } = req.query;
    const query = {};

    if (type) query.type = String(type);
    if (status) query.status = String(status);
    if (category) query.category = String(category);

    if (startDate || endDate) {
      query.date = {};
      const start = startDate && parseDate(startDate);
      const end = endDate && parseDate(endDate);
      if ((startDate && !start) || (endDate && !end)) return sendBadRequest(res, 'Período inválido.');
      if (start) query.date.$gte = start;
      if (end) query.date.$lte = end;
    }

    // Dentists only see their own procedures and commissions.
    if (req.user.role === 'dentista') {
      query.$or = [{ dentist: req.user._id }, { 'commission.dentist': req.user._id }];
    }

    const transactions = await FinancialTransaction.find(query)
      .populate('patient', 'name cpf')
      .populate('dentist', 'name specialty')
      .sort({ date: -1 });

    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const data = pick(req.body, FIELDS);

    data.amount = Number(data.amount);
    if (!Number.isFinite(data.amount) || data.amount < 0) {
      return sendBadRequest(res, 'Valor inválido.');
    }
    if (data.patient && !isValidId(data.patient)) return sendBadRequest(res, 'Paciente inválido.');
    if (data.dentist && !isValidId(data.dentist)) return sendBadRequest(res, 'Dentista inválido.');

    let commission = { percentage: 0, amount: 0, isPaid: false };
    if (data.type === 'receita' && data.dentist) {
      const doctor = await User.findById(data.dentist);
      if (doctor) {
        const rate = doctor.commissionRate || DEFAULT_COMMISSION_RATE;
        commission = {
          dentist: doctor._id,
          percentage: rate,
          amount: (data.amount * rate) / 100,
          isPaid: false,
        };
      }
    }

    const transaction = await FinancialTransaction.create({
      ...data,
      commission,
      receiptNumber: newReceiptNumber(),
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

const deleteTransaction = async (req, res, next) => {
  try {
    const notFound = 'Lançamento não encontrado';
    if (!checkId(res, req.params.id, notFound)) return;

    const transaction = await FinancialTransaction.findByIdAndDelete(req.params.id);
    if (!transaction) return sendNotFound(res, notFound);

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
