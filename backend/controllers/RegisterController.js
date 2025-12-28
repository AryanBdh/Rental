import User from "../model/User.js";

class RegisterController {
  async register(req, res) {
    try {
      console.log("Registration request received:", req.body)
      const { firstName, lastName, email, password, roles } = req.body

      const roleArray= Array.isArray(roles) ? roles : [roles];

      // Check if user already exists
      const existingUser = await User.findOne({ email: email })
      if (existingUser) {
        console.log("Email already exists:", email)
        return res.json({ emailError: "Email already exists" })
      }

      // Create full name from firstName and lastName
      const name = `${firstName} ${lastName}`
      console.log("Creating user with name:", name)

      // Create new user
      const user = new User({
        name: name,
        email: email,
        password: password,
        role: roleArray,
      })

      // Debug: Log user object before saving
      console.log("User object before save:", JSON.stringify(user, null, 2))

      const savedUser = await user.save()
      console.log("User saved successfully:", savedUser._id)

      // Generate token for immediate login
      const token = user.generateToken()

      return res.status(201).json({
        token: token,
        message: "Registration successful",
      })
    } catch (error) {
      console.error("Registration error:", error)
      return res.status(500).json({
        submitError: "Registration failed. Please try again.",
        details: error.message,
      })
    }
  }
}

export default RegisterController
