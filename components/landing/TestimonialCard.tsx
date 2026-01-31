'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TestimonialCardProps {
  quote: string;
  company: string;
  logo?: string;
  className?: string;
}

export function TestimonialCard({ quote, company, logo, className }: TestimonialCardProps) {
  return (
    <div className={cn(
      'p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow',
      className
    )}>
      <div className="flex items-center gap-3 mb-4">
        {logo && (
          <div className="relative w-8 h-8">
            <Image
              src={logo}
              alt={company}
              fill
              className="object-contain"
            />
          </div>
        )}
        <span className="font-semibold text-gray-900 dark:text-white">{company}</span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}
