import express from "express";

import { login }
  from "./controllers/authController.js";

import { profile }
  from "./controllers/userController.js";

import {
  authMiddleware
} from "./middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);

// ruta protegida
router.get(
  "/profile",
  authMiddleware,
  profile
);

export default router;