
import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { LogoutIcon, ArrowLeftIcon } from './Icons';
import { LoadingSpinner } from './Icons';
import { useApp } from '../hooks/useAppContext';

const FormSection: React.FC<{ title: string, children: React.ReactNode, onSubmit: (e: React.FormEvent) => Promise<void>, isSubmitting: boolean, buttonText: string }> = ({ title, children, onSubmit, isSubmitting, buttonText }) => (
    <form onSubmit={onSubmit} className="space-y-4 p-4 border border-cyber-border/20 rounded-lg bg-black/20">
        <h3 className="font-orbitron text-lg text-cyber-glow">{title}</h3>
        {children}
        <button type="submit" disabled={isSubmitting} className="w-full font-orbitron bg-cyber-border text-cyber-bg font-bold py-2 px-4 rounded-md hover:bg-white hover:shadow-glow disabled:opacity-50 flex items-center justify-center">
            {isSubmitting ? <LoadingSpinner className="w-5 h-5 mr-2" /> : null}
            {isSubmitting ? 'UPDATING...' : buttonText}
        </button>
    </form>
);

const ProfileSettingsScreen: React.FC = () => {
    const { currentUser, navigateToView, logout, updateUser } = useApp();
    
    // State for forms
    const [fullName, setFullName] = useState(currentUser?.fullName || '');
    const [targetRole, setTargetRole] = useState(currentUser?.targetRole || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<'details' | 'password' | null>(null);

    const handleDetailsUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsSubmitting('details');
        try {
            await apiService.updateProfile({ fullName, targetRole });
            await updateUser(); // Refetch user from context
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
        } catch (err) {
            const error = err as Error;
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsSubmitting(null);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (newPassword !== confirmNewPassword) {
            setMessage({ type: 'error', text: "New passwords do not match." });
            return;
        }
        if (!newPassword || !currentPassword) {
            setMessage({ type: 'error', text: "Both current and new passwords are required." });
            return;
        }
        setIsSubmitting('password');
        try {
            const result = await apiService.updatePassword(currentPassword, newPassword);
            setMessage({ type: 'success', text: result.message });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            const error = err as Error;
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsSubmitting(null);
        }
    };
    
    const getInitials = (name: string) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    if (!currentUser) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 md:p-8 animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-cyber-surface/50 p-6 md:p-8 rounded-lg border border-cyber-border/50 shadow-glow">
                <button
                    onClick={() => navigateToView('dashboard')}
                    title="Back to Dashboard"
                    className="absolute top-4 left-4 text-cyber-text/70 hover:text-white transition-colors p-2 rounded-full"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="w-24 h-24 rounded-full bg-cyber-border/30 flex items-center justify-center text-cyber-glow font-bold text-4xl font-orbitron border-2 border-cyber-glow flex-shrink-0">
                        {getInitials(currentUser.fullName)}
                    </div>
                    <div>
                        <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-white text-center truncate">{currentUser.fullName}</h1>
                        <p className="text-cyber-text/80 mt-1 text-center truncate">{currentUser.email}</p>
                    </div>
                </div>

                <div className="font-mono max-h-[50vh] overflow-y-auto pr-2 space-y-8">
                    <FormSection title="Update Profile" onSubmit={handleDetailsUpdate} isSubmitting={isSubmitting === 'details'} buttonText="Save Profile">
                        <div>
                            <label htmlFor="fullName_settings" className="block text-sm text-cyber-text/80 mb-1">Full Name</label>
                            <input id="fullName_settings" type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-2 focus:ring-2 focus:ring-cyber-glow" />
                        </div>
                        <div>
                            <label htmlFor="targetRole_settings" className="block text-sm text-cyber-text/80 mb-1">Target Role</label>
                            <input id="targetRole_settings" type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g., Staff Software Engineer" className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-2 focus:ring-2 focus:ring-cyber-glow" />
                        </div>
                    </FormSection>
                    
                    <FormSection title="Change Password" onSubmit={handlePasswordChange} isSubmitting={isSubmitting === 'password'} buttonText="Update Password">
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-2 focus:ring-2 focus:ring-cyber-glow" required />
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-2 focus:ring-2 focus:ring-cyber-glow" required />
                        <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Confirm New Password" className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-2 focus:ring-2 focus:ring-cyber-glow" required />
                    </FormSection>
                    
                    {message && (
                        <p className={`text-center text-sm p-2 rounded-md ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{message.text}</p>
                    )}

                    <div className="border-t-2 border-cyber-accent/50 pt-6">
                        <h3 className="font-orbitron text-lg text-cyber-accent mb-2">Danger Zone</h3>
                         <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-lg font-orbitron text-cyber-accent/80 bg-cyber-accent/10 border border-cyber-accent/50 hover:border-cyber-accent hover:text-white p-3 rounded-md transition-colors">
                            <LogoutIcon className="w-5 h-5" /> LOGOUT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsScreen;
