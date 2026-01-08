import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { jwtConfig } from '../config/jwt';

/**
 * 1. AuthRequest Interface එක Extend කිරීම.
 * මෙය middleware එක ඇතුළතදී Request එකට user දත්ත එකතු කිරීමට භාවිතා කරයි.
 */
export interface AuthRequest extends Request {
  user?: { 
    id: string; 
    roles: string[]; 
    email?: string;
  };
}

/**
 * 2. Authenticate Middleware
 * මෙහිදී parameter එක ලෙස standard 'Request' එක ලබා ගන්නේ Route වල ඇතිවන 
 * TypeScript Overload Error එක නැති කිරීමටයි.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded: any = jwt.verify(token, jwtConfig.access.secret);
    
    // Type Casting භාවිතා කර req.user වෙත දත්ත ඇතුළත් කිරීම
    (req as AuthRequest).user = { 
      id: decoded.id || decoded.sub, 
      roles: decoded.roles || [] 
    };
    
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * 3. isSeller Middleware
 * Seller හෝ Admin හට අවසර ලබා දෙයි.
 */
export const isSeller = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const roles = authReq.user?.roles || [];
  
  if (roles.includes('seller') || roles.includes('admin')) {
    return next();
  }
  
  return res.status(403).json({ message: 'Access denied. Sellers or Admins only.' });
};

/**
 * 4. isAdmin Middleware
 * Admin හට පමණක් අවසර ලබා දෙයි.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const roles = authReq.user?.roles || [];
  
  if (!roles.includes('admin')) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};