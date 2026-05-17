import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 bg-gray-100 h-screen overflow-auto">
        <Header />

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
