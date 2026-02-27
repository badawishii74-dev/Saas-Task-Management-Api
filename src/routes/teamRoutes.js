const express = require('express');
const router = express.Router();
const { createTeam } = require('../controllers/teamController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { addMember } = require('../controllers/teamController');
const { getAllTeams } = require('../controllers/teamController');
const { getTeamDetails } = require('../controllers/teamController');
const { requestToJoin, handleJoinRequest, inviteUser, getTeamMembers, handleInvitation } = require('../controllers/teamController');


// @route   POST /api/teams
// @desc    Create a new team
// @access  Private (Leader or Admin)
router.post(
  '/',
  protect,
  authorizeRoles('admin'),
  createTeam
);
router.post('/add-member', protect, authorizeRoles('leader'), addMember);
router.get('/', protect, getAllTeams);
router.get('/:teamId', protect, getTeamDetails);
router.post('/:teamId/request-to-join', protect, requestToJoin);
router.post('/:teamId/join-requests', protect, authorizeRoles('leader'), handleJoinRequest);
router.post('/:teamId/invite', protect, authorizeRoles('leader'), inviteUser);
router.get('/:teamId/members', protect, authorizeRoles('leader'), getTeamMembers);
router.post('/:teamId/invitations', protect, handleInvitation);




module.exports = router;