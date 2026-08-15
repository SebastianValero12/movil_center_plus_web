// src/routes/config.js — Configuración de la tienda
const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/config — Configuración pública de la tienda
router.get('/', async (_req, res) => {
  try {
    const configs = await prisma.storeConfig.findMany();
    // Convertir array [{key, value}] a objeto {key: value}
    const config = configs.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener configuración' });
  }
});

// PUT /api/config — Actualizar configuración (admin)
// Body: { store_name: "...", store_whatsapp: "...", ... }
router.put('/', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const updates = Object.entries(req.body);
    if (updates.length === 0) return res.status(400).json({ message: 'No se enviaron datos' });

    await prisma.$transaction(
      updates.map(([key, value]) =>
        prisma.storeConfig.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    // Devolver la configuración actualizada
    const configs = await prisma.storeConfig.findMany();
    const config = configs.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar configuración' });
  }
});

// GET /api/config/stats — Estadísticas del dashboard (admin)
router.get('/stats', requireAuth, requireSuperAdmin, async (_req, res) => {
  try {
    const [totalProducts, activeProducts, lowStockProducts, totalCategories] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, stock: { lte: 3, gt: 0 } } }),
      prisma.category.count({ where: { isActive: true } }),
    ]);

    // Productos por categoría
    const byCategory = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        name: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalCategories,
      byCategory: byCategory.map(c => ({ name: c.name, count: c._count.products })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
