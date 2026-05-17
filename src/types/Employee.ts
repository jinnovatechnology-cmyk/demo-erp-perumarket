// En types/Employee.ts
export interface Persona {
  id?: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  telefono: string;
  fechaNacimiento?: string;
  direccion: string;
}

export interface Departament {
  id?: number;
  nombre: string;
  descripcion: string;
}

export interface Employee {
  empleadoId?: number;
  persona: Persona;
  departamento: Departament | null;
  puesto: string;
  sueldo: number;
  fechaContratacion: string;
  estado: string;
  foto: string;
  cv: string;
}



export type EstadoEmpleado = "ACTIVO" | "INACTIVO" | "PENDIENTE" | string; // Permitimos string si hay otros estados
export type TipoDocumento = "DNI" | "PASAPORTE" | "CE" | string; // Asegurar compatibilidad

export interface EmployeeFilters {
  texto: string;
  dni: string;
  estado: string; // Coincide con el tipo `estado` usado en Employee
}

export interface EmployeeStats {
  total: number;
  activos: number;
  inactivos: number;
  filtered: number;
}

// Define la estructura del cuerpo del error que esperas del backend
export interface BackendErrorData {
  message: string;
  // Otros campos, si los hay: code, errors: string[]
}