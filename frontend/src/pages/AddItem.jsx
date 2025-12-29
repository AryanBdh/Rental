"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import toast from "react-hot-toast"
import { MapPin, Camera } from "lucide-react"
import { apiClient } from "../config/api"

export default function AddItem() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    priceUnit: "day",
    category: "",
    condition: "good",
    images: [],
    location: "",
  })
  const [categories, setCategories] = useState([])
  const [previews, setPreviews] = useState([])
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)

  const commonLocations = [
    "City Center",
    "Downtown",
    "North End",
    "South End",
    "East District",
    "West District",
    "Airport Area",
    "Business District",
  ]

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        try {
          URL.revokeObjectURL(p)
        } catch (e) {}
      })
    }
  }, [previews])

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleLocationChange = (e) => {
    const value = e.target.value
    setForm((p) => ({ ...p, location: value }))

    if (value.length > 0) {
      const filtered = commonLocations.filter((loc) => loc.toLowerCase().includes(value.toLowerCase()))
      setLocationSuggestions(filtered)
      setShowLocationDropdown(true)
    } else {
      setLocationSuggestions([])
      setShowLocationDropdown(false)
    }
  }

  const selectLocation = (loc) => {
    setForm((p) => ({ ...p, location: loc }))
    setShowLocationDropdown(false)
    setLocationSuggestions([])
  }

  const addImageField = () => setForm((p) => ({ ...p, images: [...p.images, ""] }))

  useEffect(() => {
    let mounted = true
    async function loadCategories() {
      try {
        const { data } = await apiClient.get("/api/categories")
        if (mounted && Array.isArray(data)) setCategories(data)
      } catch (err) {
        console.warn("Failed to load categories", err)
      }
    }
    loadCategories()
    // prefill location from user's saved address
    async function prefillLocation() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const { data: user } = await apiClient.get('/api/user/profile')
        const addr = user?.address
        if (addr) {
          const parts = [addr.street, addr.city, addr.district, addr.country].filter(Boolean)
          setForm((p) => ({ ...p, location: parts.join(', ') }))
        }
      } catch (err) {
        // ignore
      }
    }
    prefillLocation()
    return () => {
      mounted = false
    }
  }, [])

  const handleFilesSelected = (files) => {
    const list = Array.from(files || [])
    setForm((p) => ({ ...p, images: list }))
    const p = list.map((f) => URL.createObjectURL(f))
    setPreviews(p)
  }

  const removePreview = (index) => {
    const newFiles = [...form.images]
    newFiles.splice(index, 1)
    setForm((p) => ({ ...p, images: newFiles }))
    const newPreviews = [...previews]
    URL.revokeObjectURL(newPreviews[index])
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validation: name required, price positive, location required
    if (!form.name || String(form.name).trim() === "") return toast.error("Name is required")
    const pnum = Number(form.price)
    if (!form.price || Number.isNaN(pnum) || pnum <= 0) return toast.error("Price must be a positive number")
    if (!form.location || String(form.location).trim() === "") return toast.error("Pickup location is required")
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      let res

      if (form.images && form.images.length > 0 && form.images[0] instanceof File) {
        const fd = new FormData()
        fd.append("name", form.name)
        fd.append("description", form.description)
        fd.append("price", String(Number(form.price)))
        fd.append("priceUnit", form.priceUnit || "day")
        if (form.location) fd.append("location", form.location)
        if (form.category) fd.append("category", form.category)
        if (form.condition) fd.append("condition", form.condition)
        form.images.forEach((f) => fd.append("images", f))

        const { data } = await apiClient.post("/api/items", fd, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        res = { ok: true, data }
      } else {
        const body = {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          priceUnit: form.priceUnit || "day",
          category: form.category,
          condition: form.condition,
          images: form.images && form.images.length ? form.images : [],
          location: form.location || undefined,
        }

        const { data } = await apiClient.post("/api/items", body)
        res = { ok: true, data }
      }

      toast.success("Item added successfully")
      navigate("/profile")
    } catch (err) {
      console.error("Add item error", err)
      toast.error(err.message || "Failed to add item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff2c6] to-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#d4af37] mb-2">Add New Item</h1>
          <p className="text-gray-600">List your item for rent</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border-2 border-[#d4af37] shadow-lg">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="bg-[#f5e6d3] border-2 border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]"
                placeholder="e.g., Mountain Bike"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-[#f5e6d3] border-2 border-[#d4af37] rounded-lg px-4 py-2 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name || c.title || c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-[#f5e6d3] border-2 border-[#d4af37] rounded-lg px-4 py-2 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all resize-none"
              rows={4}
              placeholder="Describe your item in detail..."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
              <div className="flex gap-2">
                <Input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="flex-1 bg-[#f5e6d3] border-2 border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]"
                  placeholder="0"
                />
                <select
                  name="priceUnit"
                  value={form.priceUnit}
                  onChange={(e) => setForm((p) => ({ ...p, priceUnit: e.target.value }))}
                  className="bg-[#f5e6d3] border-2 border-[#d4af37] rounded-lg px-3 py-2 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                >
                  <option value="day">/day</option>
                  <option value="month">/month</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
              <select
                name="condition"
                value={form.condition}
                onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
                className="w-full bg-[#f5e6d3] border-2 border-[#d4af37] rounded-lg px-4 py-2 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
              >
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
              <MapPin className="h-4 w-4 text-[#d4af37]" />
              Pickup Location
            </label>
            <div className="relative">
              <Input
                name="location"
                value={form.location}
                readOnly
                disabled
                className="bg-[#f5e6d3] border-2 border-[#d4af37] w-full text-gray-700 cursor-not-allowed"
                placeholder="Pickup location (from profile address)"
              />
            </div>
          </div>

          <div>
            <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
              <Camera className="h-4 w-4 text-[#d4af37]" />
              Images (choose from device)
            </label>
            <div className="border-2 border-dashed border-[#d4af37] rounded-lg p-6 bg-[#f5e6d3] hover:bg-[#fff2c6] transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="w-full text-sm text-gray-600"
              />
            </div>
            {previews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">{previews.length} image(s) selected</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={src || "/placeholder.svg"}
                        alt={`preview-${idx}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-[#d4af37]"
                      />
                      <button
                        type="button"
                        onClick={() => removePreview(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-[#f5e6d3]">
            <Button
              type="submit"
              className="flex-1 bg-[#d4af37] text-white hover:bg-[#c49a2d] font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Item"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-2 border-gray-300 text-[#d4af37]  hover:bg-[#c49a2d] font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
