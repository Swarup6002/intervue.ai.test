import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Header from '@/components/Header';
import { PlayCircle, Clock, Code, Award, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.DEV ? "http://127.0.0.1:8000" : "/api";

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetch(`${API_URL}/my_sessions/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setSessions(data.sessions);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load sessions", err);
                    setIsLoading(false);
                });
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans">
            <Header />
            <div className="pt-32 px-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        My Interviews
                    </h1>
                    <button 
                        onClick={() => navigate('/interview')}
                        className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors"
                    >
                        + New Interview
                    </button>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin w-10 h-10 text-purple-500" />
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {sessions.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-gray-400 text-lg mb-4">No interviews found.</p>
                                <button onClick={() => navigate('/interview')} className="text-purple-400 hover:text-purple-300 font-medium">Start your first interview!</button>
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div key={session.session_id} className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white/10 transition-all group">
                                    <div className="mb-4 md:mb-0">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2 group-hover:text-blue-300 transition-colors">
                                            <Code size={20} className="text-purple-400" /> {session.topic}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                                            <span className="flex items-center gap-1"><Clock size={14}/> {new Date(session.created_at).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Award size={14}/> {session.questions_count} Qs</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${session.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                {session.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/interview?session_id=${session.session_id}`)}
                                        className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20"
                                    >
                                        <PlayCircle size={18} /> Resume
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}