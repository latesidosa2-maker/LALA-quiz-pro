import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import subjectRoutes from './routes/subjectRoutes';
import quizRoutes from './routes/quizRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/quiz', quizRoutes);

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`LALA Quiz Pro server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
