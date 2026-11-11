const express = require('express');
const {
  getTransactions,
  createTransaction,
  getFinancialSummary,
  deleteTransaction,
} = require('../controllers/financialController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', authorize('admin', 'dentista'), getFinancialSummary);

router.route('/transactions')
  .get(authorize('admin', 'dentista', 'recepcao'), getTransactions)
  .post(authorize('admin', 'recepcao'), createTransaction);

router.delete('/transactions/:id', authorize('admin'), deleteTransaction);

module.exports = router;
