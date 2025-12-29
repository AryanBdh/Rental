"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { apiClient } from '../../config/api'
export default function UsersTable() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const getToken = () => {
    try {
      return localStorage.getItem("token")
    } catch (err) {
      return null
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`/api/user`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (_) {
        toast.error("Unexpected response when loading users")
        setUsers([])
        return
      }

      // allow either array or { users: [] }
      const list = Array.isArray(data) ? data : data.users || []
      setUsers(list)
    } catch (err) {
      console.error("Failed to fetch users", err)
      toast.error("Network error while loading users")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const formatRoles = (role, user) => {
    if (Array.isArray(role)) {
      return role.join(", ")
    }
    if (typeof role === "string" && role.trim()) {
      return role
    }
    // legacy flag fallback
    if (user && (user.isAdmin || user.role === "admin")) return "Admin"
    return "User"
  }

  return (
    <div className="bg-transparent rounded-lg p-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 text-[#d4af37]">Recent Users</h3>
        <div className="text-sm text-slate-700 bg-[#fff2c6] px-4 py-2 rounded-lg border-2 border-[#d4af37] font-semibold">
          Total: <span className="text-[#d4af37]">{users.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto bg-gradient-to-br from-white to-[#fff2c6] border-2 border-[#d4af37] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-[#d4af37] to-[#e8c547] text-slate-900 font-semibold">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-800 divide-y-2 divide-[#d4af37]/20">
            {loading && (
              <tr>
                <td colSpan={4} className="py-4 text-sm text-slate-700 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#d4af37] rounded-full animate-spin"></div>
                    Loading users...
                  </div>
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-sm text-slate-700 px-4">
                  No users found.
                </td>
              </tr>
            )}
            {!loading &&
              users.map((u) => (
                <tr
                  key={u._id || u.id}
                  className="hover:bg-[#d4af37]/10 transition-all duration-200 group cursor-pointer hover:scale-y-105"
                >
                  <td className="py-3 px-4 font-medium group-hover:text-[#d4af37] transition-colors">
                    {u.name || u.fullName || "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-700 group-hover:text-slate-900">{u.email || "—"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                        formatRoles(u.role, u) === "Admin"
                          ? "bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                          : "bg-[#d4af37]/20 text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-white"
                      }`}
                    >
                      {formatRoles(u.role, u)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-sm px-4 py-2 bg-white border-2 border-[#d4af37] text-[#d4af37] rounded-lg hover:bg-gradient-to-r hover:from-[#d4af37] hover:to-[#e8c547] hover:text-white hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 font-semibold">
                      View
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
