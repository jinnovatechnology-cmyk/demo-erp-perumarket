import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    IoIosArrowUp, IoIosArrowDown, IoIosCube,
    IoIosSwap, IoIosUndo, IoIosSettings, IoIosTime
} from 'react-icons/io';
import { FiActivity } from 'react-icons/fi';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { inventoryService, type MovimientoInventario } from '../../services/inventario/inventoryService';
import type { Product } from '../../types/inventario/inventory';
import PageWrapper from '../../components/ui/PageWrapper';

const PAGE_SIZE = 10;

const TIPO_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; colorDark: string; sign: string }> = {
    ENTRADA: {
        label: 'Entrada',
        icon: <IoIosArrowDown className="w-4 h-4" />,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        colorDark: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50',
        sign: '+'
    },
    SALIDA: {
        label: 'Salida',
        icon: <IoIosArrowUp className="w-4 h-4" />,
        color: 'bg-red-50 text-red-700 border-red-200',
        colorDark: 'bg-red-900/30 text-red-400 border-red-700/50',
        sign: '-'
    },
    AJUSTE: {
        label: 'Ajuste',
        icon: <IoIosSettings className="w-4 h-4" />,
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        colorDark: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
        sign: ''
    },
    DEVOLUCION: {
        label: 'Devolución',
        icon: <IoIosUndo className="w-4 h-4" />,
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        colorDark: 'bg-purple-900/30 text-purple-400 border-purple-700/50',
        sign: '+'
    },
};

function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function getRelativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSec < 60) return 'Hace un momento';
    if (diffMin === 1) return 'Hace 1 min';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHrs === 1) return 'Hace 1 hora';
    if (diffHrs < 24) return `Hace ${diffHrs} horas`;
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffWeeks === 1) return 'Hace 1 semana';
    if (diffWeeks < 4) return `Hace ${diffWeeks} semanas`;
    if (diffMonths === 1) return 'Hace 1 mes';
    if (diffMonths < 12) return `Hace ${diffMonths} meses`;
    return formatDate(dateStr);
}

