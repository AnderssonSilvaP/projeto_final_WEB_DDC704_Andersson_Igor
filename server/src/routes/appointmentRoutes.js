const router = require('express').Router();
const {
  getAppointments,
  getOccupiedSlots,
  getSummary,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/occupied', getOccupiedSlots);
router.get('/summary', authorize('admin'), getSummary);

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.route('/:id')
  .put(updateAppointment)
  .delete(authorize('admin'), deleteAppointment);

module.exports = router;
