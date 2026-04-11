const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', authenticate, ctrl.getSettings);
router.put('/', authenticate, authorize('admin'), ctrl.updateSettings);
router.get('/departments', authenticate, ctrl.getDepartments);

module.exports = router;
