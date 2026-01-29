"use client";

import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useTranslations } from 'next-intl';
import {
  User,
  Bot,
  MoreVertical,
  UserPlus,
  XCircle,
  Clock,
  Mail,
  Globe,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationHeaderProps {
  onBack?: () => void;
}

export function ConversationHeader({ onBack }: ConversationHeaderProps) {
  const t = useTranslations();
  const {
    activeConversation,
    takeoverConversation,
    closeConversation,
    transferConversation,
    agents,
  } = useChat();
  const [showMenu, setShowMenu] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!activeConversation) return null;

  const { visitor, handler_type, status, assigned_agent } = activeConversation;

  const handleTakeover = async () => {
    if (handler_type !== 'ai' || isProcessing) return;
    setIsProcessing(true);
    try {
      await takeoverConversation(activeConversation.id);
    } catch (error) {
      console.error('Failed to takeover:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = async () => {
    if (status === 'closed' || isProcessing) return;
    setIsProcessing(true);
    try {
      await closeConversation(activeConversation.id);
    } catch (error) {
      console.error('Failed to close:', error);
    } finally {
      setIsProcessing(false);
      setShowMenu(false);
    }
  };

  const handleTransfer = async (agentId: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await transferConversation(activeConversation.id, agentId);
      setShowTransferModal(false);
    } catch (error) {
      console.error('Failed to transfer:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full">Active</span>;
      case 'queued':
        return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 rounded-full">In Queue</span>;
      case 'waiting':
        return <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded-full">Waiting</span>;
      case 'closed':
        return <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">Closed</span>;
      default:
        return null;
    }
  };

  const getHandlerBadge = () => {
    if (handler_type === 'ai') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 rounded-full">
          <Bot className="h-3 w-3" />
          <span className="hidden sm:inline">AI</span>
        </span>
      );
    }
    if (handler_type === 'human' && assigned_agent) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full">
          <User className="h-3 w-3" />
          <span className="hidden sm:inline truncate max-w-[80px]">{assigned_agent.name}</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Left: Back button (mobile) + Visitor info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Back button - mobile only */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
              {visitor?.name || visitor?.email || 'Anonymous'}
            </h3>
            <div className="flex items-center gap-1.5">
              {getStatusBadge()}
              {getHandlerBadge()}
            </div>
          </div>
          {/* Desktop: show details */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {visitor?.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {visitor.email}
              </span>
            )}
            {activeConversation.metadata?.page_url && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {new URL(activeConversation.metadata.page_url as string).pathname}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(activeConversation.created_at).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Takeover button (only show when AI is handling) */}
        {handler_type === 'ai' && status !== 'closed' && (
          <button
            onClick={handleTakeover}
            disabled={isProcessing}
            className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-900 active:bg-purple-300 rounded-lg transition-colors disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Take Over</span>
          </button>
        )}

        {/* More actions menu */}
        {status !== 'closed' && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  <button
                    onClick={() => {
                      setShowTransferModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
                  >
                    <UserPlus className="h-5 w-5" />
                    Transfer to Agent
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 active:bg-red-100"
                  >
                    <XCircle className="h-5 w-5" />
                    Close Conversation
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowTransferModal(false)} />
          <div className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full sm:max-w-md max-h-full overflow-auto p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Transfer Conversation</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select an agent to transfer this conversation to:</p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {agents
                  .filter((a) => a.status === 'online' && a.id !== assigned_agent?.id)
                  .map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleTransfer(agent.id)}
                      disabled={isProcessing}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{agent.name}</p>
                        <p className="text-xs text-gray-500 truncate">{agent.email}</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                    </button>
                  ))}

                {agents.filter((a) => a.status === 'online' && a.id !== assigned_agent?.id).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                    No other agents are online
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ConversationHeader;
