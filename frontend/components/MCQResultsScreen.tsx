
import React from 'react';
import { MCQResult, Report, InterviewConfig } from '../types';
import { useApp } from '../hooks/useAppContext';

interface MCQResultsScreenProps {
  results: MCQResult[];
  config: InterviewConfig;
  onSaveAndExit: (reportData: Omit<Report, 'id' | 'timestamp'>) => void;
}

const MCQResultsScreen: React.FC<MCQResultsScreenProps> = ({ results, config, onSaveAndExit }) => {
  const { navigateToStage } = useApp();
  const correctAnswersCount = results.filter(
    result => result.userAnswer === result.question.correctAnswer
  ).length;
  const totalQuestions = results.length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;

  const handleSave = () => {
    const summary = `### MCQ Quiz Results for ${config.role}\n\n**Final Score:** ${correctAnswersCount} out of ${totalQuestions} (${scorePercentage}%)`;
    
    const reportData = {
      config,
      summary,
      deliveryAnalysis: { wordsPerMinute: 0, fillerWords: {} }, // Default for this mode
      mcqResults: results,
    };
    onSaveAndExit(reportData);
  }

  return (
    <div className="flex flex-col w-full h-full p-8">
      <div className="w-full flex-1 flex flex-col bg-cyber-surface/50 p-8 rounded-lg border border-cyber-border/50 shadow-glow min-h-0">
        <div className="text-center mb-8 shrink-0">
          <h1 className="font-orbitron text-4xl font-bold text-cyber-glow animate-flicker">QUIZ RESULTS</h1>
          <p className="text-white text-2xl mt-4">
            You scored <span className="text-cyber-glow font-bold">{correctAnswersCount} / {totalQuestions}</span>
          </p>
           <div className="w-full bg-cyber-bg h-4 rounded-full border border-cyber-border/30 mt-4 max-w-md mx-auto">
            <div 
              className="bg-cyber-glow h-full rounded-full"
              style={{ width: `${scorePercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-4 border-t-2 border-cyber-border/20 pt-6 min-h-0">
          {results.map((result, index) => {
            const isCorrect = result.userAnswer === result.question.correctAnswer;
            return (
              <div key={index} className="p-4 rounded-md bg-black/30 border border-cyber-border/20 font-mono">
                <p className="font-bold text-white mb-2">{index + 1}. {result.question.question}</p>
                <div className="space-y-1 text-sm">
                  <p className={`pl-4 pr-2 py-1 rounded ${
                      isCorrect 
                      ? 'bg-green-500/20 text-green-300 border-l-4 border-green-400' 
                      : 'bg-red-500/20 text-red-300 border-l-4 border-red-400'
                    }`}>
                    Your Answer: {result.userAnswer}
                  </p>
                  {!isCorrect && (
                    <p className="pl-4 pr-2 py-1 rounded bg-cyber-glow/20 text-cyber-text border-l-4 border-cyber-glow">
                      Correct Answer: {result.question.correctAnswer}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-4 mt-8 shrink-0">
            <button 
              onClick={() => navigateToStage('practice_arena')}
              className="w-full font-orbitron bg-cyber-surface text-cyber-text border border-cyber-border/50 font-bold py-3 px-4 rounded-md hover:border-cyber-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-cyber-border transition-all duration-300"
            >
              RETURN TO ARENA
            </button>
            <button 
              onClick={handleSave}
              className="w-full font-orbitron bg-cyber-accent text-white font-bold py-3 px-4 rounded-md hover:bg-cyber-accent/80 hover:shadow-accent-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-cyber-accent transition-all duration-300"
            >
              SAVE & EXIT
            </button>
        </div>
      </div>
    </div>
  );
};

export default MCQResultsScreen;