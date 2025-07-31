
export enum ExperienceLevel {
    JUNIOR = "Junior",
    MID = "Mid-level",
    SENIOR = "Senior",
    STAFF = "Staff / Principal",
}

export enum InterviewRound {
    SCREENING = "Recruiter Screening",
    TECHNICAL = "Technical Screen",
    BEHAVIORAL = "Behavioral",
    SYSTEM_DESIGN = "System Design",
    FINAL = "Final / On-site",
}

export enum InterviewMode {
    FULL_INTERVIEW = "Full Interview",
    PRACTICE_DRILL = "Practice Drill",
    MCQ_QUIZ = "MCQ Quiz",
    CODING_CHALLENGE = "Coding Challenge",
}

export enum PracticeDrillType {
    ELEVATOR_PITCH = "Elevator Pitch",
    STAR_METHOD = "STAR Method",
    TECHNICAL_DEFINITIONS = "Technical Pop Quiz",
}

export enum DsaDifficulty {
    EASY = "Easy",
    MEDIUM = "Medium",
    HARD = "Hard",
}

export enum DsaTopic {
    ARRAYS = "Arrays",
    STRINGS = "Strings",
    LINKED_LIST = "Linked List",
    TREES = "Trees & Graphs",
    DYNAMIC_PROGRAMMING = "Dynamic Programming",
    BACKTRACKING = "Backtracking",
    GENERAL = "General Logic",
}

export interface DeliveryAnalysis {
  wordsPerMinute: number;
  fillerWords: Record<string, number>;
}

export interface CodingResult {
  question: string;
  code: string;
  feedback: string;
}

export interface Report {
  id?: string;
  config: InterviewConfig;
  summary: string;
  deliveryAnalysis: DeliveryAnalysis;
  timestamp?: string;
  codingResults?: CodingResult[];
  mcqResults?: MCQResult[];
  history?: ChatMessage[];
}

export interface InterviewConfig {
  mode: InterviewMode;
  role: string;
  // Fields for Full Interview
  level?: ExperienceLevel;
  round?: InterviewRound;
  resumeContent?: string;
  companyStyle?: string;
  // Fields for Practice Drill
  drillType?: PracticeDrillType;
  // Fields for Coding Challenge
  language?: string;
  dsaTopic?: DsaTopic;
  dsaDifficulty?: DsaDifficulty;
}

export interface MCQQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface DSATestCase {
    input: string;
    expectedOutput: string;
}

export interface DSAQuestion {
    title: string;
    description: string;
    // The string examples are kept for display purposes if needed, but testCases is primary
    examples: string[]; 
    constraints: string[];
    testCases: DSATestCase[];
}

export interface TestCaseResult {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
}

export interface MCQResult {
    question: MCQQuestion;
    userAnswer: string;
}

export interface User {
    id: string;
    email: string;
    fullName: string;
    reports: Report[];
    targetRole?: string;
}

export type InterviewStage = 
    // Top-level navigation views
    | 'welcome' 
    | 'login' 
    | 'signup' 
    | 'home'
    | 'profile' // Corresponds to the 'dashboard'
    | 'configuring' // Entry point for 'interview' simulations
    | 'practice_arena' // Entry point for 'practice' arena
    | 'ats_scanner'
    | 'settings'
    // In-session flow stages
    | 'interviewing' 
    | 'summary' 
    | 'mcq_loading' 
    | 'mcq_quiz' 
    | 'mcq_results' 
    | 'coding_challenge' 
    | 'coding_challenge_config' 
    | 'mcq_quiz_config' 
    | 'instructions';

// This AppView is now used primarily for highlighting the correct button in the NavBar
export type AppView = 'home' | 'dashboard' | 'interview' | 'practice' | 'ats_scanner' | 'settings';

export interface AtsResult {
    score: number;
    strengths: string[];
    improvements: string[];
}


export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}