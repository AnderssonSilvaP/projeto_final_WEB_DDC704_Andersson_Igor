const express = require('express');
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  interactiveCheckin,
  assistantChat,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public: virtual assistant chat and kiosk check-in.
router.post('/assistant-chat', assistantChat);
router.post('/interactive-checkin', interactiveCheckin);

router.use(protect, authorize('admin', 'dentista', 'recepcao'));

router.route('/')
  .get(getPatients)
  .post(createPatient);

router.route('/:id')
  .get(getPatientById)
  .put(updatePatient)
  .delete(authorize('admin'), deletePatient);

module.exports = router;
