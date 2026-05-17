 export interface categoria {
  id: number;
  nombre: string;
}
 export interface Producto {
  id: number;
  nombre: string;
  sku?: string;
  precio: number;
  imagen?: string;
  stock: number;
  categoria: categoria;
  unidadMedida?: string;
}

 export interface ProductoVenta {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

 export interface MetodoPago {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
}

 export interface DetallePago {
  id_metodo_pago: number;
  monto: number;
  referencia: string;
  numero_tarjeta?: string;
  fecha_vencimiento?: string;
  cvv?: string;
  numero_transferencia?: string;
  banco?: string;
  numero_operacion?: string;
}



export interface VentaRequest {
  idCliente: number;
  idUsuario: number;
  idAlmacen: number;
  subtotal: number;
  igv: number;
  total: number;
  detalles: Array<{
    idProducto: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
  pagos: DetallePago[];
  conEnvio?: boolean;
  direccionEnvio?: string;
}

export interface MetodoPago {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
}
