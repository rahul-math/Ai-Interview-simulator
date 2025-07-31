

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InterviewConfig, ChatMessage, InterviewMode, DeliveryAnalysis, InterviewRound, CodingResult } from '../types';
import { apiService } from '../services/apiService';
import { useSpeech } from '../hooks/useSpeech';
import AIViewfinder from './AIViewfinder';
import UserCameraView from './UserCameraView';
import { LoadingSpinner, PaperAirplaneIcon, MicrophoneIcon, StopIcon, StopCircleIcon } from './Icons';
import InterviewCodingView from './InterviewCodingView';

interface InterviewScreenProps {
  config: InterviewConfig;
  onFinish: (summary: string, deliveryAnalysis: DeliveryAnalysis, codingResults: CodingResult[], history: ChatMessage[]) => void;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ config, onFinish }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // States for in-interview coding challenge
  const [subStage, setSubStage] = useState<'talking' | 'coding' | 'reviewing'>('talking');
  const [codingQuestions, setCodingQuestions] = useState<string[]>([]);
  const [codingSolutions, setCodingSolutions] = useState<string[]>(['', '']);
  const [activeCodingQuestionIndex, setActiveCodingQuestionIndex] = useState(0);
  const [submittedCodingQuestionIndices, setSubmittedCodingQuestionIndices] = useState<number[]>([]);
  const [codingLanguage, setCodingLanguage] = useState('JavaScript');
  const [codingResults, setCodingResults] = useState<CodingResult[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isTranslatingCode, setIsTranslatingCode] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const isTechnicalScreen = config.mode === InterviewMode.FULL_INTERVIEW && config.round === InterviewRound.TECHNICAL;

  // For delivery analysis
  const userResponsesRef = useRef<{ transcript: string; startTime: number; endTime: number }[]>([]);
  const speechStartTimeRef = useRef<number>(0);
  const finalTranscriptRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleFinalTranscript = useCallback((transcript: string) => {
    if (subStage !== 'talking') return;
    finalTranscriptRef.current += ' ' + transcript;
    setUserInput(finalTranscriptRef.current.trim());
    if (speechStartTimeRef.current > 0) {
      userResponsesRef.current.push({
        transcript: transcript.trim(),
        startTime: speechStartTimeRef.current,
        endTime: Date.now(),
      });
      speechStartTimeRef.current = 0; // Reset after capturing
    }
  }, [subStage]);
  
  const handleInterimTranscript = useCallback((transcript: string) => {
    if (subStage !== 'talking') return;
    setUserInput(finalTranscriptRef.current.trim() + ' ' + transcript);
  }, [subStage]);

  const { isApiSupported, isRecording, isSpeaking, startRecording, stopRecording, speak } = useSpeech({
    onTranscript: handleInterimTranscript,
    onFinalTranscript: handleFinalTranscript,
  });

  const finishInterviewAndAnalyze = useCallback(async (summary: string, finalCodingResults: CodingResult[], history: ChatMessage[]) => {
      // 1. Calculate WPM
      const { totalWords, totalDurationSeconds } = userResponsesRef.current.reduce(
          (acc, res) => {
              acc.totalWords += res.transcript.split(/\s+/).filter(Boolean).length;
              acc.totalDurationSeconds += (res.endTime - res.startTime) / 1000;
              return acc;
          },
          { totalWords: 0, totalDurationSeconds: 0 }
      );
      const wordsPerMinute = totalDurationSeconds > 0 ? Math.round((totalWords / totalDurationSeconds) * 60) : 0;
      
      // 2. Analyze filler words
      const fullTranscript = userResponsesRef.current.map(res => res.transcript).join(' ');
      const fillerWords = await apiService.analyzeDelivery(fullTranscript);
  
      const deliveryAnalysis: DeliveryAnalysis = { wordsPerMinute, fillerWords };
      
      // 3. Call onFinish with everything
      onFinish(summary, deliveryAnalysis, finalCodingResults, history);
  }, [onFinish]);
  
  const handleSendMessage = useCallback(async (event?: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.preventDefault();
    const messageContent = userInput.trim();

    if (!messageContent || isProcessing || isSpeaking) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user' as const, content: messageContent }];
    setMessages(newMessages);
    setUserInput('');
    finalTranscriptRef.current = '';
    setIsProcessing(true);

    try {
      const responseText = await apiService.getChatResponse(config, messages, messageContent);
      const isDrillEnding = config.mode === InterviewMode.PRACTICE_DRILL && responseText.includes("Drill complete.");
      
      const finalHistory = [...newMessages, { role: 'model' as const, content: responseText }];
      if (isDrillEnding) {
          await finishInterviewAndAnalyze(responseText, [], finalHistory);
      } else {
          setMessages(finalHistory);
          speak(responseText, () => {
              setIsProcessing(false);
          });
      }
    } catch (error) {
      const err = error as Error;
      console.error("Failed to send message:", err);
      const errorMessage = `A transmission error occurred:\n\n${err.message}`;
      setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
      speak(errorMessage, () => {
        setIsProcessing(false);
      });
    }
  }, [userInput, isProcessing, isSpeaking, speak, config, messages, finishInterviewAndAnalyze]);

  const handleEndInterview = useCallback(async (finalCodingResults: CodingResult[] = codingResults) => {
    if (isProcessing) return;
    setIsProcessing(true);
    let endMessage: string;
    let finalMessages: ChatMessage[];

    if (isTechnicalScreen && finalCodingResults.length === 2) {
        finalMessages = [...messages, { role: 'user', content: "[Both solutions submitted. Ending session.]" }];
        endMessage = `END_INTERVIEW\n\n[Candidate has submitted both solutions. Use these reviews to generate your summary:\n\nReview 1:\n${finalCodingResults[0].feedback}\n\nReview 2:\n${finalCodingResults[1].feedback}]`;
    } else {
        finalMessages = [...messages, { role: 'user', content: "[Session Concluded]" }];
        endMessage = 'END_INTERVIEW';
    }
    
    setMessages(finalMessages);

    try {
        const responseText = await apiService.getChatResponse(config, finalMessages, endMessage);
        const finalHistory = [...finalMessages, { role: 'model' as const, content: responseText }];
        await finishInterviewAndAnalyze(responseText, finalCodingResults, finalHistory);
    } catch (error) {
        const err = error as Error;
        console.error("Failed to end interview:", err);
        await finishInterviewAndAnalyze(`Sorry, there was an error generating your summary. Details: ${err.message}`, finalCodingResults, messages);
    }
  }, [isProcessing, isTechnicalScreen, codingResults, finishInterviewAndAnalyze, messages, config]);
  
  const handleEndInterviewRef = useRef(handleEndInterview);
  handleEndInterviewRef.current = handleEndInterview;

  const handleSubmitCode = useCallback(async () => {
    if (!codingQuestions[activeCodingQuestionIndex] || !codingSolutions[activeCodingQuestionIndex].trim()) return;
    setIsSubmittingCode(true);
    setSubStage('reviewing');
    try {
        const reviewText = await apiService.reviewCodingSolution(codingQuestions[activeCodingQuestionIndex], codingSolutions[activeCodingQuestionIndex], codingLanguage);
        const newCodingResult: CodingResult = { 
            question: codingQuestions[activeCodingQuestionIndex], 
            code: codingSolutions[activeCodingQuestionIndex], 
            feedback: reviewText 
        };
        const newCodingResults = [...codingResults, newCodingResult];
        setCodingResults(newCodingResults);
        
        const newSubmittedIndices = [...submittedCodingQuestionIndices, activeCodingQuestionIndex];
        setSubmittedCodingQuestionIndices(newSubmittedIndices);

        if (newSubmittedIndices.length === 2) {
            // End of interview. We have both results in `newCodingResults`.
            handleEndInterviewRef.current(newCodingResults);
        } else {
             // Switch to the other question if not submitted
            const nextIndex = activeCodingQuestionIndex === 0 ? 1 : 0;
            setActiveCodingQuestionIndex(nextIndex);
            setSubStage('coding');
        }
    } catch(error) {
        const err = error as Error;
        console.error("Failed to review code:", err);
        alert(`Sorry, I had an issue analyzing your code. Please try submitting again.\n\nError: ${err.message}`);
        setSubStage('coding');
    } finally {
        setIsSubmittingCode(false);
    }
  }, [activeCodingQuestionIndex, codingQuestions, codingSolutions, codingLanguage, codingResults, submittedCodingQuestionIndices]);

  const handleLanguageChange = async (newLanguage: string) => {
    if (subStage !== 'coding' || newLanguage === codingLanguage || isGeneratingQuestions || isProcessing || isTranslatingCode || isSubmittingCode) return;

    const codeToTranslate = codingSolutions[activeCodingQuestionIndex];
    if (!codeToTranslate.trim()) {
        setCodingLanguage(newLanguage);
        return;
    }

    const confirmed = window.confirm("This will translate your current code for this question to the new language. Proceed?");
    if (!confirmed) return;

    setIsTranslatingCode(true);
    try {
        const translatedCode = await apiService.translateCode(codeToTranslate, codingLanguage, newLanguage);
        const newSolutions = [...codingSolutions];
        newSolutions[activeCodingQuestionIndex] = translatedCode;
        setCodingSolutions(newSolutions);
        setCodingLanguage(newLanguage);
    } catch (error) {
        const err = error as Error;
        console.error("Failed to translate code:", err);
        alert(`Sorry, I had an issue translating your code. The original code has been kept.\n\nError: ${err.message}`);
    } finally {
        setIsTranslatingCode(false);
    }
  };

  const handleCodeChange = (newCode: string, index: number) => {
    const newSolutions = [...codingSolutions];
    newSolutions[index] = newCode;
    setCodingSolutions(newSolutions);
  };

  const previousIsRecording = useRef(isRecording);
  useEffect(() => {
    if (subStage === 'talking' && previousIsRecording.current && !isRecording && userInput.trim()) {
      handleSendMessage();
    }
    previousIsRecording.current = isRecording;
  }, [isRecording, userInput, handleSendMessage, subStage]);

  const initializeChat = useCallback(async () => {
    setIsProcessing(true);
    try {
      const responseText = await apiService.getChatResponse(config, [], "Hello, let's begin.");
      setMessages([{ role: 'model', content: responseText }]);
      speak(responseText, () => {
        setIsProcessing(false);
      });
    } catch (error) {
      const err = error as Error;
      console.error("Failed to initialize chat:", err);
      const errorMessage = `A critical connection error occurred:\n\n${err.message}`;
      setMessages([{ role: 'model', content: errorMessage }]);
      setIsProcessing(false);
    }
  }, [config, speak]);

  const generateBothCodingChallenges = useCallback(async () => {
    setIsGeneratingQuestions(true);
    try {
        const [q1, q2] = await Promise.all([
            apiService.generateTechnicalCodingQuestion(config.role, codingLanguage),
            apiService.generateTechnicalCodingQuestion(config.role, codingLanguage)
        ]);
        setCodingQuestions([q1, q2]);
        setSubStage('coding');
    } catch (error) {
      const err = error as Error;
        console.error("Failed to generate coding questions:", err);
        const errorMessage = `I had an issue generating the coding problems. The session will now end.\n\nDetails: ${err.message}`;
        setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
        speak(errorMessage, () => {
            onFinish(`Error: Could not generate coding problems. Reason: ${err.message}`, { wordsPerMinute: 0, fillerWords: {} }, [], messages);
        });
    } finally {
        setIsGeneratingQuestions(false);
    }
  }, [config.role, codingLanguage, speak, onFinish, messages]);

  useEffect(() => {
      if (isTechnicalScreen && messages.length === 1 && subStage === 'talking' && !isProcessing && !isSpeaking) {
          generateBothCodingChallenges();
      }
  }, [isTechnicalScreen, messages.length, subStage, isProcessing, isSpeaking, generateBothCodingChallenges]);

  useEffect(() => {
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (config.mode !== InterviewMode.FULL_INTERVIEW || (isProcessing && messages.length === 0)) {
        return;
    }

    const timerId = setInterval(() => {
        setTimeLeft(prevTime => {
            if (prevTime <= 1) {
                clearInterval(timerId);
                handleEndInterviewRef.current();
                return 0;
            }
            return prevTime - 1;
        });
    }, 1000);

    return () => clearInterval(timerId);
  }, [config.mode, isProcessing, messages.length]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      finalTranscriptRef.current = '';
      setUserInput('');
      speechStartTimeRef.current = Date.now();
      startRecording();
    }
  };

  const getLoadingContextText = () => {
      if (isGeneratingQuestions) return `Generating coding challenges for ${config.role}...`;
      if (config.mode === InterviewMode.PRACTICE_DRILL) {
          return `${config.role} | ${config.drillType}`;
      }
      return `${config.role} | ${config.level} | ${config.round}`;
  }

  return (
    <div className="relative h-full w-full font-mono">
        {/* Normal Talking View */}
        <div className={`w-full h-full flex flex-col md:flex-row gap-4 p-4 bg-cyber-surface/30 ${subStage !== 'talking' ? 'invisible' : 'visible'}`}>
            <div className="flex flex-col flex-1 gap-4 h-full min-h-0">
                <div className="flex-[2] min-h-0">
                   <AIViewfinder />
                </div>
                <div className="flex-[3] min-h-0 flex flex-col bg-black/50 p-4 rounded-lg border border-cyber-border/20">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {messages.map((msg, index) => (
                             <div key={index} className={`flex items-start gap-3 max-w-lg lg:max-w-xl ${msg.role === 'user' ? 'justify-end ml-auto' : 'justify-start mr-auto'}`}>
                                 {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-cyber-border text-cyber-bg flex items-center justify-center font-bold flex-shrink-0 font-orbitron">AI</div>}
                                 <div className={`p-3 rounded-lg text-cyber-text ${msg.role === 'user' ? 'bg-cyber-accent/80' : 'bg-cyber-surface'}`}>
                                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                 </div>
                             </div>
                        ))}
                        {isProcessing && !isSpeaking && messages.length > 0 && subStage === 'talking' && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyber-border text-cyber-bg flex items-center justify-center font-bold flex-shrink-0 font-orbitron">AI</div>
                                <div className="max-w-lg p-3 rounded-lg bg-cyber-surface text-gray-200 flex items-center">
                                    <LoadingSpinner className="w-5 h-5 mr-3 text-cyber-glow" />
                                    <span className="animate-flicker">ANALYZING...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4">
                <UserCameraView />
                <div className="flex-1 flex flex-col gap-2 bg-black/50 p-4 rounded-lg border border-cyber-border/20">
                    <h3 className="font-orbitron text-lg text-center text-cyber-glow animate-flicker">TRANSMISSION</h3>
                    <div className="relative flex-grow min-h-0">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={isSpeaking ? "Receiving..." : isRecording ? "Transmitting..." : "Awaiting input..."}
                            className="w-full h-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 resize-none focus:ring-2 focus:ring-cyber-glow focus:border-cyber-glow disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                            disabled={isRecording || isSpeaking || isProcessing}
                        />
                    </div>
                     <div className="flex items-center justify-center gap-4 pt-2">
                         {isApiSupported ? (
                             <button 
                                 type="button" 
                                 onClick={handleMicClick} 
                                 disabled={isSpeaking || isProcessing}
                                 title={isRecording ? 'Stop Transmission' : 'Open Channel'}
                                 className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-200 ease-in-out border-2 border-transparent ${isRecording ? 'bg-red-500/80 shadow-accent-glow' : 'bg-cyber-border/80'} disabled:bg-gray-500 disabled:cursor-not-allowed hover:border-white`}
                             >
                                 {isRecording ? <StopIcon className="w-8 h-8" /> : <MicrophoneIcon className="w-8 h-8"/>}
                             </button>
                         ) : (
                             <button type="button" onClick={handleSendMessage} disabled={isProcessing || !userInput.trim()} className="p-4 rounded-full bg-cyber-border text-cyber-bg disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-white transition-colors">
                                 <PaperAirplaneIcon className="w-6 h-6"/>
                             </button>
                         )}
                     </div>
                </div>
                
                { config.mode === InterviewMode.FULL_INTERVIEW &&
                    <div className="flex flex-col gap-2">
                        <div className="text-center font-orbitron p-3 bg-black/50 rounded-md border border-cyber-border/20">
                            <p className="text-xs text-cyber-text/70 tracking-widest">TIME REMAINING</p>
                            <p className={`text-3xl font-bold transition-colors ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-cyber-glow'}`}>
                                {formatTime(timeLeft)}
                            </p>
                        </div>
                        <button onClick={() => handleEndInterview()} disabled={isProcessing || isRecording || isSpeaking || subStage !== 'talking'} className="w-full font-orbitron text-lg flex items-center justify-center gap-3 p-4 bg-red-600/80 text-white rounded-md hover:bg-red-500 hover:shadow-accent-glow transition-all disabled:bg-gray-600/50 disabled:cursor-not-allowed disabled:text-gray-400">
                            <StopCircleIcon className="w-6 h-6" />
                            END SESSION
                        </button>
                    </div>
                }
            </div>
        </div>

        {/* Full Screen Coding View */}
        {subStage === 'coding' && codingQuestions.length === 2 && (
            <InterviewCodingView
                questions={codingQuestions}
                solutions={codingSolutions}
                activeQuestionIndex={activeCodingQuestionIndex}
                onQuestionToggle={setActiveCodingQuestionIndex}
                submittedIndices={submittedCodingQuestionIndices}
                onCodeChange={handleCodeChange}
                language={codingLanguage}
                onLanguageChange={handleLanguageChange}
                onSubmit={handleSubmitCode}
                isSubmitting={isSubmittingCode}
                isTranslating={isTranslatingCode}
            />
        )}
        
        {subStage === 'reviewing' && (
            <div className="absolute inset-0 bg-cyber-bg/95 flex flex-col items-center justify-center z-50">
                <LoadingSpinner className="w-12 h-12 mb-4 text-cyber-glow" />
                <p className="font-orbitron text-2xl text-cyber-glow animate-flicker">ANALYZING SOLUTIONS...</p>
                <p className="text-cyber-text mt-2">Finalizing your report.</p>
            </div>
        )}


        {/* Global Loading Spinner */}
        {(isProcessing && messages.length === 0 || isGeneratingQuestions) && (
            <div className="absolute inset-0 bg-cyber-bg/95 flex flex-col items-center justify-center z-50">
                <LoadingSpinner className="w-12 h-12 mb-4 text-cyber-glow" />
                <p className="font-orbitron text-2xl text-cyber-glow animate-flicker">{isGeneratingQuestions ? 'GENERATING CHALLENGES...' : 'ESTABLISHING CONNECTION...'}</p>
                <p className="text-cyber-text mt-2">{getLoadingContextText()}</p>
            </div>
        )}
    </div>
  );
};

export default InterviewScreen;
