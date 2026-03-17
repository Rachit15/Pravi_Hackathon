const express = require('express');
const {
  createGrievance,
  getGrievances,
  getGrievanceById,
  updateGrievanceStatus,
  addGrievanceUpdate,
} = require('../controllers/grievance.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('citizen'), createGrievance);
router.get('/', getGrievances);
router.get('/:id', getGrievanceById);
router.put('/:id/status', authorize('officer', 'admin'), updateGrievanceStatus);
router.post('/:id/update', authorize('officer', 'admin'), addGrievanceUpdate);

module.exports = router;
