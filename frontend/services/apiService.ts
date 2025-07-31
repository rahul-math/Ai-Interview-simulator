

import { 
    InterviewConfig, 
    ChatMessage, 
    DeliveryAnalysis, 
    MCQQuestion, 
    DSAQuestion, 
    TestCaseResult, 
    AtsResult,
    User,
    Report
} from '../types';

// The server now expects password during signup, but the User object doesn't store it client-side.
type NewUserRegistration = Omit<User, 'reports' | 'id'> & { password?: string };

const API_BASE_URL = '/api'; // Using Vite proxy
export const TOKEN_KEY = 'ai-interviewer-token';

// --- Helper for making API calls ---
const apiClient = async <T>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: object): Promise<T> => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Global handling for expired/invalid sessions
    if (response.status === 401) {
        // Clear the invalid token to prevent repeated failed requests
        localStorage.removeItem(TOKEN_KEY);
        // Alert the user and reload the page to force a fresh state and re-authentication
        alert('Your session has expired or is invalid. Please log in again.');
        window.location.reload();
        // Throw an error to stop the current execution flow. The page reload will handle the UI reset.
        throw new Error('Session expired');
    }

    const responseData = await response.json();

    if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || `API Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
    }

    return responseData;
};

// --- Auth Service Logic ---
const auth = {
    registerUser: async (newUser: NewUserRegistration): Promise<User> => {
        const { user, session } = await apiClient<{user: User, session: any}>('/auth/signup', 'POST', newUser);
        if (session?.access_token) {
            localStorage.setItem(TOKEN_KEY, session.access_token);
        }
        return user;
    },
    loginUser: async (email: string, password: string): Promise<User> => {
        const { user, session } = await apiClient<{user: User, session: any}>('/auth/login', 'POST', { email, password });
        if (session?.access_token) {
            localStorage.setItem(TOKEN_KEY, session.access_token);
        }
        return user;
    },
    logoutUser: async (): Promise<void> => {
        const token = localStorage.getItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_KEY);
        if (token) {
            try {
                // We send the request but don't wait for it or block on its failure.
                // The client session is cleared regardless.
                apiClient('/auth/logout', 'POST');
            } catch (error) {
                // Ignore errors here since the client-side session is already cleared.
                // This can happen if the token is already invalid on the server.
                if ((error as Error).message !== 'Session expired') {
                    console.error("Server logout call failed, but client session is cleared.", error);
                }
            }
        }
    },
    getMe: async (): Promise<User> => {
       const { user } = await apiClient<{user: User}>('/me', 'GET');
       return user;
    },
    updateProfile: async (updates: Partial<Pick<User, 'fullName' | 'targetRole'>>): Promise<User> => {
        const { user } = await apiClient<{user: User}>('/me', 'PUT', updates);
        return user;
    },
    updatePassword: async (currentPassword: string, newPassword: string): Promise<{message: string}> => {
        // The backend doesn't use currentPassword, Supabase handles this via the user's JWT
        return apiClient('/me/password', 'PUT', { newPassword });
    },
    getToken: (): string | null => {
        return localStorage.getItem(TOKEN_KEY);
    }
};


// --- Gemini & Data Service Logic ---
const data = {
    analyzeResumeForATS: async (
        resumeData: { text?: string; file?: { mimeType: string; data: string } }, 
        jobRole: string
    ): Promise<AtsResult> => {
        const { analysis } = await apiClient<{ analysis: AtsResult }>('/gemini/analyze-resume', 'POST', { resumeData, jobRole });
        return analysis;
    },

    generateMCQQuiz: async (role: string): Promise<MCQQuestion[]> => {
        const data = await apiClient<{ questions: MCQQuestion[] }>('/gemini/generate-mcq', 'POST', { role });
        return data.questions;
    },

    generateDSAQuestion: async (config: InterviewConfig): Promise<DSAQuestion> => {
        const { question } = await apiClient<{ question: DSAQuestion }>('/gemini/generate-dsa', 'POST', { config });
        return question;
    },

    runDSACode: async (question: DSAQuestion, code: string, language: string): Promise<TestCaseResult[]> => {
        const { results } = await apiClient<{ results: TestCaseResult[] }>('/gemini/run-dsa', 'POST', { question, code, language });
        return results;
    },

    reviewDSACode: async (question: DSAQuestion, code: string, language: string): Promise<string> => {
        const { review } = await apiClient<{ review: string }>('/gemini/review-dsa', 'POST', { question, code, language });
        return review;
    },

    getDSASolution: async (question: DSAQuestion, language: string): Promise<string> => {
        const { solution } = await apiClient<{ solution: string }>('/gemini/get-dsa-solution', 'POST', { question, language });
        return solution;
    },

    translateCode: async (code: string, fromLanguage: string, toLanguage: string): Promise<string> => {
        if (!code.trim()) return '';
        const { translatedCode } = await apiClient<{ translatedCode: string }>('/gemini/translate-code', 'POST', { code, fromLanguage, toLanguage });
        return translatedCode;
    },

    analyzeDelivery: async (transcript: string): Promise<Record<string, number>> => {
        if (!transcript.trim()) return {};
        try {
            const { analysis } = await apiClient<{ analysis: { fillerWords: Record<string, number> } }>('/gemini/analyze-delivery', 'POST', { transcript });
            return analysis.fillerWords || {};
        } catch (error) {
            console.error("Non-critical error analyzing delivery:", error);
            return {};
        }
    },

    getChatResponse: async (config: InterviewConfig, history: ChatMessage[], newMessage: string): Promise<string> => {
        const { responseText } = await apiClient<{ responseText: string }>('/gemini/chat', 'POST', { config, history, newMessage });
        return responseText;
    },

    generateTechnicalCodingQuestion: async (role: string, language: string): Promise<string> => {
        const { question } = await apiClient<{ question: string }>('/gemini/generate-tech-question', 'POST', { role, language });
        return question;
    },

    reviewCodingSolution: async (question: string, code: string, language: string): Promise<string> => {
        const { review } = await apiClient<{ review: string }>('/gemini/review-solution', 'POST', { question, code, language });
        return review;
    },

    saveReport: async (reportData: Omit<Report, 'id' | 'timestamp' | 'userId'>): Promise<Report> => {
        const { report } = await apiClient<{ report: Report }>('/reports', 'POST', { report: reportData });
        return report;
    }
};

export const apiService = { ...auth, ...data };
