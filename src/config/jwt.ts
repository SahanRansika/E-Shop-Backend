import dotenv from 'dotenv';

dotenv.config();

// Fail fast if secrets missing
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  throw new Error('JWT_SECRET is missing or empty in .env file!');
}

if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.trim() === '') {
  throw new Error('JWT_REFRESH_SECRET is missing or empty in .env file!');
}

export const jwtConfig = {
  access: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: '30m',
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET as string,
    expiresIn: '7d',
  },
};