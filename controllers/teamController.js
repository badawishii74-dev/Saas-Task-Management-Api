const Team = require("../models/Team");
const User = require("../models/User");
const {
  notifyTeamInvite,
  notifyJoinRequest,
  notifyJoinRequestHandled,
  notifyMemberAdded,
  notifyMemberRemoved,
} = require("../services/notificationService");

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Leader or Admin)
exports.createTeam = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    // Get the user ID from the authenticated user
    const leaderId = req.user._id;


    const existingTeam = await Team.countDocuments({ leader: leaderId });

    if (existingTeam >= 3) {
      return res.status(400).json({
        success: false,
        message: "You can only create up to 3 teams",
      });
    }

    // Create the team
    const team = await Team.create({
      name,
      description,
      type: type || "public", // Default to public if not provided
      leader: leaderId,
      members: [leaderId], // Add the leader as the first member of the team
    });

    // Update the leader's team reference
    await User.findByIdAndUpdate(leaderId, {
      $addToSet: { teams: team._id },
    });

    res.status(201).json({
      message: "Team created successfully",
      success: true,
      team,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// add member to team
exports.addMember = async (req, res) => {
  const { userId } = req.body;

  // Check if the user exists and has the correct role
  const team = await Team.findOne({ leader: req.user._id });

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found or you are not the leader of any team",
    });
  }

  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check if the user is already a member of the team
  if (team.members.some((member) => member.toString() === userId)) {
    return res.status(400).json({ message: "User already in team" });
  }

  // Add the user to the team
  team.members.push(userId);
  await team.save();

  await notifyMemberAdded({
    team,
    addedUserId: userId,
    addedBy: req.user._id,
  });

  // Update the user's team reference
  // addToset prevents duplicate entries in the user's teams array
  await User.findByIdAndUpdate(userId, { $addToSet: { teams: team._id } });

  res.status(200).json({
    success: true,
    message: "Member added to the team successfully",
    team,
  });
};

// get all teams
exports.getAllTeams = async (req, res) => {
  if (req.user.role === "admin") {
    // Admin can see all teams
    const teams = await Team.find()
      .populate("leader", "name email")
      .populate("members", "name email");
    return res.json(teams);
  } else {
    // Regular users can only see teams they are part of
    const teams = await Team.find({
      $or: [{ type: "public" }, { members: req.user._id }],
    })
      .populate("leader", "name email")
      .populate("members", "name email");

    return res.json(teams);
  }
};

// get team details
exports.getTeamDetails = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate("leader", "name email")
      .populate("members", "name email");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({ team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// requst to join a team
exports.requestToJoin = async (req, res) => {
  const team = await Team.findById(req.params.teamId);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  // Check if the user is already a member of the team
  if (team.members.includes(req.user._id)) {
    return res
      .status(400)
      .json({ message: "You are already a member of this team" });
  }

  // Check if the user has already sent a join request
  if (team.joinRequests.includes(req.user._id)) {
    return res
      .status(400)
      .json({ message: "You have already sent a join request to this team" });
  }

  // check if the team is private
  if (team.type === "private") {
    team.joinRequests.push(req.user._id);
    await team.save();
    await notifyJoinRequest({ team, requesterId: req.user._id });
    return res.status(200).json({
      success: true,
      message: "Join request sent successfully",
      team,
    });
  }

  // For public teams, add the user directly to the members
  team.members.push(req.user._id);
  await team.save();

  // Update the user's team reference
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { teams: team._id },
  });

  res.status(200).json({
    success: true,
    message: "You have joined the team successfully",
    team,
  });
};

// accept or reject join request
exports.handleJoinRequest = async (req, res) => {
  const { userId, action } = req.body;

  const team = await Team.findById(req.params.teamId);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  if (team.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Only team leader can handle join requests",
    });
  }

  // Check if the user has a pending join request
  if (!team.joinRequests.some((request) => request.toString() === userId)) {
    return res.status(400).json({
      success: false,
      message: "No join request from this user",
    });
  }

  if (action === "accept") {
    // Add the user to the team members
    team.members.push(userId);
    await team.save();
    await notifyJoinRequestHandled({ team, userId, action });

    // Update the user's team reference
    await User.findByIdAndUpdate(userId, { $addToSet: { teams: team._id } });

    res.status(200).json({
      success: true,
      message: "Join request accepted",
      team,
    });
  } else if (action === "reject") {
    // Remove the user from the join requests
    team.joinRequests = team.joinRequests.filter(
      (id) => id.toString() !== userId,
    );
    await team.save();
    await notifyJoinRequestHandled({ team, userId, action });
    res.status(200).json({
      success: true,
      message: "Join request rejected",
      team,
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid action",
    });
  }
};

