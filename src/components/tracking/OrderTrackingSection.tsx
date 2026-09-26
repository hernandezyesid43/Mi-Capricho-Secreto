import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  PackageSearch,
  ChefHat,
  Sparkles,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  CreditCard,
  MessageCircle,
  AlertCircle,
  RotateCcw,
  Flame,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { getOrderTrackingWhatsAppUrl } from '../../services/whatsappService';

interface OrderTrackingSectionProps {
  orders: Order[];
  initialOrderCode?: string | null;
}

const ORDER_STEPS: {
  status: OrderStatus;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    status: 'Pendiente',
    title: 'Orden Recibida',
    description: 'Registrada en nuestro sistema y en cola de producción artesanal.',
    icon: CheckCircle2
  },
  {
    status: 'En Preparación',
    title: 'En Obrador / Fermentación',
    description: 'Cultivos lácticos vivos en paño o repostería en horno.',
    icon: ChefHat
  },
  {
    status: 'Listo',
    title: 'Listo para Despacho',
    description: 'Envasado fresco y resguardado bajo cadena de frío para entrega.',
    icon: Sparkles
  },
  {
    status: 'Entregado',
    title: 'Entregado a Satisfacción',
    description: 'Recibido en tu puerta en Bogotá. ¡Que lo disfrutes!',
    icon: Truck
  }
];

