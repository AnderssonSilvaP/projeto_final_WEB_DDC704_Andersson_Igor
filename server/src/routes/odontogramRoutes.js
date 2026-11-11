const express = require('express');
const router = express.Router();
const {
  getOdontogramByPatient,
  updateTooth,
  generateTreatmentPlanFromOdontogram,
} = require('../controllers/odontogramController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/patient/:patientId', getOdontogramByPatient);
router.put('/patient/:patientId/tooth/:toothNumber', updateTooth);
router.post('/patient/:patientId/generate-budget', generateTreatmentPlanFromOdontogram);

module.exports = router;
