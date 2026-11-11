const LabOrder = require('../models/LabOrder');
const { pick, enumValues, checkId, isValidId, sendNotFound, sendBadRequest } = require('./shared');

const NOT_FOUND = 'Ordem de serviço não encontrada';
const FIELDS = [
  'patient', 'labName', 'itemDescription', 'type', 'shade', 'teethNumbers',
  'dateExpected', 'dateTryIn', 'cost', 'notes',
];
const DELIVERED_STATUSES = ['concluido_pronto', 'instalado_paciente'];

const getLabOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'todos') query.status = String(status);

    const orders = await LabOrder.find(query)
      .populate('patient', 'name phone cpf')
      .populate('dentist', 'name specialty cro')
      .sort({ dateExpected: 1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

const createLabOrder = async (req, res, next) => {
  try {
    const data = pick(req.body, FIELDS);
    if (!isValidId(data.patient)) return sendBadRequest(res, 'Paciente válido é obrigatório.');

    const order = await LabOrder.create({ ...data, dentist: req.user._id, status: 'enviado' });
    const populated = await LabOrder.findById(order._id)
      .populate('patient', 'name phone')
      .populate('dentist', 'name specialty');

    res.status(201).json({
      success: true,
      message: 'O.S. enviada ao laboratório de prótese.',
      order: populated,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const { status, dateDelivered } = req.body;
    if (!enumValues(LabOrder, 'status').includes(status)) {
      return sendBadRequest(res, 'Status inválido.');
    }

    const order = await LabOrder.findById(req.params.id);
    if (!order) return sendNotFound(res, NOT_FOUND);

    order.status = status;
    if (DELIVERED_STATUSES.includes(status)) {
      order.dateDelivered = dateDelivered || new Date();
    }
    await order.save();

    res.json({
      success: true,
      message: `Status da O.S. alterado para: '${status}'.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

const deleteLabOrder = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const order = await LabOrder.findByIdAndDelete(req.params.id);
    if (!order) return sendNotFound(res, NOT_FOUND);

    res.json({ success: true, message: 'Ordem de serviço removida.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLabOrders,
  createLabOrder,
  updateStatus,
  deleteLabOrder,
};