export const OrderTrackingSection: React.FC<OrderTrackingSectionProps> = ({
  orders,
  initialOrderCode
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderCode || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // If initialOrderCode is passed or changes (e.g. from checkout), look it up
  useEffect(() => {
    if (initialOrderCode) {
      setSearchInput(initialOrderCode);
      lookupOrder(initialOrderCode);
    }
  }, [initialOrderCode, orders]);

  // Keep selected order synced with live orders array in real-time
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find((o) => o.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      }
    }
  }, [orders]);

  const lookupOrder = (codeOrId: string) => {
    const query = codeOrId.trim();
    if (!query) {
      setSelectedOrder(null);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    const cleaned = query.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const found = orders.find((o) => {
      const oCodeClean = o.codigo_orden.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const oIdStr = String(o.id);
      return (
        oCodeClean === cleaned ||
        o.codigo_orden.toUpperCase() === query.toUpperCase() ||
        oIdStr === query ||
        o.cliente_telefono.includes(query)
      );
    });

    setSelectedOrder(found || null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupOrder(searchInput);
  };

  const handleSelectSample = (code: string) => {
    setSearchInput(code);
    lookupOrder(code);
  };

  // Helper to determine step status index
  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'Pendiente':
        return 0;
      case 'En Preparación':
        return 1;
      case 'Listo':
        return 2;
      case 'Entregado':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIndex = selectedOrder ? getStepIndex(selectedOrder.estado) : -1;

  // Status-specific badges and descriptions
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pendiente':
        return {
          label: 'Orden Confirmada · En Espera',
          classes: 'bg-amber-50 text-amber-800 border-amber-200/90',
          dot: 'bg-amber-500'
        };
      case 'En Preparación':
        return {
          label: 'En Preparación Lenta en Cocina',
          classes: 'bg-rose-50 text-[#C02E62] border-rose-200/90 shadow-2xs',
          dot: 'bg-[#D83A73] animate-pulse'
        };
      case 'Listo':
        return {
          label: 'Envasado & Listo para Despacho',
          classes: 'bg-purple-50 text-purple-800 border-purple-200/90 shadow-2xs',
          dot: 'bg-purple-600 animate-ping'
        };
      case 'Entregado':
        return {
          label: 'Pedido Entregado con Éxito',
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
          dot: 'bg-emerald-600'
        };
      default:
        return {
          label: status,
          classes: 'bg-stone-50 text-stone-700 border-stone-200',
          dot: 'bg-stone-400'
        };
    }
  };

  return (
    <section
      id="rastreo"
      className="py-20 bg-gradient-to-b from-[#FCF8F6] via-[#FAF2EE] to-[#FCF8F6] border-t border-rose-100/90 relative overflow-hidden"
    >
      {/* Decorative ambient auras */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-gradient-to-tr from-[#D83A73]/10 to-[#E5A87B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-gradient-to-bl from-[#C02E62]/10 to-[#F5D3B3]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3.5 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 border border-rose-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#D83A73] animate-pulse" />
            <span className="text-[11px] font-bold text-[#C02E62] tracking-wider uppercase">
              Rastreo en Tiempo Real
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A0D16] tracking-tight">
            Sigue el Estado de tu Capricho
          </h2>

          <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Monitorea el proceso de fermentación lenta en paño, horneado y empaque fresco en nuestro obrador de Bogotá.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-[0_8px_30px_rgba(26,13,22,0.04)] mb-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <PackageSearch className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ingresa tu código de orden (ej: CAP-101, CAP-102 o 101)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-rose-50/40 border border-rose-200/80 rounded-2xl text-sm font-medium text-[#1A0D16] placeholder:text-stone-400 focus:outline-none focus:border-[#C02E62] focus:ring-2 focus:ring-[#C02E62]/10 transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-[#D83A73] via-[#C02E62] to-[#A32252] text-white font-bold text-sm rounded-2xl shadow-[0_4px_16px_rgba(216,58,115,0.3)] hover:shadow-[0_6px_22px_rgba(216,58,115,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Consultar Estado</span>
            </button>
          </form>

          {/* Quick example badges */}
          <div className="mt-4 pt-4 border-t border-rose-100/70 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Órdenes de demostración:</span>
            {orders.slice(0, 3).map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => handleSelectSample(order.codigo_orden)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border ${
                  selectedOrder?.id === order.id
                    ? 'bg-[#1A0D16] text-[#E5A87B] border-[#1A0D16]'
                    : 'bg-rose-50/70 text-stone-700 border-rose-200/60 hover:bg-rose-100/70 hover:border-rose-300'
                }`}
              >
                #{order.codigo_orden} ({order.estado})
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display Area */}
        <AnimatePresence mode="wait">
          {selectedOrder ? (
            /* ORDER FOUND CARD */
            <motion.div
              key={`order-${selectedOrder.id}-${selectedOrder.estado}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Order Status Hero Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100/90 shadow-[0_8px_30px_rgba(26,13,22,0.05)] text-left">
                
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rose-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      <span className="text-xs uppercase tracking-wider font-bold text-stone-500">
                        Código de Pedido
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-bold text-[#1A0D16] bg-rose-50/80 px-3 py-0.5 rounded-xl border border-rose-200/60">
                        #{selectedOrder.codigo_orden}
                      </span>
                      {selectedOrder.prioridad && (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white flex items-center gap-1 shadow-xs">
                          <Flame className="w-3 h-3 text-[#F5D3B3]" />
                          Prioridad de Cocina
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D83A73]" />
                      <span>
                        Registrado el{' '}
                        {new Date(selectedOrder.created_at).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Current Status Pill */}
                  <div>
                    {(() => {
                      const badge = getStatusBadge(selectedOrder.estado);
                      return (
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs sm:text-sm font-bold ${badge.classes}`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Progress Stepper Bar */}
                <div className="py-8">
                  <div className="relative">
                    
                    {/* Connecting line (Desktop & Tablet) */}
                    <div className="hidden md:block absolute top-6 left-12 right-12 h-1 bg-rose-100 -z-0">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#D83A73] via-[#C02E62] to-[#E5A87B]"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(Math.max(0, currentStepIndex) / (ORDER_STEPS.length - 1)) * 100}%`
                        }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Steps Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                      {ORDER_STEPS.map((step, idx) => {
                        const isCompleted = idx < currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        const isUpcoming = idx > currentStepIndex;
                        const Icon = step.icon;

                        return (
                          <div
                            key={step.status}
                            className={`flex md:flex-col items-center md:items-center text-left md:text-center gap-4 md:gap-3 transition-all ${
                              isUpcoming ? 'opacity-45' : 'opacity-100'
                            }`}
                          >
                            {/* Step Indicator Node */}
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-[#C02E62] text-white shadow-[0_4px_12px_rgba(192,46,98,0.3)]'
                                  : isCurrent
                                  ? 'bg-gradient-to-tr from-[#D83A73] to-[#C02E62] text-white ring-4 ring-[#D83A73]/25 scale-110 shadow-lg'
                                  : 'bg-white text-stone-400 border border-stone-200'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-5 h-5 stroke-[3]" />
                              ) : (
                                <Icon className="w-5 h-5" />
                              )}
                            </div>

                            {/* Step Text Info */}
                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-[10px] uppercase font-bold tracking-wider block ${
                                  isCurrent ? 'text-[#C02E62]' : 'text-stone-500'
                                }`}
                              >
                                Paso {idx + 1}
                              </span>
                              <h4
                                className={`text-sm font-bold leading-tight ${
                                  isCurrent ? 'text-[#1A0D16]' : 'text-stone-700'
                                }`}
                              >
                                {step.title}
                              </h4>
                              <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Artisan Preparation Explanation Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/80 via-white to-rose-50/80 border border-rose-200/70 flex items-start sm:items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-rose-200/80 flex items-center justify-center text-[#C02E62] shrink-0 shadow-2xs">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-stone-600 leading-relaxed flex-1">
                    <strong className="text-[#1A0D16] font-semibold">
                      Compromiso de Elaboración Lenta (1 a 3 días):
                    </strong>{' '}
                    Este pedido requiere un tiempo estimado de{' '}
                    <span className="font-bold text-[#C02E62]">
                      {selectedOrder.tiempo_estimado_dias}{' '}
                      {selectedOrder.tiempo_estimado_dias === 1 ? 'día' : 'días'} hábiles
                    </span>{' '}
                    para respetar los tiempos biológicos del cultivo y el horneado rústico.
                  </div>
                </div>

              </div>

              {/* Order Detail & Delivery Cards */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                
                {/* Left Column: Items Breakdown */}
                <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-[0_4px_24px_rgba(26,13,22,0.04)] flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A0D16] mb-4 pb-3 border-b border-rose-100 flex items-center justify-between">
                      <span>Recetas en Preparación</span>
                      <span className="text-xs font-mono font-bold text-stone-500">
                        {selectedOrder.items.length}{' '}
                        {selectedOrder.items.length === 1 ? 'producto' : 'productos'}
                      </span>
                    </h3>

                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div
                          key={`${item.producto_id}-${idx}`}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100/70"
                        >
                          <div className="flex-1 pr-3">
                            <span className="font-bold text-xs sm:text-sm text-[#1A0D16] block">
                              {item.cantidad}x {item.nombre}
                            </span>
                            <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-[#D83A73]" />
                              {item.tiempo_preparacion_dias}{' '}
                              {item.tiempo_preparacion_dias === 1 ? 'día' : 'días'} de maduración
                            </span>
                          </div>
                          <span className="font-mono text-sm font-bold text-[#1A0D16]">
                            ${item.subtotal.toLocaleString('es-CO')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-rose-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-500 uppercase font-bold tracking-wider block">
                        Total de la Orden
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Método: {selectedOrder.metodo_pago}
                      </span>
                    </div>
                    <span className="font-mono text-2xl font-bold text-[#C02E62]">
                      ${selectedOrder.total.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>

                {/* Right Column: Customer & Delivery Details */}
                <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-[0_4px_24px_rgba(26,13,22,0.04)] flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A0D16] mb-4 pb-3 border-b border-rose-100">
                      Datos de Entrega
                    </h3>

                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="text-stone-500 block text-[11px] uppercase font-bold tracking-wider">
                          Destinatario
                        </span>
                        <span className="font-bold text-stone-800 text-sm">
                          {selectedOrder.cliente_nombre}
                        </span>
                        <span className="text-stone-500 block mt-0.5">
                          Tel: {selectedOrder.cliente_telefono}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-rose-100/60">
                        <span className="text-stone-500 block text-[11px] uppercase font-bold tracking-wider">
                          Dirección de Despacho
                        </span>
                        <div className="flex items-start gap-1.5 mt-1 text-stone-800 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#D83A73] shrink-0 mt-0.5" />
                          <span>
                            {selectedOrder.direccion_envio}
                            <span className="block text-stone-500 font-normal">
                              {selectedOrder.barrio_localidad}, Bogotá D.C.
                            </span>
                          </span>
                        </div>
                      </div>

                      {selectedOrder.notas_entrega && (
                        <div className="pt-3 border-t border-rose-100/60">
                          <span className="text-stone-500 block text-[11px] uppercase font-bold tracking-wider">
                            Instrucciones Especiales
                          </span>
                          <p className="mt-1 text-stone-600 italic bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                            "{selectedOrder.notas_entrega}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & WhatsApp Support */}
                  <div className="pt-6 mt-6 border-t border-rose-100 space-y-2.5">
                    <a
                      href={getOrderTrackingWhatsAppUrl(selectedOrder)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(5,150,105,0.25)] hover:scale-[1.02] cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Consultar con Cocina en WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(null);
                        setSearchInput('');
                        setHasSearched(false);
                      }}
                      className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-[#C02E62] rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Consultar otro código</span>
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : hasSearched ? (
            /* NOT FOUND CARD */
            <motion.div
              key="order-not-found"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-100 text-center max-w-xl mx-auto shadow-[0_8px_30px_rgba(26,13,22,0.04)]"
            >
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200/80 flex items-center justify-center text-[#C02E62] mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#1A0D16]">
                No encontramos la orden "{searchInput}"
              </h3>

              <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                Verifica que el código coincida con el número asignado en tu pantalla de confirmación (ej: <strong>CAP-101</strong> o simplemente <strong>101</strong>).
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectSample('CAP-101')}
                  className="px-4 py-2 bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white rounded-xl text-xs font-bold shadow-xs hover:scale-105 transition-all cursor-pointer"
                >
                  Probar con CAP-101
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setHasSearched(false);
                  }}
                  className="px-4 py-2 bg-rose-50 text-stone-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Limpiar búsqueda
                </button>
              </div>
            </motion.div>
          ) : (
            /* INITIAL PLACEHOLDER GUIDE */
            <motion.div
              key="order-initial-guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/80 backdrop-blur-xs rounded-3xl p-8 border border-rose-100/80 text-center max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-center gap-3 text-stone-500 text-xs sm:text-sm">
                <ShieldCheck className="w-5 h-5 text-[#C02E62]" />
                <span>
                  Ingresa tu identificador único de compra para comprobar en qué etapa se encuentra tu lote.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
