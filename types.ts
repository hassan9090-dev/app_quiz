
export enum SessionStatus {
  IDLE = 'IDLE',
  LOBBY = 'LOBBY',
  QUESTION = 'QUESTION',
  REVEAL = 'REVEAL',
  FINISHED = 'FINISHED'
}

export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',      // QCM classique
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',  // QCM à choix multiples
  MATCHING = 'MATCHING',                 // Appariement
  DRAG_DROP = 'DRAG_DROP',              // Glisser-déposer
  IMAGE_LABELING = 'IMAGE_LABELING',    // Étiquetage d'image
  CATEGORIZATION = 'CATEGORIZATION',     // Catégorisation
  TRUE_FALSE = 'TRUE_FALSE'             // Vrai/Faux
}

export interface Choice {
  text: string;
}

export interface MatchPair {
  left: number;
  right: number;
}

export interface Placement {
  item: number;
  zone: number;
}

export interface Label {
  text: string;
  x: number;
  y: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  images?: string[];

  // For SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE
  choices?: Choice[];
  correctChoiceIndex?: number;        // For SINGLE_CHOICE, TRUE_FALSE
  correctChoiceIndexes?: number[];    // For MULTIPLE_CHOICE

  // For MATCHING
  leftItems?: string[];
  rightItems?: string[];
  correctMatches?: MatchPair[];

  // For DRAG_DROP
  draggableItems?: string[];
  dropZones?: string[];
  correctPlacements?: Placement[];

  // For IMAGE_LABELING
  labels?: Label[];

  // For CATEGORIZATION
  items?: string[];
  categories?: string[];
  correctCategories?: Placement[];

  timeLimitSec?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: number;
}

export interface Participant {
  id: string;
  name: string;
  emoji: string;
  score: number;
  lastAnswer?: number;
  isConnected: boolean;
}

export interface AnswerRecord {
  participantId: string;
  questionIndex: number;

  // For SINGLE_CHOICE, TRUE_FALSE
  choiceIndex?: number;

  // For MULTIPLE_CHOICE
  choiceIndexes?: number[];

  // For MATCHING
  matches?: MatchPair[];

  // For DRAG_DROP, CATEGORIZATION
  placements?: Placement[];

  // For IMAGE_LABELING
  labelPlacements?: Label[];

  isCorrect: boolean;
  timestamp: number;
}

export interface Session {
  id: string;
  quizId?: string;
  quiz?: Quiz;
  joinCode: string;
  status: SessionStatus;
  currentQuestionIndex: number;
  participants: Participant[];
  answers: AnswerRecord[];
  createdAt: number;
}

// WebSocket Message Types
export type MessageType =
  | 'session:created'
  | 'session:join'
  | 'session:joined'
  | 'session:start'
  | 'question:next'
  | 'question:reveal'
  | 'answer:submit'
  | 'session:end'
  | 'sync:state';

export interface WSMessage {
  type: MessageType;
  payload: any;
  senderId?: string;
}
