import { Link } from "react-router-dom"
import Button from "./ui/Button"

function getItemImageUrl(item) {
  if (!item) return null
  const raw = item.images && item.images.length ? item.images[0] : item.mainImage || null
  if (!raw) return null
  if (typeof raw === "string") {
    if (raw.startsWith("http")) return raw
    // Allow Vite proxy or absolute path
    const apiBase = import.meta.env.VITE_API_URL || ""
    return apiBase ? `${apiBase}${raw}` : raw
  }
  return null
}

export default function ItemCard({
  item,
  viewMode = "grid",
  cartLoading = false,
  cartLoaded = true,
  isLoggedIn = () => true,
}) {
  const id = item._id || item.id

  const categoryLabel = (() => {
    const c = item.category
    if (!c) return null
    if (typeof c === "string") return c
    return c.name || c.label || c._id || c.id || null
  })()

  const imgSrc = getItemImageUrl(item) || "/placeholder.svg"

  return (
    <Link
      key={id}
      to={id ? `/item/${id}` : "#"}
      className={`group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-[#d4af37] hover:border-[#b8973a] ${
        viewMode === "list" ? "flex gap-6" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${viewMode === "list" ? "w-48 shrink-0" : ""}`}>
        <div className="absolute inset-0 bg-[#d4af37] opacity-0 group-hover:opacity-20 transition-opacity duration-300 z-10"></div>
        <img
          src={imgSrc || "/placeholder.svg"}
          alt={item.name}
          className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
            viewMode === "list" ? "w-full h-48" : "w-full aspect-square"
          }`}
          onError={(e) => {
            console.log("❌ Image failed to load:", e.target.src)
            e.target.src = "/placeholder.svg?height=300&width=300"
          }}
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {categoryLabel && (
            <span className="bg-[#d4af37] text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              {categoryLabel}
            </span>
          )}
        </div>
      </div>

      <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="font-semibold text-lg text-[#1a1a1a] group-hover:text-[#d4af37] transition-colors duration-300 line-clamp-2">
            {item.name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm bg-[#fff2c6] px-2.5 py-1 rounded-lg shrink-0 group-hover:bg-[#d4af37] group-hover:text-white transition-all duration-300">
            <span className="text-lg">★</span>
            <span className="font-semibold">{item.rating || 4.5}</span>
            <span className="text-xs">({item.reviews ? item.reviews.length : 0})</span>
          </div>
        </div>

        {viewMode === "list" && item.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#d4af37]">Rs. {(item.price || 0).toLocaleString()}</span>
          </div>

          <div>
            <Button
              size="sm"
              className="bg-[#d4af37] hover:bg-[#b8973a] text-white font-semibold rounded-lg px-6 py-2 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
              title="View item"
            >
              {cartLoading ? <span className="inline-block animate-spin">⟳</span> : "View"}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
