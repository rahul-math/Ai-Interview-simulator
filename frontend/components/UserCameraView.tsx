import React, { useEffect, useRef, useState } from 'react';

const UserCameraView: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const enableCamera = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                     setError("Camera API not supported in this browser.");
                     return;
                }
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Camera access denied. Please enable permissions.");
            }
        };

        enableCamera();

        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    return (
        <div className="relative bg-black w-full aspect-video rounded-md border border-cyber-border/30 overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]"></video>
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4">
                    <p className="text-center text-xs text-red-400 font-mono">{error}</p>
                </div>
            )}
            <div className="absolute bottom-1 left-2 text-xs font-mono text-cyber-glow opacity-70 animate-flicker">
                // CAM_USER_01
            </div>
             <div className="absolute top-1 right-2 text-xs font-mono text-red-500 opacity-70 animate-pulse">
                ● REC
            </div>
        </div>
    );
};

export default UserCameraView;