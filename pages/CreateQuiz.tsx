
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, CheckCircle2, Image as ImageIcon, X, Save } from 'lucide-react';
import { Quiz, Question, QuestionType } from '../types';


interface CreateQuizProps {
  onSave: (quiz: Quiz) => void;
  existingQuiz?: Quiz;
}

const CreateQuiz: React.FC<CreateQuizProps> = ({ onSave, existingQuiz }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(existingQuiz?.title || '');
  const [description, setDescription] = useState(existingQuiz?.description || '');
  const [questions, setQuestions] = useState<Question[]>(existingQuiz?.questions || []);

  const addQuestion = (type: QuestionType = QuestionType.SINGLE_CHOICE) => {
    const baseQuestion = {
      id: `q-${Date.now()}`,
      type,
      text: '',
      images: []
    };

    let newQuestion: Question;

    if (type === QuestionType.TRUE_FALSE) {
      newQuestion = {
        ...baseQuestion,
        choices: [
          { text: 'Vrai' },
          { text: 'Faux' }
        ],
        correctChoiceIndex: 0
      };
    } else if (type === QuestionType.MATCHING) {
      newQuestion = {
        ...baseQuestion,
        leftItems: ['', '', ''],
        rightItems: ['', '', ''],
        correctMatches: [
          { left: 0, right: 0 },
          { left: 1, right: 1 },
          { left: 2, right: 2 }
        ]
      };
    } else if (type === QuestionType.MULTIPLE_CHOICE) {
      newQuestion = {
        ...baseQuestion,
        choices: [
          { text: '' },
          { text: '' },
          { text: '' },
          { text: '' }
        ],
        correctChoiceIndexes: []
      };
    } else if (type === QuestionType.DRAG_DROP) {
      newQuestion = {
        ...baseQuestion,
        draggableItems: ['', '', ''],
        dropZones: ['', '', ''],
        correctPlacements: [
          { item: 0, zone: 0 },
          { item: 1, zone: 1 },
          { item: 2, zone: 2 }
        ]
      };
    } else if (type === QuestionType.CATEGORIZATION) {
      newQuestion = {
        ...baseQuestion,
        items: ['', '', '', ''],
        categories: ['', '', ''],
        correctCategories: []
      };
    } else if (type === QuestionType.IMAGE_LABELING) {
      newQuestion = {
        ...baseQuestion,
        labels: []
      };
    } else {
      // SINGLE_CHOICE par défaut
      newQuestion = {
        ...baseQuestion,
        choices: [
          { text: '' },
          { text: '' },
          { text: '' },
          { text: '' }
        ],
        correctChoiceIndex: 0
      };
    }

    setQuestions([...questions, newQuestion]);
  };

  const updateQuestionType = (id: string, newType: QuestionType) => {
    setQuestions(questions.map(q => {
      if (q.id !== id) return q;

      if (newType === QuestionType.TRUE_FALSE) {
        return {
          ...q,
          type: newType,
          choices: [
            { text: 'Vrai' },
            { text: 'Faux' }
          ],
          correctChoiceIndex: 0
        };
      } else if (newType === QuestionType.MATCHING) {
        return {
          ...q,
          type: newType,
          leftItems: ['', '', ''],
          rightItems: ['', '', ''],
          correctMatches: [
            { left: 0, right: 0 },
            { left: 1, right: 1 },
            { left: 2, right: 2 }
          ]
        };
      } else if (newType === QuestionType.MULTIPLE_CHOICE) {
        return {
          ...q,
          type: newType,
          choices: [
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' }
          ],
          correctChoiceIndexes: []
        };
      } else if (newType === QuestionType.DRAG_DROP) {
        return {
          ...q,
          type: newType,
          draggableItems: ['', '', ''],
          dropZones: ['', '', ''],
          correctPlacements: [
            { item: 0, zone: 0 },
            { item: 1, zone: 1 },
            { item: 2, zone: 2 }
          ]
        };
      } else if (newType === QuestionType.CATEGORIZATION) {
        return {
          ...q,
          type: newType,
          items: ['', '', '', ''],
          categories: ['', '', ''],
          correctCategories: []
        };
      } else if (newType === QuestionType.IMAGE_LABELING) {
        return {
          ...q,
          type: newType,
          labels: []
        };
      } else {
        return {
          ...q,
          type: newType,
          choices: [
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' }
          ],
          correctChoiceIndex: 0
        };
      }
    }));
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const handleImageUpload = (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setQuestions(questions.map(q => {
        if (q.id === qId) {
          const currentImages = q.images || [];
          if (currentImages.length >= 2) {
            alert("Maximum 2 images par question.");
            return q;
          }
          return { ...q, images: [...currentImages, base64String] };
        }
        return q;
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImage = (qId: string, imgIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newImages = [...(q.images || [])];
        newImages.splice(imgIndex, 1);
        return { ...q, images: newImages };
      }
      return q;
    }));
  };

  const updateChoiceText = (qId: string, choiceIndex: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.choices) {
        const newChoices = [...q.choices];
        newChoices[choiceIndex] = { text };
        return { ...q, choices: newChoices };
      }
      return q;
    }));
  };

  const setCorrectChoice = (qId: string, choiceIndex: number) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, correctChoiceIndex: choiceIndex } : q));
  };

  const updateLeftItem = (qId: string, itemIndex: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.leftItems) {
        const newLeftItems = [...q.leftItems];
        newLeftItems[itemIndex] = text;
        return { ...q, leftItems: newLeftItems };
      }
      return q;
    }));
  };

  const updateRightItem = (qId: string, itemIndex: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.rightItems) {
        const newRightItems = [...q.rightItems];
        newRightItems[itemIndex] = text;
        return { ...q, rightItems: newRightItems };
      }
      return q;
    }));
  };

  const setCorrectMatch = (qId: string, leftIndex: number, rightIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.correctMatches) {
        const newMatches = [...q.correctMatches];
        const existingIndex = newMatches.findIndex(m => m.left === leftIndex);
        if (existingIndex >= 0) {
          newMatches[existingIndex] = { left: leftIndex, right: rightIndex };
        } else {
          newMatches.push({ left: leftIndex, right: rightIndex });
        }
        return { ...q, correctMatches: newMatches };
      }
      return q;
    }));
  };

  const addLeftItem = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.leftItems) {
        return { ...q, leftItems: [...q.leftItems, ''] };
      }
      return q;
    }));
  };

  const addRightItem = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.rightItems) {
        return { ...q, rightItems: [...q.rightItems, ''] };
      }
      return q;
    }));
  };

  const removeLeftItem = (qId: string, itemIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.leftItems && q.leftItems.length > 1) {
        const newLeftItems = q.leftItems.filter((_, i) => i !== itemIndex);
        const newMatches = (q.correctMatches || []).filter(m => m.left !== itemIndex);
        return { ...q, leftItems: newLeftItems, correctMatches: newMatches };
      }
      return q;
    }));
  };

  const removeRightItem = (qId: string, itemIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.rightItems && q.rightItems.length > 1) {
        const newRightItems = q.rightItems.filter((_, i) => i !== itemIndex);
        const newMatches = (q.correctMatches || []).filter(m => m.right !== itemIndex);
        return { ...q, rightItems: newRightItems, correctMatches: newMatches };
      }
      return q;
    }));
  };

  const toggleCorrectChoice = (qId: string, choiceIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const correctIndexes = q.correctChoiceIndexes || [];
        const isChecked = correctIndexes.includes(choiceIndex);
        const newCorrectIndexes = isChecked
          ? correctIndexes.filter(i => i !== choiceIndex)
          : [...correctIndexes, choiceIndex];
        return { ...q, correctChoiceIndexes: newCorrectIndexes };
      }
      return q;
    }));
  };

  const addDraggableItem = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.type === QuestionType.DRAG_DROP) {
        return { ...q, draggableItems: [...(q.draggableItems || []), ''] };
      }
      return q;
    }));
  };

  const removeDraggableItem = (qId: string, itemIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.draggableItems) {
        const newItems = q.draggableItems.filter((_, i) => i !== itemIndex);
        const newPlacements = (q.correctPlacements || []).filter(p => p.item !== itemIndex);
        return { ...q, draggableItems: newItems, correctPlacements: newPlacements };
      }
      return q;
    }));
  };

  const updateDraggableItem = (qId: string, itemIndex: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.draggableItems) {
        const newItems = [...q.draggableItems];
        newItems[itemIndex] = text;
        return { ...q, draggableItems: newItems };
      }
      return q;
    }));
  };

  const addDropZone = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.type === QuestionType.DRAG_DROP) {
        return { ...q, dropZones: [...(q.dropZones || []), ''] };
      }
      return q;
    }));
  };

  const removeDropZone = (qId: string, zoneIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.dropZones) {
        const newZones = q.dropZones.filter((_, i) => i !== zoneIndex);
        const newPlacements = (q.correctPlacements || []).filter(p => p.zone !== zoneIndex);
        return { ...q, dropZones: newZones, correctPlacements: newPlacements };
      }
      return q;
    }));
  };

  const updateDropZone = (qId: string, zoneIndex: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.dropZones) {
        const newZones = [...q.dropZones];
        newZones[zoneIndex] = text;
        return { ...q, dropZones: newZones };
      }
      return q;
    }));
  };

  const setItemPlacement = (qId: string, itemIndex: number, zoneIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const placements = q.correctPlacements || [];
        const existingIndex = placements.findIndex(p => p.item === itemIndex);
        const newPlacements = [...placements];
        if (existingIndex >= 0) {
          newPlacements[existingIndex] = { item: itemIndex, zone: zoneIndex };
        } else {
          newPlacements.push({ item: itemIndex, zone: zoneIndex });
        }
        return { ...q, correctPlacements: newPlacements };
      }
      return q;
    }));
  };

  const addCategory = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.type === QuestionType.CATEGORIZATION) {
        return { ...q, categories: [...(q.categories || []), ''] };
      }
      return q;
    }));
  };

  const removeCategory = (qId: string, catIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.categories) {
        const newCats = q.categories.filter((_, i) => i !== catIndex);
        const newCatItems = (q.correctCategories || []).filter(c => c.zone !== catIndex);
        return { ...q, categories: newCats, correctCategories: newCatItems };
      }
      return q;
    }));
  };

  const updateCategory = (qId: string, catIndex: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.categories) {
        const newCats = [...q.categories];
        newCats[catIndex] = text;
        return { ...q, categories: newCats };
      }
      return q;
    }));
  };

  const setCategoryItem = (qId: string, itemIndex: number, catIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const cats = q.correctCategories || [];
        const existingIndex = cats.findIndex(c => c.item === itemIndex);
        const newCats = [...cats];
        if (existingIndex >= 0) {
          newCats[existingIndex] = { item: itemIndex, zone: catIndex };
        } else {
          newCats.push({ item: itemIndex, zone: catIndex });
        }
        return { ...q, correctCategories: newCats };
      }
      return q;
    }));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSave = () => {
    if (!title || questions.length === 0) {
      alert("Veuillez donner un titre et au moins une question.");
      return;
    }

    const newQuiz: Quiz = {
      id: existingQuiz?.id || `quiz-${Date.now()}`,
      title,
      description,
      questions,
      createdAt: existingQuiz?.createdAt || Date.now()
    };

    onSave(newQuiz);
    navigate('/teacher');
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center font-sans">
      <div className="w-[90%] mx-auto">
        <header className="px-6 py-4 border-b border-gray-200 grid grid-cols-3 items-center bg-[#235784] sticky top-0 z-20 shadow-sm mb-8">
          {/* Left: Title */}
          <div className="flex items-center gap-3 justify-self-start">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {existingQuiz ? '✏️ Modifier le Quiz' : 'Nouveau Quiz'}
            </h1>
          </div>

          {/* Center: Empty */}
          <div className="flex justify-center items-center">
          </div>

          {/* Right: Save and Back Buttons */}
          <div className="flex gap-3 justify-self-end">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm shadow-blue-600/20 active:scale-95 whitespace-nowrap"
            >
              <Save className="w-5 h-5" /> Enregistrer le Quiz
            </button>
            <button
              onClick={() => navigate('/teacher')}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white transition-colors font-bold px-4 py-2 rounded-lg whitespace-nowrap"
            >
              <ChevronLeft className="w-5 h-5" /> Retour
            </button>
          </div>
        </header>

        <div className="px-4 py-4">

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Titre du Quiz</label>
                <input
                  type="text"
                  placeholder="Ex: Géographie de l'Europe"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none transition-all text-lg font-normal text-gray-700 placeholder:text-gray-400"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Description</label>
                <textarea
                  placeholder="Décrivez votre quiz..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-all h-20 resize-none font-normal text-gray-600 placeholder:text-gray-400"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center justify-between">
              Questions ({questions.length})
            </h2>

            {questions.map((q, qIndex) => (
              <div key={q.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 font-semibold rounded-lg text-sm border border-blue-100">
                    {qIndex + 1}
                  </span>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>

                {/* Type de question */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Type de question</label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestionType(q.id, e.target.value as QuestionType)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-all font-normal text-gray-700"
                  >
                    <option value={QuestionType.SINGLE_CHOICE}>QCM (Choix unique)</option>
                    <option value={QuestionType.TRUE_FALSE}>Vrai / Faux</option>
                    <option value={QuestionType.MATCHING}>Relier (Appariement)</option>
                    <option value={QuestionType.MULTIPLE_CHOICE}>QCM (Choix multiples)</option>
                    <option value={QuestionType.DRAG_DROP}>Glisser-Déposer</option>
                    <option value={QuestionType.IMAGE_LABELING}>Étiquetage d'image</option>
                    <option value={QuestionType.CATEGORIZATION}>Catégorisation</option>
                  </select>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Énoncé</label>
                  <input
                    type="text"
                    placeholder="Votre question ici..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-all text-lg font-normal text-gray-800 placeholder:text-gray-300"
                    value={q.text}
                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-500 mb-4 ml-1">Images (Max 2)</label>
                  <div className="flex flex-wrap gap-4">
                    {(q.images || []).map((img, idx) => (
                      <div key={idx} className="relative group w-28 h-28 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(q.id, idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(q.images || []).length < 2 && (
                      <label className="w-28 h-28 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-400 hover:text-blue-500">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-[10px] font-normal">Ajouter</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(q.id, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Choix - Différent selon le type */}
                {
                  q.type === QuestionType.TRUE_FALSE ? (
                    <div className="grid grid-cols-2 gap-4">
                      {q.choices?.map((choice, cIndex) => (
                        <div key={cIndex} className={`relative flex items-center justify-center p-4 rounded-lg border transition-all cursor-pointer ${q.correctChoiceIndex === cIndex ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                          onClick={() => setCorrectChoice(q.id, cIndex)}
                        >
                          <CheckCircle2 className={`w-6 h-6 mr-3 ${q.correctChoiceIndex === cIndex ? 'text-emerald-500' : 'text-gray-400'}`} />
                          <span className="font-normal text-xl text-gray-700">{choice.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : q.type === QuestionType.MATCHING ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <label className="block text-sm font-medium text-gray-600 mb-4">Éléments à Relier (Gauche)</label>
                          <div className="space-y-3">
                            {q.leftItems?.map((item, idx) => (
                              <div key={idx} className="flex gap-2 items-stretch">
                                <input
                                  type="text"
                                  placeholder={`Élément ${idx + 1}`}
                                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-300 text-gray-700 font-normal text-sm"
                                  value={item}
                                  onChange={(e) => updateLeftItem(q.id, idx, e.target.value)}
                                  autoFocus={item === ''}
                                />
                                {q.leftItems.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeLeftItem(q.id, idx)}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addLeftItem(q.id)}
                            className="mt-4 w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-100 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                          >
                            <Plus className="w-4 h-4" /> Ajouter élément
                          </button>
                        </div>

                        <div className="p-3 bg-green-50 rounded-lg">
                          <label className="block text-sm font-medium text-gray-600 mb-4">Correspondances (Droite)</label>
                          <div className="space-y-3">
                            {q.rightItems?.map((item, idx) => (
                              <div key={idx} className="flex gap-2 items-stretch">
                                <select
                                  className="w-20 px-2 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-1 focus:ring-green-300 text-gray-700 font-normal text-sm"
                                  value={q.correctMatches?.find(m => m.right === idx)?.left ?? ''}
                                  onChange={(e) => {
                                    if (e.target.value !== '') {
                                      setCorrectMatch(q.id, parseInt(e.target.value), idx);
                                    }
                                  }}
                                >
                                  <option value="">Lier à...</option>
                                  {q.leftItems?.map((_, leftIdx) => (
                                    <option key={leftIdx} value={leftIdx}>
                                      {leftIdx + 1}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  placeholder={`Réponse ${idx + 1}`}
                                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-1 focus:ring-green-300 text-gray-700 font-normal text-sm"
                                  value={item}
                                  onChange={(e) => updateRightItem(q.id, idx, e.target.value)}
                                  autoFocus={item === ''}
                                />
                                {q.rightItems.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeRightItem(q.id, idx)}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addRightItem(q.id)}
                            className="mt-4 w-full text-sm text-green-600 hover:text-green-700 hover:bg-green-100 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                          >
                            <Plus className="w-4 h-4" /> Ajouter réponse
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : q.type === QuestionType.MULTIPLE_CHOICE ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {q.choices?.map((choice, cIndex) => (
                        <div key={cIndex} className={`relative flex items-center p-2 rounded-lg border transition-all ${q.correctChoiceIndexes?.includes(cIndex) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                          <button
                            type="button"
                            onClick={() => toggleCorrectChoice(q.id, cIndex)}
                            className={`p-3 rounded-lg transition-colors ${q.correctChoiceIndexes?.includes(cIndex) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            <CheckCircle2 className="w-7 h-7" />
                          </button>
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + cIndex)}`}
                            className="flex-1 bg-transparent px-2 py-2 outline-none font-normal text-gray-700 placeholder:text-gray-400 text-sm"
                            value={choice.text}
                            onChange={(e) => updateChoiceText(q.id, cIndex, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : q.type === QuestionType.DRAG_DROP ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-3 bg-cyan-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-600 mb-4">Éléments à Glisser</label>
                        <div className="space-y-3">
                          {q.draggableItems?.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-stretch">
                              <input
                                type="text"
                                placeholder={`Élément ${idx + 1}`}
                                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-300 text-gray-700 font-normal text-sm"
                                value={item}
                                onChange={(e) => updateDraggableItem(q.id, idx, e.target.value)}
                                autoFocus={item === ''}
                              />
                              {q.draggableItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeDraggableItem(q.id, idx)}
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => addDraggableItem(q.id)}
                          className="mt-4 w-full text-sm text-cyan-600 hover:text-cyan-700 hover:bg-cyan-100 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                        >
                          <Plus className="w-4 h-4" /> Ajouter élément
                        </button>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-600 mb-4">Zones de Destination</label>
                        <div className="space-y-3">
                          {q.dropZones?.map((zone, idx) => (
                            <div key={idx} className="flex gap-2 items-stretch">
                              <input
                                type="text"
                                placeholder={`Zone ${idx + 1}`}
                                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300 text-gray-700 font-normal text-sm"
                                value={zone}
                                onChange={(e) => updateDropZone(q.id, idx, e.target.value)}
                                autoFocus={zone === ''}
                              />
                              {q.dropZones.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeDropZone(q.id, idx)}
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => addDropZone(q.id)}
                          className="mt-4 w-full text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-100 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                        >
                          <Plus className="w-4 h-4" /> Ajouter zone
                        </button>
                      </div>
                    </div>
                  ) : q.type === QuestionType.CATEGORIZATION ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-3 bg-pink-50 rounded-lg">
                          <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Éléments à Catégoriser</label>
                          <div className="space-y-3">
                            {q.items?.map((item, idx) => (
                              <div key={idx} className="flex gap-2 items-stretch">
                                <input
                                  type="text"
                                  placeholder={`Élément ${idx + 1}`}
                                  className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-300 text-gray-700 font-medium"
                                  value={item}
                                  onChange={(e) => {
                                    setQuestions(questions.map(qu => {
                                      if (qu.id === q.id && qu.items) {
                                        const newItems = [...qu.items];
                                        newItems[idx] = e.target.value;
                                        return { ...qu, items: newItems };
                                      }
                                      return qu;
                                    }));
                                  }}
                                  autoFocus={item === ''}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-rose-50 rounded-lg">
                          <label className="block text-sm font-medium text-gray-600 mb-4">Catégories</label>
                          <div className="space-y-3">
                            {q.categories?.map((cat, idx) => (
                              <div key={idx} className="flex gap-2 items-stretch">
                                <input
                                  type="text"
                                  placeholder={`Catégorie ${idx + 1}`}
                                  className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-300 text-gray-700 font-medium"
                                  value={cat}
                                  onChange={(e) => updateCategory(q.id, idx, e.target.value)}
                                  autoFocus={cat === ''}
                                />
                                {q.categories.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeCategory(q.id, idx)}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addCategory(q.id)}
                            className="mt-4 w-full text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-100 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                          >
                            <Plus className="w-4 h-4" /> Ajouter catégorie
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                        <label className="block text-sm font-medium text-gray-600 mb-4">Liaisons : Élément → Catégorie</label>
                        <div className="space-y-2">
                          {q.items?.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex gap-3 items-center p-3 bg-white rounded-lg border border-gray-200">
                              <span className="font-normal text-purple-600 min-w-[150px]">{item || `Élément ${itemIdx + 1}`}</span>
                              <span className="text-gray-400">→</span>
                              <select
                                className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg outline-none focus:border-purple-500 text-sm font-normal text-gray-700"
                                value={q.correctCategories?.find(c => c.item === itemIdx)?.zone ?? ''}
                                onChange={(e) => {
                                  if (e.target.value !== '') {
                                    setCategoryItem(q.id, itemIdx, parseInt(e.target.value));
                                  }
                                }}
                              >
                                <option value="">Sélectionner une catégorie...</option>
                                {q.categories?.map((cat, catIdx) => (
                                  <option key={catIdx} value={catIdx}>
                                    {cat || `Catégorie ${catIdx + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : q.type === QuestionType.IMAGE_LABELING ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-indigo-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-600 mb-3">Image à Étiqueter (Cliquez pour ajouter des étiquettes)</label>
                        {q.images && q.images.length > 0 ? (
                          <div
                            className="relative bg-white rounded-lg overflow-hidden border-2 border-indigo-300 h-80 flex justify-center"
                          >
                            <div
                              className="relative h-full flex-shrink-0 cursor-crosshair"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                                const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

                                setQuestions(questions.map(qu => {
                                  if (qu.id === q.id) {
                                    const newLabels = [...(qu.labels || []), { text: '', x, y }];
                                    return { ...qu, labels: newLabels };
                                  }
                                  return qu;
                                }));
                              }}
                            >
                              <img
                                src={q.images[0]}
                                alt="Question image"
                                className="h-full w-auto object-contain pointer-events-none"
                              />
                              {q.labels?.map((label, idx) => (
                                <div
                                  key={idx}
                                  className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-colors"
                                  style={{ left: `${label.x}%`, top: `${label.y}%` }}
                                  title={label.text}
                                >
                                  {idx + 1}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center h-80 flex items-center justify-center">
                            <span className="text-gray-400 font-bold">Aucune image. Ajouter une image ci-dessous.</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-indigo-100 rounded-lg">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Importer une image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleImageUpload(q.id, e);
                          }}
                          className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="p-4 bg-amber-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-600 mb-4">Étiquettes</label>
                        <div className="space-y-3">
                          {q.labels?.map((label, idx) => (
                            <div key={idx} className="flex gap-2 items-stretch bg-white p-3 rounded-lg border border-gray-200">
                              <input
                                type="text"
                                placeholder={`Étiquette ${idx + 1}`}
                                className="flex-1 px-3 py-2 bg-amber-50 border border-amber-300 rounded outline-none focus:border-amber-500 text-gray-700 font-normal"
                                value={label.text}
                                onChange={(e) => {
                                  setQuestions(questions.map(qu => {
                                    if (qu.id === q.id && qu.labels) {
                                      const newLabels = [...qu.labels];
                                      newLabels[idx] = { ...label, text: e.target.value };
                                      return { ...qu, labels: newLabels };
                                    }
                                    return qu;
                                  }));
                                }}
                                autoFocus={label.text === ''}
                              />
                              <div className="text-xs text-gray-500 font-normal px-2 py-1 bg-gray-100 rounded">
                                x: {label.x}, y: {label.y}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuestions(questions.map(qu => {
                                    if (qu.id === q.id && qu.labels) {
                                      const newLabels = qu.labels.filter((_, i) => i !== idx);
                                      return { ...qu, labels: newLabels };
                                    }
                                    return qu;
                                  }));
                                }}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-3 p-2 bg-white rounded border border-gray-200">
                          💡 Cliquez sur l'image pour ajouter des étiquettes aux positions souhaitées
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {q.choices?.map((choice, cIndex) => (
                        <div key={cIndex} className={`relative flex items-center p-2 rounded-2xl border-2 transition-all ${q.correctChoiceIndex === cIndex ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
                          <button
                            onClick={() => setCorrectChoice(q.id, cIndex)}
                            className={`p-3 rounded-xl transition-colors ${q.correctChoiceIndex === cIndex ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            <CheckCircle2 className="w-7 h-7" />
                          </button>
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + cIndex)}`}
                            className="flex-1 bg-transparent px-2 py-3 outline-none font-normal text-gray-700 placeholder:text-gray-400"
                            value={choice.text}
                            onChange={(e) => updateChoiceText(q.id, cIndex, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* Boutons d'ajout de question */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <button
              onClick={() => addQuestion(QuestionType.SINGLE_CHOICE)}
              className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-400 hover:text-blue-500 font-normal py-6 rounded-[2.5rem] transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="bg-gray-100 p-3 rounded-2xl shadow-sm border border-gray-200 group-hover:scale-110 transition-all duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-normal">QCM Classique</span>
            </button>

            <button
              onClick={() => addQuestion(QuestionType.TRUE_FALSE)}
              className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-emerald-400 text-gray-400 hover:text-emerald-500 font-normal py-6 rounded-[2.5rem] transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="bg-gray-100 p-3 rounded-2xl shadow-sm border border-gray-200 group-hover:scale-110 transition-all duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-normal">Vrai / Faux</span>
            </button>

            <button
              onClick={() => addQuestion(QuestionType.MATCHING)}
              className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-purple-400 text-gray-400 hover:text-purple-500 font-normal py-6 rounded-[2.5rem] transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="bg-gray-100 p-3 rounded-2xl shadow-sm border border-gray-200 group-hover:scale-110 transition-all duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-normal">Relier</span>
            </button>

            <button
              onClick={() => addQuestion(QuestionType.MULTIPLE_CHOICE)}
              className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-orange-400 text-gray-400 hover:text-orange-500 font-normal py-6 rounded-[2.5rem] transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="bg-gray-100 p-3 rounded-2xl shadow-sm border border-gray-200 group-hover:scale-110 transition-all duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-normal">Choix Multiples</span>
            </button>

            <button
              onClick={() => addQuestion(QuestionType.DRAG_DROP)}
              className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-cyan-400 text-gray-400 hover:text-cyan-500 font-normal py-6 rounded-[2.5rem] transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="bg-gray-100 p-3 rounded-2xl shadow-sm border border-gray-200 group-hover:scale-110 transition-all duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-normal">Glisser-Déposer</span>
            </button>

            <button
              onClick={() => addQuestion(QuestionType.CATEGORIZATION)}
              className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-pink-400 text-gray-400 hover:text-pink-500 font-normal py-6 rounded-[2.5rem] transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="bg-gray-100 p-3 rounded-2xl shadow-sm border border-gray-200 group-hover:scale-110 transition-all duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-normal">Catégorisation</span>
            </button>

            <button
              onClick={() => addQuestion(QuestionType.IMAGE_LABELING)}
              className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-indigo-400 text-gray-400 hover:text-indigo-500 font-normal py-6 rounded-[2.5rem] transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="bg-gray-100 p-3 rounded-2xl shadow-sm border border-gray-200 group-hover:scale-110 transition-all duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-normal">Étiquetage</span>
            </button>
          </div>


        </div>
      </div >
    </div >
  );
};

export default CreateQuiz;
