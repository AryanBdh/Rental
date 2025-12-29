"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { User, Package, Home, CalendarDays, Wallet, ChevronRight } from "lucide-react"
import Button from "../components/ui/Button"
import Overview from "../components/profile/Overview"
import Listings from "../components/profile/Listings"
import BookingsPanel from "../components/profile/Bookings"
import EarningsPanel from "../components/profile/Earnings"
import toast from "react-hot-toast"
import { apiClient } from "../config/api"

const UserProfile = ({ defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || "overview")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hoveredTab, setHoveredTab] = useState(null)

  const [profileData, setProfileData] = useState({ name: "", email: "", phone: "", address: {} })
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState({})

  const [ownerItems, setOwnerItems] = useState([])
  const [itemsLoading, setItemsLoading] = useState(false)

  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, transactions: [] })
  const [earningsLoading, setEarningsLoading] = useState(false)

  const [currentUser, setCurrentUser] = useState(
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) || null : null,
  )

  // Normalize role information from several possible shapes that may come from backend
  // Accept either `roles` or `role` as an array, or `role` as a string.
  const rolesFromArray = Array.isArray(currentUser?.roles)
    ? currentUser.roles.map((r) => String(r).toLowerCase())
    : Array.isArray(currentUser?.role)
    ? currentUser.role.map((r) => String(r).toLowerCase())
    : []

  const rolesFromString = typeof currentUser?.role === 'string' ? [String(currentUser.role).toLowerCase()] : []

  const rolesCombined = Array.from(new Set([...rolesFromArray, ...rolesFromString].flat().filter(Boolean)))

  // Also accept boolean flags that some backends may set (legacy or explicit flags)
  const flagIsOwner = currentUser?.isOwner === true || currentUser?.owner === true
  const flagIsRenter = currentUser?.isRenter === true || currentUser?.renter === true

  const isOwner =
    rolesCombined.includes("owner") ||
    rolesCombined.includes("landlord") ||
    rolesCombined.includes("provider") ||
    flagIsOwner

  const isRenter =
    rolesCombined.includes("renter") ||
    rolesCombined.includes("tenant") ||
    rolesCombined.includes("customer") ||
    flagIsRenter

  console.log("[v0] Detailed role analysis:", {
    "currentUser?.roles (array)": currentUser?.roles,
    "currentUser?.role (string)": currentUser?.role,
    "rolesFromArray values": rolesFromArray,
    "rolesFromString values": rolesFromString,
    "rolesCombined values": rolesCombined,
    flagIsOwner: flagIsOwner,
    flagIsRenter: flagIsRenter,
    "isOwner result": isOwner,
    "isRenter result": isRenter,
  })

  console.log("[v0] User roles detected:", {
    rolesArray: currentUser?.roles,
    roleString: currentUser?.role,
    rolesFromArray,
    rolesFromString,
    rolesCombined,
    flagIsOwner,
    flagIsRenter,
    isOwner,
    isRenter,
    currentUser,
  })

  const location = useLocation()

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setLoading(false)
          return
        }
        const { data: userData } = await apiClient.get("/api/user/profile")
        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || {},
        })
        localStorage.setItem("user", JSON.stringify(userData))
        // keep a reactive copy of the full user object so role changes reflect in the UI
        setCurrentUser(userData)
        setLoading(false)
      } catch (err) {
        console.error("Profile fetch error:", err)
        toast.error("Failed to load profile")
        setLoading(false)
      }
    }
    fetchUserProfile()
  }, [])

  useEffect(() => {
    async function fetchOwnerItems() {
      try {
        const stored = currentUser || JSON.parse(localStorage.getItem("user")) || {}
        const token = localStorage.getItem("token")
        const uid = stored._id || stored.id || null
        if (!uid) return
        setItemsLoading(true)
        try {
          const { data } = await apiClient.get(`/api/items/user/${uid}`)
          setOwnerItems(Array.isArray(data) ? data : data.items || [])
        } catch (err) {
          // Try fallback endpoint
          try {
            const { data } = await apiClient.get(`/api/items?owner=${uid}`)
            setOwnerItems(Array.isArray(data) ? data : data.items || [])
          } catch (err2) {
            setOwnerItems([])
          }
        }
      } catch (err) {
        console.error("Owner items fetch error", err)
        setOwnerItems([])
      } finally {
        setItemsLoading(false)
      }
    }
    // fetch whenever owner status, activeTab or location.search (refresh) changes
    const shouldFetch =
      isOwner && (activeTab === "listing" || (location && location.search && location.search.includes("refresh=1")))
    if (shouldFetch) fetchOwnerItems()
  }, [isOwner, activeTab, location])

  useEffect(() => {
    async function fetchBookings() {
      try {
        const stored = currentUser || JSON.parse(localStorage.getItem("user")) || {}
        const token = localStorage.getItem("token")
        const uid = stored._id || stored.id || null
        if (!uid) return
        setBookingsLoading(true)
        try {
          const { data } = await apiClient.get(`/api/bookings/user/${uid}`)
          setBookings(Array.isArray(data) ? data : data.bookings || [])
        } catch (err) {
          // Try fallback endpoint
          try {
            const { data } = await apiClient.get(`/api/bookings?user=${uid}`)
            setBookings(Array.isArray(data) ? data : data.bookings || [])
          } catch (err2) {
            setBookings([])
          }
        }
      } catch (err) {
        console.error("Fetch bookings error", err)
        setBookings([])
      } finally {
        setBookingsLoading(false)
      }
    }
    if (activeTab === "bookings") fetchBookings()
  }, [activeTab])

  useEffect(() => {
    async function fetchEarnings() {
      try {
        const stored = currentUser || JSON.parse(localStorage.getItem("user")) || {}
        const token = localStorage.getItem("token")
        const uid = stored._id || stored.id || null
        if (!uid) return
        setEarningsLoading(true)
        const { data } = await apiClient.get(`/api/earnings/user/${uid}`)
        setEarnings({
          total: data.total || 0,
          pending: data.pending || 0,
          transactions: Array.isArray(data.transactions) ? data.transactions : data.transactions || [],
        })
      } catch (err) {
        console.error("Fetch earnings error", err)
        setEarnings({ total: 0, pending: 0, transactions: [] })
      } finally {
        setEarningsLoading(false)
      }
    }
    if (activeTab === "earnings") fetchEarnings()
  }, [activeTab])

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const u = currentUser || JSON.parse(localStorage.getItem("user"))
      if (!token || !u) {
        toast.error("You must be logged in")
        return
      }
      const updatePayload = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
      }
      const { data } = await apiClient.put(`/api/user/update/${u._id}`, updatePayload)
      localStorage.setItem("user", JSON.stringify(data.user))
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (err) {
      console.error(err)
      toast.error(err.message || "Failed to update profile")
    }
  }

  const handleSaveAddress = async () => {
    try {
      if (!editingAddress) return
      const token = localStorage.getItem("token")
      const u = currentUser || JSON.parse(localStorage.getItem("user"))
      if (!token || !u) {
        toast.error("You must be logged in")
        return
      }
      const payload = { address: editingAddress }
      const { data } = await apiClient.put(`/api/user/update/${u._id}`, payload)
      // update local state and localStorage
      setProfileData({ ...profileData, address: data.user.address || editingAddress })
      localStorage.setItem("user", JSON.stringify(data.user))
      setShowAddressForm(false)
      setEditingAddress({})
      toast.success("Address saved")
    } catch (err) {
      console.error("Save address error", err)
      toast.error(err.message || "Failed to save address")
    }
  }

  const handleDeleteAddress = () => {
    // clear address
    setProfileData({ ...profileData, address: {} })
  }

  const handleCancelEdit = () => setIsEditing(false)

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return "text-green-400"
      case "shipped":
        return "text-blue-400"
      case "processing":
        return "text-yellow-400"
      case "cancelled":
        return "text-red-400"
      case "pending":
        return "text-orange-400"
      default:
        return "text-gray-400"
    }
  }

  const getPaymentStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "paid":
        return "text-green-400"
      case "pending":
        return "text-yellow-400"
      case "failed":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const formatPrice = (price) => `Rs. ${price?.toLocaleString()}`

  
  const tabs = []
  tabs.push({ id: "overview", label: "Overview", icon: User })

  if (isOwner && isRenter) {
    // both roles: show all role-specific tabs
    tabs.push({ id: "listing", label: "My Listing", icon: Package })
    tabs.push({ id: "bookings", label: "Bookings", icon: CalendarDays })
    tabs.push({ id: "earnings", label: "Earnings", icon: Wallet })
  } else if (isOwner) {
    // owner only
    tabs.push({ id: "listing", label: "My Listing", icon: Package })
    tabs.push({ id: "earnings", label: "Earnings", icon: Wallet })
  } else if (isRenter) {
    // renter only
    tabs.push({ id: "bookings", label: "Bookings", icon: CalendarDays })
  }

  

  console.log(
    "[v0] Tabs available:",
    tabs.map((t) => t.id),
  )

  // Ensure activeTab is valid when roles or available tabs change
  useEffect(() => {
    const ids = tabs.map((t) => t.id)
    if (!ids.includes(activeTab)) {
      setActiveTab(ids[0] || "overview")
    }
  }, [tabs])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#FFF8DE] to-[#fff2c6] text-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E8D5B7] border-t-[#d4af37] mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#FFF8DE] to-white text-gray-900 min-h-screen">
      <div className="bg-gradient-to-r from-[#d4af37] to-[#e8d5b7] border-b-4 border-[#d4af37] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">My Account</h1>
              <p className="text-gray-700 text-sm">Manage your profile and listings</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button className="bg-[#d4af37] text-white shadow-md font-semibold transition-all duration-200">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-md border border-[#f5e6d3]">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#f5e6d3]">
                <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#e8d5b7] rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{profileData.name || "User"}</h3>
                  <p className="text-xs text-gray-500">
                    {isOwner && isRenter ? "Owner & Renter" : isOwner ? "Owner" : isRenter ? "Renter" : ""}
                  </p>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      onMouseEnter={() => setHoveredTab(tab.id)}
                      onMouseLeave={() => setHoveredTab(null)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? "bg-[#d4af37] text-white shadow-md"
                          : hoveredTab === tab.id
                            ? "bg-[#f5e6d3] text-[#d4af37]"
                            : "text-gray-700 hover:bg-[#fff2c6]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      {isActive && <ChevronRight className="h-5 w-5" />}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <Overview
                profileData={profileData}
                setProfileData={setProfileData}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                handleSaveProfile={handleSaveProfile}
                handleCancelEdit={handleCancelEdit}
                showAddressForm={showAddressForm}
                setShowAddressForm={setShowAddressForm}
                editingAddress={editingAddress}
                setEditingAddress={setEditingAddress}
                handleSaveAddress={handleSaveAddress}
                handleDeleteAddress={handleDeleteAddress}
                isOwner={isOwner}
                isRenter={isRenter}
                ownerItems={ownerItems}
                itemsLoading={itemsLoading}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                getPaymentStatusColor={getPaymentStatusColor}
                formatPrice={formatPrice}
              />
            )}

            {activeTab === "listing" && <Listings ownerItems={ownerItems} itemsLoading={itemsLoading} />}
            {activeTab === "bookings" && (
              <BookingsPanel
                bookings={bookings}
                bookingsLoading={bookingsLoading}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
              />
            )}
            {activeTab === "earnings" && (
              <EarningsPanel
                earnings={earnings}
                earningsLoading={earningsLoading}
                formatPrice={formatPrice}
                formatDate={formatDate}
              />
            )}
            {activeTab === "settings" && (
              <SettingsPanel
                profileData={profileData}
                setProfileData={setProfileData}
                handleSaveProfile={handleSaveProfile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
