const TreatmentPlan = require('../models/TreatmentPlan');
const FinancialTransaction = require('../models/FinancialTransaction');

// @desc    Listar orçamentos e planos de tratamento
// @route   GET /api/treatment-plans
// @access  Private
const getPlans = async (req, res, next) => {
  try {
    const { patient, status } = req.query;
    const query = {};
    if (patient) query.patient = patient;
    if (status) query.status = status;

    const plans = await TreatmentPlan.find(query)
      .populate('patient', 'name cpf phone eloScore')
      .populate('dentist', 'name specialty cro')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter orçamento por ID
// @route   GET /api/treatment-plans/:id
// @access  Private
const getPlanById = async (req, res, next) => {
  try {
    const plan = await TreatmentPlan.findById(req.params.id)
      .populate('patient', 'name cpf phone email address healthInsurance eloScore')
      .populate('dentist', 'name specialty cro avatar');

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Orçamento não encontrado' });
    }

    res.json({ success: true, plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar novo orçamento
// @route   POST /api/treatment-plans
// @access  Private
const createPlan = async (req, res, next) => {
  try {
    const { patient, title, items, discountPercentage, paymentMethod, installments, notes } = req.body;

    const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * (item.quantity || 1)), 0);
    const discPct = Number(discountPercentage) || 0;
    const discountAmount = (subtotal * discPct) / 100;
    const totalAmount = subtotal - discountAmount;

    const plan = await TreatmentPlan.create({
      patient,
      dentist: req.user._id,
      title: title || 'Plano de Tratamento Odontológico',
      items,
      subtotal,
      discountPercentage: discPct,
      discountAmount,
      totalAmount,
      paymentMethod: paymentMethod || 'pix',
      installments: installments || 1,
      notes: notes || '',
      status: 'pendente',
    });

    const populated = await TreatmentPlan.findById(plan._id)
      .populate('patient', 'name cpf phone')
      .populate('dentist', 'name specialty cro');

    res.status(201).json({
      success: true,
      message: 'Plano de tratamento orçado com sucesso.',
      plan: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Alterar status do orçamento (Aprovar, Concluir, etc.)
// @route   PATCH /api/treatment-plans/:id/status
// @access  Private
const updatePlanStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const plan = await TreatmentPlan.findById(req.params.id).populate('patient').populate('dentist');

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Orçamento não encontrado' });
    }

    plan.status = status;
    if (status === 'aprovado') {
      plan.approvedAt = new Date();
    }

    await plan.save();

    res.json({
      success: true,
      message: `Status do plano atualizado para: '${status}'.`,
      plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar plano de tratamento
// @route   DELETE /api/treatment-plans/:id
// @access  Private
const deletePlan = async (req, res, next) => {
  try {
    const plan = await TreatmentPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Orçamento não encontrado' });
    }

    res.json({
      success: true,
      message: 'Orçamento removido com sucesso.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlanStatus,
  deletePlan,
};
