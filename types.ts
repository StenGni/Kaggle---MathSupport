
export enum AppView {
  SOLVER = 'SOLVER',
  ANALYZE = 'ANALYZE',
  PRACTICE = 'PRACTICE',
  PROFILE = 'PROFILE'
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface MistakeDetail {
  description: string;
  box_2d?: number[]; // [ymin, xmin, ymax, xmax] normalized to 1000
}

export interface RuleApplication {
  name: string;      // e.g., "Product Rule"
  generic: string;   // e.g., "\log_b(xy) = \log_b x + \log_b y"
  specific: string;  // e.g., "\log_3(15) = \log_3 3 + \log_3 5"
}

export interface StepDetail {
  text: string;
  explanation: string;
}

export interface ExerciseResult {
  id: string;
  timestamp: number;
  imageUrl: string;
  isCorrect: boolean;
  mistakes: MistakeDetail[] | string[];
  nextSteps: string[];
  explanation: string;
  topic: string;
  skillId?: string; // The taxonomy ID (e.g., EQ.QUAD.FACTOR)
  problemStatement?: string;
  approach?: string;
  ruleApplications?: RuleApplication[];
  stepDetails?: StepDetail[];
}

export interface MistakeExample {
  id?: string; // Stable ID for React rendering
  problem: string;
  studentWork: string;
  mistakeExplanation: string;
  correction: string;
  skillId?: string; // taxonomy ID
}

export interface IdentifiedSkill {
  id: string;
  name: string;
  explanation: string;
}

export interface SkillProfile {
  strengths: IdentifiedSkill[];
  weaknesses: IdentifiedSkill[];
  recentTopics: string[];
  lastAnalysis: number;
  recommendations: string[];
  skillLevel: number; // 0-100
  mistakeExamples?: MistakeExample[];
}

// Practice System Types
export interface PracticeProblem {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  skillId?: string;
}

// Tracks the user's history with specific skills
export interface UserMastery {
  [skillId: string]: {
    errorCount: number;
    lastErrorTimestamp: number;
    name?: string; // Cached name for display if taxonomy is missing
  };
}

// Taxonomy Types
export interface MathSkill {
  id: string;
  name: string;
  description?: string;
}

export interface MathSubCategory {
  id: string;
  name: string;
  skills: MathSkill[];
}

export interface MathCategory {
  id: string;
  name: string;
  subCategories: MathSubCategory[];
}

// Responses from Gemini
export interface SolverResponse {
  isCorrect: boolean;
  mistakes: MistakeDetail[];
  nextSteps: string[];
  explanation: string;
  topic: string;
  skillId?: string; // Added to map back to taxonomy
  problemStatement: string;
  approach: string;
  ruleApplications?: RuleApplication[];
  stepDetails?: StepDetail[];
}

export interface AnalysisResponse {
  strengths: IdentifiedSkill[];
  weaknesses: IdentifiedSkill[];
  topicsIdentified: string[];
  recommendations: string[];
  estimatedSkillLevel: number;
  mistakeExamples: MistakeExample[];
}

export interface PracticeGenResponse {
  problems: {
    question: string;
    correctAnswer: string;
    explanation: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
    skillId?: string;
  }[];
}
