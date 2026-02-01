
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, ArrowRight, Loader2, AlertCircle, Wifi, ChevronLeft } from 'lucide-react';
import { socket } from '../services/socket';
import { Session, Participant } from '../types';

const EMOJIS = [
  '💯', '😁', '😅', '🤣', '😂', '🙂', '🙃', '🫠', '😉', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😋', '😛', '😜', '😝', '🤗', '🤭', '🫣', '🤫', '🤔', '🫡', '🙄', '🙂‍↔️', '🙂‍↕️', '🫩', '🥳', '🥺', '🥹', '😢', '😭', '😡',
  '💖', '💞', '💕', '❣️', '❤️‍🔥', '❤️', '🩷', '💛', '💚', '🩵', '💜', '🖤', '🤍',
  '💬', '👋', '👌', '🤞', '👉', '👇', '🫵', '👍', '👏', '🙌', '🫶', '🤝', '🙏', '💪', '👀', '🫂',
  '🥀', '☕', '🚨', '☀️', '⭐', '❄️', '🔥', '🎄', '✨', '🎉', '🎁', '🎯', '🎶', '🎬', '💡', '📝', '📅', '📍', '⚠️',
  '⬆️', '➡️', '⬇️', '❓', '❗', '⚕️', '✅', '☑️', '✔️', '❌', '0️⃣', '🔴', '🔵'
];

const StudentJoin: React.FC = () => {
  const { joinCode } = useParams<{ joinCode: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(socket.isConnected());
  const [error, setError] = useState<string | null>(null);

  const searchSession = () => {
    if (!joinCode) return;
    setIsLoading(true);
    setError(null);
    socket.emit('session:find', joinCode.toUpperCase());

    setTimeout(() => {
      setIsLoading(prev => {
        if (prev) {
          setError("Délai d'attente dépassé. Vérifiez votre connexion Wi-Fi.");
          return false;
        }
        return prev;
      });
    }, 5000);
  };

  useEffect(() => {
    const checkConnection = setInterval(() => {
      setSocketConnected(socket.isConnected());
    }, 1000);

    searchSession();

    const onFound = (foundSession: Session) => {
      setSession(foundSession);
      setIsLoading(false);
    };

    const onNotFound = (msg: string) => {
      setError(msg);
      setIsLoading(false);
    };

    socket.on('session:found', onFound);
    socket.on('session:not_found', onNotFound);

    return () => {
      socket.off('session:found', onFound);
      socket.off('session:not_found', onNotFound);
      clearInterval(checkConnection);
    };
  }, [joinCode]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !session) return;

    const participant: Participant = {
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      score: 0,
      isConnected: true
    };

    sessionStorage.setItem('student_identity', JSON.stringify(participant));
    socket.emit('session:join', { sessionId: session.id, participant });
    navigate(`/play/${session.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 w-12 h-12 mb-4 mx-auto" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">
            {!socketConnected ? "Connexion au serveur..." : "Recherche de la session..."}
          </p>
          {!socketConnected && <p className="text-red-500 text-[10px] font-mono">En attente du WebSocket...</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-sm text-center border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-black mb-4 text-slate-800">OUPS !</h1>
          <p className="text-slate-500 mb-8 font-medium text-sm">{error}</p>
          <div className="space-y-3">
            <button onClick={searchSession} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-lg transition-colors shadow-sm shadow-blue-600/30">RÉESSAYER</button>
            <button onClick={() => navigate('/')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-3 rounded-lg transition-colors">ACCUEIL</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-[90%] flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-sm animate-in zoom-in duration-300 border border-gray-200 relative overflow-hidden">

          <button
            onClick={() => navigate('/')}
            className="relative flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white transition-colors font-bold text-lg mb-6 z-10 px-4 py-2 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" /> Accueil
          </button>
          <div className="text-center mb-8 relative z-10">
            <div className="bg-blue-50 p-4 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <User className="text-[#235784] w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-[#235784] tracking-tight mb-2">QUI C'EST ?</h1>
            {/* <p className="text-gray-500 text-xs flex items-center justify-center gap-2 font-bold bg-gray-50 py-2 px-4 rounded-lg mx-auto w-fit">
              <Wifi className="w-3 h-3 text-[#40a8c4]" /> Connecté au lobby
            </p> */}
          </div>
          <form onSubmit={handleJoin} className="space-y-5 relative z-10">
            <div className="space-y-2">
              <label className="text-[#235784] font-black text-xs uppercase tracking-widest ml-3">Ton Pseudo</label>
              <input
                autoFocus
                type="text"
                placeholder="Ex: TheKing_99"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#40a8c4] focus:ring-2 focus:ring-[#40a8c4]/20 outline-none text-lg font-black text-[#235784] placeholder:text-gray-300 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={15}
                required
              />
            </div>

            <div className="bg-blue-50/50 p-4 rounded-lg flex justify-between items-center border border-blue-100">
              <span className="text-xs font-black text-[#235784]/60 uppercase tracking-widest">CODE SESSION</span>
              <span className="font-mono font-black text-[#235784] text-xl tracking-wider">{joinCode}</span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#235784] hover:bg-[#1a4263] text-white font-black py-3 rounded-lg shadow-sm shadow-[#235784]/20 active:scale-95 flex items-center justify-center gap-3 transition-all text-base border-b border-[#153450]"
            >
              REJOINDRE <ArrowRight />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentJoin;
