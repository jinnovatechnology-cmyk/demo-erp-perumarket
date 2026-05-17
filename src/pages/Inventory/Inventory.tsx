import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    IoIosCube, IoIosStats, IoIosPulse, IoIosSearch, IoIosAdd,
    IoMdHome, IoMdCheckmarkCircle,
    IoIosBuild, IoMdRefresh, IoMdTrash, IoMdBarcode,
    IoIosBarcode, IoIosImage, IoMdWarning, IoMdClose,
    IoMdAlert
} from 'react-icons/io';
import {
    FiBox, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight,
    FiEye, FiX, FiPackage, FiDollarSign, FiTruck, FiMapPin, FiTag, FiLayers,
    FiHash
} from 'react-icons/fi';

import { useInventory } from '../../hooks/inventario/useInventory';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { PageWrapper, StatsGrid, StatCard, LoadingState, EmptyState, TYPOGRAPHY } from '../../components/ui/PageWrapper';

// --- HELPERS ---

const getStockStatusConfig = (stock: number, minStock: number, isDark: boolean) => {
    if (stock <= 0) return {
        label: 'Sin Stock',
        color: isDark ? 'bg-red-900/40 text-red-400 border-red-700/50' : 'bg-red-50 text-red-600 border-red-200',
        dotColor: 'bg-red-500',
        barColor: 'bg-red-500',
        icon: <IoMdWarning className="w-3 h-3" />
    };
    if (stock <= minStock) return {
        label: 'Stock Bajo',
        color: isDark ? 'bg-amber-900/40 text-amber-400 border-amber-700/50' : 'bg-amber-50 text-amber-600 border-amber-200',
        dotColor: 'bg-amber-500',
        barColor: 'bg-amber-500',
        icon: <IoIosPulse className="w-3 h-3" />
    };
    return {
        label: 'Disponible',
        color: isDark ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50' : 'bg-emerald-50 text-emerald-600 border-emerald-200',
        dotColor: 'bg-emerald-500',
        barColor: 'bg-emerald-500',
        icon: <IoMdCheckmarkCircle className="w-3 h-3" />
    };
};

// --- Barcode Display ---
const BarcodeDisplay = ({ barcode, sku, name, isDark }: { barcode: string, sku: string, name: string, isDark: boolean }) => {
    const [barcodeImageUrl, setBarcodeImageUrl] = useState<string>('');

    useEffect(() => {
        if (barcode && barcode.length >= 12) {
            setBarcodeImageUrl(`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(barcode)}&code=EAN13&translate-esc=on&dpi=96`);
        } else {
            setBarcodeImageUrl('');
        }
    }, [barcode]);

    const printBarcode = () => {
        if (barcodeImageUrl) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`<html><head><title>Imprimir Código - ${name}</title><style>body{margin:0;padding:20px;font-family:sans-serif;text-align:center;}.barcode-container{margin:20px auto;max-width:400px;padding:20px;}</style></head><body><div class="barcode-container"><img src="${barcodeImageUrl}" style="max-width:100%;" /><div style="margin-top:10px;"><strong>${name}</strong><br/>SKU: ${sku}</div></div><script>window.print();</script></body></html>`);
                printWindow.document.close();
            }
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 border rounded-xl w-full flex justify-center min-h-[100px] items-center ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                {barcodeImageUrl ? (
                    <img src={barcodeImageUrl} alt="Barcode" className={`max-w-full h-auto ${isDark ? '' : 'mix-blend-multiply'}`} />
                ) : (
                    <div className="flex gap-1 opacity-20">{Array.from({ length: 13 }).map((_, i) => <div key={i} className={`h-12 w-1 ${i % 2 === 0 ? (isDark ? 'bg-white' : 'bg-black') : 'bg-transparent'} border-l ${isDark ? 'border-white' : 'border-black'}`} />)}</div>
                )}
            </div>
            <div className="text-center">
                <p className={`font-mono text-lg tracking-widest font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{barcode}</p>
                <p className={`text-xs uppercase tracking-wide mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>SKU: {sku}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <button className={`flex items-center justify-center py-2.5 px-4 rounded-xl border font-medium text-sm transition-all ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`} onClick={() => { navigator.clipboard.writeText(barcode); }}>
                    Copiar
                </button>
                <button className={`flex items-center justify-center py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-900 text-white hover:bg-gray-800'}`} onClick={printBarcode}>
                    Imprimir
                </button>
            </div>
        </div>
    );
};

