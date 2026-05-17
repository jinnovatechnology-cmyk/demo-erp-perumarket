import { useState, useEffect } from 'react';
import type { Cliente } from '../../types/clientes/Client';
import { ventaService } from '../../services/ventas/ventaService';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await ventaService.fetchClientes();
        setClientes(data);
      } catch (err) {
        console.error('Error cargando clientes', err);
      }
    };
    fetchClientes();
  }, []);

  useEffect(() => {
    if (!busqueda.trim()) {
      setClientesFiltrados([]);
    } else {
      setClientesFiltrados(clientes.filter(c =>
        c.persona.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.persona.apellidoPaterno.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.persona.apellidoMaterno.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.persona.numeroDocumento.includes(busqueda)
      ));
    }
  }, [busqueda, clientes]);

  const registrarCliente = async (data: Omit<Cliente, 'clienteid'>) => {
    const nuevo = await ventaService.registrarCliente(data);
    setClientes([...clientes, nuevo]);
    setClienteSeleccionado(nuevo);
    setBusqueda('');
  };

  return { clientes, clientesFiltrados, busqueda, setBusqueda, clienteSeleccionado, setClienteSeleccionado, registrarCliente };
};
