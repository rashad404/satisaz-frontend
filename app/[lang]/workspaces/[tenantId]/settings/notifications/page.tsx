"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
} from 'lucide-react';
import type { NotificationSettings } from '@/lib/types/chat';

interface NotificationOption {
  key: keyof NotificationSettings;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    key: 'new_conversation',
    label: 'Yeni söhbətlər',
    description: 'Yeni söhbət növbəyə daxil olanda email bildirişi alın',
    icon: <MessageSquarePlus className="h-4 w-4" />,
  },
  {
    key: 'transfer_request',
    label: 'Transfer sorğuları',
    description: 'Sizə söhbət transfer ediləndə email bildirişi alın',
    icon: <ArrowRightLeft className="h-4 w-4" />,
  },
  {
    key: 'workspace_invite',
    label: 'Workspace dəvətləri',
    description: 'Workspace-ə dəvət olunanda email bildirişi alın',
    icon: <UserPlus className="h-4 w-4" />,
  },
];

export default function NotificationsPage() {
  const params = useParams();
  const { tenant } = useChat();
  const tenantId = Number(params.tenantId);

  const [settings, setSettings] = useState<NotificationSettings>({
    new_conversation: true,
    transfer_request: true,
    workspace_invite: true,
  });
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
      setSettings(response.data);
    } catch (err) {
      console.error('Failed to load notification settings:', err);
      setError('Bildiriş ayarlarını yükləmək mümkün olmadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSuccess(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await agentsApi.updateNotificationSettings(tenantId, settings);
      setSuccess('Bildiriş ayarları yadda saxlanıldı');
    } catch (err) {
      console.error('Failed to save notification settings:', err);
      setError('Bildiriş ayarlarını yadda saxlamaq mümkün olmadı');
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
            <h1 className="text-base font-medium text-gray-900 dark:text-white">Bildiriş Ayarları</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Email bildirişlərinizi idarə edin</p>
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

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Email Bildirişləri</h2>

          <div className="space-y-2">
            {NOTIFICATION_OPTIONS.map((option) => (
              <div
                key={option.key}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded text-purple-600 dark:text-purple-400">
                    {option.icon}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[option.key]}
                    onChange={() => handleToggle(option.key)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-3">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Email bildirişləri Satis.az tərəfindən Alert.az platforması vasitəsilə göndərilir.
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
            {isSaving ? 'Saxlanılır...' : 'Yadda Saxla'}
          </button>
        </div>
      </div>
    </div>
  );
}
