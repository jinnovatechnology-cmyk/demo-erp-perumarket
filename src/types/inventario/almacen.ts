export interface Almacen {
    id?: number; // Opcional porque al crear no tiene ID
    nombre: string;
    codigo: string;
    direccion: string;
    capacidadM3: number;
    responsable: string;
    estado?: 'ACTIVO' | 'INACTIVO';
}

export interface AlmacenFormData {
    nombre: string;
    codigo: string;
    direccion: string;
    capacidadM3: number;
    responsable: string;
}