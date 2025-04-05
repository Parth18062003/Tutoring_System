export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'matching' | 'fill-in-blank';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  explanation?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: string[];
  correctAnswer: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer: boolean;
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short-answer';
  correctAnswer: string;
  acceptableAnswers?: string[]; // Alternative acceptable answers
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  items: { id: string; text: string }[];
  matches: { id: string; text: string }[];
  correctPairs: { itemId: string; matchId: string }[];
}

export interface FillInBlankQuestion extends BaseQuestion {
  type: 'fill-in-blank';
  text: string; // Text with blanks marked as [blank-1], [blank-2], etc.
  blanks: { id: string; correctAnswer: string; acceptableAnswers?: string[] }[];
}

export type QuizQuestion = 
  | MultipleChoiceQuestion 
  | TrueFalseQuestion 
  | ShortAnswerQuestion
  | MatchingQuestion
  | FillInBlankQuestion;

export type QuizData = {
  title: string;
  description: string;
  questions: QuizQuestion[];
};

export type UserAnswer = 
  | { questionId: string; type: 'multiple-choice'; selectedAnswer: string }
  | { questionId: string; type: 'true-false'; selectedAnswer: boolean }
  | { questionId: string; type: 'short-answer'; answer: string }
  | { questionId: string; type: 'matching'; pairs: { itemId: string; matchId: string }[] }
  | { questionId: string; type: 'fill-in-blank'; answers: { blankId: string; answer: string }[] };

export type QuizResult = {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: {
    questionId: string;
    type: QuestionType;
    isCorrect: boolean;
    userAnswer: any; // Type depends on question type
    correctAnswer: any; // Type depends on question type
    explanation?: string;
  }[];
};