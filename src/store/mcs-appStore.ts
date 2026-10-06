// src/store/appStore.ts
import { create } from 'zustand';
import { Product, Order, UserProfile, OrderStatus } from '../types';

export interface AppState {
  // Datos principales
  products: Product[];
  orders: Order[];
  currentUser: UserProfile | null;
  
  // UI State
  activeView: 'store' | 'admin';
  adminTab: 'kitchen' | 'catalog' | 'accounting' | 'customers';
  selectedCategory: string;
  searchQuery: string;
  trackingOrderCode: string | null;
  
  // Modales
  activeProductModal: Product | null;
  
  // Acciones - Datos
  setProducts: (products: Product[]) => void;
  setOrders: (orders: Order[]) => void;
  setCurrentUser: (user: UserProfile | null) => void;
  
  // Acciones - UI
  setActiveView: (view: 'store' | 'admin') => void;
  setAdminTab: (tab: 'kitchen' | 'catalog' | 'accounting' | 'customers') => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setTrackingOrderCode: (code: string | null) => void;
  
  // Acciones - Modales
  setActiveProductModal: (product: Product | null) => void;
  
  // Acciones - Órdenes
  updateOrderStatus: (orderId: number, status: OrderStatus) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Estado inicial
  products: [],
  orders: [],
  currentUser: null,
  activeView: 'store',
  adminTab: 'kitchen',
  selectedCategory: 'Todos',
  searchQuery: '',
  trackingOrderCode: null,
  activeProductModal: null,
  
  // Setters de datos
  setProducts: (products) => set({ products }),
  setOrders: (orders) => set({ orders }),
  setCurrentUser: (user) => set({ currentUser: user }),
  
  // Setters de UI
  setActiveView: (view) => set({ activeView: view }),
  setAdminTab: (tab) => set({ adminTab: tab }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTrackingOrderCode: (code) => set({ trackingOrderCode: code }),
  
  // Setters de modales
  setActiveProductModal: (product) => set({ activeProductModal: product }),
  
  // Acciones de órdenes
  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map((order) =>
      order.id === orderId ? { ...order, estado: status } : order
    ),
  })),
}));
