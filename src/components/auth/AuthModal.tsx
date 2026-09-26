import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { setCurrentUser } from '../../services/dataService';
import { checkLockoutStatus } from '../../services/securityService';
import { registerUserAccount, authenticateUser } from '../../services/userService';
import { signInWithGoogle, signInWithEmail, registerWithEmail } from '../../services/firebase';
import { ElegantInput } from '../common/ElegantInput';
import { GoldButton } from '../common/GoldButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Check lockout on open & interval
  useEffect(() => {
    const { isLocked, remainingSeconds } = checkLockoutStatus();
    if (isLocked) {
      setLockoutRemaining(remainingSeconds);
    }
  }, [isOpen]);

  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check brute-force guard
    const { isLocked, remainingSeconds } = checkLockoutStatus();
    if (isLocked) {
      setLockoutRemaining(remainingSeconds);
      setError(`Acceso restringido temporalmente por seguridad. Espera ${remainingSeconds} segundos.`);
      return;
    }

    setIsVerifying(true);

    try {
      if (mode === 'login') {
        // 1. Try Firebase Auth
        const fbRes = await signInWithEmail(email, password);
        if (fbRes.success && fbRes.user) {
          setCurrentUser(fbRes.user);
          onAuthSuccess(fbRes.user);
          onClose();
          return;
        }

        // 2. Fallback to local authentication (including cryptographic master admin SHA-256 check)
        const result = await authenticateUser(email, password);
        if (result.success && result.user) {
          setCurrentUser(result.user);
          onAuthSuccess(result.user);
          onClose();
          return;
        }

        setError(fbRes.error || result.error || 'Credenciales inválidas.');
      } else {
        // Register customer in Firebase
        const fbRes = await registerWithEmail({
          nombre,
          email,
          pass: password,
          telefono,
          direccion,
          barrio
        });

        if (fbRes.success && fbRes.user) {
          // Also save in local cache
          await registerUserAccount({
            nombre,
            email,
            password,
            telefono,
            direccion_envio: direccion,
            barrio_localidad: barrio
          });

          setCurrentUser(fbRes.user);
          onAuthSuccess(fbRes.user);
          onClose();
          return;
        }

        // Fallback to local user account registration
        const result = await registerUserAccount({
          nombre,
          email,
          password,
          telefono,
          direccion_envio: direccion,
          barrio_localidad: barrio
        });

        if (!result.success || !result.user) {
          setError(fbRes.error || result.error || 'No se pudo crear la cuenta.');
          return;
        }

        setCurrentUser(result.user);
        onAuthSuccess(result.user);
        onClose();
      }
    } catch (err) {
      setError('Ocurrió un error al procesar la solicitud.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        setCurrentUser(res.user);
        onAuthSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'No se pudo iniciar sesión con Google.');
      }
    } catch {
      setError('Error al conectar con Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            key="auth-modal-dialog"
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-[#FAF4F0] rounded-3xl shadow-[0_20px_60px_rgba(26,13,22,0.4)] border border-rose-200/80 overflow-hidden my-auto"
          >
            {/* Subtle decorative glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-[#E5A87B]/30 to-[#D83A73]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-rose-100 flex items-center justify-between bg-white/90 backdrop-blur-sm relative z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FAF0EC] to-[#FCE7EF] border border-rose-200/80 flex items-center justify-center text-[#C02E62] shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="auth-modal-title" className="font-serif text-2xl font-bold text-[#1A0D16] tracking-tight">
                    {currentUser ? 'Cuenta Personal' : 'Acceso Privado'}
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {currentUser ? 'Gestión de perfil y pedidos' : 'Ingresa a tu experiencia en Mi Capricho'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentUser ? (
              /* Profile view */
              <div className="p-5 sm:p-6 space-y-5 text-left relative z-10 overflow-y-auto flex-1">
                <div className="p-5 bg-white/95 rounded-2xl border border-rose-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-lg text-[#1A0D16]">
                      {currentUser.nombre}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        currentUser.rol === 'admin'
                          ? 'bg-gradient-to-r from-[#1A0D16] to-[#351225] text-[#E5A87B] border border-[#E5A87B]/50'
                          : 'bg-rose-100 text-[#C02E62]'
                      }`}
                    >
                      {currentUser.rol === 'admin' ? 'Administrador Maestro' : 'Cliente Exclusivo'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-mono">{currentUser.email}</p>
                  {currentUser.telefono && (
                    <p className="text-xs text-stone-500 font-mono">Teléfono: {currentUser.telefono}</p>
                  )}
                  {currentUser.direccion_envio && (
                    <p className="text-xs text-stone-500">Dirección: {currentUser.direccion_envio}</p>
                  )}
                </div>

                <GoldButton
                  variant="outline"
                  size="md"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full text-rose-700 border-rose-300 hover:bg-rose-50"
                >
                  Cerrar Sesión
                </GoldButton>
              </div>
            ) : (
              /* Login / Register tabs */
              <div className="p-5 sm:p-6 relative z-10 overflow-y-auto flex-1 overscroll-contain">
                {/* Mode Tabs */}
                <div className="flex rounded-2xl bg-stone-200/60 p-1 mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      mode === 'login' 
                        ? 'bg-white text-[#1A0D16] shadow-sm' 
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      mode === 'register' 
                        ? 'bg-white text-[#1A0D16] shadow-sm' 
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Nuevo Cliente
                  </button>
                </div>

                {/* Google Sign-in Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || lockoutRemaining > 0}
                  className="w-full py-2.5 px-4 mb-3 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isGoogleLoading ? 'Iniciando con Google...' : 'Continuar con Google'}</span>
                </button>

                <div className="relative flex items-center justify-center my-3.5">
                  <div className="border-t border-stone-200/80 w-full" />
                  <span className="bg-[#FAF5F2] px-3 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                    o con correo electrónico
                  </span>
                </div>

                {/* Lockout Warning */}
                {lockoutRemaining > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950 text-white border border-rose-800 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Bloqueo de seguridad activo: espera {lockoutRemaining} segundos.</span>
                  </div>
                )}

                {error && lockoutRemaining === 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  {mode === 'register' && (
                    <>
                      <ElegantInput
                        label="Nombre Completo"
                        placeholder="Tu nombre y apellido"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                      />

                      <ElegantInput
                        label="Teléfono WhatsApp"
                        placeholder="Ej. 3142748881"
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        required
                      />

                      <ElegantInput
                        label="Dirección en Bogotá (Opcional)"
                        placeholder="Calle 127 # 15-45"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                      />

                      <ElegantInput
                        label="Barrio o Localidad en Bogotá (Opcional)"
                        placeholder="Ej. Usaquén, Chapinero, Rosales"
                        value={barrio}
                        onChange={(e) => setBarrio(e.target.value)}
                      />
                    </>
                  )}

                  <ElegantInput
                    label="Correo Electrónico"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />

                  <ElegantInput
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <GoldButton
                    type="submit"
                    size="lg"
                    disabled={lockoutRemaining > 0 || isVerifying}
                    isLoading={isVerifying}
                    className="w-full mt-4 flex items-center justify-center gap-2"
                  >
                    <span>{mode === 'login' ? 'Entrar al Menú Privado' : 'Crear Mi Cuenta'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </GoldButton>
                </form>

                <div className="mt-5 pb-3 text-center">
                  <span className="text-[11px] text-stone-500 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Cifrado criptográfico seguro y protección de datos
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
