import express from 'express';
import { authenticate, isAdmin } from '../middleware/authMiddleware';
import User from '../models/User';

const router = express.Router();

// 1. All Users list eka ganna (Frontend eke fetchUsers() ekata)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Role update karanna (Frontend eke toggleSellerRole() ekata)
// Meeka thama console eke 404 une. Path eka :id/roles wenna ona.
router.put('/:id/roles', authenticate, isAdmin, async (req, res) => {
  try {
    const { roles } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { roles }, 
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;