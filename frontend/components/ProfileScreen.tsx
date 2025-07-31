import React, { useState, useEffect } from 'react';
import MarkdownContent from './MarkdownContent';
import DeliveryAnalysisReport from './DeliveryAnalysisReport';
import PerformanceHistory from './PerformanceHistory';
import { Report } from '../types';
import { useApp } from '../hooks/useAppContext';
import { CheckCircleIcon, XCircleIcon } from './Icons';

const ProfileScreen: React.FC = () => {
  const { currentUser, navigateToView } = useApp();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const reports = currentUser?.reports || [];

  useEffect(() => {
    // Select the latest report by default when the component mounts or reports change
    if (reports.length > 0) {
      // Sort by timestamp to ensure the latest is first
      const sortedReports = [...reports].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSelectedReport(sortedReports[0]);
    } else {
      setSelectedReport(null);
    }
  }, [reports]);
  
  if (!currentUser) {
      return null; // Or a loading/error screen
  }

  return (
    <div className="w-full h-full flex flex-col p-8 animate-fadeIn">
        <div className="text-center mb-8 shrink-0">
          <h1 className="font-orbitron text-3xl font-bold text-cyber-glow animate-flicker">USER DASHBOARD</h1>
          <p className="text-cyber-text mt-2">Welcome, <span className="text-white font-bold">{currentUser.fullName}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1 min-h-0">
            {/* Left/Main Section */}
            <div className="lg:col-span-2 flex flex-col gap-8 min-h-0">
                <PerformanceHistory 
                    reports={reports}
                    selectedReportId={selectedReport?.id}
                    onSelectReport={setSelectedReport}
                />
            </div>

            {/* Right/Detail Sidebar */}
            <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
                 <h2 className="font-orbitron text-2xl text-cyber-glow border-b-2 border-cyber-border/30 pb-3 animate-flicker shrink-0">REPORT DETAILS</h2>
                 <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                    {selectedReport ? (
                        <div className="bg-black/30 p-4 rounded-md border border-cyber-border/20 space-y-6">
                            <MarkdownContent content={selectedReport.summary} />
                            {selectedReport.deliveryAnalysis && selectedReport.deliveryAnalysis.wordsPerMinute > 0 && (
                                <DeliveryAnalysisReport analysis={selectedReport.deliveryAnalysis} />
                            )}
                            
                            {selectedReport.codingResults && selectedReport.codingResults.length > 0 && (
                                <div className="border-t-2 border-cyber-border/20 pt-4">
                                    <h3 className="font-orbitron text-xl text-cyber-glow pb-2 mb-4 animate-flicker">Coding Analysis</h3>
                                    <div className="space-y-4">
                                        {selectedReport.codingResults.map((result, index) => (
                                            <div key={index} className="bg-cyber-bg/50 p-3 rounded-md border border-cyber-border/20">
                                                <p className="font-mono text-cyber-text mb-2 italic">"{result.question}"</p>
                                                <details>
                                                    <summary className="font-orbitron text-md text-cyber-glow cursor-pointer">View Feedback</summary>
                                                    <div className="mt-2 border-t border-cyber-border/20 pt-2">
                                                      <MarkdownContent content={result.feedback} />
                                                    </div>
                                                </details>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedReport.mcqResults && selectedReport.mcqResults.length > 0 && (
                                <div className="border-t-2 border-cyber-border/20 pt-4">
                                    <h3 className="font-orbitron text-xl text-cyber-glow pb-2 mb-4 animate-flicker">MCQ Quiz Analysis</h3>
                                    <div className="space-y-4">
                                        {selectedReport.mcqResults.map((result, index) => {
                                            const isCorrect = result.userAnswer === result.question.correctAnswer;
                                            return (
                                                <div key={index} className="bg-cyber-bg/50 p-3 rounded-md border border-cyber-border/20 font-mono text-sm">
                                                    <p className="font-bold text-white mb-2">{index + 1}. {result.question.question}</p>
                                                    <div className={`flex items-start gap-2 p-2 rounded ${isCorrect ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                                                        {isCorrect ? <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" /> : <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                                                        <p><strong>Your Answer:</strong> <span className={isCorrect ? 'text-green-300' : 'text-red-300'}>{result.userAnswer}</span></p>
                                                    </div>
                                                    {!isCorrect && (
                                                        <div className="flex items-start gap-2 p-2 mt-1 rounded bg-cyber-surface/50">
                                                            <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                            <p><strong>Correct Answer:</strong> <span className="text-green-300">{result.question.correctAnswer}</span></p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                             {selectedReport.history && selectedReport.history.length > 0 && (
                                <div className="border-t-2 border-cyber-border/20 pt-4">
                                    <details>
                                        <summary className="font-orbitron text-xl text-cyber-glow cursor-pointer hover:text-white">View Full Transcript</summary>
                                        <div className="mt-4 bg-black/30 p-4 rounded-md border border-cyber-border/20 max-h-96 overflow-y-auto space-y-4 font-mono">
                                            {selectedReport.history.map((msg, index) => (
                                                <div key={index} className={`flex items-start gap-3 max-w-lg lg:max-w-xl ${msg.role === 'user' ? 'justify-end ml-auto' : 'justify-start mr-auto'}`}>
                                                    {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-cyber-border text-cyber-bg flex items-center justify-center font-bold flex-shrink-0 font-orbitron">AI</div>}
                                                    <div className={`p-3 rounded-lg text-cyber-text ${msg.role === 'user' ? 'bg-cyber-accent/80' : 'bg-cyber-surface'}`}>
                                                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-black/30 p-6 rounded-md border border-cyber-border/20 h-full flex flex-col items-center justify-center text-center">
                            <p className="text-cyber-text/70">No reports available.</p>
                            <p className="text-cyber-text/70 mt-2">Complete a simulation to see your results.</p>
                             <button
                                onClick={() => navigateToView('interview')}
                                className="mt-6 font-orbitron bg-cyber-border text-cyber-bg font-bold py-2 px-6 rounded-md hover:bg-white hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-cyber-glow transition-all duration-300"
                             >
                                Start Simulation
                            </button>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    </div>
  );
};

export default ProfileScreen;