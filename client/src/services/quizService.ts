import { api } from './api';
import { AttemptResult, DashboardSummary, QuizAttemptDetail, Subject, SubmitAnswer, Unit } from '../types';

export const quizService = {
  getSubjects: async (): Promise<Subject[]> => {
    const { data } = await api.get<Subject[]>('/subjects');
    return data;
  },

  getUnit: async (subjectId: string, unitId: string): Promise<Unit> => {
    const { data } = await api.get<Unit>(`/subjects/${subjectId}/units/${unitId}`);
    return data;
  },

  submitAttempt: async (
    subjectId: string,
    mode: 'practice' | 'exam',
    timeTakenSeconds: number,
    answers: SubmitAnswer[]
  ): Promise<AttemptResult> => {
    const { data } = await api.post<AttemptResult>('/quiz/attempts', {
      subjectId,
      mode,
      timeTakenSeconds,
      answers,
    });
    return data;
  },

  getAttempt: async (attemptId: string): Promise<QuizAttemptDetail> => {
    const { data } = await api.get<QuizAttemptDetail>(`/quiz/attempts/${attemptId}`);
    return data;
  },

  getDashboard: async (): Promise<DashboardSummary> => {
    const { data } = await api.get<DashboardSummary>('/quiz/dashboard');
    return data;
  },
};
