
import React, { useState } from 'react';
import { InterviewConfig, InterviewMode } from '../types';
import { useApp } from '../hooks/useAppContext';

interface MCQQuizConfigScreenProps {
  onStart: (config: InterviewConfig) => void;
}

const MCQQuizConfigScreen: React.FC<MCQQuizConfigScreenProps> = ({ onStart }) => {
    const { navigateToStage } = useApp();
    const [role, setRole] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const config: InterviewConfig = {
            mode: InterviewMode.MCQ_QUIZ,
            role,
        };
        onStart(config);
    };

    return (
        <div className="fixed inset-0 bg-cyber-bg/90 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-cyber-surface/50 p-8 rounded-lg border border-cyber-border/50 shadow-glow animate-fadeInUp">
                <div className="text-center mb-8">
                    <h1 className="font-orbitron text-3xl font-bold text-cyber-glow animate-flicker">MCQ QUIZ</h1>
                    <p className="text-cyber-text mt-2">CONFIGURE YOUR QUIZ</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="role-input" className="block text-sm font-medium text-cyber-text mb-1 tracking-widest">
                            QUIZ TOPIC / ROLE
                        </label>
                        <input
                            id="role-input"
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g., Senior Python Developer"
                            className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow focus:border-cyber-glow"
                            required
                        />
                         <p className="text-xs text-cyber-text/60 mt-2">Enter a job role to generate relevant technical questions.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                         <button 
                            type="button"
                            onClick={() => navigateToStage('practice_arena')}
                            className="w-full font-orbitron bg-cyber-surface text-cyber-text border border-cyber-border/50 font-bold py-3 px-4 rounded-md hover:bg-cyber-surface/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-cyber-border transition-all duration-300"
                        >
                            BACK
                        </button>
                        <button 
                            type="submit"
                            className="w-full font-orbitron bg-cyber-border text-cyber-bg font-bold py-3 px-4 rounded-md hover:bg-white hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-cyber-glow transition-all duration-300"
                        >
                            START QUIZ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MCQQuizConfigScreen;