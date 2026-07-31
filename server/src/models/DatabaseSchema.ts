import mongoose, { Schema, Document, Types } from 'mongoose';

// --- User ---
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  stream?: 'Natural Science' | 'Social Science';
  profilePic?: string;
  stats: {
    totalQuizzes: number;
    avgScore: number;
    rank?: number;
  };
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    stream: { type: String, enum: ['Natural Science', 'Social Science'] },
    profilePic: String,
    stats: {
      totalQuizzes: { type: Number, default: 0 },
      avgScore: { type: Number, default: 0 },
      rank: Number,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

// --- Content (Subject > Unit > Question) ---
export interface IOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuestion {
  _id?: Types.ObjectId;
  text: string;
  options: IOption[];
  explanation?: string;
  category?: string;
  difficulty: string;
}

export interface IUnit {
  _id?: Types.ObjectId;
  title: string;
  questions: IQuestion[];
}

export interface ISubject extends Document {
  name: string;
  stream: string;
  units: IUnit[];
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, default: false },
    },
  ],
  explanation: String,
  category: String,
  difficulty: { type: String, default: 'Hard' },
});

const UnitSchema = new Schema<IUnit>({
  title: { type: String, required: true },
  questions: [QuestionSchema],
});

const SubjectSchema = new Schema<ISubject>({
  name: { type: String, required: true },
  stream: { type: String, required: true },
  units: [UnitSchema],
});

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);

// --- Quiz Attempt (records a completed quiz, needed for dashboard/results/rank) ---
export interface IQuizAttempt extends Document {
  user: Types.ObjectId;
  subject: Types.ObjectId;
  mode: 'practice' | 'exam';
  score: number;
  total: number;
  timeTakenSeconds: number;
  answers: { questionId: string; selectedOptionText: string; isCorrect: boolean }[];
  createdAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    mode: { type: String, enum: ['practice', 'exam'], required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    timeTakenSeconds: { type: Number, required: true },
    answers: [
      {
        questionId: String,
        selectedOptionText: String,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
