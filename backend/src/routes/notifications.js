const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getAll);
router.put('/:id/read', authenticate, ctrl.markRead);
router.put('/read-all', authenticate, ctrl.markAllRead);

module.exports = router;
