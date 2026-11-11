const express = require('express');
const router = express.Router();
const {
  getPlans,
  getPlanById,
  createPlan,
  updatePlanStatus,
  deletePlan,
} = require('../controllers/treatmentPlanController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getPlans)
  .post(createPlan);

router.route('/:id')
  .get(getPlanById)
  .delete(deletePlan);

router.patch('/:id/status', updatePlanStatus);

module.exports = router;
