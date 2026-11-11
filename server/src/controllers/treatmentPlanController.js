const TreatmentPlan = require('../models/TreatmentPlan');
const { pick, enumValues, checkId, isValidId, sendNotFound, sendBadRequest } = require('./shared');

const NOT_FOUND = 'Orçamento não encontrado';
const ITEM_FIELDS = ['toothNumber', 'procedureName', 'category', 'unitPrice', 'quantity', 'status'];

const normalizeItems = (items) =>
  items.map((raw) => {
    const item = pick(raw, ITEM_FIELDS);
    item.quantity = Number(item.quantity) || 1;
    item.unitPrice = Number(item.unitPrice);
    item.total = item.unitPrice * item.quantity;
    return item;
  });

const getPlans = async (req, res, next) => {
  try {
    const { patient, status } = req.query;
    const query = {};
    if (patient) {
      if (!isValidId(patient)) return sendBadRequest(res, 'Paciente inválido');
      query.patient = patient;
    }
    if (status) query.status = String(status);

    const plans = await TreatmentPlan.find(query)
      .populate('patient', 'name cpf phone eloScore')
      .populate('dentist', 'name specialty cro')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: plans.length, plans });
  } catch (error) {
    next(error);
  }
};

const getPlanById = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const plan = await TreatmentPlan.findById(req.params.id)
      .populate('patient', 'name cpf phone email address healthInsurance eloScore')
      .populate('dentist', 'name specialty cro avatar');
    if (!plan) return sendNotFound(res, NOT_FOUND);

    res.json({ success: true, plan });
  } catch (error) {
    next(error);
  }
};

const createPlan = async (req, res, next) => {
  try {
    const { patient, title, items, discountPercentage, paymentMethod, installments, notes } = req.body;

    if (!isValidId(patient)) return sendBadRequest(res, 'Paciente válido é obrigatório.');
    if (!Array.isArray(items) || items.length === 0) {
      return sendBadRequest(res, 'Informe ao menos um procedimento no orçamento.');
    }

    const planItems = normalizeItems(items);
    if (planItems.some((i) => !Number.isFinite(i.unitPrice))) {
      return sendBadRequest(res, 'Valor unitário inválido em um dos procedimentos.');
    }

    const subtotal = planItems.reduce((acc, item) => acc + item.total, 0);
    const discPct = Number(discountPercentage) || 0;
    const discountAmount = (subtotal * discPct) / 100;

    const plan = await TreatmentPlan.create({
      patient,
      dentist: req.user._id,
      title: title || 'Plano de Tratamento Odontológico',
      items: planItems,
      subtotal,
      discountPercentage: discPct,
      discountAmount,
      totalAmount: subtotal - discountAmount,
      paymentMethod,
      installments,
      notes,
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

const updatePlanStatus = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const { status } = req.body;
    if (!enumValues(TreatmentPlan, 'status').includes(status)) {
      return sendBadRequest(res, 'Status inválido.');
    }

    const plan = await TreatmentPlan.findById(req.params.id).populate('patient').populate('dentist');
    if (!plan) return sendNotFound(res, NOT_FOUND);

    plan.status = status;
    if (status === 'aprovado') plan.approvedAt = new Date();
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

const deletePlan = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const plan = await TreatmentPlan.findByIdAndDelete(req.params.id);
    if (!plan) return sendNotFound(res, NOT_FOUND);

    res.json({ success: true, message: 'Orçamento removido com sucesso.' });
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
