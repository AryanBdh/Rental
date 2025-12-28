import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import { Outlet } from "react-router-dom"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#fff2c6] text-[#1a1a1a]">
      <Sidebar />

      <main className="ml-64 p-6 text-[#1a1a1a] min-h-screen">
        <Topbar />

        <div className="mt-6 animate-fadeIn">
          <Outlet />
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
