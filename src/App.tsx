import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  ChefHat, 
  Truck, 
  HeartHandshake, 
  Search,
  Heart,
  Flame,
  Award,
  MessageCircle,
  PackageSearch
} from 'lucide-react';

import { Product, CartItem, Order, UserProfile, OrderStatus, ToastNotification, ProductCategory } from './types';
import { 
  getStoredProducts, 
  getStoredOrders, 
  getCurrentUser, 
  setCurrentUser, 
  updateOrderStatus, 
  toggleOrderPriority, 
  subscribeToDataChanges,
  resetToSeedData,
  getStoredFavorites,
  saveFavorites
} from './services/dataService';
import { getGeneralWhatsAppUrl } from './services/whatsappService';
import { subscribeToAuth } from './services/firebase';

import { PremiumNavbar } from './components/layout/PremiumNavbar';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { Footer } from './components/layout/Footer';
import { ProductCard } from './components/product/ProductCard';
import { ProductModal } from './components/product/ProductModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { KanbanBoard } from './components/kitchen/KanbanBoard';
import { CatalogManagement } from './components/admin/CatalogManagement';
import { AccountingView } from './components/admin/AccountingView';
import { CustomerManagement } from './components/admin/CustomerManagement';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { ToastContainer } from './components/common/Toast';
import { GoldButton } from './components/common/GoldButton';
import { OrderTrackingSection } from './components/tracking/OrderTrackingSection';

