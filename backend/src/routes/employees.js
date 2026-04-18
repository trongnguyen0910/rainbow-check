const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', authenticate, ctrl.getAll);
router.get('/:id', authenticate, ctrl.getById);
router.post('/', authenticate, authorize('admin', 'hr'), ctrl.create);
router.put('/:id', authenticate, authorize('admin', 'hr'), ctrl.update);
router.delete('/:id', authenticate, authorize('admin'), ctrl.remove);

module.exports = router;
