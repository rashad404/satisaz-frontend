"use client";

import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  name?: string;
  className?: string;
}

export function TypingIndicator({ name = 'Someone', className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Typing bubble */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Name label */}
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {name} is typing...
      </span>
    </div>
  );
}

export default TypingIndicator;
