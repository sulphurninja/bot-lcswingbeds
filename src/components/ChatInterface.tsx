'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
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
      content: "Hello! I'm your Lowcountry Swing Beds assistant. I can help you explore our handcrafted swing beds, find the perfect size for your space, learn about installation, pricing, and financing options. What would you like to know?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
            content: textBefore,
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
          content: remainingText,
        });
      }
    }

    // If no images found, return the original content as text
    if (parts.length === 0) {
      return [{ type: 'text', content }];
    }

    return parts;
  };

  // Sound effects for premium experience
  const playMessageSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Ignore audio errors in environments where audio context isn't available
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Play subtle send sound
    playMessageSound();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
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

      // Play subtle receive sound
      setTimeout(() => {
        playMessageSound();
      }, 200);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment, or feel free to contact us directly at relax@lcswingbeds.com or 843-489-8859.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Focus back to input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Quick suggestion buttons
  const quickSuggestions = [
    "Show me your swing bed collection",
    "What size do I need for my porch?",
    "Tell me about pricing and financing",
    "How long does shipping take?"
  ];

  const handleQuickSuggestion = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Messages Container */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-[#FFE3C6]/30 overflow-hidden">
        {/* Messages Area */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#FFE3C6]/10 to-white/50">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-4 transition-all duration-300 ease-in-out",
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                "animate-in slide-in-from-bottom-2"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Avatar */}
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-[#204532] to-[#61CE70]' 
                  : 'bg-gradient-to-br from-[#FFE3C6] to-[#FFE3C6]/70 border border-[#FFE3C6]'
              )}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-[#204532]" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={cn(
                "flex flex-col max-w-[80%]",
                message.role === 'user' ? 'items-end' : 'items-start'
              )}>
                <div className={cn(
                  "rounded-2xl px-4 py-3 shadow-sm border transition-all duration-200 hover:shadow-md font-['Roboto',sans-serif]",
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#204532] to-[#141718] text-white border-[#204532]/20'
                    : 'bg-white border-[#FFE3C6]/50 text-[#141718]'
                )}>
                  {/* Parse and render content with inline images */}
                  {parseContentWithImages(message.content).map((part, partIndex) => (
                    <div key={partIndex}>
                      {part.type === 'text' ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {part.content}
                        </p>
                      ) : (
                        <div className="my-3">
                          <div className="rounded-lg overflow-hidden border border-[#FFE3C6]/30 bg-[#FFE3C6]/10 max-w-[300px]">
                            <Image
                              src={part.content}
                              alt="Swing Bed Product"
                              width={300}
                              height={300}
                              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
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
                
                {/* Timestamp */}
                <span className="text-xs text-[#6C7275] mt-1 px-2 font-['Roboto',sans-serif]">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-4 animate-in slide-in-from-bottom-2">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#FFE3C6] to-[#FFE3C6]/70 border border-[#FFE3C6] flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-[#204532]" />
              </div>
              
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-[#FFE3C6]/50 max-w-[70%]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#61CE70] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#61CE70] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#61CE70] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-[#6C7275] font-['Roboto',sans-serif]">Assistant is typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && !isLoading && (
          <div className="px-6 py-4 bg-[#FFE3C6]/20 border-t border-[#FFE3C6]/30">
            <p className="text-sm text-[#141718] mb-3 font-medium font-['Roboto',sans-serif]">Quick questions to get started:</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="text-xs bg-white hover:bg-[#FFE3C6]/30 text-[#6C7275] hover:text-[#204532] px-3 py-2 rounded-full border border-[#FFE3C6]/50 hover:border-[#204532]/30 transition-all duration-200 shadow-sm hover:shadow-md font-['Roboto',sans-serif]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="p-6 bg-white border-t border-[#FFE3C6]/30">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about swing beds, sizing, pricing, installation, or anything else..."
                  className="w-full bg-[#FFE3C6]/20 border border-[#FFE3C6]/50 rounded-xl px-4 py-3 pr-12 text-sm placeholder-[#6C7275] text-[#141718] focus:outline-none focus:ring-2 focus:ring-[#204532] focus:border-[#204532] transition-all duration-200 font-['Roboto',sans-serif]"
                  disabled={isLoading}
                />
                {input && !isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Sparkles className="w-4 h-4 text-[#61CE70]" />
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-[#204532] focus:ring-offset-2",
                  input.trim() && !isLoading
                    ? "bg-gradient-to-br from-[#204532] to-[#61CE70] hover:from-[#141718] hover:to-[#204532] text-white shadow-md hover:shadow-lg transform hover:scale-105"
                    : "bg-[#FFE3C6]/50 text-[#6C7275] cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="flex items-center justify-between mt-4 text-xs text-[#6C7275] font-['Roboto',sans-serif]">
            <span>Powered by advanced AI • Instant responses</span>
            <span>Charleston, SC • Since 2012</span>
          </div>
        </div>
      </div>
    </div>
  );
}