"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Edit2, Trash2 } from "lucide-react"

export default function CategoryPage() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const getToken = () => {
    try {
      return localStorage.getItem("token")
    } catch (err) {
      return null
    }
  }

  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const res = await fetch(`/api/categories`)
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (_) {
        // if backend returned HTML (e.g. 404 page), show message
        toast.error("Unexpected response from server when loading categories")
        setCategories([])
        return
      }
      // allow either array or { categories: [] }
      const list = Array.isArray(data) ? data : data.categories || []
      setCategories(list)
    } catch (err) {
      console.error("Failed to fetch categories", err)
      toast.error("Network error while loading categories")
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    setLoading(true)
    try {
      const token = getToken()
      // If editing, send PUT to update existing category
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/categories/${editingId}` : `/api/categories`
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      })

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (_) {
        data = { message: text }
      }

      // Some middleware returns { status: false, message: 'Token not found' } with 200
      if (data && data.status === false) {
        toast.error(data.message || "Authentication error")
        return
      }

      if (!res.ok) {
        toast.error(data.message || (editingId ? "Failed to update category" : "Failed to create category"))
        return
      }
      toast.success(editingId ? "Category updated" : "Category created")
      // refresh list
      await fetchCategories()
      setName("")
      setDescription("")
      setEditingId(null)
    } catch (err) {
      console.error(err)
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (category) => {
    const id = category._id || category.id
    setEditingId(id)
    setName(category.name || "")
    setDescription(category.description || "")
    // scroll to top / form - optional
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName("")
    setDescription("")
  }

  const handleDelete = (category) => {
    const id = category._id || category.id
    if (!id) return
    const token = getToken()
    if (!token) {
      toast.error("You must be logged in as admin to delete")
      return
    }

    toast(
      (t) => (
        <div className="flex items-center gap-4">
          <div>
            <div className="font-medium">Delete category</div>
            <div className="text-sm text-slate-700">Are you sure you want to delete "{category.name}"?</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/categories/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  })
                  const text = await res.text()
                  let data
                  try {
                    data = JSON.parse(text)
                  } catch (_) {
                    data = { message: text }
                  }
                  if (!res.ok) {
                    toast.error(data.message || `Delete failed (status ${res.status})`)
                    console.error("Delete category failed", res.status, data)
                    return
                  }
                  setCategories((s) => s.filter((x) => (x._id || x.id) !== id))
                  toast.success("Category deleted")
                } catch (err) {
                  console.error("Delete request failed", err)
                  toast.error("Network error")
                } finally {
                  toast.dismiss(t.id)
                }
              }}
            >
              Confirm
            </button>
            <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 rounded-md border border-white/20 text-sm">
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Number.POSITIVE_INFINITY },
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold text-slate-900">Categories</h3>
        <p className="text-sm text-slate-700">Add and manage item categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-[#fff2c6] to-white border-2 border-[#d4af37] p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border-2 border-[#d4af37] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 transition-all duration-200 hover:border-[#b8941f]"
                placeholder="e.g. Electronics"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-md border-2 border-[#d4af37] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 transition-all duration-200 hover:border-[#b8941f]"
                rows={4}
                placeholder="Short description shown to users"
                disabled={loading}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#d4af37] to-[#e8c547] text-slate-900 px-4 py-2 rounded-md font-semibold hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-60 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? "Saving..." : editingId ? "Update Category" : "Create Category"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="inline-flex items-center gap-2 bg-slate-200 text-slate-900 px-3 py-2 rounded-md hover:bg-slate-300 hover:scale-105 active:scale-95 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-br from-white to-[#fff2c6] border-2 border-[#d4af37] p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h4 className="text-lg font-semibold text-slate-900 mb-4 text-[#d4af37]">Existing Categories</h4>
          <div className="space-y-3">
            {loadingCategories && (
              <div className="text-sm text-slate-700 flex items-center gap-2">
                <div className="w-4 h-4 bg-[#d4af37] rounded-full animate-spin"></div>
                Loading categories...
              </div>
            )}
            {!loadingCategories && categories.length === 0 && (
              <div className="text-sm text-slate-700">No categories yet.</div>
            )}
            {categories.map((c) => (
              <div
                key={c._id || c.id}
                className="flex items-center justify-between bg-white border-l-4 border-[#d4af37] rounded-md px-4 py-3 hover:bg-[#fff2c6] hover:shadow-md hover:scale-102 active:scale-98 transition-all duration-200 group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-[#d4af37] transition-colors">
                    {c.name}
                  </div>
                  {c.description && <div className="text-sm text-slate-600">{c.description}</div>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded group-hover:bg-[#d4af37] group-hover:text-white transition-colors">
                    {c._id || c.id}
                  </div>
                  <button
                    title="Edit category"
                    onClick={() => startEdit(c)}
                    className="p-2 rounded-md bg-slate-100 text-slate-800 hover:bg-[#d4af37] hover:text-white hover:scale-110 active:scale-95 transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    title="Delete category"
                    className="p-2 rounded-md bg-slate-100 text-red-600 hover:bg-red-600 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200"
                    onClick={() => handleDelete(c)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
