
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { InterviewConfig, InterviewStage, Report, DeliveryAnalysis, MCQQuestion, MCQResult, InterviewMode, User, AppView, CodingResult, ChatMessage } from './types';
import ConfigurationScreen from './components/ConfigurationScreen';
import InterviewScreen from './components/InterviewScreen';
import SummaryScreen from './components/SummaryScreen';
import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';
import WelcomeScreen from './components/WelcomeScreen';
import ProfileScreen from './components/ProfileScreen';
import MCQScreen from './components/MCQScreen';
import MCQResultsScreen from './components/MCQResultsScreen';
import CodingScreen from './components/CodingScreen';
import { apiService, TOKEN_KEY } from './services/apiService';
import { LoadingSpinner } from './components/Icons';
import WelcomeAnimation from './components/WelcomeAnimation';
import CodingChallengeConfigScreen from './components/CodingChallengeConfigScreen';
import PracticeArenaScreen from './components/PracticeArenaScreen';
import MCQQuizConfigScreen from './components/MCQQuizConfigScreen';
import InstructionModal from './components/InstructionModal';
import NavBar from './components/NavBar';
import AtsScannerScreen from './components/AtsScannerScreen';
import HomeScreen from './components/HomeScreen';
import ProfileSettingsScreen from './components/ProfileSettingsScreen';
import { AppProvider } from './contexts/AppContext';

