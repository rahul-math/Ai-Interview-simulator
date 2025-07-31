import { ExperienceLevel, InterviewRound, InterviewMode, PracticeDrillType, DsaDifficulty, DsaTopic } from './types';

export const COMPANY_SUGGESTIONS = [
    "Google",
    "Amazon",
    "Meta",
    "Microsoft",
    "Apple",
    "Netflix",
];
export const EXPERIENCE_LEVELS: string[] = Object.values(ExperienceLevel);
export const INTERVIEW_ROUNDS: string[] = Object.values(InterviewRound);
export const INTERVIEW_MODES: string[] = [InterviewMode.FULL_INTERVIEW, InterviewMode.PRACTICE_DRILL];
export const PRACTICE_DRILL_TYPES: string[] = Object.values(PracticeDrillType);
export const PROGRAMMING_LANGUAGES: string[] = ["JavaScript", "Python", "Java", "C++", "C"];
export const DSA_DIFFICULTIES: string[] = Object.values(DsaDifficulty);
export const DSA_TOPICS: string[] = Object.values(DsaTopic);