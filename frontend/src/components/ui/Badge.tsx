import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pending' | 'verified' | 'assigned' | 'dispatched' | 'completed' | 'cancelled' | 'low' | 'medium' | 'high' | 'available' | 'busy' | 'very_busy';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'pending', className = '' }) => {
  let styleClasses = 'badge-pending';

  switch (variant) {
    case 'pending':
      styleClasses = 'badge-pending';
      break;
    case 'verified':
      styleClasses = 'badge-verified';
      break;
    case 'assigned':
      styleClasses = 'badge-assigned';
      break;
    case 'dispatched':
      styleClasses = 'badge-dispatched';
      break;
    case 'completed':
      styleClasses = 'badge-completed';
      break;
    case 'cancelled':
      styleClasses = 'badge-cancelled';
      break;
    case 'low':
    case 'available':
      styleClasses = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      break;
    case 'medium':
    case 'busy':
      styleClasses = 'bg-amber-100 text-amber-900 border border-amber-300';
      break;
    case 'high':
    case 'very_busy':
      styleClasses = 'bg-orange-100 text-orange-900 border border-orange-400 font-semibold';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styleClasses} ${className}`}
    >
      {children}
    </span>
  );
};
