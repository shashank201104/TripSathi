import React from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

const buttonVariants = {
  primary:
    "bg-accent text-bg font-semibold hover:brightness-110 shadow-glow border border-accent/20",
  secondary:
    "bg-surface-elevated text-text-primary border border-border hover:border-accent/30 hover:bg-accent-muted",
  success:
    "bg-success text-white hover:brightness-110 border border-success/20",
  danger: "bg-error text-white hover:brightness-110 border border-error/20",
  warning:
    "bg-warning text-bg hover:brightness-110 border border-warning/20",
  outline:
    "border border-border text-text-primary bg-transparent hover:bg-accent-muted hover:border-accent/40",
  ghost: "text-accent hover:bg-accent-muted border border-transparent",
};

const buttonSizes = {
  sm: "px-3 py-2 text-sm min-h-[44px]",
  md: "px-4 py-2 md:py-3 text-sm md:text-base min-h-[40px] md:min-h-[44px]",
  lg: "px-6 py-4 text-lg min-h-[56px]",
  xl: "px-8 py-4 text-xl min-h-[64px]",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  animate = true,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed";

  const classes = twMerge(
    baseClasses,
    buttonVariants[variant],
    buttonSizes[size],
    className
  );

  const ButtonComponent = animate ? motion.button : "button";

  const motionProps = animate
    ? {
        whileHover: { scale: disabled || loading ? 1 : 1.02 },
        whileTap: { scale: disabled || loading ? 1 : 0.98 },
        transition: { type: "spring", stiffness: 300, damping: 25 },
      }
    : {};

  return (
    <ButtonComponent
      className={classes}
      disabled={disabled || loading}
      {...motionProps}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {Icon && iconPosition === "left" && !loading && (
        <Icon className={`h-5 w-5 ${children ? "mr-2" : ""}`} />
      )}

      {children}

      {Icon && iconPosition === "right" && !loading && (
        <Icon className={`h-5 w-5 ${children ? "ml-2" : ""}`} />
      )}
    </ButtonComponent>
  );
};

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = "left",
  rightElement,
  className = "",
  wrapperClassName = "",
  ...props
}) => {
  const inputClasses = twMerge(
    "block w-full px-3 py-2 md:py-3 text-sm md:text-base border border-border rounded-md bg-surface-elevated text-text-primary shadow-sm placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-theme min-h-[40px] md:min-h-[44px]",
    error && "border-error/50 focus:ring-error/30 focus:border-error",
    Icon && iconPosition === "left" && "pl-8 md:pl-10",
    (Icon && iconPosition === "right") || rightElement ? "pr-10" : "",
    className
  );

  return (
    <div className={wrapperClassName}>
      {label && (
        <label className="block text-xs font-mono font-medium text-text-secondary uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 md:h-5 md:w-5 text-text-secondary" />
          </div>
        )}

        <input className={inputClasses} {...props} />

        {Icon && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 md:h-5 md:w-5 text-text-secondary" />
          </div>
        )}

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-text-secondary">{helperText}</p>
      )}
    </div>
  );
};

export const Card = ({
  children,
  className = "",
  padding = true,
  elevated = false,
  animate = true,
  ...props
}) => {
  const baseClasses = elevated
    ? "surface-card-elevated"
    : "surface-card";

  const classes = twMerge(baseClasses, padding && "p-6", className);

  const CardComponent = animate ? motion.div : "div";

  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <CardComponent className={classes} {...motionProps} {...props}>
      {children}
    </CardComponent>
  );
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}) => {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={twMerge(
            "inline-block align-bottom text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle w-full surface-card-elevated border-l-2 border-l-accent",
            sizeClasses[size]
          )}
        >
          {title && (
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-text-primary">
                {title}
              </h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-accent-muted transition-colors"
                  aria-label="Close"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          <div className="px-6 py-4">{children}</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div className={twMerge("flex justify-center items-center", className)}>
      <div
        className={twMerge(
          "animate-spin rounded-full border-2 border-border border-t-accent",
          sizeClasses[size]
        )}
      />
    </div>
  );
};

export const Badge = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
}) => {
  const variantClasses = {
    primary: "bg-accent-muted text-accent border border-accent/20",
    secondary: "bg-surface-elevated text-text-secondary border border-border",
    success: "bg-success-muted text-success border border-success/20",
    danger: "bg-error-muted text-error border border-error/20",
    warning: "bg-warning-muted text-warning border border-warning/20",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={twMerge(
        "inline-flex items-center font-mono font-medium rounded-full",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const Skeleton = ({ className = "", animate = true }) => {
  return (
    <div
      className={twMerge(
        "rounded-md",
        animate ? "skeleton-shimmer" : "bg-surface-elevated",
        className
      )}
    />
  );
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) => (
  <div className={twMerge("text-center py-12 px-4", className)}>
    {Icon && (
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent-muted mb-4">
        <Icon className="h-8 w-8 text-accent" />
      </div>
    )}
    <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
        {description}
      </p>
    )}
    {action}
  </div>
);

export const PageHeader = ({ title, subtitle, badge, actions, className = "" }) => (
  <div className={twMerge("mb-6 md:mb-8", className)}>
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm md:text-base text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  </div>
);

export { default as ThemeToggle } from "./ThemeToggle";
