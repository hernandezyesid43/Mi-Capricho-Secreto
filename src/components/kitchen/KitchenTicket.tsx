import React from 'react';
import { Star, Clock, AlertTriangle, ArrowRight, ArrowLeft, Phone, MapPin, CheckCircle } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface KitchenTicketProps {
  order: Order;
  onUpdateStatus: (orderId: number, status: OrderStatus) => void;
  onTogglePriority: (orderId: number) => void;
  onDragStart?: (e: React.DragEvent, orderId: number) => void;
}

export const KitchenTicket: React.FC<KitchenTicketProps> = ({
  order,
  onUpdateStatus,
  onTogglePriority,
  onDragStart
}) => {
  // Calculate elapsed time
  const createdAtTime = new Date(order.created_at).getTime();
  const now = Date.now();
  const elapsedMinutes = Math.floor((now - createdAtTime) / (1000 * 60));
  
  let elapsedText = '';
  if (elapsedMinutes < 60) {
    elapsedText = `${elapsedMinutes}m`;
  } else if (elapsedMinutes < 1440) {
    const hours = Math.floor(elapsedMinutes / 60);
    elapsedText = `${hours}h ${elapsedMinutes % 60}m`;
  } else {
    const days = Math.floor(elapsedMinutes / 1440);
    elapsedText = `${days}d`;
  }

  // Delay warning if order is pending for more than 4 hours
  const isDelayed = order.estado === 'Pendiente' && elapsedMinutes > 240;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, order.id)}
      className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none ${
        order.prioridad
          ? 'border-[#D83A73] ring-2 ring-[#D83A73]/25 bg-[#FFFDFE]'
          : 'border-rose-100 hover:border-rose-200'
      }`}
    >
      {/* Ticket Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-rose-100">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm text-[#1A0D16]">
            #{order.codigo_orden}
          </span>
          {order.prioridad && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white">
              Prioritario
            </span>
          )}
          {isDelayed && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Retraso
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-mono text-stone-500">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{elapsedText}</span>
          </div>

          <button
            type="button"
            onClick={() => onTogglePriority(order.id)}
            className={`p-1 rounded hover:bg-rose-50 transition-colors ${
              order.prioridad ? 'text-[#D83A73]' : 'text-stone-300 hover:text-stone-500'
            }`}
            title="Marcar como prioritario"
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="py-2.5 text-xs text-stone-700 space-y-1 text-left">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#1A0D16] truncate">
            {order.cliente_nombre}
          </span>
          <a
            href={`https://wa.me/57${order.cliente_telefono}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-mono font-semibold"
            title="Abrir chat de WhatsApp"
          >
            <Phone className="w-3 h-3" />
            <span>{order.cliente_telefono}</span>
          </a>
        </div>

        <div className="flex items-start gap-1 text-[11px] text-stone-500">
          <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{order.direccion_envio} ({order.barrio_localidad})</span>
        </div>

        {order.notas_entrega && (
          <p className="text-[11px] italic text-rose-900 bg-rose-50/80 p-2 rounded-xl border border-rose-200/60 mt-1">
            "{order.notas_entrega}"
          </p>
        )}
      </div>

      {/* Itemized Order List */}
      <div className="py-2.5 border-t border-rose-100 space-y-1.5 text-xs text-left">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-stone-800 font-medium">
            <span className="truncate pr-2">
              <span className="font-mono font-bold text-[#C02E62] mr-1.5">{item.cantidad}x</span>
              {item.nombre}
            </span>
            <span className="text-[11px] text-stone-500 font-mono shrink-0">
              {item.tiempo_preparacion_dias}d
            </span>
          </div>
        ))}
      </div>

      {/* Financial & Status Action footer */}
      <div className="pt-2.5 mt-1 border-t border-rose-100 flex items-center justify-between gap-2">
        <div className="text-left">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
            {order.metodo_pago}
          </span>
          <span className="font-mono tabular-nums font-bold text-sm text-[#1A0D16]">
            ${order.total.toLocaleString('es-CO')}
          </span>
        </div>

        {/* Status transition buttons */}
        <div className="flex items-center gap-1.5">
          {order.estado === 'Pendiente' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'En Preparación')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white font-bold text-xs shadow-2xs hover:brightness-105 transition-all cursor-pointer"
            >
              <span>Elaborar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {order.estado === 'En Preparación' && (
            <>
              <button
                onClick={() => onUpdateStatus(order.id, 'Pendiente')}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                title="Regresar a Pendientes"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'Listo')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-2xs transition-all cursor-pointer"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Listo</span>
              </button>
            </>
          )}

          {order.estado === 'Listo' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'En Preparación')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 text-[11px] font-semibold"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Regresar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
