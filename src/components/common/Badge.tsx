import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  className?: string;
}
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className
}) => {
  const variants = {
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    info: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    neutral: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  };
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}>
      
      {children}
    </span>);

};