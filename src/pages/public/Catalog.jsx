import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HeartCrack } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../store/authStore'
import { useFavoritesStore } from '../../store/favoritesStore'
import AnimatedProductCard from '../../components/ui/AnimatedProductCard'

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'favorites'
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
        setProducts(data)
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

  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ paddingTop: '80px', minHeight: '100vh' }}
    >
      <section className="catalog-section" id="catalogo">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Nuestro Catálogo
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Descubre nuestra selección de productos elaborados con dedicación.
          </motion.p>
        </div>

        {user && (
          <motion.div
            className="catalog-filters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todos los Caprichos
            </button>
            <button
              className={`filter-btn ${filter === 'favorites' ? 'active' : ''}`}
              onClick={() => setFilter('favorites')}
            >
              Mis Favoritos
            </button>
          </motion.div>
        )}

        {loading ? (
          <div className="grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div
            className="grid"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {filteredProducts.map((product, i) => (
              <AnimatedProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        ) : (
          <div className="empty-state">
            <HeartCrack size={64} />
            <h3>Aún no tienes caprichos guardados</h3>
            <p>Explora nuestro menú y presiona el corazón para guardar tus productos favoritos.</p>
            <button
              className="btn-outline"
              style={{ marginTop: '24px' }}
              onClick={() => setFilter('all')}
            >
              Ver Catálogo Completo
            </button>
          </div>
        )}
      </section>
    </motion.div>
  )
}
