"use client";

import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Circle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentStatusType } from '@/lib/types/chat';

export function AgentStatusSelector() {
  const { myStatus, updateMyStatus, onlineAgentsCount } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions: { value: AgentStatusType; label: string; color: string }[] = [
    { value: 'online', label: 'Online', color: 'bg-green-500' },
    { value: 'away', label: 'Away', color: 'bg-yellow-500' },
    { value: 'offline', label: 'Offline', color: 'bg-gray-400' },
  ];

  const currentStatus = statusOptions.find((s) => s.value === myStatus) || statusOptions[2];

  const handleStatusChange = async (status: AgentStatusType) => {
    if (isUpdating || status === myStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateMyStatus(status);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
          'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
          'disabled:opacity-50'
        )}
      >
        <span className={cn('w-2.5 h-2.5 rounded-full', currentStatus.color)} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {currentStatus.label}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-gray-500 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                  option.value === myStatus && 'bg-gray-50 dark:bg-gray-700/50'
                )}
              >
                <span className={cn('w-2.5 h-2.5 rounded-full', option.color)} />
                <span className="text-gray-700 dark:text-gray-200">{option.label}</span>
                {option.value === myStatus && (
                  <span className="ml-auto text-xs text-gray-400">Current</span>
                )}
              </button>
            ))}

            <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1 px-3 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {onlineAgentsCount} agent{onlineAgentsCount !== 1 ? 's' : ''} online
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AgentStatusSelector;
