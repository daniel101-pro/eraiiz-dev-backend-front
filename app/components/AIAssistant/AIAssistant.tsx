'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Loader2, Send, ShoppingCart, Search, Maximize2, Minimize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AIAssistantService } from '../../services/aiAssistant';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
  products?: any[]; // For displaying search results
  isError?: boolean;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(() => {
    // Set default position to bottom right
    return {
      x: typeof window !== 'undefined' ? window.innerWidth - 100 : 0,
      y: typeof window !== 'undefined' ? window.innerHeight - 100 : 0
    };
  });
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const aiService = useRef(new AIAssistantService());

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
      console.error('[AI Assistant] Error showing welcome message:', error);
      setMessages([
        {
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Failed to initialize AI assistant. Please try again.',
          timestamp: new Date(),
          isError: true
        }
      ]);
    }
  };

  // Load position from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('aiAssistantPosition');
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        // Ensure position is within viewport bounds
        setPosition({
          x: Math.min(Math.max(parsed.x, 0), window.innerWidth - (isOpen ? 400 : 80)),
          y: Math.min(Math.max(parsed.y, 0), window.innerHeight - (isOpen ? 600 : 80))
        });
      } catch (e) {
        console.error('Error parsing saved position:', e);
        // Set default position to bottom right if there's an error
        setPosition({
          x: window.innerWidth - (isOpen ? 400 : 80),
          y: window.innerHeight - (isOpen ? 600 : 80)
        });
      }
    } else {
      // Set default position to bottom right if no saved position
      setPosition({
        x: window.innerWidth - (isOpen ? 400 : 80),
        y: window.innerHeight - (isOpen ? 600 : 80)
      });
    }
  }, [isOpen]);

  // Save position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('aiAssistantPosition', JSON.stringify(position));
  }, [position]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const newX = Math.min(Math.max(info.point.x, 0), window.innerWidth - (isOpen ? 400 : 80));
    const newY = Math.min(Math.max(info.point.y, 0), window.innerHeight - (isOpen ? 600 : 80));
    
    setPosition({
      x: newX,
      y: newY
    });
  };

  const handleClick = () => {
    if (!isDragging) {
      setIsOpen(true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiMessageContent = await aiService.current.processMessage(userMessage.content);
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: aiMessageContent,
          timestamp: new Date(),
        }
      ]);
    } catch (error) {
      console.error('[AI Assistant] Error processing message:', error);
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: error instanceof Error 
            ? error.message 
            : 'I apologize, but I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.loading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Thinking...</span>
        </div>
      );
    }

    if (message.isError) {
      return (
        <div className="flex flex-col gap-2 text-red-600">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{message.content}</span>
          </div>
          {message.content.includes('OpenAI API key') && (
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Get an OpenAI API key →
            </a>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>{message.content}</div>
        {message.products && message.products.length > 0 && (
          <div className="mt-4 space-y-2">
            {message.products.map((product) => (
              <button
                key={product._id}
                onClick={() => router.push(`/product/${product._id}`)}
                className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors duration-150"
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-500">{product.category}</div>
                <div className="text-sm font-medium text-green-600">${product.price}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="chat-window"
            className="fixed z-50 pointer-events-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: position.x,
              y: position.y
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 1
            }}
            drag
            dragElastic={0}
            dragTransition={{ 
              power: 0.1,
              timeConstant: 200,
              modifyTarget: target => Math.round(target) 
            }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            dragMomentum={false}
            dragConstraints={{
              top: 0,
              left: 0,
              right: window.innerWidth - 400,
              bottom: window.innerHeight - 600
            }}
          >
            <div className="bg-white rounded-lg shadow-xl w-[380px] h-[600px] flex flex-col select-none">
              {/* Header */}
              <div className="p-4 bg-green-600 text-white rounded-t-lg flex items-center justify-between cursor-move">
                <div className="flex items-center gap-2">
                  <Bot className="h-6 w-6" />
                  <span className="font-medium">AI Shopping Assistant</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <Minimize2 className="h-5 w-5" />
                </button>
              </div>

              {/* Chat Container */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
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
        ) : (
          <motion.button
            key="chat-button"
            className="fixed z-50 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors pointer-events-auto select-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: position.x,
              y: position.y
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
            drag
            dragElastic={0}
            dragTransition={{ 
              power: 0.1,
              timeConstant: 200,
              modifyTarget: target => Math.round(target) 
            }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            dragMomentum={false}
            dragConstraints={{
              top: 0,
              left: 0,
              right: window.innerWidth - 80,
              bottom: window.innerHeight - 80
            }}
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
} 