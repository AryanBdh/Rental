import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import toast from "react-hot-toast"

export default function ResetPassword() {
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // read token from query param if present: /reset-password?token=...
    const params = new URLSearchParams(location.search)
    const t = params.get("token")
    if (t) setToken(t)
  }, [location.search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      toast.error("Missing reset token. Check your email or paste the token here.")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (password !== confirm) {
      toast.error("Passwords do not match")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to reset password")

      toast.success(data.message || "Password reset successful. You may log in now.")
      setTimeout(() => navigate("/login"), 1200)
    } catch (err) {
      console.error("Reset password error:", err)
      toast.error(err.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1420] text-white px-4">
      <div className="w-full max-w-md bg-[#162337] rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
        <p className="text-sm text-gray-400 mb-6">
          Enter a new password. If you received a reset link, the token is read automatically from the URL.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Reset Token</label>
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token from email (if not using link)"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm password</label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit" className="btn-accent" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
            <Link to="/login" className="text-sm text-gray-400 hover:underline">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
