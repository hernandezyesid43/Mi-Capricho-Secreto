import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  PackageOpen,
  ClipboardList,
  ChefHat,
  Truck,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../components/ui/ToastContainer'

const STATUS_STEPS = [
  {
    key: 'recibido',
    title: 'Pedido Recibido',
    subtitle: 'En cola de producción',
    icon: ClipboardList,
    progress: 15,
  },
  {
    key: 'preparacion',
    title: 'En Preparación',
    subtitle: 'Elaboración artesanal',
    icon: ChefHat,
    progress: 45,
  },
  {
    key: 'en_camino',
    title: 'En Camino',
    subtitle: 'Rumbo a tu dirección',
    icon: Truck,
    progress: 75,
  },
  {
    key: 'entregado',
    title: '¡Entregado!',
    subtitle: 'Disfruta tu capricho',
    icon: CheckCircle2,
    progress: 100,
  },
]

const STATUS_DETAILS = {
  Pendiente: {
    stepIndex: 0,
    progress: 15,
    icon: ClipboardList,
    title: 'Pedido Recibido',
    badgeClass: 'pendiente',
    description:
      'Tu orden fue registrada con éxito en nuestro sistema y está en cola de producción artesanal.',
    hint: 'Seleccionamos los ingredientes más frescos para iniciar la preparación.',
    timeEst: 'Tiempo estimado de inicio: 15 - 30 min',
  },
  Recibido: {
    stepIndex: 0,
    progress: 15,
    icon: ClipboardList,
    title: 'Pedido Recibido',
    badgeClass: 'pendiente',
    description:
      'Tu orden fue registrada con éxito en nuestro sistema y está en cola de producción artesanal.',
    hint: 'Seleccionamos los ingredientes más frescos para iniciar la preparación.',
    timeEst: 'Tiempo estimado de inicio: 15 - 30 min',
  },
  'En Preparación': {
    stepIndex: 1,
    progress: 45,
    icon: ChefHat,
    title: 'En Preparación Artesanal',
    badgeClass: 'preparacion',
    description:
      'Nuestros maestros artesanos están elaborando tu yogur y postres exclusivamente bajo tu pedido.',
    hint: '0% conservantes artificiales y textura extra cremosa garantizada.',
    timeEst: 'Envasado en frío: 1 a 3 días hábiles',
  },
  'En preparación': {
    stepIndex: 1,
    progress: 45,
    icon: ChefHat,
    title: 'En Preparación Artesanal',
    badgeClass: 'preparacion',
    description:
      'Nuestros maestros artesanos están elaborando tu yogur y postres exclusivamente bajo tu pedido.',
    hint: '0% conservantes artificiales y textura extra cremosa garantizada.',
    timeEst: 'Envasado en frío: 1 a 3 días hábiles',
  },
  Listo: {
    stepIndex: 2,
    progress: 75,
    icon: Truck,
    title: 'En Camino / Listo',
    badgeClass: 'listo',
    description:
      'Tu pedido ha sido empacado con control térmico y sellado de seguridad, rumbo a tu dirección.',
    hint: 'El domiciliario o punto de entrega está procesando la entrega.',
    timeEst: 'Entrega estimada: Hoy mismo',
  },
  'En Camino': {
    stepIndex: 2,
    progress: 75,
    icon: Truck,
    title: 'En Camino / Listo',
    badgeClass: 'listo',
    description:
      'Tu pedido ha sido empacado con control térmico y sellado de seguridad, rumbo a tu dirección.',
    hint: 'El domiciliario o punto de entrega está procesando la entrega.',
    timeEst: 'Entrega estimada: Hoy mismo',
  },
  'En camino': {
    stepIndex: 2,
    progress: 75,
    icon: Truck,
    title: 'En Camino / Listo',
    badgeClass: 'listo',
    description:
      'Tu pedido ha sido empacado con control térmico y sellado de seguridad, rumbo a tu dirección.',
    hint: 'El domiciliario o punto de entrega está procesando la entrega.',
    timeEst: 'Entrega estimada: Hoy mismo',
  },
  Entregado: {
    stepIndex: 3,
    progress: 100,
    icon: CheckCircle2,
    title: '¡Entregado con Éxito!',
    badgeClass: 'entregado',
    description:
      'Tu capricho ha sido entregado exitosamente. ¡Esperamos que disfrutes cada bocado!',
    hint: 'Recuerda mantener los productos refrigerados entre 2°C y 6°C.',
    timeEst: 'Pedido Finalizado',
  },
}

