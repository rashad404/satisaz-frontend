"use client";

import { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChatProvider } from '@/contexts/ChatContext';
import { AgentStatusSelector } from '@/components/chat';
import {
  MessageSquare,
  Inbox,
  Users,
  Bot,
  BookOpen,
  Settings,
  Code,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const t = useTranslations();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const tenantId = Number(params.tenantId);
  const lang = params.lang as string;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to home page with login prompt
      router.push(`/${lang}?login=1`);
    } else {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, [lang, router]);

  // Close mobile menu when navigating (must be before early returns)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const basePath = `/${lang}/workspaces/${tenantId}`;

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: basePath,
      exact: true,
    },
    {
      label: 'Inbox',
      icon: Inbox,
      href: `${basePath}/inbox`,
      badge: undefined, // Could show unread count
    },
    {
      label: 'Conversations',
      icon: MessageSquare,
      href: `${basePath}/conversations`,
    },
    {
      label: 'Team',
      icon: Users,
      href: `${basePath}/team`,
    },
    {
      label: 'AI Configuration',
      icon: Bot,
      href: `${basePath}/ai`,
    },
    {
      label: 'Knowledge Base',
      icon: BookOpen,
      href: `${basePath}/knowledge-base`,
    },
    {
      label: 'Widget Settings',
      icon: Code,
      href: `${basePath}/widget`,
    },
    {
      label: 'Settings',
      icon: Settings,
      href: `${basePath}/settings`,
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <ChatProvider tenantId={tenantId}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
            sidebarCollapsed ? 'w-16' : 'w-64',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            {!sidebarCollapsed && (
              <Link href={`/${lang}`} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Satis.az</span>
              </Link>
            )}

            {/* Collapse button (desktop) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>

            {/* Close button (mobile) */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Status selector */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <AgentStatusSelector />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    active
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                    sidebarCollapsed && 'justify-center'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-600 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Back to workspaces */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-800">
            <Link
              href={`/${lang}/workspaces`}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                sidebarCollapsed && 'justify-center'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
              {!sidebarCollapsed && <span>All Workspaces</span>}
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header - minimal, just menu button */}
          <header className="lg:hidden flex items-center h-12 px-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200"
            >
              <Menu className="h-5 w-5" />
            </button>
            <AgentStatusSelector />
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </ChatProvider>
  );
}
