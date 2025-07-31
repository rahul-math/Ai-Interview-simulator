
import React from 'react';
import { Report, InterviewMode } from '../types';

interface PerformanceHistoryProps {
  reports: Report[];
  selectedReportId: string | undefined;
  onSelectReport: (report: Report) => void;
}

const PerformanceHistory: React.FC<PerformanceHistoryProps> = ({ reports, selectedReportId, onSelectReport }) => {
  return (
    <div className="flex flex-col h-full">
        <h2 className="font-orbitron text-2xl text-cyber-glow border-b-2 border-cyber-border/30 pb-3 mb-6 animate-flicker shrink-0">PERFORMANCE HISTORY</h2>
        {reports.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-black/30 rounded-md border border-cyber-border/20">
                <p className="text-sm text-cyber-text/70 text-center p-4">Your past sessions will appear here.</p>
            </div>
        ) : (
            <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                {/* Display reports in reverse chronological order */}
                {[...reports].reverse().map(report => (
                    <button 
                        key={report.id}
                        onClick={() => onSelectReport(report)}
                        className={`w-full text-left p-3 rounded-md transition-colors duration-200 border ${selectedReportId === report.id ? 'bg-cyber-glow/20 border-cyber-glow' : 'bg-cyber-surface/50 border-cyber-border/30 hover:bg-cyber-surface'}`}
                    >
                        <p className="font-bold text-white text-sm truncate">{report.config.mode === InterviewMode.FULL_INTERVIEW ? report.config.role : report.config.drillType}</p>
                        <p className="text-xs text-cyber-text/70">{report.timestamp}</p>
                    </button>
                ))}
            </div>
        )}
    </div>
  );
};

export default PerformanceHistory;