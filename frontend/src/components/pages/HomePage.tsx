import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate } from 'framer-motion';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import { 
  MessageSquare, 
  Mic, 
  BarChart3, 
  Zap, 
  Code2, 
  Globe, 
  ArrowRight, 
  Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
      speed: 4, // Cinematic Slow Fall
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
      // ROTATE: Tail points North-East
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

      // 2. Burning Yellow Head (Vibrating)
      ctx.beginPath();
      const flicker = Math.random() * 2; 
      ctx.arc(0, 0, 7 + flicker, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; 
      ctx.shadowBlur = 30;       
      ctx.shadowColor = '#ffff00'; // Yellow Glow
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

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

// --- Utility Components ---

// UPDATED: Now triggers every time (viewport={{ once: false }})
const RevealOnScroll = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }} // <--- Changed here!
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ParallaxText = ({ children, baseVelocity = 100 }: { children: string; baseVelocity: number }) => {
  return (
    <div className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap">
      <motion.div 
        className="font-heading text-6xl md:text-9xl font-bold uppercase text-white/5 flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ 
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        <span className="block mr-8">{children} </span>
        <span className="block mr-8">{children} </span>
        <span className="block mr-8">{children} </span>
        <span className="block mr-8">{children} </span>
      </motion.div>
    </div>
  );
};

const GlowingCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 255, 255, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

// --- Main Page Component ---

