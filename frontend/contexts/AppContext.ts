
import React, { createContext, ReactNode } from 'react';
import { AppView, User, InterviewStage } from '../types';

interface AppContextType {
    currentUser: User | null;
    navigateToView: (view: AppView) => void;
    navigateToStage: (stage: InterviewStage) => void;
    startInterviewWithRole: (role: string) => void;
    logout: () => void;
    updateUser: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
    value: AppContextType;
}

export const AppProvider = ({ children, value }: AppProviderProps) => {
    // Using React.createElement because this is a .ts file, not .tsx
    return React.createElement(AppContext.Provider, { value: value, children: children });
};
