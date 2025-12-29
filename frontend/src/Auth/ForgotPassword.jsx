import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import toast from "react-hot-toast"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    try {
      setLoading(true)
      const { data } = await apiClient.post("/api/auth/forgot-password", { email })

      toast.success(data.message || "Password reset link sent to your email")
      // Optionally redirect to a confirmation page
      setTimeout(() => navigate("/login"), 1200)
    } catch (err) {
      console.error("Forgot password error:", err)
      toast.error(err.message || "Failed to request password reset")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1420] text-white px-4">
      <div className="w-full max-w-md bg-[#162337] rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-2">Forgot Password</h2>
        <p className="text-sm text-gray-400 mb-6">Enter your email and we'll send a reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit" className="btn-accent" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
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
