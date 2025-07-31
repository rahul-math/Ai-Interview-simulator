
import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { User } from '../types';
import { LoadingSpinner } from './Icons';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToSignUp: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onNavigateToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Email and Password are required.');
      setIsLoading(false);
      return;
    }

    try {
        const user = await apiService.loginUser(email, password);
        onLoginSuccess(user);
    } catch (err) {
        const error = err as Error;
        setError(error.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8">
      <div className="w-full max-w-md bg-cyber-surface/50 p-8 rounded-lg border border-cyber-border/50 shadow-glow">
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-3xl font-bold text-cyber-glow animate-flicker">LOGIN</h1>
          <p className="text-cyber-text mt-2">ENTER YOUR CREDENTIALS TO BEGIN</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email_login" className="block text-sm font-medium text-cyber-text mb-1 tracking-widest">EMAIL</label>
            <input id="email_login" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow" required disabled={isLoading} />
          </div>
          <div>
            <label htmlFor="password_login" className="block text-sm font-medium text-cyber-text mb-1 tracking-widest">PASSWORD</label>
            <input id="password_login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow" required disabled={isLoading} />
          </div>
          {error && <p className="text-red-500 text-sm text-center font-mono animate-pulse">{error}</p>}
          <button type="submit" className="w-full font-orbitron bg-cyber-accent text-white font-bold py-3 px-4 rounded-md hover:bg-cyber-accent/80 hover:shadow-accent-glow flex items-center justify-center disabled:opacity-50" disabled={isLoading}>
            {isLoading && <LoadingSpinner className="w-5 h-5 mr-2" />}
            {isLoading ? 'ACCESSING...' : 'ENTER SIMULATOR'}
          </button>
        </form>
         <p className="text-center text-sm text-cyber-text/70 mt-6">
          Don't have an account?{' '}
          <button onClick={onNavigateToSignUp} className="font-bold text-cyber-glow hover:underline disabled:opacity-50" disabled={isLoading}>
            Sign up now
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;