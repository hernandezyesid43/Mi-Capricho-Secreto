import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, ShieldCheck, CreditCard, Banknote, CheckCircle2 } from 'lucide-react';
import { CartItem, PaymentMethod, UserProfile, Order } from '../../types';
import { ElegantInput } from '../common/ElegantInput';
import { GoldButton } from '../common/GoldButton';
import { createNewOrder } from '../../services/dataService';
import { saveOrderToFirestore } from '../../services/firebase';
import { sanitizeText } from '../../services/securityService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentUser: UserProfile | null;
  onOrderCompleted: (order: Order) => void;
}

const LOCALIDADES_BOGOTA = [
  'Usaquén',
  'Chapinero',
  'Santa Fe',
  'San Cristóbal',
  'Usme',
  'Tunjuelito',
  'Bosa',
  'Kennedy',
  'Fontibón',
  'Engativá',
  'Suba',
  'Barrios Unidos',
  'Teusaquillo',
  'Los Mártires',
  'Antonio Nariño',
  'Puente Aranda',
  'Candelaria',
  'Rafael Uribe Uribe',
  'Ciudad Bolívar'
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  onOrderCompleted
}) => {
  const [nombre, setNombre] = useState(currentUser?.nombre || '');
  const [telefono, setTelefono] = useState(currentUser?.telefono || '');
  const [direccion, setDireccion] = useState(currentUser?.direccion_envio || '');
  const [localidad, setLocalidad] = useState(currentUser?.barrio_localidad || 'Usaquén');
  const [notas, setNotas] = useState('');
  const [metodoPago, setMetodoPago] = useState<PaymentMethod>('Contra entrega');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sincronizar datos si el usuario autenticado cambia
  useEffect(() => {
    if (currentUser) {
      if (currentUser.nombre) setNombre(currentUser.nombre);
      if (currentUser.telefono) setTelefono(currentUser.telefono);
      if (currentUser.direccion_envio) setDireccion(currentUser.direccion_envio);
      if (currentUser.barrio_localidad) setLocalidad(currentUser.barrio_localidad);
    }
  }, [currentUser]);

  // Cerrar al presionar la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleCloseModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const total = items.reduce((sum, i) => sum + i.product.precio * i.cantidad, 0);
  const maxPrepDays = items.length > 0
    ? Math.max(...items.map((i) => i.product.tiempo_preparacion_dias))
    : 1;

  const validate = () => {
    const errs: Record<string, string> = {};
    const cleanNombre = nombre.trim();
    const cleanTel = telefono.replace(/\s+/g, '');
    const cleanDir = direccion.trim();

    if (!cleanNombre) errs.nombre = 'El nombre completo es requerido';
    if (!cleanTel) {
      errs.telefono = 'El teléfono de contacto es requerido';
    } else if (!/^[0-9]{7,12}$/.test(cleanTel)) {
      errs.telefono = 'Ingresa un número telefónico válido (ej. 3142748881)';
    }
    if (!cleanDir) errs.direccion = 'La dirección de entrega en Bogotá es requerida';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Sanitización contra inyecciones maliciosas
      const sanitizedNombre = sanitizeText(nombre);
      const sanitizedTelefono = sanitizeText(telefono.replace(/\s+/g, ''));
      const sanitizedDireccion = sanitizeText(direccion);
      const sanitizedNotas = sanitizeText(notas);

      const orderPayload = {
        usuario_id: currentUser ? currentUser.id : `guest_${Date.now()}`,
        cliente_nombre: sanitizedNombre,
        cliente_telefono: sanitizedTelefono,
        direccion_envio: sanitizedDireccion,
        barrio_localidad: localidad,
        notas_entrega: sanitizedNotas || undefined,
        items: items.map((i) => ({
          producto_id: i.product.id,
          nombre: i.product.nombre,
          cantidad: i.cantidad,
          precio_unitario: i.product.precio,
          subtotal: i.product.precio * i.cantidad,
          tiempo_preparacion_dias: i.product.tiempo_preparacion_dias
        })),
        total,
        metodo_pago: metodoPago,
        estado: 'Pendiente' as const,
        prioridad: false,
        tiempo_estimado_dias: maxPrepDays
      };

      // 1. Guardar el pedido en el estado reactivo / store local
      const createdOrder = createNewOrder(orderPayload);

      // 2. Guardar formalmente en la base de datos (Firestore / Supabase)
      await saveOrderToFirestore(createdOrder).catch((err) => {
        console.warn('Sync order:', err);
      });

      // 3. Mostrar pantalla de éxito interna en la página
      setCompletedOrder(createdOrder);
      setIsOrderCompleted(true);
      onOrderCompleted(createdOrder);

    } catch (err) {
      console.error('Error al procesar el pedido:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsOrderCompleted(false);
    setCompletedOrder(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="checkout-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <motion.div
            key="checkout-modal-dialog"
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#FAF4F0] rounded-3xl shadow-2xl border border-rose-200/80 overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Cabecera del Modal */}
            <div className="p-6 border-b border-rose-100 flex items-center justify-between bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FAF0EC] to-[#FCE7EF] flex items-center justify-center text-[#C02E62] shadow-xs">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="checkout-modal-title" className="font-serif text-xl font-bold text-[#1A0D16]">
                    {isOrderCompleted ? '¡Pedido Confirmado!' : 'Finalizar Pedido en Bogotá'}
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {isOrderCompleted ? 'Tu orden ya ingresó a nuestro sistema de cocina' : 'Confirmación directa y despacho artesanal'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del Modal: Cambia entre el Formulario y la Confirmación Final */}
            {isOrderCompleted ? (
              /* PANTALLA DE ÉXITO PÚBLICA EN LA MISMA TIENDA */
              <div className="p-8 text-center space-y-5 overflow-y-auto">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-[#1A0D16]">
                    ¡Muchas gracias, {nombre.split(' ')[0]}!
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
                    Hemos recibido tu pedido correctamente. Nuestro equipo artesanal comenzará la preparación especial para entregártelo fresco en <strong>{localidad}</strong>.
                  </p>
                </div>

                {completedOrder && (
                  <div className="p-4 bg-white rounded-2xl border border-rose-100/80 text-left space-y-2 text-xs text-stone-600 shadow-2xs">
                    <div className="flex justify-between border-b pb-2 font-semibold text-[#1A0D16]">
                      <span>Resumen de la Orden</span>
                      <span className="text-[#C02E62]">${completedOrder.total.toLocaleString('es-CO')} COP</span>
                    </div>
                    <p><strong>Dirección:</strong> {completedOrder.direccion_envio}</p>
                    <p><strong>Método de Pago:</strong> {completedOrder.metodo_pago}</p>
                    <p><strong>Contacto:</strong> {completedOrder.cliente_telefono}</p>
                  </div>
                )}

                <div className="pt-2">
                  <GoldButton
                    onClick={handleCloseModal}
                    size="lg"
                    className="w-full bg-[#1A0D16] hover:bg-[#2e1727] text-white shadow-md"
                  >
                    Volver a la Tienda
                  </GoldButton>
                </div>

                <p className="text-[11px] text-stone-400 text-center flex items-center justify-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Registro seguro en el panel administrativo
                </p>
              </div>
            ) : (
              /* FORMULARIO DE CAPTURA DE DATOS */
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-left">
                {/* Banner Informativo */}
                <div className="p-3.5 bg-gradient-to-br from-white to-rose-50/70 border border-rose-200/80 rounded-2xl flex items-start gap-3 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-[#C02E62] shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-[#1A0D16] block">
                      Tiempo de preparación artesanal: {maxPrepDays} {maxPrepDays === 1 ? 'día' : 'días'} hábiles
                    </span>
                    <span className="text-stone-600 text-[11px] leading-relaxed block mt-0.5">
                      Tus yogures y postres se fermentan y hornean a pedido para garantizar máxima pureza sin conservantes.
                    </span>
                  </div>
                </div>

                {/* Campos de Nombre y Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <ElegantInput
                    label="Nombre y Apellidos"
                    placeholder="Ej. Carolina Montoya"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    error={errors.nombre}
                  />

                  <ElegantInput
                    label="Teléfono de Contacto"
                    placeholder="Ej. 3142748881"
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    error={errors.telefono}
                  />
                </div>

                {/* Ubicación de Entrega */}
                <div className="space-y-3.5 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="localidad-select" className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Zona / Localidad en Bogotá
                    </label>
                    <select
                      id="localidad-select"
                      value={localidad}
                      onChange={(e) => setLocalidad(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-rose-200/80 rounded-xl text-sm text-[#1A0D16] focus:outline-none focus:border-[#C02E62] focus:ring-1 focus:ring-[#C02E62]"
                    >
                      {LOCALIDADES_BOGOTA.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <ElegantInput
                    label="Dirección Completa de Despacho"
                    placeholder="Ej. Calle 116 # 18B-24, Apto 502"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    error={errors.direccion}
                    helperText="Despacho exclusivo en el perímetro urbano de Bogotá D.C."
                  />

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="notas-entrega" className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Instrucciones de Entrega (Opcional)
                    </label>
                    <textarea
                      id="notas-entrega"
                      rows={2}
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Ej. Dejar en recepción de Torre 3, o timbrar en casa blanca con reja."
                      className="w-full px-3.5 py-2.5 bg-white border border-rose-200/80 rounded-xl text-sm text-[#1A0D16] placeholder:text-stone-400 focus:outline-none focus:border-[#C02E62] focus:ring-1 focus:ring-[#C02E62]"
                    />
                  </div>
                </div>

                {/* Método de Pago */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-2">
                    Método de Pago Preferido
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMetodoPago('Contra entrega')}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${metodoPago === 'Contra entrega'
                          ? 'border-[#C02E62] bg-white ring-2 ring-[#C02E62]/30 shadow-xs'
                          : 'border-rose-100 hover:border-rose-200 bg-white/70'
                        }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#C02E62] shrink-0">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1A0D16]">Contra entrega</p>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">Efectivo o datáfono al recibir</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMetodoPago('Transferencia bancaria')}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${metodoPago === 'Transferencia bancaria'
                          ? 'border-[#C02E62] bg-white ring-2 ring-[#C02E62]/30 shadow-xs'
                          : 'border-rose-100 hover:border-rose-200 bg-white/70'
                        }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#C02E62] shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1A0D16]">Transferencia</p>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">Nequi, Daviplata o Bancolombia</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Resumen Final y Botón de Acción */}
                <div className="pt-4 border-t border-rose-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs text-stone-500 font-medium">Total de la Orden:</span>
                      <p className="font-mono tabular-nums text-2xl font-bold text-[#C02E62]">
                        ${total.toLocaleString('es-CO')} COP
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-stone-600 bg-rose-100/60 px-3 py-1 rounded-full">
                      {items.length} {items.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>

                  <GoldButton
                    type="submit"
                    size="lg"
                    isLoading={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#C02E62] hover:bg-[#a0244f] text-white shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirmar Pedido</span>
                  </GoldButton>

                  <p className="text-[11px] text-stone-500 text-center mt-3 flex items-center justify-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Registro seguro en el sistema de producción
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};