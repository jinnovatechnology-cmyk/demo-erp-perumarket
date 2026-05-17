import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductoFormData, NotificationState } from '../../types/inventario/product';
import { productService } from '../../services/inventario/productService';

const INITIAL_FORM_STATE: ProductoFormData = {
  nombre: '', descripcion: '', sku: '', precioVenta: 0.0, precioCompra: 0.0,
  categoriaId: null, unidadMedida: 'UNIDAD', pesoKg: 0.0,
  almacenId: null, stockInicial: 0, stockMinimo: 10, stockMaximo: 1000, ubicacion: '',
  proveedorId: null, codigoBarras: '', imagen: ''
};

export const useProductForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados
  const [formData, setFormData] = useState<ProductoFormData>(INITIAL_FORM_STATE);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [barcodeImageUrl, setBarcodeImageUrl] = useState<string>('');
  
  // Notificaciones y Modales
  const [notification, setNotification] = useState<NotificationState>({ show: false, message: '', type: 'success' });
  const [showCancelModal, setShowCancelModal] = useState(false);

  // --- Lógica de Negocio: SKU ---
  const generateSKU = (productName: string): string => {
    if (!productName.trim()) return '';
    const cleanName = productName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9\s]/g, "").trim();
    const words = cleanName.split(/\s+/).slice(0, 3);
    const skuParts = words.map(word => word.substring(0, 4));
    const baseSKU = skuParts.join('-');
    const timestamp = Date.now().toString().slice(-4);
    return `${baseSKU}-${timestamp}`;
  };

  useEffect(() => {
    if (formData.nombre && !formData.sku) {
      setFormData(prev => ({ ...prev, sku: generateSKU(formData.nombre) }));
    }
  }, [formData.nombre]);

  // --- Lógica de Negocio: Código de Barras ---
  useEffect(() => {
    if (formData.codigoBarras && formData.codigoBarras.length >= 12) {
      const url = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(formData.codigoBarras)}&code=EAN13&translate-esc=on&dpi=96`;
      setBarcodeImageUrl(url);
    } else {
      setBarcodeImageUrl('');
    }
  }, [formData.codigoBarras]);

  const generateBarcode = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setFormData(prev => ({ ...prev, codigoBarras: timestamp + random }));
  };

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue: string | number | null = value;

    if (e.target.type === 'number' || name.endsWith('Id') || name.startsWith('stock')) {
      newValue = name.endsWith('Id') ? parseInt(value) || null : parseFloat(value) || 0;
      if (newValue === 0 && name.endsWith('Id')) newValue = null;
    }

    setFormData(prev => ({ ...prev, [name]: newValue } as ProductoFormData));
    
    // Limpiar error al escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      alert('Archivo inválido o muy grande (máx 5MB).');
      return;
    }
    setUploadedImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setUploadedImageFile(null);
    setFormData(prev => ({ ...prev, imagen: '' }));
  };
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  setValidationErrors({});

  try {
    // Guardar producto (con imagen opcional)
    await productService.createProduct(formData, uploadedImageFile || undefined);

    setNotification({ show: true, message: '¡Producto guardado exitosamente!', type: 'success' });
    setTimeout(() => navigate('/inventario'), 1500);

  } catch (error: any) {
    console.error('Error al guardar:', error);

    if (error.status === 400 && error.body?.errors) {
      setValidationErrors(error.body.errors);
      setNotification({ show: true, message: "Error de validación. Revise los campos.", type: 'error' });
    } else {
      setNotification({ 
        show: true, 
        message: error.body?.message || "Error de conexión con el servidor.", 
        type: 'error' 
      });
    }
  }
};


  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    handleImageUpload,
    clearImage,
    fileInputRef,
    imagePreview,
    uploadedImageFile,
    validationErrors,
    barcodeImageUrl,
    generateBarcode,
    generateSKU, // Exponemos generateSKU por si se usa manualmente en el botón "Regenerar"
    notification,
    setNotification, // Exponemos setter para usarlo desde el hook de opciones
    showCancelModal,
    setShowCancelModal,
    navigate
  };
};