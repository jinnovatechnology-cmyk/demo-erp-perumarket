/**
 * ProveedorCard.tsx - Tarjeta de proveedor estilo Power BI
 * Diseño limpio, profesional y minimalista
 */

import type { ProveedorData } from '../../../types/proveedor/proveedorType';
import { useThemeClasses } from '../../../hooks/useThemeClasses';
import {
  FiMail,
  FiPhone,
  FiEdit3,
  FiTrash2,
  FiPackage,
  FiUser,
  FiMapPin,
  FiFileText,
  FiTruck
} from 'react-icons/fi';

interface Props {
  proveedor: ProveedorData;
  onEdit: (p: ProveedorData) => void;
  onDelete: (p: ProveedorData) => void;
  onViewProducts: (p: ProveedorData) => void;
}

export default function ProveedorCard({ proveedor, onEdit, onDelete, onViewProducts }: Props) {
  const { isDark } = useThemeClasses();

  const isActive = proveedor.estado?.toUpperCase() === 'ACTIVO';
  const nombreEmpresa = proveedor.razon_social || "Sin Razón Social";

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
              <FiTruck size={22} />
            </div>
            {/* Estado indicator */}
            <span className={`
              absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2
              ${isDark ? 'border-[#171717]' : 'border-white'}
              ${isActive ? 'bg-green-500' : 'bg-red-500'}
            `} />
          </div>

          {/* Nombre y tipo */}
          <div className="min-w-0 flex-1">
            <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`} title={nombreEmpresa}>
              {nombreEmpresa}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`
                inline-flex items-center gap-1 text-xs font-medium
                ${isDark ? 'text-gray-400' : 'text-gray-500'}
              `}>
                Proveedor
              </span>
              <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
              <span className={`
                text-xs font-medium
                ${isActive ? 'text-green-500' : 'text-red-500'}
              `}>
                {isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* ID Badge */}
        <span className={`
          text-[10px] font-mono font-semibold px-2 py-1 rounded-md
          ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}
        `}>
          #{proveedor.id?.toString().padStart(4, '0')}
        </span>
      </div>

      {/* Content */}
      <div className="px-5 py-4 flex-1 space-y-3">
        {/* RUC */}
        <InfoRow
          icon={<FiFileText size={14} />}
          label="RUC"
          value={proveedor.ruc}
          isDark={isDark}
          highlight
        />

        {/* Contacto */}
        <InfoRow
          icon={<FiUser size={14} />}
          label="Contacto"
          value={proveedor.contacto}
          isDark={isDark}
        />

        {/* Email */}
        <InfoRow
          icon={<FiMail size={14} />}
          label="Email"
          value={proveedor.correo}
          isDark={isDark}
          truncate
        />

        {/* Grid 2 cols */}
        <div className="grid grid-cols-2 gap-3">
          <InfoRow
            icon={<FiPhone size={14} />}
            label="Teléfono"
            value={proveedor.telefono}
            isDark={isDark}
            compact
          />
          <InfoRow
            icon={<FiMapPin size={14} />}
            label="Dirección"
            value={proveedor.direccion}
            isDark={isDark}
            compact
            truncate
          />
        </div>
      </div>

      {/* Footer con acciones */}
      <div className={`
        px-4 py-3 flex items-center gap-2 border-t
        ${isDark ? 'bg-[#0a0a0a]/50 border-neutral-800' : 'bg-gray-50/80 border-gray-100'}
      `}>
        <button
          onClick={() => onViewProducts(proveedor)}
          className={`
            p-2.5 rounded-lg transition-all duration-200 border
            ${isDark
              ? 'text-blue-400 hover:bg-blue-500/10 border-neutral-800 hover:border-blue-500/30'
              : 'text-blue-600 hover:bg-blue-50 border-gray-200 hover:border-blue-200'
            }
          `}
          title="Ver catálogo de productos"
        >
          <FiPackage size={18} />
        </button>

        <button
          onClick={() => onEdit(proveedor)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-all duration-200 bg-[#E0312A] hover:bg-[#A91E16]"
        >
          <FiEdit3 size={15} />
          Editar
        </button>

        <button
          onClick={() => onDelete(proveedor)}
          className={`
            p-2.5 rounded-lg transition-all duration-200 border
            ${isDark
              ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10 border-neutral-800 hover:border-red-500/30'
              : 'text-gray-500 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200'
            }
          `}
          title="Eliminar proveedor"
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
  highlight
}) => (
  <div className="flex items-center gap-2.5">
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
