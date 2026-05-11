import express from "express";
import { login } from "./controllers/authController.js";
import { profile, getUsers } from "./controllers/userController.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import passport from "./config/passport.js";

const router = express.Router();

// Rutas públicas
router.post("/login", login);

// Rutas Google OAuth
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
  const token = req.user?.tempToken || null;
  if (token) {
    res.redirect(`http://localhost:5500?token=${token}`);
  } else {
    res.redirect("http://localhost:5500/login");
  }
});

router.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logout exitoso" });
  });
});

// Rutas protegidas
router.get("/profile", authMiddleware, profile);
router.get("/users", authMiddleware, getUsers);

export default router;