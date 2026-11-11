const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  getFinancialSummary,
  deleteTransaction,
} = require('../controllers/financialController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getFinancialSummary);

router.route('/transactions')
  .get(getTransactions)
  .post(createTransaction);

router.delete('/transactions/:id', authorize('admin'), deleteTransaction);

module.exports = router;
