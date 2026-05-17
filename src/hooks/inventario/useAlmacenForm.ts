import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AlmacenFormData } from '../../types/inventario/almacen';
import { almacenService } from '../../services/inventario/almacenService';

export const useAlmacenForm = () => {
    const navigate = useNavigate();
    
    // Estado del formulario
    const [formData, setFormData] = useState<AlmacenFormData>({
        nombre: '',
        codigo: '',
        direccion: '',
        capacidadM3: 0,
        responsable: ''
    });

    // Estados de UI
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Manejador de cambios en inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'capacidadM3' ? parseFloat(value) || 0 : value,
        }));
        
        // Limpiar error al escribir
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors({});
        setNotification({ ...notification, show: false });

        try {
            await almacenService.create(formData);

            setNotification({ show: true, message: '¡Almacén guardado correctamente!', type: 'success' });
            
            setTimeout(() => {
                navigate('/inventario/almacenes');
            }, 1500);

        } catch (error: any) {
            console.error('Error al guardar:', error);
            
            if (error.status === 400 && error.errors) {
                setValidationErrors(error.errors);
                setNotification({ show: true, message: 'Error de validación. Revise los campos.', type: 'error' });
            } else {
                setNotification({ 
                    show: true, 
                    message: error.message || 'Error al conectar con el servidor.', 
                    type: 'error' 
                });
            }
        }
    };

    return {
        formData,
        handleChange,
        handleSubmit,
        notification,
        validationErrors,
        showCancelModal,
        setShowCancelModal,
        navigate
    };
};