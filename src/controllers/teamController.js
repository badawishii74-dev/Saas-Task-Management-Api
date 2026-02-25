const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Leader or Admin)
exports.createTeam = async (req, res) => {
    try {
        const { name, description, leaderId } = req.body;

        // Check if the leader exists and has the correct role
        const leader = await User.findById(leaderId);
        if (!leader || (leader.role !== 'leader' && leader.role !== 'admin')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid leader or insufficient permissions'
            });
        }
        // Create the team
        const team = await Team.create({
            name,
            description,
            leader: leaderId,
            members: [leaderId] // Add the leader as the first member of the team
        })

        // Update the leader's team reference
        await User.findByIdAndUpdate(leaderId, { team: team._id, role: 'leader' });
        res.status(201).json({
            success: true,
            team
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
}


// add member to team
exports.addMember = async (req, res) => {
    const { userId } = req.body;

    // Check if the user exists and has the correct role
    const team = await Team.findOne({ leader: req.user._id });

    if (!team) {
        return res.status(404).json({
            success: false,
            message: 'Team not found or you are not the leader of any team'
        });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Check if the user is already a member of the team
    if (team.members.includes(userId)) {
        return res.status(400).json({ message: 'User already in team' });
    }

    // Add the user to the team
    team.members.push(userId);
    await team.save();

    // Update the user's team reference
    user.team = team._id;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Member added to the team successfully',
        team
    });

}