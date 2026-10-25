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
  RefreshCw,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../components/ui/ToastContainer'

const STATUS_STEPS = [
  { key: 'recibido', title: 'Pedido Recibido', subtitle: 'En cola', icon: ClipboardList },
  { key: 'preparacion', title: 'En Preparación', subtitle: 'Elaboración', icon: ChefHat },
  { key: 'en_camino', title: 'En Camino', subtitle: 'Despacho', icon: Truck },
  { key: 'entregado', title: 'Entregado', subtitle: '¡Listo!', icon: CheckCircle2 },
]

const STATUS_DETAILS = {
  Pendiente: {
    stepIndex: 0,
    progress: 15,
    icon: ClipboardList,
    title: 'Pedido Recibido',
    color: '#d97706',
    bg: '#fffbeb',
    description: 'Tu orden fue registrada y está en cola de producción artesanal.',
    hint: 'Seleccionamos los ingredientes más frescos para iniciar.',
    timeEst: 'Inicio estimado: 15-30 min',
  },
  Recibido: {
    stepIndex: 0,
    progress: 15,
    icon: ClipboardList,
    title: 'Pedido Recibido',
    color: '#d97706',
    bg: '#fffbeb',
    description: 'Tu orden fue registrada y está en cola de producción artesanal.',
    hint: 'Seleccionamos los ingredientes más frescos para iniciar.',
    timeEst: 'Inicio estimado: 15-30 min',
  },
  'En Preparación': {
    stepIndex: 1,
    progress: 45,
    icon: ChefHat,
    title: 'En Preparación',
    color: '#C02E62',
    bg: '#fdf2f8',
    description: 'Estamos elaborando tu pedido de forma artesanal y exclusiva.',
    hint: 'Sin conservantes artificiales.',
    timeEst: '1 a 3 días hábiles',
  },
  'En preparación': {
    stepIndex: 1,
    progress: 45,
    icon: ChefHat,
    title: 'En Preparación',
    color: '#C02E62',
    bg: '#fdf2f8',
    description: 'Estamos elaborando tu pedido de forma artesanal y exclusiva.',
    hint: 'Sin conservantes artificiales.',
    timeEst: '1 a 3 días hábiles',
  },
  Listo: {
    stepIndex: 2,
    progress: 75,
    icon: Truck,
    title: 'En Camino / Listo',
    color: '#7c3aed',
    bg: '#f5f3ff',
    description: 'Tu pedido está empacado y listo para entrega o en camino.',
    hint: 'Pronto lo tendrás en tu puerta.',
    timeEst: 'Entrega estimada: hoy',
  },
  'En Camino': {
    stepIndex: 2,
    progress: 75,
    icon: Truck,
    title: 'En Camino',
    color: '#7c3aed',
    bg: '#f5f3ff',
    description: 'Tu pedido va rumbo a tu dirección.',
    hint: 'El domiciliario está en camino.',
    timeEst: 'Entrega estimada: hoy',
  },
  'En camino': {
    stepIndex: 2,
    progress: 75,
    icon: Truck,
    title: 'En Camino',
    color: '#7c3aed',
    bg: '#f5f3ff',
    description: 'Tu pedido va rumbo a tu dirección.',
    hint: 'El domiciliario está en camino.',
    timeEst: 'Entrega estimada: hoy',
  },
  Entregado: {
    stepIndex: 3,
    progress: 100,
    icon: CheckCircle2,
    title: 'Entregado',
    color: '#059669',
    bg: '#ecfdf5',
    description: '¡Tu capricho fue entregado! Esperamos que lo disfrutes.',
    hint: 'Mantén refrigerado entre 2°C y 6°C.',
    timeEst: 'Pedido finalizado',
  },
  Cancelado: {
    stepIndex: -1,
    progress: 0,
    icon: XCircle,
    title: 'Pedido Cancelado',
    color: '#dc2626',
    bg: '#fef2f2',
    description: 'Este pedido fue cancelado. Puedes hacer uno nuevo cuando quieras.',
    hint: 'No se realizará ningún cargo ni preparación.',
    timeEst: 'Pedido anulado',
  },
}

