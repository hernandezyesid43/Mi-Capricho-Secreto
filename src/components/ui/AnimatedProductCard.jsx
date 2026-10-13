import { motion } from 'framer-motion'
import { Heart, Plus } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useFavoritesStore } from '../../store/favoritesStore'
import { useCartStore } from '../../store/cartStore'

export default function AnimatedProductCard({ product, index }) {
  const { user } = useAuthStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const liked = user ? isFavorite(product.id) : false

  const handleFavorite = async (e) => {
    e.stopPropagation()
    if (!user) return
    await toggleFavorite(user.id, product.id)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addItem(product)
    openCart()
  }

  // Obtenemos la URL de la imagen de forma segura
  const imageUrl = product.imagen_url || product.image || product.imagen || 'https://via.placeholder.com/400x400?text=Mi+Capricho+Secreto'

  return (
    <motion.div
      className="product-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border border-rose-100/60"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {/* Contenedor de la Imagen */}
      <div className="relative w-full h-56 bg-rose-50 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          src={imageUrl}
          alt={product.nombre}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400?text=Mi+Capricho+Secreto'
          }}
        />
        <button
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${liked ? 'bg-rose-600 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          onClick={handleFavorite}
          aria-label="Favorito"
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">
            {product.categoria || 'Artesanal'}
          </p>
          <h3 className="text-xl font-serif font-bold text-rose-950 mb-2">
            {product.nombre}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
            {product.descripcion}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-rose-50 mt-auto">
          <div>
            <span className="text-2xl font-bold text-rose-900">
              ${Number(product.precio).toLocaleString('es-CO')}
            </span>
            <span className="text-xs text-gray-500 ml-1">COP</span>
          </div>

          <button
            className="p-3 bg-rose-900 hover:bg-rose-950 text-white rounded-xl transition-colors shadow-sm hover:shadow active:scale-95"
            onClick={handleAddToCart}
            aria-label="Agregar al carrito"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}