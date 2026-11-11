const express = require('express');
const { getExecutiveDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin', 'dentista', 'recepcao'));

router.get('/stats', getExecutiveDashboardStats);

module.exports = router;
