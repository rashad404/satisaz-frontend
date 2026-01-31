'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Bot, Sparkles, RefreshCw, User } from 'lucide-react';

interface AISpotlightProps {
  className?: string;
}

export function AISpotlight({ className }: AISpotlightProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const aiResponse = "Hello! Our team is currently busy. I'm here to help until an agent becomes available. How can I assist you?";

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const startTyping = () => {
      setIsTyping(true);
      setDisplayedText('');

      let index = 0;
      const typeChar = () => {
        if (index < aiResponse.length) {
          setDisplayedText(aiResponse.slice(0, index + 1));
          index++;
          timeout = setTimeout(typeChar, 30);
        } else {
          setIsTyping(false);
          // Reset after 5 seconds
          timeout = setTimeout(() => {
            setDisplayedText('');
            startTyping();
          }, 5000);
        }
      };

      timeout = setTimeout(typeChar, 1000);
    };

    startTyping();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12',
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0zNiAxOGgtMnY0aDJ2LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Text Content */}
        <div className="text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI Assistant</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold">
            AI Helps When You're Busy
          </h3>

          <p className="text-white/80">
            Your team handles conversations first. When agents are unavailable,
            AI keeps the conversation going until a human can respond.
          </p>

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10">
              <Bot className="w-4 h-4" />
              OpenAI
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10">
              <Bot className="w-4 h-4" />
              Claude
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10">
              <Bot className="w-4 h-4" />
              Gemini
            </div>
          </div>
        </div>

        {/* AI Demo */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4">
          {/* Visitor Message */}
          <div className="flex gap-3 justify-end">
            <div className="bg-white/20 rounded-lg px-4 py-2 text-white text-sm max-w-[80%]">
              Hi, I have a question about your service
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* AI Response */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-lg px-4 py-2 text-gray-800 text-sm max-w-[80%] min-h-[60px]">
              {displayedText}
              {isTyping && (
                <span className="inline-flex gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </div>
          </div>

          {/* Transfer Indicator */}
          <div className="flex items-center justify-center gap-2 text-white/60 text-xs">
            <RefreshCw className="w-3 h-3" />
            <span>Human agents take over when available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
