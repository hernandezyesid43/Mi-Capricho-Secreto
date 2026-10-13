import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartCrack, X, ShoppingCart } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../store/authStore'
import { useFavoritesStore } from '../../store/favoritesStore'
import AnimatedProductCard from '../../components/ui/AnimatedProductCard'

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const { user } = useAuthStore()
  const { fetchFavorites, isFavorite } = useFavoritesStore()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('id')

      if (!error && data) {
        // SOLUCIÓN DE IMÁGENES: Convertimos el archivo en un enlace público real
        const fixedData = data.map(p => {
          let finalImageUrl = p.imagen_url;

          // Si la imagen existe pero no es un link de internet (no tiene 'http')
          if (finalImageUrl && !finalImageUrl.startsWith('http')) {
            // Reemplaza 'productos' por el nombre real de tu bucket si es diferente
            const { data: publicUrlData } = supabase.storage.from('productos').getPublicUrl(finalImageUrl);
            finalImageUrl = publicUrlData.publicUrl;
          }

          return {
            ...p,
            imagen_url: finalImageUrl,
            image: finalImageUrl,
            imagen: finalImageUrl
          }
        })
        setProducts(fixedData)
      }

      if (user) {
        await fetchFavorites(user.id)
      }
      setLoading(false)
    }

    loadData()
  }, [user, fetchFavorites])

  const filteredProducts = filter === 'favorites' && user
    ? products.filter(p => isFavorite(p.id))
    : products

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <motion.div
      className="page-transition relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ paddingTop: '80px', minHeight: '100vh' }}
    >
      <section className="catalog-section" id="catalogo">
        <div className="section-header">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            Nuestro Catálogo
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            Descubre nuestra selección de productos elaborados con dedicación.
          </motion.p>
        </div>

        {user && (
          <motion.div className="catalog-filters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              Todos los Caprichos
            </button>
            <button className={`filter-btn ${filter === 'favorites' ? 'active' : ''}`} onClick={() => setFilter('favorites')}>
              Mis Favoritos
            </button>
          </motion.div>
        )}

        {loading ? (
          <div className="grid">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton skeleton-card" />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div className="grid" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            {filteredProducts.map((product, i) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <AnimatedProductCard product={product} index={i} />
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="empty-state">
            <HeartCrack size={64} />
            <h3>Aún no tienes caprichos guardados</h3>
            <button className="btn-outline" style={{ marginTop: '24px' }} onClick={() => setFilter('all')}>
              Ver Catálogo Completo
            </button>
          </div>
        )}
      </section>

      {/* MODAL PREMIUM DE VISTA RÁPIDA */}
      <AnimatePresence>
        {selectedProduct && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col md:flex-row relative"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-rose-100 rounded-full text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-1/2 h-72 md:h-auto bg-rose-50 relative overflow-hidden group">
                <img
                  src={selectedProduct.imagen_url || 'https://via.placeholder.com/600x600?text=Cargando...'}
                  alt={selectedProduct.nombre}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between bg-white">
                <div>
                  <span className="text-xs font-semibold text-rose-500 uppercase mb-2 block">
                    {selectedProduct.categoria || 'Artesanal'}
                  </span>
                  <h2 className="text-3xl font-serif font-bold text-rose-950 mb-4 leading-tight">
                    {selectedProduct.nombre}
                  </h2>
                  <div className="w-12 h-1 bg-rose-200 mb-6" />
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                    {selectedProduct.descripcion}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-rose-100">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Precio Total</p>
                      <p className="text-3xl font-bold text-rose-900">{formatPrice(selectedProduct.precio)}</p>
                    </div>
                  </div>

                  <button className="w-full bg-rose-900 hover:bg-rose-950 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-3">
                    <ShoppingCart size={20} />
                    <span>Añadir al carrito</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}