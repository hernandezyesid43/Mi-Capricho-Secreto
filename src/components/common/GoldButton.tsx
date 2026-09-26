import React from 'react';

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'rosegold' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.97] select-none rounded-xl relative overflow-hidden';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 rounded-lg gap-1.5 font-semibold',
    md: 'text-sm px-5 py-2.5 rounded-xl gap-2 font-semibold',
    lg: 'text-base px-7 py-3.5 rounded-2xl gap-2.5 font-bold tracking-wide'
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#D83A73] via-[#C02E62] to-[#A32252] text-white shadow-[0_4px_18px_rgba(216,58,115,0.35)] hover:shadow-[0_8px_28px_rgba(216,58,115,0.48)] hover:-translate-y-0.5 hover:brightness-105 border border-white/20',
    rosegold: 'bg-gradient-to-r from-[#F0B88E] via-[#E5A87B] to-[#D49363] text-[#1A0D16] shadow-[0_4px_16px_rgba(229,168,123,0.35)] hover:shadow-[0_8px_24px_rgba(229,168,123,0.45)] hover:-translate-y-0.5 border border-white/30',
    secondary: 'bg-[#1A0D16] text-[#FAF4F0] hover:bg-[#281322] border border-[#E5A87B]/30 shadow-md hover:-translate-y-0.5',
    outline: 'border-2 border-[#E5A87B] text-[#C02E62] bg-white/70 hover:bg-[#FAF0EC] hover:border-[#D83A73] shadow-xs',
    ghost: 'text-[#1A0D16] hover:bg-rose-100/50',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          <span>Procesando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
