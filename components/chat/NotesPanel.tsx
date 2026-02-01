"use client";

import { useState, useEffect, useCallback } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { notesApi } from '@/lib/api/chat';
import { StickyNote, Trash2, Send, X, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConversationNote } from '@/lib/types/chat';

interface NotesPanelProps {
  onClose: () => void;
}

export function NotesPanel({ onClose }: NotesPanelProps) {
  const { activeConversation, tenant, currentUserId } = useChat();
  const [notes, setNotes] = useState<ConversationNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!tenant || !activeConversation) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await notesApi.list(tenant.id, activeConversation.id);
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenant, activeConversation]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !activeConversation || !newNote.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await notesApi.create(tenant.id, activeConversation.id, newNote.trim());
      setNotes([response.data, ...notes]);
      setNewNote('');
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!tenant || !activeConversation || deletingId) return;

    setDeletingId(noteId);
    try {
      await notesApi.delete(tenant.id, activeConversation.id, noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!activeConversation) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          {/* Back button on mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <StickyNote className="h-5 w-5 text-amber-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Notes
            {notes.length > 0 && (
              <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
                ({notes.length})
              </span>
            )}
          </h3>
        </div>
        {/* Close button on desktop */}
        <button
          onClick={onClose}
          className="hidden md:block p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <StickyNote className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">Add a note to keep track of important info</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {note.agent?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {note.agent?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(note.created_at)}
                    </p>
                  </div>
                </div>
                {currentUserId === note.agent_id && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingId === note.id}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                  >
                    {deletingId === note.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Note Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex gap-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            className={cn(
              "flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
              "placeholder-gray-400 dark:placeholder-gray-500",
              "p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            )}
          />
          <button
            type="submit"
            disabled={!newNote.trim() || isSubmitting}
            className={cn(
              "px-3 py-2.5 rounded-lg transition-colors self-end flex-shrink-0",
              "bg-purple-600 text-white hover:bg-purple-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NotesPanel;
