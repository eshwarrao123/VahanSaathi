import React from 'react';

interface AlertProps {
  type?: 'disclaimer' | 'info' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'disclaimer',
  title,
  children,
  className = '',
}) => {
  const styles = {
    disclaimer: 'bg-amber-50/90 border-amber-200 text-amber-900',
    info: 'bg-slate-100 border-slate-300 text-slate-800',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <div
      role="region"
      aria-label={title || 'Notice'}
      className={`p-3.5 sm:p-4 rounded-lg border text-xs sm:text-sm leading-relaxed ${styles[type]} ${className}`}
    >
      {title && <div className="font-semibold mb-1 text-sm">{title}</div>}
      <div>{children}</div>
    </div>
  );
};
