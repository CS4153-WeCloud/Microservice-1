const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { generateToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Authentication]
 *     description: Redirects to Google OAuth consent screen
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Authentication]
 *     description: Handles Google OAuth callback and returns JWT token
 *     responses:
 *       200:
 *         description: Authentication successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication failed
 */
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/failure' }),
  (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = generateToken(req.user);
      
      // Return token and user info
      res.json({
        success: true,
        message: 'Authentication successful',
        token: token,
        user: {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
          status: req.user.status
        }
      });
    } catch (error) {
      console.error('Token generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate token',
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/failure:
 *   get:
 *     summary: OAuth authentication failure
 *     tags: [Authentication]
 *     description: Called when OAuth authentication fails
 *     responses:
 *       401:
 *         description: Authentication failed
 */
router.get('/failure', (req, res) => {
  res.status(401).json({
    success: false,
    error: 'Authentication failed',
    message: 'Google OAuth authentication was unsuccessful. Please try again.'
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     description: Returns the currently authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify JWT token
 *     tags: [Authentication]
 *     description: Verify if a JWT token is valid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token to verify
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 valid:
 *                   type: boolean
 *                 decoded:
 *                   type: object
 *       401:
 *         description: Token is invalid or expired
 */
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token required',
        message: 'Please provide a token in the request body'
      });
    }

    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(token);
    
    res.json({
      success: true,
      valid: true,
      decoded: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      error: 'Token verification failed',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout (client-side token removal)
 *     tags: [Authentication]
 *     description: Since we use JWT, logout is handled client-side by removing the token. This endpoint provides confirmation.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful (client should remove token)
 */
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
});

module.exports = router;

