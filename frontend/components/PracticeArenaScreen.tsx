



import React from 'react';
import { CodeBracketIcon, CommandLineIcon } from './Icons';
import { useApp } from '../hooks/useAppContext';

const PracticeArenaScreen: React.FC = () => {
  const { navigateToStage, navigateToView } = useApp();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 overflow-y-auto">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-3xl font-bold text-cyber-glow animate-flicker">PRACTICE ARENA</h1>
          <p className="text-cyber-text mt-2">CHOOSE YOUR TRAINING MODULE</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button
                onClick={() => navigateToStage('coding_challenge_config')}
                className="group flex flex-col w-full items-center text-center p-8 bg-cyber-surface/50 border-2 border-cyber-border/30 rounded-lg hover:border-cyber-glow hover:shadow-glow transition-all duration-300"
            >
                <CommandLineIcon className="w-20 h-20 text-cyber-glow transition-transform duration-300 group-hover:scale-110" />
                <div className="mt-6">
                    <h3 className="font-orbitron text-2xl text-white">Coding Challenge</h3>
                    <p className="text-sm mt-2 text-cyber-text/70">Sharpen your DSA skills. Select a topic and difficulty, and solve AI-generated problems in an interactive environment.</p>
                </div>
            </button>
            <button
                onClick={() => navigateToStage('mcq_quiz_config')}
                className="group flex flex-col w-full items-center text-center p-8 bg-cyber-surface/50 border-2 border-cyber-border/30 rounded-lg hover:border-cyber-glow hover:shadow-glow transition-all duration-300"
            >
                <CodeBracketIcon className="w-20 h-20 text-cyber-glow transition-transform duration-300 group-hover:scale-110" />
                <div className="mt-6">
                    <h3 className="font-orbitron text-2xl text-white">MCQ Quiz</h3>
                    <p className="text-sm mt-2 text-cyber-text/70">Test your knowledge with a multiple-choice quiz tailored to a specific job role. Perfect for quick refreshers.</p>
                </div>
            </button>
        </div>
        
        <div className="mt-12 text-center">
            <button
                onClick={() => navigateToView('home')}
                className="font-orbitron bg-cyber-surface text-cyber-text border border-cyber-border/50 font-bold py-3 px-8 rounded-md hover:border-cyber-glow hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-cyber-border transition-all duration-300"
            >
                BACK
            </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeArenaScreen;