'use client';

import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';

interface WidgetPreviewProps {
  primaryColor?: string;
  position?: 'bottom-left' | 'bottom-right';
  greetingMessage?: string;
  headerText?: string;
  showAgentAvatar?: boolean;
  showAgentName?: boolean;
  agentName?: string;
  showChat?: boolean;
  className?: string;
}

export function WidgetPreview({
  primaryColor = '#7C3AED',
  position = 'bottom-right',
  greetingMessage = 'Hi! How can we help you today?',
  headerText = 'Chat with us',
  showAgentAvatar = true,
  showAgentName = true,
  agentName = 'Support',
  showChat = true,
  className,
}: WidgetPreviewProps) {
  return (
    <div
      className={cn(
        'absolute bottom-2',
        position === 'bottom-right' ? 'right-2' : 'left-2',
        className
      )}
    >
      {/* Chat Window */}
      {showChat && (
        <div
          className="w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden mb-3 animate-fade-in"
          style={{ borderColor: primaryColor }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="font-medium">{headerText}</span>
          </div>

          {/* Messages */}
          <div className="p-3 h-32 bg-gray-50 dark:bg-gray-900">
            <div className="flex gap-2 mb-2">
              {showAgentAvatar && (
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
              <div>
                {showAgentName && (
                  <span className="text-xs text-gray-500 block mb-0.5">{agentName}</span>
                )}
                <div
                  className="px-3 py-1.5 rounded-lg text-white text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {greetingMessage}
                </div>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
          </div>
        </div>
      )}

      {/* Launcher Button */}
      <div
        className={cn(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform',
          position === 'bottom-right' ? 'ml-auto' : ''
        )}
        style={{ backgroundColor: primaryColor }}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}
