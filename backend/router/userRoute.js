import express from "express";
import UserController from "../controllers/UserController.js";


const userRoute = express.Router();
const userInstance = new UserController();


userRoute.get('/', userInstance.index);
userRoute.get("/profile", userInstance.getProfile);
userRoute.get("/verify-admin", userInstance.verifyAdmin)
userRoute.get("/:id", userInstance.show);

userRoute.post("/", userInstance.store);
userRoute.put("/update/:id", userInstance.update);
userRoute.delete("/:id", userInstance.destroy);
export default userRoute;