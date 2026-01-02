import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Square, Loader2, Save, Volume2, VolumeX, Users, ChevronDown, Sparkles, Code, Cpu, Brain, GraduationCap, Briefcase } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

// --- ☄️ METEOR BACKGROUND ENGINE ---
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

    const meteor = { x: Math.random() * canvas.width, y: -100, speed: 3, tailLength: 300 };

    const animate = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      meteor.x -= meteor.speed; 
      meteor.y += meteor.speed;

      if (meteor.y > canvas.height + 200) {
        meteor.x = Math.random() * canvas.width + 200; 
        meteor.y = -100; 
      }

      ctx.save();
      ctx.translate(meteor.x, meteor.y);
      ctx.rotate(-Math.PI / 4); 

      const gradient = ctx.createLinearGradient(0, 0, meteor.tailLength, 0); 
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');   
      gradient.addColorStop(0.1, 'rgba(168, 85, 247, 0.8)');   
      gradient.addColorStop(1, 'rgba(0, 0, 50, 0)');          

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -2); 
      ctx.lineTo(meteor.tailLength, -10); 
      ctx.lineTo(meteor.tailLength, 10);
      ctx.lineTo(0, 2);
      ctx.fill();

      ctx.beginPath();
      const flicker = Math.random() * 2; 
      ctx.arc(0, 0, 10 + flicker, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; 
      ctx.shadowBlur = 30;       
      ctx.shadowColor = '#d946ef';
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

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />;
};

// --- 🔌 SETTINGS ---
const API_URL = import.meta.env.DEV ? "http://127.0.0.1:8000" : "/api";

