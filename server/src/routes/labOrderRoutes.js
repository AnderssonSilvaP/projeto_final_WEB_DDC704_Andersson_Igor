const express = require('express');
const {
  getLabOrders,
  createLabOrder,
  updateStatus,
  deleteLabOrder,
} = require('../controllers/labOrderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin', 'dentista', 'recepcao'));

router.route('/')
  .get(getLabOrders)
  .post(authorize('admin', 'dentista'), createLabOrder);

router.patch('/:id/status', updateStatus);
router.delete('/:id', authorize('admin'), deleteLabOrder);

module.exports = router;
