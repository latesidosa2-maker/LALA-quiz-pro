import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import QuizEngine from '../components/QuizEngine';
import { quizService } from '../services/quizService';
import { Question, Subject, SubmitAnswer } from '../types';

export const QuizPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as 'practice' | 'exam') || 'practice';
  const navigate = useNavigate();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!subjectId) return;
    quizService
      .getSubjects()
      .then((subjects) => {
        const found = subjects.find((s) => s._id === subjectId);
        if (!found) throw new Error('Subject not found');
        setSubject(found);
        // Flatten all units' questions for a full-subject quiz.
        const allQuestions = found.units.flatMap((u) => u.questions);
        setQuestions(allQuestions);
      })
      .catch((err) => setError(err?.response?.data?.error || err.message || 'Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [subjectId]);

  const handleComplete = async (payload: { answers: SubmitAnswer[]; timeTakenSeconds: number }) => {
    if (!subjectId) return;
    setSubmitting(true);
    try {
      const result = await quizService.submitAttempt(subjectId, mode, payload.timeTakenSeconds, payload.answers);
      navigate(`/results/${result.attemptId}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-on-surface-variant">
        Loading quiz...
      </div>
    );
  }

  if (error || !subject || questions.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-error font-bold text-center px-6">
        {error || 'No questions available for this subject yet.'}
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-on-surface-variant">
        Submitting your answers...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <QuizEngine questions={questions} mode={mode} onComplete={handleComplete} />
    </div>
  );
};

export default QuizPage;
