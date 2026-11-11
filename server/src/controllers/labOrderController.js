const LabOrder = require('../models/LabOrder');

// @desc    Listar ordens de serviço de prótese
// @route   GET /api/lab-orders
// @access  Private
const getLabOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'todos') query.status = status;

    const orders = await LabOrder.find(query)
      .populate('patient', 'name phone cpf')
      .populate('dentist', 'name specialty cro')
      .sort({ dateExpected: 1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar nova ordem de serviço de prótese
// @route   POST /api/lab-orders
// @access  Private
const createLabOrder = async (req, res, next) => {
  try {
    const { patient, labName, itemDescription, type, shade, teethNumbers, dateExpected, dateTryIn, cost, notes } = req.body;

    const order = await LabOrder.create({
      patient,
      dentist: req.user._id,
      labName: labName || 'Laboratório Protético Alpha Precision',
      itemDescription,
      type: type || 'coroa',
      shade: shade || 'A2',
      teethNumbers: teethNumbers || [],
      dateExpected,
      dateTryIn,
      cost: cost || 350,
      notes: notes || '',
      status: 'enviado',
    });

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

// @desc    Atualizar status da peça protética
// @route   PATCH /api/lab-orders/:id/status
// @access  Private
const updateStatus = async (req, res, next) => {
  try {
    const { status, dateDelivered } = req.body;
    const order = await LabOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Ordem de serviço não encontrada' });
    }

    order.status = status;
    if (status === 'concluido_pronto' || status === 'instalado_paciente') {
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

// @desc    Deletar O.S. (Admin)
// @route   DELETE /api/lab-orders/:id
// @access  Private (Admin)
const deleteLabOrder = async (req, res, next) => {
  try {
    const order = await LabOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'O.S. não encontrada' });
    }
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
