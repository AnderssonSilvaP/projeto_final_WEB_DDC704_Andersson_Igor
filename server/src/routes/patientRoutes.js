const express = require('express');
const router = express.Router();
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

// Rotas Públicas da Assistente Virtual Sofia (Chat NLP e Check-in)
router.post('/assistant-chat', assistantChat);
router.post('/interactive-checkin', interactiveCheckin);

router.use(protect);

router.route('/')
  .get(getPatients)
  .post(createPatient);

router.route('/:id')
  .get(getPatientById)
  .put(updatePatient)
  .delete(authorize('admin'), deletePatient);

module.exports = router;
