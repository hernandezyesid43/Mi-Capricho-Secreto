import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { ElegantInput } from '../common/ElegantInput';
import { GoldButton } from '../common/GoldButton';
import { ImageDropzone } from '../common/ImageDropzone';

import imgGreek from '../../assets/images/yogur_griego_artesanal_1790392468833.jpg';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSave: (productData: Omit<Product, 'id'> | Product) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSave
}) => {
  const [nombre, setNombre] = useState(productToEdit?.nombre || '');
  const [categoria, setCategoria] = useState<'Yogur Griego' | 'Yogur Casero' | 'Repostería de Temporada'>(
    productToEdit?.categoria || 'Yogur Griego'
  );
  const [precio, setPrecio] = useState(productToEdit?.precio.toString() || '18000');
  const [tiempoPrep, setTiempoPrep] = useState(productToEdit?.tiempo_preparacion_dias.toString() || '2');
  const [tamano, setTamano] = useState(productToEdit?.tamano || 'Frasco 500g');
  const [descripcion, setDescripcion] = useState(productToEdit?.descripcion || '');
  const [notasDegustacion, setNotasDegustacion] = useState(productToEdit?.notas_degustacion || '');
  const [ingredientesStr, setIngredientesStr] = useState(
    productToEdit?.ingredientes.join(', ') || 'Leche entera de pastoreo, Cultivos lácticos vivos'
  );
  const [imageUrl, setImageUrl] = useState(productToEdit?.imagen_url || imgGreek);
  const [activo, setActivo] = useState(productToEdit ? productToEdit.activo : true);
  const [destacado, setDestacado] = useState(productToEdit?.destacado || false);

  // Sync state if productToEdit changes
  useEffect(() => {
    if (productToEdit) {
      setNombre(productToEdit.nombre);
      setCategoria(productToEdit.categoria);
      setPrecio(productToEdit.precio.toString());
      setTiempoPrep(productToEdit.tiempo_preparacion_dias.toString());
      setTamano(productToEdit.tamano);
      setDescripcion(productToEdit.descripcion);
      setNotasDegustacion(productToEdit.notas_degustacion || '');
      setIngredientesStr(productToEdit.ingredientes.join(', '));
      setImageUrl(productToEdit.imagen_url);
      setActivo(productToEdit.activo);
      setDestacado(Boolean(productToEdit.destacado));
    }
  }, [productToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !precio) return;

    const parsedPrice = parseFloat(precio) || 10000;
    const parsedDays = parseInt(tiempoPrep, 10) || 2;
    const parsedIngredientes = ingredientesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      nombre: nombre.trim(),
      categoria,
      precio: parsedPrice,
      tiempo_preparacion_dias: Math.min(7, Math.max(1, parsedDays)),
      tamano: tamano.trim(),
      descripcion: descripcion.trim(),
      notas_degustacion: notasDegustacion.trim() || undefined,
      ingredientes: parsedIngredientes.length > 0 ? parsedIngredientes : ['Ingredientes 100% naturales'],
      imagen_url: imageUrl,
      activo,
      destacado
    };

    if (productToEdit) {
      onSave({ ...payload, id: productToEdit.id });
    } else {
      onSave(payload);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="product-form-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-form-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            key="product-form-dialog"
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-white">
              <div>
                <h2 id="product-form-title" className="font-serif text-lg font-bold text-[#1A1A1A]">
                  {productToEdit ? 'Editar Producto del Menú' : 'Nuevo Producto Artesanal'}
                </h2>
                <p className="text-[11px] text-stone-500">
                  Configura detalles, tiempos de fermentación y precios
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ElegantInput
                  label="Nombre del Producto"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Yogur Griego de Maracuyá"
                  required
                />


            <div className="flex flex-col gap-1.5">
              <label htmlFor="category-select" className="text-xs font-medium text-[#4A4A4A] uppercase tracking-wider">
                Categoría
              </label>
              <select
                id="category-select"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Yogur Griego">Yogur Griego</option>
                <option value="Yogur Casero">Yogur Casero</option>
                <option value="Repostería de Temporada">Repostería de Temporada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ElegantInput
              label="Precio (COP)"
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="18000"
              required
            />

            <ElegantInput
              label="Días de Preparación (1 a 3)"
              type="number"
              min="1"
              max="5"
              value={tiempoPrep}
              onChange={(e) => setTiempoPrep(e.target.value)}
              placeholder="2"
              required
            />

            <ElegantInput
              label="Presentación / Tamaño"
              value={tamano}
              onChange={(e) => setTamano(e.target.value)}
              placeholder="Frasco 500g"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="product-desc" className="text-xs font-medium text-[#4A4A4A] uppercase tracking-wider">
              Descripción Sensorial
            </label>
            <textarea
              id="product-desc"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve reseña del método de preparación o sabor característico..."
              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="product-notes" className="text-xs font-medium text-[#4A4A4A] uppercase tracking-wider">
              Notas de Degustación (Opcional)
            </label>
            <input
              id="product-notes"
              type="text"
              value={notasDegustacion}
              onChange={(e) => setNotasDegustacion(e.target.value)}
              placeholder="Ej. Toque untuoso, acidez moderada y notas de miel silvestre."
              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="product-ingredients" className="text-xs font-medium text-[#4A4A4A] uppercase tracking-wider">
              Ingredientes (Separados por coma)
            </label>
            <input
              id="product-ingredients"
              type="text"
              value={ingredientesStr}
              onChange={(e) => setIngredientesStr(e.target.value)}
              placeholder="Leche de pastoreo, cultivos lácticos, miel pura"
              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Photo Dropzone */}
          <ImageDropzone value={imageUrl} onChange={setImageUrl} />

          {/* Flags */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-800">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 accent-[#D4AF37] rounded"
              />
              <span>Producto Activo en el Menú</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-800">
              <input
                type="checkbox"
                checked={destacado}
                onChange={(e) => setDestacado(e.target.checked)}
                className="w-4 h-4 accent-[#D4AF37] rounded"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Marcar como Favorito / Destacado
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg"
            >
              Cancelar
            </button>

            <GoldButton type="submit" size="md">
              <Save className="w-4 h-4" />
              <span>Guardar en Menú</span>
            </GoldButton>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
