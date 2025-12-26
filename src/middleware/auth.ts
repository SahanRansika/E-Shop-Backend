// src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { jwtConfig } from '../config/jwt';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, jwtConfig.access.secret); // <-- access.secret
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const isSeller = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user.roles?.includes('seller')) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};