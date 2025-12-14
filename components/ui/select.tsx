import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  onValueChange?: (value: any) => void;
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, helperText, options = [], placeholder, onValueChange, children, ...props },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value);
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="w-full group">
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-2 transition-colors group-focus-within:text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              'flex h-11 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm text-foreground',
              'ring-offset-background',
              'placeholder:text-muted-foreground/60',
              'transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:shadow-lg focus-visible:shadow-primary/10',
              'hover:border-primary/50 hover:shadow-md',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'appearance-none cursor-pointer',
              error &&
                'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive hover:border-destructive/50',
              className
            )}
            ref={ref}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled selected>
                {placeholder}
              </option>
            )}
            {children}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-muted-foreground opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {error && (
          <p className="mt-2 text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('overflow-hidden', className)} {...props} />
  )
);

SelectGroup.displayName = 'SelectGroup';

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder = 'Select an option...', className, ...props }, ref) => (
    <span ref={ref} className={cn('text-muted-foreground', className)} {...props}>
      {placeholder}
    </span>
  )
);

SelectValue.displayName = 'SelectValue';

interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string;
  label?: string;
  children?: React.ReactNode;
}

export const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ value, label, children, ...props }, ref) => (
    <option ref={ref} value={value} {...props}>
      {children || label}
    </option>
  )
);

SelectItem.displayName = 'SelectItem';

export const SelectTrigger = Select;
export const SelectContent = SelectGroup;
