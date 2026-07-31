import { Types } from 'mongoose';

export interface AuthUserPayload {
  id: string;
  role: 'student' | 'admin';
  stream?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export {};
