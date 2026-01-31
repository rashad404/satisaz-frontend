'use client';

import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
  labelColor?: 'indigo' | 'purple' | 'pink' | 'green';
}

export function SectionHeader({
  label,
  title,
  description,
  centered = true,
  className,
  labelColor = 'indigo',
}: SectionHeaderProps) {
  const labelColors = {
    indigo: 'text-indigo-600 dark:text-indigo-400',
    purple: 'text-purple-600 dark:text-purple-400',
    pink: 'text-pink-600 dark:text-pink-400',
    green: 'text-green-600 dark:text-green-400',
  };

  return (
    <div className={cn(centered && 'text-center', 'mb-12', className)}>
      {label && (
        <span className={cn('text-sm font-medium uppercase tracking-wider', labelColors[labelColor])}>
          {label}
        </span>
      )}
      <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
