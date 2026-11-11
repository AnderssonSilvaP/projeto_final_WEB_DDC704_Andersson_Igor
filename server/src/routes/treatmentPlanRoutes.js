const express = require('express');
const {
  getPlans,
  getPlanById,
  createPlan,
  updatePlanStatus,
  deletePlan,
} = require('../controllers/treatmentPlanController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin', 'dentista', 'recepcao'));

router.route('/')
  .get(getPlans)
  .post(authorize('admin', 'dentista'), createPlan);

router.route('/:id')
  .get(getPlanById)
  .delete(authorize('admin'), deletePlan);

router.patch('/:id/status', updatePlanStatus);

module.exports = router;
