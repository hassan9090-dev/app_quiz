
import React from 'react';
import { Quiz } from './types';

export const EXAMPLE_QUIZ: Quiz = {
  id: 'q-example-1',
  title: 'Web Technologies 101',
  description: 'Un quiz rapide sur les bases du développement web moderne.',
  createdAt: Date.now(),
  questions: [
    {
      id: 'ques-1',
      text: 'Que signifie HTML?',
      choices: [
        { text: 'Hyper Text Markup Language' },
        { text: 'High Tech Modern Language' },
        { text: 'Hyperlink and Text Management' },
        { text: 'Home Tool Markup Language' }
      ],
      correctChoiceIndex: 0
    },
    {
      id: 'ques-2',
      text: 'Quel framework React a été créé par Vercel?',
      choices: [
        { text: 'Vue.js' },
        { text: 'Angular' },
        { text: 'Next.js' },
        { text: 'Svelte' }
      ],
      correctChoiceIndex: 2
    },
    {
      id: 'ques-3',
      text: 'Quelle propriété CSS est utilisée pour changer la couleur du texte?',
      choices: [
        { text: 'font-color' },
        { text: 'text-style' },
        { text: 'color' },
        { text: 'background-color' }
      ],
      correctChoiceIndex: 2
    }
  ]
};

export const COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6'  // violet-500
];
