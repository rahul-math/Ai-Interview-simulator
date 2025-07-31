
import React from 'react';

// A simple component to render markdown-like text with cyber theme
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    const isDrillSummary = content.includes("Drill complete.") || content.includes("### STAR Method Analysis");
    
    // For drills, we show a different title and the content more directly
    if (isDrillSummary) {
        const drillContent = content.replace("Drill complete.", "").trim();
        return (
            <div className="space-y-4 font-mono text-cyber-text">
                <h3 className="font-orbitron text-2xl text-cyber-glow border-b-2 border-cyber-border/30 pb-2 mb-4 animate-flicker">Drill Feedback</h3>
                {drillContent.split('\n').map((line, index) => {
                     if (line.startsWith('### ')) {
                        return <h4 key={index} className="font-orbitron text-xl text-white">{line.substring(4)}</h4>
                     }
                     if (line.startsWith('- **')) {
                        const parts = line.substring(2).split(':**');
                        return <p key={index}><strong className="text-cyber-glow">{parts[0]}:</strong>{parts[1]}</p>;
                     }
                     return <p key={index} className="whitespace-pre-wrap">{line}</p>
                })}
            </div>
        );
    }
    
    // Full interview summary rendering
    const elements = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    lines.forEach((line, index) => {
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                elements.push(
                    <pre key={`code-${index}`} className="bg-cyber-bg p-4 rounded-md border border-cyber-border/30 overflow-x-auto">
                        <code className="text-sm text-cyber-text whitespace-pre-wrap">
                            {codeBlockContent.join('\n')}
                        </code>
                    </pre>
                );
                codeBlockContent = [];
            }
            inCodeBlock = !inCodeBlock;
        } else if (inCodeBlock) {
            codeBlockContent.push(line);
        } else if (line.trim() !== '') {
             if (line.startsWith('### ')) {
                elements.push(<h3 key={index} className="font-orbitron text-2xl text-cyber-glow border-b-2 border-cyber-border/30 pb-2 mb-4 mt-4 animate-flicker">{line.substring(4)}</h3>);
            } else if (line.startsWith('**')) {
                elements.push(<p key={index} className="text-lg text-white font-semibold my-2">{line.replace(/\*\*/g, '')}</p>);
            } else if (line.startsWith('- ')) {
                elements.push(<li key={index} className="ml-5 list-disc list-outside text-cyber-text marker:text-cyber-glow">{line.substring(2)}</li>);
            } else {
                elements.push(<p key={index}>{line}</p>);
            }
        }
    });

     if (codeBlockContent.length > 0) {
        elements.push(
            <pre key="code-final" className="bg-cyber-bg p-4 rounded-md border border-cyber-border/30 overflow-x-auto">
                <code className="text-sm text-cyber-text whitespace-pre-wrap">
                    {codeBlockContent.join('\n')}
                </code>
            </pre>
        );
    }


    return (
        <div className="space-y-2 font-mono text-cyber-text">
            {elements}
        </div>
    );
};

export default MarkdownContent;