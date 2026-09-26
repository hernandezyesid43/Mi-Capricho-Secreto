import React, { useState } from 'react';
import { ChefHat, Flame, CheckCheck, Sparkles, Search } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { KitchenTicket } from './KitchenTicket';

interface KanbanBoardProps {
  orders: Order[];
  onUpdateStatus: (orderId: number, status: OrderStatus) => void;
  onTogglePriority: (orderId: number) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  orders,
  onUpdateStatus,
  onTogglePriority
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriorityOnly, setFilterPriorityOnly] = useState(false);

  // Drag and drop state
  const handleDragStart = (e: React.DragEvent, orderId: number) => {
    e.dataTransfer.setData('text/plain', orderId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: OrderStatus) => {
    e.preventDefault();
    const orderIdStr = e.dataTransfer.getData('text/plain');
    if (!orderIdStr) return;
    const orderId = parseInt(orderIdStr, 10);
    if (!isNaN(orderId)) {
      onUpdateStatus(orderId, targetStatus);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.codigo_orden.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.barrio_localidad.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriorityOnly ? order.prioridad : true;
    return matchesSearch && matchesPriority;
  });

  const pendingOrders = filteredOrders.filter((o) => o.estado === 'Pendiente');
  const inProgressOrders = filteredOrders.filter((o) => o.estado === 'En Preparación');
  const readyOrders = filteredOrders.filter((o) => o.estado === 'Listo');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF4F0] overflow-hidden">
      {/* Top Filter & Search Bar */}
      <div className="px-6 py-4 bg-white/90 backdrop-blur-md border-b border-rose-100 flex flex-wrap items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="font-serif text-xl font-bold text-[#1A0D16] flex items-center gap-2">
            <span>Tablero de Cocina en Tiempo Real</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          </h2>
          <p className="text-xs text-stone-500">
            Control de fermentación, horneado y despacho artesanal en Bogotá
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por orden, cliente o barrio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-rose-50/50 border border-rose-200/80 rounded-xl text-xs text-[#1A0D16] placeholder:text-stone-400 focus:outline-none focus:border-[#C02E62] w-64"
            />
          </div>

          {/* Priority filter toggle */}
          <button
            onClick={() => setFilterPriorityOnly(!filterPriorityOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              filterPriorityOnly
                ? 'bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white border-transparent shadow-xs'
                : 'bg-white text-stone-700 border-rose-200 hover:border-rose-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Solo Prioritarios</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto min-h-0">
        
        {/* Column 1: Nuevos / Pendiente */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'Pendiente')}
          className="bg-white/60 rounded-3xl border border-rose-200/80 flex flex-col min-h-0 overflow-hidden shadow-2xs backdrop-blur-xs"
        >
          {/* Column Header */}
          <div className="p-4 border-b border-rose-100 bg-white/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-serif font-bold text-sm text-[#1A0D16]">
                Nuevos por Confirmar
              </h3>
            </div>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {pendingOrders.length}
            </span>
          </div>

          {/* Tickets Container */}
          <div className="p-3.5 overflow-y-auto flex-1 space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="h-48 border-2 border-dashed border-rose-200/80 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-stone-400">
                <ChefHat className="w-6 h-6 mb-1 text-stone-300" />
                <span className="text-xs">Sin nuevos pedidos pendientes</span>
                <span className="text-[10px] text-stone-400 mt-0.5">Los nuevos pedidos se listan aquí</span>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <KitchenTicket
                  key={order.id}
                  order={order}
                  onUpdateStatus={onUpdateStatus}
                  onTogglePriority={onTogglePriority}
                  onDragStart={handleDragStart}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: En Preparación */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'En Preparación')}
          className="bg-white/60 rounded-3xl border border-rose-200/80 flex flex-col min-h-0 overflow-hidden shadow-2xs backdrop-blur-xs"
        >
          {/* Column Header */}
          <div className="p-4 border-b border-rose-100 bg-white/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#D83A73]" />
              <h3 className="font-serif font-bold text-sm text-[#1A0D16]">
                En Cocina & Fermentación
              </h3>
            </div>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-[#C02E62]">
              {inProgressOrders.length}
            </span>
          </div>

          {/* Tickets Container */}
          <div className="p-3.5 overflow-y-auto flex-1 space-y-3">
            {inProgressOrders.length === 0 ? (
              <div className="h-48 border-2 border-dashed border-rose-200/80 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-stone-400">
                <Flame className="w-6 h-6 mb-1 text-stone-300" />
                <span className="text-xs">No hay lotes en elaboración</span>
                <span className="text-[10px] text-stone-400 mt-0.5">Arrastra pedidos para comenzar</span>
              </div>
            ) : (
              inProgressOrders.map((order) => (
                <KitchenTicket
                  key={order.id}
                  order={order}
                  onUpdateStatus={onUpdateStatus}
                  onTogglePriority={onTogglePriority}
                  onDragStart={handleDragStart}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Listos para Despacho */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'Listo')}
          className="bg-white/60 rounded-3xl border border-rose-200/80 flex flex-col min-h-0 overflow-hidden shadow-2xs backdrop-blur-xs"
        >
          {/* Column Header */}
          <div className="p-4 border-b border-rose-100 bg-white/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="font-serif font-bold text-sm text-[#1A0D16]">
                Listos para Despacho
              </h3>
            </div>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
              {readyOrders.length}
            </span>
          </div>

          {/* Tickets Container */}
          <div className="p-3.5 overflow-y-auto flex-1 space-y-3">
            {readyOrders.length === 0 ? (
              <div className="h-48 border-2 border-dashed border-rose-200/80 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-stone-400">
                <CheckCheck className="w-6 h-6 mb-1 text-stone-300" />
                <span className="text-xs">Sin pedidos empacados listos</span>
                <span className="text-[10px] text-stone-400 mt-0.5">Los lotes terminados se listan aquí</span>
              </div>
            ) : (
              readyOrders.map((order) => (
                <KitchenTicket
                  key={order.id}
                  order={order}
                  onUpdateStatus={onUpdateStatus}
                  onTogglePriority={onTogglePriority}
                  onDragStart={handleDragStart}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
