
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ChevronLeft, Award, Users, BookCheck, Loader2 } from 'lucide-react';
import { socket } from '../services/socket';
import { Quiz, Session } from '../types';

interface SessionRecapProps {
  quizzes: Quiz[];
}

const SessionRecap: React.FC<SessionRecapProps> = ({ quizzes }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(() => {
    const saved = localStorage.getItem(`session_${sessionId}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(!session);

  useEffect(() => {
    if (session) return;

    setLoading(true);
    socket.emit('session:get_full', sessionId);

    const handleFullState = (data: Session) => {
      setSession(data);
      setLoading(false);
      localStorage.setItem(`session_${sessionId}`, JSON.stringify(data));
    };

    const handleNotFound = () => {
      setLoading(false);
    };

    socket.on('session:full_state', handleFullState);
    socket.on('session:not_found', handleNotFound);

    return () => {
      socket.off('session:full_state', handleFullState);
      socket.off('session:not_found', handleNotFound);
    };
  }, [sessionId, session]);

  const quiz = useMemo(() => {
    return quizzes.find(q => q.id === session?.quizId) || session?.quiz;
  }, [quizzes, session]);

  const rankings = useMemo(() => {
    if (!session || !quiz) return [];

    return session.participants.map(p => {
      const correctAnswers = session.answers.filter(a => a.participantId === p.id && a.isCorrect).length;
      return {
        ...p,
        score: correctAnswers,
        successRate: Math.round((correctAnswers / quiz.questions.length) * 100)
      };
    }).sort((a, b) => b.score - a.score);
  }, [session, quiz]);

  const averageSuccessRate = useMemo(() => {
    if (rankings.length === 0) return 0;
    return Math.round(rankings.reduce((acc, curr) => acc + curr.successRate, 0) / rankings.length);
  }, [rankings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!session || !quiz) return <div className="p-12 text-center text-red-500 font-bold bg-gray-100 min-h-screen">Session non trouvée ou quiz manquant.</div>;

  const winner = rankings[0];

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center font-sans">
      <div className="w-[90%] min-h-screen bg-gray-100 text-[#235784] pb-20 shadow-xl">
        <header className="px-6 py-4 border-b border-gray-200 grid grid-cols-3 items-center bg-[#235784] sticky top-0 z-20 shadow-sm mb-8">
          {/* Left: Title */}
          <div className="flex items-center gap-3 justify-self-start">
            <h1 className="text-2xl font-black text-white tracking-tight">Résultats de la Session</h1>
          </div>

          {/* Center: Quiz Info */}
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-3 text-white/90 text-sm font-medium">
              <span>{quiz.title}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
              <span>{new Date(session.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Right: Back Button */}
          <div className="flex gap-3 justify-self-end">
            <button
              onClick={() => navigate('/teacher')}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white transition-colors font-bold px-4 py-2 rounded-lg group whitespace-nowrap"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Retour Dashboard
            </button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-4">

          {/* Winner Section */}
          {winner && (
            <div className="mb-20 flex justify-center">
              <div className="relative bg-white p-12 rounded-[3rem] shadow-2xl shadow-[#235784]/10 border border-gray-200 flex flex-col items-center text-center animate-in zoom-in duration-700 max-w-lg w-full transform hover:scale-105 transition-transform">
                <div className="absolute -top-12 bg-gradient-to-tr from-[#f7aa00] to-amber-500 p-6 rounded-[2rem] shadow-lg shadow-[#f7aa00]/30 rotate-12">
                  <Trophy className="w-20 h-20 text-white drop-shadow-md" />
                </div>
                <div className="mt-12">
                  <span className="text-[#f7aa00] font-black tracking-widest uppercase text-sm mb-4 block">Grand Vainqueur</span>
                  <div className="text-9xl mb-6 filter drop-shadow-sm hover:animate-bounce cursor-default">
                    {winner.emoji}
                  </div>
                  <h2 className="text-5xl font-black text-[#235784] mb-4 tracking-tighter">{winner.name}</h2>
                  <div className="bg-[#235784] px-8 py-3 rounded-full inline-flex items-center gap-3 shadow-xl shadow-[#235784]/20">
                    <span className="text-white font-black text-2xl">{winner.score}</span>
                    <span className="text-white/60 font-bold uppercase text-xs">Points</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm flex flex-col items-center">
              <div className="bg-blue-50 p-3 rounded-2xl mb-3"><Users className="text-[#235784] w-6 h-6" /></div>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Participants</span>
              <span className="text-3xl font-black mt-1 text-[#235784]">{session.participants.length}</span>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm flex flex-col items-center">
              <div className="bg-[#40a8c4]/10 p-3 rounded-2xl mb-3"><BookCheck className="text-[#40a8c4] w-6 h-6" /></div>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Taux de réussite</span>
              <span className="text-3xl font-black mt-1 text-[#235784]">{averageSuccessRate}%</span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-xl shadow-[#235784]/5">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-black flex items-center gap-3 text-[#235784]">
                <Award className="text-[#f7aa00] w-6 h-6" /> CLASSEMENT GÉNÉRAL
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {rankings.map((p, index) => (
                <div key={p.id} className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-all group relative overflow-hidden">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-slate-200 text-slate-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-slate-100 text-slate-500'
                    }`}>
                    {index + 1}
                  </div>
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{p.emoji}</div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-800 tracking-tight">{p.name}</h4>
                    <div className="flex gap-4 mt-1">
                      <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.successRate}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-black text-slate-800">{p.score} <span className="text-sm font-medium text-slate-400">pts</span></span>
                  </div>
                </div>
              ))}
              {rankings.length === 0 && (
                <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                  <Users className="w-12 h-12 opacity-20" />
                  <p className="font-bold italic uppercase tracking-widest text-sm">Aucun participant à ce quiz</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionRecap;
