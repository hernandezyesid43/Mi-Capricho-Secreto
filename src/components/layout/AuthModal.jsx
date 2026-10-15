import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../services/supabase' // Asegúrate de que esta ruta a supabase sea correcta

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

  // 1. LÓGICA DE AUTENTICACIÓN CON GOOGLE
  const handleGoogleLogin = async () => {
    try {
      setServerError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) throw error
    } catch (err) {
      console.error('Error con Google Auth:', err)
      setServerError(err.message || 'No se pudo conectar con Google')
    }
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

        {/* 2. BOTÓN VISUAL DE GOOGLE CON LÍNEA DIVISORIA */}
        <div style={{ marginBottom: '20px', marginTop: '16px' }}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #E0E0E0',
              borderRadius: '12px',
              background: '#FFFFFF',
              color: '#333333',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
            }}
            id="google-auth-modal-btn"
          >
            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '18px 0',
            gap: '12px',
          }}>
            <div style={{ flex: 1, height: '1px', background: '#EEEEEE' }} />
            <span style={{ fontSize: '12px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              o con tu correo
            </span>
            <div style={{ flex: 1, height: '1px', background: '#EEEEEE' }} />
          </div>
        </div>

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