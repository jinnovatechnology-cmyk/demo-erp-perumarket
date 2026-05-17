import { Link } from 'react-router-dom';
import {
    IoMdAdd,
    IoIosPin,
    IoIosPeople,
    IoIosCube,
    IoIosStats,
    IoMdCreate,
    IoIosSave,
    IoIosWarning,
    IoIosCheckmarkCircle,
    IoIosSearch
} from 'react-icons/io';
import { FiArchive } from 'react-icons/fi';

import { useWarehouseList } from '../../hooks/inventario/useWarehouseList';
import { useWarehouseEdit } from '../../hooks/inventario/useWarehouseEdit';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import PageWrapper from '../../components/ui/PageWrapper';

export default function InventoryAlmacenes() {
    const { isDark, colors, card, heading, textSecondary, textTertiary, input, shadow, modalOverlay, modalContent, subtleBg, divider, btnSecondary, statusActive, statusInactive, searchBg } = useThemeClasses();

    // 1. Hook de Lista y Datos
    const {
        warehouses,
        setWarehouses,
        loading,
        error,
        totalProductTypes,
        activeWarehouses,
        totalProductUnits,
        searchTerm,
        setSearchTerm,
        filteredWarehouses
    } = useWarehouseList();

    // 2. Hook de Edición (necesita acceso a warehouses y setWarehouses para actualizar la lista)
    const {
        showEditModal,
        selectedWarehouse,
        notification,
        handleOpenEditModal,
        handleCloseEditModal,
        handleFormChange,
        handleUpdateWarehouse
    } = useWarehouseEdit(warehouses, setWarehouses);

    // Helper para color de capacidad
    const getCapacityColor = (percentage: number) => {
        if (percentage > 80) return 'text-red-500';
        if (percentage > 50) return 'text-yellow-500';
        return 'text-green-500';
    };

    // Skeleton Loading State
    if (loading) return (
        <PageWrapper
            title="Gestión de Almacenes"
            subtitle="Administre las ubicaciones de almacenamiento — Peru Market"
            icon={<FiArchive />}
            actions={[
                { label: 'Nuevo Almacén', href: '/inventario/almacenes/nuevo', icon: <IoMdAdd />, variant: 'primary' },
                { label: 'Volver', href: '/inventario', variant: 'secondary' },
            ]}
        >
            <div className="space-y-6">
            {/* KPI Skeleton Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`${card} rounded-lg p-6 ${shadow} border`}>
                        <div className={`h-8 w-16 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-2`} />
                        <div className={`h-4 w-32 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                    </div>
                ))}
            </div>
            {/* Search Skeleton */}
            <div className={`${card} rounded-lg p-4 ${shadow} border`}>
                <div className={`h-10 w-full rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
            </div>
            {/* Warehouse Card Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`${card} rounded-lg ${shadow} border overflow-hidden`}>
                        <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className={`h-6 w-40 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-2`} />
                            <div className={`h-4 w-28 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                        </div>
                        <div className="p-4 space-y-3">
                            <div className={`h-4 w-full rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                            <div className={`h-4 w-3/4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                            <div className={`h-4 w-1/2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                            <div className={`h-2 w-full rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mt-4`} />
                            <div className="flex gap-2 mt-4">
                                <div className={`h-9 flex-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                                <div className={`h-9 flex-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            </div>
        </PageWrapper>
    );

    if (error) return (
        <PageWrapper
            title="Gestión de Almacenes"
            subtitle="Administre las ubicaciones de almacenamiento — Peru Market"
            icon={<FiArchive />}
            actions={[
                { label: 'Nuevo Almacén', href: '/inventario/almacenes/nuevo', icon: <IoMdAdd />, variant: 'primary' },
                { label: 'Volver', href: '/inventario', variant: 'secondary' },
            ]}
        >
            <div className={`p-6 text-center text-red-600 border ${isDark ? 'border-red-700 bg-red-900/20' : 'border-red-300 bg-red-50'} rounded-lg`}>Error: {error}</div>
        </PageWrapper>
    );

    return (
        <PageWrapper
            title="Gestión de Almacenes"
            subtitle="Administre las ubicaciones de almacenamiento — Peru Market"
            icon={<FiArchive />}
            actions={[
                { label: 'Nuevo Almacén', href: '/inventario/almacenes/nuevo', icon: <IoMdAdd />, variant: 'primary' },
                { label: 'Volver', href: '/inventario', variant: 'secondary' },
            ]}
        >
        <div className="space-y-6">

            {/* Notificacion */}
            {notification && (
                <div
                    className={`fixed top-5 right-5 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 transition-all duration-300 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ animation: 'slideInRight 0.3s ease-out' }}
                >
                    {notification.type === 'success' ? <IoIosCheckmarkCircle className="w-6 h-6" /> : <IoIosWarning className="w-6 h-6" />}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Slide-in animation keyframes */}
            <style>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>

            {/* Tarjetas de Resumen Dinamicas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`${card} rounded-lg p-6 ${shadow} border`}>
                    <div className={`text-2xl font-bold ${heading}`}>{warehouses.length}</div>
                    <div className={`${textTertiary} flex items-center gap-2`}>
                        <IoIosPin className="w-4 h-4" />
                        Total Almacenes
                    </div>
                </div>
                <div className={`${card} rounded-lg p-6 ${shadow} border`}>
                    <div className={`text-2xl font-bold ${heading}`}>{totalProductTypes}</div>
                    <div className={`${textTertiary} flex items-center gap-2`}>
                        <IoIosCube className="w-4 h-4" />
                        Tipos de Productos
                    </div>
                </div>
                <div className={`${card} rounded-lg p-6 ${shadow} border`}>
                    <div className={`text-2xl font-bold ${heading}`}>{activeWarehouses}</div>
                    <div className={`${textTertiary} flex items-center gap-2`}>
                        <IoIosPeople className="w-4 h-4" />
                        Almacenes Activos
                    </div>
                </div>
                <div className={`${card} rounded-lg p-6 ${shadow} border`}>
                    <div className={`text-2xl font-bold ${heading}`}>{totalProductUnits.toFixed(0)}</div>
                    <div className={`${textTertiary} flex items-center gap-2`}>
                        <IoIosStats className="w-4 h-4" />
                        Stock Total
                    </div>
                </div>
            </div>

            {/* Barra de Busqueda */}
            <div className={`${card} rounded-lg p-4 ${shadow} border col-span-1 md:col-span-4 mb-6`}>
                <div className="relative">
                    <IoIosSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textTertiary}`} />
                    <input
                        placeholder="Buscar Almacen por nombre o codigo..."
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg ${searchBg} focus:ring-2`}
                        style={{ '--tw-ring-color': colors[500] } as React.CSSProperties}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Lista de Almacenes o Estado Vacio */}
            {filteredWarehouses.length === 0 ? (
                <div className={`${card} rounded-lg ${shadow} border p-12 flex flex-col items-center justify-center text-center`}>
                    <IoIosCube className={`w-16 h-16 mb-4 ${textTertiary}`} />
                    <h3 className={`text-xl font-semibold ${heading} mb-2`}>Sin almacenes</h3>
                    <p className={`${textTertiary} mb-6 max-w-md`}>No se encontraron almacenes con los filtros aplicados</p>
                    <Link
                        to="/inventario/almacenes/nuevo"
                        className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 transform active:scale-[0.98]"
                        style={{ backgroundColor: colors[600] }}
                    >
                        <IoMdAdd className="w-5 h-5" />
                        Crear Nuevo Almacen
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWarehouses.map((warehouse) => {
                        const capacityPercentage = warehouse.capacityTotalUnits > 0
                            ? Math.round((warehouse.capacityUsed / warehouse.capacityTotalUnits) * 100)
                            : 0;
                        const progressBarColor = capacityPercentage > 80 ? 'bg-red-500' : capacityPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500';

                        const capacityUsedM3 = warehouse.capacityTotalUnits > 0
                            ? (warehouse.capacityUsed / warehouse.capacityTotalUnits) * warehouse.capacidadM3
                            : 0;

                        return (
                            <div key={warehouse.id} className={`${card} rounded-lg ${shadow} border overflow-hidden ${isDark ? 'hover:border-gray-600 hover:shadow-lg hover:shadow-black/20' : 'hover:shadow-md'} transition-shadow`}>
                                <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} flex justify-between items-start`}>
                                    <div>
                                        <h3 className={`font-semibold ${heading} text-lg`}>{warehouse.nombre}</h3>
                                        <p className={`text-sm ${textTertiary}`}>Codigo: {warehouse.codigo}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${warehouse.estado === 'ACTIVO' ? statusActive : statusInactive}`}>
                                        {warehouse.estado}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-3 mb-4">
                                        <div className={`flex items-center gap-2 text-sm ${textTertiary}`}>
                                            <IoIosPin className="w-4 h-4" />
                                            {warehouse.direccion}
                                        </div>
                                        <div className={`flex items-center gap-2 text-sm ${textTertiary}`}>
                                            <IoIosPeople className="w-4 h-4" />
                                            Responsable: {warehouse.responsable}
                                        </div>
                                        <div className={`flex items-center gap-2 text-sm ${textTertiary}`}>
                                            <IoIosCube className="w-4 h-4" />
                                            Productos: {warehouse.productsCount}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className={`flex justify-between text-sm ${textTertiary} mb-1`}>
                                            <span>Capacidad Ocupada</span>
                                            <span className={`font-bold ${getCapacityColor(capacityPercentage)}`}>{capacityPercentage}%</span>
                                        </div>
                                        <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                            <div className={`h-2 rounded-full ${progressBarColor}`} style={{ width: `${capacityPercentage}%` }}></div>
                                        </div>
                                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Espacio Ocupado: {capacityUsedM3.toFixed(2)} / {warehouse.capacidadM3} m3</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/inventario/stock/${warehouse.id}`}
                                            className="flex-1 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-all duration-200 transform active:scale-[0.98] text-sm"
                                            style={{ backgroundColor: colors[600] }}
                                        >
                                            <IoIosStats className="w-4 h-4" />
                                            Ver Stock
                                        </Link>
                                        <button
                                            onClick={() => handleOpenEditModal(warehouse)}
                                            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-all duration-200 transform active:scale-[0.98] text-sm ${isDark ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
                                        >
                                            <IoMdCreate className="w-4 h-4" />
                                            Editar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de Edicion */}
            {showEditModal && selectedWarehouse && (
                <div className={modalOverlay}>
                    <div className={`${modalContent} rounded-lg shadow-xl max-w-lg w-full border`}>
                        <div className={`p-4 border-b ${divider} flex justify-between items-center`}>
                            <h3 className={`text-lg font-semibold ${heading}`}>Editar Almacen</h3>
                            <button onClick={handleCloseEditModal} className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'}`}>&#10005;</button>
                        </div>
                        <form onSubmit={handleUpdateWarehouse}>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Nombre</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={selectedWarehouse.nombre}
                                            onChange={handleFormChange}
                                            className={`w-full border rounded-lg px-3 py-2 ${input} focus:ring-2`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Codigo</label>
                                        <input
                                            type="text"
                                            name="codigo"
                                            value={selectedWarehouse.codigo}
                                            onChange={handleFormChange}
                                            className={`w-full border rounded-lg px-3 py-2 ${input} focus:ring-2`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Direccion</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={selectedWarehouse.direccion}
                                        onChange={handleFormChange}
                                        className={`w-full border rounded-lg px-3 py-2 ${input} focus:ring-2`}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Responsable</label>
                                        <input
                                            type="text"
                                            name="responsable"
                                            value={selectedWarehouse.responsable}
                                            onChange={handleFormChange}
                                            className={`w-full border rounded-lg px-3 py-2 ${input} focus:ring-2`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${textSecondary} mb-1`}> Capacidad Total (m3)</label>
                                        <input
                                            type="number"
                                            name="capacidadM3"
                                            value={selectedWarehouse.capacidadM3}
                                            onChange={handleFormChange}
                                            className={`w-full border rounded-lg px-3 py-2 ${input} focus:ring-2`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Estado</label>
                                    <select
                                        name="estado"
                                        value={selectedWarehouse.estado}
                                        onChange={handleFormChange}
                                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 ${selectedWarehouse.estado === 'ACTIVO' ? (isDark ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-50 text-green-800 border-gray-300') : (isDark ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-50 text-red-800 border-gray-300')}`}
                                    >
                                        <option value="ACTIVO">Activo</option>
                                        <option value="INACTIVO">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            <div className={`p-4 border-t ${divider} flex justify-end gap-3 ${subtleBg}`}>
                                <button type="button" onClick={handleCloseEditModal} className={`px-4 py-2 border rounded-lg ${btnSecondary}`}>
                                    Cancelar
                                </button>
                                <button type="submit" className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors" style={{ backgroundColor: colors[600] }}>
                                    <IoIosSave className="w-5 h-5" />
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        </PageWrapper>
    );
}
