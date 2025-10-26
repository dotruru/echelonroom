import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DialogContextValue {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

export interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {open ? children : null}
    </DialogContext.Provider>
  );
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onInteractOutside?: (event: Event) => void;
}

export function DialogContent({ className, onInteractOutside, children, ...props }: DialogContentProps) {
  const context = React.useContext(DialogContext);
  const [mounted, setMounted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  if (!context?.open || !mounted) {
    return null;
  }

  if (typeof document === 'undefined') {
    return null;
  }

  if (!containerRef.current) {
    containerRef.current = document.createElement('div');
    document.body.appendChild(containerRef.current);
  }

  React.useEffect(() => {
    const container = containerRef.current;
    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      containerRef.current = null;
    };
  }, []);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onInteractOutside?.(event.nativeEvent);
      context.onOpenChange?.(false);
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onMouseDown={handleOverlayClick}
    >
      <div
        className={cn(
          'relative w-full max-w-lg rounded-sm border border-primary/40 bg-card/95 p-6 shadow-cyber',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(content, containerRef.current);
}

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 space-y-1', className)} {...props} />
);

export const DialogTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn('text-lg font-semibold uppercase tracking-wider text-primary', className)} {...props} />
);

export const DialogDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-xs uppercase tracking-widest text-muted-foreground', className)} {...props} />
);
