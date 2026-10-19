"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useChat } from '@/contexts/ChatContext';
import { agentsApi } from '@/lib/api/chat';
import { cn } from '@/lib/utils';
import {
  Bell,
  Save,
  Loader2,
  MessageSquarePlus,
  ArrowRightLeft,
  UserPlus,
  Volume2,
  Mail,
  Smartphone,
  MessageCircle,
  Eye,
} from 'lucide-react';
import type { NotificationSettings } from '@/lib/types/chat';

const DEFAULT_SETTINGS: NotificationSettings = {
  sound: {
    new_conversation: true,
    new_message: true,
    new_visitor: false,
  },
  email: {
    new_conversation: true,
    transfer_request: true,
    workspace_invite: true,
  },
  sms: {
    new_conversation: false,
    transfer_request: false,
  },
};

export default function NotificationsPage() {
  const t = useTranslations('ws.notifications');
  const params = useParams();
  const { tenant, loadNotificationSettings } = useChat();
  const tenantId = Number(params.tenantId);

  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, [tenantId]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await agentsApi.getNotificationSettings(tenantId);
      // Deep merge with defaults
      const loaded = response.data;
      setSettings({
        sound: { ...DEFAULT_SETTINGS.sound, ...(loaded?.sound || {}) },
        email: { ...DEFAULT_SETTINGS.email, ...loaded?.email },
        sms: { ...DEFAULT_SETTINGS.sms, ...loaded?.sms },
      });
    } catch (err) {
      console.error('Failed to load notification settings:', err);
      setError(t('loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (channel: keyof NotificationSettings, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [key]: !prev[channel][key as keyof typeof prev[typeof channel]],
      },
    }));
    setSuccess(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await agentsApi.updateNotificationSettings(tenantId, settings);
      // Reload notification settings in ChatContext so sounds respect the new settings
      await loadNotificationSettings();
      setSuccess(t('saved'));
    } catch (err) {
      console.error('Failed to save notification settings:', err);
      setError(t('saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded">
            <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-base font-medium text-gray-900 dark:text-white">{t('title')}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Sound Notifications */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">{t('sound.title')}</h2>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded text-purple-600 dark:text-purple-400">
                  <MessageSquarePlus className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('newConversations')}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('sound.newConversationDesc')}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.sound.new_conversation}
                onChange={() => handleToggle('sound', 'new_conversation')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded text-purple-600 dark:text-purple-400">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('sound.newMessages')}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('sound.newMessagesDesc')}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.sound.new_message}
                onChange={() => handleToggle('sound', 'new_message')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded text-green-600 dark:text-green-400">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('sound.onlineVisitors')}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('sound.onlineVisitorsDesc')}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.sound.new_visitor}
                onChange={() => handleToggle('sound', 'new_visitor')}
              />
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">{t('email.title')}</h2>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded text-purple-600 dark:text-purple-400">
                  <MessageSquarePlus className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('newConversations')}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('email.newConversationDesc')}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.email.new_conversation}
                onChange={() => handleToggle('email', 'new_conversation')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded text-purple-600 dark:text-purple-400">
                  <ArrowRightLeft className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('transferRequests')}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('email.transferDesc')}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.email.transfer_request}
                onChange={() => handleToggle('email', 'transfer_request')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded text-purple-600 dark:text-purple-400">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('email.workspaceInvites')}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('email.workspaceInvitesDesc')}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.email.workspace_invite}
                onChange={() => handleToggle('email', 'workspace_invite')}
              />
            </div>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">{t('sms.title')}</h2>
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded">{t('sms.comingSoon')}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded text-purple-600 dark:text-purple-400">
                  <MessageSquarePlus className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('newConversations')}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('sms.newConversationDesc')}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.sms.new_conversation}
                onChange={() => handleToggle('sms', 'new_conversation')}
                disabled
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded text-purple-600 dark:text-purple-400">
                  <ArrowRightLeft className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t('transferRequests')}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('sms.transferDesc')}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.sms.transfer_request}
                onChange={() => handleToggle('sms', 'transfer_request')}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-3">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            {t('info')}
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors',
              isSaving
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            )}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <label className={cn("relative inline-flex items-center", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={cn(
        "w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600",
        disabled && "opacity-50"
      )}></div>
    </label>
  );
}
