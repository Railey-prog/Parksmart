import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';
interface CountdownTimerProps {
  endTime: string;
  onExpire?: () => void;
}
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  onExpire
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      return Math.max(0, Math.floor(difference / 1000));
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft === 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime, onExpire]);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = minutes < 5;
  const isCritical = minutes < 1;
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold transition-colors',
        isCritical ?
        'bg-rose-500/20 text-rose-400 animate-pulse' :
        isWarning ?
        'bg-amber-500/20 text-amber-400' :
        'bg-indigo-500/20 text-indigo-300'
      )}>
      
      <Clock className="w-5 h-5" />
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>);

};