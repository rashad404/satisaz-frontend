'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoItem {
  name: string;
  src: string;
  width?: number;
  height?: number;
}

interface LogoBarProps {
  logos: LogoItem[];
  title?: string;
  className?: string;
}

export function LogoBar({ logos, title, className }: LogoBarProps) {
  return (
    <div className={cn('', className)}>
      {title && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          {title}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="relative h-8 w-24 md:w-28 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
          >
            <Image
              src={logo.src}
              alt={logo.name}
              fill
              className="object-contain dark:invert"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
