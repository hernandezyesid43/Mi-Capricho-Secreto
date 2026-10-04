import { create } from 'zustand'
import { supabase } from '../services/supabase'

export const useFavoritesStore = create((set, get) => ({
  favorites: [], // Array of producto_id numbers
  loading: false,

  fetchFavorites: async (userId) => {
    if (!userId) return
    set({ loading: true })

    const { data, error } = await supabase
      .from('favoritos')
      .select('producto_id')
      .eq('usuario_id', userId)

    if (!error && data) {
      set({ favorites: data.map((f) => f.producto_id) })
    }
    set({ loading: false })
  },

  toggleFavorite: async (userId, productoId) => {
    const favorites = get().favorites
    const isFav = favorites.includes(productoId)

    if (isFav) {
      // Eliminar de favoritos
      await supabase
        .from('favoritos')
        .delete()
        .eq('usuario_id', userId)
        .eq('producto_id', productoId)

      set({ favorites: favorites.filter((id) => id !== productoId) })
    } else {
      // Agregar a favoritos
      await supabase
        .from('favoritos')
        .insert({ usuario_id: userId, producto_id: productoId })

      set({ favorites: [...favorites, productoId] })
    }
  },

  isFavorite: (productoId) => {
    return get().favorites.includes(productoId)
  },
}))
