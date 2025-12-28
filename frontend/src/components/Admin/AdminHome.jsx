"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import StatsCard from "./StatsCard"
import UsersTable from "./UsersTable"
import ItemsList from "./ItemsList"

export default function AdminHome() {
  const [totalUsers, setTotalUsers] = useState(null)

  const getToken = () => {
    try {
      return localStorage.getItem("token")
    } catch (err) {
      return null
    }
  }

  const fetchTotalUsers = async () => {
    try {
      const token = getToken()
      const res = await fetch("/api/user", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (_) {
        toast.error("Unexpected response when loading total users")
        return
      }

      const list = Array.isArray(data) ? data : data.users || []
      setTotalUsers(list.length)
    } catch (err) {
      console.error("Failed to load total users", err)
      toast.error("Network error while loading total users")
    }
  }

  useEffect(() => {
    fetchTotalUsers()
  }, [])

  const displayTotal = () => {
    if (totalUsers === null) return "—"
    return totalUsers.toLocaleString()
  }

  return (
    <>
      <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-[#d4af37] hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
          <StatsCard title="Total Users" value={displayTotal()} delta="+4%" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-[#d4af37] hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
          <StatsCard title="Active Rentals" value="321" delta="+1.2%" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-[#d4af37] hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
          <StatsCard title="Revenue (Mo)" value="$12.4k" delta="+8%" />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border-2 border-[#d4af37] hover:shadow-xl transition-shadow duration-300">
          <UsersTable />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-2 border-[#d4af37] hover:shadow-xl transition-shadow duration-300">
          <ItemsList />
        </div>
      </section>
    </>
  )
}
