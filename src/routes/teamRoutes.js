const express = require('express');
const router = express.Router();
const { createTeam } = require('../controllers/teamController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { addMember } = require('../controllers/teamController');


// @route   POST /api/teams
// @desc    Create a new team
// @access  Private (Leader or Admin)
router.post('/', protect, authorizeRoles('leader', 'admin'), createTeam);
router.post('/add-member', protect, authorizeRoles('leader'), addMember);

module.exports = router;