"use client"
import { NavLink, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function Sidebar() {
  const navigate = useNavigate()
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 text-[#1a1a1a] rounded-lg transition-all duration-300 transform ${
      isActive
        ? "bg-[#d4af37] text-white font-semibold scale-105 shadow-md"
        : "hover:bg-[#fff2c6] hover:border-l-4 hover:border-[#d4af37] hover:scale-102"
    }`

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged out successfully")
    navigate("/")
  }

  return (
    <aside className="w-64 bg-white shadow-lg text-[#1a1a1a] min-h-screen p-4 fixed border-r-4 border-[#d4af37]">
      <div className="text-2xl font-bold mb-6 text-[#d4af37] hover:scale-110 transition-transform duration-300 cursor-pointer">
        Admin
      </div>
      <nav className="flex flex-col gap-2">
        <NavLink to="/admin" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/users" className={linkClass}>
          Users
        </NavLink>
        <NavLink to="/admin/categories" className={linkClass}>
          Categories
        </NavLink>
        <NavLink to="/admin/items" className={linkClass}>
          Items
        </NavLink>
        <NavLink to="/admin/settings" className={linkClass}>
          Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 rounded-lg hover:bg-[#d4af37] hover:text-white transition-all duration-300 text-[#1a1a1a] transform hover:scale-105 mt-4"
        >
          Logout
        </button>
      </nav>
    </aside>
  )
}
