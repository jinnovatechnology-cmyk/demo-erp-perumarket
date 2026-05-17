/**
 * ClientCards.tsx - Tarjeta de cliente estilo Power BI
 * Diseño limpio, profesional y minimalista
 */

import type { Cliente } from "../../types/clientes/Client";
import { formatDate } from "../../utils/format";
import { useThemeClasses } from '../../hooks/useThemeClasses';
import {
  FiMail,
  FiPhone,
  FiCalendar,
  FiEdit3,
  FiTrash2,
  FiBriefcase,
  FiUser,
  FiMapPin,
  FiFileText
} from "react-icons/fi";

interface Props {
  data: Cliente;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ClienteCard({ data, onEdit, onDelete }: Props) {
  const { isDark } = useThemeClasses();

  // Safe initials logic
  const iniciales = `${
    data.persona?.nombres?.charAt(0)?.toUpperCase() || ""
  }${data.persona?.apellidoPaterno?.charAt(0)?.toUpperCase() || ""}`;

  const fechaRegistro = data.fechaCreacion ? formatDate(data.fechaCreacion) : "N/A";
  const esJuridica = data.tipo === 'JURIDICA';
  const estaActivo = data.estado === 'ACTIVO';

  const nombreCompleto = `${data.persona?.nombres || ''} ${data.persona?.apellidoPaterno || ''}`.trim();

  return (
    <div className={`
      group relative flex flex-col rounded-xl overflow-hidden transition-all duration-200
      ${isDark
        ? 'bg-[#171717] border border-neutral-800 hover:border-neutral-700'
        : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg'
      }
    `}>
      {/* Header */}
      <div className={`px-5 py-4 flex items-start justify-between border-b ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
        {/* Avatar + Info */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className={`
              h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg
              ${isDark ? 'bg-[#E0312A]/20 text-[#F0726A]' : 'bg-[#E0312A]/10 text-[#E0312A]'}
            `}>
              {iniciales || '??'}
            </div>
            {/* Estado indicator */}
            <span className={`
              absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2
              ${isDark ? 'border-[#171717]' : 'border-white'}
              ${estaActivo ? 'bg-green-500' : 'bg-red-500'}
            `} />
          </div>

          {/* Nombre y tipo */}
          <div className="min-w-0 flex-1">
            <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {nombreCompleto || 'Sin nombre'}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`
                inline-flex items-center gap-1 text-xs font-medium
                ${isDark ? 'text-gray-400' : 'text-gray-500'}
              `}>
                {esJuridica ? <FiBriefcase size={11} /> : <FiUser size={11} />}
                {data.tipo}
              </span>
              <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
              <span className={`
                text-xs font-medium
                ${estaActivo
                  ? 'text-green-500'
                  : 'text-red-500'
                }
              `}>
                {estaActivo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* ID Badge */}
        <span className={`
          text-[10px] font-mono font-semibold px-2 py-1 rounded-md
          ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}
        `}>
          #{data.id?.toString().padStart(4, '0')}
        </span>
      </div>

      {/* Content */}
      <div className="px-5 py-4 flex-1 space-y-3">
        {/* Documento */}
        <InfoRow
          icon={<FiFileText size={14} />}
          label={data.persona?.tipoDocumento || 'DOC'}
          value={data.persona?.numeroDocumento}
          isDark={isDark}
          highlight
        />

        {/* Email */}
        <InfoRow
          icon={<FiMail size={14} />}
          label="Email"
          value={data.persona?.correo}
          isDark={isDark}
          truncate
        />

        {/* Grid 2 cols */}
        <div className="grid grid-cols-2 gap-3">
          <InfoRow
            icon={<FiPhone size={14} />}
            label="Teléfono"
            value={data.persona?.telefono}
            isDark={isDark}
            compact
          />
          <InfoRow
            icon={<FiCalendar size={14} />}
            label="Registro"
            value={fechaRegistro}
            isDark={isDark}
            compact
          />
        </div>

        {/* Dirección */}
        <InfoRow
          icon={<FiMapPin size={14} />}
          label="Dirección"
          value={data.persona?.direccion}
          isDark={isDark}
          truncate
        />
      </div>

      {/* Footer con acciones */}
      <div className={`
        px-4 py-3 flex items-center gap-2 border-t
        ${isDark ? 'bg-[#0a0a0a]/50 border-neutral-800' : 'bg-gray-50/80 border-gray-100'}
      `}>
        <button
          onClick={onEdit}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-all duration-200 bg-[#E0312A] hover:bg-[#A91E16]"
        >
          <FiEdit3 size={15} />
          Editar
        </button>

        <button
          onClick={onDelete}
          className={`
            p-2.5 rounded-lg transition-all duration-200 border
            ${isDark
              ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10 border-neutral-800 hover:border-red-500/30'
              : 'text-gray-500 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200'
            }
          `}
          title="Eliminar cliente"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INFO ROW - Fila de información compacta
   ═══════════════════════════════════════════════════════════════════════════ */

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  isDark: boolean;
  truncate?: boolean;
  compact?: boolean;
  highlight?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
  isDark,
  truncate,
  compact,
  highlight
}) => (
  <div className={`flex items-center gap-2.5 ${compact ? '' : ''}`}>
    {/* Icono */}
    <div className={`
      flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
      ${highlight
        ? 'bg-[#E0312A]/10 text-[#E0312A]'
        : isDark
          ? 'bg-gray-800 text-gray-500'
          : 'bg-gray-100 text-gray-400'
      }
    `}>
      {icon}
    </div>

    {/* Contenido */}
    <div className="min-w-0 flex-1">
      <p className={`
        text-[10px] uppercase tracking-wider font-semibold
        ${isDark ? 'text-gray-500' : 'text-gray-400'}
      `}>
        {label}
      </p>
      <p className={`
        text-sm font-medium leading-tight
        ${highlight
          ? isDark ? 'text-white font-semibold' : 'text-gray-900 font-semibold'
          : isDark ? 'text-gray-300' : 'text-gray-700'
        }
        ${truncate ? 'truncate' : ''}
      `}
        title={value || undefined}
      >
        {value || (
          <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            --
          </span>
        )}
      </p>
    </div>
  </div>
);
