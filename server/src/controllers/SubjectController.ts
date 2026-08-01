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

function stripAnswers(unit) {
  const plain = unit.toObject ? unit.toObject() : unit;
  const questions = plain.questions.map(function (q) {
    const options = q.options.map(function (o) {
      return { text: o.text };
    });
    return Object.assign({}, q, { options: options });
  });
  return Object.assign({}, plain, { questions: questions });
}

export const SubjectController = {
  getSubjects: async (req, res) => {
    try {
      const stream = req.user.stream;
      const subjects = await Subject.find({ stream: stream }).select('-units.questions.options.isCorrect');
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  },

  getUnitDetails: async (req, res) => {
    try {
      const subjectId = req.params.subjectId;
      const unitId = req.params.unitId;
      const subject = await Subject.findById(subjectId);
      if (!subject) return res.status(404).json({ error: 'Subject not found' });

      const unit = subject.units.find(function (u) {
        return String(u._id) === unitId;
      });
      if (!unit) return res.status(404).json({ error: 'Unit not found' });

      const isAdmin = req.user.role === 'admin';
      const sanitized = isAdmin ? unit : stripAnswers(unit);

      res.status(200).json(sanitized);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch unit details' });
    }
  },

  createSubject: async (req, res) => {
    try {
      const parsed = subjectSchema.parse(req.body);
      const newSubject = new Subject(parsed);
      await newSubject.save();
      res.status(201).json(newSubject);
    } catch (error: any) {
      if (error && error.issues) return res.status(400).json({ error: 'Invalid subject data', details: error.issues });
      res.status(400).json({ error: 'Invalid subject data' });
    }
  },

  addUnit: async (req, res) => {
    try {
      const subjectId = req.params.subjectId;
      const parsed = unitSchema.parse(req.body);
      const subject = await Subject.findById(subjectId);
      if (!subject) return res.status(404).json({ error: 'Subject not found' });

      subject.units.push(parsed as any);
      await subject.save();
      res.status(200).json(subject);
    } catch (error: any) {
      if (error && error.issues) return res.status(400).json({ error: 'Invalid unit data', details: error.issues });
      res.status(400).json({ error: 'Failed to add unit' });
    }
  },
};