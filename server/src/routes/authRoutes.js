const router = require('express').Router();
const { register, login, getMe, updateProfile, getUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, authorize('admin', 'dentista', 'recepcao'), getUsers);

module.exports = router;
