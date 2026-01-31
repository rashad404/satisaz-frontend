'use client';

import { cn } from '@/lib/utils';

interface BrowserMockupProps {
  children: React.ReactNode;
  url?: string;
  className?: string;
}

export function BrowserMockup({ children, url = 'yourwebsite.com', className }: BrowserMockupProps) {
  return (
    <div className={cn('bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden flex flex-col', className)}>
      {/* Browser Chrome */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 flex items-center px-3 gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 mx-8">
          <div className="h-5 bg-white dark:bg-gray-600 rounded-full px-3 flex items-center">
            <span className="text-xs text-gray-400">{url}</span>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="relative flex-1">
        {children}
      </div>
    </div>
  );
}
