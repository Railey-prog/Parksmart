import React from 'react';
import { Slot } from '../../types';
import { clsx } from 'clsx';
import { Car, Zap, Accessibility } from 'lucide-react';
interface SlotCellProps {
  slot: Slot;
  onClick?: (slot: Slot) => void;
  interactive?: boolean;
}
export const SlotCell: React.FC<SlotCellProps> = ({
  slot,
  onClick,
  interactive = true
}) => {
  const getStatusStyles = () => {
    switch (slot.status) {
      case 'AVAILABLE':
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30';
      case 'OCCUPIED':
        return 'bg-rose-500/20 border-rose-500/50 text-rose-300';
      case 'RESERVED':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
      case 'MAINTENANCE':
        return 'bg-slate-700/50 border-slate-500/50 text-slate-400';
      default:
        return 'bg-white/10 border-white/20 text-white';
    }
  };
  const isClickable = interactive && slot.status === 'AVAILABLE';
  return (
    <div
      onClick={() => isClickable && onClick?.(slot)}
      className={clsx(
        'relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-300 h-24',
        getStatusStyles(),
        isClickable ?
        'cursor-pointer transform hover:scale-105 hover:shadow-lg' :
        'cursor-not-allowed opacity-80'
      )}>
      
      <span className="text-xs font-bold mb-1">{slot.name}</span>

      {slot.status === 'OCCUPIED' && <Car className="w-6 h-6 mb-1" />}
      {slot.status === 'RESERVED' &&
      <div className="w-6 h-6 mb-1 flex items-center justify-center text-xs font-bold">
          RES
        </div>
      }

      <div className="absolute bottom-1 flex gap-1">
        {slot.isEV && <Zap className="w-3 h-3 text-cyan-400" />}
        {slot.isAccessible &&
        <Accessibility className="w-3 h-3 text-blue-400" />
        }
      </div>
    </div>);

};