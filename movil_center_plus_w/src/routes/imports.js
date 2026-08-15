// src/routes/imports.js — Endpoints para importaciones por archivo
const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const prisma = require('../lib/prisma');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Multer en memoria para Excel (soporta el formato moderno .xlsx)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream',
    ];
    if (allowed.includes(file.mimetype) || /\.xlsx$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Usa .xlsx'));
    }
  },
});

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

function parseBool(v) {
  if (v === undefined || v === null) return false;
  const s = String(v).trim().toLowerCase();
  return ['1', 'true', 'yes', 'y', 'si', 'sí'].includes(s);
}

async function ensureCategory(name) {
  if (!name) return null;
  const slug = slugify(name);
  let category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    category = await prisma.category.create({ data: { name: name.trim(), slug } });
  }
  return category;
}

async function withRetries(fn, attempts = 3, delayMs = 400) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // If last attempt, throw
      if (i === attempts - 1) throw err;
      // small backoff
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

// POST /api/imports/accessories
router.post('/accessories', requireAuth, requireSuperAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No se recibió archivo' });

  // Query params to control behavior
  // onlyDescription=true -> only update existing products' description (no creates, no other field changes)
  // matchBy=name|sku -> how to match existing products when onlyDescription=true (default: name)
  const onlyDescription = String(req.query.onlyDescription || '').toLowerCase() === 'true';
  const matchBy = (req.query.matchBy || 'name').toLowerCase();

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ message: 'El archivo no contiene hojas válidas' });
    }

    const headers = worksheet.getRow(1).values.slice(1).map((header) => String(header ?? '').trim().toLowerCase());
    const rows = [];

    worksheet.eachRow({ from: 2, includeEmpty: true }, (row) => {
      const values = row.values.slice(1);
      const item = {};
      headers.forEach((header, index) => {
        item[header || `col_${index + 1}`] = values[index] ?? null;
      });
      rows.push(item);
    });

    const results = { created: 0, updated: 0, errors: [] };

    for (const r of rows) {
      const map = {};
      for (const k of Object.keys(r)) map[k.toLowerCase().trim()] = r[k];

      const extId = map['id'];
      const name = (map['name'] || map['nombre'] || '').toString().trim();
      if (!name) {
        results.errors.push({ row: r, message: 'Nombre vacío' });
        continue;
      }
      const priceRaw = map['price'] ?? map['precio'];
      const stockRaw = map['stock'];
      const activeRaw = map['active'] ?? map['activo'];
      const categoryRaw = map['category'] ?? map['categoria'];

      const price = priceRaw == null || priceRaw === '' ? '0.00' : String(priceRaw).replace(',', '.');
      const stock = Number(stockRaw) || 0;
      const isActive = parseBool(activeRaw);
      const sku = extId != null ? String(extId) : null;
      const slug = slugify(name);
      const descriptionRaw = map['description'] ?? map['descripcion'] ?? null;
      const description = descriptionRaw != null ? String(descriptionRaw).trim() : null;

      const category = categoryRaw ? await ensureCategory(String(categoryRaw)) : null;

      const data = {
        name,
        slug,
        price: price,
        stock,
        isActive,
        sku,
        categoryId: category ? category.id : null,
      };
      if (description) data.description = description;

      try {
        // Matching strategy
        let existing = null;
        if (onlyDescription) {
          // When updating only description, match according to matchBy and do NOT create missing
          if (matchBy === 'sku' && sku) {
            existing = await withRetries(() => prisma.product.findUnique({ where: { sku } }));
          } else {
            // matchBy=name (default): find by slug
            existing = await withRetries(() => prisma.product.findUnique({ where: { slug } }));
          }

          if (existing) {
            // Only update description (if provided)
            const upd = {};
            if (description) upd.description = description;
            if (Object.keys(upd).length > 0) {
              await withRetries(() => prisma.product.update({ where: { id: existing.id }, data: upd }));
              results.updated++;
            } else {
              results.errors.push({ row: r, message: 'No description provided' });
            }
          } else {
            results.errors.push({ row: r, message: 'Producto no encontrado, no se crea (onlyDescription mode)' });
          }
        } else {
          // Default behavior: try by SKU then by slug, create if missing
          if (sku) {
            existing = await withRetries(() => prisma.product.findUnique({ where: { sku } }));
          }
          if (!existing) {
            existing = await withRetries(() => prisma.product.findUnique({ where: { slug } }));
          }
          if (existing) {
            await withRetries(() => prisma.product.update({ where: { id: existing.id }, data }));
            results.updated++;
          } else {
            await withRetries(() => prisma.product.create({ data }));
            results.created++;
          }
        }
      } catch (err) {
        results.errors.push({ row: r, message: err.message || String(err) });
      }
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error procesando archivo', detail: err.message });
  }
});

module.exports = router;
