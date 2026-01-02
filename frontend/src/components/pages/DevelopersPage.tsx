import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import { Code2, Sparkles, Zap, Database, Brain, Mic2, Github, Linkedin, Globe, Rocket } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { Image } from '@/components/ui/image';

// --- ☄️ METEOR BACKGROUND ENGINE (Same as Home Page) ---
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

    const meteor = {
      x: Math.random() * canvas.width + canvas.width * 0.5, 
      y: -300, 
      speed: 4, 
      tailLength: 400,
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      meteor.x -= meteor.speed; 
      meteor.y += meteor.speed;

      if (meteor.y > canvas.height + 400 || meteor.x < -400) {
        meteor.x = Math.random() * canvas.width + canvas.width * 0.5; 
        meteor.y = -300; 
      }

      ctx.save();
      ctx.translate(meteor.x, meteor.y);
      ctx.rotate(-Math.PI / 4); 

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

// --- ✨ COLORFUL GLOWING CARD ---
const GlowingCard = ({ children, className = "", hexColor = "#8b5cf6" }: { children: React.ReactNode, className?: string, hexColor?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Convert hex to rgba for the gradient
  const glowColor = hexColor + "40"; // Adding opacity (hex alpha)

  return (
    <div
      className={`group relative border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden rounded-3xl ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
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

function DevelopersPageContent() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- SUPABASE DATA FETCHING (Unchanged) ---
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) {
          throw error;
        }

        const items = data || [];

        const mappedItems = items.map((item: any) => ({
          ...item,
          _id: item.id || item._id,
          name: item.name,
          role: item.role,
          bio: item.bio,
          profilePicture: item.profile_picture || item.profilePicture || item.profilepicture || item.avatar_url,
          linkedInUrl: item.linkedin_url || item.linkedInUrl || item.linkedinurl || item.linkedin,
          portfolioUrl: item.portfolio_url || item.portfolioUrl,
          displayOrder: item.display_order || item.displayOrder || item.displayorder || 0,
        }));

        setTeamMembers(mappedItems);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Define colors for cards
  const CARD_COLORS = ["#06b6d4", "#a855f7", "#ec4899", "#3b82f6"]; // Cyan, Purple, Pink, Blue

  const technologies = [
    { icon: Brain, name: 'Gemini 2.0 AI', description: 'Advanced AI model for intelligent interview', color: '#a855f7' }, // Purple
    { icon: Code2, name: 'React & TypeScript', description: 'Modern frontend framework with type safety', color: '#3b82f6' }, // Blue
    { icon: Zap, name: 'Framer Motion', description: 'Smooth animations and micro-interactions', color: '#f59e0b' }, // Amber
    { icon: Mic2, name: 'Web Speech API', description: 'Voice recognition and text-to-speech capabilities', color: '#ef4444' }, // Red
    { icon: Database, name: 'Supabase', description: 'Scalable PostgreSQL database for real-time data', color: '#22c55e' }, // Green
    { icon: Sparkles, name: 'Glassmorphism UI', description: 'Modern, futuristic design with depth and clarity', color: '#06b6d4' } // Cyan
  ];

  // 🔄 NAVIGATION GUARD
  const location = useLocation();
  useEffect(() => {
    if (!location.pathname.startsWith('/developers')) {
      window.location.href = location.pathname;
    }
  }, [location]);

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* 1. METEOR BACKGROUND */}
      <MeteorCanvas />

      {/* 2. CONTENT */}
      <div className="relative z-10">
        <Header />
        
        <div className="pt-32 pb-20 px-6 max-w-[100rem] mx-auto">
          
          {/* --- HERO HEADER --- */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }} // Repeated animation
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-300 mb-6 backdrop-blur-md">
              <Rocket size={14} />
              <span>Engineering Excellence</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold mb-6 tracking-tight">
              About the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-purple-400">Project</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              A cutting-edge AI-powered interview platform built with modern web technologies to help you land your dream job.
            </p>
          </motion.div>

          {/* --- MISSION SECTION --- */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }} // Repeated animation
            transition={{ duration: 0.8 }}
            className="mb-32"
          >
            <GlowingCard className="p-12 md:p-16 text-center" hexColor="#3b82f6">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <Sparkles className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                We believe that everyone deserves access to high-quality interview preparation. 
                Intervue.ai combines the power of artificial intelligence with modern web technologies 
                to create an immersive, effective, and accessible platform for technical interview practice.
              </p>
            </GlowingCard>
          </motion.div>

          {/* --- TEAM SECTION --- */}
          {teamMembers.length > 0 && (
            <div className="mb-32">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                className="text-4xl md:text-5xl font-bold text-center mb-16"
              >
                Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Minds</span>
              </motion.h2>

              <div className="flex flex-wrap justify-center gap-12">
                {teamMembers.map((member, index) => {
                  const cardColor = CARD_COLORS[index % CARD_COLORS.length]; // Cycle colors
                  
                  return (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }} // Repeated animation
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      className="w-full md:w-[380px]"
                    >
                      <GlowingCard className="p-10 h-full flex flex-col items-center text-center hover:scale-[1.02] transition-transform duration-500" hexColor={cardColor}>
                        
                        {/* Profile Picture with Colored Ring */}
                        <div className="relative mb-8 group-hover:scale-105 transition-transform duration-500">
                          <div className={`absolute -inset-2 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} style={{ backgroundColor: cardColor }} />
                          <div className="relative w-40 h-40 rounded-full p-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10">
                            {member.profilePicture ? (
                              <Image src={member.profilePicture} alt={member.name} className="w-full h-full rounded-full object-cover bg-[#020617]" />
                            ) : (
                              <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center">
                                <Code2 className="w-16 h-16 text-gray-600" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <h3 className="text-3xl font-bold text-white mb-2">{member.name}</h3>
                        <p className="text-lg font-medium mb-6" style={{ color: cardColor }}>
                          {member.role}
                        </p>
                        <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                          {member.bio}
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-4 mt-auto">
                          {member.linkedInUrl && (
                            <a href={member.linkedInUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all">
                              <Linkedin className="w-5 h-5 text-white" />
                            </a>
                          )}
                          {member.portfolioUrl && (
                            <a href={member.portfolioUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all">
                              <Globe className="w-5 h-5 text-white" />
                            </a>
                          )}
                        </div>

                      </GlowingCard>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- TECH STACK --- */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }} // Repeated animation
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              Built <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">With</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {technologies.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GlowingCard className="p-8 flex items-start gap-6 hover:-translate-y-2 transition-transform duration-300" hexColor={tech.color}>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shrink-0" style={{ color: tech.color }}>
                      <tech.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white mb-2">{tech.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{tech.description}</p>
                    </div>
                  </GlowingCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
        <Footer />
      </div>
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <DevelopersPageContent />
      </BrowserRouter>
    </AuthProvider>
  );
}