import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const loginSchema = z.object({
  email: z.string().email('Por favor ingresa un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

const registerSchema = z.object({
  nombre: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Por favor ingresa un correo válido'),
  telefono: z.string().min(7, 'Ingresa un número telefónico válido'),
  direccion: z.string().min(5, 'Ingresa tu dirección de entrega'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export default function LoginPage() {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const { signIn, signUp, user, profile, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Si ya está autenticado, redirigir según su rol
  useEffect(() => {
    if (user) {
      if (isAdmin()) {
        navigate('/mcs-management', { replace: true })
      } else {
        const from = location.state?.from?.pathname || '/catalogo'
        navigate(from, { replace: true })
      }
    }
  }, [user, profile, navigate, location, isAdmin])

  const schema = tab === 'login' ? loginSchema : registerSchema
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  const handleTabChange = (newTab) => {
    setTab(newTab)
    setServerError(null)
    setSuccessMsg(null)
    reset()
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    setServerError(null)
    setSuccessMsg(null)

    try {
      if (tab === 'login') {
        const res = await signIn(data.email.trim(), data.password)
        if (res?.error) {
          setServerError(
            res.error.message?.includes('Invalid login credentials')
              ? 'Correo electrónico o contraseña incorrectos'
              : res.error.message || 'Error al iniciar sesión'
          )
        } else {
          // Determinar redirección tras login
          const userProfile = res?.profile
          const userObj = res?.data?.user
          const isUserAdmin =
            userProfile?.rol === 'admin' ||
            userProfile?.role === 'admin' ||
            userObj?.user_metadata?.rol === 'admin' ||
            userObj?.user_metadata?.role === 'admin' ||
            data.email.trim().toLowerCase().includes('admin')

          if (isUserAdmin) {
            navigate('/mcs-management', { replace: true })
          } else {
            const from = location.state?.from?.pathname || '/catalogo'
            navigate(from, { replace: true })
          }
        }
      } else {
        const res = await signUp(
          data.email.trim(),
          data.password,
          data.nombre.trim(),
          data.telefono.trim(),
          data.direccion.trim()
        )
        if (res?.error) {
          setServerError(res.error.message || 'Error al registrar tu cuenta')
        } else {
          setSuccessMsg(
            '¡Tu cuenta ha sido creada exitosamente! Puedes iniciar sesión a continuación.'
          )
          setTab('login')
          reset()
        }
      }
    } catch {
      setServerError('Ocurrió un error inesperado. Por favor intenta nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      className="page-transition auth-page-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="auth-ambient-glow auth-glow-1" />
      <div className="auth-ambient-glow auth-glow-2" />

      <div className="auth-card-container">
        <div className="auth-card-header">
          <Link to="/" className="auth-brand-logo">
            Mi Capricho <span>Secreto</span>
          </Link>
          <p className="auth-card-subtitle">
            {tab === 'login'
              ? 'Accede para gestionar tus pedidos y caprichos favoritos'
              : 'Regístrate y disfruta de una experiencia gastronómica exclusiva'}
          </p>
        </div>

        {/* Selector de Pestañas */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
          >
            Registrarse
          </button>
        </div>

        {/* Mensajes de Feedback */}
        <AnimatePresence mode="wait">
          {successMsg && (
            <motion.div
              className="auth-feedback-box success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircle2 size={18} className="feedback-icon" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {serverError && (
            <motion.div
              className="auth-feedback-box error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle size={18} className="feedback-icon" />
              <span>{serverError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-input-label" htmlFor="register-nombre">
                <User size={15} /> Nombre Completo
              </label>
              <input
                id="register-nombre"
                type="text"
                placeholder="Ej: Laura Gómez"
                className={`form-input-field ${errors.nombre ? 'input-error' : ''}`}
                {...register('nombre')}
              />
              {errors.nombre && (
                <p className="form-error-msg">{errors.nombre.message}</p>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-input-label" htmlFor="auth-email">
              <Mail size={15} /> Correo Electrónico
            </label>
            <input
              id="auth-email"
              type="email"
              placeholder="tu.correo@ejemplo.com"
              className={`form-input-field ${errors.email ? 'input-error' : ''}`}
              {...register('email')}
            />
            {errors.email && (
              <p className="form-error-msg">{errors.email.message}</p>
            )}
          </div>

          {tab === 'register' && (
            <>
              <div className="form-group">
                <label className="form-input-label" htmlFor="register-telefono">
                  <Phone size={15} /> Teléfono / WhatsApp
                </label>
                <input
                  id="register-telefono"
                  type="tel"
                  placeholder="Ej: 3001234567"
                  className={`form-input-field ${errors.telefono ? 'input-error' : ''}`}
                  {...register('telefono')}
                />
                {errors.telefono && (
                  <p className="form-error-msg">{errors.telefono.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-input-label" htmlFor="register-direccion">
                  <MapPin size={15} /> Dirección de Entrega
                </label>
                <input
                  id="register-direccion"
                  type="text"
                  placeholder="Ej: Calle 123 # 45-67, Apto 302"
                  className={`form-input-field ${errors.direccion ? 'input-error' : ''}`}
                  {...register('direccion')}
                />
                {errors.direccion && (
                  <p className="form-error-msg">{errors.direccion.message}</p>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-input-label" htmlFor="auth-password">
              <Lock size={15} /> Contraseña
            </label>
            <div className="input-password-wrapper">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`form-input-field ${errors.password ? 'input-error' : ''}`}
                {...register('password')}
              />
              <button
                type="button"
                className="btn-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="form-error-msg">{errors.password.message}</p>
            )}
          </div>

          {tab === 'register' && (
            <div className="form-group">
              <label className="form-input-label" htmlFor="auth-confirm-password">
                <ShieldCheck size={15} /> Confirmar Contraseña
              </label>
              <input
                id="auth-confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`form-input-field ${errors.confirmPassword ? 'input-error' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="form-error-msg">{errors.confirmPassword.message}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn-rose auth-submit-btn"
            disabled={submitting}
            id="auth-main-submit-btn"
          >
            {submitting ? (
              <div className="spinner-sm" />
            ) : (
              <>
                <span>{tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          {tab === 'login' ? (
            <p>
              ¿Aún no tienes cuenta?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => handleTabChange('register')}
              >
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => handleTabChange('login')}
              >
                Inicia sesión aquí
              </button>
            </p>
          )}

          <div className="auth-back-home">
            <Link to="/">← Regresar a la página principal</Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
