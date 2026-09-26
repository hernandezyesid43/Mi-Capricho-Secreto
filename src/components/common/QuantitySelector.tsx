import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  size = 'md'
}) => {
  const isSm = size === 'sm';

  return (
    <div className="inline-flex items-center gap-1.5 bg-rose-50/80 rounded-full p-1 border border-rose-200/80 shadow-2xs">
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= min}
        aria-label="Disminuir cantidad"
        className={`flex items-center justify-center rounded-full bg-white text-[#1A0D16] hover:bg-[#C02E62] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#1A0D16] transition-all duration-200 shadow-2xs active:scale-90 cursor-pointer ${
          isSm ? 'w-6 h-6' : 'w-7 h-7'
        }`}
      >
        <Minus className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </button>

      <span
        className={`font-bold font-mono tabular-nums text-center select-none text-[#1A0D16] ${
          isSm ? 'min-w-[1.25rem] text-xs' : 'min-w-[1.75rem] text-sm'
        }`}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= max}
        aria-label="Aumentar cantidad"
        className={`flex items-center justify-center rounded-full bg-white text-[#1A0D16] hover:bg-[#C02E62] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#1A0D16] transition-all duration-200 shadow-2xs active:scale-90 cursor-pointer ${
          isSm ? 'w-6 h-6' : 'w-7 h-7'
        }`}
      >
        <Plus className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </button>
    </div>
  );
};