export default function Tracking() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOrderQuery = searchParams.get('order') || ''

  const { user } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)

  const [searchInput, setSearchInput] = useState(initialOrderQuery)
  const [userOrders, setUserOrders] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Cargar pedidos del usuario autenticado desde Supabase
  useEffect(() => {
    async function fetchUserOrders() {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*, perfiles(nombre, telefono, direccion), pedido_items(*, productos(*))')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          setUserOrders(data)
          // Si no hay query param, auto-cargar el pedido más reciente
          if (!initialOrderQuery && !currentOrder) {
            setCurrentOrder(data[0])
            setSearchInput(data[0].id || data[0].tracking_code || '')
          }
        }
      } catch (err) {
        console.warn('Error cargando historial de pedidos:', err)
      }
    }

    fetchUserOrders()
  }, [user, initialOrderQuery])

  // Ejecutar búsqueda si viene por URL
  useEffect(() => {
    if (initialOrderQuery) {
      setSearchInput(initialOrderQuery)
      handleSearch(initialOrderQuery)
    }
  }, [initialOrderQuery])

  const handleSearch = async (codeToSearch) => {
    const rawCode = (codeToSearch || searchInput || '').trim()
    if (!rawCode) return

    setLoading(true)
    setHasSearched(true)

    const cleanCode = rawCode.toUpperCase()

    // Consulta exclusiva en Supabase (tabla pedidos)
    try {
      const { data: dbOrder, error } = await supabase
        .from('pedidos')
        .select('*, perfiles(nombre, telefono, direccion), pedido_items(*, productos(*))')
        .or(`id.eq.${cleanCode},tracking_code.eq.${cleanCode}`)
        .maybeSingle()

      if (!error && dbOrder) {
        setCurrentOrder(dbOrder)
        setSearchParams({ order: cleanCode })
      } else {
        setCurrentOrder(null)
        addToast('No encontramos ningún pedido registrado con ese código', 'error')
      }
    } catch (err) {
      console.warn('Error consultando Supabase:', err)
      setCurrentOrder(null)
      addToast('Ocurrió un error al consultar el pedido', 'error')
    }

    setLoading(false)
  }

  const handleCopyCode = (code) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    addToast('¡Código de rastreo copiado al portapapeles!', 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  // Configuración del estado actual
  const statusInfo = useMemo(() => {
    if (!currentOrder) return STATUS_DETAILS.Pendiente
    const st = currentOrder.estado || 'Pendiente'
    return STATUS_DETAILS[st] || STATUS_DETAILS.Pendiente
  }, [currentOrder])

  // WhatsApp de ayuda sobre el pedido
  const whatsappHelpUrl = useMemo(() => {
    if (!currentOrder) return '#'
    const code = currentOrder.id || currentOrder.tracking_code
    const text = encodeURIComponent(
      `Hola Mi Capricho Secreto ✨ Quisiera consultar información sobre el estado de mi pedido #${code}. ¡Gracias!`
    )
    return `https://wa.me/573142748881?text=${text}`
  }, [currentOrder])

  return (
    <motion.div
      className="page-transition tracking-page-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="tracking-ambient-glow" />

      <div className="tracking-container">
        {/* Encabezado Principal */}
        <div className="tracking-header-section">
          <span className="tracking-pill">
            <Sparkles size={14} /> Seguimiento en Tiempo Real
          </span>
          <h1 className="tracking-main-title">Rastrea tu Pedido</h1>
          <p className="tracking-subtitle">
            Ingresa tu código único de seguimiento para conocer en qué etapa artesanal se encuentra tu capricho.
          </p>

          {/* Formulario de Búsqueda */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch(searchInput)
            }}
            className="tracking-search-form"
          >
            <div className="tracking-input-wrapper">
              <Search size={20} className="tracking-search-icon" />
              <input
                type="text"
                placeholder="Ingresa tu código de pedido..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="tracking-input"
                id="tracking-search-input"
              />
            </div>
            <button
              type="submit"
              className="btn-rose tracking-submit-btn"
              disabled={loading || !searchInput.trim()}
              id="tracking-submit-btn"
            >
              {loading ? (
                <div className="spinner-sm" />
              ) : (
                <>
                  <span>Rastrear</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Acceso Rápido a Pedidos del Usuario */}
          {user && userOrders.length > 0 && (
            <div className="user-quick-orders">
              <span className="quick-orders-label">Tus pedidos recientes:</span>
              <div className="quick-orders-chips">
                {userOrders.map((ord) => {
                  const code = ord.id || ord.tracking_code
                  const isSelected = currentOrder && (currentOrder.id === ord.id)
                  return (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => {
                        setSearchInput(code)
                        handleSearch(code)
                      }}
                      className={`quick-order-chip ${isSelected ? 'active' : ''}`}
                    >
                      <ShoppingBag size={14} />
                      <span>{code}</span>
                      <span className={`chip-badge ${ord.estado?.toLowerCase()}`}>
                        {ord.estado}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Resultado del Rastreo */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="tracking-loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RefreshCw size={32} className="spin-icon" />
              <p>Consultando base de datos de producción...</p>
            </motion.div>
          ) : currentOrder ? (
            <motion.div
              key={currentOrder.id}
              className="tracking-result-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Tarjeta de Resumen Superior */}
              <div className="order-summary-header">
                <div className="order-code-block">
                  <span className="order-code-label">Código de Seguimiento</span>
                  <div className="order-code-display">
                    <h2>{currentOrder.id || currentOrder.tracking_code}</h2>
                    <button
                      type="button"
                      className="btn-copy-code"
                      onClick={() => handleCopyCode(currentOrder.id || currentOrder.tracking_code)}
                      title="Copiar código"
                    >
                      {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="order-meta-badges">
                  <div className={`status-pill ${statusInfo.badgeClass}`}>
                    <span className="status-dot" />
                    <span>{statusInfo.title}</span>
                  </div>
                </div>
              </div>

              {/* LÍNEA DE TIEMPO / STEPPER DE PROGRESO */}
              <div className="stepper-section">
                <div className="stepper-track-bg">
                  <motion.div
                    className="stepper-track-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${statusInfo.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>

                <div className="stepper-nodes-container">
                  {STATUS_STEPS.map((step, idx) => {
                    const Icon = step.icon
                    const isCompleted = idx < statusInfo.stepIndex
                    const isCurrent = idx === statusInfo.stepIndex

                    return (
                      <div
                        key={step.key}
                        className={`stepper-node-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''
                          }`}
                      >
                        <div className="stepper-node-icon-wrapper">
                          <Icon size={20} />
                        </div>
                        <span className="stepper-node-label">{step.title}</span>
                        <span className="stepper-node-sub">{step.subtitle}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tarjeta Informativa del Estado Actual */}
              <div className="status-info-banner">
                <div className="status-banner-icon">
                  <statusInfo.icon size={28} />
                </div>
                <div className="status-banner-text">
                  <h3>{statusInfo.title}</h3>
                  <p className="status-desc">{statusInfo.description}</p>
                  <div className="status-hint-row">
                    <span className="hint-pill">
                      <Clock size={14} /> {statusInfo.timeEst}
                    </span>
                    <span className="hint-pill light">
                      <Sparkles size={14} /> {statusInfo.hint}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grilla de Detalles del Pedido */}
              <div className="tracking-details-grid">
                <div className="detail-box">
                  <div className="detail-box-title">
                    <Calendar size={16} /> Fecha de Registro
                  </div>
                  <p className="detail-box-val">
                    {currentOrder.created_at
                      ? new Date(currentOrder.created_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : 'Reciente'}
                  </p>
                </div>

                <div className="detail-box">
                  <div className="detail-box-title">
                    <Clock size={16} /> Elaboración / Entrega Estimada
                  </div>
                  <p className="detail-box-val">
                    {currentOrder.fecha_estimada
                      ? new Date(currentOrder.fecha_estimada).toLocaleDateString('es-CO', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })
                      : '1 a 3 días hábiles'}
                  </p>
                </div>

                <div className="detail-box">
                  <div className="detail-box-title">
                    <MapPin size={16} /> Destino de Entrega
                  </div>
                  <p className="detail-box-val">
                    {currentOrder.direccion ||
                      currentOrder.perfiles?.direccion ||
                      'Bogotá D.C., Colombia'}
                  </p>
                </div>
              </div>

              {/* Lista de Productos en la Orden */}
              {currentOrder.pedido_items && currentOrder.pedido_items.length > 0 && (
                <div className="order-items-breakdown">
                  <h4 className="breakdown-title">
                    <ShoppingBag size={18} /> Artículos en este Pedido
                  </h4>
                  <div className="items-list">
                    {currentOrder.pedido_items.map((it, i) => {
                      const prod = it.productos || it
                      const img = prod.imagen_url || it.imagen_url || 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&auto=format&fit=crop&q=80'
                      const name = prod.nombre || it.nombre || `Producto #${it.producto_id || i + 1}`
                      const qty = it.cantidad || 1
                      const price = it.precio_unitario || prod.precio || 0

                      return (
                        <div key={it.id || i} className="order-item-row">
                          <img src={img} alt={name} className="item-thumb" />
                          <div className="item-details">
                            <p className="item-name">{name}</p>
                            <span className="item-qty">Cantidad: {qty} unidad(es)</span>
                          </div>
                          <p className="item-price">
                            ${(price * qty).toLocaleString('es-CO')}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="order-total-bar">
                    <span>Total Cancelado</span>
                    <span className="total-num">
                      ${Number(currentOrder.total || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="tracking-card-actions">
                <a
                  href={whatsappHelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-track"
                >
                  <MessageCircle size={18} />
                  <span>Consultar por WhatsApp</span>
                </a>
                <Link to="/catalogo" className="btn-explore-track">
                  <span>Pedir algo más</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          ) : hasSearched ? (
            <motion.div
              key="not-found"
              className="tracking-empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <PackageOpen size={48} className="empty-icon" />
              <h3>No se encontró el pedido</h3>
              <p>
                No encontramos ningún pedido registrado con el código <strong>"{searchInput}"</strong>. Verifica que el código esté bien escrito e intenta nuevamente.
              </p>
              <div className="empty-actions">
                <Link to="/catalogo" className="btn-rose btn-sm">
                  Ir al Catálogo
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="tracking-initial-hint">
              <div className="hint-card">
                <ChefHat size={32} className="hint-icon" />
                <h4>Producción Artesanal Bajo Pedido</h4>
                <p>
                  Cada yogur y postre se elabora con ingredientes 100% naturales. Rastrea en todo momento su preparación y despacho.
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}