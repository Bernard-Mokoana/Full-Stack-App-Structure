import { Router } from "express";
import { registerUser, loginInUser } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginInUser);

export default router;