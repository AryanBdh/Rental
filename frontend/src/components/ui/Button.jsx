const Button = ({ children, className = "", variant = "default", size = "default", ...props }) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

  const variants = {
    default: "bg-[#d4af37] text-white hover:bg-[#b8973a]",
    outline: "border border-gray-600 bg-transparent hover:bg-gray-800",
    ghost: "bg-transparent hover:bg-gray-800",
  }

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-6",
  }

  const variantStyle = variants[variant] || variants.default
  const sizeStyle = sizes[size] || sizes.default

  return (
    <button className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
