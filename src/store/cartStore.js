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
   * Crea el pedido en Supabase y retorna el ID generado.
   */
  checkout: async (userId) => {
    const items = get().items
    const total = get().getTotal()

    if (items.length === 0) return { error: 'Carrito vacío' }

    // Obtener el siguiente ID del pedido
    const { data: seqData, error: seqError } = await supabase.rpc('generate_pedido_id')
    if (seqError) return { error: seqError.message }
    const pedidoId = seqData

    // Crear pedido
    const { error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        id: pedidoId,
        usuario_id: userId,
        total,
        estado: 'Pendiente',
      })

    if (pedidoError) return { error: pedidoError.message }

    // Insertar items
    const pedidoItems = items.map((item) => ({
      pedido_id: pedidoId,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
    }))

    const { error: itemsError } = await supabase
      .from('pedido_items')
      .insert(pedidoItems)

    if (itemsError) return { error: itemsError.message }

    const orderItems = [...items]
    get().clearCart()

    return { pedidoId, total, items: orderItems }
  },
}))
