import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../store/authStore'

const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registerSchema = z.object({
  nombre: z.string().min(2, 'Ingresa tu nombre'),
  email: z.string().email('Correo inválido'),
  telefono: z.string().min(7, 'Teléfono inválido'),
  direccion: z.string().min(5, 'Ingresa tu dirección'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login')
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const { signIn, signUp } = useAuthStore()

  const schema = mode === 'login' ? loginSchema : registerSchema
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) })

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setServerError(null)
    setSuccessMsg(null)
    reset()
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    setServerError(null)

    if (mode === 'login') {
      const result = await signIn(data.email, data.password)
      if (result.error) {
        setServerError(result.error.message || 'Credenciales incorrectas')
      } else {
        onClose()
      }
    } else {
      const result = await signUp(data.email, data.password, data.nombre, data.telefono, data.direccion)
      if (result.error) {
        setServerError(result.error.message || 'Error al registrarse')
      } else {
        setSuccessMsg('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.')
      }
    }

    setSubmitting(false)
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="modal-container"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>

        <h2 className="modal-title">
          {mode === 'login' ? 'Bienvenida de vuelta' : 'Crea tu cuenta'}
        </h2>
        <p className="modal-subtitle">
          {mode === 'login'
            ? 'Ingresa para acceder a tus caprichos'
            : 'Regístrate para empezar a pedir'}
        </p>

        {successMsg && (
          <div style={{
            background: '#E8F5E9',
            color: '#2E7D32',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            {successMsg}
          </div>
        )}

        {serverError && (
          <div style={{
            background: '#FFEBEE',
            color: '#C62828',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          {mode === 'register' && (
            <div className="form-group">
              <input
                className="form-input"
                type="text"
                placeholder=" "
                {...register('nombre')}
                id="auth-nombre"
              />
              <label className="form-label" htmlFor="auth-nombre">Nombre completo</label>
              {errors.nombre && <p className="form-error">{errors.nombre.message}</p>}
            </div>
          )}

          <div className="form-group">
            <input
              className="form-input"
              type="email"
              placeholder=" "
              {...register('email')}
              id="auth-email"
            />
            <label className="form-label" htmlFor="auth-email">Correo electrónico</label>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          {mode === 'register' && (
            <>
              <div className="form-group">
                <input
                  className="form-input"
                  type="tel"
                  placeholder=" "
                  {...register('telefono')}
                  id="auth-telefono"
                />
                <label className="form-label" htmlFor="auth-telefono">Teléfono</label>
                {errors.telefono && <p className="form-error">{errors.telefono.message}</p>}
              </div>

              <div className="form-group">
                <input
                  className="form-input"
                  type="text"
                  placeholder=" "
                  {...register('direccion')}
                  id="auth-direccion"
                />
                <label className="form-label" htmlFor="auth-direccion">Dirección de entrega</label>
                {errors.direccion && <p className="form-error">{errors.direccion.message}</p>}
              </div>
            </>
          )}

          <div className="form-group">
            <input
              className="form-input"
              type="password"
              placeholder=" "
              {...register('password')}
              id="auth-password"
            />
            <label className="form-label" htmlFor="auth-password">Contraseña</label>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <input
                className="form-input"
                type="password"
                placeholder=" "
                {...register('confirmPassword')}
                id="auth-confirm-password"
              />
              <label className="form-label" htmlFor="auth-confirm-password">Confirmar contraseña</label>
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
            </div>
          )}

          <button
            type="submit"
            className="btn-rose"
            disabled={submitting}
            style={{ width: '100%', marginTop: '8px' }}
            id="auth-submit-btn"
          >
            {submitting ? (
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
            ) : (
              mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
            )}
          </button>
        </form>

        <p className="modal-switch">
          {mode === 'login' ? (
            <>¿No tienes cuenta? <button onClick={switchMode}>Regístrate</button></>
          ) : (
            <>¿Ya tienes cuenta? <button onClick={switchMode}>Inicia sesión</button></>
          )}
        </p>
      </motion.div>
    </motion.div>
  )
}
