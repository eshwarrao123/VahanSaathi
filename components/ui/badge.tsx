import React from 'react';
import { StepStatus, DocumentStatus } from '@/types';

interface BadgeProps {
  status?: StepStatus | DocumentStatus | 'disclaimer' | 'info';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status = 'info', children, className = '' }) => {
  const getBadgeStyleAndSymbol = () => {
    switch (status) {
      case 'completed':
      case 'verified':
        return {
          style: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: '✓',
        };
      case 'action_required':
      case 'required':
        return {
          style: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
          icon: '!',
        };
      case 'in_progress':
        return {
          style: 'bg-blue-50 text-blue-800 border-blue-300',
          icon: '•',
        };
      case 'disclaimer':
        return {
          style: 'bg-amber-100/80 text-amber-900 border-amber-300',
          icon: 'ℹ',
        };
      case 'pending':
      case 'optional':
      case 'info':
      default:
        return {
          style: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: '—',
        };
    }
  };

  const { style, icon } = getBadgeStyleAndSymbol();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${style} ${className}`}
    >
      <span aria-hidden="true" className="text-[11px] leading-none select-none font-bold">
        [{icon}]
      </span>
      <span>{children}</span>
    </span>
  );
};
