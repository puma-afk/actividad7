import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  // Intentar con JWT
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {}
  }

  // Intentar con sesión de Passport
  if (req.isAuthenticated && req.isAuthenticated()) {
    req.user = req.user;
    return next();
  }

  return res.status(401).json({ error: "No autorizado" });
}