// invite user to team
exports.inviteUser = async (req, res) => {
  const { userId } = req.body;
  const team = await Team.findById(req.params.teamId);
  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  if (team.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Only team leader can invite members",
    });
  }

  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check if the user is already a member of the team
  if (team.members.some((member) => member.toString() === userId)) {
    return res.status(400).json({ message: "User already in team" });
  }

  // Add the user to the team's join requests
  team.invitations.push(userId);
  await team.save();

  await notifyTeamInvite({
    team,
    invitedUserId: userId,
    invitedBy: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "User invited to join the team",
    team,
  });
};

// accept or reject team invitation
exports.handleInvitation = async (req, res) => {
  const { teamId } = req.params;
  const { action } = req.body;
  const team = await Team.findById(teamId);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  // Check if the user has a pending invitation
  if (
    !team.invitations.some(
      (invite) => invite.toString() === req.user._id.toString(),
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "No pending invitation for this user",
    });
  }

  if (action === "accept") {
    // Add the user to the team members
    team.members.push(req.user._id);
    // Remove the user from invitations
    team.invitations = team.invitations.filter(
      (invite) => invite.toString() !== req.user._id.toString(),
    );
    await team.save();

    // Update the user's team reference
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { teams: team._id },
    });

    res.status(200).json({
      success: true,
      message: "Invitation accepted",
      team,
    });
  } else if (action === "reject") {
    // Remove the user from invitations
    team.invitations = team.invitations.filter(
      (invite) => invite.toString() !== req.user._id.toString(),
    );
    await team.save();
    res.status(200).json({
      success: true,
      message: "Invitation rejected",
      team,
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid action",
    });
  }
};

// get team members
exports.getTeamMembers = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId).populate(
      "members",
      "name email",
    );
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json({ members: team.members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// remove member from team
exports.removeMember = async (req, res) => {
  const { userId, teamId } = req.params;
  const team = await Team.findById(teamId);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  // Only team leader can remove members || Admin can remove members from any team
  const isAdmin = req.user.role === "admin";
  const isLeader = team.leader.toString() === req.user._id.toString();
  if (!isAdmin && !isLeader) {
    return res.status(403).json({
      success: false,
      message: "Only team leader or admin can remove members",
    });
  }

  // prevent leader from being removed from the team
  if (team.leader.toString() === userId) {
    return res.status(400).json({
      success: false,
      message: "Team leader cannot be removed from the team",
    });
  }

  // Check if the user is a member of the team
  if (!team.members.some((member) => member.toString() === userId)) {
    return res
      .status(400)
      .json({ message: "User is not a member of the team" });
  }

  // Remove the user from the team members
  team.members = team.members.filter((member) => member.toString() !== userId);
  await team.save();
  await notifyMemberRemoved({
    team,
    removedUserId: userId,
    removedBy: req.user._id,
  });

  // Update the user's team reference
  await User.findByIdAndUpdate(userId, { $pull: { teams: team._id } });

  res.status(200).json({
    success: true,
    message: "Member removed from team",
    team,
  });
};

// leave team
exports.leaveTeam = async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  // Check if the user is a member of the team
  if (
    !team.members.some(
      (member) => member.toString() === req.user._id.toString(),
    )
  ) {
    return res
      .status(400)
      .json({ message: "User is not a member of the team" });
  }

  // If the user is the team leader, prevent them from leaving the team
  if (team.leader.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message:
        "Team leader cannot leave the team. Please assign a new leader before leaving.",
    });
  }

  // Remove the user from the team members
  team.members = team.members.filter(
    (member) => member.toString() !== req.user._id.toString(),
  );
  await team.save();

  // Update the user's team reference
  await User.findByIdAndUpdate(req.user._id, { $pull: { teams: team._id } });

  res.status(200).json({
    success: true,
    message: "You have left the team successfully",
    team,
  });
};

// assign new leader to team (only for admin)
exports.assignNewLeader = async (req, res) => {
  const { teamId } = req.params;
  const { newLeaderId } = req.body;

  const team = await Team.findById(teamId);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin can assign a new leader",
    });
  }

  // Check if the new leader is a member of the team
  if (!team.members.some((member) => member.toString() === newLeaderId)) {
    return res.status(400).json({
      success: false,
      message: "New leader must be a member of the team",
    });
  }

  // Update the team leader
  team.leader = newLeaderId;
  await team.save();

  // Update the new leader's role to leader
  await User.findByIdAndUpdate(newLeaderId, { role: "leader" });

  res.status(200).json({
    success: true,
    message: "New leader assigned successfully",
    team,
  });
};

// get team details
exports.getTeamDetails = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate("leader", "name email")
      .populate("members", "name email")
      .populate("joinRequests", "name email");  // ← add this

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({ team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};