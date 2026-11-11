const express = require('express');
const router = express.Router();
const { getExecutiveDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getExecutiveDashboardStats);

module.exports = router;
