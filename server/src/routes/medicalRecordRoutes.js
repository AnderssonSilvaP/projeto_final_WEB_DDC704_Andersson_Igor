const express = require('express');
const {
  getMedicalRecord,
  updateAnamnese,
  addEvolution,
  addPrescription,
  addCertificate,
  addRadiograph,
} = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

const staff = authorize('admin', 'dentista', 'recepcao');
const clinician = authorize('admin', 'dentista');

router.use(protect);

router.get('/patient/:patientId', staff, getMedicalRecord);
router.put('/patient/:patientId/anamnese', staff, updateAnamnese);
router.post('/patient/:patientId/evolutions', clinician, addEvolution);
router.post('/patient/:patientId/prescriptions', clinician, addPrescription);
router.post('/patient/:patientId/certificates', clinician, addCertificate);
router.post('/patient/:patientId/radiographs', clinician, addRadiograph);

module.exports = router;
