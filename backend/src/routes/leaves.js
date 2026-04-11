const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leaveController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', authenticate, ctrl.getAll);
router.post('/', authenticate, ctrl.create);
router.get('/balances', authenticate, ctrl.getBalances);
router.put('/:id/approve', authenticate, authorize('admin', 'hr', 'manager'), ctrl.approve);
router.put('/:id/reject', authenticate, authorize('admin', 'hr', 'manager'), ctrl.reject);

module.exports = router;
