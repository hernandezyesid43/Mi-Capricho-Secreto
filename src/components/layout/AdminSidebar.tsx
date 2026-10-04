import React from 'react';
import { ChefHat, BookOpen, BarChart3, Store, LogOut, RefreshCw, Radio, Sparkles, Users } from 'lucide-react';

interface AdminSidebarProps {
  currentTab: 'kitchen' | 'catalog' | 'accounting' | 'customers';
  onSelectTab: (tab: 'kitchen' | 'catalog' | 'accounting' | 'customers') => void;
  pendingOrdersCount: number;
  onExitAdmin: () => void;
  onResetSeedData: () => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingOrdersCount,
  onExitAdmin,
  onResetSeedData,
  onLogout
}) => {
  return (
    <aside className="w-64 bg-gradient-to-b from-[#180B14] via-[#1E0E19] to-[#140810] text-[#FAF4F0] min-h-screen flex flex-col justify-between border-r border-[#2C1425] shrink-0">
      <div>
        {/* Brand header */}
        <div className="p-6 border-b border-[#2C1425]">
          <div className="flex items-center gap-2.5 text-[#E5A87B] mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#2A1222] border border-[#E5A87B]/40 flex items-center justify-center text-[#E5A87B]">
              <ChefHat className="w-4 h-4" />
            </div>
            <span className="font-serif text-lg font-bold tracking-tight text-white">
              Capricho Cocina
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-medium">
            Gestión Privada de Lotes & Pedidos
          </p>
          <div className="mt-3.5 flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Sincronización en Vivo: Activa</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-2">
          <button
            onClick={() => onSelectTab('kitchen')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'kitchen'
                ? 'bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white shadow-[0_4px_16px_rgba(216,58,115,0.4)]'
                : 'text-stone-300 hover:bg-stone-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ChefHat className="w-4 h-4" />
              <span>Pantalla de Cocina</span>
            </div>
            {pendingOrdersCount > 0 && (
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  currentTab === 'kitchen'
                    ? 'bg-white text-[#C02E62]'
                    : 'bg-[#D83A73] text-white'
                }`}
              >
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('catalog')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'catalog'
                ? 'bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white shadow-[0_4px_16px_rgba(216,58,115,0.4)]'
                : 'text-stone-300 hover:bg-stone-800/50 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Gestión del Menú</span>
          </button>

          <button
            onClick={() => onSelectTab('accounting')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'accounting'
                ? 'bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white shadow-[0_4px_16px_rgba(216,58,115,0.4)]'
                : 'text-stone-300 hover:bg-stone-800/50 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Contabilidad & Reportes</span>
          </button>

          <button
            onClick={() => onSelectTab('customers')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'customers'
                ? 'bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white shadow-[0_4px_16px_rgba(216,58,115,0.4)]'
                : 'text-stone-300 hover:bg-stone-800/50 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes & Cuentas</span>
          </button>
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-[#2C1425] space-y-2">
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-300 hover:text-[#E5A87B] hover:bg-stone-800/40 rounded-xl transition-colors cursor-pointer"
        >
          <Store className="w-4 h-4" />
          <span>Volver al Menú Público</span>
        </button>

        <button
          onClick={onResetSeedData}
          className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 rounded-xl transition-colors cursor-pointer"
          title="Restablece los pedidos y productos de prueba"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restablecer Datos Demo</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
