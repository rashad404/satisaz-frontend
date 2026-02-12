"use client";

import { useState, useEffect } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import { contactsApi } from '@/lib/api/chat';
import { TagInput } from './TagInput';
import type { ChatContact, ContactStage, CreateContactData, CreateContactFromConversationData } from '@/lib/types/chat';

interface ContactFormProps {
  tenantId: number;
  onClose: () => void;
  onSaved: (contact: ChatContact) => void;
  // Pre-fill from conversation
  conversationId?: number;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  // Edit mode
  contact?: ChatContact;
}

export function ContactForm({ tenantId, onClose, onSaved, conversationId, prefill, contact }: ContactFormProps) {
  const isEdit = !!contact;

  const [name, setName] = useState(contact?.name || prefill?.name || '');
  const [email, setEmail] = useState(contact?.email || prefill?.email || '');
  const [phone, setPhone] = useState(contact?.phone || prefill?.phone || '');
  const [stage, setStage] = useState<ContactStage>(contact?.stage || 'potential');
  const [tags, setTags] = useState<string[]>(contact?.tags || []);
  const [notes, setNotes] = useState(contact?.notes || '');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    contactsApi.tags(tenantId).then((res) => {
      setTagSuggestions(res.data);
    }).catch(() => {});
  }, [tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let result: ChatContact;

      if (isEdit && contact) {
        const res = await contactsApi.update(tenantId, contact.id, {
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
          stage,
          tags,
          notes: notes || undefined,
        });
        result = res.data;
      } else if (conversationId) {
        const data: CreateContactFromConversationData = {
          conversation_id: conversationId,
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
          stage,
          tags,
          notes: notes || undefined,
        };
        const res = await contactsApi.fromConversation(tenantId, data);
        result = res.data;
      } else {
        const data: CreateContactData = {
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
          stage,
          tags,
          notes: notes || undefined,
        };
        const res = await contactsApi.create(tenantId, data);
        result = res.data;
      }

      onSaved(result);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { status: number; data?: { message?: string } } };
      if (error.response?.status === 409) {
        setError('A contact already exists for this visitor');
      } else {
        setError(error.response?.data?.message || 'Failed to save contact');
      }
    } finally {
      setSaving(false);
    }
  };

  const stages: { value: ContactStage; label: string; color: string }[] = [
    { value: 'potential', label: 'Potential', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
    { value: 'qualified', label: 'Qualified', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' },
    { value: 'customer', label: 'Customer', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
    { value: 'lost', label: 'Lost', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {isEdit ? 'Edit Contact' : conversationId ? 'Save as Contact' : 'New Contact'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+994..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
            <div className="flex gap-2">
              {stages.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStage(s.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    stage === s.value
                      ? s.color + ' ring-2 ring-purple-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
            <TagInput tags={tags} onChange={setTags} suggestions={tagSuggestions} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Add notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? 'Update' : 'Save Contact'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
