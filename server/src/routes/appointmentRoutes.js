const express = require('express');
const {
  getAppointments,
  getTodayAppointments,
  createAppointment,
  updateStatus,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin', 'dentista', 'recepcao'));

router.get('/today', getTodayAppointments);

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.patch('/:id/status', updateStatus);

router.route('/:id')
  .put(updateAppointment)
  .delete(authorize('admin'), deleteAppointment);

module.exports = router;
