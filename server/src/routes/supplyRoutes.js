const express = require('express');
const router = express.Router();
const {
  getSupplies,
  createSupply,
  updateSupply,
  adjustStock,
  deleteSupply,
} = require('../controllers/supplyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSupplies)
  .post(createSupply);

router.patch('/:id/adjust', adjustStock);

router.route('/:id')
  .put(updateSupply)
  .delete(authorize('admin'), deleteSupply);

module.exports = router;
