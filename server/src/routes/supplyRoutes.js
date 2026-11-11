const express = require('express');
const {
  getSupplies,
  createSupply,
  updateSupply,
  adjustStock,
  deleteSupply,
} = require('../controllers/supplyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin', 'dentista', 'recepcao'));

router.route('/')
  .get(getSupplies)
  .post(createSupply);

router.patch('/:id/adjust', adjustStock);

router.route('/:id')
  .put(updateSupply)
  .delete(authorize('admin'), deleteSupply);

module.exports = router;
