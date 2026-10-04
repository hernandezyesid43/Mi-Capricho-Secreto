import { Product, Order, UserProfile, OrderStatus } from '../types';

import imgGreek from '../assets/images/yogur_griego_artesanal_1790392468833.jpg';
import imgYogurt from '../assets/images/yogur_casero_cremoso_1790392479347.jpg';
import imgTart from '../assets/images/reposteria_temporada_torta_1790392487722.jpg';
import imgParfait from '../assets/images/postre_artesanal_parfait_1790392496777.jpg';

// Note: Administrative authentication is handled cryptographically via securityService (SHA-256 digests)

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    nombre: 'Yogur Griego Clásico de Autor',
    categoria: 'Yogur Griego',
    precio: 18000,
    tiempo_preparacion_dias: 3,
    tamano: 'Frasco 500g',
    descripcion: 'Filtrado lento durante 36 horas en paño de algodón puro. Textura untuosa, alto en proteína natural sin espesantes ni azúcares añadidos.',
    ingredientes: ['Leche entera de pastoreo pasteurizada', 'Cultivos lácticos vivos (L. bulgaricus, S. thermophilus)'],
    imagen_url: imgGreek,
    activo: true,
    destacado: true,
    notas_degustacion: 'Cremosidad densa, acidez balanceada y notas lácteas limpias.'
  },
  {
    id: 2,
    nombre: 'Yogur Griego con Miel Silvestre y Pistachos',
    categoria: 'Yogur Griego',
    precio: 23000,
    tiempo_preparacion_dias: 3,
    tamano: 'Frasco 500g',
    descripcion: 'Nuestra base de yogur griego extra denso bañado con un hilo de miel cruda recolectada en páramo y pistachos crocantes tostados.',
    ingredientes: ['Yogur griego artesanal', 'Miel pura de abejas de páramo', 'Pistachos iraníes tostados sin sal'],
    imagen_url: imgGreek,
    activo: true,
    destacado: true,
    notas_degustacion: 'Contraste sublime entre la riqueza untuosa y el crujiente mineral.'
  },
  {
    id: 3,
    nombre: 'Yogur Casero Tradicional Cremoso',
    categoria: 'Yogur Casero',
    precio: 16000,
    tiempo_preparacion_dias: 2,
    tamano: 'Botella 1000ml',
    descripcion: 'Fermentación prolongada de 16 horas con leche fresca del Valle de Ubaté. Textura sedosa y fluida para beber o mezclar con granola.',
    ingredientes: ['Leche fresca de granja', 'Cultivos probióticos activos', 'Pizca de vainilla natural de Papantla'],
    imagen_url: imgYogurt,
    activo: true,
    destacado: false,
    notas_degustacion: 'Suavidad pura, aroma dulce lácteo y frescura reconfortante.'
  },
  {
    id: 4,
    nombre: 'Yogur Casero con Compota de Frutos Rojos',
    categoria: 'Yogur Casero',
    precio: 19500,
    tiempo_preparacion_dias: 2,
    tamano: 'Botella 1000ml',
    descripcion: 'Infusionado artesanalmente con reducción rústica de moras andinas, fresas de la sabana y arándanos, cocidos a fuego lento.',
    ingredientes: ['Yogur casero tradicional', 'Moras silvestres', 'Fresas de Guasca', 'Arándanos frescos', 'Azúcar de caña orgánica (5%)'],
    imagen_url: imgYogurt,
    activo: true,
    destacado: true,
    notas_degustacion: 'Fruta viva, equilibrada entre dulce silvestre y acidez natural.'
  },
  {
    id: 5,
    nombre: 'Torta Rústica de Frambuesas & Almendras',
    categoria: 'Repostería de Temporada',
    precio: 32000,
    tiempo_preparacion_dias: 2,
    tamano: 'Molde 18cm (5-6 porciones)',
    descripcion: 'Pastelería de estación con harina de almendras tostadas, mantequilla de pastura y frambuesas frescas incrustadas antes de hornear.',
    ingredientes: ['Harina de almendra molida', 'Mantequilla clarificada', 'Frambuesas frescas', 'Huevos de campo', 'Ralladura de limón'],
    imagen_url: imgTart,
    activo: true,
    destacado: true,
    notas_degustacion: 'Miga húmeda y aromática, notas de mantequilla dorada y destellos cítricos.'
  },
  {
    id: 6,
    nombre: 'Parfait de Autor en Copa de Cristal',
    categoria: 'Repostería de Temporada',
    precio: 14500,
    tiempo_preparacion_dias: 1,
    tamano: 'Vaso de Cristal 280g',
    descripcion: 'Capas alternadas de yogur griego denso, crumble de avena con semillas doradas y compota tibia de frutos del bosque.',
    ingredientes: ['Yogur griego artesanal', 'Crumble crocante de mantequilla y avena', 'Compota de frutos rojos', 'Nueces pacanas'],
    imagen_url: imgParfait,
    activo: true,
    destacado: false,
    notas_degustacion: 'Textura en tres dimensiones: cremoso, crocante y aterciopelado.'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 101,
    codigo_orden: 'CAP-101',
    usuario_id: 'usr_camilo_88',
    cliente_nombre: 'Camilo Rincón',
    cliente_telefono: '3158902341',
    direccion_envio: 'Calle 127 # 15-45, Apto 402',
    barrio_localidad: 'Usaquén',
    notas_entrega: 'Por favor timbrar en portería',
    items: [
      {
        producto_id: 1,
        nombre: 'Yogur Griego Clásico de Autor',
        cantidad: 2,
        precio_unitario: 18000,
        subtotal: 36000,
        tiempo_preparacion_dias: 3
      },
      {
        producto_id: 5,
        nombre: 'Torta Rústica de Frambuesas & Almendras',
        cantidad: 1,
        precio_unitario: 32000,
        subtotal: 32000,
        tiempo_preparacion_dias: 2
      }
    ],
    total: 68000,
    metodo_pago: 'Transferencia bancaria',
    estado: 'Pendiente',
    prioridad: true,
    tiempo_estimado_dias: 3,
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 102,
    codigo_orden: 'CAP-102',
    usuario_id: 'usr_mariana_42',
    cliente_nombre: 'Mariana Duarte',
    cliente_telefono: '3204567890',
    direccion_envio: 'Carrera 7 # 67-20, Torre B 801',
    barrio_localidad: 'Chapinero Alto',
    notas_entrega: 'Dejar en recepción si no contesto',
    items: [
      {
        producto_id: 2,
        nombre: 'Yogur Griego con Miel Silvestre y Pistachos',
        cantidad: 2,
        precio_unitario: 23000,
        subtotal: 46000,
        tiempo_preparacion_dias: 3
      }
    ],
    total: 46000,
    metodo_pago: 'Contra entrega',
    estado: 'En Preparación',
    prioridad: false,
    tiempo_estimado_dias: 3,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 103,
    codigo_orden: 'CAP-103',
    usuario_id: 'usr_felipe_19',
    cliente_nombre: 'Felipe Santamaría',
    cliente_telefono: '3109871234',
    direccion_envio: 'Calle 85 # 11-53',
    barrio_localidad: 'Zona Rosa',
    notas_entrega: 'Listo para despacho matutino',
    items: [
      {
        producto_id: 4,
        nombre: 'Yogur Casero con Compota de Frutos Rojos',
        cantidad: 1,
        precio_unitario: 19500,
        subtotal: 19500,
        tiempo_preparacion_dias: 2
      },
      {
        producto_id: 6,
        nombre: 'Parfait de Autor en Copa de Cristal',
        cantidad: 2,
        precio_unitario: 14500,
        subtotal: 29000,
        tiempo_preparacion_dias: 1
      }
    ],
    total: 48500,
    metodo_pago: 'Transferencia bancaria',
    estado: 'Listo',
    prioridad: false,
    tiempo_estimado_dias: 2,
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Simple reactive event listener system
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyChange() {
  listeners.forEach((fn) => fn());
}

export function subscribeToDataChanges(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Storage helpers
export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem('capricho_products_v1');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading products from storage:', e);
  }
  localStorage.setItem('capricho_products_v1', JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem('capricho_products_v1', JSON.stringify(products));
  notifyChange();
}

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem('capricho_orders_v1');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading orders from storage:', e);
  }
  localStorage.setItem('capricho_orders_v1', JSON.stringify(INITIAL_ORDERS));
  return INITIAL_ORDERS;
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem('capricho_orders_v1', JSON.stringify(orders));
  notifyChange();
}

