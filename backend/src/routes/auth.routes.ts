import { Router } from "express";
import { register, login, logout, me, updateProfile } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.patch("/me", authenticate, updateProfile);

export default router;
