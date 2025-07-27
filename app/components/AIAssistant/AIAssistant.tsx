'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Loader2, Send, ShoppingCart, Search, Maximize2, Minimize2, Mic, MicOff, MessageSquare, Waves, StopCircle } from 'lucide-react';
// Removed useRouter - no longer needed with Google Gemini API
// Removed AIAssistantService - now using Google Gemini API directly

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
    <div className="flex items-end justify-center space-x-3 h-40 bg-black bg-opacity-30 rounded-2xl p-6">
      {audioData.map((value, index) => (
        <motion.div
          key={index}
          className="bg-gradient-to-t from-green-300 via-green-400 to-green-500 rounded-full shadow-lg shadow-green-400/50"
          style={{
            width: '10px',
            minHeight: '30px'
          }}
          animate={{
            height: Math.max(30, value * 150 + 30) + 'px',
            opacity: isActive ? 1 : 0.4,
            scale: isActive ? 1 : 0.8
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

// Add cute blob animation component
const CuteAIBlob = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="flex items-center justify-center h-40">
      <motion.div
        className="relative"
        animate={isActive ? {
          scale: [1, 1.2, 1, 1.1, 1],
          rotate: [0, 5, -5, 3, 0]
        } : { scale: 1, rotate: 0 }}
        transition={{
          duration: 2,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Main blob body */}
        <motion.div
          className="w-32 h-32 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full relative overflow-hidden"
          animate={isActive ? {
            borderRadius: ["50%", "60% 40% 40% 60%", "40% 60% 60% 40%", "50%"]
          } : {}}
          transition={{
            duration: 3,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {/* Cute eyes */}
          <div className="absolute top-8 left-6 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute top-8 right-6 w-3 h-3 bg-white rounded-full"></div>
          
          {/* Cute mouth */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-white rounded-full"
            animate={isActive ? {
              scaleX: [1, 1.3, 1, 1.2, 1],
              scaleY: [1, 0.8, 1, 0.9, 1]
            } : {}}
            transition={{
              duration: 1.5,
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
          
          {/* Thinking dots */}
          {isActive && (
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-purple-300 rounded-full"
                  animate={{
                    y: [-2, -8, -2],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

// AI-Powered Voice Recognition Hook (OpenAI Whisper)
const useAIVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

       // Test microphone permissions and setup MediaRecorder
  const initializeAudioRecording = async () => {
    try {
      console.log('🎤 Initializing AI voice recognition...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      console.log('✅ Microphone access granted');
      
      streamRef.current = stream;
      
      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        console.log('❌ Audio recording not supported');
        setIsSupported(false);
        setHasError(true);
        return false;
      }
      
      setIsSupported(true);
      setHasError(false);
      console.log('✅ AI voice recognition ready');
      return true;
      
    } catch (error) {
      console.log('❌ Microphone permission denied:', error);
      setIsSupported(false);
      setHasError(true);
      return false;
    }
  };

  // Send audio to Google Gemini API for transcription
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      console.log('🤖 Sending audio to Google Gemini for transcription...');
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      
      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      console.log('📡 Gemini transcription response:', data);
      
      if (response.ok && data.text) {
        console.log('✅ Gemini transcription complete:', data.text);
        return data.text;
      } else {
        console.log('❌ Gemini transcription failed:', data.message);
        setHasError(true);
        throw new Error(data.message || 'Transcription failed');
      }
      
    } catch (error) {
      console.error('❌ Gemini transcription error:', error);
      throw error;
    }
  };

      useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Initialize AI voice recognition
    initializeAudioRecording();

    return () => {
      // Cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    console.log('🎤 Starting AI voice recognition...');
    
    if (!streamRef.current || !isSupported) {
      console.log('🚫 Cannot start recording - not initialized');
      setHasError(true);
      return;
    }
    
    try {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Reset audio chunks
      audioChunksRef.current = [];
      
      // Create MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm'
      });
      
      // Set up event handlers
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        console.log('🎵 Recording stopped, processing audio...');
        setIsListening(false);
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log('📦 Audio blob created:', audioBlob.size, 'bytes');
          
          const transcriptText = await transcribeAudio(audioBlob);
          setTranscript(transcriptText);
          setIsProcessing(false);
          
          // Process the transcript
          if (transcriptText.trim()) {
            console.log('✅ Transcription ready for processing');
            // The transcript will be processed by the existing useEffect
          }
          
        } catch (error) {
          console.error('❌ Transcription failed:', error);
          setIsProcessing(false);
          setHasError(true);
        }
      };
      
      // Start recording
      setTranscript('');
      setIsProcessing(false);
      setIsListening(true);
      setHasError(false);
      
      mediaRecorderRef.current.start();
      console.log('✅ AI voice recording started');
      
      // Set a timeout to stop listening after 15 seconds
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Recording timeout - stopping...');
        stopListening();
      }, 15000);
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      setIsListening(false);
      setHasError(true);
    }
  };

  const stopListening = async () => {
    try {
      console.log('🛑 Stopping AI voice recording...');
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      } else {
        setIsListening(false);
      }
      
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
      setIsListening(false);
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
  // All useState hooks at the top
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // Removed router and aiService - now using Google Gemini API directly

  // Hook for voice recognition
  const {
    isListening: hookIsListening,
    transcript: hookTranscript,
    isSupported,
    isProcessing: hookIsProcessing,
    hasError,
    startListening: hookStartListening,
    stopListening: hookStopListening,
    resetProcessing
  } = useAIVoiceRecognition();

  // OpenRouter API integration for AI responses - Sustainability & Eraiiz Focus
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      console.log('🌱 Getting sustainability-focused AI response from OpenRouter (DeepSeek) for:', userMessage);
      
      const requestBody = {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are "Eco-Edu", a passionate sustainability educator and AI assistant for Eraiiz, an eco-friendly marketplace.

CRITICAL INSTRUCTIONS:
- NEVER use <think> tags or show internal reasoning
- NEVER start responses with "Okay" or "Let me think"
- Give direct, immediate responses
- Do not explain your thinking process
- Respond as if you're speaking directly to the user

Your mission is to help people learn about sustainability, carbon emissions, environmental impact, and eco-friendly living.

Key topics you're an expert in:
- Carbon footprint calculation and reduction
- Sustainable materials (recycled, biodegradable, renewable)
- Environmental impact of consumer choices
- Green living tips and practices
- Eraiiz marketplace features and eco-products
- Climate change and environmental science
- Circular economy principles
- Sustainable shopping habits

Respond as a friendly, knowledgeable sustainability expert. Be enthusiastic about environmental topics, use emojis when appropriate, and always connect your answers to how Eraiiz helps people make sustainable choices. Keep responses conversational, educational, and inspiring (150-200 words max).`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      };

      console.log('📡 Sending request to OpenRouter API...');
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://eraiiz.com',
          'X-Title': 'Eraiiz - Eco-Friendly Marketplace'
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📱 OpenRouter API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ OpenRouter API error:', errorData);
        throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('📊 OpenRouter API response data:', data);
      
      // Check if data is empty or malformed
      if (!data || typeof data !== 'object') {
        console.error('❌ Invalid response data:', data);
        throw new Error('Invalid response from OpenRouter API');
      }
      
      // Check for error in response
      if (data.error) {
        console.error('❌ OpenRouter API error in response:', data.error);
        throw new Error(`OpenRouter API error: ${data.error.message || data.error}`);
      }
      
      // Check if choices array exists and has content
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        console.error('❌ No choices in response:', data);
        throw new Error('No response choices from OpenRouter API');
      }
      
      const aiResponse = data.choices[0]?.message?.content;
      
      if (aiResponse && typeof aiResponse === 'string') {
        console.log('✅ AI response extracted:', aiResponse);
        
        // Clean up any thinking tags or internal reasoning
        let cleanedResponse = aiResponse.trim();
        
        // Remove <think> tags and their content
        cleanedResponse = cleanedResponse.replace(/<think>[\s\S]*?<\/think>/g, '');
        
        // Remove any remaining thinking indicators
        cleanedResponse = cleanedResponse.replace(/^(Okay,|Let me think|I think|Hmm,)/i, '');
        
        // Remove extra whitespace
        cleanedResponse = cleanedResponse.replace(/\s+/g, ' ').trim();
        
        // If response is empty after cleaning, provide a fallback
        if (!cleanedResponse) {
          return "🌱 I'm Eco-Edu, your sustainability educator! I'm here to help you learn about environmental impact, carbon footprints, and eco-friendly living. At Eraiiz, we make sustainable shopping easy and accessible. What sustainability topic interests you today? 💚";
        }
        
        return cleanedResponse;
      } else {
        console.error('❌ No valid response text in data:', data);
        console.error('❌ Response structure:', {
          hasChoices: !!data.choices,
          choicesLength: data.choices?.length,
          firstChoice: data.choices?.[0],
          hasMessage: !!data.choices?.[0]?.message,
          messageContent: data.choices?.[0]?.message?.content
        });
        throw new Error('No valid response content from OpenRouter API');
      }
      
    } catch (error) {
      console.error('❌ AI response error details:', error);
      
      // Provide a helpful fallback response based on the user's message
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "🌱 Hey there! I'm Eco-Edu, your sustainability educator at Eraiiz! I'm here to help you learn about eco-friendly living, carbon footprints, and sustainable choices. What would you like to know about sustainability today? 💚";
      } else if (lowerMessage.includes('carbon') || lowerMessage.includes('footprint')) {
        return "🌍 Carbon footprints measure the total greenhouse gas emissions from your activities! At Eraiiz, we help you make sustainable choices that reduce your environmental impact. Every eco-friendly product you choose makes a difference! Want to learn more about calculating your carbon footprint? 🌱";
      } else if (lowerMessage.includes('sustainable') || lowerMessage.includes('eco')) {
        return "♻️ Sustainability is all about meeting our needs without compromising future generations! At Eraiiz, we connect you with eco-friendly products made from recycled materials, biodegradable substances, and renewable resources. Every sustainable choice helps protect our planet! 🌿";
      } else {
        return "🌱 I'm Eco-Edu, your sustainability educator! I'm here to help you learn about environmental impact, carbon footprints, and eco-friendly living. At Eraiiz, we make sustainable shopping easy and accessible. What sustainability topic interests you today? 💚";
      }
    }
  };

  // Debug log to ensure component is mounting
  useEffect(() => {
    console.log('🌱 AIAssistant component mounted (v10.0 - OpenRouter Integration)');
    
    // Add global test function for manual debugging
    (window as any).testAIVoice = async () => {
      console.log('🧪 Google Gemini Voice Recognition Test');
      console.log('Protocol:', window.location.protocol);
      console.log('Host:', window.location.host);
      console.log('MediaRecorder supported:', !!window.MediaRecorder);
      console.log('Google Gemini API: Configured and ready');
      
      // Test MediaRecorder capabilities
      if (MediaRecorder) {
        console.log('✅ MediaRecorder available');
        console.log('Supported types:');
        console.log('  audio/webm:', MediaRecorder.isTypeSupported('audio/webm'));
        console.log('  audio/mp4:', MediaRecorder.isTypeSupported('audio/mp4'));
        console.log('  audio/wav:', MediaRecorder.isTypeSupported('audio/wav'));
      } else {
        console.log('❌ MediaRecorder not available');
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone accessible');
        stream.getTracks().forEach(track => track.stop());
        
        // Test audio recording capability
        const recorder = new MediaRecorder(stream);
        console.log('✅ Can create MediaRecorder instance');
        
      } catch (e) {
        console.log('❌ Microphone/Recording error:', e);
      }
    };

    // Add test function for AI response
    (window as any).testAIResponse = async (message = "Hello, how are you?") => {
      console.log('🧪 Testing AI Response with:', message);
      try {
        const response = await getAIResponse(message);
        console.log('✅ Test AI Response:', response);
        return response;
      } catch (error) {
        console.error('❌ Test AI Response failed:', error);
        return null;
      }
    };
  }, []);

  // Set initial position after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 100,
        y: window.innerHeight - 100
      });
    }
  }, []);

  // Removed AI service initialization - now using Google Gemini API directly

  // Show welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleInitialMessage();
    }
  }, [isOpen]);

  // Update the voice transcript handler with better state management
  useEffect(() => {
    if (hookTranscript && !hookIsListening && hookIsProcessing) {
      console.log('🎯 Processing transcript:', hookTranscript);
      setInputValue(hookTranscript);
      
      // Keep overlay open and start AI response process
      setShowVoiceOverlay(true);
      setIsAIResponding(true);
      
      console.log('🤖 Starting AI response...');
      
      // Get real AI response with better error handling
      getAIResponse(hookTranscript)
        .then((response) => {
          console.log('✅ AI response received:', response);
          setAiResponse(response);
          setIsAIResponding(false);
        })
        .catch((error) => {
          console.error('❌ AI response failed:', error);
          setAiResponse("Sorry, I couldn't process that. Please try again!");
          setIsAIResponding(false);
        });
      
      resetProcessing();
    }
  }, [hookTranscript, hookIsListening, hookIsProcessing]);

  // Show error modal when voice recognition is not supported or has error
  useEffect(() => {
    if ((!isSupported || hasError) && !showErrorModal) {
      setShowErrorModal(true);
    }
  }, [isSupported, hasError, showErrorModal]);

  const handleInitialMessage = async () => {
    try {
      // Use Google Gemini API for sustainability-focused welcome message
      const initialMessage = await getAIResponse('Hello! I just opened the chat. Please give me an enthusiastic welcome message introducing yourself as Eco-Edu, a sustainability educator for Eraiiz. Tell me about your mission to help people learn about sustainability, carbon emissions, and eco-friendly living. Make it inspiring and educational!');
      setMessages([
        {
          role: 'assistant',
          content: initialMessage,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error getting initial message:', error);
      // Fallback sustainability-focused welcome message
      setMessages([
        {
          role: 'assistant',
          content: '🌱 Hello! I\'m Eco-Edu, your passionate sustainability educator here at Eraiiz! 🌍✨\n\nI\'m here to help you learn everything about sustainable living, carbon footprints, and making eco-friendly choices. Whether you want to understand how your shopping impacts the planet, learn about sustainable materials, or discover ways to reduce your environmental footprint - I\'ve got you covered!\n\nWhat sustainability topic would you like to explore today? From carbon emissions to green living tips, I\'m excited to share knowledge that helps you make a positive impact! 🌿💚',
          timestamp: new Date()
        }
      ]);
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
      // Use Google Gemini API for text chat responses
      const response = await getAIResponse(messageText);
      
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
    if (hookIsListening) {
      hookStopListening();
    } else {
      setShowVoiceOverlay(true);
      hookStartListening();
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

  // Add blur effect to background content when voice is active (but not the voice overlay)
  useEffect(() => {
    if (hookIsListening || hookIsProcessing || isAIResponding) {
      // Add a CSS class that blurs everything except our voice overlay
      const style = document.createElement('style');
      style.id = 'voice-blur-style';
      style.textContent = `
        body > *:not(.voice-overlay) {
          filter: blur(8px) !important;
          pointer-events: none !important;
        }
        .voice-overlay {
          filter: none !important;
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      // Remove the blur style
      const existingStyle = document.getElementById('voice-blur-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    }

    return () => {
      // Cleanup on unmount
      const existingStyle = document.getElementById('voice-blur-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [hookIsListening, hookIsProcessing, isAIResponding]);

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

  // Handler for closing overlay
  const handleCloseOverlay = () => {
    setShowVoiceOverlay(false);
    setAiResponse(null);
    setIsAIResponding(false);
  };

  // Handler for closing error modal
  const handleCloseErrorModal = () => {
    console.log('🔴 Closing error modal');
    setShowErrorModal(false);
  };



  return (
    <>
      {/* Full-screen voice overlay */}
      <AnimatePresence>
        {(showVoiceOverlay || hookIsListening || hookIsProcessing || isAIResponding) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="voice-overlay fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          >
            <div className="text-center text-white relative">
              {/* X icon to close overlay */}
              <button
                className="absolute top-4 right-4 bg-black bg-opacity-40 rounded-full p-2 hover:bg-opacity-70 transition"
                onClick={handleCloseOverlay}
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
              {/* Stop icon to end/submit voice input */}
              {hookIsListening && (
                <button
                  className="absolute top-4 left-4 bg-black bg-opacity-40 rounded-full p-2 hover:bg-opacity-70 transition"
                  onClick={hookStopListening}
                  aria-label="Stop Recording"
                >
                  <StopCircle className="h-6 w-6 text-red-400" />
                </button>
              )}
              {/* Main content */}
              {hookIsListening ? (
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
                      {/*new audio SoundwaveVisualization animation position*/}
                      {/* transcriptText goes here */}
                        
                    </div>
                    
                  </motion.div>

                  {/* Enhanced Soundwave Visualization */}
                  <div className="my-8">
                    <SoundwaveVisualization isActive={hookIsListening} />
                  </div>

                  {/* Live Transcript - Enhanced Display */}
                  {hookTranscript && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 bg-black bg-opacity-60 rounded-2xl max-w-lg mx-auto border border-green-400/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-sm text-green-300 font-medium">Transcribed Text:</p>
                      </div>
                      <p className="text-lg font-semibold text-white leading-relaxed">"{hookTranscript}"</p>
                    </motion.div>
                  )}

                  {/* Cancel Button */}
                  {/* Removed Cancel button, replaced with Stop and X */}
                </>
              ) : hookIsProcessing ? (
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
                  {hookTranscript && (
                    <div className="mt-6 p-6 bg-black bg-opacity-60 rounded-2xl max-w-lg mx-auto border border-green-400/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-sm text-green-300 font-medium">Processing:</p>
                      </div>
                      <p className="text-lg font-semibold text-white leading-relaxed">"{hookTranscript}"</p>
                    </div>
                  )}
                </motion.div>
              ) : isAIResponding ? (
                // New AI responding state with cute blob
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Thinking...</h2>
                    <p className="text-lg opacity-80">Let me think about that! 🤔</p>
                  </div>
                  
                  {/* Show transcript */}
                  {hookTranscript && (
                    <div className="mb-6 p-4 bg-black bg-opacity-40 rounded-2xl max-w-lg mx-auto">
                      <p className="text-sm text-green-300 mb-1">You said:</p>
                      <p className="text-lg font-medium">"{hookTranscript}"</p>
                    </div>
                  )}
                  
                  {/* Cute AI Blob Animation */}
                  <CuteAIBlob isActive={true} />
                </motion.div>
              ) : (
                // Final state showing transcript and AI response
                <div className="flex flex-col items-center justify-center">
                  {hookTranscript && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 bg-black bg-opacity-60 rounded-2xl max-w-lg mx-auto border border-green-400/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-sm text-green-300 font-medium">You said:</p>
                      </div>
                      <p className="text-lg font-semibold text-white leading-relaxed">"{hookTranscript}"</p>
                    </motion.div>
                  )}
                  {aiResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 bg-black bg-opacity-60 rounded-2xl max-w-lg mx-auto border border-purple-400/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <p className="text-sm text-purple-300 font-medium">AI Response:</p>
                      </div>
                      <p className="text-lg font-semibold text-white leading-relaxed">{aiResponse}</p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none">
        <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="chat-window"
            className="fixed z-50 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto select-none border border-green-200"
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
              width: '450px',
              height: '650px',
              maxWidth: '90vw',
              maxHeight: '85vh'
            }}
          >
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white p-6 flex items-center justify-between relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-300/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-300/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Eco-Edu</h3>
                  <p className="text-green-100 text-sm">Sustainability Educator</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-all duration-200 relative z-10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Enhanced Messages Container */}
            <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-green-50/50 to-emerald-50/50">
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
                style={{ maxHeight: '450px' }}
              >
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          : message.isError
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-white text-gray-800 border border-green-100 shadow-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {renderMessageContent(message)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Enhanced Input Form */}
              <div className="p-6 border-t border-green-200 bg-white/80 backdrop-blur-sm">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 mb-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about sustainability, carbon footprints, eco-living..."
                      className="w-full p-4 pr-12 border-2 border-green-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90 backdrop-blur-sm text-gray-700 placeholder-gray-400"
                      disabled={isLoading}
                    />
                    {isLoading && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  🌱 Ask me about sustainability, carbon footprints, eco-living, and more!
                </p>
              </div>
            </div>
          </motion.div>
        ) : showOptions ? (
          <motion.div
            key="options-menu"
            className="fixed z-50 pointer-events-auto select-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1
            }}
            style={{
              bottom: '6rem',
              right: '1.5rem'
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 30,
              duration: 0.4
            }}
          >
            {/* Text Chat Option */}
            <motion.button
              className="absolute bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 mb-2"
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{ x: -80, y: -20, scale: 1, opacity: 1 }}
              exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              transition={{ 
                delay: 0.05, 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                duration: 0.3
              }}
              onClick={handleTextChat}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageSquare className="h-6 w-6" />
            </motion.button>

            {/* Voice Input Option */}
            <motion.button
              className={`absolute p-4 rounded-full shadow-lg transition-all duration-200 ${
                !isSupported || hasError
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : hookIsListening 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white animate-pulse' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
              }`}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{ x: 20, y: -80, scale: 1, opacity: 1 }}
              exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              transition={{ 
                delay: 0.1, 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                duration: 0.3
              }}
              onClick={handleVoiceInput}
              whileHover={{ scale: !isSupported || hasError ? 1 : 1.1 }}
              whileTap={{ scale: !isSupported || hasError ? 1 : 0.9 }}
              disabled={!isSupported || hasError}
            >
              {hookIsListening ? (
                <div className="flex items-center justify-center">
                  <Waves className="h-6 w-6" />
                </div>
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </motion.button>

            {/* Main AI Button */}
            <motion.button
              className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white p-4 rounded-full shadow-lg hover:from-green-700 hover:via-emerald-700 hover:to-green-800 transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMainClick}
            >
              <Bot className="h-6 w-6" />
            </motion.button>

            {/* Voice Status Text */}
            {hookIsListening && (
              <motion.div
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-sm whitespace-nowrap z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                🎤 Listening... Speak now!
              </motion.div>
            )}

            {/* Transcript display removed - now only shows in voice overlay */}

            {/* Voice recognition error modal - removed from here, will be added as centered modal */}
          </motion.div>
        ) : (
          <motion.button
            key="chat-button"
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white p-4 rounded-full shadow-lg hover:from-green-700 hover:via-emerald-700 hover:to-green-800 transition-all duration-200 pointer-events-auto select-none"
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

      {/* Centered Error Modal - Moved outside pointer-events-none div */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleCloseErrorModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseErrorModal}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Error Content */}
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-red-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Voice Recognition Unavailable
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Your browser doesn't support voice recognition or microphone access is restricted. 
                  You can still use text chat to interact with Eco-Edu!
                </p>
                
                                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        console.log('🔴 Got it button clicked');
                        handleCloseErrorModal();
                      }}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                    >
                      Got it
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔴 Open Text Chat button clicked');
                        handleCloseErrorModal();
                        handleTextChat();
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
                    >
                      Open Text Chat
                    </button>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 