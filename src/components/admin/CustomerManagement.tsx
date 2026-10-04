import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Check, 
  X, 
  ShoppingBag, 
  Calendar,
  MessageCircle,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import { StoredUser, Order, UserProfile } from '../../types';
import { getStoredUsers, adminUpdateUser, createAdminUser, getUserOrders } from '../../services/userService';
import { openGeneralWhatsApp } from '../../services/whatsappService';
import { ElegantInput } from '../common/ElegantInput';
import { GoldButton } from '../common/GoldButton';

interface CustomerManagementProps {
  orders: Order[];
  onShowToast: (title: string, message?: string, type?: 'gold' | 'success' | 'error' | 'info') => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  orders,
  onShowToast
}) => {
  const [users, setUsers] = useState<StoredUser[]>(() => getStoredUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'cliente' | 'admin'>('all');
  
  // Modals state
  const [editingUser, setEditingUser] = useState<StoredUser | null>(null);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);

  // New Admin form
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminFormError, setAdminFormError] = useState('');

  // Edit User form
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBarrio, setEditBarrio] = useState('');
  const [editRole, setEditRole] = useState<'cliente' | 'admin'>('cliente');
  const [editActive, setEditActive] = useState(true);
  const [editNotes, setEditNotes] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const reloadUsers = () => {
    setUsers(getStoredUsers());
  };

  useEffect(() => {
    if (editingUser) {
      setEditName(editingUser.nombre);
      setEditPhone(editingUser.telefono);
      setEditAddress(editingUser.direccion_envio || '');
      setEditBarrio(editingUser.barrio_localidad || '');
      setEditRole(editingUser.rol);
      setEditActive(editingUser.activo ?? true);
      setEditNotes(editingUser.notas || '');
    }
  }, [editingUser]);

  // Compute metrics
  const totalCustomers = users.filter(u => u.rol === 'cliente').length;
  const totalAdmins = users.filter(u => u.rol === 'admin').length;
  
  // Orders aggregation per user
  const getUserStats = (user: StoredUser) => {
    const userOrdersList = getUserOrders(user, orders);
    const orderCount = userOrdersList.length;
    const totalSpent = userOrdersList.reduce((sum, o) => sum + o.total, 0);
    return { orderCount, totalSpent, latestOrder: userOrdersList[0] };
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.telefono.includes(searchQuery) ||
      (u.barrio_localidad && u.barrio_localidad.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = 
      roleFilter === 'all' || u.rol === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormError('');
    setIsCreatingAdmin(true);

    try {
      const result = await createAdminUser({
        nombre: adminName,
        email: adminEmail,
        password: adminPassword,
        telefono: adminPhone,
        notas: adminNotes
      });

      if (!result.success || !result.user) {
        setAdminFormError(result.error || 'Error al crear administrador.');
        setIsCreatingAdmin(false);
        return;
      }

      reloadUsers();
      setIsAddAdminOpen(false);
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setAdminPhone('');
      setAdminNotes('');
      onShowToast('Administrador Creado', `Se otorgaron permisos de gestión a ${result.user.nombre}.`, 'gold');
    } catch {
      setAdminFormError('Error inesperado al registrar administrador.');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingEdit(true);

    try {
      const result = adminUpdateUser(editingUser.id, {
        nombre: editName,
        telefono: editPhone,
        direccion_envio: editAddress,
        barrio_localidad: editBarrio,
        rol: editRole,
        activo: editActive,
        notas: editNotes
      });

      if (!result.success || !result.user) {
        onShowToast('Error', result.error || 'No se pudo actualizar.', 'error');
        setIsSavingEdit(false);
        return;
      }

      reloadUsers();
      setEditingUser(null);
      onShowToast('Cuenta Actualizada', `Los datos de ${result.user.nombre} fueron guardados.`, 'success');
    } catch {
      onShowToast('Error', 'No se pudo guardar la información.', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF5F2] overflow-y-auto">
      {/* Top Header */}
      <div className="p-6 sm:p-8 bg-white border-b border-rose-100/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C02E62] block">
                Gestión de Usuarios & Seguridad
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                Control de Acceso
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A0D16] mt-1">
              Historial de Clientes & Administradores
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
              Monitorea el historial de pedidos de cada cliente, edita direcciones o notas especiales de entrega, y delega roles de administración.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <GoldButton
              variant="primary"
              size="md"
              onClick={() => setIsAddAdminOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Administrador</span>
            </GoldButton>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-[#FAF2EE] p-4 rounded-2xl border border-rose-200/70 text-left">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Clientes Registrados
            </span>
            <span className="font-serif text-2xl font-bold text-[#1A0D16] mt-1 block">
              {totalCustomers}
            </span>
          </div>

          <div className="bg-[#FAF2EE] p-4 rounded-2xl border border-rose-200/70 text-left">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Equipo / Administradores
            </span>
            <span className="font-serif text-2xl font-bold text-[#C02E62] mt-1 block">
              {totalAdmins}
            </span>
          </div>

          <div className="bg-[#FAF2EE] p-4 rounded-2xl border border-rose-200/70 text-left">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Total Cuentas Activas
            </span>
            <span className="font-serif text-2xl font-bold text-stone-800 mt-1 block">
              {users.filter(u => u.activo).length}
            </span>
          </div>

          <div className="bg-[#FAF2EE] p-4 rounded-2xl border border-rose-200/70 text-left">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Total Pedidos Obrador
            </span>
            <span className="font-serif text-2xl font-bold text-emerald-800 mt-1 block">
              {orders.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Filters and Search Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, teléfono o barrio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#1A0D16] focus:outline-none focus:border-[#C02E62] focus:bg-white"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-[#1A0D16] text-[#E5A87B]'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('cliente')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'cliente'
                  ? 'bg-[#1A0D16] text-[#E5A87B]'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Clientes ({totalCustomers})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'admin'
                  ? 'bg-[#1A0D16] text-[#E5A87B]'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Administradores ({totalAdmins})
            </button>
          </div>
        </div>

        {/* Customer Accounts Table */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-rose-100 bg-[#FAF4F0] text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  <th className="py-4 px-6">Cliente / Usuario</th>
                  <th className="py-4 px-6">Contacto</th>
                  <th className="py-4 px-6">Ubicación Bogotá</th>
                  <th className="py-4 px-6">Rol</th>
                  <th className="py-4 px-6">Historial Pedidos</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-500">
                      No se encontraron usuarios coincidentes con tu búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const stats = getUserStats(user);
                    return (
                      <tr key={user.id} className="hover:bg-rose-50/40 transition-colors">
                        {/* Name & Email */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#D83A73] to-[#E5A87B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {user.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-stone-900 block">
                                {user.nombre}
                              </span>
                              <span className="text-[11px] text-stone-500 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-stone-400" />
                                {user.email}
                              </span>
                              {user.notas && (
                                <span className="text-[10px] text-[#C02E62] italic block mt-0.5 line-clamp-1">
                                  "{user.notas}"
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-6">
                          <a
                            href={`tel:${user.telefono}`}
                            className="font-mono text-stone-700 hover:text-[#C02E62] font-semibold flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            {user.telefono}
                          </a>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-6">
                          <div className="text-stone-700">
                            <span className="block font-medium">
                              {user.direccion_envio || 'Sin dirección registrada'}
                            </span>
                            {user.barrio_localidad && (
                              <span className="text-[11px] text-[#C02E62] font-semibold flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {user.barrio_localidad}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              user.rol === 'admin'
                                ? 'bg-[#1A0D16] text-[#E5A87B] border-[#E5A87B]/40'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {user.rol === 'admin' ? (
                              <>
                                <ShieldCheck className="w-3 h-3 text-[#E5A87B]" />
                                Administrador
                              </>
                            ) : (
                              'Cliente'
                            )}
                          </span>
                        </td>

                        {/* Orders count & sum */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-bold text-stone-900 block font-mono">
                              {stats.orderCount} {stats.orderCount === 1 ? 'pedido' : 'pedidos'}
                            </span>
                            {stats.orderCount > 0 && (
                              <span className="text-[11px] text-emerald-700 font-mono font-semibold">
                                ${stats.totalSpent.toLocaleString('es-CO')}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              user.activo
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {user.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openGeneralWhatsApp(user.nombre)}
                              title="Contactar por WhatsApp"
                              className="p-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEditingUser(user)}
                              title="Editar cuenta"
                              className="p-1.5 rounded-lg border border-rose-200 text-stone-700 hover:text-[#C02E62] hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF4F0] rounded-3xl border border-rose-200 p-6 sm:p-7 max-w-lg w-full shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-rose-200">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1A0D16]">
                  Editar Cuenta de {editingUser.nombre}
                </h3>
                <span className="text-xs text-stone-500 font-mono">
                  {editingUser.email}
                </span>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-full hover:bg-rose-100 text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-5">
              <ElegantInput
                label="Nombre Completo"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ElegantInput
                  label="Teléfono WhatsApp"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Rol de Cuenta
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'cliente' | 'admin')}
                    className="w-full px-4 py-2.5 bg-white border border-rose-200/80 rounded-2xl text-xs text-[#1A0D16] focus:outline-none focus:border-[#C02E62]"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="admin">Administrador de Cocina</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ElegantInput
                  label="Dirección de Entrega"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                />

                <ElegantInput
                  label="Barrio / Localidad Bogotá"
                  value={editBarrio}
                  onChange={(e) => setEditBarrio(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Notas Internas de Administración
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Preferencias especiales, alergias, instrucciones..."
                  className="w-full px-4 py-2.5 bg-white border border-rose-200/80 rounded-2xl text-xs text-[#1A0D16] focus:outline-none focus:border-[#C02E62]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#C02E62] focus:ring-[#C02E62]"
                  />
                  <span>Cuenta Activa (permitir iniciar sesión)</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-rose-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <GoldButton
                  type="submit"
                  size="sm"
                  isLoading={isSavingEdit}
                  className="px-6"
                >
                  Guardar Cambios
                </GoldButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW ADMINISTRATOR */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF4F0] rounded-3xl border border-rose-200 p-6 sm:p-7 max-w-lg w-full shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-rose-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1A0D16] text-[#E5A87B] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1A0D16]">
                    Nuevo Administrador de Cocina
                  </h3>
                  <span className="text-xs text-stone-500">
                    Crea una cuenta con permisos administrativos completos
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddAdminOpen(false)}
                className="p-1.5 rounded-full hover:bg-rose-100 text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminFormError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{adminFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4 mt-5">
              <ElegantInput
                label="Nombre del Administrador"
                placeholder="Ej. Ana Lucía Gómez"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ElegantInput
                  label="Correo Electrónico"
                  type="email"
                  placeholder="admin@micaprichosecreto.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />

                <ElegantInput
                  label="Teléfono Móvil"
                  placeholder="Ej. 3142748881"
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Contraseña Segura
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-rose-200/80 rounded-2xl text-xs text-[#1A0D16] focus:outline-none focus:border-[#C02E62]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Notas de Rol o Responsabilidad
                </label>
                <input
                  type="text"
                  placeholder="Ej. Encargado de Producción, Despachos, o Atención"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-rose-200/80 rounded-2xl text-xs text-[#1A0D16] focus:outline-none focus:border-[#C02E62]"
                />
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-[11px] text-stone-600 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#C02E62] shrink-0" />
                <span>La contraseña se cifra con sal y hash criptográfico SHA-256 antes de guardarse.</span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-rose-200">
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <GoldButton
                  type="submit"
                  size="sm"
                  isLoading={isCreatingAdmin}
                  className="px-6"
                >
                  Crear Administrador
                </GoldButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
