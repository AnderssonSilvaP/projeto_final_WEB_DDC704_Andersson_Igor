const Supply = require('../models/Supply');
const { pick, escapeRegex, checkId, sendNotFound, sendBadRequest } = require('./shared');

const NOT_FOUND = 'Item de estoque não encontrado';
const FIELDS = [
  'name', 'category', 'currentStock', 'minStock', 'unit', 'batchNumber',
  'expirationDate', 'unitCost', 'supplier', 'location', 'notes',
];

const getSupplies = async (req, res, next) => {
  try {
    const { category, search, alertOnly } = req.query;
    const query = {};

    if (category && category !== 'todos') query.category = String(category);
    if (search) query.name = { $regex: escapeRegex(search), $options: 'i' };

    const supplies = await Supply.find(query).sort({ currentStock: 1 });

    const now = new Date();
    const formatted = supplies.map((item) => ({
      ...item.toObject(),
      isLowStock: item.currentStock <= item.minStock,
      isExpired: new Date(item.expirationDate) < now,
    }));

    const result = alertOnly === 'true' ? formatted.filter((i) => i.isLowStock || i.isExpired) : formatted;

    res.json({ success: true, count: result.length, supplies: result });
  } catch (error) {
    next(error);
  }
};

const createSupply = async (req, res, next) => {
  try {
    const supply = await Supply.create(pick(req.body, FIELDS));
    res.status(201).json({
      success: true,
      message: 'Item adicionado ao estoque da clínica.',
      supply,
    });
  } catch (error) {
    next(error);
  }
};

const updateSupply = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const supply = await Supply.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), {
      new: true,
      runValidators: true,
    });
    if (!supply) return sendNotFound(res, NOT_FOUND);

    res.json({ success: true, message: 'Material atualizado com sucesso.', supply });
  } catch (error) {
    next(error);
  }
};

const adjustStock = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const delta = Number(req.body.delta);
    if (!Number.isFinite(delta)) return sendBadRequest(res, 'Informe um ajuste numérico (delta).');

    const supply = await Supply.findById(req.params.id);
    if (!supply) return sendNotFound(res, NOT_FOUND);

    supply.currentStock = Math.max(0, supply.currentStock + delta);
    await supply.save();

    res.json({
      success: true,
      message: `Estoque de '${supply.name}' ajustado para ${supply.currentStock} ${supply.unit}.`,
      supply,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSupply = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const supply = await Supply.findByIdAndDelete(req.params.id);
    if (!supply) return sendNotFound(res, NOT_FOUND);

    res.json({ success: true, message: 'Material removido do cadastro.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupplies,
  createSupply,
  updateSupply,
  adjustStock,
  deleteSupply,
};
