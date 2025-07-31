
import React from 'react';
import { ChartBarIcon, CommandLineIcon, DocumentTextIcon, UsersIcon } from './Icons';
import TechScroller from './TechScroller';
import { AppView } from '../types';
import { useApp } from '../hooks/useAppContext';

interface FeatureCardProps {
    Icon: React.FC<{ className?: string }>;
    title: string;
    description: string;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ Icon, title, description, onClick }) => (
    <button 
        onClick={onClick} 
        className="group text-left w-full h-full focus:outline-none focus:ring-2 focus:ring-cyber-glow focus:ring-offset-2 focus:ring-offset-cyber-bg rounded-lg"
        aria-label={`Navigate to ${title}`}
    >
        <div className="bg-cyber-surface/50 p-6 rounded-lg border border-cyber-border/30 flex flex-col items-start h-full transform group-hover:-translate-y-2 transition-transform duration-300 group-hover:shadow-glow">
            <Icon className="w-12 h-12 text-cyber-glow mb-4" />
            <h3 className="font-orbitron text-xl text-white mb-2">{title}</h3>
            <p className="font-mono text-sm text-cyber-text/80">{description}</p>
        </div>
    </button>
);

const HomeScreen: React.FC = () => {
    const { navigateToView } = useApp();

    const features: (Omit<FeatureCardProps, 'onClick'> & { view: AppView })[] = [
        {
            Icon: UsersIcon,
            title: "Interview Simulations",
            description: "Engage in realistic mock interviews for various roles and rounds. Get live feedback from our advanced AI on your answers and delivery.",
            view: 'interview'
        },
        {
            Icon: CommandLineIcon,
            title: "Practice Arena",
            description: "Sharpen your technical skills with targeted exercises. Solve DSA problems in a full coding environment or test your knowledge with MCQ quizzes.",
            view: 'practice'
        },
        {
            Icon: DocumentTextIcon,
            title: "ATS Resume Scanner",
            description: "Optimize your resume for any job. Upload your resume and a job description to get an ATS compatibility score and actionable feedback.",
            view: 'ats_scanner'
        },
        {
            Icon: ChartBarIcon,
            title: "Performance Dashboard",
            description: "Track your progress over time. Review detailed reports from all your sessions, analyze your speaking patterns, and identify areas for improvement.",
            view: 'dashboard'
        },
    ];

    return (
        <div className="flex flex-col w-full h-full p-8 overflow-y-auto animate-fadeIn">
            {/* Header */}
            <div className="text-center shrink-0 mb-8">
                <h1 className="font-orbitron text-5xl md:text-6xl font-bold
                   bg-gradient-to-r from-cyber-accent via-cyber-glow to-cyber-accent
                   bg-clip-text text-transparent
                   animate-text-glow-sweep bg-[length:200%_auto]">
                    WELCOME
                </h1>
                <p className="text-cyber-text mt-3 text-lg font-mono">Your AI-powered career co-pilot is online.</p>
            </div>
            
            {/* Main content area that grows and centers its content */}
            <div className="flex-grow flex flex-col justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                         <div key={index} className="h-full">
                            <FeatureCard 
                                {...feature}
                                onClick={() => navigateToView(feature.view)} 
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 mt-8">
                <TechScroller />
                <div className="mt-4 text-center text-cyber-text/70 font-mono">
                    <p>Select a module from the navigation bar or the main menu to begin.</p>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;