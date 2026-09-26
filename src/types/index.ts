export type ProductCategory = 
  | 'Todos' 
  | 'Yogur Griego' 
  | 'Yogur Casero' 
  | 'Repostería de Temporada';

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: 'Yogur Griego' | 'Yogur Casero' | 'Repostería de Temporada';
  precio: number;
  tiempo_preparacion_dias: number;
  imagen_url: string;
  ingredientes: string[];
  activo: boolean;
  tamano: string;
  destacado?: boolean;
  notas_degustacion?: string;
}

export interface CartItem {
  product: Product;
  cantidad: number;
}

export type OrderStatus = 'Pendiente' | 'En Preparación' | 'Listo' | 'Entregado';
export type PaymentMethod = 'Contra entrega' | 'Transferencia bancaria';

export interface OrderItem {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  tiempo_preparacion_dias: number;
}

export interface Order {
  id: number;
  codigo_orden: string;
  usuario_id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  direccion_envio: string;
  barrio_localidad: string;
  notas_entrega?: string;
  items: OrderItem[];
  total: number;
  metodo_pago: PaymentMethod;
  estado: OrderStatus;
  prioridad: boolean;
  tiempo_estimado_dias: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion_envio?: string;
  barrio_localidad?: string;
  notas?: string;
  rol: 'cliente' | 'admin';
  created_at?: string;
  activo?: boolean;
}

export interface StoredUser extends UserProfile {
  password_hash: string;
  salt: string;
  updated_at: string;
  activo: boolean;
}

export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'gold' | 'error' | 'info';
}
