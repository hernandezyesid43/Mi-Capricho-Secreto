import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Sparkles, ShoppingBag, Leaf, ShieldAlert, MessageCircle, Heart } from 'lucide-react';
import { Product } from '../../types';
import { QuantitySelector } from '../common/QuantitySelector';
import { GoldButton } from '../common/GoldButton';
import { openGeneralWhatsApp } from '../../services/whatsappService';

interface ProductModalProps {
  product: Product | null;
  isFavorite?: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleFavorite?: (productId: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isFavorite = false,
  onClose,
  onAddToCart,
  onToggleFavorite
}) => {
  const [quantity, setQuantity] = useState(1);

  // Reset quantity when opened for a new product
  useEffect(() => {
    if (product) {
      setQuantity(1);
    }
  }, [product?.id]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAdd = () => {
    if (!product) return;
    onAddToCart(product, quantity);
    onClose();
  };

  const handleWhatsAppConsult = () => {
    if (!product) return;
    openGeneralWhatsApp(product.nombre);
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key="product-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            key="product-modal-card"
            initial={{ opacity: 0, y: 35, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#FAF4F0] rounded-3xl shadow-[0_20px_60px_rgba(26,13,22,0.4)] border border-rose-200 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Top Action Buttons */}
            <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(product.id)}
                  aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  className={`p-2.5 rounded-full transition-all cursor-pointer backdrop-blur-md border shadow-md ${
                    isFavorite
                      ? 'bg-rose-500 text-white border-rose-400 scale-105'
                      : 'bg-white/90 text-stone-600 hover:text-rose-500 hover:bg-white border-white/80'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-all duration-200 ${
                      isFavorite ? 'fill-white stroke-white scale-110' : 'stroke-[2]'
                    }`}
                  />
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Cerrar modal"
                className="p-2.5 rounded-full bg-white/90 text-stone-700 hover:text-[#C02E62] hover:bg-white shadow-md transition-all cursor-pointer border border-white/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Media */}
            <div className="md:w-1/2 relative bg-rose-50/50 min-h-[260px] md:min-h-full">
              {product.imagen_url ? (
                <img
                  src={product.imagen_url}
                  alt={product.nombre}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full min-h-[260px] flex items-center justify-center bg-rose-50 text-[#C02E62]">
                  <Sparkles className="w-12 h-12 opacity-40" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="text-xs font-bold bg-[#1A0D16]/90 text-[#FAF4F0] px-3.5 py-1 rounded-full shadow-xs backdrop-blur-xs">
                  {product.tamano}
                </span>
                {product.destacado && (
                  <span className="text-xs font-bold bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-[#F5D3B3]" />
                    Edición de Autor
                  </span>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-7 overflow-y-auto flex flex-col justify-between text-left">
              <div>
                {/* Category & Prep Time */}
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="font-bold uppercase tracking-widest text-[#C02E62]">
                    {product.categoria}
                  </span>
                  <span className="flex items-center gap-1 text-stone-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-[#D83A73]" />
                    {product.tiempo_preparacion_dias} {product.tiempo_preparacion_dias === 1 ? 'día' : 'días'} prep.
                  </span>
                </div>

                {/* Title */}
                <h2 id="product-modal-title" className="font-serif text-2xl font-bold text-[#1A0D16] leading-tight">
                  {product.nombre}
                </h2>

                {/* Description */}
                <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                  {product.descripcion}
                </p>

                {/* Tasting Notes */}
                {product.notas_degustacion && (
                  <div className="mt-4 p-3.5 bg-gradient-to-br from-white to-rose-50/60 rounded-2xl border border-rose-200/80 shadow-2xs">
                    <p className="text-[11px] font-bold text-[#C02E62] uppercase tracking-wider">
                      Notas de Degustación
                    </p>
                    <p className="text-xs text-stone-700 italic mt-0.5">
                      "{product.notas_degustacion}"
                    </p>
                  </div>
                )}

                {/* Ingredients */}
                <div className="mt-4">
                  <p className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    Ingredientes 100% Puros
                  </p>
                  <ul className="space-y-1">
                    {product.ingredientes.map((ing, i) => (
                      <li key={i} className="text-xs text-stone-600 flex items-start gap-1.5">
                        <span className="text-[#D83A73] font-bold">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 p-3 bg-amber-50/90 rounded-xl border border-amber-200/80 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-900 leading-snug">
                    Elaboración artesanal bajo pedido para conservar los cultivos vivos y máxima frescura en Bogotá.
                  </p>
                </div>
              </div>

              {/* Action Row */}
              <div className="pt-6 mt-6 border-t border-rose-100 flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-semibold">
                      Total Producto
                    </span>
                    <span className="font-mono tabular-nums text-2xl font-bold text-[#C02E62]">
                      ${(product.precio * quantity).toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  <QuantitySelector
                    quantity={quantity}
                    onIncrease={() => setQuantity((q) => q + 1)}
                    onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                  />
                </div>

                <GoldButton
                  variant="primary"
                  size="lg"
                  onClick={handleAdd}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Añadir a mi Cesta Gourmet</span>
                </GoldButton>

                <button
                  type="button"
                  onClick={handleWhatsAppConsult}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Consultar esta receta por WhatsApp</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
