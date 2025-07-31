import React from 'react';
import { AppView } from '../types';
import { HomeIcon, UsersIcon, CommandLineIcon, DocumentTextIcon, ChartBarIcon } from './Icons';
import { useApp } from '../hooks/useAppContext';

interface NavBarProps {
    activeView: AppView;
}

const navItems = [
  { view: 'home', label: 'Home', Icon: HomeIcon },
  { view: 'dashboard', label: 'Dashboard', Icon: ChartBarIcon },
  { view: 'interview', label: 'Simulations', Icon: UsersIcon },
  { view: 'practice', label: 'Arena', Icon: CommandLineIcon },
  { view: 'ats_scanner', label: 'ATS Scanner', Icon: DocumentTextIcon },
] as const;

const NavBar: React.FC<NavBarProps> = ({ activeView }) => {
    const { currentUser, navigateToView } = useApp();

    const getInitials = (name: string) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    if (!currentUser) return null;

    return (
        <header className="w-full bg-cyber-surface border-b-2 border-cyber-border/30 shadow-lg z-20 shrink-0">
            <div className="w-full mx-auto flex items-center justify-between px-8 py-2">
                <div className="flex items-center gap-2">
                    <svg viewBox="0 0 100 100" className="w-10 h-10 text-cyber-glow">
                        <path d="M 30 80 C 20 65 20 35 30 20 L 70 20 C 80 35 80 65 70 80 Z" stroke="currentColor" strokeWidth="5" fill="none" />
                        <line x1="50" y1="20" x2="50" y2="10" stroke="currentColor" strokeWidth="5" />
                        <circle cx="50" cy="7.5" r="2.5" fill="currentColor" />
                        <rect x="37.5" y="37.5" width="25" height="10" rx="5" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                    <h1 className="font-orbitron text-xl font-bold text-white hidden md:block">AI INTERVIEWER</h1>
                </div>

                <nav className="flex items-center gap-2 md:gap-4">
                    {navItems.map(item => (
                         <button
                            key={item.view}
                            onClick={() => navigateToView(item.view)}
                            title={item.label}
                            className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                                activeView === item.view 
                                ? 'text-cyber-glow' 
                                : 'text-cyber-text/70 hover:text-white hover:bg-cyber-surface/50'
                            }`}
                        >
                            <item.Icon className="w-5 h-5 md:w-6 md:h-6" />
                            <span className="text-xs md:text-sm font-orbitron">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="relative">
                     <button
                        onClick={() => navigateToView('settings')}
                        className="w-10 h-10 rounded-full bg-cyber-border/30 flex items-center justify-center text-cyber-glow font-bold text-lg font-orbitron border-2 border-transparent hover:border-cyber-glow transition-all"
                        title="Profile Settings"
                    >
                        {getInitials(currentUser.fullName)}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default NavBar;