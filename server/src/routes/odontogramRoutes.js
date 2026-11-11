const express = require('express');
const {
  getOdontogramByPatient,
  updateTooth,
  generateTreatmentPlanFromOdontogram,
} = require('../controllers/odontogramController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/patient/:patientId', authorize('admin', 'dentista', 'recepcao'), getOdontogramByPatient);
router.put('/patient/:patientId/tooth/:toothNumber', authorize('admin', 'dentista'), updateTooth);
router.post('/patient/:patientId/generate-budget', authorize('admin', 'dentista'), generateTreatmentPlanFromOdontogram);

module.exports = router;
