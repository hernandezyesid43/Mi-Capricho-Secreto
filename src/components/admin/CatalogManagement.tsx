import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Clock, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { GoldButton } from '../common/GoldButton';
import { ProductFormModal } from './ProductFormModal';
import { addProduct, updateProduct, deleteProduct } from '../../services/dataService';

interface CatalogManagementProps {
  products: Product[];
  onProductsChanged: () => void;
  onShowToast: (title: string, message?: string, type?: 'gold' | 'success' | 'error' | 'info') => void;
}

export const CatalogManagement: React.FC<CatalogManagementProps> = ({
  products,
  onProductsChanged,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleToggleActive = (product: Product) => {
    updateProduct(product.id, { activo: !product.activo });
    onProductsChanged();
    onShowToast(
      product.activo ? 'Receta pausada' : 'Receta activada',
      `${product.nombre} ahora está ${product.activo ? 'oculta' : 'visible'} en el menú de clientes.`,
      'info'
    );
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`¿Estás seguro de eliminar "${product.nombre}" del catálogo?`)) {
      deleteProduct(product.id);
      onProductsChanged();
      onShowToast('Producto eliminado', `${product.nombre} fue removido del catálogo.`, 'error');
    }
  };

  const handleSaveProduct = (productData: any) => {
    if (productData.id) {
      updateProduct(productData.id, productData);
      onShowToast('Producto actualizado', `${productData.nombre} guardado correctamente.`, 'success');
    } else {
      addProduct(productData);
      onShowToast('Nueva receta creada', `${productData.nombre} añadida al catálogo.`, 'success');
    }
    onProductsChanged();
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' || p.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF4F0] overflow-y-auto">
      {/* Top Bar */}
      <div className="px-6 py-5 bg-white/90 backdrop-blur-md border-b border-rose-100 flex flex-wrap items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="font-serif text-xl font-bold text-[#1A0D16]">
            Gestión del Menú & Inventario
          </h2>
          <p className="text-xs text-stone-500">
            Control de productos artesanales, precios y tiempos de fermentación
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GoldButton
            variant="primary"
            size="md"
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Receta</span>
          </GoldButton>
        </div>
      </div>

      {/* Filter and Table area */}
      <div className="p-6 space-y-4">
        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-rose-50/40 border border-rose-200/80 rounded-xl text-xs text-[#1A0D16] placeholder:text-stone-400 focus:outline-none focus:border-[#C02E62]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {['Todos', 'Yogur Griego', 'Yogur Casero', 'Repostería de Temporada'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-rose-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-3xl border border-rose-100 overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-rose-50/50 border-b border-rose-100 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Presentación</th>
                <th className="py-3.5 px-4">Prep.</th>
                <th className="py-3.5 px-4">Precio (COP)</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 font-medium">
                    No se encontraron recetas coincidentes
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {product.imagen_url ? (
                          <img
                            src={product.imagen_url}
                            alt={product.nombre}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover bg-rose-50 shrink-0 border border-rose-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-rose-50 shrink-0 border border-rose-100 flex items-center justify-center text-xs">
                            🥣
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif font-bold text-sm text-[#1A0D16]">
                              {product.nombre}
                            </span>
                            {product.destacado && (
                              <span title="Destacado">
                                <Sparkles className="w-3.5 h-3.5 text-[#E5A87B]" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                            {product.descripcion}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-stone-700 font-semibold">
                        {product.categoria}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-stone-600">
                      {product.tamano}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-stone-700 font-mono font-medium">
                        <Clock className="w-3 h-3 text-[#D83A73]" />
                        {product.tiempo_preparacion_dias}d
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-[#1A0D16]">
                      ${product.precio.toLocaleString('es-CO')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                          product.activo
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        {product.activo ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Activo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-stone-400" />
                            <span>Pausado</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-stone-500 hover:text-[#C02E62] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};