// --- Barcode Modal ---
const BarcodeModal = ({ product, onClose, onBarcodeGenerated, isDark, heading }: {
    product: any; onClose: () => void; onBarcodeGenerated: (p: any) => void;
    isDark: boolean; heading: string;
}) => {
    const [generating, setGenerating] = useState(false);
    const hasBarcode = product.codigoBarrasPrincipal && product.codigoBarrasPrincipal.length >= 12;

    const handleGenerate = async () => {
        setGenerating(true);
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const codigo = timestamp + random;
        try {
            const { supabase } = await import('../../lib/supabase');
            // Quitar el principal anterior (si lo hubiera) y registrar el nuevo
            await supabase
                .from('codigo_barras')
                .update({ es_principal: false })
                .eq('id_producto', product.id)
                .eq('es_principal', true);

            const { error } = await supabase.from('codigo_barras').insert({
                codigo,
                id_producto: product.id,
                tipo_codigo: 'EAN13',
                es_principal: true,
                estado: 'ACTIVO',
            });
            if (error) throw new Error(error.message);

            await supabase
                .from('producto')
                .update({ requiere_codigo_barras: true })
                .eq('id', product.id);

            onBarcodeGenerated({ ...product, codigoBarrasPrincipal: codigo });
        } catch (err) {
            console.error('Error generando código:', err);
            alert('Error al generar el código de barras');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className={`rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Código de Producto</h3>
                    <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <IoMdClose className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <h4 className={`text-center font-bold mb-1 ${heading}`}>{product.nombre}</h4>
                    <p className={`text-center text-xs mb-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>SKU: {product.sku}</p>
                    {hasBarcode ? (
                        <BarcodeDisplay barcode={product.codigoBarrasPrincipal} sku={product.sku} name={product.nombre} isDark={isDark} />
                    ) : (
                        <div className="text-center py-8">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <IoMdBarcode className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            </div>
                            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sin código de barras</p>
                            <p className={`text-xs mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Genera un código EAN-13 para este producto</p>
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="inline-flex items-center px-6 py-2.5 rounded-xl text-white font-medium text-sm transition-all shadow-md disabled:opacity-50 bg-[#E0312A] hover:bg-[#A91E16]"
                            >
                                <IoMdBarcode className="w-4 h-4 mr-2" />
                                {generating ? 'Generando...' : 'Generar Código de Barras'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Product Detail Modal ---
const ProductDetailModal = ({ product, onClose, isDark, onOpenBarcode }: {
    product: any;
    onClose: () => void;
    isDark: boolean;
    onOpenBarcode: () => void;
}) => {
    const margin = product.precioCompra > 0 ? ((product.precioVenta - product.precioCompra) / product.precioCompra) * 100 : 0;
    const stockPercent = product.stockMaximo > 0 ? Math.min((product.stockActual / product.stockMaximo) * 100, 100) : 0;
    const statusConfig = getStockStatusConfig(product.stockActual, product.stockMinimo, isDark);

    const InfoRow = ({ icon, label, value, highlight = false }: { icon: React.ReactNode; label: string; value: string | number; highlight?: boolean }) => (
        <div className={`flex items-center justify-between py-3 border-b last:border-0 ${isDark ? 'border-neutral-700' : 'border-gray-100'}`}>
            <div className={`flex items-center gap-2.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <span className={`text-sm font-semibold ${highlight ? 'text-[#E0312A]' : isDark ? 'text-white' : 'text-gray-900'}`}>
                {value}
            </span>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div
                className={`rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col ${isDark ? 'bg-[#171717]' : 'bg-white'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#E0312A]/20' : 'bg-[#E0312A]/10'}`}>
                            <FiPackage className="w-5 h-5 text-[#E0312A]" />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Detalle del Producto</h3>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Información completa</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                    {/* Product Image & Name */}
                    <div className={`p-5 border-b ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}`}>
                        <div className="flex gap-4">
                            <div className={`w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                                <ProductImage
                                    imagen={product.imagen}
                                    nombre={product.nombre}
                                    className="w-full h-full object-contain"
                                    isDark={isDark}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border mb-2 ${statusConfig.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                                    {statusConfig.label}
                                </span>
                                <h4 className={`font-bold text-base leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {product.nombre}
                                </h4>
                                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    SKU: {product.sku}
                                </p>
                                <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-neutral-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                    <FiTag size={12} />
                                    {product.categoriaNombre}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price Section */}
                    <div className="p-5 space-y-4">
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200'}`}>
                            <h5 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                <FiDollarSign className="inline w-3 h-3 mr-1" /> Precios
                            </h5>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Precio de Venta</p>
                                    <p className="text-2xl font-black text-[#E0312A]">S/ {product.precioVenta.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Costo</p>
                                    <p className={`text-lg font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>S/ {product.precioCompra.toFixed(2)}</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${margin > 30 ? (isDark ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-600 bg-emerald-50') : margin > 15 ? (isDark ? 'text-amber-400 bg-amber-900/30' : 'text-amber-600 bg-amber-50') : (isDark ? 'text-gray-400 bg-neutral-700' : 'text-gray-500 bg-gray-100')}`}>
                                    +{margin.toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        {/* Stock Section */}
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200'}`}>
                            <h5 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                <FiLayers className="inline w-3 h-3 mr-1" /> Stock
                            </h5>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {product.stockActual}
                                </span>
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    de {product.stockMaximo} {product.unidadMedida || 'unidades'}
                                </span>
                            </div>
                            <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-neutral-700' : 'bg-gray-100'}`}>
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${statusConfig.barColor}`}
                                    style={{ width: `${stockPercent}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs">
                                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Mínimo: {product.stockMinimo}</span>
                                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Máximo: {product.stockMaximo}</span>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200'}`}>
                            <h5 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                Información Adicional
                            </h5>
                            <InfoRow icon={<FiTruck size={14} />} label="Proveedor" value={product.proveedorRazonSocial || '-'} />
                            <InfoRow icon={<IoIosBuild size={14} />} label="Almacén" value={product.almacenNombre || '-'} />
                            {product.ubicacionPrincipal && (
                                <InfoRow icon={<FiMapPin size={14} />} label="Ubicación" value={product.ubicacionPrincipal} />
                            )}
                            <InfoRow icon={<FiHash size={14} />} label="ID Producto" value={`#${product.id}`} />
                            {product.codigoBarrasPrincipal && (
                                <InfoRow icon={<IoIosBarcode size={14} />} label="Código de Barras" value={product.codigoBarrasPrincipal} highlight />
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t flex gap-3 ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}`}>
                    <button
                        onClick={onClose}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${isDark ? 'bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={() => { onClose(); onOpenBarcode(); }}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#E0312A] hover:bg-[#A91E16] transition-all flex items-center justify-center gap-2"
                    >
                        <IoMdBarcode size={16} />
                        Ver Código
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Product Image ---
const ProductImage = ({ imagen, nombre, className = "", isDark }: { imagen: string, nombre: string, className?: string, isDark: boolean }) => {
    const [imageError, setImageError] = useState(false);

    if (!imagen || imageError) {
        return (
            <div className={`flex flex-col items-center justify-center ${isDark ? 'bg-gray-700/50 text-gray-500' : 'bg-gray-100 text-gray-400'} ${className}`}>
                <IoIosImage className="w-8 h-8 mb-1 opacity-40" />
                <span className="text-[9px] uppercase font-bold tracking-wider opacity-50">Sin imagen</span>
            </div>
        );
    }

    const getImageUrl = (imagePath: string) => {
        if (imagePath.startsWith('data:')) return imagePath;
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/api/')) return `http://localhost:8080${imagePath}`;
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `http://localhost:8080/api${cleanPath}`;
    };

    return (
        <img
            src={getImageUrl(imagen)}
            alt={nombre}
            className={`transition-transform duration-500 group-hover:scale-110 ${className}`}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
        />
    );
};

// === COMPONENTE PRINCIPAL ===
export default function Inventory() {
    const {
        loading, error, filteredProducts, stats, categories,
        searchTerm, setSearchTerm, filterCategory, setFilterCategory,
        confirmDelete, cancelDelete, productToDelete, isDeleting,
        showBarcodeModal, selectedProduct, openBarcodeModal, closeBarcodeModal
    } = useInventory();

    const { isDark, heading, textTertiary, textMuted } = useThemeClasses();

    // Product detail modal state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailProduct, setDetailProduct] = useState<any>(null);

    const openDetailModal = (product: any) => {
        setDetailProduct(product);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setDetailProduct(null);
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCategory]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    if (loading) return (
        <PageWrapper
            title="Inventario"
            subtitle="Administre el catálogo de productos, controle niveles de existencias y supervise los movimientos de almacén en tiempo real."
            icon={<FiBox />}
        >
            <LoadingState message="Cargando inventario..." />
        </PageWrapper>
    );

    if (error) return (
        <PageWrapper
            title="Inventario"
            subtitle="Administre el catálogo de productos, controle niveles de existencias y supervise los movimientos de almacén en tiempo real."
            icon={<FiBox />}
        >
            <div className={`border rounded-2xl p-6 flex items-start gap-4 ${isDark ? 'bg-red-900/20 border-red-800/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                <IoMdWarning className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                    <h3 className={`font-bold ${TYPOGRAPHY.sectionTitle}`}>Error de conexión</h3>
                    <p className={`${TYPOGRAPHY.body} mt-1 opacity-90`}>{error}</p>
                </div>
            </div>
        </PageWrapper>
    );

    return (
        <PageWrapper
            title="Inventario"
            subtitle="Administre el catálogo de productos, controle niveles de existencias y supervise los movimientos de almacén en tiempo real."
            icon={<FiBox />}
            actions={[
                {
                    label: "Almacenes",
                    href: "/inventario/almacenes",
                    icon: <IoMdHome />,
                    variant: "secondary"
                },
                {
                    label: "Configurar Precios",
                    href: "/inventario/nuevo",
                    icon: <IoIosAdd />,
                    variant: "primary"
                }
            ]}
        >
            {/* DELETE MODAL */}
            {productToDelete && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isDeleting ? cancelDelete : undefined} />
                    <div className={`relative rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className={`border-b p-6 flex flex-col items-center text-center ${isDark ? 'bg-red-900/10 border-gray-700' : 'bg-red-50/50 border-red-100'}`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
                                <IoMdWarning className={`w-7 h-7 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            </div>
                            <h3 className={`${TYPOGRAPHY.sectionTitle} ${heading}`}>¿Eliminar producto?</h3>
                            <p className={`${TYPOGRAPHY.body} mt-2 ${textTertiary}`}>
                                Estás a punto de eliminar <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>"{productToDelete.nombre}"</span>.
                            </p>
                        </div>
                        <div className="p-5">
                            <div className={`border rounded-xl p-4 flex gap-3 ${isDark ? 'bg-amber-900/10 border-amber-800/40' : 'bg-amber-50 border-amber-100'}`}>
                                <IoMdAlert className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                                <div className={`${TYPOGRAPHY.body} ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                                    <p className="font-semibold mb-1">Acción irreversible</p>
                                    <ul className={`list-disc list-inside space-y-0.5 opacity-90 ${TYPOGRAPHY.small}`}>
                                        <li>Se eliminará el producto del inventario</li>
                                        <li>Se perderá el stock actual</li>
                                        <li>Se borrará el historial de movimientos</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={`p-5 border-t flex gap-3 ${isDark ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                            <button onClick={cancelDelete} disabled={isDeleting}
                                className={`flex-1 px-4 py-2.5 border font-medium rounded-xl transition-all disabled:opacity-50 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                                Cancelar
                            </button>
                            <button onClick={confirmDelete} disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                                {isDeleting ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Eliminando...</>
                                ) : (
                                    <><IoMdTrash className="w-4 h-4" /> Sí, eliminar</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BARCODE MODAL */}
            {showBarcodeModal && selectedProduct && (
                <BarcodeModal
                    product={selectedProduct}
                    onClose={closeBarcodeModal}
                    onBarcodeGenerated={() => { closeBarcodeModal(); window.location.reload(); }}
                    isDark={isDark} heading={heading}
                />
            )}

            {/* PRODUCT DETAIL MODAL */}
            {showDetailModal && detailProduct && (
                <ProductDetailModal
                    product={detailProduct}
                    onClose={closeDetailModal}
                    isDark={isDark}
                    onOpenBarcode={() => openBarcodeModal(detailProduct)}
                />
            )}

            {/* KPI CARDS */}
            <StatsGrid columns={4}>
                <StatCard
                    label="Total Productos"
                    value={stats.totalProducts.toString()}
                    icon={<IoIosCube className="w-5 h-5" />}
                    accent
                />
                <StatCard
                    label="Valor Total"
                    value={`S/ ${stats.totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                    icon={<IoIosStats className="w-5 h-5" />}
                />
                <StatCard
                    label="Stock Bajo"
                    value={stats.lowStockCount.toString()}
                    icon={<IoIosPulse className="w-5 h-5" />}
                />
                <StatCard
                    label="Sin Stock"
                    value={stats.outOfStockCount.toString()}
                    icon={<IoMdWarning className="w-5 h-5" />}
                />
            </StatsGrid>

                {/* SEARCH & FILTER BAR */}
                <div className={`rounded-2xl border p-3 mb-6 sticky top-4 z-30 backdrop-blur-xl shadow-lg ${
                    isDark ? 'bg-[#171717]/95 border-neutral-800' : 'bg-white/95 border-gray-200'
                }`}>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <IoIosSearch className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                placeholder="Buscar por nombre, SKU o código de barras..."
                                className={`w-full pl-12 pr-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                                    isDark
                                        ? 'bg-neutral-800 text-white placeholder-gray-500 focus:ring-[#E0312A]/30'
                                        : 'bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-[#E0312A]/20'
                                }`}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                                        isDark ? 'hover:bg-neutral-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'
                                    }`}
                                >
                                    <FiX size={14} />
                                </button>
                            )}
                        </div>
                        <div className={`hidden sm:block w-px my-1 ${isDark ? 'bg-neutral-700' : 'bg-gray-200'}`} />
                        <select
                            className={`sm:w-60 px-4 py-3 rounded-xl text-sm cursor-pointer transition-all focus:outline-none focus:ring-2 ${
                                isDark
                                    ? 'bg-neutral-800 text-gray-200 focus:ring-[#E0312A]/30'
                                    : 'bg-gray-50 text-gray-700 focus:ring-[#E0312A]/20'
                            }`}
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="all">Todas las categorías</option>
                            {categories.filter(c => c !== 'all').map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* PRODUCT COUNT */}
                <div className={`flex items-center justify-between mb-4`}>
                    <p className={`text-xs font-medium ${textTertiary}`}>
                        {filteredProducts.length > 0 ? (
                            <>
                                Mostrando <span className="font-bold text-[#E0312A]">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> de <span className="font-bold">{filteredProducts.length}</span> producto{filteredProducts.length !== 1 ? 's' : ''}
                                {(searchTerm || filterCategory !== 'all') && ' (filtrado)'}
                            </>
                        ) : (
                            'Sin productos'
                        )}
                    </p>
                    {totalPages > 1 && (
                        <p className={`text-xs font-medium ${textTertiary}`}>
                            Página <span className="font-bold text-[#E0312A]">{currentPage}</span> de <span className="font-bold">{totalPages}</span>
                        </p>
                    )}
                </div>

            {/* PRODUCT GRID */}
            {filteredProducts.length === 0 ? (
                <EmptyState
                    icon={<IoIosCube className="w-12 h-12" />}
                    title="No se encontraron productos"
                    description="Intenta ajustar los filtros o tu búsqueda"
                />
            ) : (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {paginatedProducts.map((product) => {
                            const margin = product.precioCompra > 0 ? ((product.precioVenta - product.precioCompra) / product.precioCompra) * 100 : 0;
                            const statusConfig = getStockStatusConfig(product.stockActual, product.stockMinimo, isDark);
                            const stockPercent = product.stockMaximo > 0 ? Math.min((product.stockActual / product.stockMaximo) * 100, 100) : 0;

                            return (
                                <div
                                    key={product.id}
                                    className={`group rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${
                                        isDark
                                            ? 'bg-[#171717] border-neutral-800 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/30'
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-200/60'
                                    }`}
                                    onClick={() => openDetailModal(product)}
                                >
                                    {/* IMAGE */}
                                    <div className={`relative h-40 overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}`}>
                                        {/* Category Badge */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md ${
                                                isDark ? 'bg-black/50 text-gray-200 border border-neutral-700' : 'bg-white/80 text-gray-700 border border-gray-200'
                                            }`}>
                                                {product.categoriaNombre}
                                            </span>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusConfig.color}`}>
                                            <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor} animate-pulse`} />
                                            {statusConfig.label}
                                        </div>

                                        {/* Quick View Overlay */}
                                        <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ${isDark ? 'bg-black/60' : 'bg-black/40'}`}>
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-900 font-semibold text-sm shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                                                <FiEye size={16} />
                                                Ver Detalle
                                            </div>
                                        </div>

                                        <div className="w-full h-full flex items-center justify-center p-6">
                                            <ProductImage
                                                imagen={product.imagen}
                                                nombre={product.nombre}
                                                className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${isDark ? '' : 'mix-blend-multiply'}`}
                                                isDark={isDark}
                                            />
                                        </div>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        {/* Name & SKU */}
                                        <h3 className={`font-bold text-sm leading-tight line-clamp-2 mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`} title={product.nombre}>
                                            {product.nombre}
                                        </h3>
                                        <p className={`text-[11px] font-mono mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            SKU: {product.sku}
                                        </p>

                                        {/* Price Row */}
                                        <div className={`flex items-center justify-between mb-3 pb-3 border-b ${isDark ? 'border-neutral-700' : 'border-gray-100'}`}>
                                            <div>
                                                <p className={`text-[10px] uppercase font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Precio</p>
                                                <p className="text-xl font-black text-[#E0312A]">
                                                    S/ {product.precioVenta.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-[10px] uppercase font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Margen</p>
                                                <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${
                                                    margin > 30
                                                        ? (isDark ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-600 bg-emerald-50')
                                                        : margin > 15
                                                            ? (isDark ? 'text-amber-400 bg-amber-900/30' : 'text-amber-600 bg-amber-50')
                                                            : (isDark ? 'text-gray-400 bg-neutral-700' : 'text-gray-500 bg-gray-100')
                                                }`}>
                                                    +{margin.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stock Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Stock
                                                </span>
                                                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {product.stockActual}
                                                    <span className={`font-normal text-xs ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        / {product.stockMaximo}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-neutral-700' : 'bg-gray-100'}`}>
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${statusConfig.barColor}`}
                                                    style={{ width: `${stockPercent}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Quick Info */}
                                        <div className={`flex items-center gap-2 text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <FiTruck size={12} />
                                            <span className="truncate flex-1">{product.proveedorRazonSocial || 'Sin proveedor'}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => openDetailModal(product)}
                                                className={`flex-1 inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                                                    isDark
                                                        ? 'border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:border-neutral-500'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                                }`}
                                            >
                                                <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                                Ver
                                            </button>
                                            <Link
                                                to={`/inventario/movimientos/${product.id}`}
                                                className={`flex-1 inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                                                    isDark
                                                        ? 'border-neutral-600 text-gray-300 hover:bg-neutral-700 hover:border-neutral-500'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                                }`}
                                            >
                                                <IoMdRefresh className="w-3.5 h-3.5 mr-1.5" />
                                                Movim.
                                            </Link>
                                            <button
                                                onClick={() => openBarcodeModal(product)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-sm bg-[#E0312A] hover:bg-[#A91E16]"
                                            >
                                                <IoMdBarcode className="w-3.5 h-3.5 mr-1.5" />
                                                Código
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* ── PAGINATION ── */}
                {totalPages > 1 && (
                    <div className={`mt-6 p-4 rounded-xl border ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}`}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Info de paginación */}
                            <p className={`text-sm ${textMuted}`}>
                                Mostrando <span className="font-semibold text-[#E0312A]">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-semibold text-[#E0312A]">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> de <span className="font-semibold">{filteredProducts.length}</span> productos
                            </p>

                            {/* Controles de paginación */}
                            <div className="flex items-center gap-1">
                                {/* Primera página */}
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg transition-all ${
                                        currentPage === 1
                                            ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                                            : isDark ? 'text-gray-400 hover:bg-neutral-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                    title="Primera página"
                                >
                                    <FiChevronsLeft size={18} />
                                </button>

                                {/* Anterior */}
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg transition-all ${
                                        currentPage === 1
                                            ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                                            : isDark ? 'text-gray-400 hover:bg-neutral-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                    title="Página anterior"
                                >
                                    <FiChevronLeft size={18} />
                                </button>

                                {/* Números de página */}
                                <div className="flex items-center gap-1 mx-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => {
                                            if (totalPages <= 5) return true;
                                            if (page === 1 || page === totalPages) return true;
                                            if (Math.abs(page - currentPage) <= 1) return true;
                                            return false;
                                        })
                                        .map((page, idx, arr) => (
                                            <React.Fragment key={page}>
                                                {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                    <span className={`px-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>...</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                                                        currentPage === page
                                                            ? 'bg-[#E0312A] text-white shadow-md'
                                                            : isDark
                                                                ? 'text-gray-400 hover:bg-neutral-700 hover:text-white'
                                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        ))}
                                </div>

                                {/* Siguiente */}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg transition-all ${
                                        currentPage === totalPages
                                            ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                                            : isDark ? 'text-gray-400 hover:bg-neutral-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                    title="Página siguiente"
                                >
                                    <FiChevronRight size={18} />
                                </button>

                                {/* Última página */}
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg transition-all ${
                                        currentPage === totalPages
                                            ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                                            : isDark ? 'text-gray-400 hover:bg-neutral-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                    title="Última página"
                                >
                                    <FiChevronsRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                </>
            )}
        </PageWrapper>
    );
}
