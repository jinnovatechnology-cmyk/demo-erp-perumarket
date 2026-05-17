import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Accesos from "./pages/accesos/Accesos";
import Proveedores from "./pages/proveedores/proveedores";
import VentasList from "./pages/ventas/ventaslist";
import VentasHistorial from "./pages/ventas/VentasHistorial";
import PedidosList from "./pages/pedidos/pedidosList";
import Reportes from "./pages/reportes/reportes";
import Inventory from "./pages/Inventory/Inventory";
import InventoryAddProduct from "./pages/Inventory/InventoryAddProduct";
import InventoryMovements from "./pages/Inventory/InventoryMovements";
import WarehouseManagement from "./pages/Inventory/InventoryAlmacenes";
import InventoryAddAlmacenes from "./pages/Inventory/InventoryAddAlmacenes";
import Envios from "./pages/envios/envios";
import PurchaseList from "./pages/Purchase/PurchaseList";
import PurchaseHistory from "./pages/Purchase/PurchaseHistory";
import NewPurchase from "./pages/Purchase/Purchase";
import InventoryStockPorAlmacen from "./pages/Inventory/InventoryStockPorAlmacen";
import AppClientes from "./pages/Clients/AppClients";
import AppEmployees from "./pages/employees/AppEmployees";
// Importa el nuevo componente de prueba
import TestConnection from "./pages/TestConnection";
import Unauthorized from "./pages/Unauthorized"; // Asegúrate de crear esta página
import Settings from "./pages/configuracion/Settings";
import { useTheme } from "./context/ThemeContext";

function App() {
  const location = useLocation();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const hideLayout = location.pathname === "/login" ||
                     location.pathname === "/" ||
                     location.pathname === "/unauthorized";

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDark ? "bg-gray-900" : "bg-white"}`}>

      {!hideLayout && <Sidebar />}

      <div className={`flex-1 flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? "bg-gray-900" : ""}`}>
        {!hideLayout && <Header />}

        <div className={hideLayout ? "" : `p-4 overflow-auto flex-1 transition-colors duration-300 ${isDark ? "bg-gray-900" : ""}`}>

          <Routes>
            {/* Redirección por defecto al login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* LOGIN */}
            <Route path="/login" element={<Login />} />

            {/* PÁGINA DE NO AUTORIZADO */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* RUTA DE PRUEBA - No necesita protección para probar conexión */}
            <Route path="/test-connection" element={<TestConnection />} />

            {/* RUTAS PROTEGIDAS CON MÓDULOS ESPECÍFICOS */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredModule="Dashboard">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/accesos"
              element={
                <ProtectedRoute requiredModule="Accesos">
                  <Accesos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/proveedores"
              element={
                <ProtectedRoute requiredModule="Proveedores">
                  <Proveedores />
                </ProtectedRoute>
              }
            />

            <Route
              path="/clientes"
              element={
                <ProtectedRoute requiredModule="Clientes">
                  <AppClientes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/empleados"
              element={
                <ProtectedRoute requiredModule="Empleados">
                  <AppEmployees />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ventas"
              element={
                <ProtectedRoute requiredModule="Ventas">
                  <VentasHistorial />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ventas/nueva"
              element={
                <ProtectedRoute requiredModule="Ventas">
                  <VentasList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pedidos"
              element={
                <ProtectedRoute requiredModule="Pedidos">
                  <PedidosList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reportes"
              element={
                <ProtectedRoute requiredModule="Reportes">
                  <Reportes />
                </ProtectedRoute>
              }
            />

            {/* RUTAS DE INVENTARIO */}
            <Route
              path="/inventario"
              element={
                <ProtectedRoute requiredModule="Inventario">
                  <Inventory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inventario/nuevo"
              element={
                <ProtectedRoute requiredModule="Inventario">
                  <InventoryAddProduct />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inventario/movimientos/:id"
              element={
                <ProtectedRoute requiredModule="Inventario">
                  <InventoryMovements />
                </ProtectedRoute>
              }
            />

            <Route 
              path="/inventario/almacenes"
              element={
                <ProtectedRoute requiredModule="Inventario">
                  <WarehouseManagement />
                </ProtectedRoute>
              }
            />

            <Route 
              path="/inventario/almacenes/nuevo"
              element={
                <ProtectedRoute requiredModule="Inventario">
                  <InventoryAddAlmacenes />
                </ProtectedRoute>
              }
            />

            <Route 
              path="/inventario/stock/:id"
              element={
                <ProtectedRoute requiredModule="Inventario">
                  <InventoryStockPorAlmacen />
                </ProtectedRoute>
              }
            />

            {/* RUTAS DE ENVÍOS */}
            <Route
              path="/envios"
              element={
                <ProtectedRoute requiredModule="Envios">
                  <Envios />
                </ProtectedRoute>
              }
            />

            {/* RUTAS DE COMPRAS */}
            <Route
              path="/compras"
              element={
                <ProtectedRoute requiredModule="Compras">
                  <PurchaseList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/compras/historial/:id"
              element={
                <ProtectedRoute requiredModule="Compras">
                  <PurchaseHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/compras/nueva"
              element={
                <ProtectedRoute requiredModule="Compras">
                  <NewPurchase />
                </ProtectedRoute>
              }
            />

            {/* RUTA DE CONFIGURACIÓN */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Ruta 404 - Redirigir al dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;