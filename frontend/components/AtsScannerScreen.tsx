
import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { AtsResult } from '../types';
import { LoadingSpinner, CheckCircleIcon, XCircleIcon, DocumentArrowUpIcon } from './Icons';
import { useApp } from '../hooks/useAppContext';

type InputMethod = 'upload' | 'paste';

const AtsScannerScreen: React.FC = () => {
    const { navigateToView } = useApp();
    const [inputMethod, setInputMethod] = useState<InputMethod>('upload');
    const [pastedText, setPastedText] = useState('');
    const [uploadedFile, setUploadedFile] = useState<{ name: string; mimeType: string; data: string; } | null>(null);
    const [jobRole, setJobRole] = useState('');
    const [result, setResult] = useState<AtsResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setError(null);
        setResult(null);
        setUploadedFile(null);

        if (file) {
            if (file.type !== 'text/plain' && file.type !== 'application/pdf') {
                setError('Invalid file type. Please upload a .txt or .pdf file.');
                e.target.value = ''; // Clear the input
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                const base64Data = dataUrl.split(',')[1];
                setUploadedFile({ name: file.name, mimeType: file.type, data: base64Data });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMethodChange = (method: InputMethod) => {
        if (isLoading) return;
        setInputMethod(method);
        // Clear inputs when switching to avoid confusion
        setError(null);
        setResult(null);
        setUploadedFile(null);
        setPastedText('');
    }

    const handleScan = async () => {
        const resumeData = pastedText.trim() ? { text: pastedText.trim() } : uploadedFile ? { file: uploadedFile } : null;

        if (!resumeData || !jobRole.trim()) {
            setError('Both a resume and a job role are required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const analysis = await apiService.analyzeResumeForATS(resumeData, jobRole);
            setResult(analysis);
        } catch (err) {
            const error = err as Error;
            console.error(err);
            setError(error.message || 'An unexpected error occurred during analysis.');
        }
        setIsLoading(false);
    };
    
    const scoreColor = (score: number) => {
        if (score >= 85) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };
    
    const scoreBg = (score: number) => {
        if (score >= 85) return '#29c5f6'; // cyber-glow
        if (score >= 60) return '#facc15'; // yellow-400
        return '#e6007a'; // cyber-accent
    }

    return (
        <div className="flex flex-col w-full h-full p-8 overflow-y-auto">
            <div className="w-full bg-cyber-surface/50 p-8 rounded-lg border border-cyber-border/50 shadow-glow">
                <div className="text-center mb-8">
                    <h1 className="font-orbitron text-3xl font-bold text-cyber-glow animate-flicker">ATS RESUME SCANNER</h1>
                    <p className="text-cyber-text mt-2">ANALYZE YOUR RESUME'S COMPATIBILITY WITH A JOB ROLE</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                         <div>
                            <label htmlFor="jobRole" className="block text-sm font-medium text-cyber-text mb-1 tracking-widest">TARGET JOB ROLE</label>
                            <input
                                id="jobRole"
                                type="text"
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                placeholder="e.g., Senior Frontend Engineer"
                                className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-cyber-text mb-2 tracking-widest">RESUME INPUT</label>
                             <div className="flex bg-cyber-bg border border-cyber-border/30 rounded-md p-1 mb-4">
                                <button onClick={() => handleMethodChange('upload')} className={`flex-1 p-2 rounded-md text-sm transition-all duration-300 font-orbitron ${inputMethod === 'upload' ? 'bg-cyber-glow text-cyber-bg' : 'text-cyber-text'}`}>
                                    Upload File
                                </button>
                                <button onClick={() => handleMethodChange('paste')} className={`flex-1 p-2 rounded-md text-sm transition-all duration-300 font-orbitron ${inputMethod === 'paste' ? 'bg-cyber-glow text-cyber-bg' : 'text-cyber-text'}`}>
                                    Paste Text
                                </button>
                            </div>
                            
                            {inputMethod === 'upload' && (
                                <div className="animate-fadeIn">
                                    <label
                                        htmlFor="resume-upload"
                                        className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-cyber-border/50 rounded-lg cursor-pointer bg-cyber-bg hover:bg-cyber-surface transition-colors"
                                    >
                                        {uploadedFile ? (
                                            <div className="text-center p-2">
                                                <CheckCircleIcon className="w-10 h-10 text-green-400 mx-auto" />
                                                <p className="mt-2 text-cyber-text font-bold break-all">{uploadedFile.name}</p>
                                                <p className="text-xs text-cyber-text/70">Click to change file.</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <DocumentArrowUpIcon className="w-10 h-10 text-cyber-glow mx-auto" />
                                                <p className="mt-2 text-cyber-text">Click to upload</p>
                                                <p className="text-xs text-cyber-text/70">.pdf or .txt file</p>
                                            </div>
                                        )}
                                    </label>
                                    <input
                                        id="resume-upload"
                                        type="file"
                                        accept=".txt,text/plain,.pdf,application/pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        disabled={isLoading}
                                    />
                                </div>
                            )}

                             {inputMethod === 'paste' && (
                                <div className="animate-fadeIn">
                                    <textarea
                                        value={pastedText}
                                        onChange={(e) => setPastedText(e.target.value)}
                                        rows={8}
                                        placeholder="Paste your full resume text here..."
                                        className="w-full bg-cyber-bg border border-cyber-border/30 text-cyber-text rounded-md p-3 focus:ring-2 focus:ring-cyber-glow resize-y"
                                        disabled={isLoading}
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleScan}
                            disabled={isLoading || !jobRole.trim() || (!pastedText.trim() && !uploadedFile)}
                            className="w-full font-orbitron text-lg flex items-center justify-center gap-3 p-4 bg-cyber-accent text-white rounded-md hover:bg-cyber-accent/80 hover:shadow-accent-glow disabled:opacity-50 transition-all"
                        >
                            {isLoading && <LoadingSpinner className="w-6 h-6" />}
                            {isLoading ? 'ANALYZING...' : 'SCAN RESUME'}
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="bg-black/30 p-6 rounded-md border border-cyber-border/20 flex flex-col items-center justify-center min-h-[300px]">
                        {isLoading && (
                            <div className="text-center">
                                <LoadingSpinner className="w-12 h-12 text-cyber-glow mx-auto" />
                                <p className="mt-4 font-orbitron text-cyber-glow animate-flicker">SCANNING...</p>
                            </div>
                        )}
                        {error && !isLoading && <p className="text-red-400 font-mono text-center">{error}</p>}
                        {!isLoading && !result && !error && (
                            <p className="text-cyber-text/70 text-center font-mono">Your analysis results will appear here.</p>
                        )}
                        {result && (
                            <div className="w-full animate-fadeInUp space-y-6">
                                <div className="flex flex-col items-center">
                                    <div 
                                      className="relative w-40 h-40 rounded-full flex items-center justify-center"
                                      style={{background: `radial-gradient(closest-side, #132335 79%, transparent 80% 100%), conic-gradient(${scoreBg(result.score)} ${result.score}%, #0d1a26 ${result.score}%)`}}
                                    >
                                      <p className={`font-orbitron text-5xl font-bold ${scoreColor(result.score)}`}>
                                        {result.score}
                                        <span className="text-2xl">%</span>
                                      </p>
                                    </div>
                                    <p className="mt-4 font-orbitron text-xl text-white">ATS COMPATIBILITY SCORE</p>
                                </div>
                                <div className="space-y-4">
                                     <div>
                                        <h3 className="font-orbitron text-lg text-green-400 mb-2 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/>STRENGTHS</h3>
                                        <ul className="list-disc list-inside space-y-1 text-cyber-text/90 font-mono pl-2">
                                            {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                     <div>
                                        <h3 className="font-orbitron text-lg text-yellow-400 mb-2 flex items-center gap-2"><XCircleIcon className="w-5 h-5"/>AREAS FOR IMPROVEMENT</h3>
                                        <ul className="list-disc list-inside space-y-1 text-cyber-text/90 font-mono pl-2">
                                            {result.improvements.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigateToView('home')}
                        className="font-orbitron bg-cyber-surface text-cyber-text border border-cyber-border/50 font-bold py-3 px-8 rounded-md hover:border-cyber-glow hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-cyber-border transition-all duration-300"
                    >
                        HOME
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AtsScannerScreen;
