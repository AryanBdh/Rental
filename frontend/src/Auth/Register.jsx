"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, User, Check, AlertCircle, CheckCircle } from "lucide-react"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import toast from "react-hot-toast"
import { apiClient, API_BASE_URL } from "../config/api"

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: [],
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required"
        if (value.trim().length < 2) return "First name must be at least 2 characters"
        if (value.trim().length > 50) return "First name must be less than 50 characters"
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return "First name can only contain letters"
        return ""

      case "lastName":
        if (!value.trim()) return "Last name is required"
        if (value.trim().length < 2) return "Last name must be at least 2 characters"
        if (value.trim().length > 50) return "Last name must be less than 50 characters"
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return "Last name can only contain letters"
        return ""

      case "email":
        if (!value.trim()) return "Email address is required"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value.trim())) return "Please enter a valid email address"
        if (value.trim().length > 100) return "Email address is too long"
        return ""

      case "password":
        if (!value) return "Password is required"
        if (value.length < 8) return "Password must be at least 8 characters"
        if (value.length > 128) return "Password must be less than 128 characters"
        if (!/(?=.*[a-z])/.test(value)) return "Password must contain at least one lowercase letter"
        if (!/(?=.*[A-Z])/.test(value)) return "Password must contain at least one uppercase letter"
        if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number"
        if (!/(?=.*[@$!%*?&])/.test(value)) return "Password must contain at least one special character (@$!%*?&)"
        return ""

      case "roles":
        // require at least one role
        if (!value || (Array.isArray(value) && value.length === 0)) return "Please select at least one role"
        return ""

      default:
        return ""
    }
  }

  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === "checkbox" ? checked : value

    setFormData((prev) => ({ ...prev, [name]: newValue }))

    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, newValue)
      setErrors((prev) => ({ ...prev, [name]: error }))

      // Special case for confirmPassword when password changes
      if (name === "password" && touched.confirmPassword) {
        const confirmError = validateField("confirmPassword", formData.confirmPassword)
        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
      }
    }
  }

  const toggleRole = (role) => {
    setFormData((prev) => {
      const roles = Array.isArray(prev.roles) ? [...prev.roles] : []
      const idx = roles.indexOf(role)
      if (idx === -1) roles.push(role)
      else roles.splice(idx, 1)
      return { ...prev, roles }
    })
    setTouched((prev) => ({ ...prev, roles: true }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))

    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Mark all fields as touched
    const allTouched = {
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      roles: true,
    }
    setTouched(allTouched)

    // Validate all fields
    const formErrors = validateForm()
    setErrors(formErrors)

    // Check if form is valid
    if (Object.keys(formErrors).length > 0) {
      // Focus on first error field
      const firstErrorField = Object.keys(formErrors)[0]
      const element = document.querySelector(`[name="${firstErrorField}"]`)
      element?.focus()

      toast.error("Please fix the errors before submitting", {
        id: "validation-error",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("Sending registration data:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: "********", // Don't log actual password
      })

      const { data } = await apiClient.post("/api/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        roles: formData.roles,
      })

      if (!data.token) {
        throw new Error("Registration failed. Please try again.")
      }

      // Save token to localStorage
      localStorage.setItem("token", data.token)

      // Fetch user profile with the token
      const { data: profileData } = await apiClient.get("/api/user/profile")
      console.log("User profile data:", profileData)

      // Save user profile to localStorage
      localStorage.setItem("user", JSON.stringify(profileData))

      toast.success("Registration successful! Welcome to AnyRent.", {
        id: "register-success",
      })

      navigate("/")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error.message || "Registration failed. Please try again.", {
        id: "register-error",
      })
    } finally {
      setIsLoading(false)
    }
  }

 

  return (
    <>
      <div className=" bg-[#fff2c6] text-white min-h-screen flex flex-col">
        <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mt-6 mb-2 text-[#d4af37]">Create an Account</h1>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-800">
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-black text-sm font-medium">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Ram"
                        className="pl-10 pr-10 w-full bg-secondary-foreground rounded px-3 py-2 focus:outline-none focus:ring-1 
                        text-black focus:ring-primary-500"
                        aria-invalid={errors.firstName && touched.firstName ? "true" : "false"}
                        aria-describedby={errors.firstName && touched.firstName ? "firstName-error" : undefined}
                      />
                      {!errors.firstName && touched.firstName && formData.firstName && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                      {errors.firstName && touched.firstName && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {errors.firstName && touched.firstName && (
                      <p id="firstName-error" className="text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-black text-sm font-medium">
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Shah"
                        className="pl-10 pr-10 w-full bg-secondary-foreground rounded px-3 py-2 focus:outline-none focus:ring-1 
                        text-black focus:ring-primary-500"
                        aria-invalid={errors.lastName && touched.lastName ? "true" : "false"}
                        aria-describedby={errors.lastName && touched.lastName ? "lastName-error" : undefined}
                      />
                      {!errors.lastName && touched.lastName && formData.lastName && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                      {errors.lastName && touched.lastName && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {errors.lastName && touched.lastName && (
                      <p id="lastName-error" className="text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm text-black font-medium">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="your.email@example.com"
                      className="pl-10 pr-10 w-full bg-secondary-foreground rounded px-3 py-2 focus:outline-none focus:ring-1 
                        text-black focus:ring-primary-500"
                      aria-invalid={errors.email && touched.email ? "true" : "false"}
                      aria-describedby={errors.email && touched.email ? "email-error" : undefined}
                    />
                    {!errors.email && touched.email && formData.email && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {errors.email && touched.email && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {errors.email && touched.email && (
                    <p id="email-error" className="text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-black text-sm font-medium">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="••••••••"
                      className="pl-10 pr-10 w-full bg-secondary-foreground rounded px-3 py-2 focus:outline-none focus:ring-1 
                        text-black focus:ring-primary-500"
                      aria-invalid={errors.password && touched.password ? "true" : "false"}
                      aria-describedby={errors.password && touched.password ? "password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {errors.password && touched.password && (
                    <p id="password-error" className="text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password}
                    </p>
                  )}

                  
                </div>

                

                {/* Role selection: Owner / Renter (user may select one or both) */}
                <div className="mt-4">
                  <label className="block  text-black text-sm font-medium mb-2">I want to sign up as</label>
                  <div className="flex gap-3 items-center">
                    <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border ${formData.roles.includes('owner') ? 'bg-[#d4af37] border-[#2b6b6b]' : 'bg-transparent border-gray-700'}`}>
                      <input type="checkbox" name="roles" value="owner" checked={formData.roles.includes('owner')} onChange={() => toggleRole('owner')} className="sr-only" />
                      <span className="w-4 h-4 rounded-sm border border-gray-400 flex items-center justify-center text-xs">O</span>
                      <span className="text-sm text-black">Owner</span>
                    </label>

                    <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border ${formData.roles.includes('renter') ? 'bg-[#d4af37] border-[#2b6b6b]' : 'bg-transparent border-gray-700'}`}>
                      <input type="checkbox" name="roles" value="renter" checked={formData.roles.includes('renter')} onChange={() => toggleRole('renter')} className="sr-only" />
                      <span className="w-4 h-4 rounded-sm border border-gray-400 flex items-center justify-center text-xs">R</span>
                      <span className="text-sm text-black">Renter</span>
                    </label>
                  </div>
                  {errors.roles && touched.roles && (
                    <p className="text-sm text-red-400 mt-2">{errors.roles}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#d4af37] hover-bg-accent-dark text-white rounded-none py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-gray-400">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#d4af37] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register
