import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  IoMdPrint, IoMdPin, IoIosCall, IoIosMail, IoMdCopy,
  IoIosListBox, IoMdCheckmarkCircle,
  IoMdClose, IoMdCreate, IoIosArrowBack, IoMdImage
} from "react-icons/io";
import { FiShoppingBag, FiPackage, FiTruck, FiDollarSign, FiUser, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { supabase } from '../../services/api';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { PageWrapper, LoadingState, TYPOGRAPHY } from '../../components/ui/PageWrapper';

// --- CONFIGURACIÓN ---
const API_URL = 'http://localhost:8080';

// --- INTERFACES ---
interface Producto {
  id: number;
  nombre: string;
  sku: string;
  unidadMedida: string;
  imagen?: string;
}

interface DetalleCompra {
  id: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: Producto;
}

interface CompraDetail {
  id: number;
  numeroComprobante: string;
  tipoComprobante: string;
  fechaCompra: string;
  estado: string;
  metodoPago: string;
  observaciones: string;
  subtotal: number;
  igv: number;
  total: number;
  proveedor: {
    razonSocial: string;
    ruc: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
  };
  almacen: {
    nombre: string;
    direccion: string;
  };
  usuario: {
    username: string;
  };
  detalles: DetalleCompra[];
}

// --- COMPONENTE PRINCIPAL ---
export default function PurchaseHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [compra, setCompra] = useState<CompraDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isDark, heading, textTertiary, card, borderLight, tableHeader, tableHeaderText } = useThemeClasses();

  // Modal para cambiar estado
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [savingState, setSavingState] = useState(false);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const { data, error: sbError } = await supabase
          .from('compra')
          .select(`
            id, numero_comprobante, tipo_comprobante, fecha, estado,
            metodo_pago, observaciones, subtotal, igv, total,
            proveedor:id_proveedor ( razon_social, ruc, telefono, correo, direccion ),
            almacen:id_almacen ( nombre, direccion ),
            usuario:id_usuario ( username ),
            detalles:detalle_compra (
              id, cantidad, precio_unitario, subtotal,
              producto:id_producto ( id, nombre, sku, unidad_medida, imagen )
            )
          `)
          .eq('id', Number(id))
          .single();
        if (sbError) throw sbError;
        type CompraRaw = {
          id: number;
          numero_comprobante: string | null;
          tipo_comprobante: string | null;
          fecha: string | null;
          estado: string;
          metodo_pago: string | null;
          observaciones: string | null;
          subtotal: number | null;
          igv: number | null;
          total: number | null;
          proveedor: { razon_social: string | null; ruc: string | null; telefono: string | null; correo: string | null; direccion: string | null } | null;
          almacen: { nombre: string | null; direccion: string | null } | null;
          usuario: { username: string | null } | null;
          detalles: Array<{
            id: number;
            cantidad: number;
            precio_unitario: number | null;
            subtotal: number | null;
            producto: { id: number; nombre: string | null; sku: string | null; unidad_medida: string | null; imagen: string | null } | null;
          }>;
        };
        const r = data as unknown as CompraRaw;
        setCompra({
          id: r.id,
          numeroComprobante: r.numero_comprobante ?? '',
          tipoComprobante: r.tipo_comprobante ?? '',
          fechaCompra: r.fecha ?? '',
          estado: r.estado,
          metodoPago: r.metodo_pago ?? '',
          observaciones: r.observaciones ?? '',
          subtotal: r.subtotal ?? 0,
          igv: r.igv ?? 0,
          total: r.total ?? 0,
          proveedor: {
            razonSocial: r.proveedor?.razon_social ?? '',
            ruc: r.proveedor?.ruc ?? '',
            telefono: r.proveedor?.telefono ?? undefined,
            correo: r.proveedor?.correo ?? undefined,
            direccion: r.proveedor?.direccion ?? undefined,
          },
          almacen: {
            nombre: r.almacen?.nombre ?? '',
            direccion: r.almacen?.direccion ?? '',
          },
          usuario: { username: r.usuario?.username ?? '' },
          detalles: (r.detalles ?? []).map(d => ({
            id: d.id,
            cantidad: d.cantidad,
            precioUnitario: d.precio_unitario ?? 0,
            subtotal: d.subtotal ?? 0,
            producto: {
              id: d.producto?.id ?? 0,
              nombre: d.producto?.nombre ?? '',
              sku: d.producto?.sku ?? '',
              unidadMedida: d.producto?.unidad_medida ?? 'UNIDAD',
              imagen: d.producto?.imagen ?? undefined,
            },
          })),
        });
      } catch (err) {
        console.error("Error al cargar detalle:", err);
        setError('No se pudo cargar la información de la compra.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetalle();
  }, [id]);

  // --- HANDLERS ---
  const abrirModalEstado = () => {
    if (compra) {
      setNuevoEstado(compra.estado);
      setModalOpen(true);
    }
  };

  const guardarEstado = async () => {
    if (!compra) return;
    setSavingState(true);
    try {
      const { error } = await supabase
        .from('compra')
        .update({ estado: nuevoEstado })
        .eq('id', compra.id);
      if (error) throw error;
      setCompra({ ...compra, estado: nuevoEstado });
      setModalOpen(false);
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("No se pudo actualizar el estado.");
    } finally {
      setSavingState(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // --- HELPERS ---
  const getStatusConfig = (status: string) => {
    const s = status ? status.toUpperCase() : '';
    if (isDark) {
      switch (s) {
        case 'COMPLETADA':
        case 'COMPLETADO':
          return { bg: 'bg-emerald-900/40', text: 'text-emerald-400', border: 'border-emerald-700', icon: '✓', label: 'Completada' };
        case 'PENDIENTE':
          return { bg: 'bg-amber-900/40', text: 'text-amber-400', border: 'border-amber-700', icon: '⏳', label: 'Pendiente' };
        case 'ANULADA':
        case 'CANCELADO':
          return { bg: 'bg-rose-900/40', text: 'text-rose-400', border: 'border-rose-700', icon: '✕', label: 'Anulada' };
        default:
          return { bg: 'bg-gray-700', text: 'text-gray-400', border: 'border-gray-600', icon: '?', label: status };
      }
    }
    switch (s) {
      case 'COMPLETADA':
      case 'COMPLETADO':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '✓', label: 'Completada' };
      case 'PENDIENTE':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '⏳', label: 'Pendiente' };
      case 'ANULADA':
      case 'CANCELADO':
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: '✕', label: 'Anulada' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: '?', label: status };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('es-PE', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
  };

  // --- LOADING STATE ---
  if (loading) return (
    <PageWrapper
      title="Detalle de Compra"
      subtitle="Cargando información del documento..."
      icon={<FiShoppingBag />}
    >
      <LoadingState message="Cargando detalle de compra..." />
    </PageWrapper>
  );

  // --- ERROR STATE ---
  if (error || !compra) return (
    <PageWrapper
      title="Detalle de Compra"
      subtitle="No se pudo cargar la información"
      icon={<FiShoppingBag />}
      actions={[
        {
          label: "Volver",
          onClick: () => navigate('/compras'),
          icon: <IoIosArrowBack />,
          variant: "secondary"
        }
      ]}
    >
      <div className={`rounded-2xl border p-8 max-w-md mx-auto text-center ${card}`}>
        <div className={`inline-flex p-4 rounded-2xl mb-5 ${isDark ? 'bg-rose-900/20' : 'bg-rose-50'}`}>
          <IoMdClose size={36} className={isDark ? 'text-rose-400' : 'text-rose-500'} />
        </div>
        <h2 className={`${TYPOGRAPHY.sectionTitle} mb-2 ${heading}`}>Error al cargar</h2>
        <p className={`${TYPOGRAPHY.body} mb-6 ${textTertiary}`}>{error || 'Compra no encontrada'}</p>
        <Link
          to="/compras"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg bg-[#E0312A] hover:bg-[#A91E16] transition-colors"
        >
          <IoIosArrowBack /> Volver al listado
        </Link>
      </div>
    </PageWrapper>
  );

  const statusConfig = getStatusConfig(compra.estado);
  const totalItems = compra.detalles?.reduce((sum, d) => sum + d.cantidad, 0) || 0;

  return (
    <PageWrapper
      title={`${compra.tipoComprobante} ${compra.numeroComprobante}`}
      subtitle={`Documento registrado el ${formatDate(compra.fechaCompra)} a las ${formatTime(compra.fechaCompra)}`}
      icon={<FiShoppingBag />}
      actions={[
        {
          label: "Volver",
          onClick: () => navigate('/compras'),
          icon: <IoIosArrowBack />,
          variant: "secondary"
        },
        {
          label: "Cambiar Estado",
          onClick: abrirModalEstado,
          icon: <IoMdCreate />,
          variant: "secondary"
        },
        {
          label: "Imprimir",
          onClick: () => window.print(),
          icon: <IoMdPrint />,
          variant: "primary"
        }
      ]}
    >
      {/* RESUMEN RÁPIDO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* Estado */}
        <div className={`rounded-2xl border p-4 ${card}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusConfig.bg} ${statusConfig.border} border`}>
              <span className={`text-lg ${statusConfig.text}`}>{statusConfig.icon}</span>
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase ${textTertiary}`}>Estado</p>
              <p className={`text-sm font-bold ${statusConfig.text}`}>{statusConfig.label}</p>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className={`rounded-2xl border p-4 ${card}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-[#E0312A]`}>
              <FiDollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase ${textTertiary}`}>Total</p>
              <p className={`text-sm font-extrabold ${heading}`}>{formatCurrency(compra.total)}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className={`rounded-2xl border p-4 ${card}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <FiPackage className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase ${textTertiary}`}>Items</p>
              <p className={`text-sm font-extrabold ${heading}`}>{totalItems} uds.</p>
            </div>
          </div>
        </div>

        {/* Método de Pago */}
        <div className={`rounded-2xl border p-4 ${card}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <FiCreditCard className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase ${textTertiary}`}>Pago</p>
              <p className={`text-sm font-bold ${heading} capitalize`}>{compra.metodoPago?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL: PROVEEDOR + ALMACÉN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* PROVEEDOR */}
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className={`px-5 py-4 border-b ${borderLight} flex items-center gap-3`}>
            <div className={`p-2 rounded-lg text-white bg-[#E0312A]`}>
              <FiTruck className="w-4 h-4" />
            </div>
            <h3 className={`font-bold ${heading}`}>Proveedor</h3>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-[#E0312A]/20 text-emerald-400' : 'bg-[#E0312A]/10 text-[#E0312A]'} flex items-center justify-center text-lg font-bold`}>
                {compra.proveedor?.razonSocial?.substring(0, 2).toUpperCase() || '??'}
              </div>
              <div className="flex-1">
                <p className={`text-lg font-bold ${heading}`}>{compra.proveedor?.razonSocial}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm font-mono ${textTertiary}`}>RUC: {compra.proveedor?.ruc}</span>
                  <button
                    onClick={() => copyToClipboard(compra.proveedor?.ruc || '')}
                    className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    title="Copiar RUC"
                  >
                    <IoMdCopy className={`w-4 h-4 ${textTertiary}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className={`space-y-2 text-sm ${textTertiary}`}>
              {compra.proveedor?.direccion && (
                <p className="flex items-start gap-2">
                  <IoMdPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
                  {compra.proveedor.direccion}
                </p>
              )}
              {compra.proveedor?.telefono && (
                <p className="flex items-center gap-2">
                  <IoIosCall className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
                  {compra.proveedor.telefono}
                </p>
              )}
              {compra.proveedor?.correo && (
                <p className="flex items-center gap-2">
                  <IoIosMail className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
                  {compra.proveedor.correo}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ALMACÉN Y OPERADOR */}
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className={`px-5 py-4 border-b ${borderLight} flex items-center gap-3`}>
            <div className={`p-2 rounded-lg text-white bg-[#E0312A]`}>
              <FiMapPin className="w-4 h-4" />
            </div>
            <h3 className={`font-bold ${heading}`}>Destino y Operación</h3>
          </div>
          <div className="p-5 space-y-4">
            {/* Almacén */}
            <div className="border-l-4 pl-4 py-2 border-[#E0312A]">
              <p className={`text-[10px] font-bold uppercase ${textTertiary} mb-1`}>Almacén de destino</p>
              <p className={`text-lg font-bold ${heading}`}>{compra.almacen?.nombre}</p>
              <p className={`text-sm ${textTertiary}`}>{compra.almacen?.direccion || 'Dirección no especificada'}</p>
            </div>

            {/* Operador */}
            <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                <FiUser className={`w-4 h-4 ${textTertiary}`} />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase ${textTertiary}`}>Registrado por</p>
                <p className={`text-sm font-semibold ${heading}`}>{compra.usuario?.username || 'Sistema'}</p>
              </div>
            </div>

            {/* Observaciones */}
            {compra.observaciones && (
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800/50' : 'bg-amber-50 border-amber-100'}`}>
                <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-amber-400' : 'text-amber-600'} mb-1`}>Observaciones</p>
                <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-800'} italic`}>"{compra.observaciones}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className={`rounded-2xl border overflow-hidden ${card} mb-8`}>
        <div className={`px-5 py-4 border-b ${borderLight} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white bg-[#E0312A]`}>
              <IoIosListBox className="w-4 h-4" />
            </div>
            <h3 className={`font-bold ${heading}`}>Detalle de Productos</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-[#E0312A]/20 text-emerald-300' : 'bg-[#E0312A]/10 text-[#E0312A]'}`}>
            {compra.detalles?.length || 0} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={tableHeader}>
              <tr>
                <th className={`px-5 py-3.5 text-xs font-bold ${tableHeaderText} uppercase tracking-wider`}>Producto</th>
                <th className={`px-5 py-3.5 text-xs font-bold ${tableHeaderText} uppercase tracking-wider text-center`}>Unidad</th>
                <th className={`px-5 py-3.5 text-xs font-bold ${tableHeaderText} uppercase tracking-wider text-right`}>Precio Unit.</th>
                <th className={`px-5 py-3.5 text-xs font-bold ${tableHeaderText} uppercase tracking-wider text-center`}>Cantidad</th>
                <th className={`px-5 py-3.5 text-xs font-bold ${tableHeaderText} uppercase tracking-wider text-right`}>Subtotal</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {compra.detalles?.map((item) => (
                <tr key={item.id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border overflow-hidden flex-shrink-0`}>
                        {item.producto?.imagen ? (
                          <img src={`${API_URL}${item.producto.imagen}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <IoMdImage className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-300'}`} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`font-bold ${heading}`}>{item.producto?.nombre}</p>
                        <p className={`text-xs font-mono ${textTertiary}`}>SKU: {item.producto?.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {item.producto?.unidadMedida || 'UNIDAD'}
                    </span>
                  </td>
                  <td className={`px-5 py-4 text-right font-mono ${textTertiary}`}>
                    {formatCurrency(item.precioUnitario)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${isDark ? 'bg-[#E0312A]/20 text-emerald-400' : 'bg-[#E0312A]/10 text-[#E0312A]'}`}>
                      {item.cantidad}
                    </span>
                  </td>
                  <td className={`px-5 py-4 text-right font-bold font-mono ${heading}`}>
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALES */}
        <div className={`px-5 py-5 border-t ${borderLight} ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-3">
              <div className={`flex justify-between text-sm ${textTertiary}`}>
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(compra.subtotal)}</span>
              </div>
              <div className={`flex justify-between text-sm ${textTertiary}`}>
                <span>IGV (18%)</span>
                <span className="font-mono">{formatCurrency(compra.igv)}</span>
              </div>
              <div className={`border-t ${borderLight} pt-3 mt-3`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-bold ${heading} uppercase`}>Total</span>
                  <span className="text-2xl font-extrabold font-mono text-[#E0312A]">
                    {formatCurrency(compra.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className={`text-center py-4 border-t border-dashed ${borderLight}`}>
        <p className={`text-xs ${textTertiary}`}>
          Documento de gestión interna • ID: {compra.id} • Generado el {new Date().toLocaleDateString('es-PE')}
        </p>
      </div>

      {/* --- MODAL PARA CAMBIAR ESTADO --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
          <div className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm`} onClick={() => setModalOpen(false)}></div>

          <div className={`relative ${isDark ? 'bg-[#171717]' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${borderLight} flex justify-between items-center`}>
              <h3 className={`font-bold ${heading} flex items-center gap-2`}>
                <IoMdCreate className="text-[#E0312A]" /> Actualizar Estado
              </h3>
              <button onClick={() => setModalOpen(false)} className={`${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}>
                <IoMdClose size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className={`mb-5 p-4 rounded-xl border ${isDark ? 'bg-[#E0312A]/20 border-[#E0312A]/40' : 'bg-[#E0312A]/10 border-[#E0312A]/20'}`}>
                <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-[#E0312A]'} uppercase font-bold mb-1`}>Comprobante</p>
                <p className={`font-mono font-bold ${heading} text-lg`}>{compra.numeroComprobante}</p>
              </div>

              <p className={`text-sm font-medium ${heading} mb-3`}>Selecciona el nuevo estado:</p>

              <div className="space-y-2">
                {['PENDIENTE', 'COMPLETADA', 'ANULADA'].map((estado) => (
                  <label key={estado}
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                      nuevoEstado === estado
                        ? `border-[#E0312A] ${isDark ? 'bg-[#E0312A]/20' : 'bg-[#E0312A]/10'} ring-1 ring-[#E0312A]`
                        : `${isDark ? 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
                    }`}
                  >
                    <input
                      type="radio"
                      name="estado"
                      value={estado}
                      checked={nuevoEstado === estado}
                      onChange={(e) => setNuevoEstado(e.target.value)}
                      className="w-4 h-4 text-[#E0312A] focus:ring-[#E0312A] border-gray-300"
                    />
                    <span className={`ml-3 text-sm font-semibold ${heading} capitalize`}>
                      {estado.toLowerCase()}
                    </span>
                    {nuevoEstado === estado && (
                      <IoMdCheckmarkCircle className="ml-auto text-[#E0312A] text-xl" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t ${borderLight} flex justify-end gap-3`}>
              <button
                onClick={() => setModalOpen(false)}
                className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Cancelar
              </button>
              <button
                onClick={guardarEstado}
                disabled={savingState}
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all disabled:opacity-70 flex items-center gap-2 bg-[#E0312A] hover:bg-[#A91E16] ${isDark ? 'shadow-[#E0312A]/20' : 'shadow-[#E0312A]/30'}`}
              >
                {savingState ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