function HomePageContent() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 400]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // 🔄 NAVIGATION GUARD: Force hard reload if Header tries to navigate away
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '') {
      window.location.href = location.pathname;
    }
  }, [location]);

  return (
    <div className="relative min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
      
      {/* 1. THE CANVAS METEOR LAYER (Background) */}
      <MeteorCanvas />

      {/* 2. THE CONTENT LAYER (Foreground) */}
      <div className="relative z-10">
        <Header />

        {/* --- HERO SECTION (KEPT EXACTLY AS IS) --- */}
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          <div className="container px-4 md:px-6 max-w-[120rem] mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="text-left"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  <span className="ml-4 text-sm font-medium text-cyan-200 tracking-wide uppercase">Gemini 2.0 Integrated</span>
                </div>

                <h1 className="font-heading text-6xl md:text-8xl font-bold leading-tight mb-8">
                  Crack the <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                    Code Interview
                  </span>
                </h1>

                <p className="font-paragraph text-xl text-gray-400 mb-10 max-w-xl">
                  The world's most advanced AI interviewer. Real-time voice feedback, code analysis, and behavioral coaching.
                </p>

                <div className="flex gap-4">
                  <a href="/interview">
                    <Button className="h-14 px-8 text-lg bg-white text-black hover:bg-cyan-50 rounded-full font-bold transition-all hover:scale-105">
                      Start Simulation <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                  <a href="/sessions">
                    <Button variant="outline" className="h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10 rounded-full">
                      View Demo
                    </Button>
                  </a>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2 }}
                className="hidden lg:block relative"
              >
                <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-2xl">
                  <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="font-mono text-sm text-cyan-200/80 leading-relaxed">
                    <p><span className="text-purple-400">const</span> <span className="text-yellow-200">interview</span> = <span className="text-blue-400">new</span> AI();</p>
                    <p className="mt-2"><span className="text-gray-500">// Analyzing response...</span></p>
                    <p className="text-cyan-400 mt-2">{'>'} Logic Verified. O(n) Time Complexity.</p>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* --- LOGO TICKER --- */}
        <section className="py-10 border-y border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden">
          <div className="flex gap-12 items-center animate-marquee whitespace-nowrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="flex items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500 hover:opacity-100">
                 <span className="text-2xl font-bold font-heading text-white">GOOGLE</span>
                 <span className="text-2xl font-bold font-heading text-white">AMAZON</span>
                 <span className="text-2xl font-bold font-heading text-white">META</span>
                 <span className="text-2xl font-bold font-heading text-white">NETFLIX</span>
              </div>
            ))}
          </div>
        </section>

        {/* --- STICKY SCROLL FEATURE SECTION (With Repeating Rising & Sliding Animations) --- */}
        <section className="relative py-32 container max-w-[120rem] mx-auto px-4 md:px-6">
          {/* Header Rising Animation */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }} // <--- Changed to false
            transition={{ duration: 0.8 }}
            className="mb-24 text-center"
          >
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
              The Unfair <span className="text-cyan-400">Advantage</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Traditional prep is static. We built a dynamic engine that adapts to your skill level in real-time.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Image Slide-In Animation */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }} // <--- Changed to false
              transition={{ duration: 1 }}
              className="hidden lg:block relative h-[200vh]"
            >
              <div className="sticky top-32 w-full aspect-square rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
                <Image 
                  src="https://static.wixstatic.com/media/1c85b0_12768bfa874a4ca3b2e88200fa33393b~mv2.png/v1/fill/w_768,h_768,al_c,q_90,enc_auto/1c85b0_12768bfa874a4ca3b2e88200fa33393b~mv2.png" 
                  alt="AI Dashboard Interface" 
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                />
                
                <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "85%" }}
                        viewport={{ once: false }} // <--- Changed to false
                        transition={{ duration: 1.5 }}
                        className="h-full bg-cyan-500"
                      />
                    </div>
                    <span className="text-cyan-400 font-mono">85% Match</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white border border-white/5">System Design</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white border border-white/5">Algorithms</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* List Items (Uses Updated RevealOnScroll) */}
            <div className="flex flex-col gap-[40vh] py-[10vh]">
              {[
                {
                  icon: MessageSquare,
                  title: "Context-Aware Dialogue",
                  desc: "Unlike static flashcards, our AI maintains context throughout the interview. It remembers your previous answers and digs deeper."
                },
                {
                  icon: Mic,
                  title: "Voice & Tone Analysis",
                  desc: "It's not just what you say, but how you say it. We analyze your speech pace, confidence markers, and filler words."
                },
                {
                  icon: Code2,
                  title: "Live Code Execution",
                  desc: "Write, run, and debug code in our integrated IDE. The AI reviews your syntax, time complexity, and edge-case handling instantly."
                }
              ].map((feature, idx) => (
                <RevealOnScroll key={idx} className="flex flex-col justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="font-paragraph text-lg text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* --- PARALLAX TEXT DIVIDER --- */}
        <section className="py-20 bg-white/5 border-y border-white/10 overflow-hidden">
          <ParallaxText baseVelocity={-5}>SYSTEM DESIGN • ALGORITHMS • BEHAVIORAL •</ParallaxText>
          <ParallaxText baseVelocity={5}>FRONTEND • BACKEND • DEVOPS • FULLSTACK •</ParallaxText>
        </section>

        {/* --- BENTO GRID FEATURES (With Repeating Staggered Animations) --- */}
        <section className="py-32 container max-w-[120rem] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
            
            {/* Card 1 */}
            <motion.div 
              className="md:col-span-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }} // <--- Changed to false
              transition={{ duration: 0.5, delay: 0 }}
            >
              <GlowingCard className="rounded-3xl p-10 flex flex-col justify-between group h-full">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                    <Terminal className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Full-Stack Environment</h3>
                  <p className="text-gray-400 max-w-md">Complete simulation environment supporting React, Node, Python, and Go.</p>
                </div>
                <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-gradient-to-tl from-cyan-500/20 to-transparent rounded-tl-[100px] opacity-50 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute right-10 bottom-10 font-mono text-sm text-cyan-300/50">
                  $ npm run interview<br/>
                  {'>'} Starting server...<br/>
                  {'>'} Environment ready.
                </div>
              </GlowingCard>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              className="md:row-span-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }} // <--- Changed to false
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlowingCard className="rounded-3xl p-10 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-transparent opacity-50" />
                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Deep Analytics</h3>
                  <p className="text-gray-400 mb-8">Track your growth over time with detailed performance metrics.</p>
                  <div className="mt-auto space-y-4">
                    {[85, 92, 78, 95].map((val, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Session {i+1}</span>
                          <span>{val}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${val}%` }}
                            viewport={{ once: false }} // <--- Changed to false
                            transition={{ delay: 0.2 * i, duration: 1 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlowingCard>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }} // <--- Changed to false
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GlowingCard className="rounded-3xl p-10 flex flex-col justify-center items-center text-center h-full">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Global Standards</h3>
                <p className="text-gray-400 text-sm">Questions curated from top tech companies worldwide.</p>
              </GlowingCard>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }} // <--- Changed to false
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <GlowingCard className="rounded-3xl p-10 flex flex-col justify-center items-center text-center h-full">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Instant Feedback</h3>
                <p className="text-gray-400 text-sm">Get graded immediately after every answer.</p>
              </GlowingCard>
            </motion.div>

          </div>
        </section>

        {/* --- IMMERSIVE CTA SECTION (With Repeating Animation) --- */}
        <section className="relative py-40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-cyan-500/10" />
          <div className="container relative z-10 max-w-5xl mx-auto text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }} // <--- Changed to false
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-heading text-5xl md:text-8xl font-bold text-white mb-8 tracking-tight">
                Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Level Up?</span>
              </h2>
              <p className="font-paragraph text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Join thousands of developers who are landing their dream jobs. Your personal AI coach is waiting.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href="/interview" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-16 px-12 text-xl bg-white text-black hover:bg-gray-200 font-bold rounded-full transition-all hover:scale-105 shadow-2xl shadow-white/10">
                    Start Free Interview
                  </Button>
                </a>
                <a href="/sessions" className="w-full sm:w-auto">
                  <Button variant="ghost" className="w-full sm:w-auto h-16 px-12 text-xl text-white hover:bg-white/5 rounded-full border border-white/10">
                    View Sample Report
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <HomePageContent />
      </BrowserRouter>
    </AuthProvider>
  );
}