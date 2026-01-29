"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { aiConfigApi } from '@/lib/api/chat';
import { cn } from '@/lib/utils';
import {
  Bot,
  Save,
  Loader2,
  Zap,
  MessageSquare,
  Settings2,
  TestTube,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { AiConfiguration, UpdateAiConfigData } from '@/lib/types/chat';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { value: 'claude', label: 'Anthropic Claude', models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'] },
  { value: 'gemini', label: 'Google Gemini', models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'] },
];

const DEFAULT_SYSTEM_PROMPT = `You are a helpful customer support assistant for our company. Your role is to:
- Answer customer questions accurately and helpfully
- Be friendly and professional in all interactions
- If you don't know the answer, honestly say so and offer to connect them with a human agent
- Keep responses concise but thorough`;

export default function AiConfigurationPage() {
  const params = useParams();
  const tenantId = Number(params.tenantId);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [isActive, setIsActive] = useState(false);
  const [provider, setProvider] = useState<'openai' | 'claude' | 'gemini'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);

  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState<{ response: string; model: string; tokens_used: number } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      try {
        const response = await aiConfigApi.get(tenantId);
        if (response.data) {
          const config = response.data;
          setIsActive(config.is_active);
          setProvider(config.provider);
          setModel(config.model);
          setSystemPrompt(config.system_prompt);
          setTemperature(config.temperature);
          setMaxTokens(config.max_tokens);
        }
      } catch (err) {
        console.error('Failed to load AI config:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, [tenantId]);

  const handleProviderChange = (newProvider: 'openai' | 'claude' | 'gemini') => {
    setProvider(newProvider);
    const providerConfig = PROVIDERS.find((p) => p.value === newProvider);
    if (providerConfig && providerConfig.models.length > 0) {
      setModel(providerConfig.models[0]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const data: UpdateAiConfigData = {
        provider,
        model,
        system_prompt: systemPrompt,
        temperature,
        max_tokens: maxTokens,
        is_active: isActive,
      };

      if (apiKey) {
        data.api_key = apiKey;
      }

      await aiConfigApi.update(tenantId, data);
      setSuccess('AI configuration saved successfully');
      setApiKey(''); // Clear API key after save
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save AI configuration';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testMessage.trim()) return;

    setIsTesting(true);
    setTestResponse(null);
    setTestError(null);

    try {
      const response = await aiConfigApi.test(tenantId, testMessage);
      setTestResponse(response.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Test failed';
      setTestError(message);
    } finally {
      setIsTesting(false);
    }
  };

  const currentProvider = PROVIDERS.find((p) => p.value === provider);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Configuration</h1>
              <p className="text-gray-500 dark:text-gray-400">Configure AI-powered chat responses</p>
            </div>
          </div>

          {/* Enable/Disable Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isActive ? 'Enabled' : 'Disabled'}
            </span>
            <div
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                isActive ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
              )}
              onClick={() => setIsActive(!isActive)}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  isActive ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </div>
          </label>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center gap-2">
            <Check className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Provider Selection */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Provider</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {PROVIDERS.map((p) => (
              <button
                key={p.value}
                onClick={() => handleProviderChange(p.value as 'openai' | 'claude' | 'gemini')}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  provider === p.value
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <span
                  className={cn(
                    'font-medium',
                    provider === p.value
                      ? 'text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* API Key & Model */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Credentials</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter new API key (leave blank to keep existing)"
                className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {currentProvider?.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* System Prompt */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Prompt</h2>
          </div>

          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Enter the system prompt that defines AI behavior..."
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This prompt sets the context and behavior for the AI. Include information about your business, tone, and guidelines.
          </p>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Settings</h2>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Temperature
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Focused (0)</span>
              <span>Balanced (1)</span>
              <span>Creative (2)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Tokens
            </label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              min={100}
              max={4000}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Maximum length of AI responses. Higher values allow longer responses but cost more.
            </p>
          </div>
        </div>

        {/* Test AI */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TestTube className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Test AI</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Test Message
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter a test message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                />
                <button
                  onClick={handleTest}
                  disabled={isTesting || !testMessage.trim()}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                    isTesting || !testMessage.trim()
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  )}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test'
                  )}
                </button>
              </div>
            </div>

            {testError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                {testError}
              </div>
            )}

            {testResponse && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Response</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {testResponse.model} | {testResponse.tokens_used} tokens
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{testResponse.response}</p>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors',
              isSaving
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            )}
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
