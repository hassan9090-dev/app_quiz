import { BarChart3, Play, Settings, Users, Wifi, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from "recharts";
import QRCodeComponent from "../components/QRCodeComponent";
import { COLORS } from "../constants";
import { socket } from "../services/socket";
import { QuestionType, Quiz, Session, SessionStatus } from "../types";

interface TeacherSessionProps {
  quizzes: Quiz[];
}

const ScalableImage: React.FC<{ src: string }> = ({ src }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div
        className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center max-h-[50vh] w-full p-4 cursor-zoom-in"
        onClick={() => setIsExpanded(true)}
      >
        <img
          src={src}
          alt=""
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.currentTarget;
            // Si l'image est petite (<150px), on double sa taille d'affichage
            if (naturalWidth < 150 && naturalHeight < 150) {
              setStyle({ width: naturalWidth * 2, height: naturalHeight * 2 });
            }
          }}
          className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-none"
          style={style}
        />
      </div>

      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
        >
          <img
            src={src}
            alt="Full screen"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
};

const TeacherSession: React.FC<TeacherSessionProps> = ({ quizzes }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hostIp, setHostIp] = useState(window.location.hostname || "localhost");

  // Retrieve quiz from the session state or finding it in props if session has quizId
  const quiz = useMemo(() => {
    if (!session) return null;
    if (session.quiz) return session.quiz;
    return quizzes.find(q => q.id === session.quizId);
  }, [session, quizzes]);

  useEffect(() => {
    // Rely on server state
    socket.emit("session:host_join", sessionId);
    socket.emit("server:request_info");

    const handleSync = (updatedSession: Session) => {
      if (updatedSession.id === sessionId) {
        setSession(updatedSession);
      }
    };

    const handleServerInfo = (data: { ip: string }) => {
      setHostIp(data.ip);
    };

    const handleConnect = () => {
      socket.emit("session:host_join", sessionId);
    };

    const handleNotFound = () => {
      // If session not found on server, go back
      navigate("/teacher");
    };

    socket.on("sync:state", handleSync);
    socket.on("server:info", handleServerInfo);
    socket.on("connect", handleConnect);
    socket.on("session:not_found", handleNotFound);

    if (socket.isConnected()) {
      socket.emit("session:host_join", sessionId);
    }

    const interval = setInterval(() => setIsConnected(socket.isConnected()), 2000);

    return () => {
      socket.off("sync:state", handleSync);
      socket.off("server:info", handleServerInfo);
      socket.off("session:not_found", handleNotFound);
      clearInterval(interval);
    };
  }, [sessionId, navigate]);

  const currentQuestion = session && quiz ? quiz.questions[session.currentQuestionIndex] : null;

  const updateSessionOnServer = (updates: Partial<Session>) => {
    if (!session) return;
    const newSession = { ...session, ...updates };
    console.log("TeacherSession emitting session:update:", newSession);
    socket.emit("session:update", newSession);
  };

  const handleStart = () => {
    console.log("TeacherSession handleStart called");
    updateSessionOnServer({ status: SessionStatus.QUESTION });
  };
  const handleReveal = () => updateSessionOnServer({ status: SessionStatus.REVEAL });
  const handleNext = () => {
    if (!session || !quiz) return;
    if (session.currentQuestionIndex < quiz.questions.length - 1) {
      updateSessionOnServer({
        currentQuestionIndex: session.currentQuestionIndex + 1,
        status: SessionStatus.QUESTION,
      });
    } else {
      updateSessionOnServer({ status: SessionStatus.FINISHED });
      navigate(`/teacher/session/${sessionId}/recap`);
    }
  };

  const stats = useMemo(() => {
    if (!session || !currentQuestion) return [];
    // Seulement calculer les stats pour les questions avec choices
    if (!currentQuestion.choices) return [];
    return currentQuestion.choices.map((_, i) => ({
      name: String.fromCharCode(65 + i),
      count: session.answers.filter(a =>
        a.questionIndex === session.currentQuestionIndex && a.choiceIndex === i
      ).length,
      isCorrect: i === currentQuestion.correctChoiceIndex,
    }));
  }, [session, currentQuestion]);

  const currentAnswers = useMemo(() => {
    if (!session) return [];
    return session.answers.filter(a => a.questionIndex === session.currentQuestionIndex);
  }, [session]);

  if (!session || !quiz) {
    return (
      <div className="p-12 text-center text-slate-600 bg-slate-50 min-h-screen flex items-center justify-center">
        Connexion au serveur...
      </div>
    );
  }

  const joinUrl = `http://${hostIp}:${window.location.port || "3000"}/#/join/${session.joinCode}`;


  // ... (imports)

  // ... (logic)

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center font-sans">
      <div className="w-[90%] min-h-screen bg-gray-100 text-[#235784] flex flex-col relative shadow-xl">
        <header className="px-6 py-4 border-b border-gray-200 grid grid-cols-3 items-center bg-[#235784] sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3 justify-self-start min-w-0 max-w-full">
            <div className="bg-blue-500 p-2 rounded-xl shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-white tracking-tight truncate">{quiz.title}</h1>
              <p className="text-xs text-white/70 flex items-center gap-2 font-medium">
                Code:{" "}
                <span className="text-white font-mono font-black text-sm bg-white/20 px-2 py-0.5 rounded">
                  {session.joinCode}
                </span>
                <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
              </p>
            </div>
          </div>

          <div className="flex justify-center items-center justify-self-center w-full">
          </div>

          <div className="flex items-center gap-6 justify-self-end">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full border border-white/30">
              <Users className="w-4 h-4 text-white" />
              <span className="font-bold text-sm text-white">{session.participants.length} Élèves</span>
            </div>
            <button
              onClick={() => window.confirm("Quitter ?") && navigate("/teacher")}
              className="text-white/50 hover:bg-red-600 hover:text-white p-1 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto flex flex-col p-6 max-w-7xl mx-auto w-full pb-24">
          {session.status === SessionStatus.LOBBY
            ? (
              <div className="flex-1 grid lg:grid-cols-2 gap-8 items-center h-full">
                {/* Left Column: QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div className="mb-8 p-8 bg-white rounded-[2.5rem] border border-gray-200 w-full max-w-md shadow-xl shadow-[#235784]/5 animate-in zoom-in duration-500 relative overflow-hidden">
                    <div className="absolute top-0 w-full h-2 bg-[#235784]"></div>
                    <h2 className="text-2xl font-black mb-6 italic text-[#235784] tracking-tight text-center">
                      Rejoindre un live
                    </h2>
                    <div className="mb-8 flex justify-center">
                      <QRCodeComponent value={joinUrl} size={250} />
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-2 text-center">
                      <p className="text-5xl font-mono font-black tracking-[0.2em] text-[#235784]">
                        {session.joinCode}
                      </p>
                    </div>
                    <div className="text-[0.8em] text-blue-600 mt-4 flex flex-col items-center justify-center gap-2">
                      <div
                        className="flex items-center gap-2 uppercase font-black tracking-widest"
                      >
                        <Wifi className="w-4 h-4" /> IP Local : {hostIp}
                      </div>

                    </div>

                  </div>
                </div>

                {/* Right Column: Students & Start */}
                <div className="flex flex-col items-center h-full">
                  <div className="w-full max-w-xl bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-xl shadow-[#235784]/5 flex flex-col h-[560px]">
                    <h3 className="text-xl font-bold mb-6 text-gray-400 flex items-center gap-2 border-b border-gray-100 pb-4">
                      <Users className="w-6 h-6 text-[#235784]" />
                      <span className="text-[#235784]">Salle d'attente</span>
                      <span className="ml-auto bg-blue-50 text-[#235784] px-3 py-1 rounded-full text-sm font-black">
                        {session.participants.length}
                      </span>
                    </h3>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                      {session.participants.length === 0
                        ? (
                          <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                            <Users className="w-16 h-16 opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-sm text-center">
                              En attente des élèves ...
                            </p>
                          </div>
                        )
                        : (
                          <div className="grid grid-cols-2 gap-3">
                            {session.participants.map(p => (
                              <div
                                key={p.id}
                                className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-sm font-bold flex items-center gap-3 animate-in fade-in zoom-in text-[#235784]"
                              >
                                <span className="text-xl">{p.emoji}</span> {p.name}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="flex justify-center items-center justify-self-center w-full mt-4">
                      {session.status === SessionStatus.LOBBY && (
                        <button
                          onClick={handleStart}
                          disabled={session.participants.length === 0}
                          className="bg-[#235784] hover:bg-[#1a4263] disabled:opacity-50 disabled:bg-gray-400 disabled:border-gray-500 disabled:cursor-not-allowed disabled:shadow-none text-white font-black px-8 py-3 rounded-2xl shadow-xl shadow-[#235784]/20 flex items-center gap-3 transition-all active:scale-95 disabled:active:scale-100 border-b-4 border-[#153450] text-sm whitespace-nowrap"
                        >
                          <Play className="w-4 h-4 fill-current" /> DÉMARRER LE QUIZ
                        </button>
                      )}
                    </div>


                  </div>

                  {/* <div className="mt-8 w-full max-w-xl text-center text-gray-400 text-sm font-medium italic">
                    En attente du lancement...
                  </div> */}

                </div>
              </div>
            )
            : (
              <div className="flex-1 grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white p-8 pt-14 rounded-[2rem] border border-gray-200 shadow-xl shadow-[#235784]/5 h-full flex flex-col">
                    <span className="bg-blue-50 text-[#235784] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block w-fit">
                      Q{session.currentQuestionIndex + 1}
                    </span>
                    <h2 className="text-3xl font-black leading-tight mb-8 text-[#235784]">{currentQuestion?.text}</h2>

                    {currentQuestion?.images && currentQuestion.images.length > 0 && (
                      <div
                        className={`grid gap-4 mb-8 ${currentQuestion.images.length === 2 ? "grid-cols-2" : "grid-cols-1"
                          }`}
                      >
                        {currentQuestion.images.map((img, idx) => <ScalableImage key={idx} src={img} />)}
                      </div>
                    )}

                    <div className="grid gap-3 mt-auto">
                      {currentQuestion?.type === QuestionType.MATCHING
                        ? (
                          // MATCHING - Afficher les appariements
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-gray-500 mb-3">Liaisons correctes :</p>
                            {currentQuestion.leftItems?.map((left, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold text-[#235784]"
                              >
                                {left} →{" "}
                                {currentQuestion.rightItems
                                  ?.[currentQuestion.correctMatches?.find(m => m.left === i)?.right || 0]}
                              </div>
                            ))}
                          </div>
                        )
                        : currentQuestion?.type === QuestionType.MULTIPLE_CHOICE
                          ? (
                            // MULTIPLE_CHOICE - Afficher les choix avec cases à cocher
                            currentQuestion.choices?.map((choice, i) => (
                              <div
                                key={i}
                                className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-colors ${currentQuestion.correctChoiceIndexes?.includes(i)
                                  && session.status === SessionStatus.REVEAL
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-gray-100 bg-gray-50"
                                  }`}
                              >
                                <span
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${currentQuestion.correctChoiceIndexes?.includes(i)
                                    && session.status === SessionStatus.REVEAL
                                    ? "bg-emerald-500 text-white"
                                    : "bg-white border border-gray-200 text-gray-400"
                                    }`}
                                >
                                  ✓
                                </span>
                                <span className="font-bold text-xl text-[#235784]">{choice.text}</span>
                              </div>
                            ))
                          )
                          : currentQuestion?.type === QuestionType.DRAG_DROP
                            ? (
                              // DRAG_DROP - Afficher les appariements éléments-zones
                              <div className="space-y-2">
                                <p className="text-sm font-bold text-gray-500 mb-3">Placements corrects :</p>
                                {currentQuestion.draggableItems?.map((item, i) => {
                                  const placement = currentQuestion.correctPlacements?.find(p => p.item === i);
                                  return (
                                    <div
                                      key={i}
                                      className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold text-[#235784]"
                                    >
                                      {item} → {currentQuestion.dropZones?.[placement?.zone || 0]}
                                    </div>
                                  );
                                })}
                              </div>
                            )
                            : currentQuestion?.type === QuestionType.CATEGORIZATION
                              ? (
                                // CATEGORIZATION - Afficher les catégorisations
                                <div className="space-y-2">
                                  <p className="text-sm font-bold text-gray-500 mb-3">Catégorisations correctes :</p>
                                  {currentQuestion.items?.map((item, i) => {
                                    const cat = currentQuestion.correctCategories?.find(c => c.item === i);
                                    return (
                                      <div
                                        key={i}
                                        className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold text-[#235784]"
                                      >
                                        {item} → {currentQuestion.categories?.[cat?.zone || 0]}
                                      </div>
                                    );
                                  })}
                                </div>
                              )
                              : currentQuestion?.type === QuestionType.IMAGE_LABELING
                                ? (
                                  // IMAGE_LABELING - Afficher l'image et les étiquettes
                                  <div className="space-y-3">
                                    {currentQuestion.images && currentQuestion.images.length > 0 && (
                                      <div className="relative bg-gray-100 rounded-2xl overflow-hidden h-64 flex justify-center">
                                        <div className="relative h-full flex-shrink-0">
                                          <img
                                            src={currentQuestion.images[0]}
                                            alt="Labeling"
                                            className="h-full w-auto object-contain"
                                          />
                                          {currentQuestion.labels?.map((label, idx) => (
                                            <div
                                              key={idx}
                                              className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                                              style={{ left: `${label.x}%`, top: `${label.y}%` }}
                                              title={label.text}
                                            >
                                              {idx + 1}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    <p className="text-xs text-gray-500">
                                      Étiquettes : {currentQuestion.labels?.map((l, i) => `${i + 1}. ${l.text}`).join(", ")}
                                    </p>
                                  </div>
                                )
                                : (
                                  // SINGLE_CHOICE ou TRUE_FALSE - Afficher les choix normalement
                                  currentQuestion?.choices?.map((choice, i) => (
                                    <div
                                      key={i}
                                      className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-colors ${i === currentQuestion.correctChoiceIndex && session.status === SessionStatus.REVEAL
                                        ? "border-emerald-500 bg-emerald-50"
                                        : "border-gray-100 bg-gray-50"
                                        }`}
                                    >
                                      <span
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${i === currentQuestion.correctChoiceIndex && session.status === SessionStatus.REVEAL
                                          ? "bg-emerald-500 text-white"
                                          : "bg-white border border-gray-200 text-gray-400"
                                          }`}
                                      >
                                        {String.fromCharCode(65 + i)}
                                      </span>
                                      <span className="font-bold text-xl text-[#235784]">{choice.text}</span>
                                    </div>
                                  ))
                                )}
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/*  graphique reponses */}
                  {/* <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-xl shadow-[#235784]/5">
                    <h3 className="text-xl font-black flex items-center gap-3 mb-8 text-[#235784]">
                      <BarChart3 className="w-6 h-6 text-[#40a8c4]" />{" "}
                      RÉPONSES ({currentAnswers.length}/{session.participants.length})
                    </h3>
                    {currentQuestion?.choices
                      ? (
                        session.status === SessionStatus.REVEAL
                          ? (
                            <div className="h-[250px] w-full animate-in zoom-in duration-500">
                              <ResponsiveContainer>
                                <BarChart data={stats}>
                                  <XAxis dataKey="name" stroke="#94a3b8" />
                                  <Bar dataKey="count" radius={[12, 12, 0, 0]}>
                                    {stats.map((e, i) => (
                                      <Cell key={i} fill={e.isCorrect ? "#10b981" : COLORS[i % COLORS.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )
                          : (
                            <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-400 font-bold italic">
                              Graphique masqué
                            </div>
                          )
                      )
                      : (
                        <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-400 font-bold italic">
                          Pas de graphique pour ce type de question
                        </div>
                      )}
                  </div> */}
                  <div className="bg-white p-8 rounded-[2rem] border border-gray-200 flex-1 overflow-hidden flex flex-col shadow-xl shadow-[#235784]/5">
                    <h3 className="text-xl font-black mb-6 text-[#235784]">DÉTAIL PAR ÉLÈVE</h3>
                    <div className="overflow-y-auto space-y-2 custom-scrollbar pr-2">
                      {session.participants.map(p => {
                        const ans = session.answers.find(a =>
                          a.participantId === p.id && a.questionIndex === session.currentQuestionIndex
                        );
                        return (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{p.emoji}</span>
                              <span className="font-bold text-[#235784]">{p.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {ans && (
                                <span className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-black text-[#235784] text-sm">
                                  {String.fromCharCode(65 + ans.choiceIndex)}
                                </span>
                              )}
                              {session.status === SessionStatus.REVEAL && ans
                                ? (
                                  ans.isCorrect
                                    ? (
                                      <span className="text-emerald-600 font-black text-[10px] tracking-wider">
                                        CORRECT
                                      </span>
                                    )
                                    : <span className="text-red-500 font-black text-[10px] tracking-wider">FAUX</span>
                                )
                                : !ans
                                  ? <span className="text-gray-400 text-xs italic">En attente...</span>
                                  : <span className="text-[#40a8c4] font-black text-[10px] tracking-wider">VALIDE</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </main>

        {session.status !== SessionStatus.LOBBY && (
          <div className="sticky bottom-0 w-full p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-30">
            <div className="max-w-4xl mx-auto flex justify-center gap-6">
              {session.status === SessionStatus.QUESTION
                ? (
                  <button
                    onClick={handleReveal}
                    className="bg-[#4682B4] hover:bg-[#36648B] text-white font-black text-lg px-12 py-4 rounded-lg shadow-sm shadow-[#4682B4]/30 transition-all active:scale-95 border-b border-[#2C475C]"
                  >
                    RÉSULTATS
                  </button>
                )
                : (
                  <button
                    onClick={handleNext}
                    className="bg-[#4682B4] hover:bg-[#36648B] text-white font-black text-lg px-12 py-4 rounded-lg shadow-sm shadow-[#4682B4]/30 transition-all active:scale-95 border-b border-[#2C475C]"
                  >
                    {session.currentQuestionIndex < (quiz.questions.length - 1) ? "SUIVANT" : "VOIR LE CLASSEMENT"}
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSession;
