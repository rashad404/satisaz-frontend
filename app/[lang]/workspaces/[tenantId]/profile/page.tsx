"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useChat } from '@/contexts/ChatContext';
import { agentsApi } from '@/lib/api/chat';
import { cn } from '@/lib/utils';
import {
  User,
  Save,
  Loader2,
  RefreshCw,
  Upload,
  X,
  Camera,
} from 'lucide-react';
import type { Agent } from '@/lib/types/chat';

export default function ProfilePage() {
  const params = useParams();
  const { tenant } = useChat();
  const tenantId = Number(params.tenantId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Agent | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [tenantId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await agentsApi.getMyProfile(tenantId);
      setProfile(response.data);
      setDisplayName(response.data.display_name || '');
      setAvatarPreview(response.data.display_avatar || null);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Profili yükləmək mümkün olmadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Yalnız şəkil faylları qəbul edilir');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Fayl ölçüsü 5MB-dan böyük ola bilməz');
      return;
    }

    setAvatarFile(file);
    setError(null);
    setSuccess(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await agentsApi.updateMyProfile(tenantId, {
        display_name: displayName || null,
        display_avatar: avatarFile || null,
      });
      setProfile(response.data);
      setAvatarFile(null);
      setAvatarPreview(response.data.display_avatar || null);
      setSuccess('Profil yadda saxlanıldı');
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Profili yadda saxlamaq mümkün olmadı');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearOverrides = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await agentsApi.updateMyProfile(tenantId, {
        display_name: null,
        clear_avatar: true,
      });
      setProfile(response.data);
      setDisplayName('');
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSuccess('Profil sıfırlandı');
    } catch (err) {
      console.error('Failed to clear overrides:', err);
      setError('Profili sıfırlamaq mümkün olmadı');
    } finally {
      setIsSaving(false);
    }
  };

  const hasOverrides = displayName || avatarPreview || avatarFile;
  const previewName = displayName || profile?.real_name || '';
  const previewAvatar = avatarPreview || profile?.real_avatar || '';

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
            <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-base font-medium text-gray-900 dark:text-white">Profil Ayarları</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Bu workspace üçün görünən ad və avatar</p>
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

        {/* Preview */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Önizləmə</h2>
          <div className="flex items-center gap-3">
            {previewAvatar ? (
              <img
                src={previewAvatar}
                alt={previewName}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-medium text-lg">
                  {previewName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{previewName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{profile?.email}</div>
            </div>
          </div>
          {hasOverrides && (
            <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
              Xüsusi görünüş istifadə edilir
            </div>
          )}
        </div>

        {/* Real Values Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Kimlik.az-dan gələn məlumatlar</h3>
          <div className="flex items-center gap-3">
            {profile?.real_avatar ? (
              <img
                src={profile.real_avatar}
                alt={profile?.real_name || ''}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                  {profile?.real_name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-sm text-gray-700 dark:text-gray-300">{profile?.real_name}</div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Xüsusi Görünüş</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Bu workspace-də fərqli ad və ya avatar istifadə edin. Boş buraxsanız, Kimlik.az məlumatları göstəriləcək.
          </p>

          <div className="space-y-4">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avatar
              </label>
              <div className="flex items-center gap-4">
                {/* Current/Preview Avatar */}
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  {avatarPreview && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                      title="Avatarı sil"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Upload Button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Şəkil yüklə
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    JPG, PNG, GIF, WEBP (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Görünən Ad
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setSuccess(null);
                }}
                placeholder={profile?.real_name || 'Ad daxil edin'}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {hasOverrides && (
            <button
              onClick={handleClearOverrides}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Sıfırla
            </button>
          )}
          <div className={cn(!hasOverrides && 'ml-auto')}>
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

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-3">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Bu ayarlar yalnız bu workspace-ə aiddir. Ziyarətçilər sizin xüsusi görünüşünüzü görəcəklər.
          </p>
        </div>
      </div>
    </div>
  );
}
