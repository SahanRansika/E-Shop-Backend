// src/utils/jwtUtils.ts
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken'; // <-- Important: type only import
import { jwtConfig } from '../config/jwt';
import { UserDocument } from '../models/User';

export const signAccessToken = (user: UserDocument): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.access.expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(
    {
      sub: user._id.toString(),
      roles: user.roles || [],
    },
    jwtConfig.access.secret,
    options
  );
};

export const signRefreshToken = (user: UserDocument): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.refresh.expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(
    {
      sub: user._id.toString(),
      type: 'refresh',
    },
    jwtConfig.refresh.secret,
    options
  );
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, jwtConfig.access.secret);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, jwtConfig.refresh.secret);
};