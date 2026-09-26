import React from 'react';

interface ElegantInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const ElegantInput: React.FC<ElegantInputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      <label htmlFor={inputId} className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-[#1A0D16] placeholder:text-stone-400 focus:outline-none focus:border-[#C02E62] focus:ring-2 focus:ring-[#C02E62]/20 transition-all duration-200 ${
          error ? 'border-red-400 bg-red-50/20' : 'border-rose-200/80 hover:border-rose-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
      {helperText && !error && <span className="text-xs text-stone-500">{helperText}</span>}
    </div>
  );
};
