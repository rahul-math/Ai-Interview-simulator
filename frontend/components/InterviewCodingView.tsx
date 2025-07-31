

import React from 'react';
import { LoadingSpinner, CodeBracketIcon, CheckCircleIcon } from './Icons';
import CodeEditor from './CodeEditor';
import { PROGRAMMING_LANGUAGES } from '../constants';

interface InterviewCodingViewProps {
  questions: string[];
  solutions: string[];
  activeQuestionIndex: number;
  submittedIndices: number[];
  onQuestionToggle: (index: number) => void;
  onCodeChange: (code: string, index: number) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isTranslating?: boolean;
}

const InterviewCodingView: React.FC<InterviewCodingViewProps> = ({
  questions,
  solutions,
  activeQuestionIndex,
  submittedIndices,
  onQuestionToggle,
  onCodeChange,
  language,
  onLanguageChange,
  onSubmit,
  isSubmitting,
  isTranslating,
}) => {
  return (
    <div className="absolute inset-0 bg-cyber-bg z-40 p-4 flex flex-col md:flex-row gap-4 font-mono">
       {/* Left Panel: Problem Statement */}
       <div className="w-full md:w-2/5 flex flex-col bg-black/50 p-6 rounded-lg border border-cyber-border/20 overflow-y-auto">
          <h1 className="font-orbitron text-2xl text-cyber-glow mb-4 animate-flicker">Technical Challenge</h1>
          <p className="text-cyber-text/90 whitespace-pre-wrap text-lg leading-relaxed">{questions[activeQuestionIndex]}</p>
       </div>

      {/* Right Panel: Code Editor */}
      <div className="w-full md:w-3/5 flex flex-col">
        <div className="flex-1 flex flex-col bg-black/50 rounded-lg border border-cyber-border/20 min-h-0">
          <div className="flex justify-between items-center p-3 border-b border-cyber-border/20">
            <div className="flex gap-1 bg-cyber-bg p-1 rounded-md">
                {questions.map((_, index) => (
                <button
                    key={index}
                    onClick={() => onQuestionToggle(index)}
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-orbitron transition-colors ${activeQuestionIndex === index ? 'bg-cyber-border text-cyber-bg' : 'text-cyber-text/70 hover:bg-cyber-surface'}`}
                >
                    {submittedIndices.includes(index) && <CheckCircleIcon className="w-4 h-4" />}
                    Question {index + 1}
                </button>
                ))}
            </div>
            <div className="flex items-center gap-2">
              {isTranslating && <LoadingSpinner className="w-5 h-5 text-cyber-glow animate-spin"/>}
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                disabled={isSubmitting || isTranslating}
                className="font-mono text-sm bg-cyber-bg border border-cyber-border/30 text-cyber-glow rounded-md p-1 focus:ring-2 focus:ring-cyber-glow disabled:opacity-50"
              >
                {PROGRAMMING_LANGUAGES.map(lang => <option key={lang} value={lang} className="bg-cyber-bg text-cyber-text">{lang}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1 relative">
             <CodeEditor language={language} value={solutions[activeQuestionIndex]} onChange={(newCode) => onCodeChange(newCode, activeQuestionIndex)} />
             {isSubmitting && (
                <div className="absolute inset-0 bg-cyber-bg/80 flex flex-col items-center justify-center rounded-b-lg">
                    <LoadingSpinner className="w-8 h-8 text-cyber-glow" />
                    <p className="mt-4 font-orbitron text-cyber-glow animate-flicker">ANALYZING SOLUTION...</p>
                </div>
              )}
          </div>
          <div className="p-3 border-t border-cyber-border/20">
            <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting || submittedIndices.includes(activeQuestionIndex) || !solutions[activeQuestionIndex].trim()}
                className="w-full font-orbitron text-lg flex items-center justify-center gap-3 p-3 bg-cyber-border text-cyber-bg rounded-md hover:bg-white hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyber-border disabled:hover:shadow-none transition-all"
            >
                {isSubmitting ? <LoadingSpinner className="w-6 h-6"/> : <CodeBracketIcon className="w-6 h-6"/>}
                {submittedIndices.includes(activeQuestionIndex) ? 'Submitted' : 'Submit Solution'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCodingView;