import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Package, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Edit3, 
  Check, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  MessageCircle,
  Truck,
  ArrowRight
} from 'lucide-react';
import { UserProfile, Order } from '../../types';
import { updateUserProfile, getUserOrders } from '../../services/userService';
import { updateFirestoreUserProfile, logOutFirebase } from '../../services/firebase';
import { setCurrentUser } from '../../services/dataService';
import { getOrderTrackingWhatsAppUrl } from '../../services/whatsappService';
import { ElegantInput } from '../common/ElegantInput';
import { GoldButton } from '../common/GoldButton';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  orders: Order[];
  onUserUpdated: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onTrackOrder: (orderCode: string) => void;
  onOpenAdmin?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  orders,
  onUserUpdated,
  onLogout,
  onTrackOrder,
  onOpenAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  
  // Profile edit form state
  const [nombre, setNombre] = useState(currentUser?.nombre || '');
  const [telefono, setTelefono] = useState(currentUser?.telefono || '');
  const [direccion, setDireccion] = useState(currentUser?.direccion_envio || '');
  const [barrio, setBarrio] = useState(currentUser?.barrio_localidad || '');
  const [notas, setNotas] = useState(currentUser?.notas || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state whenever modal opens or currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setNombre(currentUser.nombre || '');
      setTelefono(currentUser.telefono || '');
      setDireccion(currentUser.direccion_envio || '');
      setBarrio(currentUser.barrio_localidad || '');
      setNotas(currentUser.notas || '');
      setSaveSuccess(false);
      setErrorMsg('');
    }
  }, [currentUser, isOpen]);

  if (!currentUser) return null;

  const userOrders = getUserOrders(currentUser, orders);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = updateUserProfile(currentUser.id, {
        nombre,
        telefono,
        direccion_envio: direccion,
        barrio_localidad: barrio,
        notas
      });

      // Also persist to Firestore
      updateFirestoreUserProfile(currentUser.id, {
        nombre,
        telefono,
        direccion_envio: direccion,
        barrio_localidad: barrio,
        notas
      }).catch((err) => console.warn('Sync to firestore:', err));

      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'No se pudieron guardar los cambios.');
        setIsSaving(false);
        return;
      }

      setCurrentUser(res.user);
      onUserUpdated(res.user);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setErrorMsg('Error de conexión al actualizar datos.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: Order['estado']) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'En Preparación':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Listo':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Entregado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="user-profile-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            key="user-profile-modal-card"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#FCF8F6] rounded-3xl shadow-[0_20px_60px_rgba(26,13,22,0.45)] border border-rose-200/90 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header Banner */}
            <div className="relative p-6 sm:p-7 bg-gradient-to-r from-[#1A0D16] via-[#2D1122] to-[#1A0D16] text-[#FAF4F0] flex items-start justify-between border-b border-rose-900/40">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D83A73] to-[#E5A87B] text-white flex items-center justify-center text-xl font-serif font-bold shadow-md">
                  {currentUser.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {currentUser.nombre}
                    </h2>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      currentUser.rol === 'admin' 
                        ? 'bg-[#E5A87B]/20 text-[#E5A87B] border-[#E5A87B]/40' 
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {currentUser.rol === 'admin' ? 'Administrador' : 'Cliente Registrado'}
                    </span>
                  </div>
                  <p className="text-xs text-rose-200/80 flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5 text-[#E5A87B]" />
                    <span>{currentUser.email}</span>
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Cerrar ventana"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-rose-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-rose-200 bg-white/70 px-6 pt-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  activeTab === 'profile'
                    ? 'text-[#C02E62]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Mis Datos Personales</span>
                {activeTab === 'profile' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C02E62] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  activeTab === 'orders'
                    ? 'text-[#C02E62]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Mis Pedidos Artesanales</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-[#C02E62] font-mono">
                  {userOrders.length}
                </span>
                {activeTab === 'orders' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C02E62] rounded-full" />
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 sm:p-7 overflow-y-auto flex-1">
              {activeTab === 'profile' ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
                  {saveSuccess && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>¡Tus datos han sido actualizados y guardados exitosamente!</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ElegantInput
                      label="Dirección de Entrega habitual"
                      placeholder="Calle 127 # 15-45, Apto 402"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                    />

                    <ElegantInput
                      label="Barrio o Localidad (Bogotá)"
                      placeholder="Ej. Usaquén, Chicó, Chapinero"
                      value={barrio}
                      onChange={(e) => setBarrio(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Notas especiales para entregas o preferencias
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Dejar en recepción, alérgico a nueces, etc."
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-rose-200/80 rounded-2xl text-xs text-[#1A0D16] placeholder:text-stone-400 focus:outline-none focus:border-[#C02E62] focus:ring-1 focus:ring-[#C02E62]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-rose-100">
                    <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Almacenamiento seguro y privado</span>
                    </div>

                    <GoldButton
                      type="submit"
                      size="sm"
                      isLoading={isSaving}
                      className="px-6"
                    >
                      <span>Guardar Cambios</span>
                    </GoldButton>
                  </div>
                </form>
              ) : (
                /* Orders List */
                <div className="space-y-4">
                  {userOrders.length === 0 ? (
                    <div className="py-12 text-center bg-white rounded-3xl border border-rose-100 p-8">
                      <div className="w-14 h-14 rounded-full bg-rose-50 text-[#C02E62] flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#1A0D16]">
                        Aún no tienes pedidos registrados
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                        Cuando realices tu primera orden de yogur artesanal o repostería, podrás seguir su preparación aquí.
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white text-xs font-bold hover:brightness-105 transition-all cursor-pointer shadow-xs"
                      >
                        Explorar Menú
                      </button>
                    </div>
                  ) : (
                    userOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-rose-100 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow text-left"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-rose-100/70">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-[#1A0D16]">
                                #{order.codigo_orden}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(order.estado)}`}>
                                {order.estado}
                              </span>
                              {order.prioridad && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                  Prioridad
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-stone-400 mt-0.5 block">
                              {new Date(order.created_at).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-base text-[#1A0D16]">
                              ${order.total.toLocaleString('es-CO')}
                            </span>
                            <span className="text-[10px] text-stone-500 block">
                              {order.metodo_pago}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="py-3 space-y-1.5 text-xs text-stone-700">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span>
                                <strong className="font-mono">{item.cantidad}x</strong> {item.nombre}
                              </span>
                              <span className="font-mono text-stone-500">
                                ${item.subtotal.toLocaleString('es-CO')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Address & Actions */}
                        <div className="pt-3 border-t border-rose-100/70 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-[11px] text-stone-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#C02E62]" />
                            <span>{order.direccion_envio} ({order.barrio_localidad})</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <a
                              href={getOrderTrackingWhatsAppUrl(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            <button
                              onClick={() => {
                                onClose();
                                onTrackOrder(order.codigo_orden);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white text-xs font-bold hover:brightness-105 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Rastrear</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 bg-stone-50 border-t border-rose-200/80 flex flex-wrap items-center justify-between gap-3">
              <div>
                {currentUser.rol === 'admin' && onOpenAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1A0D16] text-[#E5A87B] hover:bg-[#2D1122] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Abrir Panel de Cocina & Clientes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={async () => {
                  try {
                    await logOutFirebase();
                  } catch (e) {
                    console.warn(e);
                  }
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
