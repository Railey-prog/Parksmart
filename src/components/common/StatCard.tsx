import React from 'react';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className
}) => {
  return (
    <GlassCard className={clsx('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className="p-2 bg-white/5 rounded-lg text-indigo-400">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        {trend &&
        <div
          className={clsx(
            'flex items-center text-sm font-medium',
            trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
          )}>
          
            {trend.isPositive ?
          <TrendingUp className="w-4 h-4 mr-1" /> :

          <TrendingDown className="w-4 h-4 mr-1" />
          }
            {trend.value}%
          </div>
        }
      </div>
    </GlassCard>);

};