"use client"

import { useEffect, useMemo, useState } from "react"
import Header from "../components/HeaderComponent"
import ItemCard from "../components/ItemCard"
import { Search, GridIcon, ListIcon, Filter } from "lucide-react"
import { useLocation } from "react-router-dom"
import { apiClient } from "../config/api"

export default function Browse() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  const [filters, setFilters] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const location = useLocation()
  // compute overall price bounds from loaded items
  const overallMin = useMemo(() => {
    const prices = items.map((i) => Number(i.price || 0))
    return prices.length ? Math.min(...prices) : 0
  }, [items])
  const overallMax = useMemo(() => {
    const prices = items.map((i) => Number(i.price || 0))
    return prices.length ? Math.max(...prices) : 100
  }, [items])

  // Slider state for min/max price (two-thumb behavior using two overlapping range inputs)
  const [sliderMin, setSliderMin] = useState(overallMin)
  const [sliderMax, setSliderMax] = useState(overallMax)

  // derive unique category options robustly (category may be id string or object)
  const categoryOptions = useMemo(() => {
    const map = new Map()
    items.forEach((it) => {
      if (!it || it.category == null) return
      // category can be a string id or an object
      if (typeof it.category === "string") {
        map.set(it.category, it.category)
      } else if (typeof it.category === "object") {
        const id = it.category._id || it.category.id || it.category.name
        const label = it.category.name || it.category.label || id
        if (id) map.set(id, label)
      }
    })
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }))
  }, [items])

  // Keep filters in sync when sliders or items change
  useEffect(() => {
    // if filters already set use them (allow zero), otherwise initialize from overall bounds
    const fmin =
      typeof filters.minPrice !== "undefined" && filters.minPrice !== null ? Number(filters.minPrice) : overallMin
    const fmax =
      typeof filters.maxPrice !== "undefined" && filters.maxPrice !== null ? Number(filters.maxPrice) : overallMax
    setSliderMin(fmin)
    setSliderMax(fmax)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overallMin, overallMax])

  const fetchItems = async (filters = {}) => {
    setLoading(true)
    try {
      // Build query params from filters
      const params = new URLSearchParams()
      if (typeof filters.minPrice !== "undefined" && filters.minPrice !== null)
        params.append("minPrice", filters.minPrice)
      if (typeof filters.maxPrice !== "undefined" && filters.maxPrice !== null)
        params.append("maxPrice", filters.maxPrice)
      if (filters.category) params.append("category", filters.category)
      if (filters.location) params.append("location", filters.location)
      if (filters.availability && filters.availability !== "all")
        params.append("availability", filters.availability === "available")

      const url = `/api/items?${params.toString()}`
      const { data } = await apiClient.get(url)
      if (Array.isArray(data)) {
        // filter out items owned by current user
        let user = null
        try { user = JSON.parse(localStorage.getItem('user') || 'null') } catch (e) { user = null }
        const userId = user ? (user._id || user.id || user.id) : null
        const filtered = data.filter((it) => {
          if (!userId) return true
          const ownerId = it.owner && (typeof it.owner === 'string' ? it.owner : (it.owner._id || it.owner.id))
          return String(ownerId) !== String(userId)
        })
        setItems(filtered)
      } else setItems([])
    } catch (err) {
      // Fallback: use mock data if API is not available
      setItems([
        {
          _id: "1",
          name: "Mountain Bike",
          description: "A rugged mountain bike",
          price: 25,
          availability: true,
          images: [],
        },
        {
          _id: "2",
          name: "DSLR Camera",
          description: "High quality camera",
          price: 40,
          availability: false,
          images: [],
        },
        {
          _id: "3",
          name: "Sofa",
          description: "Comfortable 3-seater",
          price: 15,
          availability: true,
          images: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // if category provided in query params, set filter
    const params = new URLSearchParams(location.search)
    const cat = params.get("category")
    const initialFilters = {}
    if (cat) initialFilters.category = cat
    // initialize filters and fetch
    setFilters((p) => ({ ...p, ...initialFilters }))
    fetchItems({ ...filters, ...initialFilters })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  const handleSearch = (newFilters) => {
    setFilters(newFilters)
    setFilterOpen(false)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
    setSortBy("featured")
    setCurrentPage(1)
    setSliderMin(overallMin)
    setSliderMax(overallMax)
  }

  const filteredItems = useMemo(() => {
    const f = items.filter((it) => {
      const matchesSearch =
        !searchTerm ||
        (it.name && it.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (it.description && it.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const minP =
        typeof filters.minPrice !== "undefined" && filters.minPrice !== null ? Number(filters.minPrice) : null
      const maxP =
        typeof filters.maxPrice !== "undefined" && filters.maxPrice !== null ? Number(filters.maxPrice) : null
      const matchesPrice = (minP === null || it.price >= minP) && (maxP === null || it.price <= maxP)

      const matchesCategory = (() => {
        if (!filters.category || filters.category === "" || filters.category === "any") return true
        if (!it.category) return false
        if (typeof it.category === "string") return it.category === filters.category
        const catId = it.category._id || it.category.id || it.category.name
        return String(catId) === String(filters.category)
      })()

      const matchesAvailability =
        !filters.availability ||
        filters.availability === "all" ||
        (filters.availability === "available" ? it.availability : !it.availability)

      return matchesSearch && matchesPrice && matchesCategory && matchesAvailability
    })

    // sort
    switch (sortBy) {
      case "price-low":
        f.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "price-high":
        f.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "name":
        f.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        break
      default:
        break
    }

    return f
  }, [items, searchTerm, filters, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  return (
    <>
      {/* keep site header consistent with home page */}
      <Header />

      <div className="min-h-screen bg-gradient-to-b from-white via-[#fff2c6] to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-[#d4af37] mb-2">Browse Items</h1>
            <p className="text-gray-600 text-lg">Discover premium items available for rent</p>
          </div>

          {/* Search and Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#d4af37]" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search items..."
                  className="pl-10 w-full rounded-lg bg-white border-2 border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-gray-900 placeholder-gray-500 px-3 py-3 font-medium transition-all shadow-md hover:shadow-lg"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                <div className="flex items-center border-2 border-[#d4af37] rounded-lg overflow-hidden bg-white shadow-md">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 transition-all ${
                      viewMode === "grid" ? "bg-[#d4af37] text-white" : "text-[#d4af37] hover:bg-[#fff2c6]"
                    }`}
                    title="Grid view"
                  >
                    <GridIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-3 transition-all ${
                      viewMode === "list" ? "bg-[#d4af37] text-white" : "text-[#d4af37] hover:bg-[#fff2c6]"
                    }`}
                    title="List view"
                  >
                    <ListIcon className="h-5 w-5" />
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border-2 border-[#d4af37] rounded-lg px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>

                <button
                  onClick={() => setFilterOpen((s) => !s)}
                  className="px-4 py-3 bg-[#d4af37] hover:bg-[#c49a2d] text-white rounded-lg font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-md"
                >
                  <Filter className="h-5 w-5" />
                  Filters
                </button>
              </div>
            </div>

            {filterOpen && (
              <div className="bg-gradient-to-r from-[#d4af37] to-[#c49a2d] rounded-xl p-6 mb-6 shadow-lg border-2 border-[#d4af37]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Category</label>
                    <select
                      value={filters.category || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
                      className="w-full bg-[#fff2c6] rounded-lg px-3 py-2 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white transition-all"
                    >
                      <option value="">Any</option>
                      {categoryOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-white mb-2">Price Range</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={overallMin}
                          max={overallMax}
                          value={sliderMin}
                          step={1}
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            const newMin = Math.min(v, sliderMax)
                            setSliderMin(newMin)
                            setFilters((p) => ({ ...p, minPrice: newMin }))
                          }}
                          className="flex-1"
                          style={{ accentColor: "#fff2c6" }}
                        />
                        <input
                          type="range"
                          min={overallMin}
                          max={overallMax}
                          value={sliderMax}
                          step={1}
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            const newMax = Math.max(v, sliderMin)
                            setSliderMax(newMax)
                            setFilters((p) => ({ ...p, maxPrice: newMax }))
                          }}
                          className="flex-1"
                          style={{ accentColor: "#fff2c6" }}
                        />
                      </div>
                      <div className="text-sm text-white font-medium">
                        Rs.{sliderMin} - Rs.{sliderMax}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-white text-[#d4af37] hover:bg-[#fff2c6] rounded-lg font-semibold transition-all transform hover:scale-105"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Items Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#d4af37] border-t-white"></div>
            </div>
          ) : (
            <>
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
              >
                {paginatedItems.map((it) =>
                  viewMode === "grid" ? (
                    <ItemCard key={it._id} item={it} />
                  ) : (
                    <div
                      key={it._id}
                      className="bg-white rounded-lg p-4 flex gap-4 items-center border-2 border-[#d4af37] hover:shadow-lg transition-all transform hover:scale-102"
                    >
                      <div className="w-32 h-24 bg-[#f5e6d3] flex items-center justify-center overflow-hidden rounded-lg flex-shrink-0 border border-[#d4af37]">
                        {it.images && it.images.length > 0 ? (
                          <img
                            src={it.images[0] || "/placeholder.svg"}
                            alt={it.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="text-[#d4af37] font-semibold">No image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{it.name}</h3>
                        <p className="text-sm text-gray-600">{it.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-500">Price</div>
                            <div className="font-bold text-[#d4af37] text-lg">
                              Rs.{it.price}/{it.priceUnit || "day"}
                            </div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                              it.availability ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {it.availability ? "Available" : "Unavailable"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-8 p-4 bg-white rounded-lg border-2 border-[#d4af37] shadow-md">
                <div className="text-sm text-gray-600 font-medium">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredItems.length)} of{" "}
                  {filteredItems.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-[#fff2c6] text-[#d4af37] hover:bg-[#d4af37] hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === p
                          ? "bg-[#d4af37] text-white shadow-md"
                          : "bg-[#fff2c6] text-[#d4af37] hover:bg-[#f5e6d3]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-[#fff2c6] text-[#d4af37] hover:bg-[#d4af37] hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
