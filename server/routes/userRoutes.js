// server/routes/userRoutes.js
import express from 'express';
const router = express.Router();
import { login } from '../userContoller/userController.js';

router.post("/", login)

export default router;