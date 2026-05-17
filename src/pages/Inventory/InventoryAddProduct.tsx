import { useState, useEffect, useMemo } from 'react';
import {
    IoIosCube, IoIosSearch, IoIosImage,
    IoIosCheckmarkCircle, IoIosPricetag, IoIosCamera,
    IoMdClose, IoMdWarning, IoMdCheckmarkCircle, IoMdCreate
} from 'react-icons/io';
import { FiPlusCircle } from 'react-icons/fi';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { inventoryService } from '../../services/inventario/inventoryService';
import { productService } from '../../services/inventario/productService';
import type { Product } from '../../types/inventario/inventory';
import type { Option } from '../../types/inventario/product';
import PageWrapper from '../../components/ui/PageWrapper';

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

export default function InventoryAddProduct() {
    const { isDark, heading, textTertiary, colors } = useThemeClasses();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showOnlyPending, setShowOnlyPending] = useState(true);

    // Edit modal
    const [editing, setEditing] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState({
        precioVenta: 0,
        precioCompra: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        descripcion: '',
        ubicacion: '',
        unidadMedida: 'UNIDAD',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Options
    const [, setCategorias] = useState<Option[]>([]);
    const [, setAlmacenes] = useState<Option[]>([]);
    const [, setProveedores] = useState<Option[]>([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [prods, opts] = await Promise.all([
                    inventoryService.getAllProducts(),
                    productService.fetchOptions()
                ]);
                setProducts(prods);
                setCategorias(opts.categorias);
                setAlmacenes(opts.almacenes);
                setProveedores(opts.proveedores);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const needsConfig = (p: Product) => !p.precioVenta || p.precioVenta <= 0;

    const filtered = useMemo(() => {
        let list = products;
        if (showOnlyPending) {
            list = list.filter(needsConfig);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p =>
                p.nombre.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                p.proveedorRazonSocial?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [products, search, showOnlyPending]);

    const pendingCount = useMemo(() => products.filter(needsConfig).length, [products]);

    const openEdit = (product: Product) => {
        setEditing(product);
        setEditForm({
            precioVenta: product.precioVenta || 0,
            precioCompra: product.precioCompra || 0,
            stockMinimo: product.stockMinimo || 0,
            stockMaximo: product.stockMaximo || 0,
            descripcion: product.descripcion || '',
            ubicacion: product.ubicacionPrincipal || '',
            unidadMedida: product.unidadMedida || 'UNIDAD',
        });
        setImageFile(null);
        setImagePreview('');
        setError(null);
    };

    const handleSave = async () => {
        if (!editing) return;
        if (editForm.precioVenta <= 0) {
            setError('El precio de venta debe ser mayor a 0');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await productService.updateProduct(editing.id, {
                nombre: editing.nombre,
                descripcion: editForm.descripcion,
                sku: editing.sku,
                precioVenta: editForm.precioVenta,
                precioCompra: editForm.precioCompra,
                categoriaId: editing.categoriaId,
                unidadMedida: editForm.unidadMedida || 'UNIDAD',
                pesoKg: editing.pesoKg || 0,
                almacenId: editing.almacenId,
                stockInicial: editing.stockActual || 0,
                stockMinimo: editForm.stockMinimo,
                stockMaximo: editForm.stockMaximo,
                ubicacion: editForm.ubicacion,
                proveedorId: editing.proveedorId,
                codigoBarras: editing.codigoBarrasPrincipal || editing.sku,
                imagen: editing.imagen || '',
            }, imageFile || undefined);

            // Update local state
            setProducts(prev => prev.map(p => p.id === editing.id ? {
                ...p,
                precioVenta: editForm.precioVenta,
                precioCompra: editForm.precioCompra,
                stockMinimo: editForm.stockMinimo,
                stockMaximo: editForm.stockMaximo,
                descripcion: editForm.descripcion,
                ubicacionPrincipal: editForm.ubicacion,
                unidadMedida: editForm.unidadMedida,
            } : p));

            setSaveSuccess(editing.id);
            setTimeout(() => setSaveSuccess(null), 2000);
            setEditing(null);
        } catch (err: any) {
            const msg = err?.body?.message || err?.body?.error || 'Error al guardar';
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('data:') || imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/api/')) return `http://localhost:8080${imagePath}`;
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `http://localhost:8080/api${cleanPath}`;
    };

    const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-gray-500/30' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-indigo-500/20'}`;
    const labelClass = `block text-xs font-semibold uppercase tracking-wide mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`;

    if (loading) return (
        <PageWrapper
            title="Configurar Productos"
            subtitle="Asigna precios de venta y detalles a tus productos comprados"
            icon={<FiPlusCircle />}
            actions={[{ label: 'Volver', href: '/inventario', variant: 'secondary' }]}
        >
            <div className="flex flex-col items-center py-16">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: colors[100] }}>
                    <IoIosCube className="w-6 h-6 animate-pulse" style={{ color: colors[600] }} />
                </div>
                <p className={`text-sm font-medium ${textTertiary}`}>Cargando productos...</p>
            </div>
        </PageWrapper>
    );

    return (
        <PageWrapper
            title="Configurar Productos"
            subtitle="Asigna precios de venta y detalles a tus productos comprados — Peru Market"
            icon={<FiPlusCircle />}
            actions={[{ label: 'Volver', href: '/inventario', variant: 'secondary' }]}
        >
        <div className="space-y-6">

            {/* EDIT MODAL */}
            {editing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setEditing(null)}>
                    <div className={`rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                        {/* Modal header */}
                        <div className={`sticky top-0 p-4 border-b flex justify-between items-center z-10 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                            <div>
                                <h3 className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Configurar Producto</h3>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>SKU: {editing.sku}</p>
                            </div>
                            <button onClick={() => setEditing(null)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                <IoMdClose className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Product info */}
                            <div className={`flex items-center gap-4 p-3 rounded-xl ${isDark ? 'bg-gray-900/40' : 'bg-gray-50'}`}>
                                <div className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    {editing.imagen ? (
                                        <img src={getImageUrl(editing.imagen)} alt={editing.nombre} className="w-full h-full object-contain" />
                                    ) : (
                                        <IoIosImage className={`w-6 h-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{editing.nombre}</h4>
                                    <div className={`text-xs space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <p>Proveedor: <span className="font-medium">{editing.proveedorRazonSocial || 'N/A'}</span></p>
                                        <p>Stock actual: <span className="font-bold" style={{ color: colors[600] }}>{editing.stockActual}</span> &middot; Almacén: {editing.almacenNombre}</p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className={`p-3 rounded-xl border flex items-center gap-2 text-sm ${isDark ? 'bg-red-900/20 border-red-800/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                    <IoMdWarning className="w-4 h-4 shrink-0" /> {error}
                                </div>
                            )}

                            {/* Prices */}
                            <div>
                                <h5 className={`text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <IoIosPricetag className="w-3.5 h-3.5" /> Precios
                                </h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Precio Compra (S/)</label>
                                        <input className={inputClass} type="number" step="0.01" min="0"
                                            value={editForm.precioCompra || ''} onChange={e => setEditForm(prev => ({ ...prev, precioCompra: parseFloat(e.target.value) || 0 }))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Precio Venta (S/) *</label>
                                        <input className={`${inputClass} ring-2 ${editForm.precioVenta > 0 ? 'ring-emerald-500/20' : 'ring-amber-500/30'}`}
                                            type="number" step="0.01" min="0" placeholder="Obligatorio"
                                            value={editForm.precioVenta || ''} onChange={e => setEditForm(prev => ({ ...prev, precioVenta: parseFloat(e.target.value) || 0 }))} />
                                    </div>
                                </div>
                                {editForm.precioCompra > 0 && editForm.precioVenta > 0 && (
                                    <div className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Margen: <span className={`font-bold ${((editForm.precioVenta - editForm.precioCompra) / editForm.precioCompra * 100) > 20 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {((editForm.precioVenta - editForm.precioCompra) / editForm.precioCompra * 100).toFixed(1)}%
                                        </span>
                                        {' '}&middot; Ganancia: <span className="font-bold text-emerald-500">S/ {(editForm.precioVenta - editForm.precioCompra).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Stock limits */}
                            <div>
                                <h5 className={`text-xs font-bold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Límites de Stock</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Stock Mínimo</label>
                                        <input className={inputClass} type="number" min="0"
                                            value={editForm.stockMinimo || ''} onChange={e => setEditForm(prev => ({ ...prev, stockMinimo: parseInt(e.target.value) || 0 }))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Stock Máximo</label>
                                        <input className={inputClass} type="number" min="0"
                                            value={editForm.stockMaximo || ''} onChange={e => setEditForm(prev => ({ ...prev, stockMaximo: parseInt(e.target.value) || 0 }))} />
                                    </div>
                                </div>
                            </div>

                            {/* Unidad de medida */}
                            <div>
                                <h5 className={`text-xs font-bold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Unidad de Medida</h5>
                                <select
                                    className={inputClass}
                                    value={editForm.unidadMedida}
                                    onChange={e => setEditForm(prev => ({ ...prev, unidadMedida: e.target.value }))}
                                >
                                    {UNIDADES_MEDIDA.map(u => (
                                        <option key={u.valor} value={u.valor}>{u.etiqueta}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Description & Location */}
                            <div>
                                <label className={labelClass}>Descripción</label>
                                <textarea className={`${inputClass} resize-none`} rows={2} placeholder="Descripción del producto..."
                                    value={editForm.descripcion} onChange={e => setEditForm(prev => ({ ...prev, descripcion: e.target.value }))} />
                            </div>
                            <div>
                                <label className={labelClass}>Ubicación en almacén</label>
                                <input className={inputClass} placeholder="Ej: Pasillo A, Estante 3"
                                    value={editForm.ubicacion} onChange={e => setEditForm(prev => ({ ...prev, ubicacion: e.target.value }))} />
                            </div>

                            {/* Image upload */}
                            <div>
                                <label className={labelClass}>Cambiar imagen</label>
                                <div className="flex items-center gap-3">
                                    {imagePreview ? (
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border">
                                            <img src={imagePreview} className="w-full h-full object-contain" />
                                            <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }}
                                                className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/50 text-white">
                                                <IoMdClose className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                            <IoIosCamera className="w-4 h-4" /> Subir imagen
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div className={`sticky bottom-0 p-4 border-t flex gap-3 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                            <button onClick={() => setEditing(null)} className={`flex-1 py-2.5 rounded-xl border font-medium text-sm transition-all ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                Cancelar
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ backgroundColor: colors[600] }}>
                                {saving ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                                ) : (
                                    <><IoMdCheckmarkCircle className="w-4 h-4" /> Guardar Cambios</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div>

                {/* Info banner */}
                {pendingCount > 0 && (
                    <div className={`mb-5 p-4 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-amber-900/10 border-amber-700/30' : 'bg-amber-50 border-amber-200'}`}>
                        <IoMdWarning className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                        <div>
                            <p className={`text-sm font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                                {pendingCount} producto{pendingCount > 1 ? 's' : ''} sin precio de venta
                            </p>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>
                                Estos productos necesitan un precio de venta para poder venderse
                            </p>
                        </div>
                    </div>
                )}

                {/* Filter bar */}
                <div className={`rounded-2xl border p-2 mb-6 flex flex-col sm:flex-row gap-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex-1 relative">
                        <IoIosSearch className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input
                            placeholder="Buscar producto, SKU o proveedor..."
                            className={`w-full pl-10 pr-4 py-2.5 bg-transparent rounded-xl text-sm focus:outline-none ${isDark ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}`}
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className={`hidden sm:block w-px my-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    <div className="flex gap-1.5 p-0.5">
                        <button onClick={() => setShowOnlyPending(true)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${showOnlyPending ? (isDark ? 'bg-gray-700 text-amber-400' : 'bg-amber-50 text-amber-700') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
                            Pendientes ({pendingCount})
                        </button>
                        <button onClick={() => setShowOnlyPending(false)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${!showOnlyPending ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
                            Todos ({products.length})
                        </button>
                    </div>
                </div>

                {/* Product grid */}
                {filtered.length === 0 ? (
                    <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <IoIosCheckmarkCircle className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-emerald-500/30' : 'text-emerald-300'}`} />
                        <h3 className={`font-semibold mb-1 ${heading}`}>
                            {showOnlyPending ? 'Todos los productos tienen precio' : 'No hay productos'}
                        </h3>
                        <p className={`text-sm ${textTertiary}`}>
                            {showOnlyPending ? 'No hay productos pendientes de configurar' : 'Aún no tienes productos en inventario'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(product => {
                            const isPending = needsConfig(product);
                            const justSaved = saveSuccess === product.id;

                            return (
                                <div key={product.id}
                                    onClick={() => openEdit(product)}
                                    className={`group rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${justSaved
                                        ? (isDark ? 'border-emerald-500 bg-emerald-900/10' : 'border-emerald-400 bg-emerald-50')
                                        : isPending
                                            ? (isDark ? 'border-amber-700/50 bg-gray-800 hover:border-amber-500/50' : 'border-amber-200 bg-white hover:border-amber-300')
                                            : (isDark ? 'border-gray-700 bg-gray-800 hover:border-gray-600' : 'border-gray-200 bg-white hover:border-gray-300')
                                    } hover:shadow-lg ${isDark ? 'hover:shadow-black/20' : 'hover:shadow-gray-200/50'}`}
                                >
                                    <div className="flex gap-4 p-4">
                                        {/* Image */}
                                        <div className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 flex items-center justify-center ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                            {product.imagen ? (
                                                <img src={getImageUrl(product.imagen)} alt={product.nombre}
                                                    className={`w-full h-full object-contain p-1 ${isDark ? '' : 'mix-blend-multiply'}`}
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            ) : (
                                                <IoIosImage className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-bold text-sm line-clamp-1 mb-0.5 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                {product.nombre}
                                            </h3>
                                            <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                SKU: {product.sku} &middot; {product.proveedorRazonSocial || 'Sin proveedor'}
                                                {product.unidadMedida && product.unidadMedida !== 'UNIDAD' && (
                                                    <> &middot; <span className="font-medium">{product.unidadMedida}</span></>
                                                )}
                                            </p>

                                            <div className="flex items-center gap-3">
                                                {/* Precio compra */}
                                                <div>
                                                    <span className={`text-[10px] uppercase font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Compra</span>
                                                    <p className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        S/ {product.precioCompra?.toFixed(2) || '0.00'}
                                                    </p>
                                                </div>

                                                {/* Arrow */}
                                                <span className={`text-lg ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>&rarr;</span>

                                                {/* Precio venta */}
                                                <div>
                                                    <span className={`text-[10px] uppercase font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Venta</span>
                                                    {isPending ? (
                                                        <p className="text-sm font-bold text-amber-500">Sin precio</p>
                                                    ) : (
                                                        <p className="text-sm font-bold text-emerald-500">S/ {product.precioVenta.toFixed(2)}</p>
                                                    )}
                                                </div>

                                                {/* Stock */}
                                                <div className="ml-auto text-right">
                                                    <span className={`text-[10px] uppercase font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Stock</span>
                                                    <p className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{product.stockActual}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status footer */}
                                    <div className={`px-4 py-2 border-t flex items-center justify-between ${justSaved
                                        ? (isDark ? 'border-emerald-800 bg-emerald-900/20' : 'border-emerald-200 bg-emerald-50')
                                        : isPending
                                            ? (isDark ? 'border-amber-800/30 bg-amber-900/10' : 'border-amber-100 bg-amber-50/50')
                                            : (isDark ? 'border-gray-700 bg-gray-900/30' : 'border-gray-100 bg-gray-50/50')
                                    }`}>
                                        {justSaved ? (
                                            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                                                <IoMdCheckmarkCircle className="w-3.5 h-3.5" /> Guardado correctamente
                                            </span>
                                        ) : isPending ? (
                                            <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                                                <IoMdWarning className="w-3.5 h-3.5" /> Pendiente de configurar
                                            </span>
                                        ) : (
                                            <span className={`text-xs font-medium flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                <IoMdCheckmarkCircle className="w-3.5 h-3.5" /> Configurado
                                            </span>
                                        )}
                                        <span className={`text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <IoMdCreate className="w-3 h-3" /> Editar
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
        </PageWrapper>
    );
}
