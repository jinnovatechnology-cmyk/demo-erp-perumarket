/**
 * ModalPago.tsx - Modal de procesamiento de pago
 * Diseño Power BI - Estilo profesional y minimalista
 */

import React, { useState, useEffect } from 'react';
import {
  FiTrash2, FiCreditCard, FiDollarSign, FiSmartphone,
  FiCheckCircle, FiX, FiPrinter, FiArrowRight, FiTruck, FiFileText,
  FiPlus
} from 'react-icons/fi';
import { FaUniversity, FaWallet } from 'react-icons/fa';
import type { Cliente } from '../../types/clientes/Client';
import type { DetallePago, MetodoPago } from '../../types/ventas/ventas';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface ModalPagoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (detallesPago: DetallePago[]) => void;
  cliente: Cliente | null;
  total: number;
  metodosPago: MetodoPago[];
  conEnvio: boolean;
  direccionEnvio: string;
}

const ModalPago: React.FC<ModalPagoProps> = ({
  isOpen,
  onClose,
  onConfirmar,
  cliente,
  total,
  metodosPago,
  conEnvio,
  direccionEnvio
}) => {
  const { isDark } = useThemeClasses();

  const [detallesPago, setDetallesPago] = useState<DetallePago[]>([]);
  const totalPagado = detallesPago.reduce((sum, pago) => sum + pago.monto, 0);
  const saldoRestante = Number((total - totalPagado).toFixed(2));

  const inicializarPago = (montoSugerido: number) => ({
    id_metodo_pago: metodosPago[0]?.id || 0,
    monto: montoSugerido > 0 ? montoSugerido : 0,
    referencia: '',
    numero_tarjeta: '',
    fecha_vencimiento: '',
    cvv: '',
    numero_transferencia: '',
    banco: '',
    numero_operacion: ''
  });

  const [pagoActual, setPagoActual] = useState<DetallePago>(inicializarPago(total));
  const [mostrarExito, setMostrarExito] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDetallesPago([]);
      setPagoActual(inicializarPago(total));
      setMostrarExito(false);
    }
  }, [isOpen, total, metodosPago]);

  const metodosConIconos = [
    { id: 1, nombre: 'Efectivo', icono: FiDollarSign, color: 'text-green-500' },
    { id: 2, nombre: 'Tarjeta Débito', icono: FiCreditCard, color: 'text-blue-500' },
    { id: 3, nombre: 'Tarjeta Crédito', icono: FiCreditCard, color: 'text-purple-500' },
    { id: 4, nombre: 'Transferencia', icono: FaUniversity, color: 'text-indigo-500' },
    { id: 5, nombre: 'Yape', icono: FiSmartphone, color: 'text-purple-400' },
    { id: 6, nombre: 'Plin', icono: FiSmartphone, color: 'text-cyan-500' }
  ];

  const getMetodoPagoNombre = (id: number) => metodosPago.find(mp => mp.id === id)?.nombre || 'Desconocido';

  const getIconoMetodo = (id: number) => {
    const metodo = metodosConIconos.find(mp => mp.id === id);
    return metodo ? { Icono: metodo.icono, color: metodo.color } : { Icono: FiCreditCard, color: 'text-gray-500' };
  };

  const validarCamposPago = () => {
    const m = pagoActual.id_metodo_pago;
    if (!pagoActual.monto || pagoActual.monto <= 0) {
      alert('El monto debe ser mayor a 0');
      return false;
    }
    if (pagoActual.monto > saldoRestante + 0.01) {
      alert(`El monto no puede superar el saldo restante (S/ ${saldoRestante.toFixed(2)})`);
      return false;
    }
    switch (m) {
      case 2:
      case 3:
        if (!pagoActual.numero_tarjeta || !pagoActual.fecha_vencimiento || !pagoActual.cvv) {
          alert('Completa todos los datos de la tarjeta');
          return false;
        }
        break;
      case 4:
        if (!pagoActual.numero_transferencia || !pagoActual.banco) {
          alert('Completa los datos de la transferencia');
          return false;
        }
        break;
      case 5:
      case 6:
        if (!pagoActual.numero_operacion || !pagoActual.referencia) {
          alert('Completa los datos del pago móvil');
          return false;
        }
        break;
    }
    return true;
  };

  const agregarPago = () => {
    if (!validarCamposPago()) return;
    const nuevosDetalles = [...detallesPago, { ...pagoActual }];
    setDetallesPago(nuevosDetalles);
    const nuevoTotalPagado = nuevosDetalles.reduce((sum, p) => sum + p.monto, 0);
    const nuevoSaldoRestante = Number((total - nuevoTotalPagado).toFixed(2));
    setPagoActual(inicializarPago(nuevoSaldoRestante));
  };

  const eliminarPago = (index: number) => {
    setDetallesPago(detallesPago.filter((_, i) => i !== index));
  };

  const handleConfirmar = () => {
    if (detallesPago.length === 0) {
      alert('Agrega al menos un método de pago');
      return;
    }
    if (totalPagado < total) {
      alert(`Aún falta cubrir el monto total. Faltan S/ ${(total - totalPagado).toFixed(2)}`);
      return;
    }
    setMostrarExito(true);
  };

  const handleFinalizarReal = () => {
    onConfirmar(detallesPago);
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = parseFloat(e.target.value);
    if (isNaN(valor)) valor = 0;
    if (valor > saldoRestante) valor = saldoRestante;
    setPagoActual({ ...pagoActual, monto: valor });
  };

  if (!isOpen) return null;

  // ═══ SUCCESS SCREEN ═══
  if (mostrarExito) {
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div
            className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm`}
          />

          <div className={`
            relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden p-8 text-center
            ${isDark ? 'bg-[#171717] border-neutral-700' : 'bg-white border-gray-200'}
          `}>
            {/* Success icon */}
            <div className="mb-6 relative inline-flex">
              <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
              <div className={`relative p-4 rounded-full ${isDark ? 'bg-green-500/20' : 'bg-green-50'}`}>
                <FiCheckCircle className="text-5xl text-green-500" />
              </div>
            </div>

            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ¡Pedido Realizado!
            </h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              El pago se ha procesado correctamente.
            </p>

            {/* Total card */}
            <div className={`
              rounded-xl p-4 mb-6 border
              ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-gray-50 border-gray-200'}
            `}>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Total Pagado
              </span>
              <p className="text-3xl font-bold text-[#E0312A] mt-1">
                S/ {total.toFixed(2)}
              </p>
            </div>

            {/* Delivery info */}
            {conEnvio && (
              <div className={`
                rounded-xl p-4 mb-6 border text-left
                ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}
              `}>
                <div className="flex items-center gap-2 mb-2">
                  <FiTruck className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                  <span className={`font-semibold text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                    Envío a Domicilio
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  {direccionEnvio}
                </p>
                <span className={`
                  inline-flex items-center gap-1 mt-2 text-[10px] font-semibold px-2 py-1 rounded
                  ${isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}
                `}>
                  Estado: PENDIENTE
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  const now = new Date();
                  const fecha = `${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
                  const clienteNombre = cliente?.persona?.nombres
                    ? `${cliente.persona.nombres} ${cliente.persona.apellidoPaterno || ''}`
                    : 'Cliente General';
                  const pagosHtml = detallesPago.map(p => {
                    const metodo = metodosPago.find(m => m.id === p.id_metodo_pago);
                    return `<tr><td>${metodo?.nombre || 'Pago'}</td><td class="price">S/ ${p.monto.toFixed(2)}</td></tr>`;
                  }).join('');
                  const pw = window.open('', '_blank');
                  if (!pw) return;
                  pw.document.write(`<html><head><title>Ticket</title><style>
                    body{font-family:'Courier New',monospace;width:80mm;margin:0 auto;padding:10px;font-size:12px}
                    .text-center{text-align:center}.font-bold{font-weight:bold}.text-lg{font-size:16px}
                    .text-xl{font-size:20px}.my-2{margin:8px 0}.border-dashed{border-top:1px dashed #000}
                    table{width:100%;border-collapse:collapse}td{padding:2px 4px}.price{text-align:right}
                    @media print{body{width:80mm}}
                  </style></head><body>
                    <div class="text-center"><div class="font-bold text-lg">PERU MARKET</div><div>BOLETA DE VENTA</div></div>
                    <div class="border-dashed my-2"></div>
                    <div>Fecha: ${fecha}</div><div>Cliente: ${clienteNombre}</div>
                    <div class="border-dashed my-2"></div>
                    <div class="font-bold">Pagos:</div>
                    <table>${pagosHtml}</table>
                    <div class="border-dashed my-2"></div>
                    <div style="display:flex;justify-content:space-between"><span class="font-bold text-lg">TOTAL:</span><span class="font-bold text-lg">S/ ${total.toFixed(2)}</span></div>
                    <div class="border-dashed my-2"></div>
                    <div class="text-center">Gracias por su compra!</div>
                  </body></html>`);
                  pw.document.close();
                  pw.print();
                }}
                className={`
                  w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border
                  ${isDark
                    ? 'bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <FiPrinter size={16} />
                Imprimir Ticket
              </button>

              <button
                onClick={handleFinalizarReal}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-[#E0312A] hover:bg-[#A91E16] transition-all flex items-center justify-center gap-2"
              >
                Finalizar y Cerrar
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══ PAYMENT FORM ═══
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm`}
          onClick={onClose}
        />

        <div className={`
          relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col
          ${isDark ? 'bg-[#171717] border-neutral-700' : 'bg-white border-gray-200'}
        `}>
          {/* Header */}
          <div className={`
            flex-none px-6 py-5 border-b flex items-center justify-between
            ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}
          `}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-[#E0312A]/20' : 'bg-[#E0312A]/10'}`}>
                <FaWallet className="w-6 h-6 text-[#E0312A]" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Procesar Pago
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Seleccione los métodos de pago
                </p>
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

          {/* Body */}
          <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            {/* Sale Summary */}
            <div className={`
              rounded-xl p-5 border mb-6 flex flex-col sm:flex-row justify-between items-center gap-4
              ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}
            `}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#E0312A] text-white flex items-center justify-center font-bold text-lg">
                  {cliente?.persona.nombres.charAt(0) || 'C'}
                </div>
                <div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Cliente
                  </span>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {cliente?.persona.nombres} {cliente?.persona.apellidoPaterno}
                  </p>
                </div>
              </div>
              <div className={`
                text-right border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto
                ${isDark ? 'border-neutral-800' : 'border-gray-200'}
              `}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Total a Pagar
                </span>
                <p className="text-3xl font-bold text-[#E0312A]">
                  S/ {total.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Payment Form */}
              <div className={`
                rounded-xl border overflow-hidden
                ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}
              `}>
                <div className={`
                  px-5 py-3 border-b flex items-center gap-2
                  ${isDark ? 'border-neutral-800 bg-neutral-800/50' : 'border-gray-100 bg-gray-50'}
                `}>
                  <div className="w-6 h-6 rounded-full bg-[#E0312A] text-white flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Seleccionar Método
                  </h3>
                </div>

                <div className="p-5 space-y-5">
                  {/* Method Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {metodosConIconos.map((metodo) => {
                      const { Icono, color } = getIconoMetodo(metodo.id);
                      const isSelected = pagoActual.id_metodo_pago === metodo.id;
                      return (
                        <button
                          key={metodo.id}
                          onClick={() => setPagoActual({ ...pagoActual, id_metodo_pago: metodo.id })}
                          className={`
                            flex flex-col items-center justify-center p-3 rounded-xl border transition-all
                            ${isSelected
                              ? isDark
                                ? 'border-[#E0312A] bg-[#E0312A]/10'
                                : 'border-[#E0312A] bg-[#E0312A]/5'
                              : isDark
                                ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700'
                                : 'border-gray-200 bg-gray-50 hover:bg-white'
                            }
                          `}
                        >
                          <Icono
                            className={`mb-1.5 ${isSelected ? 'text-[#E0312A]' : color}`}
                            size={20}
                          />
                          <span className={`
                            text-[10px] font-semibold leading-tight
                            ${isSelected
                              ? 'text-[#E0312A]'
                              : isDark ? 'text-gray-400' : 'text-gray-600'
                            }
                          `}>
                            {metodo.nombre}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className={`
                      block text-xs font-semibold uppercase tracking-wider mb-1.5
                      ${isDark ? 'text-gray-400' : 'text-gray-500'}
                    `}>
                      Monto a Pagar
                    </label>
                    <div className="relative">
                      <span className={`
                        absolute left-4 top-1/2 -translate-y-1/2 font-bold
                        ${isDark ? 'text-gray-500' : 'text-gray-400'}
                      `}>
                        S/
                      </span>
                      <input
                        type="number"
                        value={pagoActual.monto}
                        onChange={handleMontoChange}
                        min={0}
                        max={saldoRestante}
                        step={0.01}
                        disabled={saldoRestante <= 0}
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-lg border text-sm font-semibold transition-colors
                          ${isDark
                            ? 'bg-neutral-800 border-neutral-700 text-white focus:border-[#E0312A]'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-[#E0312A]'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      />
                    </div>
                  </div>

                  {/* Dynamic fields based on payment method */}
                  <div className="min-h-[80px]">
                    {pagoActual.id_metodo_pago === 1 && (
                      <InputField
                        label="Referencia (Opcional)"
                        value={pagoActual.referencia || ''}
                        onChange={(val) => setPagoActual({ ...pagoActual, referencia: val })}
                        placeholder="Nota adicional..."
                        isDark={isDark}
                      />
                    )}

                    {(pagoActual.id_metodo_pago === 2 || pagoActual.id_metodo_pago === 3) && (
                      <div className="space-y-3">
                        <InputField
                          label="Número de Tarjeta"
                          value={pagoActual.numero_tarjeta || ''}
                          onChange={(val) => setPagoActual({ ...pagoActual, numero_tarjeta: val })}
                          placeholder="0000 0000 0000 0000"
                          icon={<FiCreditCard size={14} />}
                          isDark={isDark}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <InputField
                            label="Vencimiento"
                            value={pagoActual.fecha_vencimiento || ''}
                            onChange={(val) => setPagoActual({ ...pagoActual, fecha_vencimiento: val })}
                            placeholder="MM/AA"
                            isDark={isDark}
                          />
                          <InputField
                            label="CVV"
                            value={pagoActual.cvv || ''}
                            onChange={(val) => setPagoActual({ ...pagoActual, cvv: val })}
                            placeholder="123"
                            isDark={isDark}
                          />
                        </div>
                      </div>
                    )}

                    {pagoActual.id_metodo_pago === 4 && (
                      <div className="space-y-3">
                        <div>
                          <label className={`
                            block text-xs font-semibold uppercase tracking-wider mb-1.5
                            ${isDark ? 'text-gray-400' : 'text-gray-500'}
                          `}>
                            Banco de Origen
                          </label>
                          <select
                            value={pagoActual.banco || ''}
                            onChange={(e) => setPagoActual({ ...pagoActual, banco: e.target.value })}
                            className={`
                              w-full px-4 py-2.5 rounded-lg border text-sm transition-colors
                              ${isDark
                                ? 'bg-neutral-800 border-neutral-700 text-white focus:border-[#E0312A]'
                                : 'bg-white border-gray-200 text-gray-900 focus:border-[#E0312A]'
                              }
                            `}
                          >
                            <option value="">Seleccionar banco...</option>
                            <option value="BCP">BCP</option>
                            <option value="Interbank">Interbank</option>
                            <option value="BBVA">BBVA</option>
                            <option value="Scotiabank">Scotiabank</option>
                            <option value="Banco de la Nación">Banco de la Nación</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                        <InputField
                          label="Nro. Operación"
                          value={pagoActual.numero_transferencia || ''}
                          onChange={(val) => setPagoActual({ ...pagoActual, numero_transferencia: val })}
                          placeholder="Ej: 12345678"
                          isDark={isDark}
                        />
                      </div>
                    )}

                    {(pagoActual.id_metodo_pago === 5 || pagoActual.id_metodo_pago === 6) && (
                      <div className="space-y-3">
                        <InputField
                          label="Nro. Celular"
                          value={pagoActual.referencia || ''}
                          onChange={(val) => setPagoActual({ ...pagoActual, referencia: val })}
                          placeholder="999 999 999"
                          icon={<FiSmartphone size={14} />}
                          isDark={isDark}
                        />
                        <InputField
                          label="Código de Operación"
                          value={pagoActual.numero_operacion || ''}
                          onChange={(val) => setPagoActual({ ...pagoActual, numero_operacion: val })}
                          placeholder="Ej: 123456"
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>

                  {/* Add button */}
                  <button
                    onClick={agregarPago}
                    disabled={saldoRestante <= 0}
                    className={`
                      w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
                      ${saldoRestante <= 0
                        ? isDark
                          ? 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#E0312A] hover:bg-[#A91E16] text-white'
                      }
                    `}
                  >
                    {saldoRestante <= 0 ? (
                      <>
                        <FiCheckCircle size={16} />
                        Monto Completado
                      </>
                    ) : (
                      <>
                        <FiPlus size={16} />
                        Agregar al Pago
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right: Payment List */}
              <div className="flex flex-col">
                <div className={`
                  px-4 py-3 flex items-center gap-2
                `}>
                  <div className="w-6 h-6 rounded-full bg-[#E0312A] text-white flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Desglose de Pagos
                  </h3>
                </div>

                <div className={`
                  flex-1 rounded-xl border overflow-hidden flex flex-col
                  ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}
                `}>
                  {/* List */}
                  <div className={`
                    flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[280px]
                    ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}
                  `}>
                    {detallesPago.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-8">
                        <FiFileText size={40} className={isDark ? 'text-neutral-700' : 'text-gray-300'} />
                        <p className={`text-sm font-medium mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Sin pagos registrados
                        </p>
                      </div>
                    ) : (
                      detallesPago.map((pago, index) => {
                        const { Icono, color } = getIconoMetodo(pago.id_metodo_pago);
                        return (
                          <div
                            key={index}
                            className={`
                              flex items-center justify-between p-3 border rounded-xl
                              ${isDark ? 'bg-[#171717] border-neutral-700' : 'bg-white border-gray-200'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`
                                p-2 rounded-lg
                                ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}
                              `}>
                                <Icono className={color} size={16} />
                              </div>
                              <div>
                                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {getMetodoPagoNombre(pago.id_metodo_pago)}
                                </p>
                                {(pago.referencia || pago.banco) && (
                                  <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {pago.referencia || pago.banco}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                S/ {pago.monto.toFixed(2)}
                              </span>
                              <button
                                onClick={() => eliminarPago(index)}
                                className={`
                                  p-1.5 rounded-lg transition-colors
                                  ${isDark
                                    ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/30'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                  }
                                `}
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Totals */}
                  <div className={`
                    p-4 border-t space-y-2
                    ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}
                  `}>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Total Venta</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        S/ {total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Total Agregado</span>
                      <span className="font-semibold text-green-500">
                        S/ {totalPagado.toFixed(2)}
                      </span>
                    </div>
                    <div className={`
                      pt-3 mt-3 border-t flex justify-between items-center
                      ${isDark ? 'border-neutral-800' : 'border-gray-100'}
                    `}>
                      <span className={`font-semibold text-sm uppercase ${saldoRestante > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {saldoRestante > 0 ? 'Restante' : 'Completo'}
                      </span>
                      <span className={`text-2xl font-bold ${saldoRestante > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        S/ {saldoRestante.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`
            flex-none px-6 py-4 border-t flex items-center justify-end gap-3
            ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}
          `}>
            <button
              onClick={onClose}
              className={`
                px-5 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isDark
                  ? 'bg-neutral-700 text-white hover:bg-neutral-600 border border-neutral-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }
              `}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={saldoRestante > 0}
              className={`
                px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2
                ${saldoRestante <= 0
                  ? 'bg-[#E0312A] hover:bg-[#A91E16]'
                  : 'bg-gray-400 cursor-not-allowed'
                }
              `}
            >
              <FiCheckCircle size={16} />
              Confirmar y Emitir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══ INPUT FIELD COMPONENT ═══
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  isDark: boolean;
}

const InputField = ({ label, value, onChange, placeholder, icon, isDark }: InputFieldProps) => (
  <div>
    <label className={`
      block text-xs font-semibold uppercase tracking-wider mb-1.5
      ${isDark ? 'text-gray-400' : 'text-gray-500'}
    `}>
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {icon}
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full ${icon ? 'pl-10' : 'px-4'} pr-4 py-2.5 rounded-lg border text-sm transition-colors
          ${isDark
            ? 'bg-neutral-800 border-neutral-700 text-white placeholder-gray-500 focus:border-[#E0312A]'
            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#E0312A]'
          }
        `}
      />
    </div>
  </div>
);

export default ModalPago;
