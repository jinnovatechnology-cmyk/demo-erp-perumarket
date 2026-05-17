import { useState } from 'react';
import type { Warehouse, NotificationState } from '../../types/inventario/warehouse';
import { warehouseService } from '../../services/inventario/warehouseService';

// Recibe setWarehouses para actualización optimista de la UI
export const useWarehouseEdit = (
  warehouses: Warehouse[], 
  setWarehouses: React.Dispatch<React.SetStateAction<Warehouse[]>>
) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const handleOpenEditModal = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedWarehouse(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (selectedWarehouse) {
      const { name, value } = e.target;
      setSelectedWarehouse({
        ...selectedWarehouse,
        [name]: name === 'capacidadM3' ? parseFloat(value) : value,
      });
    }
  };

  const handleUpdateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return;

    try {
      await warehouseService.updateWarehouse(selectedWarehouse.id, {
        nombre: selectedWarehouse.nombre,
        codigo: selectedWarehouse.codigo,
        direccion: selectedWarehouse.direccion,
        responsable: selectedWarehouse.responsable,
        capacidadM3: selectedWarehouse.capacidadM3,
        estado: selectedWarehouse.estado,
      });

      // Actualizar estado local
      setWarehouses(warehouses.map(w => w.id === selectedWarehouse.id ? selectedWarehouse : w));
      
      setNotification({ message: 'Almacén actualizado correctamente', type: 'success' });
      handleCloseEditModal();

    } catch (err: any) {
      setNotification({ message: err.message, type: 'error' });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return {
    showEditModal,
    selectedWarehouse,
    notification,
    handleOpenEditModal,
    handleCloseEditModal,
    handleFormChange,
    handleUpdateWarehouse
  };
};