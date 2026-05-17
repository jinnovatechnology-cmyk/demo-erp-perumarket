export interface Product {
  id: number;
  almacenNombre: string;
  stockMaximo: number;
  stockActual: number;
  pesoKg: number;
}

export interface Warehouse {
  id: number;
  nombre: string;
  codigo: string;
  estado: 'ACTIVO' | 'INACTIVO' | string;
  direccion: string;
  responsable: string;
  capacidadM3: number;
  
  // Propiedades calculadas en el frontend
  productsCount: number;
  capacityUsed: number;      // Stock actual total
  capacityTotalUnits: number; // Capacidad total (suma de stocks máximos)
}

export type NotificationType = 'success' | 'error';

export interface NotificationState {
  message: string;
  type: NotificationType;
}

// Datos que necesita el endpoint de actualización
export interface WarehouseUpdateDTO {
  nombre: string;
  codigo: string;
  direccion: string;
  responsable: string;
  capacidadM3: number;
  estado: string;
}