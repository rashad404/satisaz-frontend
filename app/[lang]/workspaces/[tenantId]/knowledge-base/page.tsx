"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { knowledgeBaseApi } from '@/lib/api/chat';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  HelpCircle,
  Link,
  Trash2,
  Edit2,
  Loader2,
  X,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import type { KnowledgeBaseItem, CreateKnowledgeBaseItemData } from '@/lib/types/chat';

const CONTENT_TYPES = [
  { value: 'faq', label: 'FAQ', icon: HelpCircle, description: 'Question and answer pairs' },
  { value: 'document', label: 'Document', icon: FileText, description: 'General documentation' },
  { value: 'url', label: 'URL', icon: Link, description: 'External reference link' },
];

export default function KnowledgeBasePage() {
  const params = useParams();
  const tenantId = Number(params.tenantId);

  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userRole, setUserRole] = useState<'admin' | 'agent' | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Check if user can edit (admin or owner only)
  const canEdit = userRole === 'admin' || isOwner;

  // Fetch user role
  useEffect(() => {
    const fetchRole = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenantId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.data.role);
          setIsOwner(data.data.is_owner);
        }
      } catch (err) {
        console.error('Failed to fetch tenant role:', err);
      }
    };

    fetchRole();
  }, [tenantId]);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeBaseItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<CreateKnowledgeBaseItemData>({
    title: '',
    content: '',
    content_type: 'faq',
    source_url: '',
    is_active: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | boolean> = {};
      if (searchQuery) params.search = searchQuery;
      if (typeFilter !== 'all') params.type = typeFilter;

      const response = await knowledgeBaseApi.list(tenantId, params as { search?: string; type?: string });
      // Handle both array and paginated response
      const itemsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setItems(itemsData);
    } catch (err) {
      console.error('Failed to load knowledge base:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [tenantId, searchQuery, typeFilter]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      content_type: 'faq',
      source_url: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (item: KnowledgeBaseItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      content_type: item.content_type,
      source_url: item.source_url || '',
      is_active: item.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (editingItem) {
        await knowledgeBaseApi.update(tenantId, editingItem.id, formData);
        setSuccess('Item updated successfully');
      } else {
        await knowledgeBaseApi.create(tenantId, formData);
        setSuccess('Item created successfully');
      }
      setShowModal(false);
      await loadItems();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save item';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: KnowledgeBaseItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return;
    }

    try {
      await knowledgeBaseApi.delete(tenantId, item.id);
      setSuccess('Item deleted successfully');
      await loadItems();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      setError(message);
    }
  };

  const handleToggleActive = async (item: KnowledgeBaseItem) => {
    try {
      await knowledgeBaseApi.update(tenantId, item.id, { is_active: !item.is_active });
      await loadItems();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      setError(message);
    }
  };

  const getTypeIcon = (type: string) => {
    const config = CONTENT_TYPES.find((t) => t.value === type);
    return config?.icon || FileText;
  };

  const filteredItems = items.filter((item) => {
    if (typeFilter !== 'all' && item.content_type !== typeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h1 className="text-base font-medium text-gray-900 dark:text-white">Knowledge Base</h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({items.length})
            </span>
          </div>

          {canEdit && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
            <button onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              {success}
            </div>
            <button onClick={() => setSuccess(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setTypeFilter('all')}
              className={cn(
                'px-2.5 py-1.5 text-xs rounded-md transition-colors',
                typeFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              All
            </button>
            {CONTENT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setTypeFilter(type.value)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors',
                    typeFilter === type.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Items List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No items found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : canEdit
                  ? 'Add your first knowledge base item to help AI provide better responses'
                  : 'No knowledge base items have been added yet'}
            </p>
            {!searchQuery && typeFilter === 'all' && canEdit && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add First Item
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const TypeIcon = getTypeIcon(item.content_type);
              return (
                <div
                  key={item.id}
                  className={cn(
                    'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3',
                    !item.is_active && 'opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div
                        className={cn(
                          'p-1.5 rounded flex-shrink-0',
                          item.content_type === 'faq'
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                            : item.content_type === 'document'
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                            : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
                        )}
                      >
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                          {item.content}
                        </p>
                        {item.source_url && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mt-1 inline-block"
                          >
                            {item.source_url}
                          </a>
                        )}
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={cn(
                            'p-1 rounded transition-colors',
                            item.is_active
                              ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50'
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          )}
                          title={item.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {item.is_active ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-gray-900 dark:text-white">
                {editingItem ? 'Edit Item' : 'Add Item'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {CONTENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, content_type: type.value as 'faq' | 'document' | 'url' })}
                        className={cn(
                          'p-3 rounded-lg border-2 text-left transition-all',
                          formData.content_type === type.value
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5 mb-1',
                            formData.content_type === type.value
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-gray-500'
                          )}
                        />
                        <span
                          className={cn(
                            'block font-medium text-sm',
                            formData.content_type === type.value
                              ? 'text-purple-700 dark:text-purple-300'
                              : 'text-gray-700 dark:text-gray-300'
                          )}
                        >
                          {type.label}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {type.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={formData.content_type === 'faq' ? 'Question...' : 'Title...'}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={formData.content_type === 'faq' ? 'Answer...' : 'Content...'}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Source URL (for URL type) */}
              {formData.content_type === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source URL
                  </label>
                  <input
                    type="url"
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                  Active (AI will use this item for responses)
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                    isSaving
                      ? 'bg-purple-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  )}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {editingItem ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
