const express = require('express');
const { getDashboard } = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/dashboard', authorize('admin'), getDashboard);

module.exports = router;
