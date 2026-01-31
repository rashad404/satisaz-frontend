'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: string | number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  colorClass?: string;
}

export function AnimatedCounter({
  value,
  label,
  prefix = '',
  suffix = '',
  className,
  colorClass = 'text-indigo-600 dark:text-indigo-400',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated && typeof value === 'number') {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          const stepValue = value / steps;
          let current = 0;

          const interval = setInterval(() => {
            current += stepValue;
            if (current >= value) {
              setDisplayValue(value);
              clearInterval(interval);
            } else {
              setDisplayValue(Math.round(current));
            }
          }, duration / steps);

          return () => clearInterval(interval);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={ref} className={cn('text-center', className)}>
      <div className={cn('text-3xl md:text-4xl font-bold', colorClass)}>
        {prefix}{displayValue}{suffix}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {label}
      </div>
    </div>
  );
}
