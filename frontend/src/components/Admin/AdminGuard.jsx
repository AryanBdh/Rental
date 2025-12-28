import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminGuard({ children }) {
  const [allowed, setAllowed] = useState(null) // null=loading, false=denied, true=allowed
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    const check = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          if (mounted) setAllowed(false)
          return
        }
        const res = await fetch('/api/user/verify-admin', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const text = await res.text()
        let data
        try { data = JSON.parse(text) } catch (_) { data = { isAdmin: false } }
        if (mounted) setAllowed(Boolean(data.isAdmin))
      } catch (err) {
        console.error('Admin verify failed', err)
        toast.error('Failed to verify admin privileges')
        if (mounted) setAllowed(false)
      }
    }
    check()
    return () => { mounted = false }
  }, [location.pathname])

  if (allowed === null) {
    return <div className="p-8 text-center">Checking admin access...</div>
  }

  if (!allowed) {
    // redirect to home (or login) if not allowed
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
