import { useState, useMemo } from 'react';
import {
  IoIosPin,
  IoIosCube,
  IoIosStats,
  IoIosSearch,
  IoIosArrowUp,
  IoIosArrowDown
} from 'react-icons/io';
import { FiLayers } from 'react-icons/fi';

import { useStockByWarehouse } from '../../hooks/inventario/useStockByWarehouse';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { StockStatusResult } from '../../types/inventario/stock';
import PageWrapper from '../../components/ui/PageWrapper';

export default function InventoryStockPorAlmacen() {
  const { isDark, colors, card, heading, textSecondary, textTertiary, select, shadow, tableHeader, tableHeaderText, tableCell, searchBg, emptyState } = useThemeClasses();

  const [sortBy, setSortBy] = useState<'nombre' | 'stockActual' | 'sku'>('nombre');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Sorting toggle handler
  const handleSort = (column: 'nombre' | 'stockActual' | 'sku') => {
    if (sortBy === column) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  // Render sort icon for a column header
  const renderSortIcon = (column: 'nombre' | 'stockActual' | 'sku') => {
    if (sortBy !== column) {
      return <IoIosArrowUp className="w-3 h-3 opacity-30 inline-block ml-1" />;
    }
    return sortDir === 'asc'
      ? <IoIosArrowUp className="w-3 h-3 inline-block ml-1" />
      : <IoIosArrowDown className="w-3 h-3 inline-block ml-1" />;
  };

  // Función auxiliar de UI (Pura) - dark mode aware
  const getStatusClasses = (stock: number, minStock: number): StockStatusResult => {
    if (stock === 0) return { text: 'Sin Stock', color: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800' };
    if (stock <= minStock) return { text: 'Stock Bajo', color: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800' };
    return { text: 'Disponible', color: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800' };
  };

  const {
    allWarehouses,
    selectedWarehouse,
    filteredProducts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    handleWarehouseChange,
    stats
  } = useStockByWarehouse();

  // Sorted products
  const sortedProducts = useMemo(() => {
    if (!filteredProducts) return [];
    const sorted = [...filteredProducts].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'nombre') {
        comparison = a.nombre.localeCompare(b.nombre);
      } else if (sortBy === 'sku') {
        comparison = a.sku.localeCompare(b.sku);
      } else if (sortBy === 'stockActual') {
        comparison = a.stockActual - b.stockActual;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredProducts, sortBy, sortDir]);

  // Skeleton shimmer base class
  const shimmerBg = isDark ? 'bg-gray-700' : 'bg-gray-200';
  const shimmerPulse = 'animate-pulse rounded';

  // --- Loading skeleton UI ---
  if (loading) {
    return (
      <PageWrapper
        title="Stock por Almacén"
        subtitle="Visualización detallada de inventario — Peru Market"
        icon={<FiLayers />}
        actions={[{ label: 'Volver', href: '/inventario/almacenes', variant: 'secondary' }]}
      >
        <div className="space-y-6">
        {/* KPI cards skeleton - 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`${card} rounded-lg p-6 ${shadow} border`}>
              <div className={`h-8 w-20 mb-3 ${shimmerBg} ${shimmerPulse}`} />
              <div className={`h-4 w-36 ${shimmerBg} ${shimmerPulse}`} />
            </div>
          ))}
        </div>
        {/* Filter bar skeleton */}
        <div className={`${card} rounded-lg p-4 ${shadow} border`}>
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className={`h-10 w-56 ${shimmerBg} ${shimmerPulse}`} />
            <div className={`h-10 w-64 ${shimmerBg} ${shimmerPulse}`} />
          </div>
        </div>
        {/* Table skeleton - 5 rows */}
        <div className={`${card} rounded-lg ${shadow} border overflow-hidden`}>
          <div className={`${tableHeader} px-6 py-3 flex gap-6`}>
            {['w-32', 'w-20', 'w-24', 'w-16', 'w-20'].map((w, i) => (
              <div key={i} className={`h-4 ${w} ${shimmerBg} ${shimmerPulse}`} />
            ))}
          </div>
          {[...Array(5)].map((_, rowIdx) => (
            <div key={rowIdx} className={`px-6 py-4 flex gap-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex-1 space-y-2">
                <div className={`h-4 w-40 ${shimmerBg} ${shimmerPulse}`} />
                <div className={`h-3 w-24 ${shimmerBg} ${shimmerPulse}`} />
              </div>
              <div className={`h-4 w-20 my-auto ${shimmerBg} ${shimmerPulse}`} />
              <div className={`h-4 w-16 my-auto ${shimmerBg} ${shimmerPulse}`} />
              <div className={`h-4 w-12 my-auto ${shimmerBg} ${shimmerPulse}`} />
              <div className={`h-6 w-20 my-auto rounded-full ${shimmerBg} ${shimmerPulse}`} />
            </div>
          ))}
        </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) return (
    <PageWrapper
      title="Stock por Almacén"
      subtitle="Visualización detallada de inventario — Peru Market"
      icon={<FiLayers />}
      actions={[{ label: 'Volver', href: '/inventario/almacenes', variant: 'secondary' }]}
    >
      <div className={`p-6 text-center text-red-600 border ${isDark ? 'border-red-700 bg-red-900/20' : 'border-red-300 bg-red-50'} rounded-lg`}>Error: {error}</div>
    </PageWrapper>
  );

  if (!selectedWarehouse) return (
    <PageWrapper
      title="Stock por Almacén"
      subtitle="Visualización detallada de inventario — Peru Market"
      icon={<FiLayers />}
      actions={[{ label: 'Volver', href: '/inventario/almacenes', variant: 'secondary' }]}
    >
      <div className={`p-6 text-center ${textTertiary}`}>No se encontró el almacén seleccionado.</div>
    </PageWrapper>
  );

  return (
    <PageWrapper
      title="Stock por Almacén"
      subtitle="Visualización detallada de inventario — Peru Market"
      icon={<FiLayers />}
      actions={[{ label: 'Volver', href: '/inventario/almacenes', variant: 'secondary' }]}
    >
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${card} rounded-lg p-6 ${shadow} border`}>
          <div className={`text-2xl font-bold ${heading}`}>{filteredProducts.length}</div>
          <div className={`flex items-center gap-2 text-sm ${textTertiary}`}>
            <IoIosCube className="w-5 h-5 text-purple-500" />
            <span>Productos Almacenados</span>
          </div>
        </div>
        <div className={`${card} rounded-lg p-6 ${shadow} border`}>
          <div className={`text-2xl font-bold ${heading}`}>{stats.totalStock}</div>
          <div className={`flex items-center gap-2 text-sm ${textTertiary}`}>
            <IoIosStats className="w-5 h-5" style={{ color: colors[600] }} />
            <span>Unidades Totales</span>
          </div>
        </div>
        <div className={`${card} rounded-lg p-6 ${shadow} border`}>
          <div className={`text-2xl font-bold ${heading}`}>S/{stats.totalValue.toFixed(2)}</div>
          <div className={`flex items-center gap-2 text-sm ${textTertiary}`}>
            <IoIosStats className="w-5 h-5" style={{ color: colors[500] }} />
            <span>Valor Total de Stock</span>
          </div>
        </div>
        <div className={`${card} rounded-lg p-6 ${shadow} border`}>
          <div className={`text-sm font-medium ${textTertiary}`}>Ubicación principal</div>
          <div className="flex items-center gap-2 mt-1">
            <IoIosPin className="w-5 h-5 text-red-500" />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>{selectedWarehouse?.direccion || 'Sin dirección registrada'}</p>
          </div>
        </div>
      </div>

      <div className={`${card} rounded-lg p-4 ${shadow} border mb-6`}>
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex items-center gap-3">
            <label className={`block text-sm font-medium ${textSecondary}`}>Filtrar por Almacén:</label>
            <select
              className={`border rounded-lg px-3 py-2 ${select}`}
              value={selectedWarehouse?.id}
              onChange={handleWarehouseChange}
            >
              {allWarehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nombre} ({w.codigo})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 max-w-sm relative">
            <IoIosSearch className={`w-5 h-5 absolute left-3 top-2.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              placeholder="Buscar Producto, SKU..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${searchBg} focus:ring-2`}
              style={{ '--tw-ring-color': colors[500] } as React.CSSProperties}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Product count summary */}
      <div className={`mb-4 text-sm ${textTertiary}`}>
        Mostrando {filteredProducts.length} producto(s)
      </div>

      {/* Desktop table view */}
      <div className={`hidden lg:block ${card} rounded-lg ${shadow} border overflow-x-auto`}>
        <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={tableHeader}>
            <tr>
              <th
                className={`px-6 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase tracking-wider cursor-pointer select-none hover:opacity-80`}
                onClick={() => handleSort('nombre')}
              >
                Producto {renderSortIcon('nombre')}
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase tracking-wider cursor-pointer select-none hover:opacity-80`}
                onClick={() => handleSort('sku')}
              >
                SKU {renderSortIcon('sku')}
              </th>
              <th
                className={`px-6 py-3 text-center text-xs font-medium ${tableHeaderText} uppercase tracking-wider cursor-pointer select-none hover:opacity-80`}
                onClick={() => handleSort('stockActual')}
              >
                Stock Actual {renderSortIcon('stockActual')}
              </th>
              <th className={`px-6 py-3 text-center text-xs font-medium ${tableHeaderText} uppercase tracking-wider`}>Mínimo</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase tracking-wider`}>Estado</th>
            </tr>
          </thead>
          <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => {
                const status = getStatusClasses(product.stockActual, product.stockMinimo);
                return (
                  <tr key={product.id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${heading}`}>
                      {product.nombre}
                      <div className={`text-xs ${textTertiary}`}>{product.categoria}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tableCell}`}>{product.sku}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-center text-sm font-bold ${heading}`}>
                      {product.stockActual} {product.unidad}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${tableCell}`}>{product.stockMinimo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-16">
                  <div className="flex flex-col items-center justify-center">
                    <IoIosCube className={`w-16 h-16 mb-4 ${emptyState}`} />
                    <h3 className={`text-lg font-semibold mb-1 ${heading}`}>No se encontraron productos</h3>
                    <p className={`text-sm ${textTertiary}`}>
                      No hay productos en el almacén "{selectedWarehouse?.nombre || 'N/A'}" que coincidan con los filtros aplicados.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="block lg:hidden space-y-3">
        {sortedProducts.length > 0 ? (
          sortedProducts.map((product) => {
            const status = getStatusClasses(product.stockActual, product.stockMinimo);
            return (
              <div
                key={product.id}
                className={`${card} rounded-2xl p-4 ${shadow} border`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold truncate ${heading}`}>{product.nombre}</h3>
                    <p className={`text-xs ${textTertiary} mt-0.5`}>{product.categoria}</p>
                  </div>
                  <span className={`ml-2 px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${status.color}`}>
                    {status.text}
                  </span>
                </div>
                <div className={`flex items-center justify-between mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className={`text-xs ${textTertiary}`}>
                    SKU: <span className={`font-medium ${tableCell}`}>{product.sku}</span>
                  </div>
                  <div className={`text-sm font-bold ${heading}`}>
                    {product.stockActual}{' '}
                    <span className={`text-xs font-normal ${textTertiary}`}>{product.unidad}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={`${card} rounded-2xl p-8 ${shadow} border`}>
            <div className="flex flex-col items-center justify-center">
              <IoIosCube className={`w-16 h-16 mb-4 ${emptyState}`} />
              <h3 className={`text-lg font-semibold mb-1 ${heading}`}>No se encontraron productos</h3>
              <p className={`text-sm text-center ${textTertiary}`}>
                No hay productos en el almacén "{selectedWarehouse?.nombre || 'N/A'}" que coincidan con los filtros aplicados.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </PageWrapper>
  );
}