function getStatusInfo(estado) {
  return STATUS_DETAILS[estado] || STATUS_DETAILS.Pendiente
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

  const loadUserOrders = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*, perfiles(nombre, telefono, direccion), pedido_items(*, productos(*))')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setUserOrders(data)
        return data
      }
    } catch (err) {
      console.warn('Error cargando pedidos:', err)
    }
    return []
  }

  useEffect(() => {
    async function init() {
      const data = await loadUserOrders()
      if (initialOrderQuery) {
        setSearchInput(initialOrderQuery)
        await handleSearch(initialOrderQuery, data)
      } else if (data && data.length > 0) {
        setCurrentOrder(data[0])
        setSearchInput(data[0].id || data[0].tracking_code || '')
        setHasSearched(true)
      }
    }
    init()
  }, [user])

  const handleSearch = async (codeToSearch, ordersList) => {
    const rawCode = (codeToSearch || searchInput || '').trim()
    if (!rawCode) return

    setLoading(true)
    setHasSearched(true)

    const cleanCode = rawCode.toUpperCase().trim()

    // Primero buscar en la lista local (más confiable)
    const list = ordersList || userOrders
    const localFound = list.find(
      (o) =>
        String(o.id).toUpperCase() === cleanCode ||
        String(o.tracking_code || '').toUpperCase() === cleanCode
    )

    if (localFound) {
      setCurrentOrder(localFound)
      setSearchParams({ order: cleanCode })
      setLoading(false)
      return
    }

    // Si no está en local, consultar Supabase con comillas (importante para MCS-003)
    try {
      const { data: dbOrder, error } = await supabase
        .from('pedidos')
        .select('*, perfiles(nombre, telefono, direccion), pedido_items(*, productos(*))')
        .or(`id.eq."${cleanCode}",tracking_code.eq."${cleanCode}"`)
        .maybeSingle()

      if (!error && dbOrder) {
        setCurrentOrder(dbOrder)
        setSearchParams({ order: cleanCode })
      } else {
        setCurrentOrder(null)
        addToast('No encontramos ningún pedido con ese código', 'error')
      }
    } catch (err) {
      console.warn(err)
      setCurrentOrder(null)
      addToast('Error al consultar el pedido', 'error')
    }

    setLoading(false)
  }

  const handleCopyCode = (code) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    addToast('Código copiado', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCancelOrder = async () => {
    if (!currentOrder) return

    const estado = currentOrder.estado || ''
    if (estado !== 'Pendiente' && estado !== 'Recibido') {
      addToast('Solo se pueden cancelar pedidos en estado Recibido', 'error')
      return
    }

    const ok = window.confirm(
      `¿Cancelar el pedido ${currentOrder.id}?\n\nEsta acción no se puede deshacer.`
    )
    if (!ok) return

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('pedidos')
        .update({ estado: 'Cancelado' })
        .eq('id', currentOrder.id)
        .select()
        .maybeSingle()

      if (error) {
        console.error('Error cancelando:', error)
        addToast(
          'No se pudo cancelar. Revisa los permisos en Supabase (RLS UPDATE). ' + error.message,
          'error'
        )
        setLoading(false)
        return
      }

      if (!data) {
        addToast(
          'No se pudo actualizar el pedido. Verifica la política RLS de UPDATE en la tabla pedidos.',
          'error'
        )
        setLoading(false)
        return
      }

      setCurrentOrder({ ...currentOrder, estado: 'Cancelado' })
      setUserOrders((prev) =>
        prev.map((o) => (o.id === currentOrder.id ? { ...o, estado: 'Cancelado' } : o))
      )

      addToast('Pedido cancelado correctamente', 'success')

      try {
        await fetch(
          `https://api.telegram.org/bot8965426151:AAG3nwgiCu6-EXvHDV3pSDg-m49UFtzfWcQ/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: '1375710224',
              text: `❌ *PEDIDO CANCELADO*\n\nCódigo: ${currentOrder.id}\nCliente: ${user?.email || 'N/A'}\nTotal: $${Number(currentOrder.total || 0).toLocaleString('es-CO')} COP`,
              parse_mode: 'Markdown',
            }),
          }
        )
      } catch (_) { }
    } catch (err) {
      console.error(err)
      addToast('Error al cancelar el pedido', 'error')
    }

    setLoading(false)
  }

  const statusInfo = useMemo(() => {
    if (!currentOrder) return STATUS_DETAILS.Pendiente
    return getStatusInfo(currentOrder.estado)
  }, [currentOrder])

  const whatsappHelpUrl = useMemo(() => {
    if (!currentOrder) return '#'
    const code = currentOrder.id || currentOrder.tracking_code
    const text = encodeURIComponent(
      `Hola Mi Capricho Secreto ✨ Consulto el estado de mi pedido #${code}. ¡Gracias!`
    )
    return `https://wa.me/573142748881?text=${text}`
  }, [currentOrder])

  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', background: '#1A0D16', paddingTop: 40, paddingBottom: 60 }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 999,
              padding: '6px 14px',
              marginBottom: 12,
              color: '#F5D3B3',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Sparkles size={14} /> Seguimiento en tiempo real
          </div>
          <h1
            style={{
              fontFamily: 'serif',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'white',
              margin: '0 0 8px',
            }}
          >
            Mis Pedidos
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>
            Consulta el estado de tus caprichos artesanales
          </p>
        </div>

        {/* Buscador */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch(searchInput)
          }}
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 20,
            background: 'white',
            borderRadius: 16,
            padding: 6,
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ flex: 1, display: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, color: '#a8a29e' }} />
            <input
              type="text"
              placeholder="Código de pedido (ej: MCS-003)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                padding: '12px 12px 12px 42px',
                fontSize: 14,
                borderRadius: 12,
                background: 'transparent',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchInput.trim()}
            style={{
              background: 'linear-gradient(135deg, #D83A73, #C02E62)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '0 20px',
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {loading ? <RefreshCw size={16} className="spin-icon" /> : <>Rastrear <ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Chips de pedidos del usuario */}
        {user && userOrders.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10 }}>
              Tus pedidos recientes
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {userOrders.map((ord) => {
                const code = ord.id || ord.tracking_code
                const info = getStatusInfo(ord.estado)
                const isSelected = currentOrder && currentOrder.id === ord.id
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setSearchInput(code)
                      handleSearch(code)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: isSelected ? '2px solid #D83A73' : '1px solid rgba(255,255,255,0.15)',
                      background: isSelected ? 'rgba(216,58,115,0.25)' : 'rgba(255,255,255,0.06)',
                      color: 'white',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span>{code}</span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: info.bg,
                        color: info.color,
                        fontWeight: 700,
                      }}
                    >
                      {info.title}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Resultado */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: 24,
                padding: 48,
                textAlign: 'center',
                color: '#78716c',
              }}
            >
              <RefreshCw size={28} style={{ marginBottom: 12 }} />
              <p>Consultando tu pedido...</p>
            </motion.div>
          ) : currentOrder ? (
            <motion.div
              key={currentOrder.id + currentOrder.estado}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              }}
            >
              {/* Header del pedido */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #fce7f3',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div>
                  <p style={{ fontSize: 11, color: '#a8a29e', margin: '0 0 4px', fontWeight: 600, letterSpacing: '0.05em' }}>
                    CÓDIGO DE SEGUIMIENTO
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'serif', color: '#1A0D16' }}>
                      {currentOrder.id || currentOrder.tracking_code}
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(currentOrder.id || currentOrder.tracking_code)}
                      style={{
                        border: 'none',
                        background: '#fce7f3',
                        borderRadius: 8,
                        padding: 6,
                        cursor: 'pointer',
                        color: '#C02E62',
                      }}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 999,
                    background: statusInfo.bg,
                    color: statusInfo.color,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: statusInfo.color,
                    }}
                  />
                  {statusInfo.title}
                </div>
              </div>

              {/* Stepper (oculto si cancelado) */}
              {currentOrder.estado !== 'Cancelado' && (
                <div style={{ padding: '28px 24px 8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        top: 18,
                        left: '12%',
                        right: '12%',
                        height: 3,
                        background: '#fce7f3',
                        zIndex: 0,
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${statusInfo.progress}%`,
                          background: 'linear-gradient(90deg, #D83A73, #C02E62)',
                          borderRadius: 2,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                    {STATUS_STEPS.map((step, idx) => {
                      const Icon = step.icon
                      const done = idx < statusInfo.stepIndex
                      const active = idx === statusInfo.stepIndex
                      return (
                        <div
                          key={step.key}
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 1,
                            opacity: idx > statusInfo.stepIndex ? 0.4 : 1,
                          }}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 12,
                              margin: '0 auto 8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: done || active
                                ? 'linear-gradient(135deg, #D83A73, #C02E62)'
                                : 'white',
                              color: done || active ? 'white' : '#a8a29e',
                              border: done || active ? 'none' : '2px solid #fce7f3',
                              boxShadow: active ? '0 0 0 4px rgba(216,58,115,0.2)' : 'none',
                            }}
                          >
                            <Icon size={18} />
                          </div>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#1A0D16' }}>
                            {step.title}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#a8a29e' }}>
                            {step.subtitle}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Info del estado */}
              <div style={{ padding: '20px 24px' }}>
                <div
                  style={{
                    background: statusInfo.bg,
                    borderRadius: 16,
                    padding: 16,
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: statusInfo.color,
                      flexShrink: 0,
                    }}
                  >
                    <statusInfo.icon size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 16, color: '#1A0D16' }}>
                      {statusInfo.title}
                    </h3>
                    <p style={{ margin: '0 0 10px', fontSize: 13, color: '#57534e', lineHeight: 1.5 }}>
                      {statusInfo.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          background: 'white',
                          padding: '4px 10px',
                          borderRadius: 999,
                          color: '#57534e',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Clock size={12} /> {statusInfo.timeEst}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          background: 'white',
                          padding: '4px 10px',
                          borderRadius: 999,
                          color: '#57534e',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Sparkles size={12} /> {statusInfo.hint}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 12,
                  padding: '0 24px 20px',
                }}
              >
                <div style={{ background: '#fafaf9', borderRadius: 14, padding: 14 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, color: '#a8a29e', fontWeight: 600 }}>
                    <Calendar size={12} style={{ verticalAlign: 'middle' }} /> FECHA
                  </p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A0D16' }}>
                    {currentOrder.created_at
                      ? new Date(currentOrder.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                      : '—'}
                  </p>
                </div>
                <div style={{ background: '#fafaf9', borderRadius: 14, padding: 14 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, color: '#a8a29e', fontWeight: 600 }}>
                    <Clock size={12} style={{ verticalAlign: 'middle' }} /> ENTREGA EST.
                  </p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A0D16' }}>
                    {currentOrder.fecha_estimada
                      ? new Date(currentOrder.fecha_estimada).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                      })
                      : '1-3 días'}
                  </p>
                </div>
                <div style={{ background: '#fafaf9', borderRadius: 14, padding: 14 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, color: '#a8a29e', fontWeight: 600 }}>
                    <MapPin size={12} style={{ verticalAlign: 'middle' }} /> DESTINO
                  </p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A0D16' }}>
                    {currentOrder.direccion ||
                      currentOrder.perfiles?.direccion ||
                      'Bogotá D.C.'}
                  </p>
                </div>
              </div>

              {/* Productos */}
              {currentOrder.pedido_items?.length > 0 && (
                <div style={{ padding: '0 24px 20px' }}>
                  <p
                    style={{
                      margin: '0 0 12px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#1A0D16',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <ShoppingBag size={16} /> Artículos del pedido
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {currentOrder.pedido_items.map((it, i) => {
                      const prod = it.productos || it
                      const name = prod.nombre || it.nombre || `Producto ${i + 1}`
                      const qty = it.cantidad || 1
                      const price = it.precio_unitario || prod.precio || 0
                      const img =
                        prod.imagen_url ||
                        'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100'
                      return (
                        <div
                          key={it.id || i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: 10,
                            background: '#fafaf9',
                            borderRadius: 12,
                          }}
                        >
                          <img
                            src={img}
                            alt={name}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 10,
                              objectFit: 'cover',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A0D16' }}>
                              {name}
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: '#a8a29e' }}>
                              x{qty}
                            </p>
                          </div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1A0D16' }}>
                            ${(price * qty).toLocaleString('es-CO')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: '1px solid #fce7f3',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#57534e' }}>Total</span>
                    <span style={{ fontWeight: 800, fontSize: 18, color: '#C02E62' }}>
                      ${Number(currentOrder.total || 0).toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div
                style={{
                  padding: '16px 24px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {(currentOrder.estado === 'Pendiente' || currentOrder.estado === 'Recibido') && (
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: 14,
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <XCircle size={18} />
                    Cancelar este pedido
                  </button>
                )}

                <a
                  href={whatsappHelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 14,
                    background: '#059669',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  <MessageCircle size={18} />
                  Consultar por WhatsApp
                </a>

                <Link
                  to="/catalogo"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 14,
                    background: '#fce7f3',
                    color: '#C02E62',
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  Pedir algo más <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          ) : hasSearched ? (
            <motion.div
              key="not-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'white',
                borderRadius: 24,
                padding: 40,
                textAlign: 'center',
              }}
            >
              <PackageOpen size={48} style={{ color: '#d6d3d1', marginBottom: 12 }} />
              <h3 style={{ margin: '0 0 8px', color: '#1A0D16' }}>No se encontró el pedido</h3>
              <p style={{ color: '#78716c', fontSize: 14, marginBottom: 20 }}>
                No hay ningún pedido con el código <strong>"{searchInput}"</strong>
              </p>
              <Link
                to="/catalogo"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #D83A73, #C02E62)',
                  color: 'white',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: 14,
                }}
              >
                Ir al catálogo
              </Link>
            </motion.div>
          ) : (
            <div
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 24,
                padding: 40,
                textAlign: 'center',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              <ChefHat size={36} style={{ marginBottom: 12, opacity: 0.6 }} />
              <h4 style={{ margin: '0 0 8px', color: 'white' }}>Producción artesanal bajo pedido</h4>
              <p style={{ margin: 0, fontSize: 14 }}>
                Ingresa tu código o selecciona uno de tus pedidos recientes.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}