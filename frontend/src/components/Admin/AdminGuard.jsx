import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { apiClient } from '../../config/api'

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
        const { data } = await apiClient.get('/api/user/verify-admin')
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
