import { useState, useEffect, useRef, useCallback } from 'react';

// Type definitions for the Web Speech API to fix TypeScript errors.
// These are not exhaustive but cover the properties used in this hook.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

// Extend the Window interface to include vendor-prefixed SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// The Web Speech API is not standard and has vendor prefixes.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synthesis = window.speechSynthesis;

interface UseSpeechOptions {
  onTranscript: (transcript: string) => void;
  onFinalTranscript: (transcript: string) => void;
}

export const useSpeech = ({ onTranscript, onFinalTranscript }: UseSpeechOptions) => {
  const [isApiSupported, setIsApiSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (SpeechRecognition && synthesis) {
      setIsApiSupported(true);
    } else {
      console.error("Speech Recognition or Synthesis API not supported in this browser.");
      setIsApiSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      onTranscript(interimTranscript);
      if (finalTranscript) {
        onFinalTranscript(finalTranscript.trim());
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    }

    recognitionRef.current = recognition;

    return () => {
      synthesis.cancel();
      recognitionRef.current?.abort();
    };
  }, [onTranscript, onFinalTranscript]);

  const startRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording && !isSpeaking) {
      synthesis.cancel();
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }, [isRecording, isSpeaking]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const speak = useCallback((text: string, onEndCallback?: () => void) => {
    if (!synthesis) return;

    synthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
        setIsSpeaking(false);
        onEndCallback?.();
    };
    utterance.onerror = (event) => {
        const error = (event as any).error;
        // The 'interrupted' error is not critical in our use case, as we intentionally
        // call `synthesis.cancel()` to stop previous speech before starting a new one.
        // We can safely ignore it to avoid cluttering the console.
        if (error === 'interrupted') {
            // This is expected, do nothing.
        } else {
            console.error('Speech synthesis error:', error);
        }
        setIsSpeaking(false);
        onEndCallback?.();
    };

    synthesis.speak(utterance);
  }, []);

  return { isApiSupported, isRecording, isSpeaking, startRecording, stopRecording, speak };
};