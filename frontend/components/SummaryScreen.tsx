
import React from 'react';
import MarkdownContent from './MarkdownContent';
import DeliveryAnalysisReport from './DeliveryAnalysisReport';
import { Report, ChatMessage } from '../types';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface SummaryScreenProps {
  report: Report;
  onBack: () => void;
  onSave?: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ report, onBack, onSave }) => {
  const history = (report as Report & { history?: ChatMessage[] }).history;

  return (
    <div className="flex flex-col w-full h-full p-8">
      <div className="w-full flex-1 flex flex-col bg-cyber-surface/50 p-8 rounded-lg border border-cyber-border/50 shadow-glow min-h-0">
        <div className="space-y-8 flex-1 overflow-y-auto pr-4">
            {report.summary && <MarkdownContent content={report.summary} />}
            {report.deliveryAnalysis && <DeliveryAnalysisReport analysis={report.deliveryAnalysis} />}

            {report.codingResults && report.codingResults.length > 0 && (
                <div>
                    <h3 className="font-orbitron text-2xl text-cyber-glow border-b-2 border-cyber-border/30 pb-2 mb-4 animate-flicker">Coding Challenge Analysis</h3>
                    <div className="space-y-6">
                        {report.codingResults.map((result, index) => (
                            <div key={index} className="bg-black/30 p-4 rounded-md border border-cyber-border/20">
                                <h4 className="font-orbitron text-lg text-white mb-2">Challenge {index + 1}</h4>
                                <p className="font-mono text-cyber-text mb-4 italic">"{result.question}"</p>
                                
                                <h5 className="font-orbitron text-md text-cyber-glow mb-2">Your Solution</h5>
                                <pre className="bg-cyber-bg p-3 rounded-md border border-cyber-border/30 overflow-x-auto mb-4">
                                    <code className="text-sm text-cyber-text whitespace-pre-wrap">
                                        {result.code}
                                    </code>
                                </pre>

                                <h5 className="font-orbitron text-md text-cyber-glow mb-2">AI Feedback</h5>
                                <MarkdownContent content={result.feedback} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {report.mcqResults && report.mcqResults.length > 0 && (
                <div>
                    <h3 className="font-orbitron text-2xl text-cyber-glow border-b-2 border-cyber-border/30 pb-2 mb-4 animate-flicker">MCQ Results Breakdown</h3>
                    <div className="space-y-4">
                        {report.mcqResults.map((result, index) => {
                            const isCorrect = result.userAnswer === result.question.correctAnswer;
                            return (
                                <div key={index} className="p-4 rounded-md bg-black/30 border border-cyber-border/20 font-mono">
                                    <p className="font-bold text-white mb-2">{index + 1}. {result.question.question}</p>
                                    <div className="space-y-2 text-sm">
                                        <div className={`flex items-start gap-2 p-2 rounded ${isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                            {isCorrect ? <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                                            <span><strong>Your Answer:</strong> {result.userAnswer}</span>
                                        </div>
                                        {!isCorrect && (
                                            <div className="flex items-start gap-2 p-2 rounded bg-cyber-glow/20 text-cyber-text">
                                                <CheckCircleIcon className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                                                <span><strong>Correct Answer:</strong> {result.question.correctAnswer}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {history && history.length > 0 && (
                <details>
                    <summary className="font-orbitron text-2xl text-cyber-glow cursor-pointer hover:text-white transition-colors animate-flicker">View Full Transcript</summary>
                    <div className="mt-4 bg-black/30 p-4 rounded-md border border-cyber-border/20 max-h-96 overflow-y-auto space-y-4 font-mono">
                        {history.map((msg: ChatMessage, index: number) => (
                            <div key={index} className={`flex items-start gap-3 max-w-lg lg:max-w-xl ${msg.role === 'user' ? 'justify-end ml-auto' : 'justify-start mr-auto'}`}>
                                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-cyber-border text-cyber-bg flex items-center justify-center font-bold flex-shrink-0 font-orbitron">AI</div>}
                                <div className={`p-3 rounded-lg text-cyber-text ${msg.role === 'user' ? 'bg-cyber-accent/80' : 'bg-cyber-surface'}`}>
                                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                 </div>
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
        
        {onSave ? (
            <div className="flex flex-col-reverse sm:flex-row gap-4 mt-8 shrink-0">
                <button 
                    onClick={onBack}
                    className="w-full font-orbitron bg-cyber-surface text-cyber-text border border-cyber-border/50 font-bold py-3 px-4 rounded-md hover:border-cyber-glow hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-cyber-border transition-all duration-300"
                >
                    DISCARD
                </button>
                <button 
                    onClick={onSave}
                    className="w-full font-orbitron bg-cyber-accent text-white font-bold py-3 px-4 rounded-md hover:bg-cyber-accent/80 hover:shadow-accent-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-cyber-accent transition-all duration-300"
                >
                    SAVE REPORT
                </button>
            </div>
        ) : (
            <button 
                onClick={onBack}
                className="w-full mt-8 font-orbitron bg-cyber-accent text-white font-bold py-3 px-4 rounded-md hover:bg-cyber-accent/80 hover:shadow-accent-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-cyber-accent transition-all duration-300 shrink-0"
            >
                BACK
            </button>
        )}
      </div>
    </div>
  );
};

export default SummaryScreen;