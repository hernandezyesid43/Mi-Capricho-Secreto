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
    e.stopPropagation() // Evita que se abra el modal al dar clic al corazón
    if (!user) return
    await toggleFavorite(user.id, product.id)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation() // Evita que se abra el modal al añadir al carrito
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
        delay: index * 0.1, // ERROR CORREGIDO AQUÍ
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <div className="product-card-image-wrapper relative bg-rose-50/50">
        {!imgLoaded && <div className="skeleton absolute inset-0" style={{ height: 220, width: '100%' }} />}
        <img
          className="product-card-image object-cover"
          src={product.imagen_url || 'https://via.placeholder.com/400x400?text=Cargando...'}
          alt={product.nombre}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            // Si la URL falla, muestra esta imagen de respaldo para que nunca quede en blanco
            e.target.src = 'https://via.placeholder.com/400x400?text=Sin+Imagen'
            setImgLoaded(true)
          }}
          style={{
            display: imgLoaded ? 'block' : 'none',
            height: '220px',
            width: '100%'
          }}
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
        {/* Usamos LineClamp para que la descripción se vea ordenada y sin salirse */}
        <p
          className="product-card-desc"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {product.descripcion}
        </p>
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