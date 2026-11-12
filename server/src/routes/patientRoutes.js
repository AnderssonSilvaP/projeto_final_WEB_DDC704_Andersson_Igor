const router = require('express').Router();
const {
  getMyPatientProfile,
  updateMyPatientProfile,
  getPatients,
  getPatientById,
  getPatientHistory,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/me')
  .get(getMyPatientProfile)
  .put(updateMyPatientProfile);

router.route('/')
  .get(getPatients)
  .post(authorize('admin'), createPatient);

router.get('/:id/history', authorize('admin', 'medico'), getPatientHistory);

router.route('/:id')
  .get(getPatientById)
  .put(authorize('admin', 'medico'), updatePatient)
  .delete(authorize('admin'), deletePatient);

module.exports = router;
