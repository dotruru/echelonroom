import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary/20 text-primary',
  secondary: 'border-transparent bg-muted/30 text-foreground',
  outline: 'border border-primary/40 text-primary',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';
