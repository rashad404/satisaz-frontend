"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Hide header and footer on workspace/dashboard pages
  const isWorkspacePage = pathname?.includes('/workspaces');

  if (isWorkspacePage) {
    // Workspace pages have their own layout with sidebar
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
