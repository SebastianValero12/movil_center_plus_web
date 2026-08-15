// src/middleware/auth.js — Verificación JWT para rutas protegidas
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de autenticación requerido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Usuario no autorizado' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado, inicia sesión nuevamente' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
}

function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'SUPERADMIN') {
    return res.status(403).json({ message: 'Acceso restringido a superadmin' });
  }
  next();
}

module.exports = { requireAuth, requireSuperAdmin };
