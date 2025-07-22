'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Loader2, Send, ShoppingCart, Search, Maximize2, Minimize2, Mic, MicOff, MessageSquare, Waves } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AIAssistantService } from '../../services/aiAssistant';

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
  products?: any[]; // For displaying search results
  isError?: boolean;
}

// Soundwave visualization component
const SoundwaveVisualization = ({ isActive }: { isActive: boolean }) => {
  const [audioData, setAudioData] = useState<number[]>(new Array(20).fill(0));
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isActive) {
      startAudioVisualization();
    } else {
      stopAudioVisualization();
    }

    return () => {
      stopAudioVisualization();
    };
  }, [isActive]);

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      animate();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudioVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const animate = () => {
    if (analyserRef.current) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Convert audio data to visualization bars
      const bars = 20;
      const step = Math.floor(bufferLength / bars);
      const newAudioData = [];

      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        const average = sum / step;
        newAudioData.push(average / 255); // Normalize to 0-1
      }

      setAudioData(newAudioData);
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="flex items-end justify-center space-x-2 h-32">
      {audioData.map((value, index) => (
        <motion.div
          key={index}
          className="bg-gradient-to-t from-green-400 to-green-600 rounded-full"
          style={{
            width: '8px',
            minHeight: '20px'
          }}
          animate={{
            height: Math.max(20, value * 120 + 20) + 'px',
            opacity: isActive ? 1 : 0.3
          }}
          transition={{
            duration: 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Voice recognition hook
const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentLanguageRef = useRef<number>(0);
  const isInLanguageFallbackRef = useRef<boolean>(false);
  
  // List of languages to try (start with most compatible)
  const supportedLanguages = [null, '', 'en', 'en-US', 'en-GB', 'auto'];

     // Test microphone permissions
   const testMicrophonePermissions = async () => {
     try {
       console.log('🎤 Testing microphone permissions...');
       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
       console.log('✅ Microphone permissions granted');
       stream.getTracks().forEach(track => track.stop()); // Clean up
       return true;
     } catch (error) {
       console.log('❌ Microphone permission denied or not available:', error);
       return false;
     }
   };

   // Function to create recognition instance with language fallback
   const createRecognitionInstance = (languageIndex = 0) => {
     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
     if (!SpeechRecognition) {
       console.log('❌ No SpeechRecognition API available');
       return null;
     }
     
     try {
       const recognition = new SpeechRecognition();
       
       // Set basic properties
       recognition.continuous = true;
       recognition.interimResults = true;
       recognition.maxAlternatives = 1;
       
       // Set language if specified (start with no language for maximum compatibility)
       const language = supportedLanguages[languageIndex];
       if (language === null) {
         console.log('🌐 Using browser default (no language attribute set at all)');
       } else if (language && language !== 'auto' && language !== '') {
         try {
           recognition.lang = language;
           console.log(`✅ Set speech recognition language to: ${language}`);
         } catch (langError) {
           console.log(`❌ Failed to set language ${language}, using default`);
         }
       } else if (language === '') {
         console.log('🌐 Using empty string language (browser chooses)');
       } else if (language === 'auto') {
         console.log('🌐 Using auto language detection');
       }
       
       return recognition;
     } catch (error) {
       console.error('❌ Error creating speech recognition instance:', error);
       return null;
     }
   };

    useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check browser context and permissions
    const checkSpeechRecognitionContext = () => {
      console.log('🔍 Checking speech recognition context...');
      console.log('  Protocol:', window.location.protocol);
      console.log('  Host:', window.location.host);
      console.log('  User Agent:', navigator.userAgent.substring(0, 100));
      
      // Check if we're on HTTPS (required for speech recognition in modern browsers)
      if (window.location.protocol !== 'https:') {
                 console.log('❌ Speech recognition requires HTTPS in modern browsers');
         console.log('🔧 Quick Solutions (choose one):');
         console.log('  🟢 EASIEST: Enable Chrome flag for localhost');
         console.log('     1. Go to: chrome://flags/#unsafely-treat-insecure-origin-as-secure');
         console.log('     2. Add: http://localhost:3000');
         console.log('     3. Restart Chrome');
         console.log('  🔧 OR: Use HTTPS development server');
         console.log('     1. Stop current server (Ctrl+C)');
         console.log('     2. Run: npm run dev:https');
         console.log('     3. Visit: https://localhost:3000 (accept certificate warning)');
        setIsSupported(false);
        setHasError(true);
        return false;
      }
      
      return true;
    };

    const initializeRecognition = async () => {
      if (!checkSpeechRecognitionContext()) {
        return;
      }
      
      // Test microphone permissions first
      const micAvailable = await testMicrophonePermissions();
      if (!micAvailable) {
        console.log('❌ Cannot initialize speech recognition without microphone access');
        setIsSupported(false);
        setHasError(true);
        return;
      }
      
      const recognition = createRecognitionInstance(currentLanguageRef.current);
      if (!recognition) {
        console.log('❌ Speech recognition not supported in this browser');
        setIsSupported(false);
        return;
      }
      
      recognitionRef.current = recognition;
       
       // Add start handler for debugging
       recognitionRef.current.onstart = () => {
         console.log('Speech recognition actually started and is listening...');
       };
       
       // Set up event handlers
       recognitionRef.current.onresult = (event: any) => {
         try {
           const current = event.resultIndex;
           const transcript = event.results[current][0].transcript;
           const isFinal = event.results[current].isFinal;
           
           console.log('Speech result:', transcript, 'Final:', isFinal);
           setTranscript(transcript);
           
           // If it's a final result and we have continuous mode, 
           // we can process it immediately
           if (isFinal && transcript.trim()) {
             console.log('Final speech result received, stopping...');
             setTimeout(() => stopListening(), 500); // Small delay to ensure clean stop
           }
         } catch (e) {
           console.error('Error processing speech result:', e);
         }
       };

       recognitionRef.current.onend = () => {
         console.log('Speech recognition ended, transcript:', transcript);
         setIsListening(false);
         
         // Process transcript if we have one
         if (transcript && transcript.trim()) {
           console.log('Processing transcript:', transcript);
           setIsProcessing(true);
         } else {
           console.log('No transcript to process');
         }
       };

       recognitionRef.current.onerror = (event: any) => {
         console.log('🚨 Speech recognition error occurred:', event.error);
         
         // Try next language if language-not-supported
         if (event.error === 'language-not-supported') {
           console.log(`❌ Language not supported (attempt ${currentLanguageRef.current + 1}/${supportedLanguages.length})`);
           
           // Set fallback flag to maintain listening state during language switching
           isInLanguageFallbackRef.current = true;
           
           currentLanguageRef.current += 1;
           if (currentLanguageRef.current < supportedLanguages.length) {
             console.log(`🔄 Trying next language option (${supportedLanguages[currentLanguageRef.current] === null ? 'no-lang-attribute' : supportedLanguages[currentLanguageRef.current] || 'browser default'})...`);
             
             // Don't stop listening state during fallback - keep blur active
             setIsProcessing(false);
             
             setTimeout(async () => {
               await initializeRecognition();
               // After successful reinit, restart listening automatically
               setTimeout(() => {
                 console.log('🔍 Auto-restart check:');
                 console.log('  recognitionRef.current:', !!recognitionRef.current);
                 console.log('  isSupported:', isSupported);
                 console.log('  isInLanguageFallbackRef.current:', isInLanguageFallbackRef.current);
                 
                 if (recognitionRef.current && isInLanguageFallbackRef.current) {
                   console.log('🔄 Auto-restarting speech recognition with new language...');
                   try {
                     setTranscript('');
                     setIsProcessing(false);
                     // Keep isListening true to maintain blur
                     setHasError(false);
                     recognitionRef.current.start();
                     
                     // Set timeout again for the new session
                     if (timeoutRef.current) {
                       clearTimeout(timeoutRef.current);
                     }
                     timeoutRef.current = setTimeout(() => {
                       console.log('⏰ Speech recognition timeout - stopping...');
                       stopListening();
                     }, 15000);
                     
                     console.log('✅ Auto-restart successful');
                     isInLanguageFallbackRef.current = false;
                   } catch (restartError) {
                     console.log('❌ Auto-restart failed:', restartError);
                     setIsListening(false);
                     isInLanguageFallbackRef.current = false;
                   }
                 } else {
                   console.log('❌ Auto-restart conditions not met, skipping...');
                 }
               }, 500);
             }, 100);
             return;
           } else {
             console.log('💀 All language options exhausted - this browser cannot use speech recognition on HTTP');
             console.log('🔧 The issue is HTTP vs HTTPS (see detailed instructions above)');
             console.log('  ✅ Microphone: Working');
             console.log('  ✅ Browser: Supported'); 
             console.log('  ❌ Protocol: HTTP (needs HTTPS)');
             console.log('👆 Scroll up for step-by-step HTTPS setup instructions');
             setIsListening(false);
             setHasError(true);
             setIsSupported(false);
             isInLanguageFallbackRef.current = false;
             return;
           }
         }
         
         // For other errors, stop listening normally
         setIsListening(false);
         setIsProcessing(false);
         
         // Only disable for truly critical errors
         if (event.error === 'audio-capture' || 
             event.error === 'not-allowed') {
           setHasError(true);
           console.warn('🚫 Critical speech recognition error:', event.error);
         } else {
           setHasError(false);
           console.log('⚠️ Non-critical error:', event.error, '- continuing...');
         }
       };

       // If we get here, speech recognition is working
       setIsSupported(true);
       setHasError(false);
       const currentLang = supportedLanguages[currentLanguageRef.current];
       const langDisplay = currentLang === null ? 'no-lang-attribute' : currentLang || 'browser default';
       console.log(`✅ Speech recognition initialized successfully with language: ${langDisplay}`);
     };
     
     // Reset language index on first load
     currentLanguageRef.current = 0;
     
     // Start initialization
     initializeRecognition().catch(error => {
       console.error('❌ Failed to initialize speech recognition:', error);
       setIsSupported(false);
       setHasError(true);
     });

    return () => {
      // Cleanup timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Clear fallback flag
      isInLanguageFallbackRef.current = false;
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  }, [transcript]);

  const startListening = () => {
    const currentLang = supportedLanguages[currentLanguageRef.current];
    const langDisplay = currentLang === null ? 'no-lang-attribute' : currentLang || 'browser default';
    console.log(`🎤 Starting speech recognition with language: ${langDisplay}...`);
    
    if (recognitionRef.current && isSupported) {
      try {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Reset fallback flag for new user-initiated session
        isInLanguageFallbackRef.current = false;
        
        setTranscript('');
        setIsProcessing(false);
        setIsListening(true);
        setHasError(false);
        recognitionRef.current.start();
        console.log('✅ Speech recognition started successfully');
        
        // Set a timeout to stop listening after 15 seconds
        timeoutRef.current = setTimeout(() => {
          console.log('⏰ Speech recognition timeout - stopping...');
          stopListening();
        }, 15000);
        
      } catch (error) {
        console.error('❌ Error starting speech recognition:', error);
        
        // If start fails, try to reinitialize with next language
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorName = error instanceof Error ? error.name : '';
        if (errorName === 'InvalidStateError' || errorMessage.includes('already started')) {
          console.log('🔄 Recognition already started or in invalid state, stopping and retrying...');
          try {
            recognitionRef.current.stop();
          } catch (e) {}
          setTimeout(() => startListening(), 500);
          return;
        }
        
        setIsListening(false);
        setHasError(true);
      }
    } else {
      console.log('🚫 Cannot start speech recognition');
      console.log('recognitionRef.current:', !!recognitionRef.current);
      console.log('isSupported:', isSupported);
      console.log('hasError:', hasError);
      
      // If not supported, give clear feedback
      if (!isSupported && !hasError) {
        console.log('🔄 Speech recognition not initialized yet, please try again in a moment...');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        console.log('🛑 Stopping speech recognition...');
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        // Clear fallback flag
        isInLanguageFallbackRef.current = false;
        
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('❌ Error stopping speech recognition:', error);
        setIsListening(false);
        isInLanguageFallbackRef.current = false;
      }
    }
  };

  const resetProcessing = () => {
    setIsProcessing(false);
    setTranscript('');
  };

  return {
    isListening,
    transcript,
    isSupported,
    isProcessing,
    hasError,
    startListening,
    stopListening,
    resetProcessing
  };
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Debug log to ensure component is mounting
  useEffect(() => {
    console.log('🤖 AIAssistant component mounted (v3.0 - Smart Speech Recognition with Diagnostics)');
    
         // Add global test function for manual debugging
     (window as any).testSpeechRecognition = () => {
       console.log('🧪 Manual Speech Recognition Test');
       console.log('Protocol:', window.location.protocol);
       console.log('Host:', window.location.host);
       console.log('SpeechRecognition available:', !!(window.SpeechRecognition || window.webkitSpeechRecognition));
       
       if (window.location.protocol !== 'https:') {
         console.log('❌ ISSUE FOUND: HTTP protocol detected');
         console.log('🔧 Solution: Enable HTTPS or Chrome flag (see above for instructions)');
       }
       
       navigator.mediaDevices?.getUserMedia({ audio: true })
         .then(() => console.log('✅ Microphone accessible'))
         .catch(e => console.log('❌ Microphone error:', e));
     };
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Set initial position after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 100,
        y: window.innerHeight - 100
      });
    }
  }, []);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const aiService = useRef(new AIAssistantService());
  
  const {
    isListening,
    transcript,
    isSupported,
    isProcessing,
    hasError,
    startListening,
    stopListening,
    resetProcessing
  } = useVoiceRecognition();

  // Initialize AI service with router
  useEffect(() => {
    aiService.current.setRouter(router);
  }, [router]);

  // Show welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleInitialMessage();
    }
  }, [isOpen]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript && !isListening && isProcessing) {
      setInputValue(transcript);
      handleSendMessage(undefined, transcript);
      resetProcessing();
    }
  }, [transcript, isListening, isProcessing]);

  const handleInitialMessage = async () => {
    try {
      const initialMessage = await aiService.current.processMessage('__INIT__');
      setMessages([
        {
          role: 'assistant',
          content: initialMessage,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error getting initial message:', error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, voiceInput?: string) => {
    if (e) e.preventDefault();
    
    const messageText = voiceInput || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await aiService.current.processMessage(messageText);
      
      // Remove loading message and add actual response
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          loading: false
        };
        return newMessages;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
          loading: false,
          isError: true
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMainClick = () => {
    if (isDragging) return;
    
    if (isOpen) {
      setIsOpen(false);
      setShowOptions(false);
    } else if (showOptions) {
      setShowOptions(false);
    } else {
      setShowOptions(true);
    }
  };

  const handleTextChat = () => {
    setShowOptions(false);
    setIsOpen(true);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    
    // Update position
    setPosition(prev => ({
      x: prev.x + info.offset.x,
      y: prev.y + info.offset.y
    }));
  };

  const handleClick = () => {
    handleMainClick();
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add blur effect to body when voice is active
  useEffect(() => {
    if (isListening || isProcessing) {
      document.body.style.filter = 'blur(8px)';
      document.body.style.pointerEvents = 'none';
    } else {
      document.body.style.filter = '';
      document.body.style.pointerEvents = '';
    }

    return () => {
      document.body.style.filter = '';
      document.body.style.pointerEvents = '';
    };
  }, [isListening, isProcessing]);

  const renderMessageContent = (message: Message) => {
    if (message.loading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Thinking...</span>
        </div>
      );
    }

    if (message.content.includes('[PRODUCTS]')) {
      // Handle product display if needed
      return <div>{message.content.replace('[PRODUCTS]', '')}</div>;
    }

    return message.content;
  };

  return (
    <>
      {/* Full-screen voice overlay */}
      <AnimatePresence>
        {(isListening || isProcessing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          >
            <div className="text-center text-white">
              {isListening ? (
                <>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8"
                  >
                    <div className="mb-6">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <Mic className="h-10 w-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Listening...</h2>
                      <p className="text-lg opacity-80">Speak now, I'm all ears! 👂</p>
                    </div>
                  </motion.div>

                  {/* Soundwave Visualization */}
                  <SoundwaveVisualization isActive={isListening} />

                  {/* Live Transcript */}
                  {transcript && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-4 bg-black bg-opacity-50 rounded-lg max-w-md mx-auto"
                    >
                      <p className="text-sm opacity-70 mb-1">You said:</p>
                      <p className="text-lg font-medium">"{transcript}"</p>
                    </motion.div>
                  )}

                  {/* Cancel Button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={stopListening}
                    className="mt-8 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
                  >
                    Cancel
                  </motion.button>
                </>
              ) : isProcessing ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Processing...</h2>
                  <p className="text-lg opacity-80">Understanding what you said 🤔</p>
                  {transcript && (
                    <div className="mt-6 p-4 bg-black bg-opacity-50 rounded-lg max-w-md mx-auto">
                      <p className="text-sm opacity-70 mb-1">Processing:</p>
                      <p className="text-lg font-medium">"{transcript}"</p>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none">
        <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="chat-window"
            className="fixed z-50 bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto select-none"
            initial={{ 
              scale: 0.8, 
              opacity: 0
            }}
            animate={{ 
              scale: 1, 
              opacity: 1
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            style={{
              bottom: '6rem',
              right: '1.5rem',
              width: '400px',
              height: '500px',
              maxWidth: '90vw',
              maxHeight: '80vh'
            }}
          >
            {/* Header */}
            <div className="bg-green-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-green-700 p-1 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 flex flex-col h-full">
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ maxHeight: '350px' }}
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-green-600 text-white'
                          : message.isError
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {renderMessageContent(message)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : showOptions ? (
          <motion.div
            key="options-menu"
            className="fixed z-50 pointer-events-auto select-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1
            }}
            style={{
              bottom: '6rem',
              right: '1.5rem'
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
          >
            {/* Text Chat Option */}
            <motion.button
              className="absolute bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors mb-2"
              initial={{ x: 0, y: 0, scale: 0 }}
              animate={{ x: -80, y: -20, scale: 1 }}
              exit={{ x: 0, y: 0, scale: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              onClick={handleTextChat}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageSquare className="h-6 w-6" />
            </motion.button>

            {/* Voice Input Option */}
            <motion.button
              className={`absolute p-4 rounded-full shadow-lg transition-colors ${
                !isSupported || hasError
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : isListening 
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
              initial={{ x: 0, y: 0, scale: 0 }}
              animate={{ x: 20, y: -80, scale: 1 }}
              exit={{ x: 0, y: 0, scale: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              onClick={handleVoiceInput}
              whileHover={{ scale: !isSupported || hasError ? 1 : 1.1 }}
              whileTap={{ scale: !isSupported || hasError ? 1 : 0.9 }}
              disabled={!isSupported || hasError}
            >
              {isListening ? (
                <div className="flex items-center justify-center">
                  <Waves className="h-6 w-6" />
                </div>
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </motion.button>

            {/* Main AI Button */}
            <motion.button
              className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMainClick}
            >
              <Bot className="h-6 w-6" />
            </motion.button>

            {/* Voice Status Text */}
            {isListening && (
              <motion.div
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-sm whitespace-nowrap"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                🎤 Listening... Speak now!
              </motion.div>
            )}

            {transcript && !isListening && (
              <motion.div
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-sm max-w-48 truncate"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                "{transcript}"
              </motion.div>
            )}

            {(!isSupported || hasError) && (
              <motion.div
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-lg text-xs max-w-xs text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {window.location.protocol !== 'https:' 
                  ? "🔒 Voice needs HTTPS - Check console for setup" 
                  : "🎤 Voice not supported - Use text chat"
                }
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="chat-button"
            className="fixed bottom-6 right-6 z-50 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors pointer-events-auto select-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 1
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
      </div>
    </>
  );
} 