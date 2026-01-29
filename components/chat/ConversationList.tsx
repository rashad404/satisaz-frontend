"use client";

import { useCallback } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useTranslations } from 'next-intl';
import { MessageSquare, Bot, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conversation, ConversationStatus } from '@/lib/types/chat';

interface ConversationListProps {
  filter?: ConversationStatus | 'all';
  searchQuery?: string;
}

export function ConversationList({ filter = 'all', searchQuery = '' }: ConversationListProps) {
  const t = useTranslations();
  const { conversations, activeConversation, selectConversation, isLoadingConversations } = useChat();

  const filteredConversations = conversations.filter((conv) => {
    // Filter by status
    if (filter !== 'all' && conv.status !== filter) {
      return false;
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const visitorName = conv.visitor?.name?.toLowerCase() || '';
      const visitorEmail = conv.visitor?.email?.toLowerCase() || '';
      const lastMessage = conv.last_message?.content?.toLowerCase() || '';
      return visitorName.includes(query) || visitorEmail.includes(query) || lastMessage.includes(query);
    }
    return true;
  });

  const handleSelectConversation = useCallback((conversationId: number) => {
    selectConversation(conversationId);
  }, [selectConversation]);

  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-6">
        <MessageSquare className="h-16 w-16 mb-3 opacity-50" />
        <p className="text-base font-medium text-center">
          {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {filteredConversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={activeConversation?.id === conversation.id}
          onClick={() => handleSelectConversation(conversation.id)}
        />
      ))}
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const { visitor, last_message, unread_count, handler_type, status, updated_at } = conversation;

  const getStatusColor = (status: ConversationStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'queued':
        return 'bg-yellow-500';
      case 'waiting':
        return 'bg-orange-500';
      case 'closed':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-4 border-b border-gray-100 dark:border-gray-800',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800',
        'transition-colors text-left',
        isActive && 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
        <div className={cn('absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900', getStatusColor(status))} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-gray-900 dark:text-white truncate text-base">
            {visitor?.name || visitor?.email || 'Anonymous Visitor'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
            {formatTime(updated_at)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          {/* Handler type indicator */}
          {handler_type === 'ai' && (
            <Bot className="h-4 w-4 text-purple-500 flex-shrink-0" />
          )}

          {/* Last message preview */}
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {last_message ? (
              <>
                {last_message.sender_type === 'agent' && <span className="text-gray-400">You: </span>}
                {last_message.sender_type === 'ai' && <span className="text-purple-400">AI: </span>}
                {last_message.content}
              </>
            ) : (
              <span className="italic">No messages yet</span>
            )}
          </p>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 mt-1.5">
          {status === 'queued' && (
            <span className="inline-flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
              <Clock className="h-3.5 w-3.5" />
              In queue
            </span>
          )}
          {(unread_count ?? 0) > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-xs font-medium text-white bg-purple-600 rounded-full">
              {unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default ConversationList;
