import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiTruck,
  FiMap,
  FiUser,
  FiPackage,
  FiSearch,
  FiX,
  FiChevronRight,
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronsRight,
  FiMapPin,
  FiClock,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle
} from "react-icons/fi";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import PageWrapper from "../../components/ui/PageWrapper";
import { envioService } from "../../services/envios/envioService";
import type {
  EnvioResponse,
  EnvioRequest,
  Vehiculo,
  Conductor,
  Ruta,
  VentaResumen
} from "../../services/envios/envioService";

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Colores profesionales del logo
const COLORS = {
  primary: '#E0312A',
  primaryLight: '#F0726A',
  primaryDark: '#A91E16',
  secondary: '#1e3a5f',
  accent: '#0ea5e9',
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
};

// Constante de paginación
const ITEMS_PER_PAGE = 10;

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 16); }, [map, lat, lng]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

type TabType = "envios" | "conductores" | "rutas";

const DEFAULT_LAT = -12.0464;
const DEFAULT_LNG = -77.0428;

const getNombreConductor = (c: Conductor) =>
  `${c.nombres ?? ""} ${c.apellidoPaterno ?? ""}`.trim() || "Sin nombre";

// Genera código de venta visual: VTA-0001, VTA-0042, etc.
const generarCodigoVenta = (id: number) => `VTA-${String(id).padStart(4, '0')}`;

// Genera código de envío visual: ENV-0001, ENV-0042, etc.
const generarCodigoEnvio = (id: number) => `ENV-${String(id).padStart(4, '0')}`;

