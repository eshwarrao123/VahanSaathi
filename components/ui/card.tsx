import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', bordered = true, ...props }) => {
  return (
    <div
      className={`bg-white rounded-xl ${
        bordered ? 'border border-slate-200 shadow-sm' : ''
      } p-4 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
