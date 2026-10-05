import { create } from 'zustand'
import { supabase } from '../services/supabase'

export const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  addItem: (product) => {
    const items = get().items
    const existing = items.find((i) => i.producto_id === product.id)

    if (existing) {
      set({
        items: items.map((i) =>
          i.producto_id === product.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        ),
      })
    } else {
      set({
        items: [
          ...items,
          {
            producto_id: product.id,
            nombre: product.nombre,
            precio_unitario: product.precio,
            imagen_url: product.imagen_url,
            cantidad: 1,
          },
        ],
      })
    }
  },

  removeItem: (productoId) => {
    set({ items: get().items.filter((i) => i.producto_id !== productoId) })
  },

  updateQuantity: (productoId, cantidad) => {
    if (cantidad <= 0) {
      get().removeItem(productoId)
      return
    }
    set({
      items: get().items.map((i) =>
        i.producto_id === productoId ? { ...i, cantidad } : i
      ),
    })
  },

  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.precio_unitario * item.cantidad,
      0
    )
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.cantidad, 0)
  },

  clearCart: () => set({ items: [], isOpen: false }),

  /**
   * Crea el pedido en Supabase con código de seguimiento único y retorna los datos.
   */
  checkout: async (userId) => {
    const items = get().items
    const total = get().getTotal()

    if (items.length === 0) return { error: 'Carrito vacío' }

    // Generar código de seguimiento único (ej: MCS-4821 o secuencial)
    let pedidoId = null
    try {
      const { data: seqData } = await supabase.rpc('generate_pedido_id')
      if (seqData) pedidoId = seqData
    } catch {
      // Ignorar si la función rpc no está en supabase
    }

    if (!pedidoId) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      pedidoId = `MCS-${randomSuffix}`
    }

    const fechaEstimada = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()

    // Intentar insertar pedido en tabla pedidos
    let pedidoError = null
    const { error: err1 } = await supabase.from('pedidos').insert({
      id: pedidoId,
      usuario_id: userId,
      total,
      estado: 'Pendiente',
      tracking_code: pedidoId,
      fecha_estimada: fechaEstimada,
    })

    if (err1) {
      // Si la tabla no tiene columnas opcionales, insertar con columnas base
      const { error: err2 } = await supabase.from('pedidos').insert({
        id: pedidoId,
        usuario_id: userId,
        total,
        estado: 'Pendiente',
      })
      if (err2) {
        pedidoError = err2
      }
    }

    if (pedidoError) return { error: pedidoError.message }

    // Insertar items en pedido_items
    const pedidoItems = items.map((item) => ({
      pedido_id: pedidoId,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
    }))

    const { error: itemsError } = await supabase
      .from('pedido_items')
      .insert(pedidoItems)

    if (itemsError) {
      console.warn('Advertencia insertando pedido_items:', itemsError)
    }

    const orderItems = [...items]
    get().clearCart()

    return { pedidoId, trackingCode: pedidoId, total, items: orderItems }
  },
}))