export default function Envios() {
  const { isDark } = useThemeClasses();

  const [activeTab, setActiveTab] = useState<TabType>("envios");

  // Data
  const [envios, setEnvios] = useState<EnvioResponse[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [ventas, setVentas] = useState<VentaResumen[]>([]);
  const [conductorVehiculoMap, setConductorVehiculoMap] = useState<Record<number, number>>({});

  // UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: TabType; id: number; label: string } | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Envio
  const [envioSeleccionado, setEnvioSeleccionado] = useState<EnvioResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [ventaSearchTerm, setVentaSearchTerm] = useState("");
  const [ventaFechaFilter, setVentaFechaFilter] = useState("");
  const [envioForm, setEnvioForm] = useState({
    idVenta: "", idConductor: "", idRuta: "",
    direccionEnvio: "", costoTransporte: "", observaciones: "",
    fechaEnvio: "", fechaEntrega: ""
  });

  // Map
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number }>({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [hasMarker, setHasMarker] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [reversingGeocode, setReversingGeocode] = useState(false);
  const addressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Conductor (with vehicle)
  const [conductorEdit, setConductorEdit] = useState<Conductor | null>(null);
  const [conductorForm, setConductorForm] = useState({
    nombres: "", apellidoPaterno: "", apellidoMaterno: "", telefono: "", numeroDocumento: "",
    licencia: "", categoriaLicencia: "",
    placa: "", marca: "", modelo: "", capacidadKg: ""
  });

  // Ruta
  const [rutaEdit, setRutaEdit] = useState<Ruta | null>(null);
  const [rutaForm, setRutaForm] = useState({
    nombre: "", origen: "", destino: "", distanciaKm: "", tiempoEstimadoHoras: "", costoBase: ""
  });

  // ── Fetch data ──
  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [e, v, c, r, vt] = await Promise.all([
        envioService.fetchEnvios(),
        envioService.fetchVehiculos(),
        envioService.fetchConductores(),
        envioService.fetchRutas(),
        envioService.fetchVentas(),
      ]);
      setEnvios(e); setVehiculos(v); setConductores(c); setRutas(r); setVentas(vt);
      const cvMap: Record<number, number> = {};
      for (const env of e) {
        if (env.nombreConductor && env.placaVehiculo) {
          const cMatch = c.find((cd) => getNombreConductor(cd) === env.nombreConductor);
          const vMatch = v.find((vh) => vh.placa === env.placaVehiculo);
          if (cMatch && vMatch) cvMap[cMatch.id] = vMatch.id;
        }
      }
      setConductorVehiculoMap((prev) => ({ ...cvMap, ...prev }));
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally { setLoading(false); }
  };

  // ── Computed ──
  const enviosFiltrados = useMemo(() => {
    return envios.filter((envio) => {
      const term = searchTerm.toLowerCase().trim();
      const codigoEnvio = generarCodigoEnvio(envio.id).toLowerCase();
      const codigoVenta = envio.idVenta ? generarCodigoVenta(envio.idVenta).toLowerCase() : "";
      const matchSearch = !searchTerm ||
        String(envio.id).includes(term) ||
        codigoEnvio.includes(term) ||
        codigoVenta.includes(term) ||
        (envio.nombreCliente ?? "").toLowerCase().includes(term) ||
        (envio.direccionEnvio ?? "").toLowerCase().includes(term) ||
        (envio.nombreRuta ?? "").toLowerCase().includes(term);
      const matchEstado = !filterEstado || envio.estado === filterEstado;
      return matchSearch && matchEstado;
    });
  }, [envios, searchTerm, filterEstado]);

  // Paginación calculada
  const totalPages = Math.ceil(enviosFiltrados.length / ITEMS_PER_PAGE);
  const paginatedEnvios = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return enviosFiltrados.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [enviosFiltrados, currentPage]);

  // Reset página cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado]);

  const ventasDisponibles = useMemo(() => {
    const conEnvio = new Set(envios.map((e) => e.idVenta).filter(Boolean));
    return ventas.filter((v) => v.estado === "PENDIENTE" && !conEnvio.has(v.id));
  }, [ventas, envios]);

  const MAX_VENTAS_VISIBLES = 50;
  const ventasFiltradas = useMemo(() => {
    let filtered = ventasDisponibles;
    if (ventaSearchTerm.trim()) {
      const term = ventaSearchTerm.toLowerCase().trim();
      filtered = filtered.filter((v) => {
        const codigoVenta = generarCodigoVenta(v.id).toLowerCase();
        return (
          (v.nombreCliente ?? "").toLowerCase().includes(term) ||
          codigoVenta.includes(term)
        );
      });
    }
    if (ventaFechaFilter) {
      filtered = filtered.filter((v) => {
        if (!v.fecha) return false;
        const ventaDate = v.fecha.split('T')[0];
        return ventaDate === ventaFechaFilter;
      });
    }
    return filtered;
  }, [ventasDisponibles, ventaSearchTerm, ventaFechaFilter]);

  const ventasVisibles = useMemo(() => ventasFiltradas.slice(0, MAX_VENTAS_VISIBLES), [ventasFiltradas]);
  const hayMasVentas = ventasFiltradas.length > MAX_VENTAS_VISIBLES;

  const getVehiculoForConductor = useCallback((conductorId: number): Vehiculo | null => {
    const vId = conductorVehiculoMap[conductorId];
    if (!vId) return null;
    return vehiculos.find((v) => v.id === vId) ?? null;
  }, [conductorVehiculoMap, vehiculos]);

  // ── Address search (Nominatim) ──
  const [searchError, setSearchError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);

  const searchAddress = useCallback((query: string) => {
    if (addressTimeout.current) clearTimeout(addressTimeout.current);
    setSearchError(null);
    setNoResults(false);

    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingAddress(true);
    setShowSuggestions(true);

    addressTimeout.current = setTimeout(async () => {
      try {
        const searchQuery = query.includes("Peru") || query.includes("Lima")
          ? query
          : `${query}, Peru`;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=6&addressdetails=1`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'PeruMarketERP/1.0'
            }
          }
        );

        if (!res.ok) {
          throw new Error('Error en la búsqueda');
        }

        const data: NominatimResult[] = await res.json();
        setAddressSuggestions(data);
        setNoResults(data.length === 0);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error buscando dirección:", err);
        setSearchError("Error al buscar. Intenta de nuevo.");
        setAddressSuggestions([]);
      } finally {
        setSearchingAddress(false);
      }
    }, 500);
  }, []);

  const selectAddress = (result: NominatimResult) => {
    setEnvioForm((p) => ({ ...p, direccionEnvio: result.display_name }));
    setMapCoords({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setHasMarker(true);
    setShowSuggestions(false);
    setNoResults(false);
    setSearchError(null);
  };

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setMapCoords({ lat, lng });
    setHasMarker(true);
    setReversingGeocode(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await res.json();
      if (data.display_name) {
        setEnvioForm((p) => ({ ...p, direccionEnvio: data.display_name }));
      }
    } catch (err) {
      console.error("Error reverse geocoding:", err);
    } finally { setReversingGeocode(false); }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── KPI ──
  const kpiTotal = envios.length;
  const kpiEnRuta = envios.filter((e) => e.estado === "EN_RUTA").length;
  const kpiPendientes = envios.filter((e) => e.estado === "PENDIENTE").length;
  const kpiEntregados = envios.filter((e) => e.estado === "ENTREGADO").length;

  // ── Style helpers ──
  const getEstadoStyle = (estado: string) => {
    const styles: Record<string, string> = {
      ENTREGADO: isDark ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      EN_RUTA: isDark ? 'bg-blue-900/40 text-blue-400 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200',
      PENDIENTE: isDark ? 'bg-amber-900/40 text-amber-400 border-amber-700' : 'bg-amber-50 text-amber-700 border-amber-200',
      CANCELADO: isDark ? 'bg-rose-900/40 text-rose-400 border-rose-700' : 'bg-rose-50 text-rose-700 border-rose-200',
      DISPONIBLE: isDark ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      ACTIVO: isDark ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      INACTIVO: isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200',
      MANTENIMIENTO: isDark ? 'bg-orange-900/40 text-orange-400 border-orange-700' : 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return styles[estado] ?? (isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200');
  };

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleDateString("es-PE"); } catch { return d; }
  };

  // ══════════════ ENVIO HANDLERS ══════════════
  const resetEnvioForm = () => {
    setEnvioForm({ idVenta: "", idConductor: "", idRuta: "", direccionEnvio: "", costoTransporte: "", observaciones: "", fechaEnvio: "", fechaEntrega: "" });
    setIsEditing(false); setEnvioSeleccionado(null);
    setMapCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG }); setHasMarker(false);
    setAddressSuggestions([]); setShowSuggestions(false);
    setSearchError(null); setNoResults(false);
    setVentaSearchTerm(""); setVentaFechaFilter("");
  };

  const handleNuevoEnvio = () => { resetEnvioForm(); setShowModal(true); };

  const handleEditarEnvio = (envio: EnvioResponse) => {
    setEnvioSeleccionado(envio); setIsEditing(true);
    const cMatch = conductores.find((c) => getNombreConductor(c) === envio.nombreConductor);
    const rMatch = rutas.find((r) => r.nombre === envio.nombreRuta);
    setEnvioForm({
      idVenta: envio.idVenta != null ? String(envio.idVenta) : "",
      idConductor: cMatch ? String(cMatch.id) : "",
      idRuta: rMatch ? String(rMatch.id) : "",
      direccionEnvio: envio.direccionEnvio ?? "",
      costoTransporte: envio.costoTransporte != null ? String(envio.costoTransporte) : "",
      observaciones: envio.observaciones ?? "",
      fechaEnvio: envio.fechaEnvio ?? "",
      fechaEntrega: envio.fechaEntrega ?? "",
    });
    setMapCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG }); setHasMarker(false);
    setShowModal(true);
  };

  const handleSubmitEnvio = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    let idVehiculo: number | undefined;
    if (envioForm.idConductor) {
      const veh = getVehiculoForConductor(Number(envioForm.idConductor));
      if (veh) idVehiculo = veh.id;
    }
    const payload: EnvioRequest = {
      direccionEnvio: envioForm.direccionEnvio,
      ...(envioForm.idVenta ? { idVenta: Number(envioForm.idVenta) } : {}),
      ...(idVehiculo ? { idVehiculo } : {}),
      ...(envioForm.idConductor ? { idConductor: Number(envioForm.idConductor) } : {}),
      ...(envioForm.idRuta ? { idRuta: Number(envioForm.idRuta) } : {}),
      ...(envioForm.costoTransporte ? { costoTransporte: Number(envioForm.costoTransporte) } : {}),
      ...(envioForm.observaciones ? { observaciones: envioForm.observaciones } : {}),
      ...(envioForm.fechaEnvio ? { fechaEnvio: envioForm.fechaEnvio } : {}),
      ...(envioForm.fechaEntrega ? { fechaEntrega: envioForm.fechaEntrega } : {}),
    };
    try {
      if (isEditing && envioSeleccionado) await envioService.actualizarEnvio(envioSeleccionado.id, payload);
      else await envioService.crearEnvio(payload);
      await cargarDatos(); setShowModal(false); resetEnvioForm();
    } catch (error) { console.error("Error al guardar envio:", error); }
    finally { setSaving(false); }
  };

  const cambiarEstado = async (envioId: number, nuevoEstado: string) => {
    try { await envioService.actualizarEstado(envioId, nuevoEstado); await cargarDatos(); }
    catch (error) { console.error("Error al cambiar estado:", error); }
  };

  // ══════════════ CONDUCTOR HANDLERS ══════════════
  const resetConductorForm = () => { setConductorForm({ nombres: "", apellidoPaterno: "", apellidoMaterno: "", telefono: "", numeroDocumento: "", licencia: "", categoriaLicencia: "", placa: "", marca: "", modelo: "", capacidadKg: "" }); setConductorEdit(null); setIsEditing(false); };
  const handleNuevoConductor = () => { resetConductorForm(); setShowModal(true); };
  const handleEditarConductor = (c: Conductor) => {
    setConductorEdit(c); setIsEditing(true);
    const veh = getVehiculoForConductor(c.id);
    setConductorForm({ nombres: c.nombres ?? "", apellidoPaterno: c.apellidoPaterno ?? "", apellidoMaterno: c.apellidoMaterno ?? "", telefono: c.telefono ?? "", numeroDocumento: c.numeroDocumento ?? "", licencia: c.licencia, categoriaLicencia: c.categoriaLicencia ?? "", placa: veh?.placa ?? "", marca: veh?.marca ?? "", modelo: veh?.modelo ?? "", capacidadKg: veh?.capacidadKg ? String(veh.capacidadKg) : "" });
    setShowModal(true);
  };

  const handleSubmitConductor = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (isEditing && conductorEdit) {
        await envioService.actualizarConductor(conductorEdit.id, { nombres: conductorForm.nombres, apellidoPaterno: conductorForm.apellidoPaterno, apellidoMaterno: conductorForm.apellidoMaterno || undefined, telefono: conductorForm.telefono || undefined, numeroDocumento: conductorForm.numeroDocumento || undefined, licencia: conductorForm.licencia, categoriaLicencia: conductorForm.categoriaLicencia || undefined });
        const existingVeh = getVehiculoForConductor(conductorEdit.id);
        if (conductorForm.placa) {
          const vPayload = { placa: conductorForm.placa, marca: conductorForm.marca || undefined, modelo: conductorForm.modelo || undefined, capacidadKg: conductorForm.capacidadKg ? Number(conductorForm.capacidadKg) : undefined };
          if (existingVeh) await envioService.actualizarVehiculo(existingVeh.id, vPayload);
          else { const nv = await envioService.crearVehiculo(vPayload); setConductorVehiculoMap((p) => ({ ...p, [conductorEdit.id]: nv.id })); }
        }
      } else {
        let newVehiculoId: number | undefined;
        if (conductorForm.placa) {
          const veh = await envioService.crearVehiculo({ placa: conductorForm.placa, marca: conductorForm.marca || undefined, modelo: conductorForm.modelo || undefined, capacidadKg: conductorForm.capacidadKg ? Number(conductorForm.capacidadKg) : undefined });
          newVehiculoId = veh.id;
        }
        const nc = await envioService.crearConductor({ nombres: conductorForm.nombres, apellidoPaterno: conductorForm.apellidoPaterno, apellidoMaterno: conductorForm.apellidoMaterno || undefined, telefono: conductorForm.telefono || undefined, numeroDocumento: conductorForm.numeroDocumento || undefined, licencia: conductorForm.licencia, categoriaLicencia: conductorForm.categoriaLicencia || undefined });
        if (newVehiculoId) setConductorVehiculoMap((p) => ({ ...p, [nc.id]: newVehiculoId }));
      }
      await cargarDatos(); setShowModal(false); resetConductorForm();
    } catch (error) { console.error("Error al guardar conductor:", error); }
    finally { setSaving(false); }
  };

  // ══════════════ RUTA HANDLERS ══════════════
  const resetRutaForm = () => { setRutaForm({ nombre: "", origen: "", destino: "", distanciaKm: "", tiempoEstimadoHoras: "", costoBase: "" }); setRutaEdit(null); setIsEditing(false); };
  const handleNuevaRuta = () => { resetRutaForm(); setShowModal(true); };
  const handleEditarRuta = (r: Ruta) => {
    setRutaEdit(r); setIsEditing(true);
    setRutaForm({ nombre: r.nombre, origen: r.origen, destino: r.destino, distanciaKm: r.distanciaKm ? String(r.distanciaKm) : "", tiempoEstimadoHoras: r.tiempoEstimadoHoras ? String(r.tiempoEstimadoHoras) : "", costoBase: r.costoBase ? String(r.costoBase) : "" });
    setShowModal(true);
  };

  const handleSubmitRuta = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { nombre: rutaForm.nombre, origen: rutaForm.origen, destino: rutaForm.destino, distanciaKm: rutaForm.distanciaKm ? Number(rutaForm.distanciaKm) : undefined, tiempoEstimadoHoras: rutaForm.tiempoEstimadoHoras ? Number(rutaForm.tiempoEstimadoHoras) : undefined, costoBase: rutaForm.costoBase ? Number(rutaForm.costoBase) : undefined };
    try {
      if (isEditing && rutaEdit) await envioService.actualizarRuta(rutaEdit.id, payload);
      else await envioService.crearRuta(payload);
      await cargarDatos(); setShowModal(false); resetRutaForm();
    } catch (error) { console.error("Error al guardar ruta:", error); }
    finally { setSaving(false); }
  };

  // ══════════════ DELETE ══════════════
  const handleDelete = (type: TabType, id: number, label: string) => { setDeleteTarget({ type, id, label }); setShowDeleteModal(true); };
  const confirmarEliminar = async () => {
    if (!deleteTarget) return;
    try {
      switch (deleteTarget.type) {
        case "envios": await envioService.eliminarEnvio(deleteTarget.id); break;
        case "conductores": { const veh = getVehiculoForConductor(deleteTarget.id); await envioService.eliminarConductor(deleteTarget.id); if (veh) { try { await envioService.eliminarVehiculo(veh.id); } catch { /* ignore */ } } break; }
        case "rutas": await envioService.eliminarRuta(deleteTarget.id); break;
      }
      await cargarDatos();
    } catch (error) { console.error("Error al eliminar:", error); }
    finally { setShowDeleteModal(false); setDeleteTarget(null); }
  };

  // ══════════════ HELPERS ══════════════
  const closeModal = () => { setShowModal(false); resetEnvioForm(); resetConductorForm(); resetRutaForm(); };
  const handleNuevo = () => { switch (activeTab) { case "envios": handleNuevoEnvio(); break; case "conductores": handleNuevoConductor(); break; case "rutas": handleNuevaRuta(); break; } };

  const btnLabel: Record<TabType, string> = { envios: "Nuevo Envio", conductores: "Nuevo Conductor", rutas: "Nueva Ruta" };

  // Clases reutilizables
  const cardClass = `rounded-xl overflow-hidden ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200 shadow-sm'}`;
  const inputClass = `w-full p-3 rounded-xl border transition-all focus:ring-2 focus:ring-[#E0312A] focus:border-transparent ${isDark ? 'bg-neutral-800 border-neutral-700 text-gray-200 placeholder-gray-500' : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'}`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  // Paginación - Generador de páginas
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // ══════════════ RENDER ══════════════
  return (
    <PageWrapper
      title="Gestion de Envios"
      subtitle="Administra envios, conductores y rutas de manera centralizada"
      icon={<FiTruck />}
      actions={[
        { label: btnLabel[activeTab], onClick: handleNuevo, icon: <FiPlus size={18} />, variant: 'primary' },
      ]}
    >
      <div className="space-y-6">

        {/* KPI Cards - Solo para envios */}
        {activeTab === "envios" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Envios", value: loading ? "—" : kpiTotal, icon: <FiPackage />, color: COLORS.primary },
              { label: "En Ruta", value: loading ? "—" : kpiEnRuta, icon: <FiTruck />, color: COLORS.accent },
              { label: "Pendientes", value: loading ? "—" : kpiPendientes, icon: <FiClock />, color: COLORS.warning },
              { label: "Entregados", value: loading ? "—" : kpiEntregados, icon: <FiCheckCircle />, color: COLORS.success },
            ].map((kpi, i) => (
              <div key={i} className={cardClass}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {kpi.label}
                    </p>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}15` }}>
                      <div style={{ color: kpi.color }}>{kpi.icon}</div>
                    </div>
                  </div>
                  <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {kpi.value}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
          {[
            { id: "envios", label: "Envios", icon: <FiTruck />, count: envios.length },
            { id: "conductores", label: "Conductores", icon: <FiUser />, count: conductores.length },
            { id: "rutas", label: "Rutas", icon: <FiMap />, count: rutas.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? `${isDark ? 'bg-[#171717] text-white shadow-lg' : 'bg-white text-gray-900 shadow-sm'}`
                  : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id
                  ? 'text-white'
                  : isDark ? 'bg-neutral-700 text-gray-400' : 'bg-gray-200 text-gray-500'
              }`} style={activeTab === tab.id ? { backgroundColor: COLORS.primary } : {}}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filtros (solo para envios) */}
        {activeTab === "envios" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Buscar por codigo (ENV-0001, VTA-0063), cliente, direccion..."
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-[#E0312A] focus:border-transparent ${isDark ? 'bg-neutral-800 border-neutral-700 text-gray-200 placeholder-gray-500' : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className={`w-full sm:w-48 px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-[#E0312A] focus:border-transparent ${isDark ? 'bg-neutral-800 border-neutral-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`}
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_RUTA">En Ruta</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        )}

        {/* ═══════ TAB: ENVIOS ═══════ */}
        {activeTab === "envios" && (
          <div className={cardClass}>
            {/* Desktop table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={isDark ? 'bg-neutral-800' : 'bg-gray-50'}>
                  <tr>
                    {["Codigo", "Venta", "Cliente", "Direccion", "Conductor / Vehiculo", "Ruta", "Fecha", "Estado", "Acciones"].map((h) => (
                      <th key={h} className={`p-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-12">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${COLORS.primary}40`, borderTopColor: 'transparent' }}></div>
                          <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Cargando envios...</span>
                        </div>
                      </td>
                    </tr>
                  ) : enviosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={`p-12 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <FiAlertCircle className="mx-auto mb-2 text-3xl opacity-40" />
                        No se encontraron envios
                      </td>
                    </tr>
                  ) : paginatedEnvios.map((envio) => (
                    <tr key={envio.id} className={`border-t transition-colors ${isDark ? 'border-neutral-800 hover:bg-neutral-800/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className={`p-4 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{generarCodigoEnvio(envio.id)}</td>
                      <td className="p-4 font-medium" style={{ color: COLORS.primary }}>{envio.idVenta ? generarCodigoVenta(envio.idVenta) : "-"}</td>
                      <td className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{envio.nombreCliente ?? "-"}</td>
                      <td className={`p-4 max-w-[180px] truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{envio.direccionEnvio ?? "-"}</td>
                      <td className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div>{envio.nombreConductor ?? "-"}</div>
                        {envio.placaVehiculo && <div className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><FiTruck size={11} />{envio.placaVehiculo}</div>}
                      </td>
                      <td className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{envio.nombreRuta ?? "-"}</td>
                      <td className={`p-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(envio.fechaEnvio)}</td>
                      <td className="p-4">
                        <select value={envio.estado} onChange={(e) => cambiarEstado(envio.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all ${getEstadoStyle(envio.estado)}`}>
                          <option value="PENDIENTE">PENDIENTE</option>
                          <option value="EN_RUTA">EN RUTA</option>
                          <option value="ENTREGADO">ENTREGADO</option>
                          <option value="CANCELADO">CANCELADO</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => { setEnvioSeleccionado(envio); setShowDetailModal(true); }}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            style={{ color: COLORS.primary }}
                            title="Ver">
                            <FiEye size={16} />
                          </button>
                          <button onClick={() => handleEditarEnvio(envio)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            title="Editar">
                            <FiEdit size={16} />
                          </button>
                          <button onClick={() => handleDelete("envios", envio.id, `Envio ${generarCodigoEnvio(envio.id)}`)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                            title="Eliminar">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {!loading && enviosFiltrados.length > ITEMS_PER_PAGE && (
              <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, enviosFiltrados.length)} de {enviosFiltrados.length} envios
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${currentPage === 1 ? `${isDark ? 'text-gray-600' : 'text-gray-300'} cursor-not-allowed` : `${isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-500 hover:bg-gray-100'}`}`}
                  >
                    <FiChevronsLeft size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${currentPage === 1 ? `${isDark ? 'text-gray-600' : 'text-gray-300'} cursor-not-allowed` : `${isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-500 hover:bg-gray-100'}`}`}
                  >
                    <FiChevronLeft size={18} />
                  </button>

                  {getPageNumbers().map((page, idx) => (
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className={`px-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-colors ${
                          currentPage === page
                            ? 'text-white'
                            : `${isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-600 hover:bg-gray-100'}`
                        }`}
                        style={currentPage === page ? { backgroundColor: COLORS.primary } : {}}
                      >
                        {page}
                      </button>
                    )
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${currentPage === totalPages ? `${isDark ? 'text-gray-600' : 'text-gray-300'} cursor-not-allowed` : `${isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-500 hover:bg-gray-100'}`}`}
                  >
                    <FiChevronRight size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${currentPage === totalPages ? `${isDark ? 'text-gray-600' : 'text-gray-300'} cursor-not-allowed` : `${isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-500 hover:bg-gray-100'}`}`}
                  >
                    <FiChevronsRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ TAB: CONDUCTORES ═══════ */}
        {activeTab === "conductores" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className={`h-48 rounded-xl animate-pulse ${isDark ? 'bg-neutral-800' : 'bg-gray-200'}`} />
              ))
            ) : conductores.length === 0 ? (
              <div className={`sm:col-span-2 lg:col-span-3 text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <FiUser className="mx-auto mb-2 text-4xl opacity-30" />
                <p>No hay conductores registrados</p>
              </div>
            ) : conductores.map((c) => {
              const veh = getVehiculoForConductor(c.id);
              return (
                <div key={c.id} className={`${cardClass} p-5 transition-all hover:shadow-lg`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 rounded-lg text-white" style={{ backgroundColor: COLORS.primary }}>
                      <FiUser className="text-xl" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getEstadoStyle(c.estado ?? "ACTIVO")}`}>{c.estado ?? "ACTIVO"}</span>
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{getNombreConductor(c)}</h3>
                  {c.numeroDocumento && <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Doc: {c.numeroDocumento}</p>}
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Licencia: {c.licencia}</p>
                  {c.categoriaLicencia && <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Categoria: {c.categoriaLicencia}</p>}
                  {c.telefono && <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Tel: {c.telefono}</p>}
                  {veh && (
                    <div className={`mt-3 p-3 rounded-lg flex items-center gap-3 border ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-gray-50 border-gray-100'}`}>
                      <FiTruck style={{ color: COLORS.primary }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: COLORS.primary }}>{veh.placa}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{veh.marca} {veh.modelo}{veh.capacidadKg ? ` - ${veh.capacidadKg} kg` : ""}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleEditarConductor(c)} className={`flex-1 flex items-center justify-center gap-1 p-2.5 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                      <FiEdit size={14} /> Editar
                    </button>
                    <button onClick={() => handleDelete("conductores", c.id, getNombreConductor(c))} className={`flex-1 flex items-center justify-center gap-1 p-2.5 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}>
                      <FiTrash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════ TAB: RUTAS ═══════ */}
        {activeTab === "rutas" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className={`h-48 rounded-xl animate-pulse ${isDark ? 'bg-neutral-800' : 'bg-gray-200'}`} />
              ))
            ) : rutas.length === 0 ? (
              <div className={`sm:col-span-2 lg:col-span-3 text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <FiMap className="mx-auto mb-2 text-4xl opacity-30" />
                <p>No hay rutas registradas</p>
              </div>
            ) : rutas.map((r) => (
              <div key={r.id} className={`${cardClass} p-5 transition-all hover:shadow-lg`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-lg text-white" style={{ backgroundColor: COLORS.primaryDark }}>
                    <FiMap className="text-xl" />
                  </div>
                  {r.costoBase != null && (
                    <span className="text-sm font-bold" style={{ color: COLORS.primary }}>S/ {r.costoBase.toFixed(2)}</span>
                  )}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{r.nombre}</h3>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>{r.origen}</span>
                  <FiChevronRight className="flex-shrink-0" />
                  <span>{r.destino}</span>
                </div>
                <div className={`flex gap-4 mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {r.distanciaKm && <span>{r.distanciaKm} km</span>}
                  {r.tiempoEstimadoHoras && <span>{r.tiempoEstimadoHoras} hrs</span>}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleEditarRuta(r)} className={`flex-1 flex items-center justify-center gap-1 p-2.5 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                    <FiEdit size={14} /> Editar
                  </button>
                  <button onClick={() => handleDelete("rutas", r.id, r.nombre)} className={`flex-1 flex items-center justify-center gap-1 p-2.5 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}>
                    <FiTrash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════ CREATE/EDIT MODAL ═══════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm`} onClick={closeModal}></div>
          <div className={`relative ${isDark ? 'bg-[#171717]' : 'bg-white'} rounded-2xl shadow-2xl w-full ${activeTab === "envios" ? "max-w-4xl" : "max-w-lg"} max-h-[92dvh] overflow-y-auto border ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
            <div className={`p-5 border-b ${isDark ? 'border-neutral-800' : 'border-gray-100'} flex justify-between items-center sticky top-0 ${isDark ? 'bg-[#171717]' : 'bg-white'} z-10`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg text-white" style={{ backgroundColor: COLORS.primary }}>
                  {{ envios: <FiTruck size={18} />, conductores: <FiUser size={18} />, rutas: <FiMap size={18} /> }[activeTab]}
                </div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {isEditing ? "Editar" : "Crear"} {{ envios: "Envio", conductores: "Conductor", rutas: "Ruta" }[activeTab]}
                </h2>
              </div>
              <button onClick={closeModal} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><FiX size={20} /></button>
            </div>

            {/* ── ENVIO FORM ── */}
            {activeTab === "envios" && (
              <form onSubmit={handleSubmitEnvio} className="p-5">
                {/* Venta selector */}
                {!isEditing && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-bold" style={{ color: COLORS.primary }}>
                        <FiPackage />Seleccionar Venta Pendiente *
                      </label>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-neutral-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {(ventaSearchTerm || ventaFechaFilter) ? `${ventasFiltradas.length} resultado${ventasFiltradas.length !== 1 ? 's' : ''}` : `${ventasDisponibles.length} disponible${ventasDisponibles.length !== 1 ? 's' : ''}`}
                      </span>
                    </div>

                    {/* Filtros de ventas */}
                    {ventasDisponibles.length > 0 && (
                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <div className="relative flex-1">
                          <FiUser className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                          <input type="text" placeholder="Buscar por codigo o cliente..." value={ventaSearchTerm} onChange={(e) => setVentaSearchTerm(e.target.value)}
                            className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm ${isDark ? 'bg-neutral-800 border-neutral-700 text-gray-200 placeholder-gray-500' : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'}`} />
                          {ventaSearchTerm && (
                            <button type="button" onClick={() => setVentaSearchTerm("")} className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full ${isDark ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'}`}>
                              <FiX size={12} />
                            </button>
                          )}
                        </div>
                        <div className="relative sm:w-44">
                          <FiCalendar className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                          <input type="date" value={ventaFechaFilter} onChange={(e) => setVentaFechaFilter(e.target.value)}
                            className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm ${isDark ? 'bg-neutral-800 border-neutral-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`} />
                          {ventaFechaFilter && (
                            <button type="button" onClick={() => setVentaFechaFilter("")} className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full ${isDark ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'}`}>
                              <FiX size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {ventasDisponibles.length === 0 ? (
                      <div className={`text-center py-8 rounded-xl border-2 border-dashed ${isDark ? 'border-neutral-700 bg-neutral-800/50' : 'border-gray-200 bg-gray-50'}`}>
                        <FiPackage className={`mx-auto mb-2 text-3xl ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No hay ventas pendientes de envio</p>
                      </div>
                    ) : ventasFiltradas.length === 0 ? (
                      <div className={`text-center py-8 rounded-xl border-2 border-dashed ${isDark ? 'border-neutral-700 bg-neutral-800/50' : 'border-gray-200 bg-gray-50'}`}>
                        <FiSearch className={`mx-auto mb-2 text-3xl ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No se encontraron ventas</p>
                      </div>
                    ) : (
                      <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-neutral-700' : 'border-gray-200'}`}>
                        <div className="max-h-[280px] overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className={`sticky top-0 ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}`}>
                              <tr>
                                <th className={`p-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Codigo</th>
                                <th className={`p-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cliente</th>
                                <th className={`p-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fecha</th>
                                <th className={`p-3 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ventasVisibles.map((v) => {
                                const isSelected = envioForm.idVenta === String(v.id);
                                return (
                                  <tr key={v.id} onClick={() => setEnvioForm((p) => ({ ...p, idVenta: String(v.id) }))}
                                    className={`cursor-pointer transition-all border-b ${isSelected ? (isDark ? 'bg-[#E0312A]/20 border-[#E0312A]/40' : 'bg-[#E0312A]/10 border-[#E0312A]/20') : (isDark ? 'border-neutral-700 hover:bg-neutral-800' : 'border-gray-100 hover:bg-gray-50')}`}>
                                    <td className={`p-3 font-bold ${isSelected ? (isDark ? 'text-emerald-300' : 'text-[#E0312A]') : (isDark ? 'text-white' : 'text-gray-900')}`}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#E0312A] bg-[#E0312A]' : isDark ? 'border-gray-500' : 'border-gray-300'}`}>
                                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        {generarCodigoVenta(v.id)}
                                      </div>
                                    </td>
                                    <td className={`p-3 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{v.nombreCliente || 'Cliente'}</td>
                                    <td className={`p-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      <div className="flex items-center gap-1.5">
                                        <FiCalendar size={12} />
                                        {v.fecha ? new Date(v.fecha).toLocaleDateString("es-PE", { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                                      </div>
                                    </td>
                                    <td className={`p-3 text-right font-bold font-mono`} style={{ color: COLORS.primary }}>S/ {v.total?.toFixed(2) ?? "0.00"}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {hayMasVentas && (
                          <div className={`px-4 py-2.5 text-xs text-center border-t ${isDark ? 'bg-neutral-800/50 border-neutral-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                            <FiAlertCircle className="inline mr-1.5" size={12} />
                            Mostrando {MAX_VENTAS_VISIBLES} de {ventasFiltradas.length} ventas.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Left - Transporte */}
                  <div className="space-y-4">
                    <h3 className={`text-xs font-bold uppercase tracking-widest pb-2 border-b flex items-center gap-2 ${isDark ? 'text-gray-500 border-neutral-800' : 'text-gray-400 border-gray-200'}`}>
                      <FiTruck />Transporte
                    </h3>
                    <div>
                      <label className={labelClass}>Conductor</label>
                      <select value={envioForm.idConductor} onChange={(e) => setEnvioForm((p) => ({ ...p, idConductor: e.target.value }))} className={inputClass}>
                        <option value="">Seleccionar conductor</option>
                        {conductores.map((c) => {
                          const veh = getVehiculoForConductor(c.id);
                          return <option key={c.id} value={c.id}>{getNombreConductor(c)} - {c.licencia}{veh ? ` (${veh.placa})` : ""}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Ruta</label>
                      <select value={envioForm.idRuta} onChange={(e) => setEnvioForm((p) => ({ ...p, idRuta: e.target.value }))} className={inputClass}>
                        <option value="">Seleccionar ruta</option>
                        {rutas.map((r) => <option key={r.id} value={r.id}>{r.nombre} ({r.origen} → {r.destino})</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}><FiCalendar className="inline mr-1" size={13} />Fecha Envio</label>
                        <input type="date" value={envioForm.fechaEnvio} onChange={(e) => setEnvioForm((p) => ({ ...p, fechaEnvio: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}><FiCalendar className="inline mr-1" size={13} />Fecha Entrega</label>
                        <input type="date" value={envioForm.fechaEntrega} onChange={(e) => setEnvioForm((p) => ({ ...p, fechaEntrega: e.target.value }))} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Costo de Transporte (S/)</label>
                      <input type="number" step="0.01" value={envioForm.costoTransporte} onChange={(e) => setEnvioForm((p) => ({ ...p, costoTransporte: e.target.value }))} className={inputClass} placeholder="0.00" />
                    </div>
                    <div>
                      <label className={labelClass}>Observaciones</label>
                      <textarea value={envioForm.observaciones} onChange={(e) => setEnvioForm((p) => ({ ...p, observaciones: e.target.value }))} rows={2} className={inputClass} placeholder="Notas adicionales..." />
                    </div>
                  </div>

                  {/* Right - Direccion + Mapa */}
                  <div className="space-y-4">
                    <h3 className={`text-xs font-bold uppercase tracking-widest pb-2 border-b flex items-center gap-2 ${isDark ? 'text-gray-500 border-neutral-800' : 'text-gray-400 border-gray-200'}`}>
                      <FiMapPin />Direccion de Envio
                    </h3>
                    <div className="relative" ref={suggestionsRef} style={{ zIndex: showSuggestions ? 10000 : 'auto' }}>
                      <label className={labelClass}>Direccion *</label>
                      <div className="relative">
                        <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                        <input
                          type="text"
                          value={envioForm.direccionEnvio}
                          onChange={(e) => { setEnvioForm((p) => ({ ...p, direccionEnvio: e.target.value })); searchAddress(e.target.value); }}
                          onFocus={() => { if (addressSuggestions.length > 0) setShowSuggestions(true); }}
                          className={`${inputClass} pl-9`}
                          placeholder="Buscar direccion: Av. Arequipa 1234, Lima..."
                          required
                        />
                        {(searchingAddress || reversingGeocode) && (
                          <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-t-transparent rounded-full animate-spin`} style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }} />
                        )}
                      </div>
                      {showSuggestions && (
                        <div className={`absolute left-0 right-0 mt-1 rounded-xl shadow-2xl border overflow-hidden max-h-[280px] overflow-y-auto ${isDark ? 'bg-[#171717] border-neutral-700' : 'bg-white border-gray-200'}`} style={{ zIndex: 9999 }}>
                          {searchingAddress && (
                            <div className={`px-4 py-4 text-sm flex items-center gap-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }} />
                              <span>Buscando direcciones...</span>
                            </div>
                          )}
                          {!searchingAddress && searchError && (
                            <div className={`px-4 py-4 text-sm flex items-center gap-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                              <FiAlertCircle size={16} />
                              <span>{searchError}</span>
                            </div>
                          )}
                          {!searchingAddress && !searchError && noResults && (
                            <div className={`px-4 py-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              <p className="font-medium mb-1">No se encontraron direcciones</p>
                              <p className="text-xs">Intenta con otra busqueda o haz clic en el mapa</p>
                            </div>
                          )}
                          {!searchingAddress && !searchError && addressSuggestions.length > 0 && (
                            <>
                              <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider sticky top-0 ${isDark ? 'bg-neutral-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                {addressSuggestions.length} resultado{addressSuggestions.length !== 1 ? 's' : ''} encontrado{addressSuggestions.length !== 1 ? 's' : ''}
                              </div>
                              {addressSuggestions.map((s, i) => (
                                <button key={i} type="button" onClick={() => selectAddress(s)}
                                  className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-start gap-3 ${isDark ? 'hover:bg-neutral-800 text-gray-200' : 'hover:bg-gray-50 text-gray-700'} ${i > 0 ? `border-t ${isDark ? 'border-neutral-700' : 'border-gray-100'}` : ''}`}>
                                  <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                                    <FiMapPin style={{ color: COLORS.primary }} size={12} />
                                  </div>
                                  <span className="line-clamp-2 text-xs leading-relaxed">{s.display_name}</span>
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {hasMarker && (
                      <div className={`p-3 rounded-xl flex items-center gap-2 border-l-4 ${isDark ? 'bg-emerald-900/20 border-emerald-500' : 'bg-emerald-50 border-emerald-500'}`}>
                        <FiCheckCircle className={isDark ? 'text-emerald-400' : 'text-emerald-600'} size={16} />
                        <span className={`text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          Ubicacion seleccionada en el mapa
                        </span>
                      </div>
                    )}

                    <div className="relative" style={{ zIndex: 1 }}>
                      <div className={`rounded-xl overflow-hidden border ${hasMarker ? (isDark ? 'border-emerald-700' : 'border-emerald-300') : (isDark ? 'border-neutral-700' : 'border-gray-200')}`} style={{ height: 280 }}>
                        <MapContainer center={[mapCoords.lat, mapCoords.lng]} zoom={hasMarker ? 16 : 13} style={{ height: "100%", width: "100%" }} zoomControl={true} attributionControl={false}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          {hasMarker && <Marker position={[mapCoords.lat, mapCoords.lng]} />}
                          <RecenterMap lat={mapCoords.lat} lng={mapCoords.lng} />
                          <MapClickHandler onMapClick={reverseGeocode} />
                        </MapContainer>
                      </div>
                      {!hasMarker && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className={`px-4 py-2 rounded-full text-xs font-medium shadow-lg ${isDark ? 'bg-gray-900/80 text-gray-200' : 'bg-white/90 text-gray-700'}`}>
                            <FiMapPin className="inline mr-1.5" size={12} />
                            Haz clic en el mapa para seleccionar ubicacion
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`flex gap-3 justify-end pt-4 border-t ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
                  <button type="button" onClick={closeModal} className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>Cancelar</button>
                  <button type="submit" disabled={saving || (!isEditing && !envioForm.idVenta)}
                    className={`px-5 py-2.5 rounded-xl font-medium text-white transition-all ${saving || (!isEditing && !envioForm.idVenta) ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
                    style={{ backgroundColor: COLORS.primary }}>
                    {saving ? "Guardando..." : isEditing ? "Actualizar Envio" : "Crear Envio"}
                  </button>
                </div>
              </form>
            )}

            {/* ── CONDUCTOR FORM ── */}
            {activeTab === "conductores" && (
              <form onSubmit={handleSubmitConductor} className="p-5 space-y-5">
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-widest pb-2 mb-4 border-b flex items-center gap-2 ${isDark ? 'text-gray-500 border-neutral-800' : 'text-gray-400 border-gray-200'}`}>
                    <FiUser size={14} />Datos del Conductor
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><label className={labelClass}>Nombres *</label><input type="text" value={conductorForm.nombres} onChange={(e) => setConductorForm((p) => ({ ...p, nombres: e.target.value }))} className={inputClass} placeholder="Juan" required /></div>
                    <div><label className={labelClass}>Apellido Paterno *</label><input type="text" value={conductorForm.apellidoPaterno} onChange={(e) => setConductorForm((p) => ({ ...p, apellidoPaterno: e.target.value }))} className={inputClass} placeholder="Perez" required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><label className={labelClass}>Apellido Materno</label><input type="text" value={conductorForm.apellidoMaterno} onChange={(e) => setConductorForm((p) => ({ ...p, apellidoMaterno: e.target.value }))} className={inputClass} placeholder="Garcia" /></div>
                    <div><label className={labelClass}>N° Documento</label><input type="text" value={conductorForm.numeroDocumento} onChange={(e) => setConductorForm((p) => ({ ...p, numeroDocumento: e.target.value }))} className={inputClass} placeholder="12345678" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><label className={labelClass}>Telefono</label><input type="text" value={conductorForm.telefono} onChange={(e) => setConductorForm((p) => ({ ...p, telefono: e.target.value }))} className={inputClass} placeholder="999888777" /></div>
                    <div><label className={labelClass}>N° Licencia *</label><input type="text" value={conductorForm.licencia} onChange={(e) => setConductorForm((p) => ({ ...p, licencia: e.target.value }))} className={inputClass} placeholder="Q12345678" required /></div>
                  </div>
                  <div>
                    <label className={labelClass}>Categoria de Licencia</label>
                    <select value={conductorForm.categoriaLicencia} onChange={(e) => setConductorForm((p) => ({ ...p, categoriaLicencia: e.target.value }))} className={inputClass}>
                      <option value="">Seleccionar categoria</option>
                      {["A-I","A-IIa","A-IIb","A-IIIa","A-IIIb","A-IIIc","B-I","B-IIa","B-IIb","B-IIc"].map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-widest pb-2 mb-4 border-b flex items-center gap-2`} style={{ color: COLORS.primary, borderColor: isDark ? "#374151" : "#e5e7eb" }}>
                    <FiTruck size={14} />Vehiculo del Conductor
                  </h3>
                  <div className="mb-4">
                    <label className={labelClass}>Placa *</label>
                    <input type="text" value={conductorForm.placa} onChange={(e) => setConductorForm((p) => ({ ...p, placa: e.target.value }))} className={inputClass} placeholder="ABC-123" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><label className={labelClass}>Marca</label><input type="text" value={conductorForm.marca} onChange={(e) => setConductorForm((p) => ({ ...p, marca: e.target.value }))} className={inputClass} placeholder="Toyota" /></div>
                    <div><label className={labelClass}>Modelo</label><input type="text" value={conductorForm.modelo} onChange={(e) => setConductorForm((p) => ({ ...p, modelo: e.target.value }))} className={inputClass} placeholder="Hilux" /></div>
                  </div>
                  <div><label className={labelClass}>Capacidad (kg)</label><input type="number" value={conductorForm.capacidadKg} onChange={(e) => setConductorForm((p) => ({ ...p, capacidadKg: e.target.value }))} className={inputClass} placeholder="1000" /></div>
                </div>
                <div className={`flex gap-3 justify-end pt-4 border-t ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
                  <button type="button" onClick={closeModal} className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>Cancelar</button>
                  <button type="submit" disabled={saving || !conductorForm.licencia || !conductorForm.placa || !conductorForm.nombres || !conductorForm.apellidoPaterno}
                    className={`px-5 py-2.5 rounded-xl font-medium text-white transition-all ${saving || !conductorForm.licencia || !conductorForm.placa || !conductorForm.nombres || !conductorForm.apellidoPaterno ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
                    style={{ backgroundColor: COLORS.primary }}>
                    {saving ? "Guardando..." : isEditing ? "Actualizar Conductor" : "Crear Conductor"}
                  </button>
                </div>
              </form>
            )}

            {/* ── RUTA FORM ── */}
            {activeTab === "rutas" && (
              <form onSubmit={handleSubmitRuta} className="p-5 space-y-4">
                <div><label className={labelClass}>Nombre de la Ruta *</label><input type="text" value={rutaForm.nombre} onChange={(e) => setRutaForm((p) => ({ ...p, nombre: e.target.value }))} className={inputClass} placeholder="Lima - Arequipa" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>Origen *</label><input type="text" value={rutaForm.origen} onChange={(e) => setRutaForm((p) => ({ ...p, origen: e.target.value }))} className={inputClass} placeholder="Lima" required /></div>
                  <div><label className={labelClass}>Destino *</label><input type="text" value={rutaForm.destino} onChange={(e) => setRutaForm((p) => ({ ...p, destino: e.target.value }))} className={inputClass} placeholder="Arequipa" required /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className={labelClass}>Distancia (km)</label><input type="number" step="0.1" value={rutaForm.distanciaKm} onChange={(e) => setRutaForm((p) => ({ ...p, distanciaKm: e.target.value }))} className={inputClass} placeholder="0" /></div>
                  <div><label className={labelClass}>Tiempo (hrs)</label><input type="number" step="0.5" value={rutaForm.tiempoEstimadoHoras} onChange={(e) => setRutaForm((p) => ({ ...p, tiempoEstimadoHoras: e.target.value }))} className={inputClass} placeholder="0" /></div>
                  <div><label className={labelClass}>Costo Base (S/)</label><input type="number" step="0.01" value={rutaForm.costoBase} onChange={(e) => setRutaForm((p) => ({ ...p, costoBase: e.target.value }))} className={inputClass} placeholder="0.00" /></div>
                </div>
                <div className={`flex gap-3 justify-end pt-4 border-t ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
                  <button type="button" onClick={closeModal} className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>Cancelar</button>
                  <button type="submit" disabled={saving || !rutaForm.nombre || !rutaForm.origen || !rutaForm.destino}
                    className={`px-5 py-2.5 rounded-xl font-medium text-white transition-all ${saving || !rutaForm.nombre || !rutaForm.origen || !rutaForm.destino ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
                    style={{ backgroundColor: COLORS.primary }}>
                    {saving ? "Guardando..." : isEditing ? "Actualizar Ruta" : "Crear Ruta"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ═══════ DETAIL MODAL ═══════ */}
      {showDetailModal && envioSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm`} onClick={() => setShowDetailModal(false)}></div>
          <div className={`relative ${isDark ? 'bg-[#171717]' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92dvh] overflow-y-auto border ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
            <div className={`p-5 border-b ${isDark ? 'border-neutral-800' : 'border-gray-100'} flex justify-between items-center`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg text-white" style={{ backgroundColor: COLORS.primary }}>
                  <FiTruck className="text-xl" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Envio {generarCodigoEnvio(envioSeleccionado.id)}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getEstadoStyle(envioSeleccionado.estado)}`}>{envioSeleccionado.estado.replace("_", " ")}</span>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><FiX size={20} /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Venta", value: envioSeleccionado.idVenta ? generarCodigoVenta(envioSeleccionado.idVenta) : "-" },
                  { label: "Cliente", value: envioSeleccionado.nombreCliente ?? "-" },
                  { label: "Vehiculo", value: envioSeleccionado.placaVehiculo ? `${envioSeleccionado.placaVehiculo} (${envioSeleccionado.marcaVehiculo ?? ""})` : "-" },
                  { label: "Conductor", value: envioSeleccionado.nombreConductor ? `${envioSeleccionado.nombreConductor}${envioSeleccionado.licenciaConductor ? ` (${envioSeleccionado.licenciaConductor})` : ""}` : "-" },
                  { label: "Ruta", value: envioSeleccionado.nombreRuta ? `${envioSeleccionado.nombreRuta}${envioSeleccionado.origenRuta ? ` (${envioSeleccionado.origenRuta} → ${envioSeleccionado.destinoRuta})` : ""}` : "-" },
                  { label: "Estado Venta", value: envioSeleccionado.estadoVenta ?? "-" },
                  { label: "Fecha Envio", value: formatDate(envioSeleccionado.fechaEnvio) },
                  { label: "Fecha Entrega", value: formatDate(envioSeleccionado.fechaEntrega) },
                  { label: "Costo Transporte", value: envioSeleccionado.costoTransporte != null ? `S/ ${envioSeleccionado.costoTransporte.toFixed(2)}` : "-" },
                  { label: "Total Venta", value: envioSeleccionado.totalVenta != null ? `S/ ${envioSeleccionado.totalVenta.toFixed(2)}` : "-" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.label}</p>
                    <p className={`font-medium text-sm mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}`}>
                <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Direccion de Envio</p>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}><FiMapPin className="inline mr-1" />{envioSeleccionado.direccionEnvio ?? "-"}</p>
              </div>
              {envioSeleccionado.observaciones && (
                <div className={`p-3 rounded-xl ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}`}>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Observaciones</p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{envioSeleccionado.observaciones}</p>
                </div>
              )}
            </div>
            <div className={`p-5 border-t ${isDark ? 'border-neutral-800' : 'border-gray-100'} flex justify-end`}>
              <button onClick={() => setShowDetailModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-white" style={{ backgroundColor: COLORS.primary }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ DELETE MODAL ═══════ */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm`} onClick={() => setShowDeleteModal(false)}></div>
          <div className={`relative ${isDark ? 'bg-[#171717]' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-md border ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
            <div className="p-6 text-center">
              <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                <FiTrash2 className={`text-2xl ${isDark ? 'text-red-400' : 'text-red-500'}`} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirmar Eliminacion</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Estas seguro de eliminar <strong className={isDark ? 'text-white' : 'text-gray-900'}>{deleteTarget.label}</strong>?</p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Esta accion no se puede deshacer.</p>
            </div>
            <div className={`p-4 border-t ${isDark ? 'border-neutral-800' : 'border-gray-100'} flex gap-3`}>
              <button onClick={() => setShowDeleteModal(false)} className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>Cancelar</button>
              <button onClick={confirmarEliminar} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
