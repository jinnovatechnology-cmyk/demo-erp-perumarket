/**
 * ModalCliente.tsx - Modal para crear/registrar cliente desde ventas
 * Reutiliza ClienteForm del módulo de clientes
 * Diseño Power BI - Estilo profesional y minimalista
 */

import { useState, useEffect } from "react";
import ClienteForm from "../Clients/ClientFrom";
import type { Cliente } from "../../types/clientes/Client";
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegistrar: (cli: Cliente) => void;
}

const DEFAULT_CLIENT: Cliente = {
  tipo: "NATURAL",
  persona: {
    tipoDocumento: "DNI",
    numeroDocumento: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correo: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: ""
  },
  fechaCreacion: new Date().toISOString(),
  fechaActualizacion: new Date().toISOString()
};

export default function ModalCliente({ isOpen, onClose, onRegistrar }: Props) {
  const { isDark } = useThemeClasses();

  const [cliente, setCliente] = useState<Cliente>({ ...DEFAULT_CLIENT });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCliente({ ...DEFAULT_CLIENT });
    }
  }, [isOpen]);

  const setField = (path: string, value: any) => {
    const parts = path.split(".");
    setCliente((prev) => {
      if (parts.length === 1) {
        const key = parts[0] as keyof Cliente;
        return { ...prev, [key]: value };
      }
      if (parts.length === 2 && parts[0] === "persona") {
        const prop = parts[1] as keyof Cliente["persona"];
        return { ...prev, persona: { ...prev.persona, [prop]: value } };
      }
      return prev;
    });
  };

  const handleSave = (savedCliente: Cliente) => {
    onRegistrar(savedCliente);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm transition-opacity`}
          onClick={onClose}
        />

        {/* Modal - ClienteForm has its own header, body and footer */}
        <div className={`
          relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col
          ${isDark ? 'bg-[#171717] border-neutral-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <ClienteForm
              state={cliente}
              setField={setField}
              onCancel={onClose}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
