import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useState } from 'react'
import AuthModal from './AuthModal'
import { sendOrderToTelegram } from '../../services/telegramService'

export default function FloatingCart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal, clearCart, checkout } = useCartStore()
  const { user } = useAuthStore()
  const [showAuth, setShowAuth] = useState(false)
  const [processing, setProcessing] = useState(false)

  const total = getTotal()

  const handleCheckout = async () => {
    if (!user) {
      setShowAuth(true)
      return
    }

    setProcessing(true)

    try {
      const result = await checkout(user.id)

      if (result.error) {
        alert('Error al crear el pedido: ' + result.error)
        setProcessing(false)
        return
      }

      // Enviar notificación a Telegram (tú la recibes)
      await sendOrderToTelegram({
        pedidoId: result.pedidoId,
        total: result.total,
        items: result.items,
        user,
      })

      // Cerrar carrito y limpiar
      clearCart()
      closeCart()

      // Mensaje de éxito para el cliente
      alert(`¡Pedido #${result.pedidoId} recibido!\n\nTe contactaremos pronto para coordinar la entrega.\nGracias por elegir Mi Capricho Secreto 💕`)
    } catch (err) {
      console.error(err)
      alert('Ocurrió un error. Intenta de nuevo.')
    }

    setProcessing(false)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(74, 14, 46, 0.3)',
                zIndex: 149,
              }}
              onClick={closeCart}
            />
            <motion.div
              className="cart-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="cart-header">
                <h3>Tu Carrito</h3>
                <button className="modal-close" onClick={closeCart} aria-label="Cerrar carrito">
                  <X size={20} />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingBag size={48} />
                  <h3>Tu carrito está vacío</h3>
                  <p>Explora nuestro catálogo y agrega tus caprichos favoritos</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {items.map((item) => (
                      <div className="cart-item" key={item.producto_id}>
                        <img
                          className="cart-item-img"
                          src={item.imagen_url}
                          alt={item.nombre}
                          loading="lazy"
                        />
                        <div className="cart-item-info">
                          <p className="cart-item-name">{item.nombre}</p>
                          <p className="cart-item-price">
                            ${(item.precio_unitario * item.cantidad).toLocaleString('es-CO')}
                          </p>
                          <div className="cart-item-qty">
                            <button
                              onClick={() => updateQuantity(item.producto_id, item.cantidad - 1)}
                              aria-label="Reducir cantidad"
                            >
                              <Minus size={14} />
                            </button>
                            <span>{item.cantidad}</span>
                            <button
                              onClick={() => updateQuantity(item.producto_id, item.cantidad + 1)}
                              aria-label="Aumentar cantidad"
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              onClick={() => removeItem(item.producto_id)}
                              aria-label="Eliminar del carrito"
                              style={{ marginLeft: 'auto', color: '#C62828' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-footer">
                    <div className="cart-total">
                      <span className="cart-total-label">Total</span>
                      <span className="cart-total-amount">
                        ${total.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <button
                      className="btn-rose"
                      style={{ width: '100%' }}
                      onClick={handleCheckout}
                      disabled={processing}
                      id="checkout-btn"
                    >
                      {processing ? (
                        <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                      ) : (
                        'Confirmar y Enviar Pedido'
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
