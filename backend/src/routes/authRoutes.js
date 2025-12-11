import express from 'express';
import { 
  signup, 
  signin, 
  getProfile,
  signupValidation, 
  signinValidation, 
  verifyToken 
} from '../controllers/authController.js';

const router = express.Router();

// Authentication routes
router.post('/signup', signupValidation, signup);
router.post('/signin', signinValidation, signin);

// Protected routes
router.get('/profile', verifyToken, getProfile);

// Logout route (client-side token removal)
router.post('/logout', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;