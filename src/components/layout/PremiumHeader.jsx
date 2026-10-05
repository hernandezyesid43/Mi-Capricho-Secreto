import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, User, LogOut, PackageCheck } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import AuthModal from './AuthModal'

export default function PremiumHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const { user, profile, signOut, isAdmin } = useAuthStore()
  const { toggleCart } = useCartStore()
  const itemCount = useCartStore((s) => s.items.reduce((c, i) => c + i.cantidad, 0))
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleProfileClick = () => {
    if (user) {
      navigate('/perfil')
    } else {
      setShowAuth(true)
    }
  }

  return (
    <>
      <header
        className={`premium-header ${scrolled ? 'scrolled' : ''} ${isHome && !scrolled ? 'is-hero' : ''}`}
      >
        <Link to="/" className="header-logo">
          Mi Capricho <span>Secreto</span>
        </Link>

        <nav className="header-nav">
          <Link
            to="/"
            className={`header-nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Inicio
          </Link>
          <Link
            to="/catalogo"
            className={`header-nav-link ${location.pathname === '/catalogo' ? 'active' : ''}`}
          >
            Catálogo
          </Link>
          <Link
            to="/seguimiento"
            className={`header-nav-link ${location.pathname === '/seguimiento' ? 'active' : ''}`}
          >
            <PackageCheck size={16} className="nav-icon-inline" />
            {user ? 'Mis Pedidos' : 'Rastrear Pedido'}
          </Link>
          {isAdmin() && (
            <Link
              to="/mcs-management"
              className={`header-nav-link ${location.pathname === '/mcs-management' ? 'active' : ''}`}
            >
              Panel Admin
            </Link>
          )}
        </nav>

        <div className="header-icons">
          {user ? (
            <Link
              to="/perfil"
              className="header-account-btn"
              title="Mi Cuenta"
              id="header-account-btn"
            >
              <User size={18} />
              <span className="account-text">
                {profile?.nombre ? profile.nombre.split(' ')[0] : 'Mi Cuenta'}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="header-account-btn"
              title="Iniciar Sesión / Mi Cuenta"
              id="header-login-btn"
            >
              <User size={18} />
              <span className="account-text">Iniciar Sesión</span>
            </Link>
          )}

          <button
            className="header-cart-btn"
            onClick={toggleCart}
            aria-label="Carrito de compras"
            id="cart-toggle-btn"
          >
            <ShoppingBag size={18} />
            <span>Carrito</span>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>
        </div>
      </header>
    </>
  );
}