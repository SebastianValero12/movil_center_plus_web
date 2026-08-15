// Script para importar productos desde un Excel (accesorios)
// Uso: node scripts/import_accessories.js path/to/file.xlsx
// Requiere: npm install xlsx

const path = require('path');
const xlsx = require('xlsx');
const prisma = require('../src/lib/prisma');

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
    category = await prisma.category.create({
      data: { name: name.trim(), slug },
    });
    console.log('Created category:', category.name);
  }
  return category;
}

async function importFile(filePath) {
  const abs = path.resolve(process.cwd(), filePath);
  const wb = xlsx.readFile(abs);
  const sheetName = wb.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { defval: null });

  let created = 0;
  let updated = 0;
  for (const r of rows) {
    // Normalize keys (case-insensitive)
    const map = {};
    for (const k of Object.keys(r)) map[k.toLowerCase().trim()] = r[k];

    const extId = map['id'] ?? map['id '];
    const name = (map['name'] || map['nombre'] || '').toString().trim();
    if (!name) {
      console.warn('Skipping row without name:', r);
      continue;
    }
    const priceRaw = map['price'] ?? map['precio'];
    const stockRaw = map['stock'];
    const activeRaw = map['active'] ?? map['activo'];
    const categoryRaw = map['category'] ?? map['categoria'];

    const price = priceRaw == null || priceRaw === '' ? '0.00' : String(priceRaw).replace(',', '.');
    const stock = Number(stockRaw) || 0;
    const isActive = parseBool(activeRaw);
    const sku = extId != null ? String(extId) : undefined;
    const slug = slugify(name);

    // Ignorar 'valor neto' según requisito

    const category = categoryRaw ? await ensureCategory(String(categoryRaw)) : null;

    // Upsert product by `slug` (unique) — esto actualizará si existe
    const data = {
      name,
      slug,
      price: price,
      stock,
      isActive,
      sku: sku || null,
      category: category ? { connect: { id: category.id } } : undefined,
    };

    // Remove undefined fields (Prisma doesn't like undefined in nested objects)
    if (!data.category) delete data.category;

    try {
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) {
        await prisma.product.update({ where: { id: existing.id }, data });
        updated++;
        console.log('Updated:', name);
      } else {
        await prisma.product.create({ data });
        created++;
        console.log('Created:', name);
      }
    } catch (err) {
      console.error('Error processing', name, err.message || err);
    }
  }

  console.log(`Import finished. Created: ${created}, Updated: ${updated}`);
}

async function main() {
  const file = process.argv[2] || 'accessories.xlsx';
  try {
    await importFile(file);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
