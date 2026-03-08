const express = require("express");
const router = express.Router();
const { createTeam } = require("../controllers/teamController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const { addMember } = require("../controllers/teamController");
const { getAllTeams } = require("../controllers/teamController");
const { getTeamDetails } = require("../controllers/teamController");
const {
  requestToJoin,
  handleJoinRequest,
  inviteUser,
  getTeamMembers,
  handleInvitation,
  removeMember,
  leaveTeam,
} = require("../controllers/teamController");

// @route   POST /api/teams
// @desc    Create a new team
// @access  Private (Leader or Admin)
router.post("/", protect, authorizeRoles("admin"), createTeam);
router.post("/add-member", protect, authorizeRoles("admin"), addMember);
router.get("/", protect, getAllTeams);
router.get("/:teamId", protect, getTeamDetails);
router.post("/:teamId/request-to-join", protect, requestToJoin);
router.post(
  "/:teamId/join-requests",
  protect,
  authorizeRoles("leader"),
  handleJoinRequest,
);
router.post("/:teamId/invite", protect, authorizeRoles("leader"), inviteUser);
router.get(
  "/:teamId/members",
  protect,
  authorizeRoles("leader"),
  getTeamMembers,
);
router.post("/:teamId/invitations", protect, handleInvitation);
router.delete("/:teamId/members/:userId", protect, removeMember);
router.post("/:teamId/leave", protect, leaveTeam);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management
 */

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:        { type: string, example: Frontend Team }
 *               description: { type: string, example: Handles all frontend tasks }
 *               type:        { type: string, enum: [public, private], example: public }
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       400:
 *         description: You can only create up to 3 teams
 *
 *   get:
 *     summary: Get all teams (public teams + teams you are a member of)
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: List of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 */

/**
 * @swagger
 * /api/teams/add-member:
 *   post:
 *     summary: Add a member to your team (admin only)
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, example: 64a1b2c3d4e5f6a7b8c9d0e1 }
 *     responses:
 *       200:
 *         description: Member added successfully
 *       400:
 *         description: User already in team
 *       404:
 *         description: Team or user not found
 */

/**
 * @swagger
 * /api/teams/{teamId}:
 *   get:
 *     summary: Get team details by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: Team not found
 */

/**
 * @swagger
 * /api/teams/{teamId}/request-to-join:
 *   post:
 *     summary: Request to join a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Joined team directly (public) or join request sent (private)
 *       400:
 *         description: Already a member or request already sent
 *       404:
 *         description: Team not found
 */

/**
 * @swagger
 * /api/teams/{teamId}/join-requests:
 *   post:
 *     summary: Accept or reject a join request (leader only)
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, action]
 *             properties:
 *               userId: { type: string, example: 64a1b2c3d4e5f6a7b8c9d0e1 }
 *               action: { type: string, enum: [accept, reject] }
 *     responses:
 *       200:
 *         description: Join request accepted or rejected
 *       400:
 *         description: No join request from this user
 *       403:
 *         description: Only team leader can handle join requests
 */

/**
 * @swagger
 * /api/teams/{teamId}/invite:
 *   post:
 *     summary: Invite a user to the team (leader only)
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, example: 64a1b2c3d4e5f6a7b8c9d0e1 }
 *     responses:
 *       200:
 *         description: User invited successfully
 *       400:
 *         description: User already in team
 *       403:
 *         description: Only team leader can invite members
 *       404:
 *         description: Team or user not found
 */

/**
 * @swagger
 * /api/teams/{teamId}/invitations:
 *   post:
 *     summary: Accept or reject a team invitation
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action: { type: string, enum: [accept, reject] }
 *     responses:
 *       200:
 *         description: Invitation accepted or rejected
 *       400:
 *         description: No pending invitation for this user
 *       404:
 *         description: Team not found
 */

/**
 * @swagger
 * /api/teams/{teamId}/members:
 *   get:
 *     summary: Get all members of a team (leader only)
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of team members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: Team not found
 */

/**
 * @swagger
 * /api/teams/{teamId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from the team (leader or admin)
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: User is not a member or is the team leader
 *       403:
 *         description: Only leader or admin can remove members
 *       404:
 *         description: Team not found
 */

/**
 * @swagger
 * /api/teams/{teamId}/leave:
 *   post:
 *     summary: Leave a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Left team successfully
 *       400:
 *         description: Not a member or you are the team leader
 *       404:
 *         description: Team not found
 */