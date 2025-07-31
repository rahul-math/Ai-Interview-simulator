
import React from 'react';

interface WelcomeScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigateToLogin, onNavigateToSignUp }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8">
      <div className="w-full max-w-md bg-cyber-surface/50 p-8 rounded-lg border border-cyber-border/50 shadow-glow text-center">
        <h1 className="font-orbitron text-4xl font-bold text-cyber-glow animate-flicker">AI MOCK INTERVIEWER</h1>
        <p className="text-cyber-text mt-4 mb-8">Hone your skills with a cutting-edge AI. Your career upgrade starts now.</p>
        <div className="space-y-4">
          <button
            onClick={onNavigateToLogin}
            className="w-full font-orbitron bg-cyber-accent text-white font-bold py-3 px-4 rounded-md hover:bg-cyber-accent/80 hover:shadow-accent-glow transition-all duration-300"
          >
            LOGIN
          </button>
          <button
            onClick={onNavigateToSignUp}
            className="w-full font-orbitron bg-cyber-border text-cyber-bg font-bold py-3 px-4 rounded-md hover:bg-white hover:shadow-glow transition-all duration-300"
          >
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;