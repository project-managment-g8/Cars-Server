// server/routes/userRoutes.js
import express from "express";
const router = express.Router();
import { login, registerUser } from "../userContoller/userController.js";
router.post("/login", login);
router.post("/register", registerUser);
export default router;
