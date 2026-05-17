/**
 * ModalTicket.tsx - Comprobante electrónico (Boleta/Factura) con
 * representación impresa estilo SUNAT (facturación electrónica simulada).
 */

import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiPrinter,
  FiFileText,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiShoppingBag,
  FiCheckCircle,
  FiLoader,
  FiShield,
} from 'react-icons/fi';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface ModalTicketProps {
  isOpen: boolean;
  onClose: () => void;
  venta: any;
}

// ── Datos del emisor (configurables) ───────────────────────────────
const RUC_EMISOR = '20603392150';
const RAZON_SOCIAL = 'PERU MARKET S.A.C.';
const DIRECCION_FISCAL = 'Av. Los Próceres 1234 - Lima, Perú';
const RESOLUCION_SUNAT = '034-005-0005315/SUNAT';
const URL_CONSULTA_SUNAT =
  'https://ww1.sunat.gob.pe/ol-ti-itconsvalicpe/ConsValiCpe.htm';

const ModalTicket: React.FC<ModalTicketProps> = ({ isOpen, onClose, venta }) => {
  const { isDark } = useThemeClasses();

  // Estado simulado de envío al API de SUNAT
  const [sunatEstado, setSunatEstado] = useState<'enviando' | 'aceptado'>(
    'enviando'
  );

  useEffect(() => {
    if (!isOpen || !venta) return;
    setSunatEstado('enviando');
    const t = setTimeout(() => setSunatEstado('aceptado'), 1500);
    return () => clearTimeout(t);
  }, [isOpen, venta?.id]);

  if (!isOpen || !venta) return null;

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const HH = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${HH}:${min}`;
  };

  const formatPrice = (value: number) => `S/ ${Number(value).toFixed(2)}`;

  // ── Datos del comprobante electrónico (SUNAT) ────────────────────
  const tipoComp = String(
    venta.tipoComprobante || venta.comprobante?.tipo || 'BOLETA'
  ).toUpperCase();
  const esFactura = tipoComp.includes('FACTURA');
  const tipoLabel = esFactura
    ? 'FACTURA ELECTRÓNICA'
    : 'BOLETA DE VENTA ELECTRÓNICA';
  const tipoCodigo = esFactura ? '01' : '03';
  const serie = esFactura ? 'F001' : 'B001';
  const correlativo = String(venta.id).padStart(8, '0');
  const numeroComprobante = `${serie}-${correlativo}`;

  const fechaObj = new Date(venta.fecha);
  const isoFecha = `${fechaObj.getFullYear()}-${String(
    fechaObj.getMonth() + 1
  ).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;

  const subtotalNum = Number(venta.subtotal || 0);
  const igvNum = Number(venta.igv || 0);
  const totalNum = Number(venta.total || 0);

  const docCliente = String(venta.numeroDocumentoCliente || '00000000');
  const tipoDocCli = docCliente.length === 11 ? '6' : '1';

  // Hash CDR (digest) determinista — emula el código de seguridad de SUNAT
  const sunatHash = (() => {
    const base = `${RUC_EMISOR}|${numeroComprobante}|${igvNum.toFixed(
      2
    )}|${totalNum.toFixed(2)}|${isoFecha}`;
    let b64 = '';
    try {
      b64 = btoa(unescape(encodeURIComponent(base)));
    } catch {
      b64 = base.replace(/[^A-Za-z0-9]/g, '');
    }
    return (b64.replace(/=+$/, '').slice(0, 27) + '=')
      .padEnd(28, 'A')
      .slice(0, 28);
  })();

  // Cadena QR según especificación SUNAT
  const qrData = [
    RUC_EMISOR,
    tipoCodigo,
    serie,
    correlativo,
    igvNum.toFixed(2),
    totalNum.toFixed(2),
    isoFecha,
    tipoDocCli,
    docCliente,
    sunatHash,
  ].join('|');
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=0&data=${encodeURIComponent(
    qrData
  )}`;

  const handlePrint = () => {
    const ticketContent = document.getElementById('ticket-content');
    if (!ticketContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${numeroComprobante}</title>
          <style>
            body { font-family: 'Courier New', monospace; width: 80mm; margin: 0 auto; padding: 10px; font-size: 12px; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-lg { font-size: 16px; }
            .text-xl { font-size: 20px; }
            .my-2 { margin: 8px 0; }
            .border-dashed { border-top: 1px dashed #000; }
            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 2px 4px; text-align: left; }
            img { display: block; margin: 6px auto; }
            @media print { body { width: 80mm; } }
          </style>
        </head>
        <body>${ticketContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  };

  const detalles = venta.detalles || [];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm transition-opacity`}
          onClick={onClose}
        />

        <div className={`
          relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col
          ${isDark ? 'bg-[#171717] border-neutral-700' : 'bg-white border-gray-200'}
        `}>
          {/* Header */}
          <div className={`
            flex-none px-6 py-5 border-b flex items-center justify-between
            ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}
          `}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-[#E0312A]/20' : 'bg-[#E0312A]/10'}`}>
                <FiFileText className="w-6 h-6 text-[#E0312A]" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {numeroComprobante}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {tipoLabel}
                </p>
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
          <div className={`flex-1 min-h-0 overflow-y-auto ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            {/* Estado SUNAT (simulación de API) */}
            <div className="p-4 pb-0">
              {sunatEstado === 'enviando' ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10">
                  <FiLoader className="w-5 h-5 text-amber-500 animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      Enviando comprobante a SUNAT…
                    </p>
                    <p className="text-[11px] text-amber-700/70 dark:text-amber-400/60">
                      Generando XML firmado y transmitiendo al servicio de
                      facturación electrónica
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                  <FiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      Comprobante ACEPTADO por SUNAT
                    </p>
                    <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400/60 truncate">
                      CDR · Hash: {sunatHash}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Info cards */}
            <div className="p-4 space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}`}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                  <FiCalendar className={isDark ? 'text-gray-400' : 'text-gray-500'} size={16} />
                </div>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Fecha de emisión
                  </p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatFecha(venta.fecha)}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}`}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                  <FiUser className={isDark ? 'text-gray-400' : 'text-gray-500'} size={16} />
                </div>
                <div className="flex-1">
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Cliente
                  </p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {venta.nombreCliente || 'Cliente General'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Vendedor
                  </p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {venta.nombreUsuario || '-'}
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-1.5">
                    <FiMapPin className={isDark ? 'text-gray-500' : 'text-gray-400'} size={12} />
                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Almacén
                    </p>
                  </div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {venta.nombreAlmacen || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Representación impresa del comprobante electrónico */}
            <div
              id="ticket-content"
              className="bg-white text-black font-mono p-4 mx-4 mb-4 rounded-xl border border-gray-200"
              style={{ fontSize: '12px' }}
            >
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold">{RAZON_SOCIAL}</h2>
                <p className="text-[11px]">{DIRECCION_FISCAL}</p>
                <p className="text-xs font-bold mt-1">RUC: {RUC_EMISOR}</p>
              </div>

              <div className="text-center border border-black rounded-md py-2 my-2">
                <p className="text-xs font-bold">{tipoLabel}</p>
                <p className="text-base font-bold">{numeroComprobante}</p>
              </div>

              <div className="text-xs space-y-1 mb-2">
                <p>Fecha emisión: {formatFecha(venta.fecha)}</p>
                <p>
                  Adquirente: {venta.nombreCliente || 'Cliente General'}
                </p>
                <p>
                  {tipoDocCli === '6' ? 'RUC' : 'DNI'}: {docCliente}
                </p>
                <p>Moneda: SOLES (PEN)</p>
              </div>
              <div className="border-t border-dashed border-gray-400 my-2" />

              <div className="mb-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <FiShoppingBag size={12} />
                  <span className="text-xs font-bold">Detalle</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="font-bold border-b border-gray-300">
                      <th className="text-left py-1">Descripción</th>
                      <th className="text-center py-1 w-10">Cant.</th>
                      <th className="text-right py-1 w-14">P.U.</th>
                      <th className="text-right py-1 w-16">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-2 text-gray-500">Sin productos</td>
                      </tr>
                    ) : (
                      detalles.map((detalle: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="text-left py-1 max-w-[120px] truncate">{detalle.nombreProducto}</td>
                          <td className="text-center py-1">{detalle.cantidad}</td>
                          <td className="text-right py-1">{formatPrice(detalle.precioUnitario)}</td>
                          <td className="text-right py-1">{formatPrice(detalle.subtotal)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-dashed border-gray-400 my-2" />

              <div className="text-xs space-y-1 mb-2">
                <div className="flex justify-between">
                  <span>Op. Gravada:</span>
                  <span>{formatPrice(subtotalNum)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGV (18%):</span>
                  <span>{formatPrice(igvNum)}</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-gray-300">
                  <span>IMPORTE TOTAL:</span>
                  <span className="text-[#E0312A]">{formatPrice(totalNum)}</span>
                </div>
              </div>
              <div className="border-t border-dashed border-gray-400 my-2" />

              {/* Bloque SUNAT: QR + hash + leyenda */}
              <div className="text-center text-[11px] mt-2">
                <img
                  src={qrUrl}
                  alt="Código QR SUNAT"
                  width={130}
                  height={130}
                  className="mx-auto"
                />
                <p className="mt-1 break-all">
                  <span className="font-bold">Código de seguridad:</span>{' '}
                  {sunatHash}
                </p>
                <p className="mt-2 leading-snug">
                  Representación impresa de la {tipoLabel}.
                </p>
                <p className="leading-snug">
                  Autorizado mediante Resolución de Intendencia N°{' '}
                  {RESOLUCION_SUNAT}
                </p>
                <p className="leading-snug mt-1">
                  Consulte su comprobante en:
                </p>
                <p className="leading-snug break-all text-[10px]">
                  {URL_CONSULTA_SUNAT}
                </p>
                <p className="mt-2 font-bold">¡Gracias por su compra!</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`
            flex-none px-6 py-4 border-t flex items-center justify-between gap-3
            ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}
          `}>
            <span
              className={`flex items-center gap-1.5 text-[11px] font-medium ${
                sunatEstado === 'aceptado'
                  ? 'text-emerald-500'
                  : 'text-amber-500'
              }`}
            >
              <FiShield size={13} />
              {sunatEstado === 'aceptado'
                ? 'Validado por SUNAT'
                : 'Procesando…'}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-neutral-700 text-white hover:bg-neutral-600 border border-neutral-600' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
              >
                Cerrar
              </button>
              <button
                onClick={handlePrint}
                disabled={sunatEstado !== 'aceptado'}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#E0312A] hover:bg-[#A91E16] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPrinter size={16} />
                Imprimir comprobante
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalTicket;
