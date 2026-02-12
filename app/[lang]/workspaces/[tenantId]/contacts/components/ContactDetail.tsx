"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { contactsApi } from '@/lib/api/chat';
import { ContactForm } from './ContactForm';
import {
  X,
  Mail,
  Phone,
  User,
  Pencil,
  Trash2,
  Clock,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatContact, ContactStage } from '@/lib/types/chat';

interface ContactDetailProps {
  contact: ChatContact;
  tenantId: number;
  onClose: () => void;
  onUpdated: (contact: ChatContact) => void;
  onDeleted: (id: number) => void;
}

const stageBadge: Record<ContactStage, { label: string; className: string }> = {
  potential: { label: 'Potential', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  qualified: { label: 'Qualified', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' },
  customer: { label: 'Customer', className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
  lost: { label: 'Lost', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

export function ContactDetail({ contact, tenantId, onClose, onUpdated, onDeleted }: ContactDetailProps) {
  const params = useParams();
  const lang = params.lang as string;
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await contactsApi.delete(tenantId, contact.id);
      onDeleted(contact.id);
    } catch (err) {
      console.error('Failed to delete contact:', err);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleStageChange = async (newStage: ContactStage) => {
    try {
      const res = await contactsApi.update(tenantId, contact.id, { stage: newStage });
      onUpdated(res.data);
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const badge = stageBadge[contact.stage];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <>
      <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">Contact Details</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowEdit(true)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Profile */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {contact.name || contact.email || 'Unnamed'}
              </h3>
              <span className={cn('inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded', badge.className)}>
                {badge.label}
              </span>
            </div>
          </div>

          {/* Stage buttons */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Stage</h4>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(stageBadge) as ContactStage[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStageChange(s)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                    contact.stage === s
                      ? stageBadge[s].className + ' ring-2 ring-purple-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {stageBadge[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact Info</h4>
            {contact.email && (
              <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                {contact.email}
              </p>
            )}
            {contact.phone && (
              <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                {contact.phone}
              </p>
            )}
            {!contact.email && !contact.phone && (
              <p className="text-sm text-gray-500 italic">No contact info</p>
            )}
          </div>

          {/* Tags */}
          {contact.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Notes</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          {/* Assigned Agent */}
          {contact.assigned_agent && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Assigned To</h4>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-gray-900 dark:text-white">{contact.assigned_agent.name}</span>
              </div>
            </div>
          )}

          {/* Source Conversation */}
          {contact.source_conversation_id && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Source</h4>
              <Link
                href={`/${lang}/workspaces/${tenantId}/inbox?conversation=${contact.source_conversation_id}`}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-purple-600 dark:text-purple-400">View conversation #{contact.source_conversation_id}</span>
              </Link>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <p className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Created {formatDate(contact.created_at)}
            </p>
            {contact.converted_at && (
              <p>Converted on {formatDate(contact.converted_at)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <ContactForm
          tenantId={tenantId}
          contact={contact}
          onClose={() => setShowEdit(false)}
          onSaved={onUpdated}
        />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6 m-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Contact</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to delete this contact? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
