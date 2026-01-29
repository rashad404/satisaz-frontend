"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { conversationsApi } from '@/lib/api/chat';
import { cn, formatDate } from '@/lib/utils';
import {
  MessageSquare,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Bot,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import type { Conversation, ConversationStatus, HandlerType } from '@/lib/types/chat';

const STATUS_OPTIONS: { value: ConversationStatus | 'all'; label: string; icon: typeof Clock; color: string }[] = [
  { value: 'all', label: 'All', icon: MessageSquare, color: 'text-gray-500' },
  { value: 'queued', label: 'Queued', icon: Clock, color: 'text-yellow-500' },
  { value: 'active', label: 'Active', icon: MessageSquare, color: 'text-green-500' },
  { value: 'waiting', label: 'Waiting', icon: Clock, color: 'text-blue-500' },
  { value: 'closed', label: 'Closed', icon: CheckCircle, color: 'text-gray-400' },
];

export default function ConversationsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = Number(params.tenantId);
  const lang = params.lang as string;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await conversationsApi.list(tenantId, {
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: currentPage,
        per_page: 20,
      });

      setConversations(response.data.data);
      setTotalPages(response.data.last_page);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, statusFilter, currentPage]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleViewConversation = (conversationId: number) => {
    router.push(`/${lang}/workspaces/${tenantId}/inbox?conversation=${conversationId}`);
  };

  const getStatusBadge = (status: ConversationStatus) => {
    const config = STATUS_OPTIONS.find((s) => s.value === status);
    if (!config) return null;

    const Icon = config.icon;
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
          status === 'queued' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400',
          status === 'active' && 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
          status === 'waiting' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
          status === 'closed' && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        )}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getHandlerBadge = (handlerType: HandlerType) => {
    if (handlerType === 'human') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400">
          <User className="h-3 w-3" />
          Human
        </span>
      );
    }
    if (handlerType === 'ai') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400">
          <Bot className="h-3 w-3" />
          AI
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        <Clock className="h-3 w-3" />
        Unassigned
      </span>
    );
  };

  const filteredConversations = conversations.filter((conv) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const visitorName = conv.visitor?.name?.toLowerCase() || '';
      const visitorEmail = conv.visitor?.email?.toLowerCase() || '';
      return visitorName.includes(query) || visitorEmail.includes(query);
    }
    return true;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversations</h1>
            <p className="text-gray-500 dark:text-gray-400">{total} total conversations</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by visitor name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  setStatusFilter(status.value);
                  setCurrentPage(1);
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  statusFilter === status.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <status.icon className="h-4 w-4" />
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No conversations found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Conversations will appear here when visitors start chatting'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Visitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Handler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredConversations.map((conv) => (
                  <tr
                    key={conv.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => handleViewConversation(conv.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {conv.visitor?.name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {conv.visitor?.email || `Visitor #${conv.visitor_id}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(conv.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getHandlerBadge(conv.handler_type)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {conv.last_message ? (
                          <>
                            <p className="text-sm text-gray-900 dark:text-white truncate">
                              {conv.last_message.content}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(conv.last_message.created_at, lang)}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">No messages</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(conv.created_at, lang)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewConversation(conv.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  currentPage === totalPages
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
