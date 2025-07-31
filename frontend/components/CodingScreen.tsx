
import React, { useState, useCallback, useEffect } from 'react';
import { DSAQuestion, TestCaseResult, DSATestCase, InterviewConfig, Report } from '../types';
import { apiService } from '../services/apiService';
import { CheckCircleIcon, LightBulbIcon, LoadingSpinner, XCircleIcon, PlayIcon } from './Icons';
import MarkdownContent from './MarkdownContent';
import CodeEditor from './CodeEditor';
import { PROGRAMMING_LANGUAGES } from '../constants';
import { useApp } from '../hooks/useAppContext';

interface CodingScreenProps {
  config: InterviewConfig;
  onFinish: (reportData: Omit<Report, 'id' | 'timestamp'>) => void;
}

type ActiveTab = 'testcases' | 'result' | 'review';

const CodingScreen: React.FC<CodingScreenProps> = ({ config, onFinish }) => {
  const { navigateToStage } = useApp();
  const [question, setQuestion] = useState<DSAQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(config.language!);
  const [review, setReview] = useState<string | null>(null);
  const [runResults, setRunResults] = useState<TestCaseResult[] | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('testcases');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSolution, setIsLoadingSolution] = useState(false);
  const [testCases, setTestCases] = useState<DSATestCase[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const generateNewQuestion = useCallback(async (lang: string) => {
      setIsLoadingQuestion(true);
      setCode('');
      setReview(null);
      setRunResults(null);
      setQuestion(null);
      setActiveTab('testcases');
      setIsSubmitted(false);
      try {
          const dsaConfig = { ...config, language: lang };
          const newQuestionData = await apiService.generateDSAQuestion(dsaConfig);
          setQuestion(newQuestionData);
          setTestCases(newQuestionData.testCases);
      } catch (error) {
          const err = error as Error;
          console.error("Failed to generate DSA question:", err);
          alert(`Could not generate the coding challenge. Returning to the previous screen.\n\nError: ${err.message}`);
          navigateToStage('practice_arena');
      } finally {
          setIsLoadingQuestion(false);
      }
  }, [config, navigateToStage]);

  useEffect(() => {
    if (config.language) {
      generateNewQuestion(config.language);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = isRunning || isSubmitting || isLoadingSolution || isLoadingQuestion || isTranslating;

  const handleLanguageChange = async (newLanguage: string) => {
    if (isLoading || newLanguage === language) return;

    if (!code.trim()) {
        setLanguage(newLanguage);
        return;
    }

    const confirmed = window.confirm(`This will attempt to translate your current code from ${language} to ${newLanguage}. The question will remain the same. Machine translation may not be perfect. Continue?`);
    if (confirmed) {
        setIsTranslating(true);
        try {
            const translatedCode = await apiService.translateCode(code, language, newLanguage);
            setCode(translatedCode);
            setLanguage(newLanguage);
        } catch (error) {
            console.error("Failed to translate code:", error);
            alert("Sorry, an error occurred during translation. Your code and language have not been changed.");
        } finally {
            setIsTranslating(false);
        }
    }
  };

  const handleRun = useCallback(async () => {
    if (!question || !code.trim() || isLoading) return;
    setIsRunning(true);
    setRunResults(null);
    setActiveTab('result');
    try {
      const results = await apiService.runDSACode(question, code, language);
      setRunResults(results);
    } catch (error) {
      const err = error as Error;
      console.error(err);
      setRunResults([{ input: 'Error', expected: '', actual: `Failed to run code: ${err.message}`, passed: false }]);
    }
    setIsRunning(false);
  }, [code, question, language, isLoading]);

  const handleSubmitReview = useCallback(async () => {
    if (!question || !code.trim() || isLoading) return;
    setIsSubmitting(true);
    setReview(null);
    setActiveTab('review');
    try {
      const reviewText = await apiService.reviewDSACode(question, code, language);
      setReview(reviewText);
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      setReview('Error: Could not get code review. Please try again.');
    }
    setIsSubmitting(false);
  }, [code, question, language, isLoading]);

  const handleSaveAndExit = () => {
    if (!question || !review || isLoading) return;
    const reportData = {
      config: config,
      summary: `### Coding Challenge Review: ${question.title}\n\n${review}`,
      deliveryAnalysis: { wordsPerMinute: 0, fillerWords: {} },
      codingResults: [{ question: question.title, code, feedback: review }],
    };
    onFinish(reportData);
  };

  const handleNewQuestion = () => {
    if (isLoading) return;
    generateNewQuestion(language);
  };

  const handleShowSolution = useCallback(async () => {
    if (!question || isLoadingSolution) return;
    setIsLoadingSolution(true);
    setActiveTab('testcases');
    try {
      const solution = await apiService.getDSASolution(question, language);
      setCode(solution);
    } catch (error) {
      console.error(error);
      setReview('Error: Could not get the solution. Please try again.');
      setActiveTab('review');
    }
    setIsLoadingSolution(false);
  }, [question, language, isLoadingSolution]);
  
  if (isLoadingQuestion || !question) {
    return (
        <div className="h-full w-full mx-auto flex items-center justify-center p-4 font-mono">
            <div className="flex flex-col items-center justify-center text-center">
                <LoadingSpinner className="w-12 h-12 mb-4 text-cyber-glow" />
                <p className="font-orbitron text-2xl text-cyber-glow animate-flicker">GENERATING DSA CHALLENGE...</p>
                <p className="text-cyber-text mt-2">Crafting a {config.dsaDifficulty} problem in {language} on {config.dsaTopic}...</p>
            </div>
        </div>
    );
  }

  const TabButton: React.FC<{tabId: ActiveTab, children: React.ReactNode}> = ({ tabId, children }) => (
    <button
        onClick={() => setActiveTab(tabId)}
        className={`px-4 py-2 text-sm font-orbitron transition-colors ${activeTab === tabId ? 'text-cyber-glow border-b-2 border-cyber-glow' : 'text-cyber-text/70 hover:text-white'}`}
    >
        {children}
    </button>
  );

  return (
    <div className="h-full w-full mx-auto flex flex-col md:flex-row gap-4 p-4 font-mono bg-cyber-surface/30">
      {/* Left Panel: Problem Statement */}
      <div className="w-full md:w-2/5 flex flex-col gap-4 overflow-y-auto pr-2">
        <div className="flex-1 bg-black/50 p-6 rounded-lg border border-cyber-border/20">
          <h1 className="font-orbitron text-2xl text-cyber-glow mb-4">{question.title}</h1>
          <MarkdownContent content={question.description} />
          
          <h2 className="font-orbitron text-lg text-cyber-glow mt-6 mb-2">Examples</h2>
          {question.examples.map((ex, i) => (
            <pre key={i} className="bg-cyber-bg p-3 rounded-md text-cyber-text/80 text-sm mb-2"><code>{ex}</code></pre>
          ))}

          <h2 className="font-orbitron text-lg text-cyber-glow mt-6 mb-2">Constraints</h2>
          <ul className="list-disc list-inside text-cyber-text/90">
            {question.constraints.map((con, i) => (
              <li key={i}>{con}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel: Code Editor and Feedback */}
      <div className="w-full md:w-3/5 flex flex-col gap-4">
        <div className="flex-1 flex flex-col bg-black/50 rounded-lg border border-cyber-border/20 min-h-0">
            <div className="flex justify-between items-center p-3 border-b border-cyber-border/20">
                <div className="flex items-center gap-2">
                    {isTranslating && <LoadingSpinner className="w-5 h-5 text-cyber-glow" />}
                    <label htmlFor="language-select" className="sr-only">Programming Language</label>
                    <select
                        id="language-select"
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        disabled={isLoading}
                        className="font-orbitron text-lg bg-cyber-bg border border-cyber-border/30 text-cyber-glow rounded-md p-1 focus:ring-2 focus:ring-cyber-glow focus:border-cyber-glow disabled:opacity-50"
                    >
                        {PROGRAMMING_LANGUAGES.map(lang => (
                            <option key={lang} value={lang} className="bg-cyber-bg font-mono text-base text-cyber-text">{lang}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleShowSolution} disabled={isLoading} className="flex items-center gap-2 text-sm px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-md hover:bg-yellow-500/40 disabled:opacity-50 transition-colors">
                        {isLoadingSolution ? <LoadingSpinner className="w-4 h-4" /> : <LightBulbIcon className="w-4 h-4" />} Show Answer
                    </button>
                    <button onClick={() => navigateToStage('practice_arena')} className="flex items-center gap-2 text-sm px-3 py-1 bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/40 transition-colors">
                        <XCircleIcon className="w-4 h-4" /> Exit
                    </button>
                </div>
            </div>
            <CodeEditor language={language} value={code} onChange={setCode} />
        </div>

        <div className="flex-1 flex flex-col bg-black/50 rounded-lg border border-cyber-border/20 min-h-0">
            <div className="flex items-center border-b border-cyber-border/20 px-4">
                <TabButton tabId="testcases">Test Cases</TabButton>
                <TabButton tabId="result">Result</TabButton>
                <TabButton tabId="review">AI Review</TabButton>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === 'testcases' && (
                    <div className="space-y-3">
                        {testCases.map((tc, index) => (
                            <div key={index}>
                                <h4 className="text-sm text-cyber-text/80 mb-1">Case {index + 1}</h4>
                                <div className="space-y-2">
                                    <pre className="bg-cyber-bg p-2 rounded-md text-cyber-text/80 text-sm"><strong>Input:</strong> {tc.input}</pre>
                                    <pre className="bg-cyber-bg p-2 rounded-md text-cyber-text/80 text-sm"><strong>Output:</strong> {tc.expectedOutput}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'result' && (
                    <div>
                        {isRunning && <div className="flex items-center justify-center h-full"><LoadingSpinner className="w-8 h-8 text-cyber-glow"/></div>}
                        {!isRunning && !runResults && <p className="text-cyber-text/60">Run your code to see the results here.</p>}
                        {runResults && (
                            <div className="space-y-4">
                                {runResults.map((res, i) => (
                                    <div key={i} className={`p-3 rounded-md border-l-4 ${res.passed ? 'border-green-400 bg-green-900/30' : 'border-red-400 bg-red-900/30'}`}>
                                        <h4 className={`text-lg font-bold ${res.passed ? 'text-green-300' : 'text-red-300'}`}>Case {i+1}: {res.passed ? 'Passed' : 'Failed'}</h4>
                                        <div className="text-sm space-y-2 mt-2">
                                            <p><strong className="text-cyber-text/70">Input:</strong><code className="ml-2 bg-black/30 p-1 rounded">{res.input}</code></p>
                                            <p><strong className="text-cyber-text/70">Output:</strong><code className="ml-2 bg-black/30 p-1 rounded">{res.actual}</code></p>
                                            {!res.passed && <p><strong className="text-cyber-text/70">Expected:</strong><code className="ml-2 bg-black/30 p-1 rounded">{res.expected}</code></p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'review' && (
                    <div>
                        {isSubmitting && <div className="flex items-center justify-center h-full"><LoadingSpinner className="w-8 h-8 text-cyber-glow"/></div>}
                        {!isSubmitting && !review && <p className="text-cyber-text/60">Submit your code to receive a qualitative review from the AI.</p>}
                        {review && <MarkdownContent content={review} />}
                    </div>
                )}
            </div>
            <div className="flex gap-4 p-3 border-t border-cyber-border/20">
                {isSubmitted ? (
                    <>
                        <button onClick={handleNewQuestion} disabled={isLoading} className="flex-1 font-orbitron text-lg flex items-center justify-center gap-3 p-3 bg-cyber-surface/80 border border-cyber-border text-white rounded-md hover:bg-cyber-surface disabled:opacity-50 transition-colors">
                            New Question
                        </button>
                        <button onClick={handleSaveAndExit} disabled={isLoading} className="flex-1 font-orbitron text-lg flex items-center justify-center gap-3 p-3 bg-cyber-accent text-white rounded-md hover:bg-cyber-accent/80 hover:shadow-accent-glow disabled:opacity-50 transition-all">
                            Save & Exit
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={handleRun} disabled={isLoading || !code.trim()} className="flex-1 font-orbitron text-lg flex items-center justify-center gap-3 p-3 bg-cyber-surface/80 border border-cyber-border text-white rounded-md hover:bg-cyber-surface disabled:opacity-50 transition-colors">
                            {isRunning ? <LoadingSpinner className="w-6 h-6"/> : <PlayIcon className="w-6 h-6" />}
                            {isRunning ? 'Running...' : 'Run'}
                        </button>
                        <button onClick={handleSubmitReview} disabled={isLoading || !code.trim()} className="flex-1 font-orbitron text-lg flex items-center justify-center gap-3 p-3 bg-cyber-border text-cyber-bg rounded-md hover:bg-white hover:shadow-glow disabled:opacity-50 transition-all">
                            {isSubmitting ? <LoadingSpinner className="w-6 h-6"/> : <CheckCircleIcon className="w-6 h-6" />}
                            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodingScreen;