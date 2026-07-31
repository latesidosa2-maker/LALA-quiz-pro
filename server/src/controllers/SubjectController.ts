import { Request, Response } from 'express';
import { z } from 'zod';
import { Subject } from '../models/DatabaseSchema';

const questionSchema = z.object({
  text: z.string().min(1),
  options: z.array(z.object({ text: z.string().min(1), isCorrect: z.boolean() })).min(2),
  explanation: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
});

const unitSchema = z.object({
  title: z.string().min(1),
  questions: z.array(questionSchema).optional(),
});

const subjectSchema = z.object({
  name: z.string().min(1),
  stream: z.enum(['Natural Science', 'Social Science']),
  units: z.array(unitSchema).optional(),
});

/**
 * LALA Quiz Pro - Subject Controller
 * Manages curriculum hierarchy and access control
 */
export const SubjectController = {
  // Get all subjects filtered by student stream
  getSubjects: async (req: Request, res: Response) => {
    try {
      const { stream } = req.user!;
      const subjects = await Subject.find({ stream }).select('-units.questions.options.isCorrect');
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  },

  // Get detailed unit syllabus (correct answers stripped for students)
  getUnitDetails: async (req: Request, res: Response) => {
    try {
      const { subjectId, unitId } = req.params;
      const subject = await Subject.findById(subjectId);
      if (!subject) return res.status(404).json({ error: 'Subject not found' });

      const unit = subject.units.id(unitId);
      if (!unit) return res.status(404).json({ error: 'Unit not found' });

      // Never leak isCorrect to a non-admin caller.
      const sanitized =
        req.user!.role === 'admin'
          ? unit
          : {
              ...unit.toObject(),
              questions: unit.questions.map((q) => ({
                ...q,
                options: q.options.map((o) => ({ text: o.text })),
              })),
            };

      res.status(200).json(sanitized);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch unit details' });
    }
  },

  // Admin: Create new subject
  createSubject: async (req: Request, res: Response) => {
    try {
      const parsed = subjectSchema.parse(req.body);
      const newSubject = new Subject(parsed);
      await newSubject.save();
      res.status(201).json(newSubject);
    } catch (error: any) {
      if (error?.issues) return res.status(400).json({ error: 'Invalid subject data', details: error.issues });
      res.status(400).json({ error: 'Invalid subject data' });
    }
  },

  // Admin: Add unit to subject
  addUnit: async (req: Request, res: Response) => {
    try {
      const { subjectId } = req.params;
      const parsed = unitSchema.parse(req.body);
      const subject = await Subject.findById(subjectId);
      if (!subject) return res.status(404).json({ error: 'Subject not found' });

      subject.units.push(parsed as any);
      await subject.save();
      res.status(200).json(subject);
    } catch (error: any) {
      if (error?.issues) return res.status(400).json({ error: 'Invalid unit data', details: error.issues });
      res.status(400).json({ error: 'Failed to add unit' });
    }
  },
};
