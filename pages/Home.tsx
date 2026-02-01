
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, UserRoundCog, User, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      navigate(`/join/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center font-sans">
      <div className="w-[90%] mx-auto px-4 py-8 flex flex-col items-center text-center">
        <div className="mb-6 animate-in fade-in zoom-in duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-[#0000FF] to-[#0000CD] rounded-lg mb-4 shadow-sm">
            <UserRoundCog className="text-white w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0000FF] mb-4">
            Quiz Live
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Teacher Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center transform hover:shadow-md hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 cursor-pointer" onClick={() => navigate('/teacher')}>
            <div className="p-3 bg-[#40a8c4] rounded-lg mb-6 border border-white/20">
              <GraduationCap className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-4 text-[#235784] tracking-tight">Espace Prof</h2>
            <p className="text-gray-600 text-center mb-6 font-medium text-sm leading-relaxed">
              Créez des quiz épiques et défiez vos élèves en temps réel.
            </p>
            <button
              onClick={() => navigate('/teacher')}
              className="w-full bg-[#235784] hover:bg-[#1a4263] text-white font-black py-3 rounded-lg transition-all shadow-sm shadow-[#235784]/20 active:scale-95 flex items-center justify-center gap-3 text-base border-b border-[#153450]"
            >
              Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          {/* Student Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center transform hover:shadow-md hover:bg-blue-50 hover:border-blue-300 transition-all duration-300">
            <div className="p-3 bg-[#40a8c4] rounded-lg mb-6 border border-white/20">
              <User className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-4 text-[#235784] tracking-tight">Espace Élève</h2>
            <form onSubmit={handleJoin} className="w-full space-y-3">
              <input
                type="text"
                placeholder="Code session Quiz"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#40a8c4]/30 focus:border-[#40a8c4] outline-none transition-all text-center font-black text-lg uppercase text-[#235784] placeholder:text-gray-400 tracking-wider"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-[#235784] hover:bg-[#1a4263] text-white font-black py-3 rounded-lg transition-all shadow-sm shadow-[#235784]/20 active:scale-95 flex items-center justify-center gap-3 text-base border-b border-[#153450]"
              >
                Rejoindre <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <footer className="mt-16 text-[#0000FF] text-[1em] font-bold text-center">
          &copy; 2026 - Bougrine hassan - Prof informatique - Lycée ibn khldoun Safi - Tél : 0666645806
        </footer>
      </div>
    </div>
  );
};

export default Home;
