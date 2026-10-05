import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  X,
  Clock,
  Truck,
  ChefHat,
  ClipboardList,
  AlertCircle,
  Check,
  ExternalLink,
  ArrowRight
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

const ORDER_STATUSES = [
  'Pendiente',
  'En Preparación',
  'Listo',
  'Entregado'
]

const DEFAULT_PRODUCT_FORM = {
  id: null,
  nombre: '',
  categoria: 'Yogur Griego',
  precio: '',
  descripcion: '',
  imagen_url: '',
  stock: 100,
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
  const [activeTab, setActiveTab] = useState('orders') // 'orders', 'inventory', 'users', 'metrics'
  const [loading, setLoading] = useState(true)

  // Datos principales
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [usersList, setUsersList] = useState([])

  // Filtros y Búsqueda
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('Todos')
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('Todos')

  // Modales
  const [showProductModal, setShowProductModal] = useState(false)
  const [productFormData, setProductFormData] = useState(DEFAULT_PRODUCT_FORM)
  const [savingProduct, setSavingProduct] = useState(false)

  const [showUserModal, setShowUserModal] = useState(false)
  const [userFormData, setUserFormData] = useState(DEFAULT_USER_FORM)
  const [savingUser, setSavingUser] = useState(false)

  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)

  // Validación de acceso administrador
  useEffect(() => {
    if (authLoading) return
    if (!user || !isAdmin()) {
      addToast('Acceso denegado. Se requieren permisos de Administrador.', 'error')
      navigate('/login', { replace: true })
    } else {
      loadAllData()
    }
  }, [user, authLoading, navigate, addToast, isAdmin])

  const loadAllData = async () => {
    setLoading(true)
    try {
      // 1. Cargar Pedidos con perfiles y productos
      const { data: ordersData, error: ordersError } = await supabase
        .from('pedidos')
        .select('*, perfiles(nombre, telefono, direccion), pedido_items(*, productos(*))')
        .order('created_at', { ascending: false })

      if (!ordersError && ordersData) {
        setOrders(ordersData)
      } else {
        // Fallback de demostración si la tabla está vacía
        setOrders([
          {
            id: 'MCS-101',
            tracking_code: 'MCS-101',
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            estado: 'Pendiente',
            total: 36000,
            direccion: 'Cra 15 # 85-30, Apto 402, Bogotá',
            perfiles: { nombre: 'Camila Rodríguez', telefono: '3109876543' },
            pedido_items: [
              {
                id: 1,
                cantidad: 2,
                precio_unitario: 14000,
                productos: { nombre: 'Yogur Griego Frutos Rojos', imagen_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200' }
              }
            ]
          },
          {
            id: 'MCS-102',
            tracking_code: 'MCS-102',
            created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
            estado: 'En Preparación',
            total: 26000,
            direccion: 'Calle 116 # 9-45, Bogotá',
            perfiles: { nombre: 'Andrés Morales', telefono: '3123456789' },
            pedido_items: [
              {
                id: 2,
                cantidad: 2,
                precio_unitario: 13000,
                productos: { nombre: 'Yogur Casero Maracuyá', imagen_url: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=200' }
              }
            ]
          }
        ])
      }

      // 2. Cargar Productos
      const { data: productsData, error: productsError } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true })

      if (!productsError && productsData) {
        setProducts(productsData)
      }

      // 3. Cargar Usuarios
      const { data: usersData, error: usersError } = await supabase
        .from('perfiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!usersError && usersData) {
        setUsersList(usersData)
      }
    } catch (err) {
      console.error('Error cargando datos del admin:', err)
      addToast('Error al conectar con la base de datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  /* =========================================================
     1. GESTIÓN Y ACTUALIZACIÓN DE PEDIDOS (TIEMPO REAL)
     ========================================================= */
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    // Actualización optimista
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.tracking_code === orderId ? { ...o, estado: newStatus } : o
      )
    )

    if (selectedOrderDetails && (selectedOrderDetails.id === orderId || selectedOrderDetails.tracking_code === orderId)) {
      setSelectedOrderDetails((prev) => ({ ...prev, estado: newStatus }))
    }

    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: newStatus })
        .eq('id', orderId)

      if (error) {
        addToast('Error al actualizar en Supabase: ' + error.message, 'error')
      } else {
        addToast(`Pedido #${orderId} actualizado a "${newStatus}"`, 'success')
      }
    } catch (err) {
      console.warn('Error sincronizando con Supabase:', err)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const code = (o.id || o.tracking_code || '').toLowerCase()
      const clientName = (o.perfiles?.nombre || '').toLowerCase()
      const searchMatch =
        !orderSearch.trim() ||
        code.includes(orderSearch.toLowerCase()) ||
        clientName.includes(orderSearch.toLowerCase())

      const statusMatch =
        orderStatusFilter === 'Todos' ||
        o.estado?.toLowerCase() === orderStatusFilter.toLowerCase()

      return searchMatch && statusMatch
    })
  }, [orders, orderSearch, orderStatusFilter])

  /* =========================================================
     2. GESTIÓN DE INVENTARIO Y PRODUCTOS (CRUD)
     ========================================================= */
  const handleToggleProductActive = async (productId, currentActive) => {
    const nextActive = !currentActive
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, activo: nextActive } : p))
    )

    try {
      const { error } = await supabase
        .from('productos')
        .update({ activo: nextActive })
        .eq('id', productId)

      if (error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, activo: currentActive } : p))
        )
        addToast('Error al actualizar disponibilidad: ' + error.message, 'error')
      } else {
        addToast(
          nextActive ? 'Producto activado en catálogo' : 'Producto pausado (agotado/no visible)',
          'success'
        )
      }
    } catch (err) {
      console.warn('Error en Supabase:', err)
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
      stock: prod.stock !== undefined ? prod.stock : 100,
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
      imagen_url:
        productFormData.imagen_url.trim() ||
        'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
      stock: Number(productFormData.stock) || 100,
      activo: Boolean(productFormData.activo),
    }

    try {
      if (productFormData.id) {
        // Actualizar
        const { data, error } = await supabase
          .from('productos')
          .update(productPayload)
          .eq('id', productFormData.id)
          .select()
          .maybeSingle()

        if (error) {
          addToast('Error al actualizar: ' + error.message, 'error')
        } else {
          setProducts((prev) =>
            prev.map((p) => (p.id === productFormData.id ? data || { ...p, ...productPayload } : p))
          )
          addToast('Producto actualizado exitosamente', 'success')
          setShowProductModal(false)
        }
      } else {
        // Crear
        const { data, error } = await supabase
          .from('productos')
          .insert(productPayload)
          .select()
          .maybeSingle()

        if (error) {
          addToast('Error al crear producto: ' + error.message, 'error')
        } else {
          setProducts((prev) => [...prev, data || { id: Date.now(), ...productPayload }])
          addToast('Producto añadido al catálogo con éxito', 'success')
          setShowProductModal(false)
        }
      }
    } catch (err) {
      console.warn('Error guardando producto:', err)
      addToast('Error de conexión al guardar producto', 'error')
    } finally {
      setSavingProduct(false)
    }
  }

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${productName}"?`)) {
      return
    }

    try {
      const { error } = await supabase.from('productos').delete().eq('id', productId)
      if (error) {
        addToast('Error al eliminar producto: ' + error.message, 'error')
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== productId))
        addToast('Producto eliminado permanentemente', 'info')
      }
    } catch (err) {
      console.warn('Error eliminando producto:', err)
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
     3. GESTIÓN DE USUARIOS Y ROLES
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

  const handleSaveUser = async (e) => {
    e.preventDefault()
    setSavingUser(true)

    try {
      const { error } = await supabase
        .from('perfiles')
        .update({
          nombre: userFormData.nombre,
          telefono: userFormData.telefono,
          direccion: userFormData.direccion,
          rol: userFormData.rol,
        })
        .eq('id', userFormData.id)

      if (error) {
        addToast('Error al actualizar usuario: ' + error.message, 'error')
      } else {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userFormData.id ? { ...u, ...userFormData } : u))
        )
        addToast('Usuario y rol actualizados correctamente', 'success')
        setShowUserModal(false)
      }
    } catch (err) {
      console.warn('Error guardando usuario:', err)
    } finally {
      setSavingUser(false)
    }
  }

  /* =========================================================
     MÉTRICAS RÁPIDAS
     ========================================================= */
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0)
    const pendingOrders = orders.filter((o) => o.estado === 'Pendiente' || o.estado === 'Recibido').length
    const preparingOrders = orders.filter((o) => o.estado === 'En Preparación' || o.estado === 'En preparación').length
    const completedOrders = orders.filter((o) => o.estado === 'Entregado').length

    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      preparingOrders,
      completedOrders,
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.activo !== false).length,
      totalUsers: usersList.length,
    }
  }, [orders, products, usersList])

  if (authLoading) {
    return (
      <div className="admin-loading-screen">
        <RefreshCw size={36} className="spin-icon" />
        <p>Verificando credenciales de seguridad...</p>
      </div>
    )
  }

  return (
    <motion.div
      className="page-transition admin-panel-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="admin-ambient-glow" />

      <div className="admin-container">
        {/* Header Superior del Panel */}
        <div className="admin-top-header">
          <div className="admin-title-area">
            <span className="admin-badge">
              <Shield size={14} /> Panel de Control Administrativo
            </span>
            <h1 className="admin-main-title">Mi Capricho Secreto <span>Admin</span></h1>
            <p className="admin-subtext">
              Bienvenido, <strong>{profile?.nombre || user?.email}</strong>. Gestiona inventario, pedidos y usuarios en tiempo real.
            </p>
          </div>

          <div className="admin-top-actions">
            <button
              type="button"
              className="btn-refresh-admin"
              onClick={loadAllData}
              title="Refrescar datos"
            >
              <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
              <span>Actualizar</span>
            </button>
            <button
              type="button"
              className="btn-logout-admin"
              onClick={() => {
                signOut()
                navigate('/')
              }}
              title="Cerrar sesión"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* Tarjetas KPI de Resumen */}
        <div className="admin-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon revenue">
              <DollarSign size={22} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Ventas Totales</span>
              <p className="kpi-val">${metrics.totalRevenue.toLocaleString('es-CO')}</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon orders">
              <ShoppingBag size={22} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Pedidos Activos</span>
              <p className="kpi-val">
                {metrics.pendingOrders + metrics.preparingOrders} <small>/ {metrics.totalOrders} total</small>
              </p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon products">
              <Package size={22} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Inventario Activo</span>
              <p className="kpi-val">
                {metrics.activeProducts} <small>/ {metrics.totalProducts} ítems</small>
              </p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon users">
              <Users size={22} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Clientes Registrados</span>
              <p className="kpi-val">{metrics.totalUsers}</p>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div className="admin-nav-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Truck size={17} />
            <span>Gestión de Pedidos</span>
            {metrics.pendingOrders > 0 && (
              <span className="tab-counter-badge">{metrics.pendingOrders}</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package size={17} />
            <span>Gestión de Inventario</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={17} />
            <span>Usuarios & Roles</span>
          </button>
        </div>

        {/* CONTENIDO 1: GESTIÓN DE PEDIDOS */}
        {activeTab === 'orders' && (
          <motion.div
            key="tab-orders"
            className="admin-tab-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Barra de Filtros de Pedidos */}
            <div className="admin-filter-bar">
              <div className="admin-search-input-box">
                <Search size={18} className="search-box-icon" />
                <input
                  type="text"
                  placeholder="Buscar por código (#MCS-101) o cliente..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>

              <div className="status-filter-chips">
                {['Todos', ...ORDER_STATUSES].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-chip ${orderStatusFilter === st ? 'active' : ''}`}
                    onClick={() => setOrderStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabla / Lista de Pedidos */}
            {filteredOrders.length === 0 ? (
              <div className="admin-empty-state">
                <ShoppingBag size={44} className="empty-icon" />
                <h3>No se encontraron pedidos</h3>
                <p>No hay órdenes que coincidan con los filtros seleccionados.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Código / Fecha</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Estado Actual</th>
                      <th>Actualizar Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => {
                      const code = ord.id || ord.tracking_code
                      const client = ord.perfiles?.nombre || 'Cliente Anónimo'
                      const phone = ord.perfiles?.telefono || 'Sin teléfono'
                      const dateStr = ord.created_at
                        ? new Date(ord.created_at).toLocaleDateString('es-CO', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Reciente'

                      return (
                        <tr key={ord.id} className="admin-table-row">
                          <td>
                            <div className="order-id-cell">
                              <span className="order-code-badge">#{code}</span>
                              <span className="order-date-sub">{dateStr}</span>
                            </div>
                          </td>
                          <td>
                            <div className="order-client-cell">
                              <span className="client-name">{client}</span>
                              <span className="client-phone"><Phone size={11} /> {phone}</span>
                            </div>
                          </td>
                          <td>
                            <span className="order-price-val">
                              ${Number(ord.total || 0).toLocaleString('es-CO')}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill small ${ord.estado?.toLowerCase().replace(/\s+/g, '')}`}>
                              <span className="status-dot" />
                              {ord.estado || 'Pendiente'}
                            </span>
                          </td>
                          <td>
                            <select
                              className="order-status-select"
                              value={ord.estado || 'Pendiente'}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            >
                              {ORDER_STATUSES.map((statusOption) => (
                                <option key={statusOption} value={statusOption}>
                                  {statusOption}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <div className="table-action-btns">
                              <button
                                type="button"
                                className="btn-table-action view"
                                onClick={() => setSelectedOrderDetails(ord)}
                                title="Ver detalles completos"
                              >
                                <Eye size={16} />
                              </button>
                              <Link
                                to={`/seguimiento?order=${encodeURIComponent(code)}`}
                                target="_blank"
                                className="btn-table-action external"
                                title="Ver como cliente"
                              >
                                <ExternalLink size={16} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* CONTENIDO 2: GESTIÓN DE INVENTARIO */}
        {activeTab === 'inventory' && (
          <motion.div
            key="tab-inventory"
            className="admin-tab-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inventory-top-bar">
              <div className="admin-search-input-box">
                <Search size={18} className="search-box-icon" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o descripción..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>

              <div className="inventory-actions">
                <select
                  className="category-dropdown"
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn-rose btn-add-product"
                  onClick={handleOpenNewProduct}
                >
                  <Plus size={18} />
                  <span>Nuevo Producto</span>
                </button>
              </div>
            </div>

            {/* Grid / Tabla de Productos */}
            {filteredProducts.length === 0 ? (
              <div className="admin-empty-state">
                <Package size={44} className="empty-icon" />
                <h3>No hay productos disponibles</h3>
                <p>No se encontraron productos que coincidan con la búsqueda.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock / Estado</th>
                      <th>Visibilidad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="admin-table-row">
                        <td>
                          <div className="product-table-item">
                            <img
                              src={prod.imagen_url || 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100'}
                              alt={prod.nombre}
                              className="product-table-thumb"
                            />
                            <div>
                              <p className="product-table-name">{prod.nombre}</p>
                              <span className="product-table-desc">{prod.descripcion || 'Sin descripción'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-pill">{prod.categoria || 'Yogur'}</span>
                        </td>
                        <td>
                          <span className="product-price-tag">
                            ${Number(prod.precio || 0).toLocaleString('es-CO')}
                          </span>
                        </td>
                        <td>
                          <span className="stock-counter">
                            {prod.stock !== undefined ? `${prod.stock} disp.` : 'Disponible'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn-toggle-switch ${prod.activo !== false ? 'active' : ''}`}
                            onClick={() => handleToggleProductActive(prod.id, prod.activo !== false)}
                            title={prod.activo !== false ? 'Pausar producto' : 'Activar producto'}
                          >
                            <span className="switch-slider" />
                            <span className="switch-text">{prod.activo !== false ? 'Activo' : 'Pausado'}</span>
                          </button>
                        </td>
                        <td>
                          <div className="table-action-btns">
                            <button
                              type="button"
                              className="btn-table-action edit"
                              onClick={() => handleOpenEditProduct(prod)}
                              title="Editar producto"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn-table-action delete"
                              onClick={() => handleDeleteProduct(prod.id, prod.nombre)}
                              title="Eliminar producto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* CONTENIDO 3: GESTIÓN DE USUARIOS Y ROLES */}
        {activeTab === 'users' && (
          <motion.div
            key="tab-users"
            className="admin-tab-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
                    <th>Rol en el Sistema</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} className="admin-table-row">
                      <td>
                        <div className="user-cell">
                          <span className="user-cell-name">{u.nombre || 'Usuario sin nombre'}</span>
                          <span className="user-cell-id">ID: {u.id?.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td>{u.telefono || 'No registrado'}</td>
                      <td>{u.direccion || 'No registrada'}</td>
                      <td>
                        <span className={`role-badge ${u.rol === 'admin' ? 'admin' : 'cliente'}`}>
                          {u.rol === 'admin' ? '👑 Administrador' : '👤 Cliente'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-table-action edit"
                          onClick={() => handleOpenEditUser(u)}
                          title="Cambiar rol o editar datos"
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* MODAL 1: DETALLES DEL PEDIDO SELECCIONADO */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setSelectedOrderDetails(null)}
          >
            <motion.div
              className="modal-container admin-modal-wide"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedOrderDetails(null)}
              >
                <X size={20} />
              </button>

              <div className="modal-header-badge">
                <span className="order-code-badge">
                  #{selectedOrderDetails.id || selectedOrderDetails.tracking_code}
                </span>
                <span className={`status-pill ${selectedOrderDetails.estado?.toLowerCase().replace(/\s+/g, '')}`}>
                  {selectedOrderDetails.estado}
                </span>
              </div>

              <h2 className="modal-title">Detalles del Pedido</h2>

              <div className="modal-details-grid">
                <div className="modal-info-card">
                  <h4><Users size={16} /> Datos del Cliente</h4>
                  <p><strong>Nombre:</strong> {selectedOrderDetails.perfiles?.nombre || 'No registrado'}</p>
                  <p><strong>Teléfono:</strong> {selectedOrderDetails.perfiles?.telefono || 'No registrado'}</p>
                  <p><strong>Dirección:</strong> {selectedOrderDetails.direccion || selectedOrderDetails.perfiles?.direccion || 'No registrada'}</p>
                </div>

                <div className="modal-info-card">
                  <h4><Calendar size={16} /> Fecha & Estado</h4>
                  <p><strong>Fecha Registro:</strong> {new Date(selectedOrderDetails.created_at).toLocaleString('es-CO')}</p>
                  <div className="modal-status-selector">
                    <label>Cambiar Estado:</label>
                    <select
                      value={selectedOrderDetails.estado}
                      onChange={(e) => handleUpdateOrderStatus(selectedOrderDetails.id, e.target.value)}
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Items del pedido */}
              <div className="modal-items-section">
                <h4><ShoppingBag size={16} /> Productos Solicitados</h4>
                <div className="modal-items-list">
                  {selectedOrderDetails.pedido_items?.map((it, i) => {
                    const prod = it.productos || it
                    return (
                      <div key={i} className="modal-item-row">
                        <img
                          src={prod.imagen_url || 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100'}
                          alt={prod.nombre}
                          className="modal-item-thumb"
                        />
                        <div className="modal-item-info">
                          <p className="modal-item-name">{prod.nombre || it.nombre}</p>
                          <span className="modal-item-qty">Cantidad: {it.cantidad} unidad(es)</span>
                        </div>
                        <p className="modal-item-price">
                          ${((it.precio_unitario || prod.precio || 0) * (it.cantidad || 1)).toLocaleString('es-CO')}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="modal-order-total">
                  <span>Total Pedido:</span>
                  <span className="total-amount">${Number(selectedOrderDetails.total || 0).toLocaleString('es-CO')}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CREAR / EDITAR PRODUCTO */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowProductModal(false)}
          >
            <motion.div
              className="modal-container"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowProductModal(false)}
              >
                <X size={20} />
              </button>

              <h2 className="modal-title">
                {productFormData.id ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h2>
              <p className="modal-subtitle">Completa los datos del producto para el catálogo oficial</p>

              <form onSubmit={handleSaveProduct} className="admin-form">
                <div className="form-group">
                  <label className="form-input-label">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Yogur Griego con Melocotón"
                    className="form-input-field"
                    value={productFormData.nombre}
                    onChange={(e) => setProductFormData({ ...productFormData, nombre: e.target.value })}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-input-label">Categoría</label>
                    <select
                      className="form-input-field"
                      value={productFormData.categoria}
                      onChange={(e) => setProductFormData({ ...productFormData, categoria: e.target.value })}
                    >
                      {CATEGORIES.filter((c) => c !== 'Todos').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-input-label">Precio ($ COP)</label>
                    <input
                      type="number"
                      required
                      placeholder="Ej: 14000"
                      className="form-input-field"
                      value={productFormData.precio}
                      onChange={(e) => setProductFormData({ ...productFormData, precio: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-input-label">Descripción</label>
                  <textarea
                    rows={3}
                    placeholder="Describe los ingredientes, notas de sabor y elaboración..."
                    className="form-input-field"
                    value={productFormData.descripcion}
                    onChange={(e) => setProductFormData({ ...productFormData, descripcion: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-input-label">URL de Imagen</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    className="form-input-field"
                    value={productFormData.imagen_url}
                    onChange={(e) => setProductFormData({ ...productFormData, imagen_url: e.target.value })}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-input-label">Stock / Cantidad Disponible</label>
                    <input
                      type="number"
                      placeholder="100"
                      className="form-input-field"
                      value={productFormData.stock}
                      onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={productFormData.activo}
                        onChange={(e) => setProductFormData({ ...productFormData, activo: e.target.checked })}
                      />
                      <span>Producto Visible y Disponible</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-rose"
                  disabled={savingProduct}
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  {savingProduct ? (
                    <div className="spinner-sm" />
                  ) : (
                    <span>{productFormData.id ? 'Guardar Cambios' : 'Crear Producto'}</span>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: EDITAR USUARIO Y ROL */}
      <AnimatePresence>
        {showUserModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowUserModal(false)}
          >
            <motion.div
              className="modal-container"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowUserModal(false)}
              >
                <X size={20} />
              </button>

              <h2 className="modal-title">Editar Rol y Usuario</h2>
              <p className="modal-subtitle">Asigna permisos de Administrador o Cliente</p>

              <form onSubmit={handleSaveUser} className="admin-form">
                <div className="form-group">
                  <label className="form-input-label">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    className="form-input-field"
                    value={userFormData.nombre}
                    onChange={(e) => setUserFormData({ ...userFormData, nombre: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-input-label">Rol del Usuario</label>
                  <select
                    className="form-input-field"
                    value={userFormData.rol}
                    onChange={(e) => setUserFormData({ ...userFormData, rol: e.target.value })}
                  >
                    <option value="cliente">Cliente Regular</option>
                    <option value="admin">Administrador (Acceso Total)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-input-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-input-field"
                    value={userFormData.telefono}
                    onChange={(e) => setUserFormData({ ...userFormData, telefono: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-rose"
                  disabled={savingUser}
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  {savingUser ? <div className="spinner-sm" /> : 'Actualizar Permisos'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
