import type { ReactNode } from 'react';

export type ViewToggleOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type ViewToggleProps<T extends string> = {
  value: T;
  options: ViewToggleOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
};

export function ViewToggle<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: ViewToggleProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/40 p-1"
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}