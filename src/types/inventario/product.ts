export interface Option {
  id: number;
  nombre: string;
}

export interface ProductoFormData {
  nombre: string;
  descripcion: string;
  sku: string;
  precioVenta: number;
  precioCompra: number;
  categoriaId: number | null;
  unidadMedida: string;
  pesoKg: number;
  almacenId: number | null;
  stockInicial: number;
  stockMinimo: number;
  stockMaximo: number;
  ubicacion: string;
  proveedorId: number | null;
  codigoBarras: string;
  imagen: string;

  
}

export interface CatalogoProducto {
  productoId: number;
  nombre: string;
  sku: string;
  precioCompra: number;
  pesoKg: number;
  imagen: string | null;
  proveedorId: number;
  proveedorNombre: string;
  cantidadComprada?: number;
  origen: 'catalogo' | 'compra';
}

export type NotificationType = 'success' | 'error';

export interface NotificationState {
  show: boolean;
  message: string;
  type: NotificationType;
}