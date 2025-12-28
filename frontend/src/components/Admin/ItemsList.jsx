"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function ItemsList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/items")
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (_) {
        toast.error("Unexpected response when loading items")
        setItems([])
        return
      }
      const list = Array.isArray(data) ? data : data.items || []
      setItems(list)
    } catch (err) {
      console.error("Failed to load items", err)
      toast.error("Network error while loading items")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-3 text-[#d4af37]">Recent Items</h3>
      <div className="overflow-x-auto bg-gradient-to-br from-white to-[#fff2c6] border-2 border-[#d4af37] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-[#d4af37] to-[#e8c547] text-slate-900 font-semibold">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Category</th>
            </tr>
          </thead>
          <tbody className="text-slate-800 divide-y-2 divide-[#d4af37]/20">
            {loading && (
              <tr>
                <td colSpan={4} className="py-4 text-sm text-slate-700 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#d4af37] rounded-full animate-spin"></div>
                    Loading items...
                  </div>
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-sm text-slate-700 px-4">
                  No items found.
                </td>
              </tr>
            )}
            {!loading &&
              items.map((it) => (
                <tr
                  key={it._id || it.id}
                  className="hover:bg-[#d4af37]/10 transition-all duration-200 group cursor-pointer hover:scale-y-105"
                >
                  <td className="py-3 px-4 font-medium group-hover:text-[#d4af37] transition-colors">{it.name}</td>
                  <td className="py-3 px-4 text-slate-700 group-hover:text-slate-900">
                    {it.owner?.name || it.owner?.email || "—"}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#d4af37] text-base group-hover:scale-110 transition-transform origin-left">
                    {it.price}
                    {it.priceUnit ? ` /${it.priceUnit}` : "/day"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-[#d4af37]/20 text-[#d4af37] px-3 py-1 rounded-full text-xs font-semibold group-hover:bg-[#d4af37] group-hover:text-white transition-all duration-200">
                      {it.category?.name || "—"}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
