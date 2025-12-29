"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import toast from "react-hot-toast";
import API_BASE_URL from "../config/api";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) return "Email address is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim()))
          return "Please enter a valid email address";
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";

      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Real-time validation for non-checkbox fields
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ email: true, password: true });
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      const firstErrorField = Object.keys(formErrors)[0];
      document.querySelector(`[name="${firstErrorField}"]`)?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      // Try to parse JSON (may throw if response is not JSON)
      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        throw new Error(`Unexpected response from server: ${res.status} ${res.statusText}`);
      }

      if (!res.ok) {
        const message = data?.message || data?.error || `Login failed (${res.status})`;
        // Map field errors if provided
        if (data?.emailError) setErrors({ email: data.emailError });
        if (data?.passwordError) setErrors({ password: data.passwordError });
        throw new Error(message);
      }

      // Check for token in successful response
      if (!data.token) {
        throw new Error("Login failed. Please register first.");
      }

      // Save token to localStorage
      localStorage.setItem("token", data.token);

      // Fetch user profile with the token
      const profileRes = await fetch("http://localhost:5000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const userProfile = await profileRes.json();

      // Save user profile to localStorage
      localStorage.setItem("user", JSON.stringify(userProfile));

      // No cart loading required here — proceed with login flow

      toast.success("Login successful! Welcome back.", {
        id: "login-success",
      });

      navigate("/"); // Redirect to homepage
    } catch (error) {
      toast.error(error.message || "Login failed", {
        id: "login-error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-[#fff2c6] text-white min-h-screen flex flex-col">
        <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mt-6 mb-2 text-[#d4af37]">Welcome Back</h1>
              <p className="text-[#d4af37]">
                Sign in to your account to continue
              </p>
            </div>

            <div className="bg-white box-shadow rounded-lg p-8 shadow-lg border">
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-black block text-sm font-medium">
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
                        className="pl-10 w-full bg-secondary-foreground rounded px-3 py-2 focus:outline-none focus:ring-1 text-black focus:ring-primary-500"
                      aria-invalid={
                        errors.email && touched.email ? "true" : "false"
                      }
                      aria-describedby={
                        errors.email && touched.email
                          ? "email-error"
                          : undefined
                      }
                    />
                    {!errors.email && touched.email && formData.email && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {errors.email && touched.email && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {errors.email && touched.email && (
                    <p
                      id="email-error"
                      className="text-sm text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-black block text-sm font-medium"
                    >
                      Password <span className="text-red-400">*</span>
                    </label>
                    <Link
                      to="/forgot-password"
                        className="text-[#d4af37] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
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
                        className="pl-10 pr-10 w-full bg-secondary-foreground rounded px-3 py-2 focus:outline-none focus:ring-1 text-black focus:ring-primary-500"
                      aria-invalid={
                        errors.password && touched.password ? "true" : "false"
                      }
                      aria-describedby={
                        errors.password && touched.password
                          ? "password-error"
                          : undefined
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p
                      id="password-error"
                      className="text-sm text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                    className="w-full bg-[#d4af37]  text-white rounded-none py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-[#d4af37] hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-white">
              <p>
                By signing in, you agree to our{" "}
                <Link to="/terms" className="text-gray-400 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-gray-400 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
