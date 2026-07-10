import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  leftIcon, 
  rightIcon, 
  children, 
  disabled, 
  ...props 
}, ref) => {
  
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20",
    secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-sm shadow-secondary/20",
    outline: "border-2 border-border-main text-text-main hover:bg-border-main/50",
    ghost: "text-text-main hover:bg-border-main/50",
    danger: "bg-error text-white hover:bg-error/90",
  };
  
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
    icon: "h-11 w-11",
  };

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
});

Button.displayName = 'Button';
export { Button };
