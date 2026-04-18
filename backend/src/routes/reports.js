const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/monthly', authenticate, ctrl.getMonthlyReport);
router.get('/export', authenticate, authorize('admin', 'hr'), ctrl.exportReport);

module.exports = router;