// --- Skeleton loader component ---
const SkeletonCard = ({ isDark }: { isDark: boolean }) => (
    <div className={`rounded-2xl border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="animate-pulse flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className="flex-1 space-y-2">
                <div className={`h-4 rounded-lg w-1/3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div className={`h-3 rounded-lg w-2/3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div className={`h-3 rounded-lg w-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
        </div>
    </div>
);

export default function InventoryMovements() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isDark, heading, textTertiary } = useThemeClasses();

    const [product, setProduct] = useState<Product | null>(null);
    const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [page, setPage] = useState(0);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [prod, movs] = await Promise.all([
                    inventoryService.getProductById(Number(id)),
                    inventoryService.getMovimientos(Number(id))
                ]);
                setProduct(prod);
                setMovimientos(movs);
            } catch (err: any) {
                console.error('Error:', err);
                setError(err.message || 'Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Reset page when filter changes
    useEffect(() => {
        setPage(0);
    }, [filterType]);

    const stats = useMemo(() => {
        const entradas = movimientos.filter(m => m.tipoMovimiento === 'ENTRADA' || m.tipoMovimiento === 'DEVOLUCION');
        const salidas = movimientos.filter(m => m.tipoMovimiento === 'SALIDA');
        return {
            total: movimientos.length,
            entradas: entradas.reduce((s, m) => s + m.cantidad, 0),
            salidas: salidas.reduce((s, m) => s + m.cantidad, 0),
            stockActual: product?.stockActual ?? 0,
        };
    }, [movimientos, product]);

    const filtered = useMemo(() => {
        if (filterType === 'all') return movimientos;
        return movimientos.filter(m => m.tipoMovimiento === filterType);
    }, [movimientos, filterType]);

    // Pagination derived values
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginatedItems = useMemo(() => {
        const start = page * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    const rangeStart = filtered.length === 0 ? 0 : page * PAGE_SIZE + 1;
    const rangeEnd = Math.min((page + 1) * PAGE_SIZE, filtered.length);

    const pageSubtitle = product
        ? `${product.nombre} · SKU: ${product.sku} — Peru Market`
        : 'Historial de movimientos de inventario — Peru Market';

    if (loading) return (
        <PageWrapper
            title="Movimientos"
            subtitle="Historial de movimientos de inventario — Peru Market"
            icon={<FiActivity />}
            actions={[{ label: 'Volver', href: '/inventario', variant: 'secondary' }]}
        >
            <div className="space-y-3">
                {[0, 1, 2, 3].map(i => (
                    <SkeletonCard key={i} isDark={isDark} />
                ))}
            </div>
        </PageWrapper>
    );

    if (error) return (
        <PageWrapper
            title="Movimientos"
            subtitle="Historial de movimientos de inventario — Peru Market"
            icon={<FiActivity />}
            actions={[{ label: 'Volver', href: '/inventario', variant: 'secondary' }]}
        >
            <div className={`max-w-xl mt-4 border rounded-2xl p-6 ${isDark ? 'bg-red-900/20 border-red-800/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                <p className="font-bold mb-1">Error</p>
                <p className="text-sm">{error}</p>
                <button onClick={() => navigate('/inventario')} className="inline-block mt-4 text-sm underline">Volver al inventario</button>
            </div>
        </PageWrapper>
    );

    return (
        <PageWrapper
            title="Movimientos"
            subtitle={pageSubtitle}
            icon={<FiActivity />}
            actions={[{ label: 'Volver', href: '/inventario', variant: 'secondary' }]}
        >
        <div className="space-y-6">

                {/* KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <MiniKPI
                        label="Total Movimientos" value={stats.total}
                        icon={<IoIosSwap className="w-5 h-5" />}
                        accent={isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-600 bg-indigo-50'}
                        isDark={isDark}
                    />
                    <MiniKPI
                        label="Entradas" value={`+${stats.entradas}`}
                        icon={<IoIosArrowDown className="w-5 h-5" />}
                        accent={isDark ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-50'}
                        isDark={isDark}
                    />
                    <MiniKPI
                        label="Salidas" value={`-${stats.salidas}`}
                        icon={<IoIosArrowUp className="w-5 h-5" />}
                        accent={isDark ? 'text-red-400 bg-red-500/10' : 'text-red-600 bg-red-50'}
                        isDark={isDark}
                    />
                    <MiniKPI
                        label={`Stock Actual${product?.unidadMedida && product.unidadMedida !== 'UNIDAD' ? ` (${product.unidadMedida})` : ''}`} value={stats.stockActual}
                        icon={<IoIosCube className="w-5 h-5" />}
                        accent={isDark ? 'text-amber-400 bg-amber-500/10' : 'text-amber-600 bg-amber-50'}
                        isDark={isDark}
                    />
                </div>

                {/* FILTER TABS */}
                <div className={`flex gap-1.5 p-1 rounded-xl mb-6 overflow-x-auto ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    {[
                        { key: 'all', label: 'Todos' },
                        { key: 'ENTRADA', label: 'Entradas' },
                        { key: 'SALIDA', label: 'Salidas' },
                        { key: 'AJUSTE', label: 'Ajustes' },
                        { key: 'DEVOLUCION', label: 'Devoluciones' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilterType(tab.key)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterType === tab.key
                                ? (isDark ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm')
                                : (isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* MOVEMENTS LIST */}
                {filtered.length === 0 ? (
                    <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <IoIosSwap className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                        <h3 className={`font-semibold mb-1 ${heading}`}>Sin movimientos</h3>
                        <p className={`text-sm mb-4 ${textTertiary}`}>
                            {filterType === 'all' ? 'Este producto aún no tiene movimientos registrados' : 'No hay movimientos de este tipo'}
                        </p>
                        <button
                            onClick={() => navigate('/inventario')}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isDark
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                : 'bg-gray-800 text-white hover:bg-gray-700'
                            }`}
                        >
                            Volver al inventario
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {paginatedItems.map((mov) => {
                                const cfg = TIPO_CONFIG[mov.tipoMovimiento] || TIPO_CONFIG.AJUSTE;
                                return (
                                    <div key={mov.id} className={`rounded-2xl border p-4 transition-all hover:shadow-md ${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                            {/* Type badge + quantity */}
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`p-2.5 rounded-xl border ${isDark ? cfg.colorDark : cfg.color}`}>
                                                    {cfg.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{cfg.label}</span>
                                                        <span className={`text-lg font-extrabold ${mov.tipoMovimiento === 'SALIDA' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                            {cfg.sign}{mov.cantidad}{product?.unidadMedida && product.unidadMedida !== 'UNIDAD' ? ` ${product.unidadMedida}` : ''}
                                                        </span>
                                                    </div>
                                                    {mov.motivo && (
                                                        <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{mov.motivo}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Stock change + date */}
                                            <div className="flex items-center gap-4 sm:gap-6">
                                                <div className="text-center">
                                                    <p className={`text-[10px] font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Anterior</p>
                                                    <p className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{mov.stockAnterior}</p>
                                                </div>
                                                <div className={`text-lg ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>&rarr;</div>
                                                <div className="text-center">
                                                    <p className={`text-[10px] font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Nuevo</p>
                                                    <p className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{mov.stockNuevo}</p>
                                                </div>
                                                <div className={`hidden sm:block w-px h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                                <div className="text-right sm:min-w-[110px]">
                                                    <div className={`flex items-center gap-1 text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        <IoIosTime className="w-3 h-3" />
                                                        {getRelativeTime(mov.fechaMovimiento)}
                                                    </div>
                                                    <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {formatDate(mov.fechaMovimiento)} {formatTime(mov.fechaMovimiento)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Extra info */}
                                        {(mov.nombreAlmacen || mov.referencia) && (
                                            <div className={`mt-2.5 pt-2.5 border-t text-xs flex gap-4 ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
                                                {mov.nombreAlmacen && (
                                                    <span>Almacén: <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{mov.nombreAlmacen}</span></span>
                                                )}
                                                {mov.referencia && (
                                                    <span>Ref: <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{mov.referencia}</span></span>
                                                )}
                                                {mov.idUsuario && (
                                                    <span>Usuario ID: <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{mov.idUsuario}</span></span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className={`mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Mostrando {rangeStart}-{rangeEnd} de {filtered.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${page === 0
                                            ? (isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                                            : (isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                                        }`}
                                    >
                                        Anterior
                                    </button>
                                    <span className={`text-xs font-medium px-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {page + 1} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${page >= totalPages - 1
                                            ? (isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                                            : (isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                                        }`}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
        </div>
        </PageWrapper>
    );
}

// --- Sub component ---
const MiniKPI = ({ label, value, icon, accent, isDark }: {
    label: string; value: string | number; icon: React.ReactNode; accent: string; isDark: boolean;
}) => (
    <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${accent}`}>
                {icon}
            </div>
            <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
                <p className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{value}</p>
            </div>
        </div>
    </div>
);
