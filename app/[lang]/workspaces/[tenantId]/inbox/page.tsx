"use client";

import { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useTranslations } from 'next-intl';
import { ConversationList, ChatWindow, QueueCard } from '@/components/chat';
import { Search, Inbox, Clock, MessageSquare, User, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConversationStatus } from '@/lib/types/chat';

type TabType = 'queue' | 'mine' | 'active' | 'all';

export default function InboxPage() {
  const t = useTranslations();
  const {
    queuedConversations,
    conversations,
    activeConversation,
    currentUserId,
    isConnected,
    isMuted,
    loadQueue,
    loadConversations,
    selectConversation,
    toggleMute,
  } = useChat();

  const [activeTab, setActiveTab] = useState<TabType>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'all'>('all');

  // Refresh queue periodically (conversations update via WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      loadQueue();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [loadQueue]);

  const myConversations = conversations.filter((c) => c.assigned_agent_id === currentUserId);

  const tabs = [
    {
      id: 'queue' as const,
      label: 'Queue',
      icon: Clock,
      count: queuedConversations.length,
      countColor: queuedConversations.length > 0 ? 'bg-yellow-500' : 'bg-gray-400',
    },
    {
      id: 'mine' as const,
      label: 'Mine',
      icon: User,
      count: myConversations.filter((c) => c.status !== 'closed').length,
      countColor: 'bg-purple-500',
    },
    {
      id: 'active' as const,
      label: 'Active',
      icon: MessageSquare,
      count: conversations.filter((c) => c.status === 'active').length,
      countColor: 'bg-green-500',
    },
    {
      id: 'all' as const,
      label: 'All',
      icon: Inbox,
      count: conversations.length,
      countColor: 'bg-gray-400',
    },
  ];

  const getFilteredStatus = (): ConversationStatus | 'all' => {
    if (activeTab === 'queue') return 'queued';
    if (activeTab === 'active') return 'active';
    if (activeTab === 'mine') return 'all';
    return statusFilter;
  };

  const handleBack = () => {
    selectConversation(null);
  };

  // Mobile: show chat when conversation selected, otherwise show list
  const showChatOnMobile = !!activeConversation;

  return (
    <div className="flex h-full">
      {/* Left sidebar - Conversation list */}
      <div
        className={cn(
          'w-full md:w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col',
          // On mobile: hide when chat is active
          showChatOnMobile ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inbox</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isMuted
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <span
                className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                )}
                title={isConnected ? 'Connected' : 'Disconnected'}
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'group relative flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className={cn('text-xs font-semibold min-w-[1.25rem]', tab.count > 0 ? '' : 'text-gray-400')}>
                  {tab.count}
                </span>
                {/* Tooltip */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Queue view */}
        {activeTab === 'queue' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {queuedConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4">
                <Clock className="h-16 w-16 mb-3 opacity-50" />
                <p className="text-base font-medium">No conversations in queue</p>
                <p className="text-sm mt-1 text-center">New conversations will appear here</p>
              </div>
            ) : (
              queuedConversations.map((conv) => (
                <QueueCard key={conv.id} conversation={conv} />
              ))
            )}
          </div>
        )}

        {/* Active/All conversations view */}
        {activeTab !== 'queue' && (
          <div className="flex-1 overflow-hidden">
            <ConversationList
              filter={getFilteredStatus()}
              searchQuery={searchQuery}
              assignedToMe={activeTab === 'mine'}
            />
          </div>
        )}
      </div>

      {/* Right side - Chat window */}
      <div
        className={cn(
          'flex-1 min-w-0 flex flex-col',
          // On mobile: hide when no chat selected
          !showChatOnMobile ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="flex-1 min-h-0">
          <ChatWindow onBack={handleBack} />
        </div>
      </div>
    </div>
  );
}
