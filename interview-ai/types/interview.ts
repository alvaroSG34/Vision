export interface TechnicalQuestion {
  id: string;
  question: string;
  expectedCriteria: string[];
  maxFollowUps?: number;
}

export interface InterviewConfig {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  openingQuestion: string;
  technicalQuestions: TechnicalQuestion[];
}

export type InterviewStatus =
  | "SETUP"
  | "READY"
  | "ASKING"
  | "LISTENING"
  | "FINISHED";

export interface AnswerEvaluation {
  clarity: number;
  technicalAccuracy: number;
  relevance: number;
  strengths: string[];
  improvements: string[];
}

export interface InterviewAnswer {
  questionId: string;
  question: string;
  answer: string;
  startedAt: number;
  finishedAt: number;
  wordsPerMinute: number;
  fillerCount: number;
  longPauseCount: number;
  evaluation: AnswerEvaluation;
}
