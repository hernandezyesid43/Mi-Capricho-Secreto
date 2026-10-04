import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Clock, Plus, Eye, Sparkles, MessageCircle, Heart } from 'lucide-react';
import { Product } from '../../types';
import { openGeneralWhatsApp } from '../../services/whatsappService';

export const cardItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 38,
    scale: 0.96
  },
  visible: (customIndex: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      delay: typeof customIndex === 'number' ? (customIndex % 3) * 0.1 : 0,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

interface ProductCardProps {
  product: Product;
  index?: number;
  isFavorite?: boolean;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onToggleFavorite?: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  isFavorite = false,
  onAddToCart,
  onViewDetails,
  onToggleFavorite
}) => {
  const handleWhatsAppQuickAsk = (e: React.MouseEvent) => {
    e.stopPropagation();
    openGeneralWhatsApp(product.nombre);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    }
  };

  return (
    <motion.article
      variants={cardItemVariants}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px', amount: 0.15 }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="group bg-white/95 rounded-3xl overflow-hidden border border-rose-100/90 shadow-[0_4px_20px_rgba(26,13,22,0.04)] hover:shadow-[0_18px_45px_rgba(216,58,115,0.16)] hover:border-rose-200/90 transition-shadow duration-300 flex flex-col justify-between"
    >
      {/* Visual Product Showcase */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden bg-rose-50/50 cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-rose-50 text-[#C02E62]">
            <Sparkles className="w-8 h-8 opacity-40" />
          </div>
        )}

        {/* Ambient Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0D16]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md bg-black/40 px-3.5 py-1.5 rounded-full border border-white/20">
            <Eye className="w-3.5 h-3.5 text-[#E5A87B]" />
            Ver receta & notas de cata
          </span>
        </div>

        {/* Top Floating Badges */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 pointer-events-none">
          <span className="text-[11px] font-semibold tracking-wide bg-white/90 text-stone-800 backdrop-blur-md px-3 py-1 rounded-full border border-rose-100 shadow-xs">
            {product.tamano}
          </span>
          {product.destacado && (
            <span className="text-[11px] font-bold tracking-wide bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-xs border border-white/20">
              <Sparkles className="w-3 h-3 text-[#F5D3B3]" />
              Edición Favorita
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? `Quitar ${product.nombre} de favoritos` : `Guardar ${product.nombre} en favoritos`}
          title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          className={`absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-md border ${
            isFavorite
              ? 'bg-rose-500 text-white border-rose-400 shadow-[0_4px_14px_rgba(244,63,94,0.45)] scale-105'
              : 'bg-white/85 text-stone-500 hover:text-rose-500 border-white/80 hover:bg-white shadow-2xs hover:scale-110'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${
              isFavorite
                ? 'fill-white stroke-white scale-110'
                : 'stroke-[2] hover:scale-110'
            }`}
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Fermentation Time */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="uppercase tracking-widest font-bold text-[10px] text-[#C02E62]">
              {product.categoria}
            </span>
            <div className="flex items-center gap-1 text-stone-600 font-semibold bg-rose-50/70 px-2 py-0.5 rounded-md">
              <Clock className="w-3.5 h-3.5 text-[#D83A73]" />
              <span>{product.tiempo_preparacion_dias} {product.tiempo_preparacion_dias === 1 ? 'día' : 'días'} prep.</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="font-serif text-xl font-bold text-[#1A0D16] group-hover:text-[#C02E62] transition-colors leading-snug cursor-pointer line-clamp-1 text-left"
          >
            {product.nombre}
          </h3>

          {/* Sensory Description */}
          <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed text-left">
            {product.descripcion}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-4 mt-5 border-t border-rose-100/70 flex items-center justify-between gap-2">
          <div className="text-left">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">
              Bogotá D.C.
            </span>
            <span className="font-mono tabular-nums text-xl font-bold text-[#1A0D16]">
              ${product.precio.toLocaleString('es-CO')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct WhatsApp Quick Ask Button */}
            <button
              onClick={handleWhatsAppQuickAsk}
              type="button"
              aria-label={`Preguntar por ${product.nombre} en WhatsApp`}
              title="Preguntar por WhatsApp"
              className="p-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-600 transition-colors cursor-pointer shadow-2xs"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={() => onAddToCart(product)}
              aria-label={`Añadir ${product.nombre} al carrito`}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D83A73] via-[#C02E62] to-[#A32252] text-white font-bold text-xs shadow-[0_4px_14px_rgba(216,58,115,0.35)] hover:shadow-[0_6px_20px_rgba(216,58,115,0.48)] hover:scale-103 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Añadir</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};
