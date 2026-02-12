"use client";

import { useState, useEffect } from 'react';
import { HelpCircle, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GuideStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PageGuideProps {
  storageKey: string;
  title: string;
  description: string;
  steps: GuideStep[];
}

export function PageGuide({ storageKey, title, description, steps }: PageGuideProps) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(true);

  useEffect(() => {
    setSeen(localStorage.getItem(`guide_seen_${storageKey}`) === '1');
  }, [storageKey]);

  const handleOpen = () => {
    setOpen(true);
    localStorage.setItem(`guide_seen_${storageKey}`, '1');
    setSeen(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title={title}
      >
        <HelpCircle className="h-4.5 w-4.5" />
        {!seen && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
          <div className="fixed inset-4 sm:inset-auto sm:right-4 sm:top-4 sm:bottom-4 sm:w-[420px] z-50 flex items-start sm:items-stretch">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <HelpCircle className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pb-1">
                  {description}
                </p>
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className="group flex gap-3.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
