import { isAxiosError } from 'axios';

/**
 * Intenta extraer un mensaje de error legible de un objeto de error (generalmente de Axios).
 * Prioriza: 1. error.response.data.message (cuerpo del backend) -> 2. error.message (mensaje de Axios) -> 3. Error.message (error estándar).
 */
export const getErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
        // Intenta acceder al cuerpo de datos de error del backend
        if (error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
             // Retorna el mensaje específico del backend si existe
             return (error.response.data as { message: string }).message;
        }
        
        // Si no hay respuesta del servidor (ej. error de red) o la estructura es inesperada
        return error.message; 
    }
    
    // Si no es un error de Axios (ej. error de código interno)
    return error instanceof Error ? error.message : 'Error desconocido.';
}