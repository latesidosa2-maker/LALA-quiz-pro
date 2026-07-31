export interface UserStats {
  totalQuizzes: number;
  avgScore: number;
  rank?: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  stream?: 'Natural Science' | 'Social Science';
  stats?: UserStats;
}

export interface QuestionOption {
  text: string;
  isCorrect?: boolean; // only present when fetched by an admin
}

export interface Question {
  _id: string;
  text: string;
  options: QuestionOption[];
  explanation?: string;
  category?: string;
  difficulty: string;
}

export interface Unit {
  _id: string;
  title: string;
  questions: Question[];
}

export interface Subject {
  _id: string;
  name: string;
  stream: string;
  units: Unit[];
}

export interface SubmitAnswer {
  questionId: string;
  selectedOptionText: string;
}

export interface AttemptResult {
  attemptId: string;
  score: number;
  total: number;
}

export interface QuizAttemptDetail {
  _id: string;
  subject: { _id: string; name: string };
  mode: 'practice' | 'exam';
  score: number;
  total: number;
  timeTakenSeconds: number;
  answers: { questionId: string; selectedOptionText: string; isCorrect: boolean }[];
  createdAt: string;
}

export interface DashboardSummary {
  user: AuthUser;
  recentAttempts: QuizAttemptDetail[];
}
