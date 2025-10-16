'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your Lowcountry Swing Beds assistant. Ask me about our handcrafted swing beds, sizing, pricing, or installation!",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2)}`);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionTimeoutRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<Date>(new Date());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset session timeout whenever there's activity
  const resetSessionTimeout = () => {
    lastActivityRef.current = new Date();

    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    // Set 5-minute timeout
    sessionTimeoutRef.current = setTimeout(() => {
      // Only end if still inactive after 5 minutes
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivityRef.current.getTime();

      if (timeSinceLastActivity >= 5 * 60 * 1000) { // 5 minutes
        endSession();
      } else {
        // Reset timeout for remaining time
        const remainingTime = 5 * 60 * 1000 - timeSinceLastActivity;
        sessionTimeoutRef.current = setTimeout(() => {
          endSession();
        }, remainingTime);
      }
    }, 5 * 60 * 1000); // 5 minutes
  };

  // End session and send email
  const endSession = async () => {
    if (!isSessionActive) return;

    setIsSessionActive(false);
    console.log('Session ended due to inactivity');

    // Clear any pending timeouts
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    // Only end session if there are user messages (more than just the initial assistant message)
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length > 0) {
      try {
        // Use sendBeacon for page unload scenarios, fetch for normal scenarios
        const payload = JSON.stringify({
          sessionId: sessionId,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          }))
        });

        // Try sendBeacon first (works during page unload)
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          const success = navigator.sendBeacon('/api/chat/end-session', blob);
          if (success) {
            console.log('Session ended via sendBeacon');
            return;
          }
        }

        // Fallback to fetch
        const response = await fetch('/api/chat/end-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Session end result:', result);
          console.log('Session ended and email sent successfully');
        } else {
          console.error('Failed to end session:', response.status);
        }
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
  };

  // Start session timeout when component mounts
  useEffect(() => {
    resetSessionTimeout();

    // Cleanup timeout on unmount
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []); // Only run once on mount

  // End session when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Use sendBeacon for reliable delivery during page unload
      const userMessages = messages.filter(msg => msg.role === 'user');
      if (userMessages.length > 0 && isSessionActive) {
        const payload = JSON.stringify({
          sessionId: sessionId,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          }))
        });

        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/chat/end-session', blob);
        }

        setIsSessionActive(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isSessionActive) {
        // User switched tabs - extend timeout but don't reset activity time
        setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            const timeSinceLastActivity = new Date().getTime() - lastActivityRef.current.getTime();
            if (timeSinceLastActivity >= 2 * 60 * 1000) { // 2 minutes of inactivity while hidden
              endSession();
            }
          }
        }, 30000); // Check after 30 seconds
      } else if (document.visibilityState === 'visible') {
        // User came back to tab - update activity time
        lastActivityRef.current = new Date();
      }
    };

    // Track user activity (typing, clicking, etc.)
    const handleUserActivity = () => {
      if (isSessionActive) {
        lastActivityRef.current = new Date();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousedown', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousedown', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
    };
  }, [messages, sessionId, isSessionActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isSessionActive) return;

    // Update activity time but DON'T reset timeout during conversation
    lastActivityRef.current = new Date();

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId,
          // Include all messages for context
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update activity time after assistant response
      lastActivityRef.current = new Date();

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm experiencing technical difficulties. Please contact us at relax@lcswingbeds.com or 843-489-8859.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };



  // Function to parse content and render text with inline images
  const parseContentWithImages = (content: string) => {
    const imageRegex = /\[IMAGE:\s*(https?:\/\/[^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      // Add text before the image
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push({
            type: 'text',
            content: textBefore.trim(),
          });
        }
      }

      // Add the image
      parts.push({
        type: 'image',
        content: match[1],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push({
          type: 'text',
          content: remainingText.trim(),
        });
      }
    }

    // If no images found, return the original content as text
    if (parts.length === 0) {
      return [{ type: 'text', content }];
    }

    return parts;
  };


  // Quick suggestion buttons for first interaction
  const quickSuggestions = [
    "Show me swing bed sizes",
    "What's the price range?",
    "How long does shipping take?"
  ];

  const handleQuickSuggestion = (suggestion: string) => {
    if (!isSessionActive) return;
    setInput(suggestion);
    inputRef.current?.focus();
    // Update activity time
    lastActivityRef.current = new Date();
  };
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#204532] to-[#61CE70] p-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-white" />
          <div>
            <h3 className="text-white font-medium text-sm">Lowcountry Swing Beds Assistant</h3>
            <p className="text-[#FFE3C6]/80 text-xs">
              Handcrafted in Charleston since 2012
              {!isSessionActive && <span className="ml-2 opacity-60">(Session Ended)</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container - takes remaining space */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 p-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-2",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[#FFE3C6] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3 h-3 text-[#204532]" />
              </div>
            )}

            <div className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm",
              message.role === 'user'
                ? 'bg-[#204532] text-white rounded-br-sm'
                : 'bg-gray-50 text-gray-800 border border-gray-200 rounded-bl-sm'
            )}>
              {/* Parse and render content with inline images */}
              {parseContentWithImages(message.content).map((part, partIndex) => (
                <div key={partIndex}>
                  {part.type === 'text' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {part.content}
                    </p>
                  ) : (
                    <div className="my-2">
                      <div className="rounded-lg overflow-hidden border border-gray-200 max-w-[200px]">
                        <Image
                          src={part.content}
                          alt="Swing Bed Product"
                          width={200}
                          height={200}
                          className="w-full h-auto object-cover hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            // Hide broken images gracefully
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {message.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-[#204532] flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-[#FFE3C6] flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-3 h-3 text-[#204532]" />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg rounded-bl-sm px-3 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#61CE70] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#61CE70] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-[#61CE70] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Session ended message */}
        {!isSessionActive && (
          <div className="flex gap-2 justify-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-800 max-w-md text-center">
              <p>This chat session has ended. Your conversation transcript has been sent to our team.</p>
              <p className="text-xs mt-1">For immediate assistance, contact us at relax@lcswingbeds.com or 843-489-8859.</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions - only shows initially and if session is active */}
      {messages.length === 1 && !isLoading && isSessionActive && (
        <div className="px-3 py-2 flex-shrink-0">
          <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleQuickSuggestion(suggestion)}
                className="text-xs bg-gray-100 hover:bg-[#FFE3C6]/50 text-gray-600 hover:text-[#204532] px-2 py-1 rounded-md border hover:border-[#204532]/30 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form - fixed at bottom */}
      <div className="p-3 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isSessionActive ? "Ask about swing beds..." : "Session ended - contact us directly"}
            className={cn(
              "flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#204532] focus:border-[#204532]",
              !isSessionActive && "opacity-50 cursor-not-allowed"
            )}
            disabled={isLoading || !isSessionActive}
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading || !isSessionActive}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
              input.trim() && !isLoading && isSessionActive
                ? "bg-[#204532] hover:bg-[#61CE70] text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
          <span>Handcrafted in Charleston • Est. 2012</span>
        </div>
      </div>
    </div>
  );
}
