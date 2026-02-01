
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, Send, Trophy, AlertCircle, X } from 'lucide-react';
import { socket } from '../services/socket';
import { Session, SessionStatus, Participant, AnswerRecord, Quiz, QuestionType } from '../types';

const ScalableImage: React.FC<{ src: string }> = ({ src }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div
        className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm flex items-center justify-center max-h-[50vh] w-full p-4 cursor-zoom-in"
        onClick={() => setIsExpanded(true)}
      >
        <img
          src={src}
          alt=""
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.currentTarget;
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

const StudentPlay: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [identity, setIdentity] = useState<Participant | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastQuestionIndex, setLastQuestionIndex] = useState(-1);

  useEffect(() => {
    const stored = sessionStorage.getItem('student_identity');
    if (!stored) { navigate('/'); return; }
    setIdentity(JSON.parse(stored));

    const handleSync = (updatedSession: Session) => {
      console.log('StudentPlay sync:state received:', updatedSession);
      if (updatedSession.id === sessionId) {
        if (updatedSession.currentQuestionIndex !== lastQuestionIndex) {
          setSelectedChoice(null);
          setIsSubmitted(false);
          setLastQuestionIndex(updatedSession.currentQuestionIndex);
        }
        setSession(updatedSession);
      }
    };

    const handleFullState = (fullSession: Session) => {
      console.log('StudentPlay session:full_state received:', fullSession);
      if (fullSession.id === sessionId) {
        setSession(fullSession);
      }
    };

    socket.on('sync:state', handleSync);
    socket.on('session:full_state', handleFullState);

    if (sessionId) {
      console.log('StudentPlay requesting session:', sessionId);
      socket.emit('session:get_full', sessionId);
    }

    return () => {
      socket.off('sync:state', handleSync);
      socket.off('session:full_state', handleFullState);
    };
  }, [sessionId, navigate, lastQuestionIndex]);

  const quiz = useMemo(() => {
    return (session as any)?.quiz as Quiz | undefined;
  }, [session]);

  const handleSubmit = () => {
    if (selectedChoice === null || !session || !identity || isSubmitted || !quiz) return;
    const currentQuestion = quiz.questions[session.currentQuestionIndex];
    if (!currentQuestion) return;

    let isCorrect = false;

    if (currentQuestion.type === QuestionType.SINGLE_CHOICE || currentQuestion.type === QuestionType.TRUE_FALSE) {
      isCorrect = selectedChoice === currentQuestion.correctChoiceIndex;
    } else if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE) {
      const selectedArray = (selectedChoice as number[]) || [];
      const correctArray = currentQuestion.correctChoiceIndexes || [];
      isCorrect = selectedArray.length === correctArray.length &&
        selectedArray.every(i => correctArray.includes(i));
    } else if (currentQuestion.type === QuestionType.MATCHING) {
      const selectedObj = (selectedChoice as Record<number, number>) || {};
      const correctMatches = currentQuestion.correctMatches || [];
      isCorrect = correctMatches.every(m => selectedObj[m.left] === m.right);
    } else if (currentQuestion.type === QuestionType.DRAG_DROP) {
      const selectedObj = (selectedChoice as Record<number, number>) || {};
      const correctPlacements = currentQuestion.correctPlacements || [];
      isCorrect = correctPlacements.every(p => selectedObj[p.item] === p.zone);
    } else if (currentQuestion.type === QuestionType.CATEGORIZATION) {
      const selectedObj = (selectedChoice as Record<number, number>) || {};
      const correctCategories = currentQuestion.correctCategories || [];
      isCorrect = correctCategories.every(c => selectedObj[c.item] === c.zone);
    } else if (currentQuestion.type === QuestionType.IMAGE_LABELING) {
      const selectedObj = (selectedChoice as Record<number, string>) || {};
      const labels = currentQuestion.labels || [];
      isCorrect = labels.length > 0 && labels.every((label, idx) => selectedObj[idx] === label.text);
    }

    const answer: AnswerRecord = {
      participantId: identity.id,
      questionIndex: session.currentQuestionIndex,
      choiceIndex: typeof selectedChoice === 'number' ? selectedChoice : -1,
      isCorrect: isCorrect,
      timestamp: Date.now()
    };
    setIsSubmitted(true);
    socket.emit('answer:submit', { sessionId, answer });
  };

  if (!session || !identity || !quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-blue-600 font-black">
        <Loader2 className="animate-spin w-12 h-12 mb-4" />
        <p className="uppercase tracking-widest animate-pulse">Synchronisation live...</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[session.currentQuestionIndex];

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center font-sans">
      <div className="w-[90%] min-h-screen bg-white text-slate-800 flex flex-col relative shadow-xl">
        <header className="px-6 py-4 border-b border-gray-200 grid grid-cols-3 items-center bg-[#235784] sticky top-0 z-20 shadow-sm">
          {/* Left: Student Info */}
          <div className="flex items-center gap-3 justify-self-start min-w-0">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl shrink-0">
              {identity.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">Élève</p>
              <p className="font-black text-white truncate">{identity.name}</p>
            </div>
          </div>

          {/* Center: Question Number */}
          <div className="flex justify-center items-center">
            <div className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
              <span className="text-white font-black text-sm">
                Question {session.currentQuestionIndex + 1}/{quiz.questions.length}
              </span>
            </div>
          </div>

          {/* Right: Quit Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (window.confirm("Voulez-vous vraiment quitter le quiz ?")) {
                  navigate('/');
                }
              }}
              className="text-white/50 hover:bg-red-600 hover:text-white p-1 rounded-lg transition-all"
              title="Quitter"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col relative z-0">
          {session.status === SessionStatus.LOBBY && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
              <div className="bg-white p-8 rounded-xl border border-gray-200 mb-8 shadow-sm relative">
                <div className="absolute inset-0 bg-blue-50 rounded-[11px] animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-[#235784] animate-spin relative z-10" />
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-[#235784]">Le quiz va démarrer !</h2>
              <p className="text-[#235784]/70 font-bold max-w-xs text-base">Tiens-toi prêt !</p>
            </div>
          )}

          {session.status === SessionStatus.QUESTION && (
            <div className="flex-1 flex flex-col animate-in slide-in-from-bottom-8 overflow-y-auto pt-10 pb-24 custom-scrollbar px-4 md:px-8">
              <h2 className="text-2xl font-black mb-5 tracking-tight leading-tight text-[#235784] drop-shadow-sm">{currentQuestion.text}</h2>

              {currentQuestion.images && currentQuestion.images.length > 0 && currentQuestion.type !== QuestionType.IMAGE_LABELING && (
                <div className={`grid gap-3 mb-8 ${currentQuestion.images.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {currentQuestion.images.map((img, idx) => (
                    <ScalableImage key={idx} src={img} />
                  ))}
                </div>
              )}

              <div className="grid gap-2 flex-1">
                {currentQuestion.type === QuestionType.MULTIPLE_CHOICE ? (
                  currentQuestion.choices?.map((choice, i) => (
                    <button
                      key={i}
                      disabled={isSubmitted}
                      onClick={() => {
                        const current = (selectedChoice as number[]) || [];
                        if (current.includes(i)) {
                          setSelectedChoice(current.filter(x => x !== i));
                        } else {
                          setSelectedChoice([...current, i]);
                        }
                      }}
                      className={`group p-3 rounded-lg text-left font-black text-base border-b transition-all active:scale-95 active:border-b-0 active:translate-y-1 flex items-center gap-4 ${(selectedChoice as number[])?.includes(i) ? 'bg-[#FF8C00] border-[#FF8C00] text-white shadow-sm shadow-[#FF8C00]/20' : `bg-white border-gray-200 text-[#235784] ${isSubmitted ? 'opacity-50 grayscale' : 'hover:bg-blue-50 hover:border-[#40a8c4]'}`}`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-black text-sm transition-colors border ${(selectedChoice as number[])?.includes(i) ? 'bg-white border-white text-[#FF8C00]' : 'bg-gray-100 border-gray-300 text-gray-400 group-hover:bg-orange-100 group-hover:border-orange-400'}`}>
                        {(selectedChoice as number[])?.includes(i) ? '✓' : String.fromCharCode(65 + i)}
                      </div>
                      {choice.text}
                    </button>
                  ))
                ) : currentQuestion.type === QuestionType.MATCHING ? (
                  <div className="space-y-2">
                    {currentQuestion.leftItems?.map((item, i) => (
                      <div key={i} className="flex gap-2 items-center bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-black text-[#235784] min-w-[100px] text-sm">{item}</span>
                        <span className="text-gray-400">→</span>
                        <select
                          disabled={isSubmitted}
                          value={(selectedChoice as Record<number, number>)?.[i] ?? ''}
                          onChange={(e) => {
                            if (!isSubmitted) {
                              const current = (selectedChoice as Record<number, number>) || {};
                              setSelectedChoice({ ...current, [i]: parseInt(e.target.value) });
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg outline-none focus:border-blue-500 font-bold text-[#235784] text-sm"
                        >
                          <option value="">Sélectionner...</option>
                          {currentQuestion.rightItems?.map((_, idx) => (
                            <option key={idx} value={idx}>
                              {currentQuestion.rightItems?.[idx] || `Réponse ${idx + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                ) : currentQuestion.type === QuestionType.DRAG_DROP ? (
                  <div className="space-y-2">
                    {currentQuestion.draggableItems?.map((item, i) => (
                      <div key={i} className="flex gap-2 items-center bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-black text-[#235784] min-w-[100px] text-sm">{item}</span>
                        <span className="text-gray-400">→</span>
                        <select
                          disabled={isSubmitted}
                          value={(selectedChoice as Record<number, number>)?.[i] ?? ''}
                          onChange={(e) => {
                            if (!isSubmitted) {
                              const current = (selectedChoice as Record<number, number>) || {};
                              setSelectedChoice({ ...current, [i]: parseInt(e.target.value) });
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-cyan-50 border border-cyan-300 rounded-lg outline-none focus:border-cyan-500 font-bold text-[#235784] text-sm"
                        >
                          <option value="">Sélectionner zone...</option>
                          {currentQuestion.dropZones?.map((zone, idx) => (
                            <option key={idx} value={idx}>
                              {zone || `Zone ${idx + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                ) : currentQuestion.type === QuestionType.CATEGORIZATION ? (
                  <div className="space-y-2">
                    {currentQuestion.items?.map((item, i) => (
                      <div key={i} className="flex gap-2 items-center bg-white p-3 rounded-lg border border-gray-200">
                        <span className="font-black text-[#235784] min-w-[120px] text-sm">{item}</span>
                        <span className="text-gray-400">→</span>
                        <select
                          disabled={isSubmitted}
                          value={(selectedChoice as Record<number, number>)?.[i] ?? ''}
                          onChange={(e) => {
                            if (!isSubmitted) {
                              const current = (selectedChoice as Record<number, number>) || {};
                              setSelectedChoice({ ...current, [i]: parseInt(e.target.value) });
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-pink-50 border border-pink-300 rounded-lg outline-none focus:border-pink-500 font-bold text-[#235784] text-sm"
                        >
                          <option value="">Catégorie...</option>
                          {currentQuestion.categories?.map((cat, idx) => (
                            <option key={idx} value={idx}>
                              {cat || `Catégorie ${idx + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                ) : currentQuestion.type === QuestionType.IMAGE_LABELING ? (
                  <div className="flex flex-col items-center gap-4 flex-1">
                    {currentQuestion.images && currentQuestion.images.length > 0 && (
                      <div className="relative bg-white rounded-xl overflow-hidden border border-gray-200 w-full h-96 flex justify-center">
                        <div className="relative h-full flex-shrink-0">
                          <img
                            src={currentQuestion.images[0]}
                            alt="Image à étiqueter"
                            className="h-full w-auto object-contain"
                          />
                          {currentQuestion.labels?.map((label, idx) => {
                            const isSelected = (selectedChoice as Record<number, string>)?.[idx] !== undefined;
                            return (
                              <div
                                key={idx}
                                className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-sm flex items-center justify-center text-white text-xs font-bold transition-all ${isSelected ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ left: `${label.x}%`, top: `${label.y}%` }}
                              >
                                {idx + 1}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="w-full space-y-2">
                      <p className="font-black text-[#235784] text-center text-sm mb-4">Identifier chaque point</p>
                      {currentQuestion.labels?.map((label, idx) => {
                        const selectedValue = (selectedChoice as Record<number, string>)?.[idx];
                        return (
                          <div key={idx} className="flex gap-3 items-center bg-white p-3 rounded-lg border border-gray-200">
                            <span className="inline-block w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-black bg-red-500 min-w-fit text-[10px]">{idx + 1}</span>
                            <select
                              disabled={isSubmitted}
                              value={selectedValue ?? ''}
                              onChange={(e) => {
                                if (!isSubmitted) {
                                  const current = (selectedChoice as Record<number, string>) || {};
                                  setSelectedChoice({ ...current, [idx]: e.target.value });
                                }
                              }}
                              className="flex-1 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg outline-none focus:border-amber-500 font-bold text-[#235784] text-sm"
                            >
                              <option value="">Sélectionner...</option>
                              {currentQuestion.labels?.map((opt, optIdx) => (
                                <option key={optIdx} value={opt.text}>
                                  {opt.text}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  currentQuestion.choices?.map((choice, i) => (
                    <button
                      key={i}
                      disabled={isSubmitted}
                      onClick={() => setSelectedChoice(i)}
                      className={`group p-3 rounded-lg text-left font-black text-base border-b transition-all active:scale-95 active:border-b-0 active:translate-y-1 flex items-center gap-4 ${selectedChoice === i ? 'bg-[#FF8C00] border-[#FF8C00] text-white shadow-sm shadow-[#FF8C00]/20' : `bg-white border-gray-200 text-[#235784] ${isSubmitted ? 'opacity-50 grayscale' : 'hover:bg-blue-50 hover:border-[#40a8c4]'}`}`}
                    >
                      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-black text-sm transition-colors ${selectedChoice === i ? 'bg-white text-[#FF8C00]' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600'}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {choice.text}
                    </button>
                  ))
                )}
              </div>
              <div className="sticky bottom-0 w-full p-3 md:p-4 bg-white/90 border-t border-gray-200 backdrop-blur-xl z-50 flex justify-end">
                <button
                  disabled={
                    (currentQuestion.type === QuestionType.IMAGE_LABELING
                      ? Object.keys((selectedChoice as Record<number, string>) || {}).length !== (currentQuestion.labels?.length || 0)
                      : selectedChoice === null) || isSubmitted
                  }
                  onClick={handleSubmit}
                  className={`w-fit mx-auto font-black text-lg md:text-xl py-3 md:py-4 px-6 md:px-8 rounded-lg shadow-sm transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 border-b ${isSubmitted
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-default"
                    : (currentQuestion.type === QuestionType.IMAGE_LABELING
                      ? Object.keys((selectedChoice as Record<number, string>) || {}).length === (currentQuestion.labels?.length || 0)
                      : selectedChoice !== null)
                      ? "bg-[#4682B4] hover:bg-[#36648B] text-white shadow-sm shadow-[#4682B4]/30 border-[#2C475C]"
                      : "bg-[#bcdbdf] text-white/50 border-[#a0c5cd] cursor-not-allowed"
                    }`}
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6" /> RÉPONSE ENVOYÉE
                    </>
                  ) : (
                    <>
                      VALIDER <Send className={`w-5 h-5 md:w-5 md:h-5 fill-current ${currentQuestion.type === QuestionType.IMAGE_LABELING
                        ? Object.keys((selectedChoice as Record<number, string>) || {}).length === (currentQuestion.labels?.length || 0) ? 'animate-bounce' : ''
                        : selectedChoice !== null ? 'animate-bounce' : ''
                        }`} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {session.status === SessionStatus.REVEAL && (
            <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-500">
              {currentQuestion.type === QuestionType.IMAGE_LABELING ? (
                session.answers?.find(a => a.participantId === identity?.id && a.questionIndex === session.currentQuestionIndex)?.isCorrect ? (
                  <div className="text-center">
                    <div className="bg-emerald-100 p-6 rounded-xl inline-block mb-8 shadow-sm">
                      <CheckCircle className="w-16 h-16 text-emerald-600" />
                    </div>
                    <h2 className="text-4xl font-black text-emerald-600 italic uppercase tracking-tighter">PARFAIT !</h2>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-red-100 p-6 rounded-xl inline-block mb-8 shadow-sm">
                      <AlertCircle className="w-16 h-16 text-red-600" />
                    </div>
                    <h2 className="text-4xl font-black text-red-600 italic uppercase tracking-tighter">DOMMAGE !</h2>
                    <p className="text-slate-500 font-bold mt-4 uppercase tracking-widest text-sm">Prépare-toi pour la suite</p>
                  </div>
                )
              ) : selectedChoice === currentQuestion.correctChoiceIndex ? (
                <div className="text-center">
                  <div className="bg-emerald-100 p-6 rounded-xl inline-block mb-8 shadow-sm">
                    <CheckCircle className="w-16 h-16 text-emerald-600" />
                  </div>
                  <h2 className="text-4xl font-black text-emerald-600 italic uppercase tracking-tighter">PARFAIT !</h2>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-red-100 p-6 rounded-xl inline-block mb-8 shadow-sm">
                    <AlertCircle className="w-16 h-16 text-red-600" />
                  </div>
                  <h2 className="text-4xl font-black text-red-600 italic uppercase tracking-tighter">DOMMAGE !</h2>
                  <p className="text-slate-500 font-bold mt-4 uppercase tracking-widest text-sm">Prépare-toi pour la suite</p>
                </div>
              )}
              <p className="mt-8 text-slate-400 font-black uppercase tracking-widest text-xs">Attente du professeur...</p>
            </div>
          )}

          {session.status === SessionStatus.FINISHED && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
              <div className="bg-amber-100 p-6 rounded-xl shadow-sm mb-10">
                <Trophy className="w-20 h-20 text-amber-500" />
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-slate-800">C'EST FINI !</h2>
              <p className="text-slate-500 font-bold mb-12 text-sm">Consultez le tableau pour le classement final.</p>
              <button onClick={() => navigate('/')} className="bg-slate-200 text-slate-700 font-black px-10 py-4 rounded-lg shadow-sm hover:bg-slate-300 transition-colors active:scale-95 uppercase tracking-tight italic">QUITTER</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentPlay;
