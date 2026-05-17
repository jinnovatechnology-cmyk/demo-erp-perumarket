import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import {
  IoIosDocument, IoMdAdd, IoMdCloseCircle,
  IoIosList, IoMdCheckmark, IoIosWarning, IoIosCheckmarkCircle,
  IoIosSearch, IoMdImage, IoMdBarcode, IoMdCopy, IoMdPrint, IoMdTrash, IoMdClose
} from "react-icons/io";
import { FaWarehouse, FaBoxOpen } from "react-icons/fa";
import { FiShoppingBag, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { supabase } from '../../services/api';
import { useWarehouseList } from '../../hooks/inventario/useWarehouseList';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { PageWrapper } from '../../components/ui/PageWrapper';

// --- CONSTANTES DE PAGINACIÓN ---
const PRODUCTS_PER_PAGE = 12;

// --- CONFIGURACIÓN ---
const API_URL = 'http://localhost:8080';
const ID_USUARIO_ACTUAL = 1;

// --- INTERFACES ---
interface ProductoCompra {
  id: number;
  id_producto: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  sku: string;
  peso_total: number;
  imagen?: string;
  unidadMedida?: string;
}

interface Proveedor {
  id: number;
  razon_social?: string;
  razonSocial?: string;
  ruc: string;
}

interface ProductoProveedorDTO {
  id: number;
  productoId: number;
  nombre: string;
  codigo: string;
  precio_compra: number;
  peso_kg: number;
  imagen?: string;
  unidadMedida?: string;
}

interface BarcodeData {
  nombre: string;
  codigoBarras: string;
}

export default function NewPurchase() {
  const navigate = useNavigate();
  const { warehouses: almacenes } = useWarehouseList();
  const { isDark, heading, textTertiary, tableHeader, tableHeaderText, emptyState } = useThemeClasses();

  // --- ESTADOS ---
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoProveedorDTO[]>([]);

  // Formulario
  const [proveedor, setProveedor] = useState<number | ''>('');
  const [tipoComprobante, setTipoComprobante] = useState('ORDEN_COMPRA');
  const [almacen, setAlmacen] = useState<number | ''>('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [observaciones, setObservaciones] = useState('');

  // Modales y Selección
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [filtroProductoModal, setFiltroProductoModal] = useState('');
  const [productoActual, setProductoActual] = useState<ProductoProveedorDTO | null>(null);
  const [cantidad, setCantidad] = useState(1);

  // Modal de cambio de proveedor
  const [showProveedorChangeModal, setShowProveedorChangeModal] = useState(false);
  const [pendingProveedor, setPendingProveedor] = useState<number | null>(null);

  // Carrito
  const [productosEnCompra, setProductosEnCompra] = useState<ProductoCompra[]>([]);

  // UI - Modales
  const [showNotification, setShowNotification] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Barcode
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [currentBarcodeData, setCurrentBarcodeData] = useState<BarcodeData | null>(null);

  // Paginación del modal de productos
  const [productModalPage, setProductModalPage] = useState(1);

  const getNombreProveedor = (p: Proveedor) => p.razon_social || p.razonSocial || "Proveedor";

  // --- EFECTOS ---
  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const { data, error } = await supabase
          .from('proveedor')
          .select('id, ruc, razon_social')
          .eq('estado', 'ACTIVO')
          .order('razon_social', { ascending: true });
        if (error) throw error;
        type ProveedorRaw = { id: number; ruc: string; razon_social: string };
        setProveedores(
          ((data ?? []) as ProveedorRaw[]).map(p => ({
            id: p.id,
            ruc: p.ruc,
            razon_social: p.razon_social,
          }))
        );
      } catch (error) {
        console.error("Error al cargar proveedores:", error);
      }
    };
    cargarProveedores();
  }, []);

  // Efecto para cargar productos cuando cambia el proveedor (solo si ya está confirmado)
  useEffect(() => {
    if (proveedor) {
      cargarProductosDelProveedor(Number(proveedor));
    }
  }, [proveedor]);

  // Handler para cambio de proveedor con validación
  const handleProveedorChange = (nuevoProveedorId: number | '') => {
    // Si no hay proveedor actual o no hay productos, cambiar directamente
    if (!proveedor || productosEnCompra.length === 0) {
      setProveedor(nuevoProveedorId);
      setProductoActual(null);
      setProductosDisponibles([]);
      setProductosEnCompra([]);
      return;
    }

    // Si hay productos en el carrito, mostrar modal de confirmación
    if (nuevoProveedorId !== '' && nuevoProveedorId !== proveedor) {
      setPendingProveedor(nuevoProveedorId);
      setShowProveedorChangeModal(true);
    }
  };

  // Confirmar cambio de proveedor (desde el modal)
  const confirmarCambioProveedor = () => {
    if (pendingProveedor !== null) {
      setProveedor(pendingProveedor);
      setProductoActual(null);
      setProductosDisponibles([]);
      setProductosEnCompra([]);
    }
    setShowProveedorChangeModal(false);
    setPendingProveedor(null);
  };

  // Cancelar cambio de proveedor
  const cancelarCambioProveedor = () => {
    setShowProveedorChangeModal(false);
    setPendingProveedor(null);
  };

  const cargarProductosDelProveedor = async (idProveedor: number) => {
    setLoadingData(true);
    try {
      // Obtener productos vinculados al proveedor via proveedor_producto
      const { data, error } = await supabase
        .from('proveedor_producto')
        .select(`
          id,
          precio_compra,
          producto:id_producto (
            id, nombre, sku, precio_compra, peso_kg, imagen, unidad_medida
          )
        `)
        .eq('id_proveedor', idProveedor);
      if (error) throw error;
      type PPRaw = {
        id: number;
        precio_compra: number | null;
        producto: {
          id: number;
          nombre: string | null;
          sku: string | null;
          precio_compra: number | null;
          peso_kg: number | null;
          imagen: string | null;
          unidad_medida: string | null;
        } | null;
      };
      const mapped: ProductoProveedorDTO[] = ((data ?? []) as unknown as PPRaw[])
        .filter(pp => pp.producto !== null)
        .map(pp => ({
          id: pp.id,
          productoId: pp.producto!.id,
          nombre: pp.producto!.nombre ?? '',
          codigo: pp.producto!.sku ?? '',
          precio_compra: pp.precio_compra ?? pp.producto!.precio_compra ?? 0,
          peso_kg: pp.producto!.peso_kg ?? 0,
          imagen: pp.producto!.imagen ?? undefined,
          unidadMedida: pp.producto!.unidad_medida ?? 'UNIDAD',
        }));
      setProductosDisponibles(mapped);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const generarNumeroComprobante = () => {
    const serie = tipoComprobante === 'FACTURA' ? 'F001' : (tipoComprobante === 'BOLETA' ? 'B001' : 'OC01');
    return `${serie}-${Math.floor(Date.now() / 1000).toString().slice(-6)}`;
  };

  // --- CALCULOS ---
  const volumenAgregado = useMemo(() =>
    productosEnCompra.reduce((sum, p) => sum + p.peso_total, 0)
    , [productosEnCompra]);

  const infoAlmacenSeleccionado = useMemo(() => {
    if (!almacen) return null;
    const alm = almacenes.find(a => a.id === Number(almacen));
    if (!alm) return null;

    const capacidadTotalUnits = alm.capacityTotalUnits || 0;
    const capacityUsedUnits = alm.capacityUsed || 0;
    const capacidadM3 = alm.capacidadM3 || 0;

    let occupiedM3_Base = 0;
    if (capacidadTotalUnits > 0) {
      occupiedM3_Base = (capacityUsedUnits / capacidadTotalUnits) * capacidadM3;
    }

    const occupiedM3_Total = occupiedM3_Base + volumenAgregado;
    const percentageSafe = capacidadM3 > 0
      ? Math.round((occupiedM3_Total / capacidadM3) * 100)
      : 0;

    let colorBarra = 'bg-emerald-500';
    let colorTexto = 'text-emerald-700';
    let colorFondo = 'bg-emerald-50';

    if (percentageSafe > 80) {
      colorBarra = 'bg-rose-500'; colorTexto = 'text-rose-700'; colorFondo = 'bg-rose-50';
    } else if (percentageSafe > 50) {
      colorBarra = 'bg-amber-500'; colorTexto = 'text-amber-700'; colorFondo = 'bg-amber-50';
    }

    return {
      ...alm,
      capacidadM3,
      occupiedM3_Total,
      percentage: percentageSafe,
      colorBarra, colorTexto, colorFondo
    };
  }, [almacen, almacenes, volumenAgregado]);

  // --- HANDLERS ---
  const handleSelectProductFromModal = (prod: ProductoProveedorDTO) => {
    if (productosEnCompra.some(p => p.id_producto === prod.productoId)) {
      alert("Este producto ya está en la lista.");
      return;
    }
    setProductoActual(prod);
    setCantidad(1);
    setIsProductModalOpen(false);
    setFiltroProductoModal('');
  };

  const añadirProductoAlCarrito = () => {
    if (!productoActual || cantidad <= 0) return;
    const pesoProductoNuevo = productoActual.peso_kg * cantidad;

    if (infoAlmacenSeleccionado) {
      if ((infoAlmacenSeleccionado.occupiedM3_Total + pesoProductoNuevo) > infoAlmacenSeleccionado.capacidadM3) {
        alert(`Capacidad excedida. Falta espacio para ${pesoProductoNuevo.toFixed(2)} m3.`);
        return;
      }
    }

    const subtotal = productoActual.precio_compra * cantidad;
    const nuevoItem: ProductoCompra = {
      id: Date.now(),
      id_producto: productoActual.productoId,
      nombre: productoActual.nombre,
      precio_unitario: productoActual.precio_compra,
      cantidad: cantidad,
      subtotal: subtotal,
      sku: productoActual.codigo,
      peso_total: pesoProductoNuevo,
      imagen: productoActual.imagen,
      unidadMedida: productoActual.unidadMedida || 'UNIDAD'
    };

    setProductosEnCompra([...productosEnCompra, nuevoItem]);
    setProductoActual(null);
    setCantidad(1);
  };

  const eliminarProducto = (id: number) => {
    setProductosEnCompra(productosEnCompra.filter(p => p.id !== id));
  };

  const actualizarCantidad = (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) { eliminarProducto(id); return; }
    setProductosEnCompra(productosEnCompra.map(p => {
      if (p.id === id) {
        return {
          ...p,
          cantidad: nuevaCantidad,
          subtotal: p.precio_unitario * nuevaCantidad,
          peso_total: (p.peso_total / p.cantidad) * nuevaCantidad
        };
      }
      return p;
    }));
  };

  // --- BARCODE LOGIC ---
  const openBarcodeModal = (item: ProductoCompra) => {
    setCurrentBarcodeData({ nombre: item.nombre, codigoBarras: item.sku });
    setBarcodeModalOpen(true);
  };

  const copyBarcode = () => {
    if (currentBarcodeData?.codigoBarras) {
      navigator.clipboard.writeText(currentBarcodeData.codigoBarras);
      alert('Copiado!');
    }
  };

  const printBarcode = () => {
    if (currentBarcodeData?.codigoBarras) {
      const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${currentBarcodeData.codigoBarras}&code=Code128&translate-esc=on`;
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`
            <html><head><title>${currentBarcodeData.nombre}</title>
            <style>body{text-align:center;font-family:sans-serif;padding:20px;} @media print{.np{display:none;}}</style>
            </head><body>
            <h3>${currentBarcodeData.nombre}</h3>
            <img src='${barcodeUrl}' style='max-width:100%;'/>
            <div class="np" style="margin-top:20px"><button onclick="window.print()">Imprimir</button></div>
            <script>window.onload=function(){setTimeout(function(){window.print();},1000);}</script>
            </body></html>
        `);
        w.document.close();
      }
    }
  };

  // --- INICIAR PROCESO DE GUARDADO (ABRIR MODAL) ---
  const handleSaveClick = () => {
    if (!proveedor || !almacen || productosEnCompra.length === 0) {
      alert("Por favor completa los datos obligatorios.");
      return;
    }
    setShowConfirmModal(true);
  };

  // --- CONFIRMAR GUARDADO ---
  const registrarCompra = async () => {
    setIsSaving(true);
    const subtotalVal = Number(subtotalBruto.toFixed(2));
    const igvVal = Number(igv.toFixed(2));
    const totalVal = Number(totalAPagar.toFixed(2));

    try {
      // 1. Insertar cabecera de compra
      const { data: compraData, error: compraError } = await supabase
        .from('compra')
        .insert({
          id_proveedor: Number(proveedor),
          id_almacen: Number(almacen),
          id_usuario: ID_USUARIO_ACTUAL,
          tipo_comprobante: tipoComprobante,
          numero_comprobante: generarNumeroComprobante(),
          subtotal: subtotalVal,
          igv: igvVal,
          total: totalVal,
          estado: 'PENDIENTE',
          metodo_pago: metodoPago,
          observaciones: observaciones || null,
        })
        .select('id')
        .single();
      if (compraError) throw compraError;
      const idCompra = (compraData as { id: number }).id;

      // 2. Insertar detalles
      const detalles = productosEnCompra.map(p => ({
        id_compra: idCompra,
        id_producto: Number(p.id_producto),
        cantidad: Number(p.cantidad),
        precio_unitario: Number(p.precio_unitario.toFixed(2)),
        subtotal: Number(p.subtotal.toFixed(2)),
      }));
      const { error: detallesError } = await supabase
        .from('detalle_compra')
        .insert(detalles);
      if (detallesError) throw detallesError;

      setShowConfirmModal(false);
      setShowNotification(true);
      setProductosEnCompra([]);
      setProveedor('');
      setAlmacen('');
      setTimeout(() => { setShowNotification(false); navigate('/compras'); }, 1500);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      alert(`Error: ${msg}`);
      setIsSaving(false);
    }
  };

  const subtotalBruto = productosEnCompra.reduce((sum, p) => sum + p.subtotal, 0);
  const igv = subtotalBruto * 0.18;
  const totalAPagar = subtotalBruto + igv;

  // Reusable select class
  const selectClass = `w-full px-3 py-2.5 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-slate-50 border-slate-200 text-slate-700'} border rounded-lg text-sm font-medium focus:ring-1 focus:ring-[#E0312A] transition-all outline-none`;

  return (
    <PageWrapper
      title="Nueva Compra"
      subtitle="Registre una nueva orden de compra seleccionando proveedor, almacén de destino y productos a adquirir."
      icon={<FiShoppingBag />}
      actions={[
        {
          label: "Cancelar",
          onClick: () => setShowCancelModal(true),
          variant: "secondary"
        },
        {
          label: "Guardar Compra",
          onClick: handleSaveClick,
          icon: <IoMdCheckmark />,
          variant: "primary",
          disabled: productosEnCompra.length === 0
        }
      ]}
    >
      {/* --- NOTIFICACION FLOTANTE --- */}
      {showNotification && (
        <div className="fixed top-6 right-6 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[150] animate-bounce-in ring-4 ring-emerald-100">
          <IoIosCheckmarkCircle className="w-6 h-6" />
          <div>
            <p className="font-bold">Operacion Exitosa!</p>
            <p className="text-xs text-emerald-100">La compra se ha registrado correctamente.</p>
          </div>
        </div>
      )}

      <div className="space-y-6">

        {/* --- GRID PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLUMNA IZQUIERDA: DATOS GENERALES (2/3 de ancho) */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. TARJETA DE PROVEEDOR Y ALMACEN */}
            <div className={`${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-[#E0312A]"></div>
              <h3 className={`text-sm font-bold ${heading} uppercase tracking-wide mb-5 flex items-center gap-2`}>
                <IoIosDocument className="text-[#E0312A]" /> Informacion General
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Selector Proveedor */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${textTertiary} ml-1`}>Proveedor <span className="text-rose-500">*</span></label>
                  <select value={proveedor} onChange={(e) => handleProveedorChange(e.target.value ? Number(e.target.value) : '')}
                    className={selectClass}>
                    <option value="">-- Seleccionar Proveedor --</option>
                    {proveedores.map(prov => (
                      <option key={prov.id} value={prov.id}>{getNombreProveedor(prov)}</option>
                    ))}
                  </select>
                </div>

                {/* Selector Almacen */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${textTertiary} ml-1`}>Almacen de Destino <span className="text-rose-500">*</span></label>
                  <select value={almacen} onChange={(e) => setAlmacen(e.target.value ? Number(e.target.value) : '')}
                    className={selectClass}>
                    <option value="">-- Seleccionar Almacen --</option>
                    {almacenes.map((alm: any) => (
                      <option key={alm.id} value={alm.id}>{alm.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Widget de Capacidad (Aparece si hay almacen) */}
                {infoAlmacenSeleccionado && (
                  <div className={`md:col-span-2 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border mt-2`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-bold ${textTertiary} flex items-center gap-2`}>
                        <FaWarehouse className={infoAlmacenSeleccionado.colorTexto} /> Capacidad del Almacen
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${infoAlmacenSeleccionado.colorFondo} ${infoAlmacenSeleccionado.colorTexto}`}>
                        {infoAlmacenSeleccionado.percentage}% Ocupado
                      </span>
                    </div>
                    <div className={`w-full ${isDark ? 'bg-neutral-700' : 'bg-gray-200'} rounded-full h-2 overflow-hidden mb-1`}>
                      <div className={`h-full rounded-full transition-all duration-700 ease-out ${infoAlmacenSeleccionado.colorBarra}`}
                        style={{ width: `${Math.min(infoAlmacenSeleccionado.percentage, 100)}%` }}>
                      </div>
                    </div>
                    <p className={`text-[10px] text-right ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Disponible: {(infoAlmacenSeleccionado.capacidadM3 - infoAlmacenSeleccionado.occupiedM3_Total).toFixed(2)} m3
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${textTertiary} ml-1`}>Tipo & N Comprobante</label>
                  <div className="flex gap-2">
                    <select value={tipoComprobante} onChange={(e) => setTipoComprobante(e.target.value)}
                      className={`w-2/3 ${selectClass}`}>
                      <option value="ORDEN_COMPRA">Orden de Compra</option>
                      <option value="FACTURA">Factura</option>
                      <option value="BOLETA">Boleta</option>
                    </select>
                    <div className={`w-1/3 px-3 py-2.5 ${isDark ? 'bg-neutral-800 border-neutral-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'} border rounded-lg text-xs font-bold flex items-center justify-center font-mono`}>
                      {generarNumeroComprobante()}
                    </div>
                  </div>
                </div>

                {/* Selector Metodo de Pago */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${textTertiary} ml-1`}>Metodo de Pago</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className={selectClass}
                  >
                    <option value="EFECTIVO">Efectivo (Contado)</option>
                    <option value="TARJETA">Tarjeta de Credito/Debito</option>
                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                    <option value="YAPE">Yape</option>
                    <option value="PLIN">Plin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. LISTADO DE PRODUCTOS (Tabla Principal) */}
            <div className={`${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
              <div className={`p-5 ${isDark ? 'border-neutral-800 bg-[#171717]' : 'border-gray-100 bg-white'} border-b flex justify-between items-center`}>
                <h3 className={`text-sm font-bold ${heading} uppercase tracking-wide flex items-center gap-2`}>
                  <IoIosList className="text-lg text-[#E0312A]" /> Items en la Orden
                </h3>
                <span className={`${isDark ? 'bg-[#E0312A]/20 text-emerald-300 border-[#E0312A]/40' : 'bg-[#E0312A]/10 text-[#E0312A] border-[#E0312A]/20'} text-xs font-bold px-2.5 py-1 rounded-full border`}>
                  {productosEnCompra.length} Productos
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className={`${tableHeader} ${isDark ? 'border-neutral-800' : 'border-gray-200'} border-b`}>
                    <tr>
                      <th className={`px-5 py-3 text-xs font-bold ${tableHeaderText} uppercase tracking-wider`}>Descripcion</th>
                      <th className={`px-5 py-3 text-xs font-bold ${tableHeaderText} uppercase tracking-wider text-right`}>Precio</th>
                      <th className={`px-5 py-3 text-xs font-bold ${tableHeaderText} uppercase tracking-wider text-center`}>Cant.</th>
                      <th className={`px-5 py-3 text-xs font-bold ${tableHeaderText} uppercase tracking-wider text-right`}>Subtotal</th>
                      <th className={`px-5 py-3 text-xs font-bold ${tableHeaderText} uppercase tracking-wider text-center`}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-neutral-800' : 'divide-gray-100'}`}>
                    {productosEnCompra.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={`py-12 text-center ${emptyState}`}>
                          <FaBoxOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p className="text-sm">No has agregado productos aun.</p>
                        </td>
                      </tr>
                    ) : (
                      productosEnCompra.map(item => (
                        <tr key={item.id} className={`${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50'} transition-colors group`}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'} border p-0.5 shrink-0 overflow-hidden`}>
                                {item.imagen ?
                                  <img src={`${API_URL}${item.imagen}`} className="w-full h-full object-cover rounded-md" alt={item.nombre} /> :
                                  <IoMdImage className={`w-full h-full ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />}
                              </div>
                              <div>
                                <div className={`text-sm font-bold ${heading}`}>{item.nombre}</div>
                                <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} font-mono`}>
                                  {item.sku}
                                  {item.unidadMedida && item.unidadMedida !== 'UNIDAD' && (
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isDark ? 'bg-neutral-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{item.unidadMedida}</span>
                                  )}
                                  <button onClick={() => openBarcodeModal(item)} className="text-[#E0312A] hover:text-[#A91E16] transition-colors" title="Ver codigo de barras">
                                    <IoMdBarcode />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={`px-5 py-3 text-right text-sm ${textTertiary} font-mono`}>S/ {item.precio_unitario.toFixed(2)}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-center">
                              <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)} className={`w-7 h-7 flex items-center justify-center rounded-l-md ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}>-</button>
                              <div className={`w-10 h-7 flex items-center justify-center border-y ${isDark ? 'border-neutral-700 bg-[#171717] text-gray-200' : 'border-gray-200 bg-white text-gray-700'} text-sm font-bold`}>{item.cantidad}</div>
                              <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)} className={`w-7 h-7 flex items-center justify-center rounded-r-md ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}>+</button>
                            </div>
                          </td>
                          <td className={`px-5 py-3 text-right text-sm font-bold ${heading} font-mono`}>S/ {item.subtotal.toFixed(2)}</td>
                          <td className="px-5 py-3 text-center">
                            <button onClick={() => eliminarProducto(item.id)} className={`${isDark ? 'text-gray-500 hover:text-rose-400' : 'text-gray-400 hover:text-rose-500'} p-2 transition-colors`}>
                              <IoMdTrash className="text-lg" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: ACCIONES Y TOTALES (1/3 de ancho) */}
          <div className="space-y-6">

            {/* 1. AGREGAR PRODUCTO */}
            <div className={`${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-5`}>
              <h3 className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-wider mb-4`}>Agregar Item</h3>

              <button onClick={() => setIsProductModalOpen(true)} disabled={!proveedor}
                className={`w-full py-4 border-2 border-dashed ${isDark ? 'border-[#E0312A]/50 bg-[#E0312A]/10 hover:bg-[#E0312A]/20 text-[#F0726A]' : 'border-[#E0312A]/30 bg-[#E0312A]/5 hover:bg-[#E0312A]/10 text-[#E0312A]'} rounded-xl flex flex-col items-center justify-center gap-1 font-bold transition-all mb-4 group disabled:opacity-50 disabled:cursor-not-allowed`}>
                {productoActual ? (
                  <>
                    <IoMdCheckmark className="text-2xl text-emerald-500" />
                    <span className={`${heading} text-sm`}>{productoActual.nombre}</span>
                  </>
                ) : (
                  <>
                    <IoIosSearch className="text-2xl group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{proveedor ? "Buscar en Catalogo" : "Seleccione Proveedor Primero"}</span>
                  </>
                )}
              </button>

              {productoActual?.unidadMedida && productoActual.unidadMedida !== 'UNIDAD' && (
                <div className={`mb-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-center ${isDark ? 'bg-[#E0312A]/20 text-emerald-300 border border-[#E0312A]/40' : 'bg-[#E0312A]/10 text-[#E0312A] border border-[#E0312A]/20'}`}>
                  Unidad: {productoActual.unidadMedida}
                </div>
              )}

              <div className="flex gap-3 mb-4">
                <div className="w-1/2">
                  <label className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-1`}>Precio</label>
                  <div className={`w-full p-2.5 ${isDark ? 'bg-neutral-800 text-gray-400' : 'bg-gray-100 text-gray-500'} rounded-lg font-mono text-center text-sm`}>
                    {productoActual ? `S/ ${productoActual.precio_compra}` : '-'}
                  </div>
                </div>
                <div className="w-1/2">
                  <label className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-1`}>Cantidad {productoActual?.unidadMedida && productoActual.unidadMedida !== 'UNIDAD' ? `(${productoActual.unidadMedida})` : ''}</label>
                  <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} disabled={!productoActual}
                    className={`w-full p-2.5 ${isDark ? 'bg-neutral-800 border-neutral-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'} border rounded-lg font-bold text-center text-sm focus:ring-2 focus:ring-[#E0312A] outline-none`} />
                </div>
              </div>

              <button onClick={añadirProductoAlCarrito} disabled={!productoActual || cantidad <= 0}
                className={`w-full py-3 bg-[#E0312A] hover:bg-[#A91E16] text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:shadow-none shadow-lg ${isDark ? 'shadow-[#E0312A]/20' : 'shadow-[#E0312A]/30'}`}>
                <IoMdAdd /> Anadir a la lista
              </button>
            </div>

            {/* 2. TOTALES */}
            <div className={`${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
              <h3 className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-wider mb-4 border-b ${isDark ? 'border-neutral-800' : 'border-gray-100'} pb-2`}>Resumen Financiero</h3>

              <div className="space-y-3 mb-6">
                <div className={`flex justify-between text-sm ${textTertiary}`}>
                  <span>Subtotal</span>
                  <span className={`font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>S/ {subtotalBruto.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between text-sm ${textTertiary}`}>
                  <span>IGV (18%)</span>
                  <span className={`font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>S/ {igv.toFixed(2)}</span>
                </div>
              </div>

              <div className={`${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border`}>
                <div className="text-center">
                  <span className="text-xs font-bold text-[#E0312A] uppercase tracking-wider block mb-1">Total a Pagar</span>
                  <span className={`text-3xl font-extrabold ${heading} block`}>S/ {totalAPagar.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4">
                <label className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-1`}>Observaciones</label>
                <textarea
                  className={`w-full p-2.5 ${isDark ? 'bg-neutral-800 border-neutral-700 text-gray-200 focus:bg-neutral-700' : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white'} border rounded-lg text-sm focus:ring-2 focus:ring-[#E0312A] outline-none resize-none`}
                  rows={3}
                  placeholder="Comentarios adicionales..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE BUSQUEDA (Estilo Galeria con Paginación) --- */}
      {isProductModalOpen && (() => {
        // Filtrar productos
        const productosFiltrados = productosDisponibles.filter(p =>
          p.nombre.toLowerCase().includes(filtroProductoModal.toLowerCase()) ||
          p.codigo.toLowerCase().includes(filtroProductoModal.toLowerCase())
        );

        // Calcular paginación
        const totalPages = Math.ceil(productosFiltrados.length / PRODUCTS_PER_PAGE);
        const startIndex = (productModalPage - 1) * PRODUCTS_PER_PAGE;
        const paginatedProducts = productosFiltrados.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

        // Generar números de página
        const getPageNumbers = () => {
          const pages: (number | string)[] = [];
          if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
          } else {
            pages.push(1);
            if (productModalPage > 3) pages.push('...');
            for (let i = Math.max(2, productModalPage - 1); i <= Math.min(totalPages - 1, productModalPage + 1); i++) {
              pages.push(i);
            }
            if (productModalPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
          }
          return pages;
        };

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm transition-opacity`} onClick={() => { setIsProductModalOpen(false); setProductModalPage(1); }}></div>
            <div className={`relative ${isDark ? 'bg-[#171717]' : 'bg-white'} w-full max-w-5xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeInUp`}>
              {/* Header Modal */}
              <div className={`p-5 border-b ${isDark ? 'border-neutral-800 bg-[#171717]' : 'border-gray-100 bg-white'} z-10`}>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <IoIosSearch className={`absolute left-3 top-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input type="text" placeholder="Buscar por nombre o SKU..." autoFocus
                      className={`w-full pl-10 pr-10 py-2.5 ${isDark ? 'bg-neutral-800 text-gray-200 placeholder-gray-500' : 'bg-gray-50 text-gray-700'} border-none rounded-xl focus:ring-2 focus:ring-[#E0312A] outline-none`}
                      value={filtroProductoModal}
                      onChange={(e) => { setFiltroProductoModal(e.target.value); setProductModalPage(1); }}
                    />
                    {filtroProductoModal && (
                      <button
                        onClick={() => { setFiltroProductoModal(''); setProductModalPage(1); }}
                        className={`absolute right-3 top-2.5 p-0.5 rounded-full ${isDark ? 'hover:bg-neutral-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}`}
                      >
                        <IoMdClose className="text-lg" />
                      </button>
                    )}
                  </div>
                  <button onClick={() => { setIsProductModalOpen(false); setProductModalPage(1); }} className={`p-2 ${isDark ? 'hover:bg-neutral-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'} rounded-full transition-colors`}>
                    <IoMdCloseCircle className="text-2xl" />
                  </button>
                </div>
                {/* Info de resultados */}
                <div className="flex items-center justify-between mt-3">
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {productosFiltrados.length} productos encontrados
                    {productosFiltrados.length > PRODUCTS_PER_PAGE && ` • Mostrando ${startIndex + 1}-${Math.min(startIndex + PRODUCTS_PER_PAGE, productosFiltrados.length)}`}
                  </p>
                </div>
              </div>

              {/* Grid Productos */}
              <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                {loadingData ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E0312A]"></div>
                  </div>
                ) : productosFiltrados.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center h-40 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <FaBoxOpen className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No se encontraron productos</p>
                    <p className="text-xs mt-1">Intenta con otro termino de busqueda</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paginatedProducts.map(prod => (
                      <div key={prod.id} onClick={() => handleSelectProductFromModal(prod)}
                        className={`${isDark ? 'bg-[#171717] border-neutral-800 hover:border-[#E0312A]' : 'bg-white border-gray-200 hover:border-[#E0312A]'} rounded-xl border p-3 hover:shadow-md cursor-pointer transition-all group relative`}>
                        {productosEnCompra.some(x => x.id_producto === prod.productoId) && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 z-10 shadow-sm"><IoMdCheckmark /></div>
                        )}
                        <div className={`aspect-square ${isDark ? 'bg-neutral-800' : 'bg-gray-100'} rounded-lg mb-3 overflow-hidden flex items-center justify-center`}>
                          {prod.imagen ? <img src={`${API_URL}${prod.imagen}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={prod.nombre} /> : <IoMdImage className={`text-3xl ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />}
                        </div>
                        <h4 className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm line-clamp-2 leading-tight mb-1`}>{prod.nombre}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{prod.codigo}</span>
                            {prod.unidadMedida && prod.unidadMedida !== 'UNIDAD' && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDark ? 'bg-neutral-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{prod.unidadMedida}</span>
                            )}
                          </div>
                          <span className={`text-sm font-bold text-[#E0312A] ${isDark ? 'bg-[#E0312A]/20' : 'bg-[#E0312A]/10'} px-2 py-0.5 rounded`}>S/ {prod.precio_compra}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className={`p-4 border-t ${isDark ? 'border-neutral-800 bg-[#171717]' : 'border-gray-100 bg-white'}`}>
                  <div className="flex items-center justify-center gap-1">
                    {/* Primera página */}
                    <button
                      onClick={() => setProductModalPage(1)}
                      disabled={productModalPage === 1}
                      className={`p-2 rounded-lg transition-colors ${productModalPage === 1
                        ? `${isDark ? 'text-gray-600' : 'text-gray-300'} cursor-not-allowed`
                        : `${isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-500 hover:bg-gray-100'}`}`}
                    >
                      <FiChevronsLeft size={18} />
                    </button>

                    {/* Anterior */}
                    <button
                      onClick={() => setProductModalPage(p => Math.max(1, p - 1))}
                      disabled={productModalPage === 1}
                      className={`p-2 rounded-lg transition-colors ${productModalPage === 1
                        ? `${isDark ? 'text-gray-600' : 'text-gray-300'} cursor-not-allowed`
                        : `${isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-500 hover:bg-gray-100'}`}`}
                    >
                      <FiChevronLeft size={18} />
                    </button>

                    {/* Números de página */}
                    {getPageNumbers().map((page, idx) => (
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className={`px-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setProductModalPage(page as number)}
                          className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-colors ${
                            productModalPage === page
                              ? 'bg-[#E0312A] text-white'
                              : `${isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-600 hover:bg-gray-100'}`
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}

                    {/* Siguiente */}
                    <button
                      onClick={() => setProductModalPage(p => Math.min(totalPages, p + 1))}
                      disabled={productModalPage === totalPages}
                      className={`p-2 rounded-lg transition-colors ${productModalPage === totalPages
                        ? `${isDark ? 'text-gray-600' : 'text-gray-300'} cursor-not-allowed`
                        : `${isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-500 hover:bg-gray-100'}`}`}
                    >
                      <FiChevronRight size={18} />
                    </button>

                    {/* Última página */}
                    <button
                      onClick={() => setProductModalPage(totalPages)}
                      disabled={productModalPage === totalPages}
                      className={`p-2 rounded-lg transition-colors ${productModalPage === totalPages
                        ? `${isDark ? 'text-gray-600' : 'text-gray-300'} cursor-not-allowed`
                        : `${isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-500 hover:bg-gray-100'}`}`}
                    >
                      <FiChevronsRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* --- MODAL BARCODE --- */}
      {barcodeModalOpen && currentBarcodeData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm`} onClick={() => setBarcodeModalOpen(false)}></div>
          <div className={`relative ${isDark ? 'bg-[#171717]' : 'bg-white'} rounded-2xl shadow-xl max-w-sm w-full p-6 animate-zoomIn text-center`}>
            <h3 className={`text-lg font-bold ${heading} mb-1`}>{currentBarcodeData.nombre}</h3>
            <p className={`text-sm ${textTertiary} mb-6 font-mono tracking-wider`}>{currentBarcodeData.codigoBarras}</p>
            <div className={`border ${isDark ? 'border-neutral-800 bg-[#0a0a0a]' : 'border-gray-100 bg-white'} rounded-xl p-4 mb-6 shadow-inner flex justify-center`}>
              <img src={`https://barcode.tec-it.com/barcode.ashx?data=${currentBarcodeData.codigoBarras}&code=Code128&translate-esc=on`} alt="barcode" className="max-w-full h-auto" />
            </div>
            <div className="flex gap-3">
              <button onClick={copyBarcode} className={`flex-1 py-2.5 ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} font-bold rounded-lg transition-colors flex items-center justify-center gap-2`}><IoMdCopy /> Copiar</button>
              <button onClick={printBarcode} className={`flex-1 py-2.5 bg-[#E0312A] hover:bg-[#A91E16] text-white font-bold rounded-lg shadow-lg ${isDark ? 'shadow-[#E0312A]/20' : 'shadow-[#E0312A]/30'} transition-colors flex items-center justify-center gap-2`}><IoMdPrint /> Imprimir</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CANCELAR --- */}
      {showCancelModal && (
        <div className={`fixed inset-0 z-[130] ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm flex items-center justify-center p-4`}>
          <div className={`${isDark ? 'bg-[#171717]' : 'bg-white'} rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-zoomIn`}>
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"><IoIosWarning /></div>
            <h3 className={`text-xl font-bold ${heading} mb-2`}>Cancelar esta compra?</h3>
            <p className={`${textTertiary} text-sm mb-6`}>Si sales ahora, perderas todos los productos agregados a la lista.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className={`flex-1 py-3 border ${isDark ? 'border-neutral-700 text-gray-300 hover:bg-neutral-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} font-bold rounded-xl transition-colors`}>Continuar editando</button>
              <button onClick={() => navigate('/compras')} className={`flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 shadow-lg ${isDark ? 'shadow-rose-900/30' : 'shadow-rose-200'} transition-colors`}>Si, Salir</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRMACION DE GUARDADO --- */}
      {showConfirmModal && (
        <div className={`fixed inset-0 z-[140] ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm flex items-center justify-center p-4`}>
          <div className={`${isDark ? 'bg-[#171717]' : 'bg-white'} rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-zoomIn`}>

            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${isDark ? 'bg-[#E0312A]/20' : 'bg-[#E0312A]/10'} text-[#E0312A] rounded-full flex items-center justify-center mx-auto mb-4`}>
                <IoMdCheckmark className="text-3xl" />
              </div>
              <h3 className={`text-xl font-bold ${heading} mb-1`}>Confirmar Registro</h3>
              <p className={`${textTertiary} text-sm`}>Estas seguro de registrar esta compra por <br/> <strong className={heading}>S/ {totalAPagar.toFixed(2)}</strong>?</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={registrarCompra}
                disabled={isSaving}
                className={`w-full py-3.5 bg-[#E0312A] hover:bg-[#A91E16] text-white font-bold rounded-xl shadow-lg ${isDark ? 'shadow-[#E0312A]/20' : 'shadow-[#E0312A]/30'} transition-all flex items-center justify-center gap-2 disabled:opacity-70`}
              >
                {isSaving ? 'Guardando...' : 'Si, Guardar Compra'}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className={`w-full py-3.5 ${isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-500 hover:bg-gray-50'} font-bold rounded-xl transition-colors`}
              >
                Revisar detalles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CAMBIO DE PROVEEDOR --- */}
      {showProveedorChangeModal && (
        <div className={`fixed inset-0 z-[150] ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm flex items-center justify-center p-4`}>
          <div className={`${isDark ? 'bg-[#171717]' : 'bg-white'} rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-zoomIn`}>
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              <IoIosWarning />
            </div>
            <h3 className={`text-xl font-bold ${heading} mb-2`}>Cambiar de Proveedor?</h3>
            <p className={`${textTertiary} text-sm mb-2`}>
              Tienes <strong className="text-amber-600">{productosEnCompra.length} producto{productosEnCompra.length > 1 ? 's' : ''}</strong> agregado{productosEnCompra.length > 1 ? 's' : ''} en la lista actual.
            </p>
            <p className={`${textTertiary} text-sm mb-6`}>
              Si cambias de proveedor, <strong className="text-rose-500">se eliminaran todos los productos</strong> y tendras que seleccionar nuevos del catalogo del nuevo proveedor.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelarCambioProveedor}
                className={`flex-1 py-3 border ${isDark ? 'border-neutral-700 text-gray-300 hover:bg-neutral-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} font-bold rounded-xl transition-colors`}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCambioProveedor}
                className={`flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-lg ${isDark ? 'shadow-amber-900/30' : 'shadow-amber-200'} transition-colors`}
              >
                Si, Cambiar
              </button>
            </div>
          </div>
        </div>
      )}

    </PageWrapper>
  );
}
