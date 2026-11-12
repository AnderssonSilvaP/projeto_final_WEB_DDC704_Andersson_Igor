const Service = require('../models/Service');
const { pick, checkId } = require('./shared');

const FIELDS = ['name', 'category', 'description', 'durationMinutes', 'price', 'active'];

async function getServices(req, res, next) {
  try {
    const { category } = req.query;
    const query = { active: true };
    if (typeof category === 'string' && category && category !== 'todos') {
      query.category = category;
    }
    const services = await Service.find(query).sort({ category: 1, name: 1 });
    res.json({ success: true, services });
  } catch (err) {
    next(err);
  }
}

async function createService(req, res, next) {
  try {
    const data = pick(req.body, FIELDS);
    const service = await Service.create(data);
    res.status(201).json({ success: true, service });
  } catch (err) {
    next(err);
  }
}

async function updateService(req, res, next) {
  try {
    if (!checkId(res, req.params.id, 'Procedimento não encontrado.')) return;
    const data = pick(req.body, FIELDS);
    const service = await Service.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Procedimento não encontrado.' });
    }
    res.json({ success: true, service });
  } catch (err) {
    next(err);
  }
}

async function deleteService(req, res, next) {
  try {
    if (!checkId(res, req.params.id, 'Procedimento não encontrado.')) return;
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Procedimento não encontrado.' });
    }
    res.json({ success: true, message: 'Procedimento excluído com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
};
