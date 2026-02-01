
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ChevronLeft, GraduationCap } from 'lucide-react';

const TeacherLogin: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin@123') {
            localStorage.setItem('quizmaster_teacher_auth', 'true');
            navigate('/teacher');
        } else {
            setError(true);
            setPassword('');
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center font-sans">
            <div className="w-[90%] mx-auto">
                <header className="px-6 py-4 border-b border-gray-200 grid grid-cols-3 items-center bg-[#235784] sticky top-0 z-20 shadow-sm mb-8">
                    {/* Left: Title */}
                    <div className="flex items-center gap-3 justify-self-start">
                        <h1 className="text-2xl font-black text-white tracking-tight">Connexion</h1>
                    </div>

                    {/* Center: Empty */}
                    <div className="flex justify-center items-center">
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex gap-3 justify-self-end">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white transition-colors font-bold px-4 py-2 rounded-lg whitespace-nowrap"
                            title="Retour à l'accueil"
                        >
                            <ChevronLeft className="w-5 h-5" /> Accueil
                        </button>
                    </div>
                </header>

                <div className="flex flex-col items-center justify-center pt-20">

                    <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <Lock className="w-8 h-8 text-[#235784]" />
                        </div>

                        <h1 className="text-2xl font-black text-[#235784] mb-2 tracking-tight">Espace Professeur</h1>
                        <p className="text-gray-500 mb-6 font-medium text-sm">Veuillez entrer le mot de passe.</p>

                        <form onSubmit={handleLogin} className="w-full space-y-4">
                            <div className="space-y-2">
                                <input
                                    autoFocus
                                    type="password"
                                    placeholder="Mot de passe"
                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg outline-none text-base font-bold text-[#235784] placeholder:text-gray-400 transition-all ${error ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:border-[#40a8c4] focus:ring-2 focus:ring-[#40a8c4]/20'}`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {error && <p className="text-red-500 text-xs font-bold pl-2 animate-pulse">Mot de passe incorrect</p>}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#235784] hover:bg-[#1a4263] text-white font-black py-3 rounded-lg transition-all shadow-sm shadow-[#235784]/20 active:scale-95 flex items-center justify-center gap-3 text-base border-b border-[#153450]"
                            >
                                Se connecter <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TeacherLogin;
