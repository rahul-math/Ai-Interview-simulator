
import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { User } from '../types';
import { LoadingSpinner } from './Icons';

interface SignUpScreenProps {
  onSignUpSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUpSuccess, onNavigateToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!fullName || !email || !password) {
      setError('Full Name, Email, and Password are required.');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
        const user = await apiService.registerUser({ fullName, email, password, targetRole });
        onSignUpSuccess(user);
    } catch(err) {
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
          <h1 className="font-orbitron text-3xl font-bold text-cyber-glow animate-flicker">CREATE ACCOUNT</h1>
          <p className="text-cyber-text mt-2">JOIN THE SIMULATION</p>
        </div>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-cyber-text mb-1 tracking-widest">FULL NAME</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow" required disabled={isLoading}/>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-cyber-text mb-1 tracking-widest">EMAIL</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow" required disabled={isLoading}/>
          </div>
          <div>
            <label htmlFor="password_signup" className="block text-sm font-medium text-cyber-text mb-1 tracking-widest">PASSWORD</label>
            <input id="password_signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow" required disabled={isLoading}/>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-cyber-text mb-1 tracking-widest">CONFIRM PASSWORD</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow" required disabled={isLoading}/>
          </div>
           <div>
            <label htmlFor="targetRole" className="block text-sm font-medium text-cyber-text mb-1 tracking-widest">TARGET JOB ROLE (OPTIONAL)</label>
            <input id="targetRole" type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g., Senior Frontend Developer" className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow" disabled={isLoading}/>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-mono animate-pulse">{error}</p>}

          <button type="submit" className="w-full font-orbitron bg-cyber-accent text-white font-bold py-3 px-4 rounded-md hover:bg-cyber-accent/80 hover:shadow-accent-glow flex items-center justify-center disabled:opacity-50" disabled={isLoading}>
            {isLoading && <LoadingSpinner className="w-5 h-5 mr-2" />}
            {isLoading ? 'REGISTERING...' : 'REGISTER'}
          </button>
        </form>
         <p className="text-center text-sm text-cyber-text/70 mt-6">
          Already have an account?{' '}
          <button onClick={onNavigateToLogin} className="font-bold text-cyber-glow hover:underline disabled:opacity-50" disabled={isLoading}>
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpScreen;