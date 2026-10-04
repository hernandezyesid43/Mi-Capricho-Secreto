import { motion } from 'framer-motion'
import { Heart, Plus } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useFavoritesStore } from '../../store/favoritesStore'
import { useCartStore } from '../../store/cartStore'
import { useState } from 'react'

export default function AnimatedProductCard({ product, index }) {
  const { user } = useAuthStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const [imgLoaded, setImgLoaded] = useState(false)

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

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <div className="product-card-image-wrapper">
        {!imgLoaded && <div className="skeleton" style={{ height: 220, width: '100%' }} />}
        <img
          className="product-card-image"
          src={product.imagen_url}
          alt={product.nombre}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{ display: imgLoaded ? 'block' : 'none' }}
        />
        <button
          className={`heart-toggle ${liked ? 'active' : ''}`}
          onClick={handleFavorite}
          aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          id={`heart-${product.id}`}
        >
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="product-card-body">
        <p className="product-card-category">{product.categoria}</p>
        <h3 className="product-card-name">{product.nombre}</h3>
        <p className="product-card-desc">{product.descripcion}</p>
        <div className="product-card-footer">
          <p className="product-card-price">
            ${Number(product.precio).toLocaleString('es-CO')}
            <small> COP</small>
          </p>
          <div className="product-card-actions">
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              aria-label={`Agregar ${product.nombre} al carrito`}
              id={`add-cart-${product.id}`}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
