
import React from 'react';
import { InterviewConfig, InterviewMode } from '../types';
import { CheckCircleIcon } from './Icons';

interface InstructionModalProps {
  config: InterviewConfig;
  onConfirm: () => void;
  onCancel: () => void;
}

const InstructionModal: React.FC<InstructionModalProps> = ({ config, onConfirm, onCancel }) => {

  const getInstructions = () => {
    switch (config.mode) {
      case InterviewMode.FULL_INTERVIEW:
        return {
          title: 'Full Interview Protocol',
          points: [
            'A 30-minute timer will start when the AI asks its first question.',
            'Ensure you are in a quiet environment with a stable connection.',
            'For technical screens, you will enter a full-screen coding view.',
            'Your session summary and full transcript will be saved to your dashboard.',
            'Click "End Session" when you are finished, or the timer runs out.'
          ],
        };
      case InterviewMode.PRACTICE_DRILL:
        return {
          title: 'Practice Drill Protocol',
          points: [
            `This is a focused drill for the "${config.drillType}" skill.`,
            'The AI will ask one specific question or give one prompt.',
            'The AI will provide targeted feedback and then end the drill.',
            'Your session summary will be saved to your dashboard.',
            'There is no timer for practice drills.'
          ],
        };
      case InterviewMode.CODING_CHALLENGE:
        return {
          title: 'Coding Challenge Rules',
          points: [
            'You will be presented with one DSA problem.',
            'You can run your code against test cases at any time.',
            'When finished, submit your code for a qualitative AI review.',
            'Your results and the AI feedback will be saved to your dashboard.'
          ],
        };
      case InterviewMode.MCQ_QUIZ:
        return {
          title: 'MCQ Quiz Instructions',
          points: [
            'You will be presented with a series of multiple-choice questions.',
            'Once you answer a question, you cannot go back.',
            'Your final score and results will be saved to your dashboard.',
            'There is no overall timer, but try to answer promptly.'
          ],
        };
      default:
        return {
          title: 'General Instructions',
          points: ['Please follow the on-screen prompts carefully.'],
        };
    }
  };

  const { title, points } = getInstructions();

  return (
    <div className="fixed inset-0 bg-cyber-bg/90 flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="w-full max-w-2xl bg-cyber-surface p-8 rounded-lg border-2 border-cyber-border/50 shadow-glow animate-fadeInUp">
        <h1 className="font-orbitron text-3xl font-bold text-cyber-glow text-center mb-6 animate-flicker">{title}</h1>
        
        <ul className="space-y-4 mb-8 font-mono text-cyber-text text-lg">
          {points.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-cyber-glow flex-shrink-0 mt-1" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col-reverse sm:flex-row gap-4">
          <button
            onClick={onCancel}
            className="w-full font-orbitron bg-cyber-surface text-cyber-text border border-cyber-border/50 font-bold py-3 px-4 rounded-md hover:border-cyber-glow hover:text-white transition-all duration-300"
          >
            GO BACK
          </button>
          <button
            onClick={onConfirm}
            className="w-full font-orbitron bg-cyber-border text-cyber-bg font-bold py-3 px-4 rounded-md hover:bg-white hover:shadow-glow transition-all duration-300"
          >
            I UNDERSTAND, BEGIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionModal;