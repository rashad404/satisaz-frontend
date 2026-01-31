'use client';

import { cn } from '@/lib/utils';
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PricingCardProps {
  title: string;
  price: string;
  priceSubtext?: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  highlighted?: boolean;
  className?: string;
}

export function PricingCard({
  title,
  price,
  priceSubtext,
  features,
  ctaText,
  ctaHref,
  highlighted = false,
  className,
}: PricingCardProps) {
  return (
    <div className={cn(
      'relative rounded-2xl p-8 transition-all duration-300',
      highlighted
        ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl scale-105'
        : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
      className
    )}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white dark:bg-gray-900 rounded-full shadow-lg">
          <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Free Forever
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className={cn(
          'text-xl font-semibold mb-2',
          highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
        )}>
          {title}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className={cn(
            'text-4xl font-bold',
            highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
          )}>
            {price}
          </span>
          {priceSubtext && (
            <span className={cn(
              'text-sm',
              highlighted ? 'text-white/70' : 'text-gray-500'
            )}>
              {priceSubtext}
            </span>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <div className={cn(
              'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
              highlighted ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/30'
            )}>
              <Check className={cn(
                'w-3 h-3',
                highlighted ? 'text-white' : 'text-green-600 dark:text-green-400'
              )} />
            </div>
            <span className={cn(
              'text-sm',
              highlighted ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'
            )}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={cn(
          'block w-full py-3 px-6 rounded-lg font-semibold text-center transition-all',
          highlighted
            ? 'bg-white text-indigo-600 hover:bg-gray-100'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
        )}
      >
        {ctaText}
      </Link>
    </div>
  );
}
