import React, { useRef, useEffect, useState } from 'react';

interface CodeEditorProps {
    language: string;
    value: string;
    onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, value, onChange }) => {
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [lineCount, setLineCount] = useState(1);

    useEffect(() => {
        const lines = value.split('\n').length;
        setLineCount(lines);
    }, [value]);

    const handleScroll = () => {
        if (lineNumbersRef.current && textareaRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const newValue = value.substring(0, start) + '  ' + value.substring(end);
            onChange(newValue);
            
            // Move cursor after inserted tab
            setTimeout(() => {
                 if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
                }
            }, 0)
        }
    }

    return (
        <div className="flex flex-1 bg-cyber-bg font-mono text-sm relative overflow-hidden rounded-b-lg">
            <div 
                ref={lineNumbersRef}
                className="p-4 text-right text-cyber-text/40 bg-black/20 select-none overflow-y-hidden"
            >
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                ))}
            </div>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                placeholder={`// Write your ${language} solution here...`}
                className="w-full flex-1 bg-transparent text-cyber-text p-4 resize-none focus:outline-none leading-normal"
                spellCheck="false"
                wrap="off" // Use horizontal scrolling
            />
        </div>
    );
};

export default CodeEditor;