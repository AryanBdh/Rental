"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Button from "../../components/ui/Button"
import toast from "react-hot-toast"
import { Plus, Edit2, Eye, ImageIcon, MapPin, Tag } from "lucide-react"

const API_BASE = import.meta.env.VITE_API_URL || ""

export default function Listings({ ownerItems = [], itemsLoading }) {
  const [items, setItems] = useState(ownerItems || [])
  const [hoveredItem, setHoveredItem] = useState(null)
  const navigate = useNavigate()

  useEffect(() => setItems(ownerItems || []), [ownerItems])

  const openEdit = (item) => {
    const id = item._id || item.id
    navigate(`/edit-item/${id}`)
  }

  const deleteItem = async (item) => {
    if (!confirm(`Delete "${item.name}"? This action cannot be undone.`)) return
    try {
      const token = localStorage.getItem('token')
      const id = item._id || item.id
      const res = await fetch(`${API_BASE}/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to delete item')
      toast.custom(() => (
        <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] bg-[#d4af37] text-white px-4 py-2 rounded shadow-lg font-semibold">
          Item deleted
        </div>
      ), { duration: 3000 })
      setItems((prev) => prev.filter((i) => (i._id || i.id) !== (item._id || item.id)))
    } catch (err) {
      console.error('Delete item error', err)
      toast.custom(() => (
        <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] bg-red-600 text-white px-4 py-2 rounded shadow-lg font-semibold">
          {err.message || 'Failed to delete item'}
        </div>
      ), { duration: 3500 })
    }
  }

  

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-[#f5e6d3] rounded-2xl shadow-lg border-2 border-[#d4af37] p-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-[#d4af37]">
          <div>
            <h2 className="text-3xl font-bold text-[#d4af37]">My Listings</h2>
            <p className="text-gray-600 text-sm mt-1">Manage your rental items</p>
          </div>
          <Link to="/add-item">
            <Button className="bg-[#d4af37] text-white hover:bg-[#c49a2d] font-semibold flex items-center gap-2 px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md">
              <Plus className="h-5 w-5" />
              Add Item
            </Button>
          </Link>
        </div>

        {itemsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-gradient-to-br from-[#fff2c6] to-[#f5e6d3] rounded-xl animate-pulse border-2 border-[#d4af37]"
              ></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-[#fff2c6] to-[#f5e6d3] rounded-xl border-2 border-[#d4af37]">
            <ImageIcon className="h-16 w-16 text-[#d4af37] mx-auto mb-4 opacity-60" />
            <p className="text-gray-700 font-semibold mb-4 text-lg">You haven't added any items yet.</p>
            <Link to="/add-item">
              <Button className="bg-[#d4af37] text-white hover:bg-[#c49a2d] font-semibold px-6 py-2 rounded-lg transition-all">
                Add your first item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => {
              const rawImg = it.images && it.images.length ? it.images[0] : null
              const imgSrc = rawImg
                ? rawImg.startsWith("http")
                  ? rawImg
                  : API_BASE
                    ? `${API_BASE}${rawImg}`
                    : rawImg
                : null

              return (
                <div
                  key={it._id || it.id}
                  onMouseEnter={() => setHoveredItem(it._id || it.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="bg-white rounded-xl border-2 border-[#d4af37] overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex flex-col"
                >
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {imgSrc ? (
                      <img src={imgSrc || "/placeholder.svg"} alt={it.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#f5e6d3]">
                        <ImageIcon className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    {hoveredItem === (it._id || it.id) && (
                      <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center gap-2 transition-opacity duration-200 backdrop-blur-sm">
                        <Link to={`/item/${it._id || it.id}`}>
                          <button
                            aria-label="View item"
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#d4af37] text-[#d4af37] bg-white/90 hover:bg-white transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{it.name}</h3>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-[#d4af37] font-bold text-xl">Rs. {it.price}</span>
                      <span className="text-gray-600 text-sm">/{it.priceUnit || "day"}</span>
                    </div>

                    {it.location && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                        <MapPin className="h-4 w-4 text-[#d4af37]" />
                        {it.location}
                      </div>
                    )}
                    {it.condition && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                        <Tag className="h-4 w-4 text-[#d4af37]" />
                        <span className="capitalize">{it.condition}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <Link to={`/item/${it._id || it.id}`}> 
                          <button
                            aria-label="View item"
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 text-[#d4af37] bg-white hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(it)}
                          aria-label="Edit item"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#d4af37] text-[#d4af37] bg-white hover:bg-[#fff2c6] transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => deleteItem(it)}
                          aria-label="Delete item"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 3v1H4v2h16V4h-5V3H9zm-1 6v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V9H8z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      
    </div>
  )
}
