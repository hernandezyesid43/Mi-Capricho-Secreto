import React, { useState } from 'react';
import { ShoppingBag, User, ShieldCheck, Menu, X, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { UserProfile } from '../../types';

interface PremiumNavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  favoritesCount?: number;
  onOpenFavorites?: () => void;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  currentUser: UserProfile | null;
  onOpenAdmin: () => void;
  activeView: 'store' | 'admin';
  onSwitchView: (view: 'store' | 'admin') => void;
  onSelectCategory?: (category: any) => void;
}

export const PremiumNavbar: React.FC<PremiumNavbarProps> = ({
  cartCount,
  onOpenCart,
  favoritesCount = 0,
  onOpenFavorites,
  onOpenAuth,
  onOpenProfile,
  currentUser,
  onOpenAdmin,
  activeView,
  onSwitchView,
  onSelectCategory
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FCF8F6]/90 backdrop-blur-md border-b border-rose-100/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand wordmark - Cleaned per user request */}
        <button
          onClick={() => {
            onSwitchView('store');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-left group cursor-pointer focus-visible:outline-none flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E5A87B]/40 to-[#D83A73]/30 flex items-center justify-center text-[#C02E62] group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-4 h-4 text-[#C02E62]" />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1A0D16] group-hover:text-[#C02E62] transition-colors">
            Mi Capricho Secreto
          </span>
        </button>

        {/* Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-700">
          <button
            onClick={() => {
              onSwitchView('store');
              if (onSelectCategory) onSelectCategory('Todos');
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#C02E62] transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#D83A73] hover:after:w-full after:transition-all"
          >
            Menú Completo
          </button>
          <button
            onClick={() => {
              onSwitchView('store');
              if (onSelectCategory) onSelectCategory('Yogur Griego');
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#C02E62] transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#D83A73] hover:after:w-full after:transition-all"
          >
            Yogur Griego
          </button>
          <button
            onClick={() => {
              onSwitchView('store');
              if (onSelectCategory) onSelectCategory('Yogur Casero');
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#C02E62] transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#D83A73] hover:after:w-full after:transition-all"
          >
            Yogur Casero
          </button>
          <button
            onClick={() => {
              onSwitchView('store');
              if (onSelectCategory) onSelectCategory('Repostería de Temporada');
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#C02E62] transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#D83A73] hover:after:w-full after:transition-all"
          >
            Repostería
          </button>
          <button
            onClick={() => {
              onSwitchView('store');
              document.getElementById('filosofia')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#C02E62] transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#D83A73] hover:after:w-full after:transition-all"
          >
            Elaboración (1-3 días)
          </button>
          <button
            onClick={() => {
              onSwitchView('store');
              document.getElementById('rastreo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#C02E62] transition-colors cursor-pointer relative py-1 flex items-center gap-1.5 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#D83A73] hover:after:w-full after:transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D83A73]" />
            <span>Rastrear Pedido</span>
          </button>
        </nav>

        {/* Primary actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenProfile || onOpenAuth}
                className="text-xs font-semibold text-stone-800 hover:text-[#C02E62] py-1.5 px-3 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer border border-rose-200/80 bg-white/70 shadow-2xs"
                title="Ver mi perfil y pedidos"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#D83A73] to-[#E5A87B] text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.nombre.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">
                  {currentUser.nombre.split(' ')[0]}
                </span>
              </button>

              {currentUser.rol === 'admin' && (
                <button
                  onClick={() => onSwitchView(activeView === 'admin' ? 'store' : 'admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    activeView === 'admin'
                      ? 'bg-gradient-to-r from-[#1A0D16] to-[#361326] text-[#E5A87B] border border-[#E5A87B]/40'
                      : 'bg-stone-900 text-[#E5A87B] hover:bg-stone-800'
                  }`}
                  title="Panel Administrativo de Cocina y Clientes"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E5A87B]" />
                  <span className="hidden sm:inline">
                    {activeView === 'admin' ? 'Ver Tienda' : 'Admin'}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-stone-700 hover:text-[#C02E62] py-2 px-3 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-200/60 bg-white/60"
            >
              <User className="w-3.5 h-3.5 text-stone-500" />
              <span>Ingresar</span>
            </button>
          )}

          {/* Mis Favoritos Button */}
          {onOpenFavorites && (
            <button
              onClick={onOpenFavorites}
              aria-label="Ver recetas favoritas"
              title="Mis Favoritos"
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-rose-50 text-stone-700 hover:text-rose-500 border border-rose-200/80 hover:border-rose-300 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  favoritesCount > 0
                    ? 'fill-rose-500 text-rose-500 scale-105'
                    : 'text-stone-500'
                }`}
              />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] font-mono tabular-nums w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {/* Floating Cart Trigger with Rose Gold & Berry Aura */}
          <button
            onClick={onOpenCart}
            aria-label="Abrir carrito de compras"
            className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-[#1A0D16] via-[#2A1220] to-[#1A0D16] text-[#FAF4F0] border border-[#E5A87B]/40 hover:border-[#E5A87B] hover:shadow-[0_4px_20px_rgba(216,58,115,0.3)] transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-5 h-5 text-[#E5A87B]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white font-bold text-[11px] font-mono tabular-nums w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-in zoom-in-75">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-800 hover:text-[#C02E62] focus:outline-none"
            aria-label="Alternar menú móvil"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FCF8F6] border-b border-rose-100 px-6 py-5 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-3 text-base font-semibold text-stone-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSwitchView('store');
                if (onSelectCategory) onSelectCategory('Todos');
                document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left py-1 hover:text-[#C02E62]"
            >
              Menú Completo
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSwitchView('store');
                if (onSelectCategory) onSelectCategory('Yogur Griego');
                document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left py-1 hover:text-[#C02E62]"
            >
              Yogur Griego
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSwitchView('store');
                if (onSelectCategory) onSelectCategory('Yogur Casero');
                document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left py-1 hover:text-[#C02E62]"
            >
              Yogur Casero
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSwitchView('store');
                if (onSelectCategory) onSelectCategory('Repostería de Temporada');
                document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left py-1 hover:text-[#C02E62]"
            >
              Repostería
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSwitchView('store');
                document.getElementById('filosofia')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left py-1 hover:text-[#C02E62]"
            >
              Elaboración (1-3 días)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSwitchView('store');
                document.getElementById('rastreo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left py-1 text-[#C02E62] font-bold flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#D83A73] animate-pulse" />
              <span>Rastrear Pedido en Cocina</span>
            </button>
            {onOpenFavorites && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSwitchView('store');
                  onOpenFavorites();
                }}
                className="text-left py-1 text-rose-600 font-semibold flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>Mis Recetas Favoritas</span>
                </span>
                {favoritesCount > 0 && (
                  <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          <div className="pt-3 border-t border-rose-100 flex flex-col gap-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenProfile) onOpenProfile();
                    else onOpenAuth();
                  }}
                  className="w-full py-2.5 px-4 bg-white border border-rose-200 text-stone-800 font-semibold text-sm rounded-xl flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#C02E62]" />
                    <span>Mi Perfil & Pedidos ({currentUser.nombre.split(' ')[0]})</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </button>

                {currentUser.rol === 'admin' && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSwitchView(activeView === 'admin' ? 'store' : 'admin');
                    }}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#1A0D16] to-[#361326] text-[#E5A87B] font-bold text-sm rounded-xl flex items-center justify-between"
                  >
                    <span>{activeView === 'admin' ? 'Ver Tienda' : 'Abrir Panel Cocina & Clientes'}</span>
                    <ShieldCheck className="w-4 h-4 text-[#E5A87B]" />
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 px-4 border border-rose-200 bg-white text-stone-800 font-semibold text-sm rounded-xl flex items-center justify-between"
              >
                <span>Iniciar Sesión / Registro</span>
                <User className="w-4 h-4 text-stone-500" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
