const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getProfile);
router.put('/', authenticate, ctrl.updateProfile);
router.put('/avatar', authenticate, ctrl.uploadAvatar);

module.exports = router;