export default function App() {
  // Data state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      return getStoredProducts();
    } catch {
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      return getStoredOrders();
    } catch {
      return [];
    }
  });
  const [currentUser, setUser] = useState<UserProfile | null>(() => {
    try {
      return getCurrentUser();
    } catch {
      return null;
    }
  });

  // UI state
  const [activeView, setActiveView] = useState<'store' | 'admin'>('store');
  const [adminTab, setAdminTab] = useState<'kitchen' | 'catalog' | 'accounting' | 'customers'>('kitchen');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Favorites state
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return getStoredFavorites();
    } catch {
      return [1];
    }
  });

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('capricho_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Modals state
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [trackingOrderCode, setTrackingOrderCode] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (title: string, message?: string, type: 'gold' | 'success' | 'error' | 'info' = 'gold') => {
    const newToast: ToastNotification = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(newToast.id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync with persistent data service and Firebase Auth
  useEffect(() => {
    const reload = () => {
      setProducts(getStoredProducts());
      setOrders(getStoredOrders());
      setUser(getCurrentUser());
    };

    reload();
    const unsubscribeData = subscribeToDataChanges(reload);
    const unsubscribeAuth = subscribeToAuth((fbProfile) => {
      if (fbProfile) {
        setUser(fbProfile);
        setCurrentUser(fbProfile);
      }
    });

    return () => {
      unsubscribeData();
      unsubscribeAuth();
    };
  }, []);

  // Save cart in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('capricho_cart_v1', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cartItems]);

  // Cart management
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, cantidad: item.cantidad + quantity }
            : item
        );
      }
      return [...prev, { product, cantidad: quantity }];
    });

    addToast(
      'Añadido a tu Cesta',
      `${quantity}x ${product.nombre} añadido a tu pedido.`,
      'success'
    );
  };

  const handleUpdateCartQuantity = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, cantidad: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOrderCompleted = (createdOrder: Order) => {
    setCartItems([]);
    setTrackingOrderCode(createdOrder.codigo_orden);
    addToast(
      '¡Orden Registrada!',
      `Pedido #${createdOrder.codigo_orden} generado. Puedes rastrearlo en tiempo real en la sección de seguimiento.`,
      'success'
    );
    setTimeout(() => {
      document.getElementById('rastreo')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  // Admin access validation
  const handleSwitchView = (view: 'store' | 'admin') => {
    if (view === 'admin') {
      if (currentUser?.rol !== 'admin') {
        setIsAuthOpen(true);
        addToast(
          'Acceso Restringido',
          'Ingresa tus credenciales autorizadas para acceder a la gestión de cocina.',
          'info'
        );
        return;
      }
    }
    setActiveView(view);
  };

  // Kitchen actions
  const handleUpdateOrderStatus = (orderId: number, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    addToast('Cocina sincronizada', `Orden #${orderId} actualizada a: ${status}.`);
  };

  const handleTogglePriority = (orderId: number) => {
    toggleOrderPriority(orderId);
  };

  // Favorites toggle handler
  const handleToggleFavorite = (productId: number) => {
    const isAlreadyFav = favorites.includes(productId);
    const nextFavs = isAlreadyFav
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];
    setFavorites(nextFavs);
    saveFavorites(nextFavs);

    const product = products.find((p) => p.id === productId);
    const prodName = product ? product.nombre : 'Producto';
    if (isAlreadyFav) {
      addToast('Favorito retirado', `Quitaste "${prodName}" de tus favoritos.`, 'info');
    } else {
      addToast('¡Añadido a Favoritos!', `"${prodName}" guardado en tus preferidos.`, 'gold');
    }
  };

  // Reset seed
  const handleResetSeed = () => {
    resetToSeedData();
    addToast('Datos restablecidos', 'Se han restaurado las recetas y pedidos de prueba.');
  };

  const cartTotalCount = cartItems.reduce((acc, curr) => acc + curr.cantidad, 0);

  // Filter products for client storefront
  const activeProducts = products.filter((p) => p.activo);
  const filteredProducts = activeProducts.filter((product) => {
    const matchesFavorites = !showFavoritesOnly || favorites.includes(product.id);
    const matchesCategory =
      showFavoritesOnly || selectedCategory === 'Todos' || product.categoria === selectedCategory;
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFavorites && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FCF8F6] text-[#1A0D16] flex flex-col selection:bg-[#D83A73]/25 selection:text-[#1A0D16]">
      {/* Toast Notifications */}
      <ToastContainer notifications={toasts} onDismiss={removeToast} />

      {/* Admin View Mode */}
      {activeView === 'admin' ? (
        <div className="flex h-screen overflow-hidden">
          <AdminSidebar
            currentTab={adminTab}
            onSelectTab={setAdminTab}
            pendingOrdersCount={orders.filter((o) => o.estado === 'Pendiente').length}
            onExitAdmin={() => setActiveView('store')}
            onResetSeedData={handleResetSeed}
            onLogout={() => {
              setCurrentUser(null);
              setUser(null);
              setActiveView('store');
              addToast('Sesión cerrada', 'Has cerrado tu acceso seguro.');
            }}
          />

          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {adminTab === 'kitchen' && (
              <KanbanBoard
                orders={orders}
                onUpdateStatus={handleUpdateOrderStatus}
                onTogglePriority={handleTogglePriority}
              />
            )}
            {adminTab === 'catalog' && (
              <CatalogManagement
                products={products}
                onProductsChanged={() => setProducts(getStoredProducts())}
                onShowToast={addToast}
              />
            )}
            {adminTab === 'accounting' && <AccountingView orders={orders} />}
            {adminTab === 'customers' && (
              <CustomerManagement orders={orders} onShowToast={addToast} />
            )}
          </main>
        </div>
      ) : (
        /* Client Storefront Mode */
        <>
          <PremiumNavbar
            cartCount={cartTotalCount}
            onOpenCart={() => setIsCartOpen(true)}
            favoritesCount={favorites.length}
            onOpenFavorites={() => {
              setActiveView('store');
              setShowFavoritesOnly(true);
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            currentUser={currentUser}
            onOpenAdmin={() => handleSwitchView('admin')}
            activeView={activeView}
            onSwitchView={handleSwitchView}
            onSelectCategory={(cat) => {
              setShowFavoritesOnly(false);
              setSelectedCategory(cat);
            }}
          />

          <main className="flex-1">
            {/* Dynamic Luxury Hero Section with Floating Rose Auras */}
            <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF0EC] via-[#FCF8F6] to-[#FAF2EE] pt-14 pb-24 border-b border-rose-100/80">
              
              {/* Ambient Floating Glow Spheres */}
              <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-tr from-[#E5A87B]/25 to-[#D83A73]/20 rounded-full blur-3xl pointer-events-none animate-float" />
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-bl from-[#C02E62]/15 to-[#F5D3B3]/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column: Hero Text */}
                  <div className="lg:col-span-7 space-y-7 text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-rose-200/80 shadow-xs backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5 text-[#C02E62]" />
                      <span className="text-xs font-bold text-stone-800 tracking-wider uppercase">
                        Elaboración Exclusiva Bajo Pedido
                      </span>
                    </div>

                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A0D16] leading-[1.1]">
                      El placer de lo auténtico en cada cucharada.
                    </h1>

                    <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
                      Yogur griego extra denso filtrado con paciencia en paño puro, yogur casero con leche viva de pastura y repostería artesanal horneada al momento. Sin espesantes químicos ni conservantes. Cuidamos cada detalle durante 1 a 3 días para brindarte una textura aterciopelada inolvidable.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <GoldButton
                        variant="primary"
                        size="lg"
                        onClick={() => {
                          document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center gap-2.5"
                      >
                        <span>Explorar el Menú</span>
                        <ArrowRight className="w-4 h-4" />
                      </GoldButton>

                      <button
                        onClick={() => {
                          document.getElementById('filosofia')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-6 py-3.5 text-sm font-bold text-[#1A0D16] hover:text-[#C02E62] border-2 border-rose-200/90 rounded-2xl hover:border-rose-300 bg-white/80 backdrop-blur-xs transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5"
                      >
                        Tiempos de Cocina (1-3 días)
                      </button>

                      <button
                        onClick={() => {
                          document.getElementById('rastreo')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-5 py-3.5 text-sm font-bold text-[#C02E62] hover:text-[#A32252] border-2 border-rose-200/80 hover:border-rose-300 bg-rose-50/70 hover:bg-rose-100/70 rounded-2xl transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 flex items-center gap-2"
                      >
                        <PackageSearch className="w-4 h-4 text-[#D83A73]" />
                        <span>Rastrear Pedido</span>
                      </button>
                    </div>

                    {/* Trust Badges */}
                    <div className="pt-6 border-t border-rose-100 flex flex-wrap gap-6 text-xs text-stone-600 font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-rose-100 text-[#C02E62] flex items-center justify-center font-bold text-xs shadow-2xs">
                          ✓
                        </div>
                        <span>Leche 100% pura de pastoreo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#FAF0EC] text-[#E5A87B] flex items-center justify-center font-bold text-xs shadow-2xs">
                          ⏳
                        </div>
                        <span>Filtrado lento (1 a 3 días)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-rose-100 text-[#C02E62] flex items-center justify-center font-bold text-xs shadow-2xs">
                          ✨
                        </div>
                        <span>Entrega personalizada en Bogotá</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Hero Showcase Card */}
                  <div className="lg:col-span-5 relative">
                    <div className="relative mx-auto max-w-md lg:max-w-none">
                      {/* Aura */}
                      <div className="absolute -inset-4 bg-gradient-to-tr from-[#D83A73]/30 via-[#E5A87B]/20 to-transparent rounded-3xl blur-2xl -z-10" />

                      <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(26,13,22,0.12)] border border-rose-200/90 bg-white">
                        {products[0]?.imagen_url ? (
                          <img
                            src={products[0].imagen_url}
                            alt="Yogur Griego Clásico"
                            referrerPolicy="no-referrer"
                            className="w-full h-80 sm:h-96 object-cover"
                          />
                        ) : (
                          <div className="w-full h-80 sm:h-96 bg-gradient-to-tr from-rose-100 to-rose-50 flex items-center justify-center">
                            <Award className="w-16 h-16 text-[#C02E62]/30" />
                          </div>
                        )}

                        {/* Floating Card */}
                        <div className="absolute bottom-4 inset-x-4 p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-rose-100 shadow-xl text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C02E62] flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-[#E5A87B]" />
                              Especialidad de la Casa
                            </span>
                            <span className="text-xs font-mono font-bold text-[#1A0D16]">
                              $18.000 COP
                            </span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-[#1A0D16] mt-0.5">
                            Yogur Griego Clásico de Autor (500g)
                          </h4>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                            Filtrado 36 horas en tela pura. Alto en proteína viva natural.
                          </p>
                          <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-rose-100">
                            <span className="text-[11px] text-stone-600 flex items-center gap-1.5 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-[#D83A73]" />
                              3 días de preparación lenta
                            </span>
                            <button
                              onClick={() => {
                                if (products[0]) handleAddToCart(products[0]);
                              }}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white text-xs font-bold rounded-xl hover:brightness-105 transition-all shadow-xs"
                            >
                              Pedir Ahora
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* Catalog Section */}
            <section id="catalogo" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-rose-100">
                <div className="text-left">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C02E62] block mb-1.5">
                    Menú Artesanal de Temporada
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A0D16] tracking-tight">
                    Descubre Tu Capricho
                  </h2>
                  <p className="text-sm text-stone-600 mt-1 max-w-xl">
                    Cada orden se elabora desde cero para ti en Bogotá. Selecciona tu presentación favorita y consulta sus días de preparación.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por sabor o ingrediente..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-rose-200/80 rounded-2xl text-xs text-[#1A0D16] placeholder:text-stone-400 focus:outline-none focus:border-[#C02E62] focus:ring-1 focus:ring-[#C02E62] shadow-2xs"
                  />
                </div>
              </div>

              {/* Category Filter Pills & Favoritos Filter */}
              <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-10">
                {(['Todos', 'Yogur Griego', 'Yogur Casero', 'Repostería de Temporada'] as ProductCategory[]).map(
                  (cat) => {
                    const isSelected = !showFavoritesOnly && selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setShowFavoritesOnly(false);
                          setSelectedCategory(cat);
                        }}
                        className={`px-5 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#D83A73] via-[#C02E62] to-[#A32252] text-white shadow-[0_4px_16px_rgba(216,58,115,0.32)] scale-102'
                            : 'bg-white text-stone-700 border border-rose-200/70 hover:border-rose-300 hover:bg-rose-50/50'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  }
                )}

                {/* Favoritos Filter Pill */}
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`px-5 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                    showFavoritesOnly
                      ? 'bg-rose-500 text-white shadow-[0_4px_16px_rgba(244,63,94,0.36)] scale-102 border-rose-400'
                      : 'bg-white text-stone-700 border-rose-200/70 hover:border-rose-300 hover:bg-rose-50/50'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-transform ${
                      showFavoritesOnly
                        ? 'fill-white stroke-white scale-110'
                        : 'text-rose-500 fill-rose-500/20'
                    }`}
                  />
                  <span>Favoritos</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      showFavoritesOnly
                        ? 'bg-white/25 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {favorites.length}
                  </span>
                </button>
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                showFavoritesOnly ? (
                  <div className="py-16 text-center bg-white rounded-3xl border border-rose-100 p-8 max-w-lg mx-auto shadow-2xs">
                    <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-500 mx-auto mb-3 shadow-2xs">
                      <Heart className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#1A0D16]">
                      Aún no tienes favoritos guardados
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed">
                      Haz clic en el corazón de cualquier receta del menú para guardarla aquí y encontrarla al instante.
                    </p>
                    <GoldButton
                      variant="primary"
                      size="sm"
                      onClick={() => setShowFavoritesOnly(false)}
                      className="mt-6"
                    >
                      Explorar todo el Menú
                    </GoldButton>
                  </div>
                ) : (
                  <div className="py-20 text-center bg-white rounded-3xl border border-rose-100">
                    <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-[#C02E62] mx-auto mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#1A0D16]">
                      No se encontraron recetas coincidentes
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Prueba buscando otro término o restablece los filtros.
                    </p>
                    <GoldButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory('Todos');
                        setSearchQuery('');
                        setShowFavoritesOnly(false);
                      }}
                      className="mt-5"
                    >
                      Ver Menú Completo
                    </GoldButton>
                  </div>
                )
              ) : (
                <div
                  key={`${showFavoritesOnly ? 'favs' : selectedCategory}-${searchQuery}`}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      index={index}
                      product={product}
                      isFavorite={favorites.includes(product.id)}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onViewDetails={(p) => setActiveProductModal(p)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* User-Facing Order Tracking Section */}
            <OrderTrackingSection
              orders={orders}
              initialOrderCode={trackingOrderCode}
            />

            {/* Philosophy & 1-3 Days Explanation Section */}
            <section id="filosofia" className="py-24 bg-gradient-to-b from-[#FAF2EE] via-[#FCF8F6] to-[#FAF4F0] border-t border-b border-rose-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C02E62] block">
                    Modelo de Pedidos Personalizados
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A0D16]">
                    ¿Por qué tardamos entre 1 y 3 días?
                  </h2>
                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                    A diferencia del yogur industrial saturado de aditivos para conservarse durante meses en un estante, en <strong>Mi Capricho Secreto</strong> el tiempo de fermentación es nuestro mayor secreto de lujo.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  <div className="bg-white p-8 rounded-3xl border border-rose-200/80 shadow-[0_4px_24px_rgba(26,13,22,0.04)] flex flex-col justify-between text-left hover:-translate-y-1 transition-all duration-300">
                    <div>
                      <span className="font-serif text-4xl font-bold bg-gradient-to-r from-[#D83A73] to-[#E5A87B] bg-clip-text text-transparent block mb-4">
                        01.
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1A0D16] mb-2.5">
                        Eliges tu Pedido a Medida
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Seleccionas tus productos favoritos y envías tu orden con un solo clic a nuestro WhatsApp oficial para agendar la fecha de despacho y coordinar el pago.
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-rose-100 flex items-center gap-2.5 text-xs font-bold text-[#C02E62]">
                      <HeartHandshake className="w-4 h-4 text-[#D83A73]" />
                      <span>Atención personalizada y directa</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white p-8 rounded-3xl border border-rose-200/80 shadow-[0_4px_24px_rgba(26,13,22,0.04)] flex flex-col justify-between text-left hover:-translate-y-1 transition-all duration-300">
                    <div>
                      <span className="font-serif text-4xl font-bold bg-gradient-to-r from-[#D83A73] to-[#E5A87B] bg-clip-text text-transparent block mb-4">
                        02.
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1A0D16] mb-2.5">
                        Fermentación & Horneado Lento
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Iniciamos tu lote en nuestro obrador. El yogur griego se filtra durante 36 horas en paño para escurrir el suero de manera natural hasta lograr una consistencia untuosa insuperable.
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-rose-100 flex items-center gap-2.5 text-xs font-bold text-[#C02E62]">
                      <ChefHat className="w-4 h-4 text-[#D83A73]" />
                      <span>Elaboración 100% artesanal</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white p-8 rounded-3xl border border-rose-200/80 shadow-[0_4px_24px_rgba(26,13,22,0.04)] flex flex-col justify-between text-left hover:-translate-y-1 transition-all duration-300">
                    <div>
                      <span className="font-serif text-4xl font-bold bg-gradient-to-r from-[#D83A73] to-[#E5A87B] bg-clip-text text-transparent block mb-4">
                        03.
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1A0D16] mb-2.5">
                        Entrega Fresca en tu Puerta
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Lo envasamos y entregamos de inmediato para mantener su frescura natural y conservar la cadena de frío en Bogotá. Pagas cómodamente contra entrega o por transferencia (Nequi, Daviplata o Bancolombia).
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-rose-100 flex items-center gap-2.5 text-xs font-bold text-[#C02E62]">
                      <Truck className="w-4 h-4 text-[#D83A73]" />
                      <span>Frescura viva garantizada</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <Footer
            onOpenAdmin={() => handleSwitchView('admin')}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />

          {/* Floating WhatsApp Quick Contact Button */}
          <motion.a
            href={getGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            aria-label="Contactar por WhatsApp con Mi Capricho Secreto"
            title="Escríbenos directamente a WhatsApp"
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-[0_8px_25px_rgba(37,211,102,0.42)] border border-white/30 backdrop-blur-xs font-bold text-xs cursor-pointer group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <MessageCircle className="w-4 h-4 fill-white stroke-none" />
            <span className="hidden sm:inline font-sans tracking-wide">
              ¿Deseas personalizar tu pedido? WhatsApp
            </span>
          </motion.a>
        </>
      )}

      {/* Product Detail Modal */}
      <ProductModal
        product={activeProductModal}
        isFavorite={activeProductModal ? favorites.includes(activeProductModal.id) : false}
        onClose={() => setActiveProductModal(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currentUser={currentUser}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setUser(user);
          addToast(
            'Sesión Autorizada',
            user.rol === 'admin'
              ? 'Acceso concedido al panel administrativo.'
              : `Bienvenido(a), ${user.nombre}.`,
            'success'
          );
          if (user.rol === 'admin') {
            setActiveView('admin');
          }
        }}
        onLogout={() => {
          setCurrentUser(null);
          setUser(null);
          setActiveView('store');
          addToast('Sesión cerrada', 'Has cerrado tu cuenta.');
        }}
      />

      {/* User Profile & Orders Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        orders={orders}
        onUserUpdated={(updatedUser) => {
          setUser(updatedUser);
          addToast('Datos Actualizados', 'Tu información de perfil se ha guardado exitosamente.', 'success');
        }}
        onLogout={() => {
          setCurrentUser(null);
          setUser(null);
          setIsProfileOpen(false);
          setActiveView('store');
          addToast('Sesión cerrada', 'Has cerrado tu cuenta.');
        }}
        onTrackOrder={(orderCode) => {
          setTrackingOrderCode(orderCode);
          setTimeout(() => {
            document.getElementById('rastreo')?.scrollIntoView({ behavior: 'smooth' });
          }, 400);
        }}
        onOpenAdmin={() => {
          handleSwitchView('admin');
        }}
      />
    </div>
  );
}
