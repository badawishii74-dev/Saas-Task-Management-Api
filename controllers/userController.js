const User = require("../models/User");
// search users by name or email (for invite/add member dropdowns)
exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({ message: "Query must be at least 2 characters" });
        }

        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
            ],
            isVerified: true,
        })
            .select('_id name email')
            .limit(10);

        res.status(200).json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
