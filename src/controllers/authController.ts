import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { signAccessToken, signRefreshToken } from '../utils/jwtUtils';
import { jwtConfig } from '../config/jwt';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body; // Role eka body eken ganna epa

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      roles: ['user'], // Hamoma register wenne 'user' widihata
    });

    await user.save();
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, roles: user.roles },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, roles: user.roles },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

  try {
    const payload = jwt.verify(refreshToken, jwtConfig.refresh.secret) as { sub: string };
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

    res.json({
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};