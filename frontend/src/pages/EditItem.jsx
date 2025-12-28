"use client"

import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import toast from "react-hot-toast"
import { MapPin, Camera } from "lucide-react"

const API_BASE = import.meta.env.VITE_API_URL || ""

export default function EditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [itemLoading, setItemLoading] = useState(true)
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
  const [existingImages, setExistingImages] = useState([]) // images already saved on the item (absolute URLs)
  const [removedImages, setRemovedImages] = useState(new Set()) // set of image URLs user removed
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)

  const commonLocations = [
    "Kathmandu",
    "Lalitpur",
    "Bhaktapur",
    "Pokhara",
    "Bharatpur",
    "Biratnagar",
    "Dharan",
    "Janakpur",
    "Butwal",
    "Hetauda",
    "Dhangadhi",
    "Nepalgunj",
  ]

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/items/${id}`)
        if (!res.ok) throw new Error('Failed to load item')
        const data = await res.json()
        if (!mounted) return
        setForm({
          name: data.name || "",
          description: data.description || "",
          price: data.price || "",
          priceUnit: data.priceUnit || "day",
          category: (data.category && (data.category._id || data.category.id)) ? (data.category._id || data.category.id) : (typeof data.category === 'string' ? data.category : ""),
          condition: data.condition || "good",
          images: [],
          location: data.location || "",
        })
        // previews use absolute image URLs returned by backend
        const imgs = (data.images && Array.isArray(data.images)) ? data.images : []
        setExistingImages(imgs.slice())
        setPreviews(imgs.slice())
      } catch (err) {
        console.error('Load item error', err)
        toast.error('Failed to load item')
      } finally {
        setItemLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  useEffect(() => {
    let mounted = true
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories')
        if (!res.ok) return
        const data = await res.json()
        if (mounted && Array.isArray(data)) setCategories(data)
      } catch (err) {
        console.warn('Failed to load categories', err)
      }
    }
    loadCategories()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        try { URL.revokeObjectURL(p) } catch (e) {}
      })
    }
  }, [previews])

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

  const handleFilesSelected = (files) => {
    const list = Array.from(files || [])
    // append new files to form.images and append previews
    setForm((p) => ({ ...p, images: [ ...(p.images || []), ...list ] }))
    const purls = list.map((f) => URL.createObjectURL(f))
    // combine existing previews (existingImages) with new file previews
    setPreviews((prev) => {
      return [...prev.filter(Boolean), ...purls]
    })
  }

  const removePreview = (index) => {
    // Determine whether the preview at `index` is from existingImages or from newly selected files.
    const preview = previews[index]
    // If preview matches an existing image URL, mark it removed and remove from existingImages
    if (typeof preview === 'string' && existingImages.includes(preview)) {
      setRemovedImages((s) => new Set(Array.from(s).concat(preview)))
      setExistingImages((prev) => prev.filter((p) => p !== preview))
      setPreviews((prev) => {
        const copy = [...prev]
        copy.splice(index, 1)
        return copy
      })
      return
    }

    // Otherwise it's a new file preview (object/blob URL)
    const newFiles = [...(form.images || [])]
    const filePreviewUrls = previews.filter((p) => typeof p === 'string' && p.startsWith('blob:'))
    const objectUrl = preview
    const fileIndex = filePreviewUrls.indexOf(objectUrl)
    if (fileIndex !== -1 && newFiles && newFiles.length > fileIndex) {
      newFiles.splice(fileIndex, 1)
    }
    setForm((p) => ({ ...p, images: newFiles }))
    const newPreviews = [...previews]
    try { URL.revokeObjectURL(newPreviews[index]) } catch (e) {}
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)
  }

  const validate = () => {
    if (!form.name || String(form.name).trim() === "") return 'Name is required'
    const p = Number(form.price)
    if (!form.price || Number.isNaN(p) || p <= 0) return 'Price must be a positive number'
    if (!form.location || String(form.location).trim() === "") return 'Pickup location is required'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) return toast.error(err)
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // Upload new files first (if any)
      if (form.images && form.images.length > 0 && form.images[0] instanceof File) {
        for (let f of form.images) {
          const fd = new FormData()
          fd.append('image', f)
          const res = await fetch(`${API_BASE}/api/items/${id}/upload-image`, {
            method: 'POST',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: fd,
          })
          if (!res.ok) {
            const text = await res.text()
            let errData = {}
            try { errData = text ? JSON.parse(text) : {} } catch (e) { errData = { message: text } }
            throw new Error(errData.message || 'Failed to upload image')
          }
        }
      }

      // Fetch current images (may include newly uploaded ones)
      let currentImages = []
      try {
        const r = await fetch(`${API_BASE}/api/items/${id}`)
        if (r.ok) {
          const d = await r.json()
          currentImages = Array.isArray(d.images) ? d.images : []
        }
      } catch (e) {}

      // Remove images user marked as removed
      const removedArr = Array.from(removedImages)
      const finalImages = currentImages.filter((img) => !removedArr.includes(img))

      // PATCH full item including final images array
      const body = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        priceUnit: form.priceUnit || 'day',
        category: form.category,
        condition: form.condition,
        location: form.location || undefined,
        images: finalImages,
      }

      const res = await fetch(`${API_BASE}/api/items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      })

      const respText = await res.text()
      let data
      try { data = respText ? JSON.parse(respText) : {} } catch (e) { data = { message: respText } }
      if (!res.ok) throw new Error(data.message || 'Update failed')

      toast.success('Item updated')
      navigate('/profile?refresh=1')
    } catch (err) {
      console.error('Edit submit error', err)
      toast.error(err.message || 'Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  if (itemLoading) return <div className="p-6">Loading item...</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff2c6] to-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#d4af37] mb-2">Edit Item</h1>
          <p className="text-gray-600">Update details for your listing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border-2 border-[#d4af37] shadow-lg">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
              <Input name="name" value={form.name} onChange={handleChange} required className="bg-[#f5e6d3] border-2 border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full bg-[#f5e6d3] border-2 border-[#d4af37] rounded-lg px-4 py-2">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name || c.title || c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full bg-[#f5e6d3] border-2 border-[#d4af37] rounded-lg px-4 py-2" rows={4} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
              <div className="flex gap-2">
                <Input name="price" type="number" value={form.price} onChange={handleChange} required className="flex-1 bg-[#f5e6d3] border-2 border-[#d4af37]" />
                <select name="priceUnit" value={form.priceUnit} onChange={handleChange} className="bg-[#f5e6d3] border-2 border-[#d4af37] rounded-lg px-3 py-2">
                  <option value="day">/day</option>
                  <option value="month">/month</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange} className="w-full bg-[#f5e6d3] border-2 border-[#d4af37] rounded-lg px-4 py-2">
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
              <Input name="location" value={form.location} onChange={handleLocationChange} onFocus={() => form.location && setShowLocationDropdown(true)} className="bg-[#f5e6d3] border-2 border-[#d4af37] w-full" placeholder="Type a location..." />
              {showLocationDropdown && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#d4af37] rounded-lg mt-1 shadow-lg z-10">
                  {locationSuggestions.map((loc, idx) => (
                    <button key={idx} type="button" onClick={() => selectLocation(loc)} className="w-full text-left px-4 py-2 hover:bg-[#fff2c6] text-gray-900 font-medium transition-colors flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#d4af37]" />
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
              <Camera className="h-4 w-4 text-[#d4af37]" />
              Images (optional)
            </label>
            <div className="border-2 border-dashed border-[#d4af37] rounded-lg p-6 bg-[#f5e6d3]">
              <input type="file" accept="image/*" multiple onChange={(e) => handleFilesSelected(e.target.files)} className="w-full text-sm text-gray-600" />
            </div>
            {previews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">{previews.length} image(s) selected</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img src={src || "/placeholder.svg"} alt={`preview-${idx}`} className="w-full h-24 object-cover rounded-lg border-2 border-[#d4af37]" />
                      <button type="button" onClick={() => removePreview(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-[#f5e6d3]">
            <Button type="submit" className="flex-1 bg-[#d4af37] text-white hover:bg-[#c49a2d] font-semibold py-3 rounded-lg" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            <Button type="button" variant="outline" className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold py-3 rounded-lg" onClick={() => navigate('/profile')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
