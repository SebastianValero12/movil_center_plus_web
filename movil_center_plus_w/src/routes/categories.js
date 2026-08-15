// src/routes/categories.js — CRUD de categorías
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories — Todas las categorías activas (público)
router.get('/', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
});

// GET /api/categories/:slug — Una categoría por slug (público)
router.get('/:slug', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        products: {
          where: { isActive: true },
          include: { media: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener categoría' });
  }
});

// POST /api/categories — Crear categoría (admin)
router.post(
  '/',
  requireAuth,
  requireSuperAdmin,
  [
    body('name').trim().notEmpty().withMessage('Nombre requerido'),
    body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/).withMessage('Slug inválido (solo minúsculas, números y guiones)'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const category = await prisma.category.create({ data: req.body });
      res.status(201).json(category);
    } catch (err) {
      if (err.code === 'P2002') return res.status(409).json({ message: 'Ya existe una categoría con ese nombre o slug' });
      console.error(err);
      res.status(500).json({ message: 'Error al crear categoría' });
    }
  }
);

// PUT /api/categories/:id — Actualizar (admin)
router.put('/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(category);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Categoría no encontrada' });
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar categoría' });
  }
});

// DELETE /api/categories/:id — Desactivar (admin)
router.delete('/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });
    res.json({ message: 'Categoría desactivada' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Categoría no encontrada' });
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar categoría' });
  }
});

module.exports = router;
