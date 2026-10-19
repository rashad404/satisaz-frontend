"use client";

import { useCallback, useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useTranslations } from 'next-intl';
import { MessageSquare, Bot, User, StickyNote, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conversation, ConversationStatus, InboxTab } from '@/lib/types/chat';

interface ConversationListProps {
  tab?: InboxTab;
}

export function ConversationList({ tab = 'all' }: ConversationListProps) {
  const t = useTranslations('ws.chat.list');
  const { conversations, activeConversation, selectConversation, isLoadingConversations, currentUserId, hasMoreConversations, loadMoreConversations } = useChat();
  const [loadingMore, setLoadingMore] = useState(false);
  const hasNotes = tab === 'notes';
  const searchQuery = '';

  // The server returns the tab's rows; this only drops rows that live updates moved out of the tab.
  const filteredConversations = conversations.filter((conv) => {
    const open = conv.status !== 'closed';
    switch (tab) {
      case 'needs_reply': return open && conv.last_message?.sender_type !== 'agent'
        && (conv.waiting_since != null || conv.last_message?.sender_type === 'visitor');
      case 'mine': return open && conv.assigned_agent_id === currentUserId;
      case 'active': return conv.status === 'active' || conv.status === 'waiting';
      case 'notes': return (conv.notes_count ?? 0) > 0;
      case 'closed': return conv.status === 'closed';
      default: return true;
    }
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
        {hasNotes ? (
          <>
            <StickyNote className="h-16 w-16 mb-3 opacity-50" />
            <p className="text-base font-medium text-center">{t('emptyNotesTitle')}</p>
            <p className="text-sm mt-1 text-center">{t('emptyNotesHint')}</p>
          </>
        ) : (
          <>
            <MessageSquare className="h-16 w-16 mb-3 opacity-50" />
            <p className="text-base font-medium text-center">
              {searchQuery ? t('noSearchResults') : t('empty')}
            </p>
          </>
        )}
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
      {hasMoreConversations && (
        <button
          onClick={async () => { setLoadingMore(true); try { await loadMoreConversations(); } finally { setLoadingMore(false); } }}
          disabled={loadingMore}
          className="m-3 rounded-lg border border-gray-200 dark:border-gray-700 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          {loadingMore ? '...' : t('loadMore')}
        </button>
      )}
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const t = useTranslations('ws.chat.list');
  const { visitor, last_message, unread_count, handler_type, status, updated_at, notes_count } = conversation;

  const getStatusLabel = (status: ConversationStatus) => {
    switch (status) {
      case 'active': return { text: t('status.active'), color: 'text-green-600 dark:text-green-400' };
      case 'queued': return { text: t('status.queued'), color: 'text-yellow-600 dark:text-yellow-400' };
      case 'waiting': return { text: t('status.waiting'), color: 'text-orange-600 dark:text-orange-400' };
      case 'closed': return { text: t('status.closed'), color: 'text-gray-500 dark:text-gray-400' };
      default: return { text: status, color: 'text-gray-500 dark:text-gray-400' };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return t('minutes', { n: diffMins });
    if (diffHours < 24) return t('hours', { n: diffHours });
    if (diffDays < 7) return t('days', { n: diffDays });
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
        {visitor?.metadata?.avatar ? (
          <img
            src={visitor.metadata.avatar as string}
            alt={visitor.name || t('visitor')}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
        )}
        <div className={cn('absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900', visitor?.is_online ? 'bg-green-500' : 'bg-gray-400')} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-gray-900 dark:text-white truncate text-base">
            <span className="truncate">{visitor?.name || visitor?.email || t('anonymousVisitor')}</span>
            {visitor?.is_verified && <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-1.5 py-0.5 text-[10px] font-medium" title={t('loggedInHint')}><ShieldCheck className="h-3 w-3" /> {t('loggedIn')}</span>}
          </span>
          {conversation.waiting_since && status !== 'closed' ? (
            <span className="text-xs font-medium text-red-600 dark:text-red-400 flex-shrink-0" title={t('waitingForReply')}>
              {formatTime(conversation.waiting_since)}
            </span>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {formatTime(updated_at)}
            </span>
          )}
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
                {last_message.sender_type === 'agent' && <span className="text-gray-400">{t('you')}: </span>}
                {last_message.sender_type === 'ai' && <span className="text-purple-400">AI: </span>}
                {last_message.content}
              </>
            ) : (
              <span className="italic">{t('noMessages')}</span>
            )}
          </p>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 mt-1.5">
          {(() => {
            const sl = getStatusLabel(status);
            return (
              <span className={cn('text-xs font-medium', sl.color)}>
                {sl.text}
              </span>
            );
          })()}
          {(notes_count ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <StickyNote className="h-3.5 w-3.5" />
              {notes_count}
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
