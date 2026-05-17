/**
 * ProveedorProductosModal.tsx - Modal de catálogo de productos del proveedor
 * Diseño Power BI - Estilo profesional y minimalista
 */

import { useState, useEffect } from 'react';
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiPackage,
  FiImage,
  FiUpload,
  FiDollarSign,
  FiBox,
  FiTag,
  FiCheck
} from 'react-icons/fi';
import type { ProveedorData } from '../../../types/proveedor/proveedorType';
import { api } from '../../../services/api';
import { useThemeClasses } from '../../../hooks/useThemeClasses';

interface ProductoProveedorDTO {
  id: number;
  productoId: number;
  nombre: string;
  codigo: string;
  precio_compra: number;
  peso_kg: number;
  descuento: number;
  imagen?: string;
  unidadMedida?: string;
}

const UNIDADES_MEDIDA = [
  { valor: 'UNIDAD', etiqueta: 'Unidad (und)' },
  { valor: 'CAJA', etiqueta: 'Caja' },
  { valor: 'PAQUETE', etiqueta: 'Paquete' },
  { valor: 'DOCENA', etiqueta: 'Docena (12 und)' },
  { valor: 'KG', etiqueta: 'Kilogramo (kg)' },
  { valor: 'GRAMO', etiqueta: 'Gramo (g)' },
  { valor: 'LITRO', etiqueta: 'Litro (L)' },
  { valor: 'MILILITRO', etiqueta: 'Mililitro (mL)' },
  { valor: 'METRO', etiqueta: 'Metro (m)' },
  { valor: 'GALON', etiqueta: 'Galón (gal)' },
  { valor: 'SACO', etiqueta: 'Saco' },
  { valor: 'BOLSA', etiqueta: 'Bolsa' },
  { valor: 'LIBRA', etiqueta: 'Libra (lb)' },
  { valor: 'ROLLO', etiqueta: 'Rollo' },
  { valor: 'PAR', etiqueta: 'Par' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  proveedor: ProveedorData | undefined;
}

export default function ProveedorProductosModal({ isOpen, onClose, proveedor }: Props) {
  const API_URL = 'http://localhost:8080/api';
  const { isDark } = useThemeClasses();

  const [productos, setProductos] = useState<ProductoProveedorDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [nombreInput, setNombreInput] = useState('');
  const [precioInput, setPrecioInput] = useState('');
  const [pesoInput, setPesoInput] = useState('');
  const [unidadInput, setUnidadInput] = useState('UNIDAD');

  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && proveedor) {
      cargarProductosProveedor();
      limpiarFormulario();
    }
  }, [isOpen, proveedor]);

  const limpiarFormulario = () => {
    setNombreInput('');
    setPrecioInput('');
    setPesoInput('');
    setUnidadInput('UNIDAD');
    setImagenFile(null);
    setImagenPreview(null);
  };

  const cargarProductosProveedor = async () => {
    if (!proveedor) return;
    setLoading(true);
    try {
      const res = await api.get(`/proveedores/${proveedor.id}/productos`);
      setProductos(res.data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImagenFile(null);
    setImagenPreview(null);
  };

  const handleVincular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreInput.trim()) { alert("El nombre es obligatorio"); return; }
    if (!precioInput || isNaN(parseFloat(precioInput))) { alert("Precio inválido"); return; }
    if (!pesoInput || isNaN(parseFloat(pesoInput))) { alert("Peso inválido"); return; }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('nombre', nombreInput.trim());
      const skuAuto = `PROV-${Date.now().toString().slice(-6)}`;
      formData.append('sku', skuAuto);
      formData.append('precio_compra', precioInput);
      formData.append('peso_kg', pesoInput);
      formData.append('unidad_medida', unidadInput);
      if (imagenFile) {
        formData.append('imagen', imagenFile);
      }

      await api.post(
        `/proveedores/${proveedor?.id}/productos`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setSuccessMessage("Producto registrado correctamente");
      setTimeout(() => setSuccessMessage(null), 3000);
      cargarProductosProveedor();
      limpiarFormulario();
    } catch (error) {
      console.error("Error de red:", error);
      alert('Error de conexión con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDesvincular = async (idRelacion: number) => {
    if (!window.confirm("¿Eliminar este producto del catálogo del proveedor?")) return;
    try {
      await api.delete(`/proveedores/productos/${idRelacion}`);
      setProductos(productos.filter(p => p.id !== idRelacion));
      setSuccessMessage("Producto eliminado del catálogo");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar el producto");
    }
  };

  if (!isOpen || !proveedor) return null;

  const nombreProveedor = proveedor.razon_social || "Sin nombre";

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm transition-opacity`}
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`
          relative w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col
          ${isDark ? 'bg-[#171717] border-neutral-700' : 'bg-white border-gray-200'}
        `}>
          {/* ═══ HEADER ═══ */}
          <div className={`
            flex-none px-6 py-5 border-b flex items-center justify-between
            ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}
          `}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-[#E0312A]/20' : 'bg-[#E0312A]/10'}`}>
                <FiPackage className="w-6 h-6 text-[#E0312A]" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Catálogo de Productos
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`
                    text-[10px] font-mono font-semibold px-2 py-0.5 rounded
                    ${isDark ? 'bg-neutral-700 text-gray-400' : 'bg-gray-100 text-gray-500'}
                  `}>
                    {proveedor.ruc}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {nombreProveedor}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition-colors
                ${isDark ? 'hover:bg-neutral-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
              `}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* ═══ BODY SCROLLABLE ═══ */}
          <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>

            {/* Mensaje de éxito */}
            {successMessage && (
              <div className={`
                flex items-center gap-3 px-4 py-3 rounded-lg border mb-6
                ${isDark ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}
              `}>
                <FiCheck size={18} />
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}

            {/* ═══ FORMULARIO DE NUEVO PRODUCTO ═══ */}
            <div className={`
              rounded-xl border overflow-hidden mb-6
              ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}
            `}>
              <div className={`
                px-5 py-3 border-b flex items-center gap-2
                ${isDark ? 'border-neutral-800 bg-neutral-800/50' : 'border-gray-100 bg-gray-50'}
              `}>
                <FiPlus className="text-[#E0312A]" />
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Registrar Nuevo Producto
                </h3>
              </div>

              <form onSubmit={handleVincular} className="p-5 space-y-4">
                {/* Nombre */}
                <div>
                  <label className={`
                    block text-xs font-semibold uppercase tracking-wider mb-1.5
                    ${isDark ? 'text-gray-400' : 'text-gray-500'}
                  `}>
                    Nombre del Producto <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiTag className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Ej: Laptop HP Pavilion 15"
                      value={nombreInput}
                      onChange={(e) => setNombreInput(e.target.value)}
                      className={`
                        w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-colors
                        ${isDark
                          ? 'bg-neutral-800 border-neutral-700 text-white placeholder-gray-500 focus:border-[#E0312A]'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#E0312A]'
                        }
                      `}
                    />
                  </div>
                </div>

                {/* Grid de campos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Costo */}
                  <div>
                    <label className={`
                      block text-xs font-semibold uppercase tracking-wider mb-1.5
                      ${isDark ? 'text-gray-400' : 'text-gray-500'}
                    `}>
                      Costo (S/) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiDollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={precioInput}
                        onChange={(e) => setPrecioInput(e.target.value)}
                        className={`
                          w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-colors
                          ${isDark
                            ? 'bg-neutral-800 border-neutral-700 text-white placeholder-gray-500 focus:border-[#E0312A]'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#E0312A]'
                          }
                        `}
                      />
                    </div>
                  </div>

                  {/* Unidad de Medida */}
                  <div>
                    <label className={`
                      block text-xs font-semibold uppercase tracking-wider mb-1.5
                      ${isDark ? 'text-gray-400' : 'text-gray-500'}
                    `}>
                      Unidad de Medida <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={unidadInput}
                      onChange={(e) => setUnidadInput(e.target.value)}
                      className={`
                        w-full px-4 py-2.5 rounded-lg border text-sm transition-colors appearance-none cursor-pointer
                        ${isDark
                          ? 'bg-neutral-800 border-neutral-700 text-white focus:border-[#E0312A]'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-[#E0312A]'
                        }
                      `}
                    >
                      {UNIDADES_MEDIDA.map(u => (
                        <option key={u.valor} value={u.valor}>{u.etiqueta}</option>
                      ))}
                    </select>
                  </div>

                  {/* Peso */}
                  <div>
                    <label className={`
                      block text-xs font-semibold uppercase tracking-wider mb-1.5
                      ${isDark ? 'text-gray-400' : 'text-gray-500'}
                    `}>
                      {['KG', 'GRAMO', 'LIBRA'].includes(unidadInput) ? 'Peso neto' :
                        ['LITRO', 'MILILITRO', 'GALON'].includes(unidadInput) ? 'Volumen (L)' :
                          'Peso por und (Kg)'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiBox className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={pesoInput}
                        onChange={(e) => setPesoInput(e.target.value)}
                        className={`
                          w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-colors
                          ${isDark
                            ? 'bg-neutral-800 border-neutral-700 text-white placeholder-gray-500 focus:border-[#E0312A]'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#E0312A]'
                          }
                        `}
                      />
                    </div>
                  </div>
                </div>

                {/* Imagen */}
                <div>
                  <label className={`
                    block text-xs font-semibold uppercase tracking-wider mb-1.5
                    ${isDark ? 'text-gray-400' : 'text-gray-500'}
                  `}>
                    Imagen (Opcional)
                  </label>

                  {!imagenPreview ? (
                    <label className={`
                      flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                      ${isDark
                        ? 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600 hover:bg-neutral-800'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                      }
                    `}>
                      <div className="flex flex-col items-center justify-center py-4">
                        <FiUpload className={`w-8 h-8 mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Click para subir imagen
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          PNG, JPG hasta 5MB
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  ) : (
                    <div className={`
                      relative w-full h-40 rounded-xl border overflow-hidden
                      ${isDark ? 'border-neutral-700 bg-neutral-800' : 'border-gray-200 bg-gray-50'}
                    `}>
                      <img src={imagenPreview} alt="Preview" className="h-full w-full object-contain" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className={`
                          absolute top-2 right-2 p-2 rounded-lg transition-colors
                          ${isDark
                            ? 'bg-neutral-800/90 text-red-400 hover:bg-red-900/50'
                            : 'bg-white/90 text-red-500 hover:bg-red-50'
                          }
                        `}
                      >
                        <FiTrash2 size={16} />
                      </button>
                      <div className="absolute bottom-2 left-2">
                        <span className={`
                          px-2 py-1 rounded text-xs font-medium
                          ${isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'}
                        `}>
                          Imagen lista
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón de guardar */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!nombreInput || !precioInput || !pesoInput || saving}
                    className={`
                      px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
                      bg-[#E0312A] hover:bg-[#A91E16]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center gap-2
                    `}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FiPlus size={18} />
                        Guardar Producto
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* ═══ LISTA DE PRODUCTOS ═══ */}
            <div>
              <h3 className={`
                text-xs font-semibold uppercase tracking-wider mb-4
                ${isDark ? 'text-gray-500' : 'text-gray-400'}
              `}>
                Productos Registrados ({productos.length})
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-[#E0312A]/30 border-t-[#E0312A] rounded-full animate-spin" />
                </div>
              ) : productos.length === 0 ? (
                <div className={`
                  text-center py-12 rounded-xl border-2 border-dashed
                  ${isDark ? 'border-neutral-700 bg-neutral-800/30' : 'border-gray-200 bg-gray-50/50'}
                `}>
                  <FiPackage className={`mx-auto w-10 h-10 mb-3 ${isDark ? 'text-neutral-600' : 'text-gray-300'}`} />
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No hay productos registrados
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Use el formulario de arriba para agregar productos
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {productos.map((prod) => (
                    <div
                      key={prod.id}
                      className={`
                        flex items-center gap-4 p-4 rounded-xl border transition-all
                        ${isDark
                          ? 'bg-[#171717] border-neutral-800 hover:border-neutral-700'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }
                      `}
                    >
                      {/* Imagen */}
                      <div className={`
                        h-16 w-16 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center
                        ${isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-gray-100 border border-gray-200'}
                      `}>
                        {prod.imagen ? (
                          <img
                            src={`${API_URL}${prod.imagen}`}
                            alt={prod.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <FiImage className={`w-6 h-6 ${isDark ? 'text-neutral-600' : 'text-gray-300'}`} />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {prod.nombre}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`
                            text-[10px] font-mono px-2 py-0.5 rounded
                            ${isDark ? 'bg-neutral-700 text-gray-400' : 'bg-gray-100 text-gray-500'}
                          `}>
                            {prod.codigo}
                          </span>
                          <span className={`
                            text-xs font-semibold px-2 py-0.5 rounded
                            ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'}
                          `}>
                            S/ {prod.precio_compra.toFixed(2)}
                          </span>
                          <span className={`
                            text-xs font-medium px-2 py-0.5 rounded
                            ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}
                          `}>
                            {prod.peso_kg} kg
                          </span>
                          {prod.unidadMedida && (
                            <span className={`
                              text-xs font-medium px-2 py-0.5 rounded
                              ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-700'}
                            `}>
                              {prod.unidadMedida}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => handleDesvincular(prod.id)}
                        className={`
                          p-2.5 rounded-lg transition-colors flex-shrink-0
                          ${isDark
                            ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/30'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }
                        `}
                        title="Eliminar producto"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
