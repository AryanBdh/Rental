"use client"

import { useEffect, useState } from "react"
import Button from "../../components/ui/Button"
import toast from "react-hot-toast"
import { Calendar, User, DollarSign, CheckCircle, XCircle } from "lucide-react"

export default function Bookings({ bookings = [], bookingsLoading, formatDate, getStatusColor }) {
  const [list, setList] = useState(bookings || [])
  const [expandedId, setExpandedId] = useState(null)

  const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {}
  const currentUserId = currentUser._id || currentUser.id || null

  useEffect(() => setList(bookings || []), [bookings])

  useEffect(() => {
    if (!currentUserId) return
    const url = `/api/bookings/stream/${currentUserId}`
    const es = new EventSource(url)

    es.addEventListener("bookingCreated", (ev) => {
      try {
        const b = JSON.parse(ev.data)
        setList((prev) => [b, ...prev])
      } catch (e) {
        console.error("SSE bookingCreated parse error", e)
      }
    })

    es.addEventListener("bookingUpdated", (ev) => {
      try {
        const b = JSON.parse(ev.data)
        setList((prev) => prev.map((x) => (x._id === b._id ? b : x)))
      } catch (e) {
        console.error("SSE bookingUpdated parse error", e)
      }
    })

    es.onerror = (err) => {
      console.error("SSE error", err)
      es.close()
    }

    return () => es.close()
  }, [currentUserId])

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/bookings/${id}/accept`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Accept failed")
      setList((prev) => prev.map((b) => (b._id === id ? { ...b, status: "confirmed" } : b)))
      toast.success("Booking accepted")
    } catch (err) {
      console.error("Accept error", err)
      toast.error(err.message || "Failed to accept")
    }
  }

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/bookings/${id}/reject`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Reject failed")
      setList((prev) => prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)))
      toast.success("Booking rejected")
    } catch (err) {
      console.error("Reject error", err)
      toast.error(err.message || "Failed to reject")
    }
  }

  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Cancel failed")
      setList((prev) => prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)))
      toast.success("Booking cancelled")
    } catch (err) {
      console.error("Cancel error", err)
      toast.error(err.message || "Failed to cancel")
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-[#f5e6d3] p-8">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#f5e6d3]">
          <h2 className="text-2xl font-bold text-[#d4af37]">My Bookings</h2>
        </div>

        {bookingsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-[#f5e6d3] mb-4"></div>
              <p className="text-gray-600 font-medium">Loading bookings...</p>
            </div>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-12 bg-[#f5e6d3] rounded-lg">
            <Calendar className="h-12 w-12 text-[#d4af37] mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 font-medium">You have no bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((b) => {
              const isOwner = String(b.owner?._id || b.owner) === String(currentUserId)
              const isExpanded = expandedId === b._id
              return (
                <div
                  key={b._id || b.id}
                  onClick={() => setExpandedId(isExpanded ? null : b._id)}
                  className="bg-gradient-to-r from-[#fff2c6] to-[#f5e6d3] rounded-lg p-6 border-2 border-[#d4af37] cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {(b.item && b.item.name) || b.itemName || "Listing"}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="h-4 w-4 text-[#d4af37]" />
                          <span>{(b.renter && (b.renter.name || b.renter.email)) || b.renterName || "Renter"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="h-4 w-4 text-[#d4af37]" />
                          <span>{formatDate(b.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign className="h-4 w-4 text-[#d4af37]" />
                          <span>Rs. {b.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(b.status)} bg-white`}
                      >
                        {b.status === "confirmed" && <CheckCircle className="h-5 w-5 inline mr-2 text-green-500" />}
                        {b.status === "cancelled" && <XCircle className="h-5 w-5 inline mr-2 text-red-500" />}
                        {b.status || "N/A"}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-[#d4af37] space-y-4">
                      <p className="text-gray-700 text-sm">
                        <span className="font-semibold">Return Date:</span> {formatDate(b.endDate)}
                      </p>
                      {isOwner && b.status === "pending" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => handleReject(b._id)}
                            className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                          <Button
                            className="flex-1 bg-[#d4af37] text-white hover:bg-[#c49a2d] font-semibold"
                            onClick={() => handleAccept(b._id)}
                          >
                            Accept
                          </Button>
                        </div>
                      )}
                      {!isOwner && b.status === "confirmed" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => handleCancel(b._id)}
                            className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                          >
                            Cancel Booking
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
