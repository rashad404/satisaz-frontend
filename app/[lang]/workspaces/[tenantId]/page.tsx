"use client";

import { useChat } from '@/contexts/ChatContext';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MessageSquare,
  Users,
  Clock,
  Bot,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WorkspaceDashboard() {
  const t = useTranslations();
  const params = useParams();
  const tenantId = params.tenantId;
  const lang = params.lang as string;

  const {
    tenant,
    conversations,
    queuedConversations,
    onlineAgentsCount,
    agents,
    isLoadingTenant,
  } = useChat();

  if (isLoadingTenant) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Queue',
      value: queuedConversations.length,
      icon: Clock,
      color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400',
      trend: queuedConversations.length > 3 ? 'up' : 'neutral',
      href: `/${lang}/workspaces/${tenantId}/inbox`,
    },
    {
      label: 'Active Chats',
      value: conversations.filter((c) => c.status === 'active').length,
      icon: MessageSquare,
      color: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
      href: `/${lang}/workspaces/${tenantId}/inbox`,
    },
    {
      label: 'Agents Online',
      value: onlineAgentsCount,
      total: agents.length,
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
      href: `/${lang}/workspaces/${tenantId}/team`,
    },
    {
      label: 'AI Handled',
      value: conversations.filter((c) => c.handler_type === 'ai').length,
      icon: Bot,
      color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
    },
  ];

  const recentConversations = conversations
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {tenant?.name || 'Workspace'} Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening with your chat support.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <div
              className={cn(
                'p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                stat.href && 'hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer'
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn('p-2 rounded-lg', stat.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                {stat.trend === 'up' && (
                  <span className="flex items-center text-red-500 text-sm">
                    <ArrowUpRight className="h-4 w-4" />
                    High
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                  {stat.total !== undefined && (
                    <span className="text-lg text-gray-400">/{stat.total}</span>
                  )}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            </div>
          );

          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent conversations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Conversations
            </h2>
            <Link
              href={`/${lang}/workspaces/${tenantId}/conversations`}
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              View all
            </Link>
          </div>

          {recentConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/${lang}/workspaces/${tenantId}/inbox`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {conv.visitor?.name || conv.visitor?.email || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.last_message?.content || 'No messages'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        conv.status === 'active' && 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400',
                        conv.status === 'queued' && 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400',
                        conv.status === 'closed' && 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {conv.status}
                    </span>
                    {conv.handler_type === 'ai' && (
                      <span className="text-xs text-purple-500 mt-1 flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        AI
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Queue alert */}
        {queuedConversations.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  {queuedConversations.length} conversation{queuedConversations.length !== 1 ? 's' : ''} waiting
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  There are visitors waiting in the queue. Accept conversations to provide support.
                </p>
                <Link
                  href={`/${lang}/workspaces/${tenantId}/inbox`}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Inbox className="h-4 w-4" />
                  Go to Inbox
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Getting started (if no conversations) */}
        {conversations.length === 0 && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
              Getting Started
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
              Set up your workspace to start receiving chat conversations:
            </p>
            <ol className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-xs font-bold">1</span>
                <Link href={`/${lang}/workspaces/${tenantId}/ai`} className="hover:underline">
                  Configure AI settings
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-xs font-bold">2</span>
                <Link href={`/${lang}/workspaces/${tenantId}/knowledge-base`} className="hover:underline">
                  Add knowledge base items
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-xs font-bold">3</span>
                <Link href={`/${lang}/workspaces/${tenantId}/widget`} className="hover:underline">
                  Install the chat widget on your website
                </Link>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
