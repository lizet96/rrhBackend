const jwt = require('jsonwebtoken');

// Middleware para verificar el token JWT
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Extraemos el token del encabezado Authorization
  
  if (!token) return res.status(401).json({ error: "Acceso denegado" });

  // Verificamos el token
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) return res.status(401).json({ error: "Token inválido" });

    req.user = decoded; // Almacenamos la información decodificada en `req.user`
    next(); // Pasamos al siguiente middleware o controlador
  });
}

// Middleware para verificar el rol de un usuario (opcional)
function requireRole(role) {
  return (req, res, next) => {
    // Asegúrate de que `role` está en el JWT y coincide con el rol requerido
    if (req.user.role !== role) {
      return res.status(403).json({ error: "No tienes permiso para acceder" });
    }
    next(); // Pasamos al siguiente middleware o controlador
  };
}

module.exports = { verifyToken, requireRole };
