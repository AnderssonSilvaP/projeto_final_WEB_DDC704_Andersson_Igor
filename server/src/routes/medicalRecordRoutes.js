const express = require('express');
const router = express.Router();
const {
  getMedicalRecord,
  updateAnamnese,
  addEvolution,
  addPrescription,
  addCertificate,
  addRadiograph,
} = require('../controllers/medicalRecordController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/patient/:patientId', getMedicalRecord);
router.put('/patient/:patientId/anamnese', updateAnamnese);
router.post('/patient/:patientId/evolutions', addEvolution);
router.post('/patient/:patientId/prescriptions', addPrescription);
router.post('/patient/:patientId/certificates', addCertificate);
router.post('/patient/:patientId/radiographs', addRadiograph);

module.exports = router;
