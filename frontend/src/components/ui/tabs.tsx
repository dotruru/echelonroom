import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}) => {
  const [internalValue, setInternalValue] = React.useState(() => defaultValue ?? value ?? '');

  React.useEffect(() => {
    if (value === undefined && defaultValue !== undefined) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, value]);

  const currentValue = value ?? internalValue;

  const setValue = React.useCallback(
    (next: string) => {
      if (value === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [value, onValueChange]
  );

  const contextValue = React.useMemo(
    () => ({
      value: currentValue,
      setValue,
    }),
    [currentValue, setValue]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-sm border border-primary/30 bg-black/40 p-1',
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) {
      throw new Error('TabsTrigger must be used within Tabs');
    }
    const isActive = context.value === value;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex-1 rounded-sm px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
          isActive
            ? 'bg-primary/30 text-primary border border-primary/40 shadow-cyber'
            : 'border border-transparent text-foreground/70 hover:bg-primary/10 hover:text-primary',
          className
        )}
        onClick={() => context.setValue(value)}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) {
      throw new Error('TabsContent must be used within Tabs');
    }

    if (context.value !== value) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn('mt-4 focus-visible:outline-none', className)}
        {...props}
      />
    );
  }
);
TabsContent.displayName = 'TabsContent';
