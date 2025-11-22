const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Helper function to add links to user object
function addUserLinks(user) {
  if (!user) return user;
  return {
    ...user,
    links: {
      self: `/api/users/${user.id}`
    }
  };
}


/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with filtering and sorting
 *     tags: [Users]
 *     description: Retrieve a list of users with optional filtering and sorting
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, staff, faculty, other]
 *         description: Filter by user role
 *       - in: query
 *         name: home_area
 *         schema:
 *           type: string
 *         description: Filter by home area (e.g., Flushing, Jersey City)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by user status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    // Extract query parameters
    const { role, home_area, status, sortBy, sortOrder } = req.query;
    
    // Build filters
    const filters = {};
    if (role) filters.role = role;
    if (home_area) filters.homeArea = home_area;
    if (status) filters.status = status;
    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder.toUpperCase();
    
    // Get users
    const users = await User.findAll(filters);
    
    // Add links to each user
    const usersWithLinks = users.map(addUserLinks);
    
    res.json(usersWithLinks);
  } catch (error) {
    console.error('GET /api/users error:', error);
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     description: Retrieve a specific user by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(addUserLinks(user));
  } catch (error) {
    console.error(`GET /api/users/${req.params.id} error:`, error);
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     description: Create a new user in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *               role:
 *                 type: string
 *                 enum: [student, staff, faculty, other]
 *               homeArea:
 *                 type: string
 *                 description: Home area (e.g., Flushing, Jersey City)
 *               preferredDepartureTime:
 *                 type: string
 *                 format: time
 *                 description: Preferred departure time (HH:mm:ss)
 *     responses:
 *       201:
 *         description: User created successfully
 *         headers:
 *           Location:
 *             description: URL of the created user
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const { email, firstName, lastName, phone, status, role, homeArea, preferredDepartureTime } = req.body;
    
    // Basic validation
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields: email, firstName, lastName' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = await User.create({ 
      email, 
      firstName, 
      lastName, 
      phone, 
      status, 
      role, 
      homeArea, 
      preferredDepartureTime 
    });
    
    const userWithLinks = addUserLinks(newUser);
    
    // Return 201 Created with Location header
    res.status(201)
       .location(`/api/users/${newUser.id}`)
       .json(userWithLinks);
  } catch (error) {
    console.error('POST /api/users error:', error);
    res.status(500).json({ error: 'Failed to create user', message: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     description: Update an existing user's information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *               role:
 *                 type: string
 *                 enum: [student, staff, faculty, other]
 *               homeArea:
 *                 type: string
 *               preferredDepartureTime:
 *                 type: string
 *                 format: time
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it's already taken by another user
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findByEmail(req.body.email);
      if (existingUser && existingUser.id !== parseInt(req.params.id)) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const updatedUser = await User.update(req.params.id, req.body);
    res.json(addUserLinks(updatedUser));
  } catch (error) {
    console.error(`PUT /api/users/${req.params.id} error:`, error);
    // Handle duplicate email error from database
    if (error.code === 'ER_DUP_ENTRY' && error.message.includes('email')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user', message: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     description: Delete a user from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await User.delete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/users/${req.params.id} error:`, error);
    res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
});

module.exports = router;
