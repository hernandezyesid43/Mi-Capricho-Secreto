import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  LogOut,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Receipt,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  UserCheck,
  Shield,
  Sparkles,
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  X
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../components/ui/ToastContainer'

const CATEGORIES = [
  'Todos',
  'Yogur Griego',
  'Yogur Casero',
  'Postres & Repostería',
  'Parfaits & Bowls',
  'Especialidades',
]

const DEFAULT_PRODUCT_FORM = {
  id: null,
  nombre: '',
  categoria: 'Yogur Griego',
  precio: '',
  descripcion: '',
  imagen_url: '',
  activo: true,
}

const DEFAULT_USER_FORM = {
  id: null,
  nombre: '',
  telefono: '',
  direccion: '',
  rol: 'cliente',
}

export default function AdminPanel() {
  const { user, profile, isAdmin, signOut, loading: authLoading } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)
  const navigate = useNavigate()

  // Navegación de Pestañas
  const [activeTab, setActiveTab] = useState('kanban') // 'kanban', 'products', 'users', 'accounting'
  const [loading, setLoading] = useState(true)

  // Datos principales
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [usersList, setUsersList] = useState([])

  // Filtros y Búsqueda
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('Todos')
  const [accountingPeriod, setAccountingPeriod] = useState('all') // 'today', '7days', 'month', 'all'

  // Modales
  const [showProductModal, setShowProductModal] = useState(false)
  const [productFormData, setProductFormData] = useState(DEFAULT_PRODUCT_FORM)
  const [savingProduct, setSavingProduct] = useState(false)

  const [showUserModal, setShowUserModal] = useState(false)
  const [userFormData, setUserFormData] = useState(DEFAULT_USER_FORM)
  const [savingUser, setSavingUser] = useState(false)

  // Validación de acceso administrador
  useEffect(() => {
    if (authLoading) return
    if (!user || !isAdmin()) {
      addToast('Acceso restringido. Inicia sesión con una cuenta de Administrador.', 'error')
      navigate('/')
    } else {
      loadAllData()
    }
  }, [user, authLoading, navigate, addToast])

  const loadAllData = async () => {
    setLoading(true)
    try {
      // 1. Cargar Pedidos con perfiles y productos
      const { data: ordersData, error: ordersError } = await supabase
        .from('pedidos')
        .select('*, perfiles(nombre, telefono, direccion), pedido_items(*, productos(*))')
        .order('created_at', { ascending: false })

      if (!ordersError && ordersData) setOrders(ordersData)

      // 2. Cargar Productos
      const { data: productsData, error: productsError } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true })

      if (!productsError && productsData) setProducts(productsData)

      // 3. Cargar Usuarios
      const { data: usersData, error: usersError } = await supabase
        .from('perfiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!usersError && usersData) setUsersList(usersData)
    } catch (err) {
      console.error('Error cargando datos del admin:', err)
      addToast('Error al conectar con la base de datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  /* =========================================================
     1. KANBAN / COCINA
     ========================================================= */
  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: newStatus })
      .eq('id', orderId)

    if (error) {
      addToast('Error al actualizar: ' + error.message, 'error')
    } else {
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o)))
      addToast(`Pedido ${orderId} actualizado a "${newStatus}"`, 'success')
    }
  }

  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('orderId', orderId)
  }

  const handleDrop = (e, newStatus) => {
    e.preventDefault()
    const orderId = e.dataTransfer.getData('orderId')
    if (orderId) updateOrderStatus(orderId, newStatus)
  }

  /* =========================================================
     2. GESTIÓN DE PRODUCTOS (CRUD & DISPONIBILIDAD)
     ========================================================= */
  const handleToggleProductActive = async (productId, currentActive) => {
    const nextActive = !currentActive
    // Actualización optimista
    setProducts(products.map((p) => (p.id === productId ? { ...p, activo: nextActive } : p)))

    const { error } = await supabase
      .from('productos')
      .update({ activo: nextActive })
      .eq('id', productId)

    if (error) {
      // Revertir en caso de error
      setProducts(products.map((p) => (p.id === productId ? { ...p, activo: currentActive } : p)))
      addToast('Error al cambiar disponibilidad: ' + error.message, 'error')
    } else {
      addToast(
        nextActive ? 'Producto habilitado en catálogo' : 'Producto pausado (no disponible)',
        'success'
      )
    }
  }

  const handleOpenNewProduct = () => {
    setProductFormData(DEFAULT_PRODUCT_FORM)
    setShowProductModal(true)
  }

  const handleOpenEditProduct = (prod) => {
    setProductFormData({
      id: prod.id,
      nombre: prod.nombre,
      categoria: prod.categoria || 'Yogur Griego',
      precio: prod.precio,
      descripcion: prod.descripcion || '',
      imagen_url: prod.imagen_url || '',
      activo: prod.activo !== false,
    })
    setShowProductModal(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!productFormData.nombre.trim()) {
      addToast('Ingresa el nombre del producto', 'error')
      return
    }
    if (!productFormData.precio || Number(productFormData.precio) <= 0) {
      addToast('Ingresa un precio válido', 'error')
      return
    }

    setSavingProduct(true)
    const productPayload = {
      nombre: productFormData.nombre.trim(),
      categoria: productFormData.categoria,
      precio: Number(productFormData.precio),
      descripcion: productFormData.descripcion.trim(),
      imagen_url: productFormData.imagen_url.trim(),
      activo: Boolean(productFormData.activo),
    }

    if (productFormData.id) {
      // Actualizar producto existente
      const { data, error } = await supabase
        .from('productos')
        .update(productPayload)
        .eq('id', productFormData.id)
        .select()
        .single()

      if (error) {
        addToast('Error al actualizar: ' + error.message, 'error')
      } else {
        setProducts(products.map((p) => (p.id === productFormData.id ? data : p)))
        addToast('Producto actualizado exitosamente', 'success')
        setShowProductModal(false)
      }
    } else {
      // Crear nuevo producto
      const { data, error } = await supabase
        .from('productos')
        .insert(productPayload)
        .select()
        .single()

      if (error) {
        addToast('Error al crear producto: ' + error.message, 'error')
      } else {
        setProducts([...products, data])
        addToast('Producto agregado al catálogo', 'success')
        setShowProductModal(false)
      }
    }
    setSavingProduct(false)
  }

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente "${productName}"?`)) {
      return
    }

    const { error } = await supabase.from('productos').delete().eq('id', productId)
    if (error) {
      addToast('Error al eliminar: ' + error.message, 'error')
    } else {
      setProducts(products.filter((p) => p.id !== productId))
      addToast('Producto eliminado', 'info')
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        productCategoryFilter === 'Todos' || p.categoria === productCategoryFilter
      const matchesSearch =
        p.nombre?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(productSearch.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, productCategoryFilter, productSearch])

  /* =========================================================
     3. GESTIÓN DE USUARIOS Y ADMINISTRADORES
     ========================================================= */
  const handleOpenEditUser = (u) => {
    setUserFormData({
      id: u.id,
      nombre: u.nombre || '',
      telefono: u.telefono || '',
      direccion: u.direccion || '',
      rol: u.rol || 'cliente',
    })
    setShowUserModal(true)
  }

  const handleOpenNewAdmin = () => {
    setUserFormData({
      id: null,
      nombre: '',
      telefono: '',
      direccion: '',
      rol: 'admin',
    })
    setShowUserModal(true)
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    if (!userFormData.nombre.trim()) {
      addToast('Ingresa el nombre del usuario', 'error')
      return
    }

    setSavingUser(true)

    if (userFormData.id) {
      // Actualizar perfil existente
      const { data, error } = await supabase
        .from('perfiles')
        .update({})
          .eq('id', 1);
     }
  };

  return (
    <main className="admin-panel">
      <h1>Panel de Administración</h1>
      <p>Interfaz en recuperación.</p>
    </main>
  );
}
