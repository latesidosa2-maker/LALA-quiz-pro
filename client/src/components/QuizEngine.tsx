import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ChevronLeft, ChevronRight } from 'lucide-react';
import { Question, SubmitAnswer } from '../types';

interface QuizEngineProps {
  questions: Question[];
  mode: 'practice' | 'exam';
  onComplete: (payload: { answers: SubmitAnswer[]; timeTakenSeconds: number }) => void;
}

const QuizEngine: React.FC<QuizEngineProps> = ({ questions, mode, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(questions.length * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const startedAt = useRef(Date.now());

  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    const submitAnswers: SubmitAnswer[] = questions.map((q) => ({
      questionId: q._id,
      selectedOptionText: answers[q._id] ?? '',
    }));
    const timeTakenSeconds = Math.round((Date.now() - startedAt.current) / 1000);
    onComplete({ answers: submitAnswers, timeTakenSeconds });
  }, [answers, questions, onComplete, isSubmitted]);

  // Timer logic for Exam Mode
  useEffect(() => {
    if (mode !== 'exam' || isSubmitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, timeLeft, isSubmitted, handleSubmit]);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (optionText: string) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [currentQuestion._id]: optionText });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header & Progress */}
      <div className="flex justify-between items-center bg-surface-container p-4 rounded-2xl border border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <span className="font-bold">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <h3 className="font-bold text-on-surface">Question</h3>
        </div>

        {mode === 'exam' && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              timeLeft < 60 ? 'bg-error/10 border-error text-error' : 'bg-primary/10 border-primary text-primary'
            }`}
          >
            <Timer size={18} />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
        <motion.div
          className="bg-primary h-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-surface p-8 rounded-3xl border border-outline-variant shadow-sm"
        >
          <div className="mb-6">
            <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-wider">
              {currentQuestion.category}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-medium text-on-surface leading-relaxed mb-8">
            {currentQuestion.text}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = answers[currentQuestion._id] === option.text;

              return (
                <button
                  key={`${currentQuestion._id}-${idx}`}
                  onClick={() => handleSelect(option.text)}
                  disabled={isSubmitted}
                  className={`flex items-center p-5 rounded-2xl border transition-all text-left group
                    ${
                      isSelected
                        ? 'bg-primary border-primary text-on-primary shadow-md'
                        : 'bg-surface-container-low border-outline-variant text-on-surface hover:border-primary/50'
                    }`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 font-bold text-lg
                    ${
                      isSelected
                        ? 'bg-on-primary text-primary'
                        : 'bg-surface-container-highest text-on-surface-variant group-hover:bg-primary/10'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1 font-medium">{option.text}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex gap-4 items-center">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant text-on-surface-variant disabled:opacity-30"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex-1 flex gap-4">
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              Next Question <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizEngine;
