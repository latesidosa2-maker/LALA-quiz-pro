import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/DatabaseSchema';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  stream: z.enum(['Natural Science', 'Social Science']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signToken = (id: string, role: string, stream?: string) =>
  jwt.sign({ id, role, stream }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

export const AuthController = {
  register: async (req: Request, res: Response) => {
    try {
      const parsed = registerSchema.parse(req.body);
      const existing = await User.findOne({ email: parsed.email });
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      // Enforce single-admin rule: new registrations are always students.
      const hashedPassword = await bcrypt.hash(parsed.password, 10);
      const user = await User.create({
        name: parsed.name,
        email: parsed.email,
        password: hashedPassword,
        stream: parsed.stream,
        role: 'student',
      });

      const token = signToken(user._id.toString(), user.role, user.stream);
      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, stream: user.stream },
      });
    } catch (error: any) {
      if (error?.issues) return res.status(400).json({ error: 'Invalid input', details: error.issues });
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.parse(req.body);
      const user = await User.findOne({ email: parsed.email });
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const match = await bcrypt.compare(parsed.password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid email or password' });

      const token = signToken(user._id.toString(), user.role, user.stream);
      res.status(200).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, stream: user.stream, stats: user.stats },
      });
    } catch (error: any) {
      if (error?.issues) return res.status(400).json({ error: 'Invalid input', details: error.issues });
      res.status(500).json({ error: 'Login failed' });
    }
  },

  me: async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.user!.id).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },
};
