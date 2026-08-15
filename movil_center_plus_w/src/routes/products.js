// src/routes/products.js — CRUD completo de productos con media
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildProductWhere(queryParams) {
  const { category, search, featured, inStock } = queryParams;
  const where = { isActive: true };

  if (category) {
    where.category = { slug: category };
  } else if (!search) {
    where.category = { slug: { not: 'repuestos' } };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (featured === 'true') {
    where.isFeatured = true;
  }
  if (inStock === 'true') {
    where.stock = { gt: 0 };
  }
  return where;
}

// ─── Rutas públicas ─────────────────────────────────────────────────────────

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = buildProductWhere(req.query);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          media: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { [sort]: order },
        skip,
        take: Number(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        media: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
});

// ─── Rutas protegidas (admin) ────────────────────────────────────────────────

// GET /api/products/admin/all — Todos los productos incluyendo inactivos
router.get('/admin/all', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = { slug: category };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          media: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// POST /api/products — Crear producto
router.post(
  '/',
  requireAuth,
  requireSuperAdmin,
  [
    body('name').trim().notEmpty().withMessage('Nombre requerido'),
    body('price').isNumeric().withMessage('Precio inválido'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock inválido'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const { name, description, price, oldPrice, stock, sku, categoryId, isFeatured } = req.body;

      // Generar slug único
      let slug = name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const existing = await prisma.product.count({ where: { slug } });
      if (existing > 0) slug = `${slug}-${Date.now()}`;

      const product = await prisma.product.create({
        data: {
          name,
          slug,
          description,
          price: Number(price),
          oldPrice: oldPrice ? Number(oldPrice) : null,
          stock: stock ? Number(stock) : 0,
          sku: sku || null,
          categoryId: categoryId ? Number(categoryId) : null,
          isFeatured: Boolean(isFeatured),
        },
        include: { category: true, media: true },
      });

      res.status(201).json(product);
    } catch (err) {
      if (err.code === 'P2002') return res.status(409).json({ message: 'Ya existe un producto con ese SKU' });
      console.error(err);
      res.status(500).json({ message: 'Error al crear producto' });
    }
  }
);

// PUT /api/products/:id — Actualizar producto
router.put('/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, price, oldPrice, stock, sku, categoryId, isFeatured, isActive } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = Number(price);
    if (oldPrice !== undefined) data.oldPrice = oldPrice ? Number(oldPrice) : null;
    if (stock !== undefined) data.stock = Number(stock);
    if (sku !== undefined) data.sku = sku || null;
    if (categoryId !== undefined) data.categoryId = categoryId ? Number(categoryId) : null;
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true, media: { orderBy: { sortOrder: 'asc' } } },
    });

    res.json(product);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Producto no encontrado' });
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// DELETE /api/products/:id — Borrado lógico
router.delete('/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Producto no encontrado' });
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

// ─── Media ───────────────────────────────────────────────────────────────────

// POST /api/products/:id/media — Subir imagen/video
router.post('/:id/media', requireAuth, requireSuperAdmin, upload.array('files', 10), async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se recibieron archivos' });
    }

    const mediaCount = await prisma.productMedia.count({ where: { productId } });

    const uploads = await Promise.all(
      req.files.map((file, i) => {
        const isVideo = file.mimetype.startsWith('video/');
        return uploadToCloudinary(file.buffer, {
          resourceType: isVideo ? 'video' : 'image',
          public_id: `product-${productId}-${Date.now()}-${i}`,
        }).then(result => ({
          url: result.url,
          publicId: result.publicId,
          type: result.type,
          sortOrder: mediaCount + i,
          productId,
        }));
      })
    );

    const media = await prisma.$transaction(
      uploads.map(m => prisma.productMedia.create({ data: m }))
    );

    res.status(201).json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al subir archivos' });
  }
});

// DELETE /api/products/:id/media/:mediaId — Eliminar un media
router.delete('/:id/media/:mediaId', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const media = await prisma.productMedia.findUnique({
      where: { id: Number(req.params.mediaId) },
    });
    if (!media) return res.status(404).json({ message: 'Media no encontrada' });

    if (media.publicId) {
      await deleteFromCloudinary(media.publicId, media.type === 'VIDEO' ? 'video' : 'image');
    }

    await prisma.productMedia.delete({ where: { id: media.id } });
    res.json({ message: 'Media eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar media' });
  }
});

// PATCH /api/products/:id/media/reorder — Reordenar imágenes
router.patch('/:id/media/reorder', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { order } = req.body; // Array de { id, sortOrder }
    if (!Array.isArray(order)) return res.status(400).json({ message: 'Formato inválido' });

    await prisma.$transaction(
      order.map(({ id, sortOrder }) =>
        prisma.productMedia.update({ where: { id }, data: { sortOrder } })
      )
    );

    res.json({ message: 'Orden actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al reordenar' });
  }
});

module.exports = router;
