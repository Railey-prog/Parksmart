import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface StatusDropdownProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
}

const colorMap: Record<string, { pill: string; option: string; dot: string }> = {
  OPEN:     { pill: 'bg-rose-500/20 text-rose-300 border-rose-500/30',     option: 'text-rose-300 hover:bg-rose-500/20',     dot: 'bg-rose-400' },
  RESOLVED: { pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', option: 'text-emerald-300 hover:bg-emerald-500/20', dot: 'bg-emerald-400' },
};

const fallback = { pill: 'bg-white/10 text-slate-300 border-white/20', option: 'text-slate-300 hover:bg-white/10', dot: 'bg-slate-400' };

export const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, options, onChange, size = 'md' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = colorMap[value] ?? fallback;
  const px = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-lg border font-semibold transition-all focus:outline-none ${px} ${current.pill}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
        {value}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 z-50 min-w-[120px] rounded-xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden">
          {options.map((opt) => {
            const c = colorMap[opt.value] ?? fallback;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${c.option} ${opt.value === value ? 'bg-white/5' : ''}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                {opt.label}
                {opt.value === value && (
                  <span className="ml-auto text-xs opacity-60">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
