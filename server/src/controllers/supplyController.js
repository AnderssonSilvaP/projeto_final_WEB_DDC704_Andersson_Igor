const Supply = require('../models/Supply');

// @desc    Listar insumos odontológicos com alertas de estoque
// @route   GET /api/supplies
// @access  Private
const getSupplies = async (req, res, next) => {
  try {
    const { category, search, alertOnly } = req.query;
    const query = {};

    if (category && category !== 'todos') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const supplies = await Supply.find(query).sort({ currentStock: 1 });

    const formatted = supplies.map((item) => {
      const isLow = item.currentStock <= item.minStock;
      const isExpired = new Date(item.expirationDate) < new Date();
      return {
        ...item.toObject(),
        isLowStock: isLow,
        isExpired,
      };
    });

    const finalResult = alertOnly === 'true' ? formatted.filter((i) => i.isLowStock || i.isExpired) : formatted;

    res.json({
      success: true,
      count: finalResult.length,
      supplies: finalResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cadastrar novo material no estoque
// @route   POST /api/supplies
// @access  Private
const createSupply = async (req, res, next) => {
  try {
    const supply = await Supply.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Item adicionado ao estoque da clínica.',
      supply,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar material
// @route   PUT /api/supplies/:id
// @access  Private
const updateSupply = async (req, res, next) => {
  try {
    const supply = await Supply.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!supply) {
      return res.status(404).json({ success: false, message: 'Item de estoque não encontrado' });
    }

    res.json({
      success: true,
      message: 'Material atualizado com sucesso.',
      supply,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ajustar quantidade em estoque rapidamente (+ / -)
// @route   PATCH /api/supplies/:id/adjust
// @access  Private
const adjustStock = async (req, res, next) => {
  try {
    const { delta } = req.body; // e.g. +5 or -1
    const supply = await Supply.findById(req.params.id);

    if (!supply) {
      return res.status(404).json({ success: false, message: 'Item de estoque não encontrado' });
    }

    const newStock = Math.max(0, supply.currentStock + Number(delta));
    supply.currentStock = newStock;
    await supply.save();

    res.json({
      success: true,
      message: `Estoque de '${supply.name}' ajustado para ${newStock} ${supply.unit}.`,
      supply,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Excluir material do estoque (Admin)
// @route   DELETE /api/supplies/:id
// @access  Private (Admin)
const deleteSupply = async (req, res, next) => {
  try {
    const supply = await Supply.findByIdAndDelete(req.params.id);
    if (!supply) {
      return res.status(404).json({ success: false, message: 'Item não encontrado' });
    }

    res.json({
      success: true,
      message: 'Material removido do cadastro.',
    });
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
