import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, type, leftIcon, rightIcon, error, ...props }, ref) => {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-border-main bg-transparent px-4 py-2 text-sm text-text-main shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-main/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          error && "border-error focus-visible:ring-error",
          className
        )}
        ref={ref}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-main/50">
          {rightIcon}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
