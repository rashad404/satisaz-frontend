"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useChat } from '@/contexts/ChatContext';
import { tenantsApi } from '@/lib/api/chat';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  Code,
  Copy,
  Check,
  Loader2,
  Palette,
  MessageCircle,
  Settings2,
  Eye,
  Monitor,
  Smartphone,
  Globe,
} from 'lucide-react';
import type { WidgetSettings } from '@/lib/types/chat';

const POSITION_OPTIONS = [
  { value: 'bottom-left', label: 'positionBottomLeft' },
  { value: 'bottom-right', label: 'positionBottomRight' },
];

const LANGUAGE_OPTIONS = [
  { value: 'az', label: 'Azərbaycan dili' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
];

const COLOR_PRESETS = [
  '#7C3AED', // Purple
  '#2563EB', // Blue
  '#059669', // Green
  '#DC2626', // Red
  '#D97706', // Orange
  '#EC4899', // Pink
  '#0891B2', // Cyan
  '#4B5563', // Gray
];

export default function WidgetCodePage() {
  const t = useTranslations('ws.widget');
  const params = useParams();
  const { tenant, loadTenant } = useChat();
  const tenantId = Number(params.tenantId);

  const [embedCode, setEmbedCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>({
    primary_color: '#7C3AED',
    position: 'bottom-right',
    greeting_message: 'Hi! How can we help you today?',
    offline_message: 'We are currently offline. Leave a message!',
    show_agent_avatar: true,
    show_agent_name: true,
    language: 'az',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadWidgetCode = async () => {
      setIsLoading(true);
      try {
        const response = await tenantsApi.getWidgetCode(tenantId);
        setEmbedCode(response.data.embed_code);

        // Use tenant from response if available, otherwise from context
        const tenantData = response.data.tenant || tenant;
        if (tenantData?.widget_settings) {
          setWidgetSettings({
            ...widgetSettings,
            ...tenantData.widget_settings,
          });
        }
      } catch (err) {
        console.error('Failed to load widget code:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadWidgetCode();
  }, [tenantId, tenant]);

  const handleCopy = async () => {
    try {
      // Try modern clipboard API first (requires HTTPS)
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(embedCode);
      } else {
        // Fallback for HTTP or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = embedCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await tenantsApi.update(tenantId, { widget_settings: widgetSettings });
      await loadTenant();
      setSuccess(t('saved'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('saveFailed');
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <Code className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            {/* Embed Code */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('embedCode')}</h2>
                <button
                  onClick={handleCopy}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    copied
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t('copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t('copy')}
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-gray-900 dark:bg-gray-950 rounded-lg overflow-x-auto">
                <code className="text-sm text-gray-300 whitespace-pre-wrap break-all">
                  {embedCode}
                </code>
              </pre>

              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {t.rich('embedHint', {
                  tag: '</body>',
                  code: (chunks) => <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{chunks}</code>,
                })}
              </p>
            </div>

            {/* Appearance Settings */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('appearance')}</h2>
              </div>

              <div className="space-y-4">
                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('primaryColor')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setWidgetSettings({ ...widgetSettings, primary_color: color })}
                        className={cn(
                          'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                          widgetSettings.primary_color === color
                            ? 'border-gray-900 dark:border-white scale-110'
                            : 'border-transparent'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <div className="relative">
                      <input
                        type="color"
                        value={widgetSettings.primary_color || '#7C3AED'}
                        onChange={(e) => setWidgetSettings({ ...widgetSettings, primary_color: e.target.value })}
                        className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('position')}
                  </label>
                  <div className="flex gap-2">
                    {POSITION_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setWidgetSettings({ ...widgetSettings, position: option.value as 'bottom-right' | 'bottom-left' })}
                        className={cn(
                          'flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors',
                          widgetSettings.position === option.value
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        {t(option.label)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('language')}</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('widgetLanguage')}
                </label>
                <div className="flex gap-2">
                  {LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setWidgetSettings({ ...widgetSettings, language: option.value as 'az' | 'en' | 'ru' })}
                      className={cn(
                        'flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors',
                        widgetSettings.language === option.value
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t('widgetLanguageHint')}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('messages')}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('greetingMessage')}
                  </label>
                  <input
                    type="text"
                    value={widgetSettings.greeting_message || ''}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, greeting_message: e.target.value })}
                    placeholder={t('greetingPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('offlineMessage')}
                  </label>
                  <input
                    type="text"
                    value={widgetSettings.offline_message || ''}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, offline_message: e.target.value })}
                    placeholder={t('offlinePlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('displayOptions')}</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={widgetSettings.show_agent_avatar}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, show_agent_avatar: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('showAgentAvatars')}</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={widgetSettings.show_agent_name}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, show_agent_name: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('showAgentNames')}</span>
                </label>
              </div>
            </div>

            {/* Visitor notifications (Alert.az) */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Settings2 className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('visitorNotifications')}</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('visitorNotificationsHint')}
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!widgetSettings.visitor_notifications?.email}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, visitor_notifications: { ...(widgetSettings.visitor_notifications || {}), email: e.target.checked } })}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('notifyEmail')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!widgetSettings.visitor_notifications?.sms}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, visitor_notifications: { ...(widgetSettings.visitor_notifications || {}), sms: e.target.checked } })}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('notifySms')}</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors',
                isSaving
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                t('saveSettings')
              )}
            </button>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('preview')}</h2>
              </div>

              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    previewDevice === 'desktop'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    previewDevice === 'mobile'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Preview Container */}
            <div
              className={cn(
                'bg-gray-100 dark:bg-gray-800 rounded-xl p-4 transition-all duration-300',
                previewDevice === 'mobile' ? 'max-w-[375px] mx-auto' : ''
              )}
            >
              {/* Website Mockup */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden aspect-[4/3] relative">
                {/* Fake Browser Chrome */}
                <div className="h-8 bg-gray-200 dark:bg-gray-700 flex items-center px-3 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-8">
                    <div className="h-5 bg-white dark:bg-gray-600 rounded-full px-3 flex items-center">
                      <span className="text-xs text-gray-400">{t('previewDomain')}</span>
                    </div>
                  </div>
                </div>

                {/* Page Content Placeholder */}
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-4/6" />
                </div>

                {/* Widget Preview */}
                <div
                  className={cn(
                    'absolute bottom-4',
                    widgetSettings.position === 'bottom-right' ? 'right-4' : 'left-4'
                  )}
                >
                  {/* Chat Window Preview */}
                  <div
                    className="w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden mb-3"
                    style={{ borderColor: widgetSettings.primary_color }}
                  >
                    {/* Header */}
                    <div
                      className="px-4 py-3 text-white"
                      style={{ backgroundColor: widgetSettings.primary_color }}
                    >
                      <span className="font-medium">{t('previewHeader')}</span>
                    </div>

                    {/* Messages */}
                    <div className="p-3 h-32 bg-gray-50 dark:bg-gray-900">
                      <div className="flex gap-2 mb-2">
                        {widgetSettings.show_agent_avatar && (
                          <div
                            className="w-6 h-6 rounded-full flex-shrink-0"
                            style={{ backgroundColor: widgetSettings.primary_color }}
                          />
                        )}
                        <div>
                          {widgetSettings.show_agent_name && (
                            <span className="text-xs text-gray-500 block mb-0.5">{t('previewAgentName')}</span>
                          )}
                          <div
                            className="px-3 py-1.5 rounded-lg text-white text-sm"
                            style={{ backgroundColor: widgetSettings.primary_color }}
                          >
                            {widgetSettings.greeting_message}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Input */}
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    </div>
                  </div>

                  {/* Launcher Button */}
                  <div
                    className={cn(
                      'w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform',
                      widgetSettings.position === 'bottom-right' ? 'ml-auto' : ''
                    )}
                    style={{ backgroundColor: widgetSettings.primary_color }}
                  >
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('installTitle')}</h3>
              <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-medium">1</span>
                  <span>{t('installStep1')}</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-medium">2</span>
                  <span>{t.rich('installStep2', {
                    tag: '</body>',
                    code: (chunks) => <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{chunks}</code>,
                  })}</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-medium">3</span>
                  <span>{t('installStep3')}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
