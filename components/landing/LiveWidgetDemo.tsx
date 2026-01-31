'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { BrowserMockup } from './BrowserMockup';
import { Monitor, Smartphone, Bot, User, UserCheck } from 'lucide-react';

interface Message {
  id: number;
  sender: 'visitor' | 'ai' | 'human';
  textKey: string;
  typing?: boolean;
}

interface LiveWidgetDemoProps {
  className?: string;
}

export function LiveWidgetDemo({ className }: LiveWidgetDemoProps) {
  const t = useTranslations('landing.liveDemo');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [demoCycle, setDemoCycle] = useState(0);

  const demoSequence: Message[] = [
    { id: 1, sender: 'visitor', textKey: 'msg1' },
    { id: 2, sender: 'ai', textKey: 'msg2' },
    { id: 3, sender: 'visitor', textKey: 'msg3' },
    { id: 4, sender: 'ai', textKey: 'msg4' },
    { id: 5, sender: 'human', textKey: 'msg5' },
  ];

  useEffect(() => {
    const runDemo = async () => {
      setMessages([]);
      setCurrentStep(0);

      for (let i = 0; i < demoSequence.length; i++) {
        // Show typing indicator
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1200));
        setIsTyping(false);

        // Add message
        setMessages(prev => [...prev, demoSequence[i]]);
        setCurrentStep(i + 1);

        // Pause between messages
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Reset after completion
      await new Promise(resolve => setTimeout(resolve, 4000));
      setDemoCycle(prev => prev + 1);
      runDemo();
    };

    runDemo();
  }, []);

  const getSenderIcon = (sender: 'visitor' | 'ai' | 'human') => {
    switch (sender) {
      case 'visitor':
        return <User className="w-4 h-4 text-white" />;
      case 'ai':
        return <Bot className="w-4 h-4 text-white" />;
      case 'human':
        return <UserCheck className="w-4 h-4 text-white" />;
    }
  };

  const getSenderColor = (sender: 'visitor' | 'ai' | 'human') => {
    switch (sender) {
      case 'visitor':
        return 'bg-gray-400';
      case 'ai':
        return 'bg-gradient-to-br from-indigo-500 to-purple-500';
      case 'human':
        return 'bg-gradient-to-br from-green-500 to-emerald-500';
    }
  };

  const getSenderLabel = (sender: 'visitor' | 'ai' | 'human') => {
    switch (sender) {
      case 'visitor':
        return t('visitor');
      case 'ai':
        return t('aiAssistant');
      case 'human':
        return t('agent');
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Device Toggle */}
      <div className="flex justify-center">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setDevice('desktop')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium',
              device === 'desktop'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <Monitor className="h-4 w-4" />
            {t('desktop')}
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium',
              device === 'mobile'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <Smartphone className="h-4 w-4" />
            {t('mobile')}
          </button>
        </div>
      </div>

      {/* Demo Container */}
      <div className={cn(
        'transition-all duration-300 mx-auto',
        device === 'mobile' ? 'max-w-[375px]' : 'max-w-3xl'
      )}>
        <BrowserMockup url="sizinsayt.az" className="aspect-[16/10]">
          {/* Page Content Placeholder */}
          <div className="absolute inset-0 p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-full" />
            <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-5/6" />
            <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-4/6" />

            {/* Widget Preview */}
            <div className="absolute bottom-2 right-2 w-72">
              {/* Chat Window */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden mb-3">
                {/* Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
                  <span className="font-medium">{t('chatHeader')}</span>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {t('online')}
                  </div>
                </div>

                {/* Messages */}
                <div className="p-3 h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={`${demoCycle}-${msg.id}`}
                      className={cn(
                        'flex gap-2',
                        msg.sender === 'visitor' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {msg.sender !== 'visitor' && (
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                          getSenderColor(msg.sender)
                        )}>
                          {getSenderIcon(msg.sender)}
                        </div>
                      )}
                      <div className={cn('max-w-[80%]', msg.sender === 'visitor' && 'order-first')}>
                        {msg.sender !== 'visitor' && (
                          <span className="text-xs text-gray-500 block mb-0.5">
                            {getSenderLabel(msg.sender)}
                          </span>
                        )}
                        <div className={cn(
                          'px-3 py-1.5 rounded-lg text-sm',
                          msg.sender === 'visitor'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                        )}>
                          {t(msg.textKey)}
                        </div>
                      </div>
                      {msg.sender === 'visitor' && (
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                          getSenderColor(msg.sender)
                        )}>
                          {getSenderIcon(msg.sender)}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-2">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                        currentStep < 4 ? 'bg-gradient-to-br from-indigo-500 to-purple-500' : 'bg-gradient-to-br from-green-500 to-emerald-500'
                      )}>
                        {currentStep < 4 ? <Bot className="w-4 h-4 text-white" /> : <UserCheck className="w-4 h-4 text-white" />}
                      </div>
                      <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center px-3">
                    <span className="text-xs text-gray-400">{t('typeMessage')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BrowserMockup>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center gap-2">
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-medium transition-all',
          currentStep >= 1 ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
        )}>
          {t('step1')}
        </div>
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-medium transition-all',
          currentStep >= 2 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
        )}>
          {t('step2')}
        </div>
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-medium transition-all',
          currentStep >= 5 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
        )}>
          {t('step3')}
        </div>
      </div>
    </div>
  );
}
