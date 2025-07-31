

import React, { useState } from 'react';
import { MCQQuestion, MCQResult } from '../types';

interface MCQScreenProps {
  questions: MCQQuestion[];
  onFinish: (results: MCQResult[]) => void;
}

const MCQScreen: React.FC<MCQScreenProps> = ({ questions, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<MCQResult[]>([]);

  const handleAnswerSelect = (selectedOption: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswer: MCQResult = {
      question: currentQuestion,
      userAnswer: selectedOption,
    };
    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onFinish(updatedAnswers);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <p className="text-cyber-text">No questions loaded.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8">
      <div className="w-full max-w-4xl bg-cyber-surface/50 p-8 rounded-lg border border-cyber-border/50 shadow-glow">
        {/* Progress Bar and Counter */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2 font-mono text-cyber-text">
            <p className="text-sm">PROGRESS</p>
            <p className="text-sm font-bold">{currentQuestionIndex + 1} / {questions.length}</p>
          </div>
          <div className="w-full bg-cyber-bg h-2 rounded-full border border-cyber-border/30">
            <div 
              className="bg-cyber-glow h-full rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Question */}
        <div className="mb-8">
          <p className="font-mono text-sm text-cyber-text/70 tracking-widest">QUESTION {currentQuestionIndex + 1}</p>
          <h2 className="font-orbitron text-lg md:text-2xl text-white mt-2">{currentQuestion.question}</h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className="font-mono text-left w-full bg-cyber-surface p-4 rounded-md border-2 border-cyber-border/30 text-cyber-text hover:border-cyber-glow hover:bg-cyber-glow/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyber-glow"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MCQScreen;