const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getTodayAppointments,
  createAppointment,
  updateStatus,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/today', getTodayAppointments);

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.patch('/:id/status', updateStatus);

router.route('/:id')
  .put(updateAppointment)
  .delete(deleteAppointment);

module.exports = router;