export function createNewOrder(orderData: Omit<Order, 'id' | 'codigo_orden' | 'created_at' | 'updated_at'>): Order {
  const currentOrders = getStoredOrders();
  const nextId = currentOrders.length > 0 ? Math.max(...currentOrders.map(o => o.id)) + 1 : 101;
  const newOrder: Order = {
    ...orderData,
    id: nextId,
    codigo_orden: `CAP-${nextId}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const updated = [newOrder, ...currentOrders];
  saveOrders(updated);
  return newOrder;
}

export function updateOrderStatus(orderId: number, newStatus: OrderStatus): void {
  const current = getStoredOrders();
  const updated = current.map((order) => {
    if (order.id === orderId) {
      return {
        ...order,
        estado: newStatus,
        updated_at: new Date().toISOString()
      };
    }
    return order;
  });
  saveOrders(updated);
}

export function toggleOrderPriority(orderId: number): void {
  const current = getStoredOrders();
  const updated = current.map((order) => {
    if (order.id === orderId) {
      return {
        ...order,
        prioridad: !order.prioridad,
        updated_at: new Date().toISOString()
      };
    }
    return order;
  });
  saveOrders(updated);
}

// Product Management
export function addProduct(product: Omit<Product, 'id'>): Product {
  const current = getStoredProducts();
  const nextId = current.length > 0 ? Math.max(...current.map(p => p.id)) + 1 : 1;
  const newProduct: Product = {
    ...product,
    id: nextId
  };
  saveProducts([newProduct, ...current]);
  return newProduct;
}

export function updateProduct(id: number, updates: Partial<Product>): void {
  const current = getStoredProducts();
  const updated = current.map((prod) => {
    if (prod.id === id) {
      return { ...prod, ...updates };
    }
    return prod;
  });
  saveProducts(updated);
}

export function deleteProduct(id: number): void {
  const current = getStoredProducts();
  const updated = current.filter(p => p.id !== id);
  saveProducts(updated);
}

// User & Auth Management
export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem('capricho_current_user_v1');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing user:', e);
  }
  return null;
}

export function setCurrentUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem('capricho_current_user_v1', JSON.stringify(user));
  } else {
    localStorage.removeItem('capricho_current_user_v1');
  }
  notifyChange();
}

export function resetToSeedData(): void {
  localStorage.setItem('capricho_products_v1', JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem('capricho_orders_v1', JSON.stringify(INITIAL_ORDERS));
  notifyChange();
}

// Favorites persistence helpers
export function getStoredFavorites(): number[] {
  try {
    const raw = localStorage.getItem('capricho_favorites_v1');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading favorites from storage:', e);
  }
  // Default favorite: Product #1 (Yogur Griego Tradicional)
  const defaultFavorites = [1];
  localStorage.setItem('capricho_favorites_v1', JSON.stringify(defaultFavorites));
  return defaultFavorites;
}

export function saveFavorites(favorites: number[]): void {
  localStorage.setItem('capricho_favorites_v1', JSON.stringify(favorites));
  notifyChange();
}

