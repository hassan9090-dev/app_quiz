
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateQuiz from './pages/CreateQuiz';
import TeacherSession from './pages/TeacherSession';
import StudentJoin from './pages/StudentJoin';
import StudentPlay from './pages/StudentPlay';
import TeacherLogin from './pages/TeacherLogin';
import ProtectedTeacherRoute from './components/ProtectedTeacherRoute';
import SessionRecap from './pages/SessionRecap';
import { socket } from './services/socket';
import { dbService } from './services/db';
import { Quiz } from './types';
import { EXAMPLE_QUIZ } from './constants';

// Wrapper component for edit route to handle quizId parameter
const EditQuizWrapper: React.FC<{ quizzes: Quiz[], updateQuiz: (quiz: Quiz) => void }> = ({ quizzes, updateQuiz }) => {
  const quizId = window.location.hash.split('/').pop();
  const quiz = quizzes.find(q => q.id === quizId);
  return <CreateQuiz onSave={updateQuiz} existingQuiz={quiz} />;
};

const App: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const loadQuizzes = async () => {
      const list = await dbService.getAllQuizzes();
      if (list.length === 0) {
        // Optionnel: charger un quiz d'exemple s'il n'y a rien
        await dbService.saveQuiz(EXAMPLE_QUIZ);
        setQuizzes([EXAMPLE_QUIZ]);
      } else {
        setQuizzes(list);
      }
    };

    loadQuizzes();
  }, []);

  const addQuiz = async (quiz: Quiz) => {
    await dbService.saveQuiz(quiz);
    setQuizzes(await dbService.getAllQuizzes());
  };

  const deleteQuiz = async (id: string) => {
    await dbService.deleteQuiz(id);
    setQuizzes(await dbService.getAllQuizzes());
  };

  const updateQuiz = async (quiz: Quiz) => {
    await dbService.saveQuiz(quiz);
    setQuizzes(await dbService.getAllQuizzes());
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-900 text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />

          <Route element={<ProtectedTeacherRoute />}>
            <Route
              path="/teacher"
              element={<TeacherDashboard quizzes={quizzes} deleteQuiz={deleteQuiz} saveQuiz={addQuiz} />}
            />
            <Route
              path="/teacher/quiz/new"
              element={<CreateQuiz onSave={addQuiz} />}
            />
            <Route
              path="/teacher/quiz/edit/:quizId"
              element={<EditQuizWrapper quizzes={quizzes} updateQuiz={updateQuiz} />}
            />
            <Route
              path="/teacher/session/:sessionId"
              element={<TeacherSession quizzes={quizzes} />}
            />
            <Route
              path="/teacher/session/:sessionId/recap"
              element={<SessionRecap quizzes={quizzes} />}
            />
          </Route>

          <Route path="/join/:joinCode" element={<StudentJoin />} />
          <Route path="/play/:sessionId" element={<StudentPlay />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
