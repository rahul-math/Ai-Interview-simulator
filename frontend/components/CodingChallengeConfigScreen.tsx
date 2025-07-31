
import React, { useState } from 'react';
import { InterviewConfig, InterviewMode, DsaDifficulty, DsaTopic } from '../types';
import { PROGRAMMING_LANGUAGES, DSA_DIFFICULTIES, DSA_TOPICS } from '../constants';
import { useApp } from '../hooks/useAppContext';

interface CodingChallengeConfigScreenProps {
  onStart: (config: InterviewConfig) => void;
}

const SelectInput: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
    id?: string;
}> = ({ label, value, onChange, options, id }) => (
    <div>
        <label htmlFor={id || label} className="block text-sm font-medium text-cyber-text mb-1 tracking-widest">{label.toUpperCase()}</label>
        <select
            id={id || label}
            value={value}
            onChange={onChange}
            className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow focus:border-cyber-glow"
        >
            {options.map(option => <option key={option} value={option} className="bg-cyber-bg text-cyber-text">{option}</option>)}
        </select>
    </div>
);


const CodingChallengeConfigScreen: React.FC<CodingChallengeConfigScreenProps> = ({ onStart }) => {
    const { navigateToStage } = useApp();
    const [language, setLanguage] = useState<string>(PROGRAMMING_LANGUAGES[0]);
    const [dsaTopic, setDsaTopic] = useState<DsaTopic>(DsaTopic.GENERAL);
    const [dsaDifficulty, setDsaDifficulty] = useState<DsaDifficulty>(DsaDifficulty.MEDIUM);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const config: InterviewConfig = {
            mode: InterviewMode.CODING_CHALLENGE,
            role: 'Coding Challenge', // Role is not as important here, but good to have
            language,
            dsaTopic,
            dsaDifficulty,
        };
        onStart(config);
    };

    return (
        <div className="fixed inset-0 bg-cyber-bg/90 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-cyber-surface/50 p-8 rounded-lg border border-cyber-border/50 shadow-glow animate-fadeInUp">
                <div className="text-center mb-8">
                    <h1 className="font-orbitron text-3xl font-bold text-cyber-glow animate-flicker">CODING PLAYGROUND</h1>
                    <p className="text-cyber-text mt-2">CONFIGURE YOUR CHALLENGE</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <SelectInput
                        label="Programming Language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        options={PROGRAMMING_LANGUAGES}
                    />
                    <SelectInput
                        label="Topic"
                        value={dsaTopic}
                        onChange={(e) => setDsaTopic(e.target.value as DsaTopic)}
                        options={DSA_TOPICS}
                    />
                    <SelectInput
                        label="Difficulty"
                        value={dsaDifficulty}
                        onChange={(e) => setDsaDifficulty(e.target.value as DsaDifficulty)}
                        options={DSA_DIFFICULTIES}
                    />

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
                            START CHALLENGE
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CodingChallengeConfigScreen;