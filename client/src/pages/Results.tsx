import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { quizService } from '../services/quizService';
import { QuizAttemptDetail } from '../types';

export const Results: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<QuizAttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attemptId) return;
    quizService
      .getAttempt(attemptId)
      .then(setAttempt)
      .catch((err) => setError(err?.response?.data?.error || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-on-surface-variant">
        Loading results...
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-error font-bold">
        {error || 'Results not found.'}
      </div>
    );
  }

  const percentage = Math.round((attempt.score / attempt.total) * 100);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors text-sm font-bold"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-surface border border-outline rounded-3xl p-8 space-y-3"
        >
          <p className="text-on-surface-variant font-bold uppercase text-xs tracking-widest">
            {attempt.subject.name} · {attempt.mode}
          </p>
          <h1 className="text-5xl font-black">
            {attempt.score}/{attempt.total}
          </h1>
          <p className="text-blue font-black text-xl">{percentage}%</p>
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-xl font-black">Review</h2>
          {attempt.answers.map((answer, idx) => (
            <div
              key={answer.questionId}
              className={`rounded-2xl border p-5 ${
                answer.isCorrect ? 'border-green-600/40 bg-green-600/5' : 'border-error/40 bg-error/5'
              }`}
            >
              <div className="flex items-start gap-3">
                {answer.isCorrect ? (
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                ) : (
                  <XCircle className="text-error shrink-0 mt-0.5" size={20} />
                )}
                <div className="space-y-1">
                  <p className="font-bold text-sm text-on-surface-variant">Question {idx + 1}</p>
                  <p className="font-medium">
                    Your answer: <span className="font-bold">{answer.selectedOptionText || '(skipped)'}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;
