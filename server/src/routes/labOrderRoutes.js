const express = require('express');
const router = express.Router();
const {
  getLabOrders,
  createLabOrder,
  updateStatus,
  deleteLabOrder,
} = require('../controllers/labOrderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getLabOrders)
  .post(createLabOrder);

router.patch('/:id/status', updateStatus);
router.delete('/:id', authorize('admin'), deleteLabOrder);

module.exports = router;
