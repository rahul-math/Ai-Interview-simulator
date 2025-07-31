
import React from 'react';
import { DeliveryAnalysis } from '../types';

interface DeliveryAnalysisReportProps {
    analysis: DeliveryAnalysis;
}

const DeliveryAnalysisReport: React.FC<DeliveryAnalysisReportProps> = ({ analysis }) => {
    const fillerWordEntries = Object.entries(analysis.fillerWords).filter(([, count]) => typeof count === 'number' && count > 0);

    return (
        <div className="font-mono text-cyber-text space-y-4">
            <h3 className="font-orbitron text-2xl text-cyber-glow border-b-2 border-cyber-border/30 pb-2 mb-4 animate-flicker">Delivery Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cyber-bg/50 p-4 rounded-md border border-cyber-border/20">
                    <p className="text-sm text-cyber-text/80 tracking-widest">SPEAKING PACE</p>
                    <p className="text-3xl font-bold text-white">{analysis.wordsPerMinute} <span className="text-lg font-normal text-cyber-text/80">WPM</span></p>
                </div>
                <div className="bg-cyber-bg/50 p-4 rounded-md border border-cyber-border/20">
                    <p className="text-sm text-cyber-text/80 tracking-widest">FILLER WORDS</p>
                    {fillerWordEntries.length > 0 ? (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 items-baseline mt-2">
                            {fillerWordEntries.map(([word, count]) => (
                                <p key={word} className="text-lg text-white">
                                    <span className="font-bold text-xl text-cyber-accent">{count}</span> {word}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p className="text-lg text-white mt-2">None detected. Great job!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryAnalysisReport;
