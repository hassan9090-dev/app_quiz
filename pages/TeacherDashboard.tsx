
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Trash2, Calendar, BookOpen, X, Edit2, Download, Upload } from 'lucide-react';
import { Quiz } from '../types';
import { socket } from '../services/socket';

interface TeacherDashboardProps {
  quizzes: Quiz[];
  deleteQuiz: (id: string) => void;
  saveQuiz: (quiz: Quiz) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ quizzes, deleteQuiz, saveQuiz }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export single quiz to JSON
  const handleExportQuiz = (quiz: Quiz) => {
    const dataStr = JSON.stringify(quiz, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quiz.title.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export all quizzes to JSON
  const handleExportAll = () => {
    if (quizzes.length === 0) {
      alert('Aucun quiz à exporter.');
      return;
    }
    const dataStr = JSON.stringify(quizzes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all_quizzes_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import quiz(zes) from JSON
  const handleImportQuiz = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);

        // Handle both single quiz and array of quizzes
        const quizzesToImport = Array.isArray(imported) ? imported : [imported];

        quizzesToImport.forEach((quiz: Quiz) => {
          // Generate new ID to avoid conflicts
          const newQuiz = {
            ...quiz,
            id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now()
          };
          saveQuiz(newQuiz);
        });

        alert(`${quizzesToImport.length} quiz(zes) importé(s) avec succès!`);
      } catch (error) {
        alert('Erreur lors de l\'importation. Fichier JSON invalide.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };


  // ... (inside component)

  const handleStartSession = (quizId: string) => {
    const sessionId = `sess-${Math.random().toString(36).substr(2, 9)}`;
    const joinCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    const quiz = quizzes.find(q => q.id === quizId);

    if (!quiz) return;

    // Create initial session object
    const sessionData = {
      id: sessionId,
      quizId,
      joinCode,
      status: 'LOBBY',
      currentQuestionIndex: 0,
      participants: [],
      answers: [],
      createdAt: Date.now()
    };

    // Create session on server immediately
    socket.emit('session:create', { session: sessionData, quiz });

    // Navigate
    navigate(`/teacher/session/${sessionId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('quizmaster_teacher_auth');
    navigate('/');
  };

  // ... (imports remain same)

  // ... (logic remains same)

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center font-sans">
      <div className="w-[90%] mx-auto">
        <header className="px-6 py-4 border-b border-gray-200 grid grid-cols-3 items-center bg-[#235784] sticky top-0 z-20 shadow-sm mb-8">
          {/* Left: Title */}
          <div className="flex items-center gap-3 justify-self-start">
            <h1 className="text-2xl font-black text-white tracking-tight">Gestion des quiz</h1>
          </div>

          {/* Center: Empty */}
          <div className="flex justify-center items-center">
          </div>

          {/* Right: Action Buttons */}
          <div className="flex gap-3 justify-self-end">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm shadow-green-600/20 active:scale-95 whitespace-nowrap"
              title="Importer un quiz JSON"
            >
              <Download className="w-5 h-5" /> Importer
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportQuiz}
            />
            <button
              onClick={handleExportAll}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm shadow-orange-600/20 active:scale-95 whitespace-nowrap"
              title="Exporter tous les quiz"
              disabled={quizzes.length === 0}
            >
              <Upload className="w-5 h-5" /> Exporter Tous
            </button>
            <button
              onClick={() => navigate('/teacher/quiz/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm shadow-blue-600/20 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-6 h-6" /> Créer un Quiz
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center bg-white/20 hover:bg-red-600 text-white transition-all font-bold p-2 rounded-lg whitespace-nowrap border border-white/30"
              title="Quitter la session"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="px-4 py-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.length === 0 ? (
              <div className="col-span-full py-24 bg-white rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <BookOpen className="w-12 h-12 opacity-50" />
                </div>
                <p className="text-lg font-bold">Vous n'avez pas encore de quiz.</p>
                <p className="text-sm mt-2 opacity-60">Commencez par en créer un !</p>
              </div>
            ) : (
              quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:border-[#40a8c4] hover:shadow-sm hover:shadow-[#235784]/10 transition-all group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-[#40a8c4] group-hover:text-white transition-colors">
                      <BookOpen className="text-[#235784] group-hover:text-white w-6 h-6 transition-colors" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExportQuiz(quiz)}
                        className="text-gray-300 hover:text-green-500 transition-colors p-2 hover:bg-green-50 rounded-lg"
                        title="Exporter ce quiz en JSON"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/teacher/quiz/edit/${quiz.id}`)}
                        className="text-gray-300 hover:text-blue-500 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                        title="Éditer ce quiz"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible.')) {
                            deleteQuiz(quiz.id);
                          }
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Supprimer ce quiz"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#235784] mb-2 tracking-tight">{quiz.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-6 h-10 font-medium leading-relaxed">
                    {quiz.description || "Aucune description."}
                  </p>

                  <div className="flex items-center gap-4 mb-8 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg">
                      <Plus className="w-3 h-3 rotate-45" /> {quiz.questions.length} questions
                    </span>
                    <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg">
                      <Calendar className="w-3 h-3" /> {new Date(quiz.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={() => handleStartSession(quiz.id)}
                      className="w-full bg-[#235784] hover:bg-[#1a4263] text-white font-black py-3 rounded-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm shadow-[#235784]/20 border-b border-[#153450]"
                    >
                      <Play className="w-4 h-4 fill-current" /> Lancer Live
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
