"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { visitorsApi } from '@/lib/api/chat';
import { cn } from '@/lib/utils';
import {
  Eye,
  Search,
  Loader2,
  User,
  Globe,
  Clock,
  MessageSquare,
  Send,
  X,
  ChevronRight,
  Users,
  Filter,
} from 'lucide-react';
import type { VisitorListItem, VisitorDetails, NewVisitorEvent, VisitorOnlineEvent } from '@/lib/types/chat';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function VisitorsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = Number(params.tenantId);
  const lang = params.lang as string;

  const [visitors, setVisitors] = useState<VisitorListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'online'>('all');
  const [identifiedOnly, setIdentifiedOnly] = useState(false);

  // Derive onlineOnly from activeTab
  const onlineOnly = activeTab === 'online';
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  // Selected visitor for detail panel
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Start chat modal
  const [showStartChat, setShowStartChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  const loadVisitors = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      // Build params object, only include truthy values
      // Use 1/0 for booleans since axios serializes them as strings in URLs
      const params: Record<string, string | number> = {
        per_page: 20,
        page,
      };
      if (searchQuery) params.search = searchQuery;
      if (onlineOnly) params.online_only = 1;
      if (identifiedOnly) params.identified_only = 1;

      const response = await visitorsApi.list(tenantId, params as any);
      setVisitors(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
      });
    } catch (err) {
      console.error('Failed to load visitors:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, searchQuery, onlineOnly, identifiedOnly]);

  // WebSocket handler for new visitors
  const handleNewVisitor = useCallback((event: NewVisitorEvent) => {
    // Add new visitor to the top of the list
    setVisitors(prev => {
      // Don't add duplicates
      if (prev.some(v => v.id === event.visitor.id)) return prev;
      return [event.visitor, ...prev];
    });
    setPagination(prev => ({ ...prev, total: prev.total + 1 }));
  }, []);

  // WebSocket handler for visitor coming online
  const handleVisitorOnline = useCallback((event: VisitorOnlineEvent) => {
    setVisitors(prev => {
      const exists = prev.some(v => v.id === event.visitor.id);
      if (exists) {
        // Update existing visitor to show as online
        return prev.map(v => v.id === event.visitor.id ? { ...v, ...event.visitor, is_online: true } : v);
      }
      // Add to list if not present (could happen if list was filtered)
      return [event.visitor, ...prev];
    });
  }, []);

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket({
    tenantId,
    onNewVisitor: handleNewVisitor,
    onVisitorOnline: handleVisitorOnline,
  });

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const handleSelectVisitor = async (visitor: VisitorListItem) => {
    setLoadingDetails(true);
    try {
      const response = await visitorsApi.get(tenantId, visitor.id);
      setSelectedVisitor(response.data);
    } catch (err) {
      console.error('Failed to load visitor details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStartChat = async () => {
    if (!selectedVisitor || !chatMessage.trim()) return;

    setStartingChat(true);
    try {
      const response = await visitorsApi.startChat(tenantId, selectedVisitor.id, chatMessage.trim());
      // Navigate to the conversation in inbox
      router.push(`/${lang}/workspaces/${tenantId}/inbox?conversation=${response.data.conversation_id}`);
    } catch (err: unknown) {
      const error = err as { response?: { status: number; data?: { data?: { conversation_id?: number } } } };
      if (error.response?.status === 409) {
        // Visitor already has active conversation
        const conversationId = error.response.data?.data?.conversation_id;
        if (conversationId) {
          router.push(`/${lang}/workspaces/${tenantId}/inbox?conversation=${conversationId}`);
        }
      } else {
        console.error('Failed to start chat:', err);
      }
    } finally {
      setStartingChat(false);
      setShowStartChat(false);
      setChatMessage('');
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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getDisplayName = (visitor: VisitorListItem) => {
    if (visitor.name) return visitor.name;
    if (visitor.email) return visitor.email.split('@')[0];
    return `Visitor #${visitor.id}`;
  };

  return (
    <div className="h-full flex">
      {/* Visitors List */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0 border-r border-gray-200 dark:border-gray-800',
        selectedVisitor && 'hidden lg:flex'
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h1 className="text-base font-medium text-gray-900 dark:text-white">Visitors</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({pagination.total})
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 -mx-4 px-4">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'all'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <Users className="h-4 w-4" />
              Hamısı ({pagination.total})
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'online'
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Online
            </button>
          </div>

          {/* Identified Filter */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setIdentifiedOnly(!identifiedOnly)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors',
                identifiedOnly
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <User className="h-3 w-3" />
              Identified
            </button>
          </div>
        </div>

        {/* Visitors Table */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : visitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Users className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No visitors found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || onlineOnly || identifiedOnly
                  ? 'Try adjusting your filters'
                  : 'Visitors will appear here when they visit your site'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {visitors.map((visitor) => (
                <button
                  key={visitor.id}
                  onClick={() => handleSelectVisitor(visitor)}
                  className={cn(
                    'w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                    selectedVisitor?.id === visitor.id && 'bg-purple-50 dark:bg-purple-900/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {visitor.metadata?.avatar ? (
                          <img
                            src={visitor.metadata.avatar as string}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      {visitor.is_online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {getDisplayName(visitor)}
                        </span>
                        {visitor.is_identified && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded">
                            ID
                          </span>
                        )}
                      </div>

                      {visitor.current_page_title && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                          <Globe className="h-3 w-3 flex-shrink-0" />
                          {visitor.current_page_title}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {visitor.page_view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {visitor.conversations_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(visitor.last_seen_at)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => loadVisitors(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                {pagination.currentPage} / {pagination.lastPage}
              </span>
              <button
                onClick={() => loadVisitors(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage}
                className="px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visitor Detail Panel */}
      {selectedVisitor && (
        <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-medium text-gray-900 dark:text-white">Visitor Details</h2>
            <button
              onClick={() => setSelectedVisitor(null)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loadingDetails ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Profile */}
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {selectedVisitor.metadata?.avatar ? (
                      <img
                        src={selectedVisitor.metadata.avatar as string}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  {selectedVisitor.is_online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {getDisplayName(selectedVisitor)}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {selectedVisitor.is_identified ? (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded">
                        Identified
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                        Guest
                      </span>
                    )}
                    {selectedVisitor.is_online && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded">
                        Online
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Start Chat Button */}
              <button
                onClick={() => setShowStartChat(true)}
                disabled={!selectedVisitor.is_online}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 rounded-lg font-medium transition-colors"
              >
                <Send className="h-4 w-4" />
                Start Chat
              </button>
              {!selectedVisitor.is_online && (
                <p className="text-xs text-center text-gray-500">
                  Visitor must be online to start a chat
                </p>
              )}

              {/* Contact Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact</h4>
                {selectedVisitor.email && (
                  <p className="text-sm text-gray-900 dark:text-white">{selectedVisitor.email}</p>
                )}
                {selectedVisitor.phone && (
                  <p className="text-sm text-gray-900 dark:text-white">{selectedVisitor.phone}</p>
                )}
                {!selectedVisitor.email && !selectedVisitor.phone && (
                  <p className="text-sm text-gray-500 italic">No contact info</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Page Views</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedVisitor.page_view_count}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Conversations</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedVisitor.conversations?.length || 0}
                  </p>
                </div>
              </div>

              {/* Page Views */}
              {selectedVisitor.page_views && selectedVisitor.page_views.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Recent Pages
                  </h4>
                  <div className="space-y-2">
                    {selectedVisitor.page_views.slice(0, 5).map((pv) => (
                      <div key={pv.id} className="text-sm">
                        <p className="text-gray-900 dark:text-white truncate">
                          {pv.page_title || 'Untitled'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{pv.page_url}</p>
                        <p className="text-xs text-gray-400">{formatTime(pv.viewed_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversations */}
              {selectedVisitor.conversations && selectedVisitor.conversations.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Conversation History
                  </h4>
                  <div className="space-y-2">
                    {selectedVisitor.conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => router.push(`/${lang}/workspaces/${tenantId}/inbox?conversation=${conv.id}`)}
                        className="w-full text-left p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            'px-1.5 py-0.5 text-[10px] font-medium rounded',
                            conv.status === 'active' && 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
                            conv.status === 'closed' && 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                            conv.status === 'queued' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
                            conv.status === 'waiting' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          )}>
                            {conv.status}
                          </span>
                          <span className="text-xs text-gray-500">{conv.messages_count} msgs</span>
                        </div>
                        <p className="text-xs text-gray-500">{formatTime(conv.created_at)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Start Chat Modal */}
      {showStartChat && selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowStartChat(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Start Chat with {getDisplayName(selectedVisitor)}
              </h2>
              <button
                onClick={() => setShowStartChat(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              This will start a new conversation with the visitor. They will see a chat notification on their screen.
            </p>

            <textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-4"
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStartChat(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartChat}
                disabled={!chatMessage.trim() || startingChat}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
              >
                {startingChat ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Start Chat
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