const App: React.FC = () => {
  const [animationFinished, setAnimationFinished] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [interviewStage, setInterviewStage] = useState<InterviewStage>('welcome');
  
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [initialRoleForConfig, setInitialRoleForConfig] = useState<string | undefined>(undefined);

  const [quizQuestions, setQuizQuestions] = useState<MCQQuestion[]>([]);
  const [quizResults, setQuizResults] = useState<MCQResult[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationFinished(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  
  const handleLogout = useCallback(async () => {
    await apiService.logoutUser();
    setCurrentUser(null);
    setInterviewStage('welcome');
  }, []);

  useEffect(() => {
    const checkUserSession = async () => {
        const token = apiService.getToken();
        if (token) {
            try {
                const user = await apiService.getMe();
                setCurrentUser(user);
                setInterviewStage('home');
            } catch (error) {
                console.error("Session check failed:", error);
                // The apiClient now handles auto-logout on 401, but we still need to clear state here for other errors.
                if (localStorage.getItem(TOKEN_KEY)) {
                  apiService.logoutUser();
                }
                setCurrentUser(null);
                setInterviewStage('welcome');
            }
        } else {
            setInterviewStage('welcome');
        }
        setIsInitializing(false);
    };
    if (animationFinished) {
        checkUserSession();
    }
  }, [animationFinished]);

  const setView = useCallback((stage: InterviewStage) => {
    setInterviewStage(stage);
    
    // Reset session-specific state when navigating to a top-level view
    const topLevelViews: InterviewStage[] = ['home', 'profile', 'configuring', 'practice_arena', 'ats_scanner', 'settings'];
    if (topLevelViews.includes(stage)) {
        setCurrentReport(null);
        setInterviewConfig(null);
        setQuizQuestions([]);
        setQuizResults([]);
    }
  }, []);

  const navigateToView = useCallback((view: AppView) => {
    let stage: InterviewStage = 'home';
    switch (view) {
      case 'home': stage = 'home'; break;
      case 'dashboard': stage = 'profile'; break;
      case 'interview': stage = 'configuring'; break;
      case 'practice': stage = 'practice_arena'; break;
      case 'ats_scanner': stage = 'ats_scanner'; break;
      case 'settings': stage = 'settings'; break;
    }
    setView(stage);
  }, [setView]);

  const startInterviewWithRole = useCallback((role: string) => {
    setInitialRoleForConfig(role);
    setView('configuring');
  }, [setView]);

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    setView('home');
  }, [setView]);
  
  const handleUserUpdate = useCallback(async () => {
    if (currentUser) {
        try {
            const updatedUser = await apiService.getMe();
            setCurrentUser(updatedUser);
        } catch (error) {
            console.error("Failed to refetch user data after update:", error);
            // Error will be handled by apiClient, which reloads page
        }
    }
  }, [currentUser]);

  const handleStartPractice = useCallback((config: InterviewConfig) => {
    setInterviewConfig(config);
    setInitialRoleForConfig(undefined); 
    setView('instructions');
  }, [setView]);

  const proceedToNextStage = useCallback(() => {
    if (!interviewConfig) return;
    if (interviewConfig.mode === InterviewMode.MCQ_QUIZ) {
      setView('mcq_loading');
    } else if (interviewConfig.mode === InterviewMode.CODING_CHALLENGE) {
      setView('coding_challenge');
    } else {
      setView('interviewing');
    }
  }, [interviewConfig, setView]);

  useEffect(() => {
    if (interviewStage === 'mcq_loading' && interviewConfig) {
      const attemptQuizGeneration = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const questions = await apiService.generateMCQQuiz(interviewConfig.role);
            setQuizQuestions(questions);
            setView('mcq_quiz');
            return;
          } catch (error) {
            // Don't show alert if it's an auth error, as apiClient handles it
            if ((error as Error).message === 'Session expired') return;
              
            const err = error as Error;
            console.error(`Attempt ${i + 1} failed:`, err.message);
            if (i === retries - 1) {
              alert(`Could not generate the quiz after multiple attempts. Please try a different or more specific role.\n\nFinal Error: ${err.message}`);
              setView('practice_arena');
            }
            await new Promise(res => setTimeout(res, 500));
          }
        }
      };
      attemptQuizGeneration();
    }
  }, [interviewStage, interviewConfig, setView]);

  const handleFinishPractice = useCallback(async (reportData: Omit<Report, 'id' | 'timestamp'>) => {
    if (!currentUser) return;
    try {
        await apiService.saveReport(reportData);
        await handleUserUpdate();
        alert("Report saved! You can view it on your dashboard.");
        setView('practice_arena');
    } catch (error) {
        const err = error as Error;
        if (err.message === 'Session expired') return;
        alert(`Failed to save your report. Error: ${err.message}`);
        setView('practice_arena');
    }
  }, [currentUser, setView, handleUserUpdate]);

  const handleFinishInterview = useCallback(async (summary: string, deliveryAnalysis: DeliveryAnalysis, codingResults: CodingResult[], history: ChatMessage[]) => {
    if (!interviewConfig) return;
    const newUnsavedReport: Report = {
      config: interviewConfig,
      summary,
      deliveryAnalysis,
      codingResults,
      history,
    };
    setCurrentReport(newUnsavedReport);
    setView('summary');
  }, [interviewConfig, setView]);

  const handleSaveCurrentReport = useCallback(async () => {
    if (!currentReport || !currentUser) return;
    try {
        await apiService.saveReport(currentReport);
        await handleUserUpdate();
        alert('Report saved to your dashboard!');
        navigateToView('dashboard');
    } catch(err) {
        const error = err as Error;
        if (error.message === 'Session expired') return;
        alert(`Failed to save report: ${error.message}`);
    }
  }, [currentReport, currentUser, handleUserUpdate, navigateToView]);

  const handleFinishQuiz = useCallback((results: MCQResult[]) => {
      setQuizResults(results);
      setView('mcq_results');
  }, [setView]);
  
  const getActiveView = (stage: InterviewStage): AppView => {
    if (stage === 'profile') return 'dashboard';
    if (['configuring', 'interviewing', 'summary', 'instructions'].includes(stage) && interviewConfig?.mode === InterviewMode.FULL_INTERVIEW) return 'interview';
    if (['practice_arena', 'mcq_quiz_config', 'coding_challenge_config', 'mcq_quiz', 'coding_challenge', 'mcq_results', 'mcq_loading', 'instructions'].includes(stage)) return 'practice';
    if (stage === 'ats_scanner') return 'ats_scanner';
    if (stage === 'settings') return 'settings';
    return 'home';
  };
  
  const appContextValue = useMemo(() => ({
    currentUser,
    navigateToView,
    navigateToStage: setView,
    startInterviewWithRole,
    logout: handleLogout,
    updateUser: handleUserUpdate,
  }), [currentUser, navigateToView, setView, startInterviewWithRole, handleLogout, handleUserUpdate]);

  const renderContent = () => {
    if (isInitializing) {
        return <div className="flex h-full w-full items-center justify-center"><LoadingSpinner className="h-12 w-12 text-cyber-glow" /><p className="ml-4 font-orbitron text-xl">Connecting to Server...</p></div>;
    }

    if (!currentUser) {
        switch (interviewStage) {
            case 'login':
                return <LoginScreen onLoginSuccess={handleLoginSuccess} onNavigateToSignUp={() => setView('signup')} />;
            case 'signup':
                return <SignUpScreen onSignUpSuccess={handleLoginSuccess} onNavigateToLogin={() => setView('login')} />;
            case 'welcome':
            default:
                return <WelcomeScreen onNavigateToLogin={() => setView('login')} onNavigateToSignUp={() => setView('signup')} />;
        }
    }

    switch(interviewStage) {
      case 'home':
        return <HomeScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'ats_scanner':
        return <AtsScannerScreen />;
      case 'settings':
         return <ProfileSettingsScreen />;
      
      case 'configuring':
         return <ConfigurationScreen onStart={handleStartPractice} initialRole={initialRoleForConfig} />;
      case 'practice_arena':
        return <PracticeArenaScreen />;
      case 'mcq_quiz_config':
         return <MCQQuizConfigScreen onStart={handleStartPractice} />;
      case 'coding_challenge_config':
         return <CodingChallengeConfigScreen onStart={handleStartPractice} />;

      case 'instructions':
        return interviewConfig && <InstructionModal config={interviewConfig} onConfirm={proceedToNextStage} onCancel={() => setView(interviewConfig.mode === InterviewMode.FULL_INTERVIEW ? 'configuring' : 'practice_arena')} />;
      case 'interviewing':
        return interviewConfig && <InterviewScreen config={interviewConfig} onFinish={handleFinishInterview} />;
      case 'summary':
        return currentReport && (
            <SummaryScreen 
                report={currentReport} 
                onSave={handleSaveCurrentReport} 
                onBack={() => setView(currentReport.config.mode === InterviewMode.FULL_INTERVIEW ? 'home' : 'practice_arena')} 
            />
        );
      case 'mcq_loading':
        return <div className="flex h-full w-full items-center justify-center"><LoadingSpinner className="h-12 w-12 text-cyber-glow" /><p className="ml-4 font-orbitron text-xl">Generating Quiz...</p></div>;
      case 'mcq_quiz':
        return <MCQScreen questions={quizQuestions} onFinish={handleFinishQuiz} />;
      case 'mcq_results':
        return interviewConfig && <MCQResultsScreen results={quizResults} config={interviewConfig} onSaveAndExit={handleFinishPractice} />;
      case 'coding_challenge':
        return interviewConfig && <CodingScreen config={interviewConfig} onFinish={handleFinishPractice} />;

      default:
        return <HomeScreen />;
    }
  };

  return (
    <AppProvider value={appContextValue}>
      {!animationFinished ? <WelcomeAnimation /> : null}
      <div className="bg-cyber-bg text-cyber-text font-mono w-full h-screen flex flex-col">
        <NavBar activeView={getActiveView(interviewStage)} />
        <main className="flex-1 overflow-y-auto relative">
            {animationFinished && renderContent()}
        </main>
      </div>
    </AppProvider>
  );
};

export default App;