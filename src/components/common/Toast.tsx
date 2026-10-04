import React from 'react';
import { AlertCircle, X, Sparkles } from 'lucide-react';
import { ToastNotification } from '../../types';

interface ToastProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {notifications.map((toast) => {
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-[0_12px_32px_rgba(26,13,22,0.35)] border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              isError
                ? 'bg-rose-950/95 text-white border-rose-800'
                : 'bg-gradient-to-r from-[#1A0D16]/95 to-[#2D1222]/95 text-[#FAF4F0] border-[#E5A87B]/40'
            }`}
          >
            {isError ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-xs">
                ✓
              </div>
            )}

            <div className="flex-1 pr-1 text-left">
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{toast.title}</span>
                {!isError && <Sparkles className="w-3 h-3 text-[#E5A87B]" />}
              </p>
              {toast.message && (
                <p className="text-xs text-rose-100/80 mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-stone-400 hover:text-white transition-colors p-1"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
