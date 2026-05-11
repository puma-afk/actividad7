import jwt from "jsonwebtoken";

export function authMiddleware(
  req,
  res,
  next
) {

  // obtener header
  const authHeader =
    req.headers.authorization;

  // verificar existencia
  if (!authHeader) {

    return res.status(401).json({
      error: "Token requerido"
    });

  }

  // formato:
  // Bearer TOKEN
  const token =
    authHeader.split(" ")[1];

  // validar token
  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // guardar usuario en request
    req.user = decoded;

    next();

  } catch (error) {

    return res.status(403).json({
      error: "Token inválido"
    });

  }
}