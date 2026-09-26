import React, { useState } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, ChefHat, CreditCard, Banknote, Download, Search } from 'lucide-react';
import { Order } from '../../types';

interface AccountingViewProps {
  orders: Order[];
}

export const AccountingView: React.FC<AccountingViewProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculations
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const activeKitchenOrders = orders.filter((o) => o.estado === 'Pendiente' || o.estado === 'En Preparación').length;

  const codOrders = orders.filter((o) => o.metodo_pago === 'Contra entrega');
  const transferOrders = orders.filter((o) => o.metodo_pago === 'Transferencia bancaria');

  const codTotal = codOrders.reduce((sum, o) => sum + o.total, 0);
  const transferTotal = transferOrders.reduce((sum, o) => sum + o.total, 0);

  const filteredOrders = orders.filter((o) =>
    o.codigo_orden.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.barrio_localidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Orden,Fecha,Cliente,Teléfono,Dirección,Barrio,Total,Método Pago,Estado\n'];
    const rows = orders.map(o => 
      `"${o.codigo_orden}","${new Date(o.created_at).toLocaleDateString()}","${o.cliente_nombre}","${o.cliente_telefono}","${o.direccion_envio}","${o.barrio_localidad}",${o.total},"${o.metodo_pago}","${o.estado}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `contabilidad_capricho_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF4F0] overflow-y-auto">
      {/* Top Bar */}
      <div className="px-6 py-5 bg-white/90 backdrop-blur-md border-b border-rose-100 flex flex-wrap items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="font-serif text-xl font-bold text-[#1A0D16]">
            Contabilidad & Balance de Ventas
          </h2>
          <p className="text-xs text-stone-500">
            Métricas financieras y registro consolidado de pedidos en Bogotá
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-rose-200 text-[#1A0D16] text-xs font-bold hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#C02E62]" />
          <span>Exportar Reporte (CSV)</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Ventas Totales
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-[#C02E62]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-mono tabular-nums text-2xl font-bold text-[#C02E62]">
                ${totalSales.toLocaleString('es-CO')}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5 font-medium">
                COP facturado
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Pedidos Totales
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-[#E5A87B]">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-mono tabular-nums text-2xl font-bold text-[#1A0D16]">
                {totalOrders}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5 font-medium">
                Órdenes generadas
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Ticket Promedio
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-[#C02E62]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-mono tabular-nums text-2xl font-bold text-[#1A0D16]">
                ${averageTicket.toLocaleString('es-CO')}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5 font-medium">
                Por cliente en Bogotá
              </span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                En Cocina Activa
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                <ChefHat className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-mono tabular-nums text-2xl font-bold text-amber-800">
                {activeKitchenOrders}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5 font-medium">
                En preparación artesanal
              </span>
            </div>
          </div>
        </div>

        {/* Payment breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <Banknote className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-serif font-bold text-base text-[#1A0D16]">Contra Entrega</h4>
                <p className="text-xs text-stone-500 font-mono">{codOrders.length} pedidos</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono tabular-nums font-bold text-base text-[#1A0D16]">
                ${codTotal.toLocaleString('es-CO')}
              </span>
              <span className="text-[11px] text-stone-400 block font-mono">
                {totalSales > 0 ? Math.round((codTotal / totalSales) * 100) : 0}% del total
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-[#C02E62]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-serif font-bold text-base text-[#1A0D16]">Transferencia Bancaria</h4>
                <p className="text-xs text-stone-500 font-mono">{transferOrders.length} pedidos</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono tabular-nums font-bold text-base text-[#1A0D16]">
                ${transferTotal.toLocaleString('es-CO')}
              </span>
              <span className="text-[11px] text-stone-400 block font-mono">
                {totalSales > 0 ? Math.round((transferTotal / totalSales) * 100) : 0}% del total
              </span>
            </div>
          </div>
        </div>

        {/* Orders Log Table */}
        <div className="bg-white rounded-3xl border border-rose-100 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-rose-100 flex items-center justify-between gap-4">
            <h3 className="font-serif font-bold text-base text-[#1A0D16]">
              Registro Histórico de Órdenes
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar orden, cliente o barrio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-rose-50/40 border border-rose-200/80 rounded-xl text-xs text-[#1A0D16] placeholder:text-stone-400 focus:outline-none focus:border-[#C02E62] w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-rose-50/40 border-b border-rose-100 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Orden</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Destino Bogotá</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-400">
                      No hay pedidos registrados
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#1A0D16]">
                        #{order.codigo_orden}
                      </td>

                      <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                        {new Date(order.created_at).toLocaleDateString('es-CO', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-[#1A0D16] block">
                          {order.cliente_nombre}
                        </span>
                        <span className="text-[11px] text-stone-500 font-mono">
                          {order.cliente_telefono}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-stone-600">
                        <span className="block truncate max-w-xs">{order.direccion_envio}</span>
                        <span className="text-[11px] text-stone-400">{order.barrio_localidad}</span>
                      </td>

                      <td className="py-3 px-4 text-stone-700">
                        <span className="font-semibold">
                          {order.items.reduce((s, i) => s + i.cantidad, 0)} unidades
                        </span>
                        <span className="text-[11px] text-stone-400 block truncate max-w-[180px]">
                          {order.items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-stone-600">
                        {order.metodo_pago}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-[#1A0D16]">
                        ${order.total.toLocaleString('es-CO')}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.estado === 'Pendiente'
                              ? 'bg-amber-100 text-amber-800'
                              : order.estado === 'En Preparación'
                              ? 'bg-rose-100 text-[#C02E62]'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {order.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
