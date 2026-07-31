import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, LogOut, TrendingUp, Clock } from 'lucide-react';
import { quizService } from '../services/quizService';
import { authService } from '../services/authService';
import { DashboardSummary, Subject } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, subs] = await Promise.all([quizService.getDashboard(), quizService.getSubjects()]);
        setSummary(dash);
        setSubjects(subs);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-on-surface-variant">
        Loading your dashboard...
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-error font-bold">
        {error || 'Something went wrong.'}
      </div>
    );
  }

  const { user, recentAttempts } = summary;

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-on-surface-variant text-sm font-bold">Welcome back,</p>
            <h1 className="text-3xl font-black tracking-tight">{user.name}</h1>
            {user.stream && <p className="text-on-surface-variant text-sm mt-1">{user.stream}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="p-3 rounded-2xl bg-surface border border-outline text-on-surface-variant hover:text-error hover:border-error/50 transition-colors"
            aria-label="Log out"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-outline rounded-2xl p-5 space-y-2"
          >
            <div className="flex items-center gap-2 text-blue">
              <BookOpen size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Quizzes Taken</span>
            </div>
            <p className="text-3xl font-black">{user.stats?.totalQuizzes ?? 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-surface border border-outline rounded-2xl p-5 space-y-2"
          >
            <div className="flex items-center gap-2 text-blue">
              <TrendingUp size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Average Score</span>
            </div>
            <p className="text-3xl font-black">{user.stats?.avgScore ?? 0}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface border border-outline rounded-2xl p-5 space-y-2"
          >
            <div className="flex items-center gap-2 text-blue">
              <Award size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Rank</span>
            </div>
            <p className="text-3xl font-black">{user.stats?.rank ? `#${user.stats.rank}` : '—'}</p>
          </motion.div>
        </div>

        {/* Subjects */}
        <div className="space-y-4">
          <h2 className="text-xl font-black">Your Subjects</h2>
          {subjects.length === 0 ? (
            <p className="text-on-surface-variant text-sm">No subjects available for your stream yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjects.map((subject) => (
                <button
                  key={subject._id}
                  onClick={() => navigate(`/quiz/${subject._id}`)}
                  className="text-left bg-surface border border-outline hover:border-blue/50 rounded-2xl p-5 transition-colors"
                >
                  <h3 className="font-bold text-lg">{subject.name}</h3>
                  <p className="text-on-surface-variant text-sm mt-1">{subject.units.length} units</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attempts */}
        <div className="space-y-4">
          <h2 className="text-xl font-black">Recent Activity</h2>
          {recentAttempts.length === 0 ? (
            <p className="text-on-surface-variant text-sm">You haven't taken any quizzes yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <button
                  key={attempt._id}
                  onClick={() => navigate(`/results/${attempt._id}`)}
                  className="w-full flex items-center justify-between bg-surface border border-outline rounded-2xl p-4 hover:border-blue/50 transition-colors text-left"
                >
                  <div>
                    <p className="font-bold">{attempt.subject.name}</p>
                    <div className="flex items-center gap-2 text-on-surface-variant text-xs mt-1">
                      <Clock size={14} />
                      {new Date(attempt.createdAt).toLocaleDateString()}
                      <span className="uppercase font-bold">{attempt.mode}</span>
                    </div>
                  </div>
                  <p className="font-black text-lg">
                    {attempt.score}/{attempt.total}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
