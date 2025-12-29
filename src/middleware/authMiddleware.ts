import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { jwtConfig } from '../config/jwt';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. Authorization header එක ලබා ගැනීම
  const authHeader = req.header('Authorization');
  
  // 2. Header එක නැත්නම් හෝ 'Bearer ' වලින් පටන් ගන්නේ නැත්නම් 401 ලබා දීම
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // 3. Space එකත් සමඟ හරියටම Token එක වෙන් කර ගැනීම
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    // Debugging සඳහා මෙය එක් කරන්න
    console.log("Using Secret:", jwtConfig.access.secret.substring(0, 5) + "...");
    // 4. Secret key එක පාවිච්චි කර verify කිරීම
    const decoded = jwt.verify(token, jwtConfig.access.secret);
    req.user = decoded;
    next();
  } catch (err) {
    // Backend console එකේ බලන්න ඇයි fail වෙන්නේ කියලා (Expired ද? Invalid ද?)
    console.error("JWT Error:", err); 
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const isSeller = (req: AuthRequest, res: Response, next: NextFunction) => {
  // authenticate middleware එකෙන් පසු user object එක තිබිය යුතුමයි
  if (!req.user || !req.user.roles?.includes('seller')) {
    return res.status(403).json({ message: 'Access denied: Sellers only' });
  }
  next();
};