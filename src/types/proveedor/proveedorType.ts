export interface ProveedorData {
  id?: number;
  ruc: string;
  razon_social: string;
  contacto: string;
  telefono: string;
  correo: string;
  direccion: string;
  estado: "ACTIVO" | "INACTIVO";
}