const DOMAINS = [
  { id: 'cs', name: 'Computer Science', icon: Code, topics: ['Data Structures & Algo', 'DBMS', 'Operating Systems', 'OOPs', 'Computer Networks', 'System Design'] },
  { id: 'ece', name: 'Electronics (ECE)', icon: Cpu, topics: ['Digital Electronics', 'Microprocessors', 'Embedded Systems', 'Robotics', 'VLSI Design', 'Signals & Systems'] },
  { id: 'ai', name: 'AI & Data Science', icon: Brain, topics: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Science', 'Generative AI'] }
];

const PERSONAS = [
  { id: 'male_us', name: 'Ethan (Tech Lead - US)', gender: 'male', lang: 'en-US', pitch: 0.9, rate: 1.0 },
  { id: 'female_us', name: 'Ava (HR Manager - US)', gender: 'female', lang: 'en-US', pitch: 1.1, rate: 1.0 },
  { id: 'male_in', name: 'Zoya (Senior Dev - IN)', gender: 'male', lang: 'en-IN', pitch: 1.0, rate: 1.05 },
];

export default function InterviewPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // --- STATE ---
    const [selectedDomain, setSelectedDomain] = useState(DOMAINS[0]);
    const [selectedTopic, setSelectedTopic] = useState(DOMAINS[0].topics[0]);
    const [experienceLevel, setExperienceLevel] = useState("Fresher");

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [question, setQuestion] = useState<string>("Waiting for interview to start...");
    const [answer, setAnswer] = useState<string>("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0].id);
    const [history, setHistory] = useState<any[]>([]); 

    // --- 🔒 AUTH GUARD ---
    useEffect(() => {
        if (!loading && !user) {
            window.location.href = '/signin'; // Redirect to static Signin page
        }
    }, [user, loading]);

    // --- CHECK FOR RESUME SESSION ---
    useEffect(() => {
        const urlSessionId = searchParams.get('session_id');
        if (urlSessionId) {
            setSessionId(urlSessionId);
            loadNextQuestion(urlSessionId);
        }
    }, [searchParams]);

    // --- VOICE SETUP ---
    const recognitionRef = useRef<any>(null);
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setAnswer((prev) => prev + (prev ? " " : "") + transcript);
                setIsListening(false);
            };
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) setAvailableVoices(voices);
        };
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
        return () => window.speechSynthesis.cancel();
    }, []);

    const toggleMic = () => {
        if (!recognitionRef.current) return alert("Voice input not supported.");
        if (isListening) { recognitionRef.current.stop(); } 
        else { recognitionRef.current.start(); setIsListening(true); }
    };

    const speak = (text: string) => {
        if (isMuted) return;
        window.speechSynthesis.cancel();
        const persona = PERSONAS.find(p => p.id === selectedPersona) || PERSONAS[0];
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = availableVoices.find(v => v.lang === persona.lang) || availableVoices[0];
        if (voice) utterance.voice = voice;
        utterance.pitch = persona.pitch;
        utterance.rate = persona.rate;
        window.speechSynthesis.speak(utterance);
    };

    const startInterview = async () => {
        if (!user) { alert("Please login first!"); return; }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/start_interview`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, topic: selectedTopic, experience_level: experienceLevel })
            });
            
            if (!res.ok) throw new Error(`Backend Error: ${res.status}`);

            const data = await res.json();
            setSessionId(data.session_id);
            loadNextQuestion(data.session_id);
        } catch (e: any) { 
            alert(`Failed to start interview. Is the backend running? (${e.message})`); 
            setIsLoading(false); 
        }
    };

    const loadNextQuestion = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/get_question/${id}`);
            if (!res.ok) throw new Error(`Backend Error: ${res.status}`);
            
            const data = await res.json();
            
            setQuestion(data.question);
            
            if (data.history && Array.isArray(data.history)) {
                const realHistory = data.history.filter((h: any) => !h.meta);
                setHistory(realHistory);
                
                const meta = data.history.find((h: any) => h.meta === "init");
                if (meta) {
                    if (meta.topic) setSelectedTopic(meta.topic);
                    if (meta.level) setExperienceLevel(meta.level);
                }
            }
            setAnswer("");
            setFeedback(null);
            setScore(null);
            speak(data.question);
        } catch(e) { 
            console.error(e);
            setQuestion("Error loading question. Please check backend connection.");
        } finally { setIsLoading(false); }
    };

    const submitAnswer = async () => {
        if (!sessionId || !answer) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/submit_answer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId, answer: answer, question_text: question })
            });
            const data = await res.json();
            setFeedback(data.feedback);
            setScore(data.score);
            speak(`You scored ${data.score}. ${data.feedback}`);
            setHistory(prev => [...prev, { question: question, answer: answer, score: data.score, feedback: data.feedback }]);
        } catch (e) { alert("Error submitting answer"); } finally { setIsLoading(false); }
    };

    const endAndSaveSession = async () => {
        if (!user) return alert("Please login to save.");
        setIsLoading(true);
        const totalScore = history.reduce((sum, item) => sum + (item.score || 0), 0);
        const avgScore = history.length > 0 ? Math.round(totalScore / history.length) : 0;
        try {
            const { error } = await supabase.from('interview_sessions').insert([{
                user_id: user.id, duration: '15 min', questions_answered: history.length, average_score: avgScore, status: 'completed', questions: history,
            }]);
            if (error) throw error;
            window.location.href = '/sessions';
        } catch (err: any) { alert("Save failed: " + err.message); } finally { setIsLoading(false); }
    };

    return (
        <div className="relative min-h-screen bg-[#020617] text-white font-sans selection:bg-purple-500/30">
            <MeteorCanvas />
            <div className="relative z-10 flex flex-col min-h-screen">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-2xl">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 relative z-10">
                                <div><h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" /> InterVue AI</h1><p className="text-xs text-gray-400 mt-1">Real-time Technical Interview Simulation</p></div>
                                <div className="flex flex-wrap items-center gap-2"><div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Users size={14} className="text-purple-400" /></div><select value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)} className="bg-white/5 border border-white/10 text-gray-200 text-xs rounded-xl pl-8 pr-8 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full appearance-none cursor-pointer hover:bg-white/10 transition-colors">{PERSONAS.map(p => (<option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>))}</select><div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><ChevronDown size={14} className="text-gray-400" /></div></div><button onClick={() => setIsMuted(!isMuted)} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/10">{isMuted ? <VolumeX size={16}/> : <Volume2 size={16}/>}</button><div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${sessionId ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}><span className={`h-1.5 w-1.5 rounded-full ${sessionId ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span><span className="text-[10px] font-bold tracking-wide">{sessionId ? 'LIVE' : 'OFFLINE'}</span></div></div>
                            </div>

                            {!sessionId && (
                                <div className="text-center py-6 space-y-6">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10"><h3 className="text-sm font-semibold text-white/90 mb-3">Select Experience Level</h3><div className="flex gap-4 justify-center"><button onClick={() => setExperienceLevel("Fresher")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border ${experienceLevel === "Fresher" ? "bg-green-500/20 border-green-500 text-green-400" : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-400"}`}><GraduationCap size={16} /> Fresher</button><button onClick={() => setExperienceLevel("Experienced")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border ${experienceLevel === "Experienced" ? "bg-orange-500/20 border-orange-500 text-orange-400" : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-400"}`}><Briefcase size={16} /> Experienced</button></div></div>
                                    <div className="space-y-4"><h3 className="text-lg font-semibold text-white/90">Select Your Domain</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{DOMAINS.map(domain => (<div key={domain.id} onClick={() => { setSelectedDomain(domain); setSelectedTopic(domain.topics[0]); }} className={`cursor-pointer p-3 rounded-xl border transition-all ${selectedDomain.id === domain.id ? 'bg-purple-500/20 border-purple-500' : 'bg-white/5 border-white/10 hover:border-white/30'}`}><domain.icon className={`w-6 h-6 mx-auto mb-2 ${selectedDomain.id === domain.id ? 'text-purple-400' : 'text-gray-400'}`} /><div className="font-medium text-xs">{domain.name}</div></div>))}</div></div>
                                    <div className="space-y-3"><h3 className="text-lg font-semibold text-white/90">Choose a Topic</h3><div className="flex flex-wrap justify-center gap-2">{selectedDomain.topics.map(topic => (<button key={topic} onClick={() => setSelectedTopic(topic)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedTopic === topic ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'}`}>{topic}</button>))}</div></div>
                                    <div className="pt-4 border-t border-white/10"><button onClick={startInterview} disabled={isLoading} className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-full font-bold text-sm transition-all transform hover:scale-105 shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 mx-auto">{isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : `Start ${experienceLevel} Interview`}</button></div>
                                </div>
                            )}

                            {sessionId && !feedback && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative overflow-hidden"><div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500" /><div className="flex justify-between items-center mb-2"><h2 className="text-xs font-medium text-blue-300 uppercase tracking-wider">Question ({selectedTopic})</h2><span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300">{experienceLevel}</span></div><p className="text-xl leading-relaxed text-white font-light">{question}</p></div>
                                    <div className="relative"><textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type answer or use mic..." className="w-full h-40 bg-black/20 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-base text-white placeholder-gray-500 transition-all hover:bg-black/30" /><button onClick={toggleMic} className={`absolute bottom-3 right-3 p-3 rounded-full transition-all shadow-lg backdrop-blur-md ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}>{isListening ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}</button></div>
                                    <button onClick={submitAnswer} disabled={isLoading || !answer} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-base transition-all shadow-lg shadow-purple-900/20 flex justify-center items-center gap-2">{isLoading ? <><Loader2 className="animate-spin w-4 h-4" /> Analyzing...</> : "Submit Answer"}</button>
                                </div>
                            )}

                            {feedback && (
                                <div className="text-center space-y-6 animate-in zoom-in-95 duration-500"><div className="relative w-24 h-24 mx-auto"><div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" /><div className="relative w-full h-full rounded-full border-4 border-green-500 flex items-center justify-center text-3xl font-bold text-white bg-gray-900 shadow-2xl">{score}<span className="text-xs text-gray-400 absolute bottom-3">/10</span></div></div><div className="bg-white/5 p-6 rounded-2xl text-left border border-white/10"><h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2"><Sparkles size={18}/> Feedback</h3><p className="text-gray-300 leading-relaxed text-sm">{feedback}</p></div><button onClick={() => loadNextQuestion(sessionId!)} className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-full font-bold text-base transition-all w-full shadow-xl shadow-white/10">Next Question ➔</button></div>
                            )}

                            {sessionId && history.length > 0 && (<div className="mt-8 pt-4 border-t border-white/5 flex justify-center"><button onClick={endAndSaveSession} disabled={isLoading} className="text-red-400 hover:text-white hover:bg-red-500/20 px-6 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"><Save size={14} /> End Interview & Save Results</button></div>)}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}