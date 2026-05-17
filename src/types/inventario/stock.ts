export interface Product {
  id: number;
  nombre: string;       // <--- Esta es la que te faltaba
  sku: string;          // <--- Esta también
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  precioVenta: number;  // <--- Y esta
  almacenNombre: string;
  unidad: string;
  ubicacion?: string;
  precioCompra?: number; // Opcional, por si se usa en cálculos de margen
}

export interface Warehouse {
  id: number;
  nombre: string;
  codigo: string;
  estado: 'ACTIVO' | 'INACTIVO';
  direccion: string;
}

export interface StockStatusResult {
  text: string;
  color: string;
}