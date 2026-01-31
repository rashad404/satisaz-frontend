'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface FeatureShowcaseProps {
  title: string;
  description?: string;
  features: string[];
  visual: React.ReactNode;
  reversed?: boolean;
  className?: string;
}

export function FeatureShowcase({
  title,
  description,
  features,
  visual,
  reversed = false,
  className,
}: FeatureShowcaseProps) {
  return (
    <div className={cn(
      'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center',
      reversed && 'lg:[&>*:first-child]:order-2',
      className
    )}>
      {/* Text Content */}
      <div className="space-y-6">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Visual */}
      <div className="relative">
        {visual}
      </div>
    </div>
  );
}
