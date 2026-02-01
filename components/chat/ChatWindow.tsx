"use client";

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useTranslations } from 'next-intl';
import { Bot, User, MessageSquare, Clock, CheckCheck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage, SenderType, Visitor } from '@/lib/types/chat';
import { MessageInput } from './MessageInput';
import { ConversationHeader } from './ConversationHeader';
import { TypingIndicator } from './TypingIndicator';
import { NotesPanel } from './NotesPanel';

interface ChatWindowProps {
  onBack?: () => void;
}

export function ChatWindow({ onBack }: ChatWindowProps) {
  const t = useTranslations();
  const { activeConversation, messages, isLoadingMessages, typingUsers, markMessagesAsRead } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showNotes, setShowNotes] = useState(false);

  // Check if visitor is typing
  const isVisitorTyping = activeConversation ? typingUsers.has(activeConversation.id) : false;

  // Scroll to bottom when new messages arrive or typing indicator shows
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isVisitorTyping]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (activeConversation && messages.length > 0) {
      markMessagesAsRead();
    }
  }, [activeConversation?.id, messages.length, markMessagesAsRead]);

  if (!activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 p-6">
        <MessageSquare className="h-20 w-20 mb-4 opacity-30" />
        <p className="text-lg font-medium text-center">Select a conversation</p>
        <p className="text-sm mt-1 text-center">Choose a conversation from the list to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Main Chat Area - hidden on mobile when notes are open */}
      <div className={cn(
        "flex flex-col flex-1 min-w-0",
        showNotes && "hidden md:flex"
      )}>
        {/* Header */}
        <ConversationHeader
          onBack={onBack}
          showNotes={showNotes}
          onToggleNotes={() => setShowNotes(!showNotes)}
        />

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            <>
              {/* Conversation start indicator */}
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Conversation started {new Date(activeConversation.created_at).toLocaleString()}
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Messages */}
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  visitor={activeConversation.visitor}
                  showAvatar={index === 0 || messages[index - 1].sender_type !== message.sender_type}
                />
              ))}

              {/* Typing indicator */}
              {isVisitorTyping && (
                <div className="pb-2">
                  <TypingIndicator name={activeConversation.visitor?.name || activeConversation.visitor?.email?.split('@')[0] || 'Visitor'} />
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Message input */}
        {activeConversation.status !== 'closed' && <MessageInput />}

        {/* Closed indicator */}
        {activeConversation.status === 'closed' && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">This conversation has been closed</p>
            <p className="text-xs mt-1">
              Closed at {activeConversation.closed_at ? new Date(activeConversation.closed_at).toLocaleString() : 'Unknown'}
            </p>
          </div>
        )}
      </div>

      {/* Notes Panel - full width on mobile, side panel on desktop */}
      {showNotes && (
        <div className="w-full md:w-72 lg:w-80 flex-shrink-0">
          <NotesPanel onClose={() => setShowNotes(false)} />
        </div>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  visitor?: Visitor;
  showAvatar: boolean;
}

function MessageBubble({ message, visitor, showAvatar }: MessageBubbleProps) {
  const isAgent = message.sender_type === 'agent' || message.sender_type === 'ai';
  const isSystem = message.sender_type === 'system';

  if (isSystem) {
    return (
      <div className="flex items-center justify-center py-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderIcon = (senderType: SenderType) => {
    switch (senderType) {
      case 'ai':
        return <Bot className="h-4 w-4" />;
      case 'agent':
        return <User className="h-4 w-4" />;
      case 'visitor':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getAvatarColor = (senderType: SenderType) => {
    switch (senderType) {
      case 'ai':
        return 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400';
      case 'agent':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400';
      case 'visitor':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  // Get visitor display name
  const getVisitorName = () => {
    if (visitor?.name) return visitor.name;
    if (visitor?.email) return visitor.email.split('@')[0];
    return 'Visitor';
  };

  // Get visitor avatar URL from metadata
  const visitorAvatar = visitor?.metadata?.avatar;

  return (
    <div className={cn('flex gap-3', isAgent && 'flex-row-reverse')}>
      {/* Avatar */}
      {showAvatar ? (
        message.sender_type === 'visitor' && visitorAvatar ? (
          <img
            src={visitorAvatar}
            alt={getVisitorName()}
            className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
          />
        ) : (
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', getAvatarColor(message.sender_type))}>
            {getSenderIcon(message.sender_type)}
          </div>
        )
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      {/* Message content */}
      <div className={cn('flex flex-col max-w-[70%]', isAgent && 'items-end')}>
        {/* Sender name */}
        {showAvatar && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {message.sender_type === 'ai' && 'AI Assistant'}
            {message.sender_type === 'agent' && (message.sender?.name || 'Agent')}
            {message.sender_type === 'visitor' && getVisitorName()}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isAgent
              ? 'bg-purple-600 text-white rounded-tr-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-md'
          )}
        >
          {/* Text content */}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* File attachments */}
          {message.files && message.files.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.files.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg',
                    isAgent ? 'bg-purple-700/50' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                >
                  {file.mime_type.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.original_name}
                      className="max-w-[200px] max-h-[200px] rounded"
                    />
                  ) : (
                    <>
                      <span className="truncate text-sm">{file.original_name}</span>
                      <span className="text-xs opacity-70">
                        ({Math.round(file.size / 1024)}KB)
                      </span>
                    </>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Time and read status */}
        <div className={cn('flex items-center gap-1 mt-1', isAgent && 'flex-row-reverse')}>
          <span className="text-xs text-gray-400">{formatTime(message.created_at)}</span>
          {isAgent && (
            message.is_read ? (
              <CheckCheck className="h-3 w-3 text-blue-500" />
            ) : (
              <Check className="h-3 w-3 text-gray-400" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
