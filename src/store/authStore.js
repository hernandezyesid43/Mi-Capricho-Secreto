import { create } from 'zustand'
import { supabase } from '../services/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        let { data: profile } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (!profile && session.user) {
          const meta = session.user.user_metadata || {}
          const userEmail = session.user.email || ''
          const isAdminEmail = userEmail.toLowerCase().includes('admin')
          const initialProfile = {
            id: session.user.id,
            nombre: meta.full_name || meta.name || userEmail.split('@')[0] || 'Usuario',
            telefono: meta.phone || '',
            direccion: '',
            rol: isAdminEmail ? 'admin' : 'cliente',
          }
          const { data: createdProfile } = await supabase
            .from('perfiles')
            .upsert(initialProfile)
            .select()
            .maybeSingle()

          profile = createdProfile || initialProfile
        }

        set({ user: session.user, profile, loading: false })
      } else {
        set({ user: null, profile: null, loading: false })
      }
    } catch {
      set({ loading: false })
    }

    // Listener para cambios de auth
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        let { data: profile } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (!profile && session.user) {
          const meta = session.user.user_metadata || {}
          const userEmail = session.user.email || ''
          const isAdminEmail = userEmail.toLowerCase().includes('admin')
          const initialProfile = {
            id: session.user.id,
            nombre: meta.full_name || meta.name || userEmail.split('@')[0] || 'Usuario',
            telefono: meta.phone || '',
            direccion: '',
            rol: isAdminEmail ? 'admin' : 'cliente',
          }
          const { data: createdProfile } = await supabase
            .from('perfiles')
            .upsert(initialProfile)
            .select()
            .maybeSingle()

          profile = createdProfile || initialProfile
        }

        set({ user: session.user, profile })
      } else {
        set({ user: null, profile: null })
      }
    })
  },

  signInWithGoogle: async () => {
    set({ error: null })
    const redirectTo = `${window.location.origin}/login`
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) {
      set({ error: error.message })
      return { error }
    }
    return { data }
  },

  signUp: async (email, password, nombre, telefono, direccion) => {
    set({ error: null })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, telefono, direccion },
      },
    })
    if (error) {
      set({ error: error.message })
      return { error }
    }
    return { data }
  },

  signIn: async (email, password) => {
    set({ error: null })
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      set({ error: error.message })
      return { error }
    }
    if (data?.user) {
      const { data: profile } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()

      set({ user: data.user, profile, error: null })
      return { data, profile }
    }
    return { data }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  updateProfile: async (updates) => {
    const user = get().user
    if (!user) return { error: 'No autenticado' }

    const { data, error } = await supabase
      .from('perfiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      set({ profile: data })
    }
    return { data, error }
  },

  isAdmin: () => {
    const profile = get().profile
    const user = get().user
    return (
      profile?.rol === 'admin' ||
      profile?.role === 'admin' ||
      user?.user_metadata?.rol === 'admin' ||
      user?.user_metadata?.role === 'admin' ||
      user?.email?.toLowerCase() === 'admin@micaprichosecreto.com' ||
      user?.email?.toLowerCase().includes('admin')
    )
  },
}))
