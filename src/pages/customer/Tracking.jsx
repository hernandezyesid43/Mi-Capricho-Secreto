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
  ArrowRight
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../components/ui/ToastContainer'

const STATUS_CONFIG = {
  Pendiente: {
    index: 0,
    progress: 12,
    icon: ClipboardList,
    title: 'Pedido Recibido',
    badgeClass: 'pendiente',
    description:
      'Tu orden fue registrada con éxito en nuestro sistema y está en cola de producción artesanal.',
    hint: 'Verificamos la disponibilidad de fruta e ingredientes frescos para iniciar.',
    timeEst: 'Tiempo estimado de preparación: 30 - 45 min',
  },
  'En Preparación': {
    index: 1,
    progress: 42,
    icon: ChefHat,
    title: 'En Preparación Artesanal',
    badgeClass: 'preparacion',
    description:
      'Nuestros maestros artesanos están elaborando tu yogur y postres exclusivamente bajo tu pedido.',
    hint: 'Garantizamos 0% conservantes artificiales y textura extra cremosa.',
    timeEst: 'Envasando en frío: 15 - 25 min',
  },
  Listo: {
    index: 2,
    progress: 75,
    icon: Truck,
    title: 'Listo / En Camino',
    badgeClass: 'listo',
    description:
      'Tu pedido ha sido empacado con control térmico y sellado de seguridad, listo para entrega.',
    hint: 'El repartidor está en ruta o tu paquete está listo en punto de entrega.',
    timeEst: 'Llegada estimada: 15 - 30 min',
  },
  Entregado: {
    index: 3,
    progress: 100,
    icon: CheckCircle2,
    title: '¡Entregado con Amor!',
    badgeClass: 'entregado',
    description:
      'Tu capricho ha sido entregado exitosamente. ¡Esperamos que disfrutes cada bocado!',
    hint: 'Recuerda mantener los productos refrigerados entre 2°C y 6°C.',
    timeEst: 'Completado',
  },
}

const DEMO_ORDERS = [
  {
    id: 'MCS-101',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    estado: 'Pendiente',
    total: 32000,
    direccion: 'Cra 15 # 85-30, Apto 402',
    items: [
      { nombre: 'Yogur Griego con Frutos Rojos', cantidad: 2, precio_unitario: 12000, imagen_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80' },
      { nombre: 'Muffin Artesanal de Avena y Miel', cantidad: 1, precio_unitario: 8000, imagen_url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=300&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'MCS-102',
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    estado: 'En Preparación',
    total: 26000,
    direccion: 'Calle 116 # 9-45',
    items: [
      { nombre: 'Yogur Casero Melocotón & Maracuyá', cantidad: 2, precio_unitario: 13000, imagen_url: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=300&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'MCS-103',
    created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    estado: 'Listo',
    total: 45000,
    direccion: 'Av 19 # 104-20',
    items: [
      { nombre: 'Yogur Griego Natural Sin Azúcar', cantidad: 2, precio_unitario: 14000, imagen_url: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=300&auto=format&fit=crop&q=80' },
      { nombre: 'Tarta Artesanal de Frutos del Bosque', cantidad: 1, precio_unitario: 17000, imagen_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'MCS-104',
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    estado: 'Entregado',
    total: 18000,
    direccion: 'Calle 72 # 5-20',
    items: [
      { nombre: 'Parfait Artesanal de Chía y Mango', cantidad: 1, precio_unitario: 18000, imagen_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300&auto=format&fit=crop&q=80' }
    ]
  }
]

export default function Tracking() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOrderQuery = searchParams.get('order') || ''
  
  const { user } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)

  const [searchId, setSearchId] = useState(initialOrderQuery)
  const [orders, setOrders] = useState([])
  const [trackedOrder, setTrackedOrder] = useState(null)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [searching, setSearching] = useState(false)
  const [copied, setCopied] = useState(false)

  // Cargar órdenes del usuario autenticado
  useEffect(() => {
    async function loadUserOrders() {
      if (!user) return
      setLoadingOrders(true)
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*, pedido_items(*, productos(*))')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          setOrders(data)
          // Si no hay búsqueda activa por query param, seleccionar el más reciente
          if (!initialOrderQuery) {
            setTrackedOrder(data[0])
          }
        }
      } catch (err) {
        console.error('Error cargando pedidos:', err)
      } finally {
        setLoadingOrders(false)
      }
    }

    loadUserOrders()
  }, [user, initialOrderQuery])

  // Buscar por ID específico (desde query param o búsqueda manual)
  const performSearch = async (code) => {
    const cleanCode = code?.trim().toUpperCase()
    if (!cleanCode) return

    setSearching(true)

    // 1. Buscar en demo mock orders si coincide
   const demoFound = null;
      setSearching(false);
    };

    return (
      <main className="tracking-page">
        <h1>Rastreo de Pedidos</h1>
        <p>Interfaz de seguimiento en mantenimiento temporal.</p>
      </main>
    );
}