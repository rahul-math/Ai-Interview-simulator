





import React, { useState } from 'react';
import { InterviewConfig, ExperienceLevel, InterviewRound, InterviewMode, PracticeDrillType } from '../types';
import { EXPERIENCE_LEVELS, INTERVIEW_ROUNDS, PRACTICE_DRILL_TYPES, COMPANY_SUGGESTIONS } from '../constants';
import { UsersIcon, WrenchScrewdriverIcon } from './Icons';
import { useApp } from '../hooks/useAppContext';

interface ConfigurationScreenProps {
  onStart: (config: InterviewConfig) => void;
  initialRole?: string;
}

const SelectInput: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
    id?: string;
}> = ({ label, value, onChange, options, id }) => (
    <div>
        <label htmlFor={id || label} className="block text-sm font-medium text-cyber-text mb-1">{label.toUpperCase()}</label>
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

const RoleInput: React.FC<{
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    mode: InterviewMode;
}> = ({ id, value, onChange, mode }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-cyber-text mb-1">
            {mode === InterviewMode.FULL_INTERVIEW ? "INTERVIEW ROLE" : "RELEVANT ROLE"}
        </label>
        <input
            id={id}
            type="text"
            value={value}
            onChange={onChange}
            placeholder="Type any job role (e.g., DevOps Engineer)"
            className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow focus:border-cyber-glow"
            required
        />
    </div>
);

const SimulationTypeSelector: React.FC<{
    selectedMode: InterviewMode;
    onModeChange: (mode: InterviewMode) => void;
}> = ({ selectedMode, onModeChange }) => {
    const options = [
        {
            mode: InterviewMode.FULL_INTERVIEW,
            title: "Full Interview",
            description: "A complete, conversational session with live AI feedback.",
            Icon: UsersIcon,
        },
        {
            mode: InterviewMode.PRACTICE_DRILL,
            title: "Practice Drill",
            description: "A quick, targeted exercise on a specific interview skill.",
            Icon: WrenchScrewdriverIcon,
        }
    ];

    return (
        <div>
            <label className="block text-sm font-medium text-cyber-text mb-2">SIMULATION TYPE</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map(({ mode, title, description, Icon }) => (
                    <button
                        key={mode}
                        type="button"
                        onClick={() => onModeChange(mode)}
                        className={`group p-6 text-left rounded-lg border-2 transition-all duration-300 ${
                            selectedMode === mode
                                ? 'bg-cyber-glow/20 border-cyber-glow shadow-glow'
                                : 'bg-cyber-surface/50 border-cyber-border/30 hover:border-cyber-glow'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <Icon className={`w-10 h-10 transition-colors ${selectedMode === mode ? 'text-cyber-glow' : 'text-cyber-text/70 group-hover:text-cyber-glow'}`} />
                            <h3 className="font-orbitron text-lg md:text-xl text-white">{title}</h3>
                        </div>
                        <p className="mt-3 text-sm text-cyber-text/80">{description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};


const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({ onStart, initialRole }) => {
  const { navigateToView } = useApp();
  const [mode, setMode] = useState<InterviewMode>(InterviewMode.FULL_INTERVIEW);
  const [role, setRole] = useState<string>(initialRole || '');
  const [level, setLevel] = useState<ExperienceLevel>(ExperienceLevel.MID);
  const [round, setRound] = useState<InterviewRound>(InterviewRound.TECHNICAL);
  const [resumeContent, setResumeContent] = useState('');
  const [companyStyle, setCompanyStyle] = useState('');
  const [drillType, setDrillType] = useState<PracticeDrillType>(PracticeDrillType.ELEVATOR_PITCH);

  const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setResumeContent(text);
      };
      reader.readAsText(file);
    } else if (file) {
      alert("Please upload a .txt file.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let config: InterviewConfig;
    if (mode === InterviewMode.FULL_INTERVIEW) {
        config = { 
          mode, 
          role, 
          level, 
          round, 
          resumeContent: resumeContent.trim(), 
          companyStyle: companyStyle.trim() 
        };
    } else if (mode === InterviewMode.PRACTICE_DRILL) {
        config = { mode, role, drillType };
    } else { // Should not happen from this screen, but for completeness
        config = { mode, role };
    }
    onStart(config);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 overflow-y-auto">
        <div className="w-full max-w-2xl bg-cyber-surface/50 p-8 rounded-lg border border-cyber-border/50 shadow-glow">
            <div className="text-center mb-8">
                <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-cyber-glow animate-flicker">INTERVIEW SIMULATION</h1>
                <p className="text-cyber-text mt-2">CALIBRATE YOUR SIMULATION</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <SimulationTypeSelector selectedMode={mode} onModeChange={setMode} />
                
                <RoleInput
                    id="role-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    mode={mode}
                />
                
                {mode === InterviewMode.FULL_INTERVIEW && (
                    <>
                        <SelectInput 
                            label="Experience Level" 
                            value={level}
                            onChange={(e) => setLevel(e.target.value as ExperienceLevel)}
                            options={EXPERIENCE_LEVELS}
                        />
                        <SelectInput 
                            label="Interview Round" 
                            value={round}
                            onChange={(e) => setRound(e.target.value as InterviewRound)}
                            options={INTERVIEW_ROUNDS}
                        />
                        <div>
                            <label htmlFor="company-style" className="block text-sm font-medium text-cyber-text mb-1">COMPANY STYLE (OPTIONAL)</label>
                            <input
                                id="company-style"
                                type="text"
                                list="company-suggestions"
                                value={companyStyle}
                                onChange={(e) => setCompanyStyle(e.target.value)}
                                placeholder="e.g., Google, Amazon..."
                                className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow focus:border-cyber-glow"
                            />
                             <datalist id="company-suggestions">
                                {COMPANY_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                        <div>
                            <label htmlFor="resume" className="block text-sm font-medium text-cyber-text mb-1">RESUME (OPTIONAL)</label>
                            <textarea
                                id="resume"
                                value={resumeContent}
                                onChange={(e) => setResumeContent(e.target.value)}
                                rows={4}
                                placeholder="Paste resume here for AI-powered questions..."
                                className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow focus:border-cyber-glow resize-y"
                            />
                            <label htmlFor="resume-file" className="mt-2 text-center text-sm text-cyber-text/70 block">
                                Or upload a .txt file:
                                <input id="resume-file" type="file" accept=".txt" onChange={handleFileRead} className="text-xs block w-full mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyber-border/20 file:text-cyber-glow hover:file:bg-cyber-border/40" />
                            </label>
                        </div>
                    </>
                )}

                {mode === InterviewMode.PRACTICE_DRILL && (
                    <>
                         <SelectInput 
                            label="Drill Type" 
                            value={drillType}
                            onChange={(e) => setDrillType(e.target.value as PracticeDrillType)}
                            options={PRACTICE_DRILL_TYPES}
                        />
                    </>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                    <button 
                        type="button"
                        onClick={() => navigateToView('home')}
                        className="w-full font-orbitron bg-cyber-surface text-cyber-text border border-cyber-border/50 font-bold py-3 px-4 rounded-md hover:border-cyber-glow hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-cyber-border transition-all duration-300"
                    >
                        BACK
                    </button>
                    <button 
                        type="submit"
                        className="w-full font-orbitron bg-cyber-border text-cyber-bg font-bold py-3 px-4 rounded-md hover:bg-white hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-cyber-glow transition-all duration-300"
                    >
                        BEGIN SIMULATION
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default ConfigurationScreen;