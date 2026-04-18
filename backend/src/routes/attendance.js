const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getAll);
router.get('/today', authenticate, ctrl.getTodayStatus);
router.post('/checkin', authenticate, ctrl.checkIn);
router.post('/checkout', authenticate, ctrl.checkOut);

module.exports = router;
