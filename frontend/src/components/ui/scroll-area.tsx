import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative overflow-auto [scrollbar-color:var(--primary)_transparent]', className)}
      {...props}
    >
      {children}
    </div>
  )
);

ScrollArea.displayName = 'ScrollArea';
