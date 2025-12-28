"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X, LogOut, LayoutDashboard, User } from "lucide-react"
import Button from "../components/ui/Button"
import toast from "react-hot-toast"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const navLinks = [
    { label: "Browse", href: "/browse" },
    { label: "How it works", href: "#" },
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ]

  // derive initials from user's name or email
  const getInitials = (u) => {
    if (!u) return ""
    const name = u.name || ""
    const email = u.email || ""
    if (name.trim()) {
      const parts = name.trim().split(/\s+/)
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return email.slice(0, 2).toUpperCase()
  }

  const initials = getInitials(user)

  // robust admin check: accept role string (case-insensitive), boolean flag, or roles array
  const isAdmin = Boolean(
    user &&
      ((typeof user.role === "string" && user.role.toLowerCase() === "admin") ||
        user.isAdmin === true ||
        (Array.isArray(user.role) &&
          user.role.map((r) => (typeof r === "string" ? r.toLowerCase() : r)).includes("admin"))),
  )

  useEffect(() => {
    // read user from localStorage on mount
    try {
      const raw = localStorage.getItem("user")
      setUser(raw ? JSON.parse(raw) : null)
    } catch (err) {
      setUser(null)
    }

    const onStorage = (e) => {
      if (e.key === "user") {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null)
        } catch (err) {
          setUser(null)
        }
      }
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setDropdownOpen(false)
    toast.success("Signed out")
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-[#d4af37] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#d4af37]/50 transition-all duration-300">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg text-[#d4af37] group-hover:text-[#d4af37] transition-colors">
              ANYRENT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-foreground hover:text-[#d4af37] transition-colors text-sm font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#d4af37] after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button / User Avatar and Mobile Menu */}
          <div className="flex items-center gap-4 relative">
            {/* If user is signed in show initials avatar, otherwise show Sign In */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((s) => !s)}
                  className="hidden sm:inline-flex w-9 h-9 rounded-full bg-[#d4af37] text-white items-center justify-center font-semibold hover:shadow-lg hover:shadow-[#d4af37]/50 transition-all duration-300 transform hover:scale-110"
                  aria-expanded={dropdownOpen}
                >
                  {initials}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-[#d4af37]/20 text-black z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <ul className="py-2">
                      {isAdmin ? (
                        <li>
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#fff2c6] transition-colors duration-200 border-b border-[#d4af37]/10 hover:border-[#d4af37]/30 group"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <LayoutDashboard
                              size={18}
                              className="text-[#d4af37] group-hover:scale-110 transition-transform"
                            />
                            <span className="font-medium text-gray-800">Dashboard</span>
                          </Link>
                        </li>
                      ) : (
                        <li>
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#fff2c6] transition-colors duration-200 border-b border-[#d4af37]/10 hover:border-[#d4af37]/30 group"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <User size={18} className="text-[#d4af37] group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-gray-800">Profile</span>
                          </Link>
                        </li>
                      )}
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-red-50 transition-colors duration-200 group"
                        >
                          <LogOut size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
                          <span className="font-medium text-gray-800">Logout</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button className="hidden rounded-lg sm:inline-flex bg-[#d4af37] hover:bg-[#c4941b] text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#d4af37]/50 transform hover:scale-105">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="block px-4 py-2 text-foreground hover:bg-[#d4af37] hover:text-white rounded-lg transition-all duration-200 transform hover:translate-x-1"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="px-4 space-y-2">
                {isAdmin && (
                  <div>
                    <Link to="/admin" className="block">
                      <Button className="w-full font-bold bg-[#d4af37] hover:bg-[#c4941b] text-white transition-all duration-200 transform hover:scale-105">
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
                <button onClick={handleLogout} className="w-full text-left">
                  <Button className="w-full font-bold bg-red-500 hover:bg-red-600 text-white transition-all duration-200 transform hover:scale-105">
                    Logout
                  </Button>
                </button>
              </div>
            ) : (
              <Link to="/login" className="block px-4">
                <Button className="w-full font-bold bg-[#d4af37] hover:bg-[#c4941b] text-white transition-all duration-200 transform hover:scale-105">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
