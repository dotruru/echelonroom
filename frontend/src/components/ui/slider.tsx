import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps {
  className?: string;
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  id?: string;
  disabled?: boolean;
  onValueChange?: (value: number[]) => void;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      id,
      disabled,
      onValueChange,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<number[]>(() => value ?? defaultValue ?? [Number(min)]);

    React.useEffect(() => {
      if (value === undefined && defaultValue !== undefined) {
        setInternalValue(defaultValue);
      }
    }, [defaultValue, value]);

    const currentValue = value ?? internalValue;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(event.target.value);
      if (value === undefined) {
        setInternalValue([next]);
      }
      onValueChange?.([next]);
    };

    return (
      <input
        ref={ref}
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue[0]}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'h-2 w-full cursor-pointer appearance-none rounded-sm bg-muted/40 accent-primary',
          className
        )}
      />
    );
  }
);

Slider.displayName = 'Slider';
