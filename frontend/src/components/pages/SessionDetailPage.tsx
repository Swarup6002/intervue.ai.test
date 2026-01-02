import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, Award, TrendingUp, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface Question {
  id: number;
  question: string;
  answer: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface SessionDetail {
  id: string;
  date: Date;
  duration: string;
  questionsAnswered: number;
  averageScore: number;
  status: string;
  questions: Question[];
}

export default function SessionDetailPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-accent';
    if (score >= 75) return 'text-accent/80';
    return 'text-accent/60';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-accent/10 border-accent/30';
    if (score >= 75) return 'bg-accent/10 border-accent/20';
    return 'bg-accent/5 border-accent/10';
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        setIsAuthenticated(true);

        if (!sessionId) {
          setError('Invalid session ID.');
          setLoading(false);
          return;
        }

        const { data, error: dbError } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (dbError) throw dbError;

        if (!data) {
          setError('Session not found.');
          setLoading(false);
          return;
        }

        setSession({
          id: data.id,
          date: new Date(data.created_at),
          duration: data.duration || '0 min',
          questionsAnswered: data.questions_answered || 0,
          averageScore: data.average_score || 0,
          status: data.status || 'completed',
          questions: data.questions || []
        });
      } catch (err: any) {
        console.error('Error fetching session:', err);
        setError(err.message || 'Failed to load session details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Please Sign In</h1>
          <p className="text-muted-foreground text-lg">
            You need to be logged in to view session details and history.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/signin" className="w-full sm:w-auto">
              <Button className="w-full bg-accent text-background hover:bg-accent/90 font-semibold h-12 px-8">
                Sign In
              </Button>
            </Link>
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full h-12 px-8">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Unable to Load Session</h1>
        <p className="text-muted-foreground mb-6">{error || 'Session not found'}</p>
        <Link to="/sessions">
          <Button>Back to Sessions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary to-secondary dark:from-background dark:via-primary dark:to-secondary text-foreground dark:text-white transition-colors duration-300">
      <Header />
      
      <div className="pt-32 pb-20 px-8">
        <div className="max-w-[100rem] mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link to="/sessions">
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sessions
              </Button>
            </Link>
          </motion.div>

          {/* Session Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">
                  Interview Session #{sessionId}
                </h1>
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar className="w-5 h-5" />
                  <span className="font-paragraph text-lg">
                    {format(session.date, 'PPP')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <p className="font-paragraph text-xs text-white/50">Duration</p>
                </div>
                <p className="font-heading text-2xl font-bold text-white">{session.duration}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-accent" />
                  <p className="font-paragraph text-xs text-white/50">Questions</p>
                </div>
                <p className="font-heading text-2xl font-bold text-white">{session.questionsAnswered}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <p className="font-paragraph text-xs text-white/50">Avg Score</p>
                </div>
                <p className="font-heading text-2xl font-bold text-accent">{session.averageScore}%</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <p className="font-paragraph text-xs text-white/50">Status</p>
                </div>
                <p className="font-paragraph text-sm font-semibold text-accent capitalize">{session.status}</p>
              </div>
            </div>
          </motion.div>

          {/* Questions & Answers */}
          <div className="space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-heading text-3xl font-bold text-white mb-6"
            >
              Questions & Feedback
            </motion.h2>

            {session.questions.length > 0 ? session.questions.map((qa, index) => (
              <motion.div
                key={qa.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 md:p-8"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-heading text-sm font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg border border-accent/20">
                        Q{qa.id}
                      </span>
                      <div className={`px-4 py-1 rounded-lg border ${getScoreBgColor(qa.score)}`}>
                        <span className={`font-heading text-lg font-bold ${getScoreColor(qa.score)}`}>
                          {qa.score}%
                        </span>
                      </div>
                    </div>
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
                      {qa.question}
                    </h3>
                  </div>
                </div>

                {/* Answer */}
                <div className="mb-6">
                  <h4 className="font-heading text-sm font-bold text-white/50 mb-3">Your Answer</h4>
                  <p className="font-paragraph text-base text-white/80 bg-white/5 rounded-xl p-4 border border-white/10">
                    {qa.answer}
                  </p>
                </div>

                {/* Feedback */}
                <div className="mb-6">
                  <h4 className="font-heading text-sm font-bold text-white/50 mb-3">AI Feedback</h4>
                  <p className="font-paragraph text-base text-white/80">
                    {qa.feedback}
                  </p>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-heading text-sm font-bold text-accent mb-3">Strengths</h4>
                    <ul className="space-y-2">
                      {qa.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 font-paragraph text-sm text-white/70">
                          <span className="text-accent mt-0.5">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-bold text-accent mb-3">Improvements</h4>
                    <ul className="space-y-2">
                      {qa.improvements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start gap-2 font-paragraph text-sm text-white/70">
                          <span className="text-accent mt-0.5">→</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-white/60">No detailed question feedback available for this session.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/interview">
              <Button className="bg-accent text-background hover:bg-accent/90 font-semibold px-8 py-6 rounded-lg shadow-lg shadow-accent/20">
                Start New Interview
              </Button>
            </Link>
            <Link to="/sessions">
              <Button
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 font-semibold px-8 py-6 rounded-lg"
              >
                View All Sessions
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
