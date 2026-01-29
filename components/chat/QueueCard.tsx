"use client";

import { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { User, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/lib/types/chat';

interface QueueCardProps {
  conversation: Conversation;
}

export function QueueCard({ conversation }: QueueCardProps) {
  const { acceptConversation } = useChat();
  const [isAccepting, setIsAccepting] = useState(false);
  const [waitTime, setWaitTime] = useState(0);

  const { visitor, queue_entered_at, metadata } = conversation;

  // Update wait time every second
  useEffect(() => {
    if (!queue_entered_at) return;

    const calculateWaitTime = () => {
      const entered = new Date(queue_entered_at).getTime();
      const now = Date.now();
      return Math.floor((now - entered) / 1000);
    };

    setWaitTime(calculateWaitTime());

    const interval = setInterval(() => {
      setWaitTime(calculateWaitTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [queue_entered_at]);

  const handleAccept = async () => {
    if (isAccepting) return;
    setIsAccepting(true);
    try {
      await acceptConversation(conversation.id);
    } catch (error) {
      console.error('Failed to accept conversation:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const formatWaitTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getUrgencyColor = (seconds: number) => {
    if (seconds < 30) return 'text-green-600 dark:text-green-400';
    if (seconds < 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-purple-300 dark:hover:border-purple-600 active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors">
      {/* Visitor info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white text-base truncate">
            {visitor?.name || visitor?.email || 'Anonymous Visitor'}
          </h4>
          {visitor?.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{visitor.email}</p>
          )}

          {/* Wait time */}
          <div className={cn('flex items-center gap-1.5 mt-1.5', getUrgencyColor(waitTime))}>
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">
              Waiting: {formatWaitTime(waitTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Preview of first message */}
      {conversation.last_message && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {conversation.last_message.content}
            </p>
          </div>
        </div>
      )}

      {/* Metadata - hidden on mobile for cleaner UI */}
      {metadata?.page_url && (
        <p className="hidden sm:block text-xs text-gray-400 mb-3 truncate">
          From: {new URL(metadata.page_url as string).pathname}
        </p>
      )}

      {/* Accept button - full width on mobile for easy tap */}
      <button
        onClick={handleAccept}
        disabled={isAccepting}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-base transition-colors',
          'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isAccepting ? (
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <CheckCircle className="h-5 w-5" />
        )}
        Accept Conversation
      </button>
    </div>
  );
}

export default QueueCard;
