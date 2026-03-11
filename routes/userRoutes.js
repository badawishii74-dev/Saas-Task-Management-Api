const { searchUsers } = require('../controllers/userController');

// GET /api/users/search?q=john
router.get('/search', protect, searchUsers);

module.exports = router;


/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users by name or email
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *      400:
 * `        description: Bad request (e.g. query too short)
 *       500:
 *         description: Server error
 */