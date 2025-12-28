import fs from "fs";
import User from "../model/User.js";
import TokenVerify from "../middleware/TokenVerify.js";

class UserController {
  // List all users (admin) or own profile (user)
  async index(req, res) {
    const token = req.headers.authorization?.split(" ")[1];
    const response = TokenVerify.verifyToken(token);

    // If token is missing/invalid, return an empty array (frontend expects JSON array)
    if (!response) {
      return res.status(200).json([]);
    }

    const { id, role } = response;

    // role may be an array (schema uses [String]) or a single string
    const isAdmin = Array.isArray(role) ? role.includes("admin") : role === "admin";

    try {
      if (!isAdmin) {
        const user = await User.findById(id);
        return res.status(200).json([user]);
      } else {
        // admin: return all registered users
        const users = await User.find({});
        return res.status(200).json(users);
      }
    } catch (error) {
      return res.status(500).json({ status: false, message: "Failed to fetch users" });
    }
  }

  // Show specific user by ID
  async show(req, res) {
    try {
      const id = req.params.id;
      const user = await User.findById(id);
      return res.status(200).json(user);
    } catch {
      return res.status(404).json({ status: false, message: "User not found" });
    }
  }

  // Create new user
  async store(req, res) {
    try {
      let image = "";
      if (req.file) {
        image = req.file.filename;
      }

      const user = new User({ ...req.body, image });
      await user.save();

      return res.status(201).json({ status: true, message: "User created successfully!" });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Failed to create user", error });
    }
  }

  // Update user
  async update(req, res) {
    try {
      const id = req.params.id;
      const updateData = { ...req.body };

      // Handle new image
      if (req.file) {
        updateData.image = req.file.filename;

        // Delete old image
        const oldUser = await User.findById(id);
        if (oldUser.image) {
          const oldImagePath = `public/users/${oldUser.image}`;
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
      return res.status(200).json({
        status: true,
        message: "User updated successfully!",
        user: updatedUser,
      });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Update failed", error });
    }
  }

  // Delete user
  async destroy(req, res) {
    try {
      const id = req.params.id;
      const user = await User.findById(id);

      if (user?.image) {
        const imagePath = `public/users/${user.image}`;
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await User.findByIdAndDelete(id);
      return res.status(200).json({ status: true, message: "User deleted successfully!" });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Delete failed", error });
    }
  }

  // Get current user's profile
  async getProfile(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const response = TokenVerify.verifyToken(token);
      if (!response) {
        return res.status(401).json({ status: false, message: "Unauthorized" });
      }
      const { id } = response;
      const user = await User.findById(id);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(401).json({ status: false, message: "Unauthorized", error });
    }
  }

  // Check if user is admin
  async verifyAdmin(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const response = TokenVerify.verifyToken(token);
      if (!response) {
        return res.status(401).json({ isAdmin: false, message: "Unauthorized" });
      }
      const { id } = response;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ isAdmin: false, message: "User not found" });
      }

      const isAdmin = Array.isArray(user.role) ? user.role.includes("admin") : user.role === "admin";
      return res.status(200).json({
        isAdmin,
        message: isAdmin ? "User has admin privileges" : "User does not have admin privileges",
      });
    } catch (error) {
      return res.status(500).json({ isAdmin: false, message: "Server error", error });
    }
  }
}

export default UserController;