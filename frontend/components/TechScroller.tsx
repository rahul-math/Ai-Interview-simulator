import React from 'react';

const techData = [
    { name: 'React', icon: 'react' },
    { name: 'JavaScript', icon: 'javascript' },
    { name: 'Python', icon: 'python' },
    { name: 'TypeScript', icon: 'typescript' },
    { name: 'Node.js', icon: 'nodedotjs' },
    { name: 'Docker', icon: 'docker' },
    { name: 'Kubernetes', icon: 'kubernetes' },
    { name: 'Google Cloud', icon: 'googlecloud' },
    { name: 'C++', icon: 'cplusplus' },
    { name: 'Rust', icon: 'rust' },
    { name: 'Go', icon: 'go' },
    { name: 'PostgreSQL', icon: 'postgresql' },
    { name: 'MongoDB', icon: 'mongodb' },
    { name: 'Vite', icon: 'vite' },
    { name: 'Tailwind CSS', icon: 'tailwindcss' },
    { name: 'Figma', icon: 'figma' },
];

// Duplicate for a seamless loop
const allTechData = [...techData, ...techData];

const TechScroller: React.FC = () => {
    return (
        <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] py-6">
            <div className="flex w-max animate-infinite-scroll items-center">
                {allTechData.map((tech, index) => (
                     <div key={index} className="relative group flex-shrink-0 px-8">
                        <img
                            src={`https://cdn.simpleicons.org/${tech.icon}`}
                            alt={`${tech.name} logo`}
                            className="h-10 w-auto grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-300"
                        />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                        pointer-events-none">
                            <span className="bg-cyber-glow text-cyber-bg font-mono text-sm px-3 py-1 rounded-md shadow-lg">
                                {tech.name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TechScroller;