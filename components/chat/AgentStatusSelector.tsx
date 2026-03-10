"use client";

import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Circle, ChevronDown, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentStatusMode } from '@/lib/types/chat';

export function AgentStatusSelector() {
  const { myStatus, statusMode, updateStatusMode, onlineAgentsCount } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const modeOptions: { value: AgentStatusMode; label: string; description: string; color: string; icon?: 'monitor' }[] = [
    { value: 'auto', label: 'Auto', description: 'Online when page open', color: 'bg-blue-500', icon: 'monitor' },
    { value: 'online', label: 'Online', description: 'Always online', color: 'bg-green-500' },
    { value: 'away', label: 'Away', description: 'Always away', color: 'bg-yellow-500' },
    { value: 'offline', label: 'Offline', description: 'Always offline', color: 'bg-gray-400' },
  ];

  // Show the actual status dot color based on real backend status
  const statusColorMap: Record<string, string> = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400',
  };

  const currentMode = modeOptions.find((m) => m.value === statusMode) || modeOptions[0];
  const dotColor = statusColorMap[myStatus] || 'bg-gray-400';

  const handleModeChange = async (mode: AgentStatusMode) => {
    if (isUpdating || mode === statusMode) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateStatusMode(mode);
    } catch (error) {
      console.error('Failed to update status mode:', error);
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
        <span className={cn('w-2.5 h-2.5 rounded-full', dotColor)} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {currentMode.label}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-gray-500 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
            {modeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleModeChange(option.value)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                  option.value === statusMode && 'bg-gray-50 dark:bg-gray-700/50'
                )}
              >
                {option.icon === 'monitor' ? (
                  <Monitor className="w-3 h-3 text-blue-500 flex-shrink-0" />
                ) : (
                  <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', option.color)} />
                )}
                <div className="text-left">
                  <span className="text-gray-700 dark:text-gray-200">{option.label}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1.5">{option.description}</span>
                </div>
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
