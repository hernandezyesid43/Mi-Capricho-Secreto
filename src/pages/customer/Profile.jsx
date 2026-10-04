import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../components/ui/ToastContainer'

const profileSchema = z.object({
  nombre: z.string().min(2, 'Ingresa tu nombre'),
  telefono: z.string().min(7, 'Teléfono inválido'),
  direccion: z.string().min(5, 'Ingresa tu dirección'),
})

export default function Profile() {
  const { user, profile, updateProfile, loading } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (!loading && !user) {
      navigate('/')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (profile) {
      reset({
        nombre: profile.nombre || '',
        telefono: profile.telefono || '',
        direccion: profile.direccion || '',
      })
    }
  }, [profile, reset])

  const onSubmit = async (data) => {
    const { error } = await updateProfile(data)
    if (error) {
      addToast('Error al actualizar el perfil: ' + error.message, 'error')
    } else {
      addToast('Perfil actualizado con éxito', 'success')
    }
  }

  if (!user || loading) return null

  return (
    <motion.div
      className="page-transition profile-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="section-header">
        <h2>Mi Perfil</h2>
        <p>Administra tu información personal y preferencias de entrega.</p>
      </div>

      <div className="profile-section">
        <form className="profile-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              className="form-input"
              type="text"
              placeholder=" "
              {...register('nombre')}
              id="profile-nombre"
            />
            <label className="form-label" htmlFor="profile-nombre">Nombre completo</label>
            {errors.nombre && <p className="form-error">{errors.nombre.message}</p>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              className="form-input"
              type="tel"
              placeholder=" "
              {...register('telefono')}
              id="profile-telefono"
            />
            <label className="form-label" htmlFor="profile-telefono">Teléfono</label>
            {errors.telefono && <p className="form-error">{errors.telefono.message}</p>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              className="form-input"
              type="text"
              placeholder=" "
              {...register('direccion')}
              id="profile-direccion"
            />
            <label className="form-label" htmlFor="profile-direccion">Dirección de entrega</label>
            {errors.direccion && <p className="form-error">{errors.direccion.message}</p>}
          </div>

          <button
            type="submit"
            className="btn-rose"
            disabled={isSubmitting}
            style={{ justifySelf: 'start', marginTop: '16px' }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
