import { Request } from 'express';
import { Document } from 'mongoose';

// Define specific interface for file uploads
interface MulterFiles {
  avatar?: Express.Multer.File[];
  coverImage?: Express.Multer.File[];
}

// Override the default Express Request interface
declare module 'express-serve-static-core' {
  interface Request {
    user?: any; // User document from authentication
    files?: MulterFiles;
  }
}

// Also extend the global Express namespace for compatibility
declare global {
  namespace Express {
    interface Request {
      user?: any; // User document from authentication
      files?: MulterFiles;
    }
  }
}

// User interface for type safety
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage?: string;
  password: string;
  refreshToken?: string;
  watchHistory: string[];
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export {};
