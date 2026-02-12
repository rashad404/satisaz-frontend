"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { contactsApi } from '@/lib/api/chat';
import { ContactDetail } from './components/ContactDetail';
import { ContactForm } from './components/ContactForm';
import { cn } from '@/lib/utils';
import { PageGuide } from '@/components/ui/PageGuide';
import {
  Users,
  Search,
  Loader2,
  User,
  Plus,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  Tag,
  X,
  UserCheck,
  MessageSquare,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import type { ChatContact, ContactStage, ContactFilters } from '@/lib/types/chat';

const stageBadge: Record<ContactStage, { label: string; className: string }> = {
  potential: { label: 'Potential', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  qualified: { label: 'Qualified', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' },
  customer: { label: 'Customer', className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
  lost: { label: 'Lost', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

const stages: (ContactStage | 'all')[] = ['all', 'potential', 'qualified', 'customer', 'lost'];

export default function ContactsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantId = Number(params.tenantId);

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStage, setActiveStage] = useState<ContactStage | 'all'>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });

  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Auto-select contact from ?id= param (e.g. from "Show Contact" link in inbox)
  useEffect(() => {
    const contactId = searchParams.get('id');
    if (contactId) {
      contactsApi.get(tenantId, Number(contactId))
        .then((res) => setSelectedContact(res.data))
        .catch(() => {});
    }
  }, [tenantId, searchParams]);

  // Load available tags
  useEffect(() => {
    contactsApi.tags(tenantId).then((res) => setAllTags(res.data)).catch(() => {});
  }, [tenantId]);

  const loadContacts = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const filters: Record<string, string | number> = { per_page: 20, page };
      if (searchQuery) filters.search = searchQuery;
      if (activeStage !== 'all') filters.stage = activeStage;
      if (activeTag) filters.tag = activeTag;

      const response = await contactsApi.list(tenantId, filters as ContactFilters);
      setContacts(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
      });
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, searchQuery, activeStage, activeTag]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleContactUpdated = (updated: ChatContact) => {
    setContacts((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    setSelectedContact(updated);
  };

  const handleContactDeleted = (id: number) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setSelectedContact(null);
  };

  const handleContactCreated = (contact: ChatContact) => {
    setContacts((prev) => [contact, ...prev]);
    // Refresh tags in case new ones were added
    contactsApi.tags(tenantId).then((res) => setAllTags(res.data)).catch(() => {});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 1) return 'Today';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full flex">
      {/* Contacts List */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0 border-r border-gray-200 dark:border-gray-800',
        selectedContact && 'hidden lg:flex'
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h1 className="text-base font-medium text-gray-900 dark:text-white">Contacts</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">({pagination.total})</span>
              <PageGuide
                storageKey="contacts"
                title="Kontaktlar - İstifadə Qaydası"
                description="Bu səhifə bütün müştərilərinizi bir yerdə idarə etmək üçündür. Söhbətdən gələn, əllə əlavə edilən və ya import olunan müştəriləri burada izləyin. Mərhələlərlə satış prosesini, teqlərlə qruplaşdırmanı və qeydlərlə ətraflı məlumatı asanlıqla idarə edin."
                steps={[
                  {
                    icon: <MessageSquare className="h-4.5 w-4.5" />,
                    title: 'Söhbətdən kontakt yaradın',
                    description: 'Inbox səhifəsində müştəri ilə danışıq zamanı yuxarıdakı "Save Contact" düyməsinə basın. Müştərinin adı, emaili və telefonu avtomatik doldurulacaq.',
                  },
                  {
                    icon: <Plus className="h-4.5 w-4.5" />,
                    title: 'Əllə kontakt əlavə edin',
                    description: '"Add" düyməsinə basaraq yeni kontakt yarada bilərsiniz. Ad, email, telefon, mərhələ və teqlər əlavə edin.',
                  },
                  {
                    icon: <SlidersHorizontal className="h-4.5 w-4.5" />,
                    title: 'Mərhələləri idarə edin',
                    description: 'Hər kontaktın 4 mərhələsi var: Potential (maraqlanır), Qualified (ciddi müştəri), Customer (satış olub), Lost (itirilmiş). Kontaktın detallarına daxil olub mərhələni dəyişə bilərsiniz.',
                  },
                  {
                    icon: <Tag className="h-4.5 w-4.5" />,
                    title: 'Teqlərlə qruplaşdırın',
                    description: 'Kontaktlara teqlər əlavə edin (məs: "hosting", "domain", "VIP"). Sonra teqlərə görə filterləyin.',
                  },
                  {
                    icon: <UserCheck className="h-4.5 w-4.5" />,
                    title: 'Avtomatik bağlantı',
                    description: 'Kontakt yaradıldıqdan sonra, həmin müştəridən gələn yeni söhbətlər avtomatik olaraq bu kontakta bağlanacaq.',
                  },
                  {
                    icon: <Sparkles className="h-4.5 w-4.5" />,
                    title: 'Məsləhət',
                    description: 'Hər potensial müştəri ilə söhbət edəndə onu kontakt kimi saxlayın. Beləliklə, heç bir müştəri itirilməz.',
                  },
                ]}
              />
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Stage Tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {stages.map((s) => (
              <button
                key={s}
                onClick={() => setActiveStage(s)}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                  activeStage === s
                    ? s === 'all'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : stageBadge[s].className
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {s === 'all' ? 'All' : stageBadge[s].label}
              </button>
            ))}
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <Tag className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md transition-colors cursor-pointer',
                    activeTag === tag
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/70'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  {tag}
                  {activeTag === tag && <X className="h-3 w-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Users className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No contacts found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || activeStage !== 'all' || activeTag
                  ? 'Try adjusting your filters'
                  : 'Save contacts from conversations or add them manually'}
              </p>
              {!searchQuery && activeStage === 'all' && !activeTag && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add your first contact
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {contacts.map((contact) => {
                const badge = stageBadge[contact.stage];
                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={cn(
                      'w-full p-3 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                      selectedContact?.id === contact.id && 'bg-purple-50 dark:bg-purple-900/20'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {contact.name || contact.email || 'Unnamed'}
                          </span>
                          <span className={cn('px-1.5 py-0.5 text-[10px] font-medium rounded', badge.className)}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {contact.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              {contact.email}
                            </span>
                          )}
                          {contact.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              {contact.phone}
                            </span>
                          )}
                        </div>

                        {contact.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {contact.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {contact.tags.length > 3 && (
                              <span className="text-[10px] text-gray-400">+{contact.tags.length - 3}</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {formatDate(contact.created_at)}
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => loadContacts(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                {pagination.currentPage} / {pagination.lastPage}
              </span>
              <button
                onClick={() => loadContacts(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage}
                className="px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedContact && (
        <ContactDetail
          contact={selectedContact}
          tenantId={tenantId}
          onClose={() => setSelectedContact(null)}
          onUpdated={handleContactUpdated}
          onDeleted={handleContactDeleted}
        />
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <ContactForm
          tenantId={tenantId}
          onClose={() => setShowCreateForm(false)}
          onSaved={handleContactCreated}
        />
      )}
    </div>
  );
}
