import { Router } from "express";
import { registerUser, loginInUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginInUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;