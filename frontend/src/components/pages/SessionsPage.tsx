import { useState, useEffect, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import { Calendar, Award, Clock, TrendingUp, ChevronRight, Activity, Zap, Trash2, Plus, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

// --- ☄️ METEOR BACKGROUND ENGINE (Home Page Style) ---
const MeteorCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Configuration
    const meteor = {
      x: Math.random() * canvas.width + canvas.width * 0.5, 
      y: -300, 
      speed: 4, 
      tailLength: 400,
    };

    const animate = () => {
      // Clear with trail effect
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Move South-West
      meteor.x -= meteor.speed; 
      meteor.y += meteor.speed;

      // Reset
      if (meteor.y > canvas.height + 400 || meteor.x < -400) {
        meteor.x = Math.random() * canvas.width + canvas.width * 0.5; 
        meteor.y = -300; 
      }

      ctx.save();
      ctx.translate(meteor.x, meteor.y);
      ctx.rotate(-Math.PI / 4); 

      // 1. Blue Energy Tail
      const gradient = ctx.createLinearGradient(0, 0, meteor.tailLength, 0); 
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');   
      gradient.addColorStop(0.1, 'rgba(0, 255, 255, 0.8)');   
      gradient.addColorStop(0.5, 'rgba(0, 100, 255, 0.4)');   
      gradient.addColorStop(1, 'rgba(0, 0, 50, 0)');          

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -3); 
      ctx.lineTo(meteor.tailLength, -10); 
      ctx.lineTo(meteor.tailLength, 10);
      ctx.lineTo(0, 3);
      ctx.fill();

      // 2. Burning Yellow Head
      ctx.beginPath();
      const flicker = Math.random() * 2; 
      ctx.arc(0, 0, 7 + flicker, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; 
      ctx.shadowBlur = 30;       
      ctx.shadowColor = '#ffff00';
      ctx.fill();

      ctx.restore();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />;
};

// --- ✨ COLORFUL GLOWING CARD (Updated to accept hexColor) ---
const GlowingCard = ({ children, className = "", hexColor = "#8b5cf6" }: { children: React.ReactNode, className?: string, hexColor?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Convert hex to rgba string for the gradient (adding 25% opacity)
  const glowColor = hexColor + "50"; 

  return (
    <div
      className={`group relative border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden rounded-2xl ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              ${glowColor}, 
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full z-10">{children}</div>
    </div>
  );
};

interface Session {
  id: string;
  created_at: string;
  duration: string;
  questions_answered: number;
  average_score: number;
  status: string;
}

function SessionsPageContent() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Colors for session cards to cycle through
  const SESSION_COLORS = ["#06b6d4", "#ec4899", "#6366f1", "#10b981"]; // Cyan, Pink, Indigo, Emerald

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('interview_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          if (data) setSessions(data);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this session permanently?")) return;

    try {
      const { error } = await supabase
        .from('interview_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        alert(`Failed to delete: ${error.message}`);
        return;
      }
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      alert("An unexpected error occurred.");
    }
  };

  const totalSessions = sessions.length;
  const averageScore = totalSessions > 0
    ? Math.round(sessions.reduce((acc, session) => acc + session.average_score, 0) / totalSessions)
    : 0;
  const totalQuestions = sessions.reduce((acc, session) => acc + session.questions_answered, 0);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 border-green-500/30';
    if (score >= 75) return 'text-yellow-400 border-yellow-500/30';
    return 'text-red-400 border-red-500/30';
  };

  // 🔄 NAVIGATION GUARD
  const location = useLocation();
  useEffect(() => {
    if (!location.pathname.startsWith('/sessions')) {
      window.location.href = location.pathname;
    }
  }, [location]);

  return (
    <div className="relative min-h-screen bg-[#020617] text-white font-sans selection:bg-purple-500/30">
      
      {/* 1. BACKGROUND */}
      <MeteorCanvas />
      
      {/* 2. CONTENT */}
      <div className="relative z-10">
        <Header />
        
        <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6"
          >
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
                Session <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">History</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl">
                Track your performance evolution. Analyze past interviews to unlock your full potential.
              </p>
            </div>

            <a href="/interview">
              <Button className="h-14 px-8 bg-white text-black hover:bg-purple-50 hover:text-purple-900 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all flex items-center gap-2">
                <Plus size={24} /> Start New Session
              </Button>
            </a>
          </motion.div>

          {/* Stats Grid (Colorful) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
                { label: "Total Sessions", value: totalSessions, icon: Activity, color: "text-blue-400", glow: "#3b82f6" },
                { label: "Average Score", value: `${averageScore}%`, icon: TrendingUp, color: "text-purple-400", glow: "#a855f7" },
                { label: "Questions Answered", value: totalQuestions, icon: Zap, color: "text-yellow-400", glow: "#eab308" }
            ].map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }} // Replays animation
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                    <GlowingCard className="p-8 hover:scale-[1.02] transition-transform duration-300" hexColor={stat.glow}>
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                                <stat.icon size={28} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-4xl font-bold text-white">{stat.value}</p>
                        </div>
                    </GlowingCard>
                </motion.div>
            ))}
          </div>

          {/* Sessions List (Colorful Cards) */}
          <div className="space-y-4">
            {sessions.map((session, index) => {
              const cardColor = SESSION_COLORS[index % SESSION_COLORS.length]; // Cycle colors
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.3 }} // Replays animation
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <a href={`/interview?session_id=${session.id}`} className="block">
                    <GlowingCard 
                      className="p-6 md:p-8 hover:border-white/20 transition-all duration-300 group cursor-pointer" 
                      hexColor={cardColor}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        
                        {/* Left: Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl bg-white/5 border ${getScoreColor(session.average_score)}`}>
                              {session.average_score}
                            </div>
                            <div>
                              <h3 className="font-bold text-2xl text-white group-hover:text-purple-300 transition-colors">
                                Tech Interview #{session.id.slice(0, 4)}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-2">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14}/> {format(new Date(session.created_at), 'PPP')}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14}/> {session.duration}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Metrics */}
                        <div className="flex gap-8 text-sm border-l border-white/10 pl-6 md:pl-8">
                            <div>
                                <p className="text-gray-500 mb-1">Answered</p>
                                <p className="font-semibold text-white text-lg">{session.questions_answered} Qs</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Status</p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 capitalize">
                                    {session.status}
                                </span>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 justify-end">
                            <button 
                              onClick={(e) => handleDelete(e, session.id)}
                              className="p-3 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 z-20 group/delete"
                              title="Delete Session"
                            >
                              <Trash2 size={20} className="group-hover/delete:scale-110 transition-transform"/>
                            </button>

                            <Button className="flex-1 md:flex-none bg-white/5 hover:bg-purple-600/20 text-white border border-white/10 hover:border-purple-500/50 rounded-xl h-12 px-6 group/btn transition-all">
                                Continue Analysis 
                                <ChevronRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                      </div>
                    </GlowingCard>
                  </a>
                </motion.div>
              );
            })}

            {!loading && sessions.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false }}
                    className="text-center py-24"
                >
                    <GlowingCard className="p-12 max-w-2xl mx-auto flex flex-col items-center" hexColor="#64748b">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse border border-white/10">
                            <Award className="w-12 h-12 text-gray-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">No Sessions Yet</h3>
                        <p className="text-gray-400 mb-8 max-w-md text-lg">
                            Your journey begins now. Complete your first AI interview to unlock detailed performance analytics.
                        </p>
                        <a href="/interview">
                            <Button className="bg-white text-black hover:bg-gray-200 font-bold px-10 py-6 text-xl rounded-full shadow-2xl shadow-white/10">
                                <Play className="w-5 h-5 mr-2 fill-black" /> Start First Interview
                            </Button>
                        </a>
                    </GlowingCard>
                </motion.div>
            )}
          </div>

        </div>
        <Footer />
      </div>
    </div>
  );
}

export default function SessionsPage() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SessionsPageContent />
      </BrowserRouter>
    </AuthProvider>
  );
}