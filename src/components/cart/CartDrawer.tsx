import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Clock, ArrowRight, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { CartItem } from '../../types';
import { QuantitySelector } from '../common/QuantitySelector';
import { GoldButton } from '../common/GoldButton';
import { openGeneralWhatsApp } from '../../services/whatsappService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: number, newQty: number) => void;
  onRemoveItem: (productId: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const totalAmount = items.reduce((sum, item) => sum + item.product.precio * item.cantidad, 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  // Business rule 4.1: The frontend takes the maximum prep days of products in cart
  const maxPrepDays = items.length > 0 
    ? Math.max(...items.map((i) => i.product.tiempo_preparacion_dias)) 
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cart-drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="Carrito de compras"
          className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              key="cart-drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-screen max-w-md bg-[#FAF4F0] shadow-2xl border-l border-rose-200/80 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-rose-100 flex items-center justify-between bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FAF0EC] to-[#FCE7EF] flex items-center justify-center text-[#C02E62]">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#1A0D16]">
                      Tu Cesta Gourmet
                    </h2>
                    <p className="text-[11px] text-stone-500 font-medium">Lotes frescos preparados en Bogotá</p>
                  </div>
                  <span className="text-xs font-mono tabular-nums bg-rose-100 text-[#C02E62] px-2.5 py-0.5 rounded-full font-bold ml-1">
                    {totalItemsCount}
                  </span>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                  aria-label="Cerrar carrito"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-300 mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#1A0D16]">Tu cesta está vacía</h3>
                    <p className="text-xs text-stone-500 max-w-xs mt-1 leading-relaxed">
                      Elige tus yogures griegos o postres de temporada para comenzar tu orden artesanal personalizada.
                    </p>
                    <GoldButton
                      variant="primary"
                      size="sm"
                      onClick={onClose}
                      className="mt-6"
                    >
                      Explorar Productos
                    </GoldButton>
                  </div>
                ) : (
                  <>
                    {/* Preparation Time Guarantee Banner */}
                    <div className="p-3.5 bg-gradient-to-br from-white to-rose-50/70 border border-rose-200/80 rounded-2xl flex items-start gap-3 shadow-2xs">
                      <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-[#C02E62] shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-[#1A0D16] block">
                          Tiempo estimado en cocina: {maxPrepDays} {maxPrepDays === 1 ? 'día' : 'días'} hábiles
                        </span>
                        <span className="text-stone-600 text-[11px] leading-relaxed block mt-0.5">
                          Calculado según la receta con mayor tiempo de fermentación en tu cesta.
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.product.id}
                          className="p-4 bg-white/95 rounded-2xl border border-rose-100 shadow-2xs flex gap-3.5 items-center transition-all hover:border-rose-200"
                        >
                          {item.product.imagen_url ? (
                            <img
                              src={item.product.imagen_url}
                              alt={item.product.nombre}
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 rounded-xl object-cover border border-rose-50"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-lg shrink-0">
                              🥣
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-serif font-bold text-sm text-[#1A0D16] truncate">
                                {item.product.nombre}
                              </h4>
                              <button
                                onClick={() => onRemoveItem(item.product.id)}
                                className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                aria-label="Eliminar item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-stone-500 font-medium">
                                {item.product.tamano}
                              </span>
                              <span className="text-[10px] text-[#C02E62] font-semibold bg-rose-50 px-1.5 py-0.2 rounded">
                                {item.product.tiempo_preparacion_dias}d prep.
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <QuantitySelector
                                size="sm"
                                quantity={item.cantidad}
                                onIncrease={() => onUpdateQuantity(item.product.id, item.cantidad + 1)}
                                onDecrease={() => onUpdateQuantity(item.product.id, item.cantidad - 1)}
                              />

                              <span className="font-mono tabular-nums text-sm font-bold text-[#1A0D16]">
                                ${(item.product.precio * item.cantidad).toLocaleString('es-CO')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Footer Checkout */}
              {items.length > 0 && (
                <div className="p-6 border-t border-rose-100 bg-white/95 backdrop-blur-md space-y-4">
                  <div className="space-y-1.5 text-xs text-stone-600 text-left">
                    <div className="flex justify-between">
                      <span>Subtotal productos:</span>
                      <span className="font-mono tabular-nums font-semibold text-[#1A0D16]">
                        ${totalAmount.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Despacho en Bogotá:</span>
                      <span className="text-stone-500 italic">
                        Coordinado por WhatsApp
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-rose-100 text-base font-bold text-[#1A0D16]">
                      <span>Total estimado:</span>
                      <span className="font-mono tabular-nums text-lg text-[#C02E62]">
                        ${totalAmount.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  </div>

                  <GoldButton
                    variant="primary"
                    size="lg"
                    onClick={onProceedToCheckout}
                    className="w-full flex items-center justify-between"
                  >
                    <span>Confirmar y Enviar Pedido</span>
                    <ArrowRight className="w-4 h-4" />
                  </GoldButton>

                  <p className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Pago seguro contra entrega o transferencia externa
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
