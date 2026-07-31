import { Request, Response } from 'express';
import { z } from 'zod';
import { QuizAttempt, Subject, User } from '../models/DatabaseSchema';

const submitSchema = z.object({
  subjectId: z.string(),
  mode: z.enum(['practice', 'exam']),
  timeTakenSeconds: z.number().nonnegative(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionText: z.string(),
    })
  ),
});

export const QuizController = {
  // Grade and store a completed attempt. Correctness is computed server-side
  // from the stored questions, never trusted from the client.
  submitAttempt: async (req: Request, res: Response) => {
    try {
      const parsed = submitSchema.parse(req.body);
      const subject = await Subject.findById(parsed.subjectId);
      if (!subject) return res.status(404).json({ error: 'Subject not found' });

      const allQuestions = subject.units.flatMap((u) => u.questions);
      const questionMap = new Map(allQuestions.map((q) => [String(q._id), q]));

      let score = 0;
      const gradedAnswers = parsed.answers.map((a) => {
        const question = questionMap.get(a.questionId);
        const correctOption = question?.options.find((o) => o.isCorrect);
        const isCorrect = !!correctOption && correctOption.text === a.selectedOptionText;
        if (isCorrect) score += 1;
        return { ...a, isCorrect };
      });

      const attempt = await QuizAttempt.create({
        user: req.user!.id,
        subject: subject._id,
        mode: parsed.mode,
        score,
        total: parsed.answers.length,
        timeTakenSeconds: parsed.timeTakenSeconds,
        answers: gradedAnswers,
      });

      // Update rolling user stats.
      const user = await User.findById(req.user!.id);
      if (user) {
        const prevTotal = user.stats.totalQuizzes;
        const prevAvg = user.stats.avgScore;
        const newPercentage = (score / parsed.answers.length) * 100;
        user.stats.totalQuizzes = prevTotal + 1;
        user.stats.avgScore = Math.round((prevAvg * prevTotal + newPercentage) / (prevTotal + 1));
        await user.save();
      }

      res.status(201).json({ attemptId: attempt._id, score, total: parsed.answers.length });
    } catch (error: any) {
      if (error?.issues) return res.status(400).json({ error: 'Invalid submission', details: error.issues });
      res.status(500).json({ error: 'Failed to submit attempt' });
    }
  },

  // Full detail for the results screen (includes explanations).
  getAttemptDetail: async (req: Request, res: Response) => {
    try {
      const attempt = await QuizAttempt.findOne({ _id: req.params.attemptId, user: req.user!.id }).populate(
        'subject',
        'name'
      );
      if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
      res.status(200).json(attempt);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch attempt' });
    }
  },

  // Summary data for the dashboard (recent attempts, per-subject progress).
  getDashboardSummary: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const [user, recentAttempts] = await Promise.all([
        User.findById(userId).select('-password'),
        QuizAttempt.find({ user: userId }).sort({ createdAt: -1 }).limit(5).populate('subject', 'name'),
      ]);
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.status(200).json({ user, recentAttempts });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
  },
};
