// prisma/seed.js — Datos iniciales para Movilcenter Plus
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Seed deshabilitado en producción por seguridad.');
    return;
  }

  console.log('🌱 Iniciando seed...');

  // ── Categorías ────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'smartphones' },
      update: {},
      create: { name: 'Smartphones', slug: 'smartphones', description: 'Teléfonos inteligentes nuevos y reacondicionados', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'portatiles' },
      update: {},
      create: { name: 'Portátiles', slug: 'portatiles', description: 'Laptops y computadores portátiles', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'accesorios' },
      update: {},
      create: { name: 'Accesorios', slug: 'accesorios', description: 'Cargadores, auriculares, fundas y más', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'accesorios-gamer' },
      update: {},
      create: { name: 'Accesorios Gamer', slug: 'accesorios-gamer', description: 'Teclados, mouse, headsets y periféricos gamer', sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { slug: 'repuestos' },
      update: {},
      create: { name: 'Repuestos', slug: 'repuestos', description: 'Pantallas, baterías y piezas de repuesto', sortOrder: 5 },
    }),
    prisma.category.upsert({
      where: { slug: 'herramientas' },
      update: {},
      create: { name: 'Herramientas', slug: 'herramientas', description: 'Kits de reparación y herramientas profesionales', sortOrder: 6 },
    }),
  ]);

  console.log(`✅ ${categories.length} categorías creadas`);

  // ── Productos de ejemplo ──────────────────────────────────────────────────
  const products = [
    {
      name: 'Samsung Galaxy A54 5G',
      slug: 'samsung-galaxy-a54-5g',
      description: 'Smartphone Samsung Galaxy A54 5G con pantalla Super AMOLED de 6.4", procesador Exynos 1380, cámara triple de 50MP, batería de 5000mAh y 128GB de almacenamiento. Incluye cargador de 25W.',
      price: 849900,
      stock: 8,
      sku: 'SMT-SGA54-001',
      isFeatured: true,
      categorySlug: 'smartphones',
    },
    {
      name: 'iPhone 13 128GB',
      slug: 'iphone-13-128gb',
      description: 'Apple iPhone 13 con chip A15 Bionic, pantalla Super Retina XDR de 6.1", sistema de cámara dual de 12MP con modo noche y grabación en 4K Dolby Vision. Batería mejorada con hasta 19h de reproducción de video.',
      price: 2290000,
      oldPrice: 2490000,
      stock: 5,
      sku: 'SMT-IP13-128',
      isFeatured: true,
      categorySlug: 'smartphones',
    },
    {
      name: 'Portátil HP 15s Intel Core i5',
      slug: 'portatil-hp-15s-i5',
      description: 'Laptop HP 15s con procesador Intel Core i5 de 11va generación, 8GB RAM DDR4, 512GB SSD NVMe, pantalla Full HD de 15.6", Windows 11 Home. Ideal para trabajo y estudio.',
      price: 1950000,
      stock: 4,
      sku: 'LAP-HP15S-I5',
      isFeatured: true,
      categorySlug: 'portatiles',
    },
    {
      name: 'Audífonos Bluetooth JBL Tune 510BT',
      slug: 'audifonos-jbl-tune-510bt',
      description: 'Auriculares inalámbricos JBL Tune 510BT con sonido Pure Bass, 40 horas de batería, conexión multipunto a 2 dispositivos y plegables para mayor portabilidad.',
      price: 189900,
      oldPrice: 229900,
      stock: 20,
      sku: 'ACC-JBL510-BT',
      isFeatured: false,
      categorySlug: 'accesorios',
    },
    {
      name: 'Pantalla OLED iPhone 13 Original',
      slug: 'pantalla-oled-iphone-13',
      description: 'Pantalla de repuesto OLED original para iPhone 13. Incluye digitalizador táctil integrado, resolución 2532x1170 a 460 ppi, compatible con True Tone. Kit de instalación incluido.',
      price: 320000,
      stock: 12,
      sku: 'REP-IP13-LCD',
      isFeatured: false,
      categorySlug: 'repuestos',
    },
    {
      name: 'Batería Samsung Galaxy S22',
      slug: 'bateria-samsung-galaxy-s22',
      description: 'Batería original Samsung Galaxy S22 de 3700mAh. Compatible con carga rápida de 25W. Incluye adhesivo de instalación y herramienta de apertura.',
      price: 85000,
      stock: 18,
      sku: 'REP-SG22-BAT',
      isFeatured: false,
      categorySlug: 'repuestos',
    },
    {
      name: 'Kit Herramientas Reparación 45 Pzas',
      slug: 'kit-herramientas-45-pzas',
      description: 'Kit profesional de 45 piezas para reparación de smartphones y tablets. Incluye destornilladores Torx, Pentalobe, Phillips, spudgers de plástico, pinzas de precisión, ventosas y palancas metálicas.',
      price: 65000,
      stock: 25,
      sku: 'TOL-KIT45-PRO',
      isFeatured: false,
      categorySlug: 'herramientas',
    },
    {
      name: 'Cargador USB-C 65W GaN Anker',
      slug: 'cargador-usbc-65w-anker',
      description: 'Cargador compacto Anker GaN 65W con tecnología de carga rápida. Puerto USB-C PD 3.0, compatible con MacBook, iPad, iPhone y smartphones Android. Cable USB-C de 1.5m incluido.',
      price: 125000,
      stock: 30,
      sku: 'ACC-ANK65W-GAN',
      isFeatured: false,
      categorySlug: 'accesorios',
    },
    {
      name: 'Teclado Mecánico Gamer RGB',
      slug: 'teclado-mecanico-gamer-rgb',
      description: 'Teclado mecánico gamer con iluminación RGB, switches táctiles y reposamuñecas desmontable. Compatible con Windows y Mac.',
      price: 329000,
      stock: 15,
      sku: 'ACC-GAMER-KEY',
      isFeatured: false,
      categorySlug: 'accesorios-gamer',
    },
  ];

  for (const p of products) {
    const { categorySlug, ...data } = p;
    const category = categories.find(c => c.slug === categorySlug);
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        price: data.price,
        oldPrice: data.oldPrice ?? null,
        categoryId: category?.id ?? null,
      },
    });
  }

  console.log(`✅ ${products.length} productos creados`);

  // ── Configuración de la tienda ────────────────────────────────────────────
  const storeConfigs = [
    { key: 'store_name',       value: 'Movilcenter Plus' },
    { key: 'store_address',    value: 'Av. Principal #123, Local 45' },
    { key: 'store_city',       value: 'Tame, Arauca, Colombia' },
    { key: 'store_phone',      value: '+57 300 123 4567' },
    { key: 'store_whatsapp',   value: '573001234567' },
    { key: 'store_email',      value: 'contacto@movilcenterplus.com' },
    { key: 'store_hours',      value: 'Lun–Vie 9AM–8PM · Sáb 10AM–6PM · Dom Cerrado' },
    { key: 'store_instagram',  value: 'movilcenterplus' },
    { key: 'store_facebook',   value: 'movilcenterplus' },
    { key: 'status_banner',    value: '✅ Tienda abierta • Horario: Lun–Sáb 9:00 AM – 8:00 PM • Servicio técnico especializado disponible' },
  ];

  for (const config of storeConfigs) {
    await prisma.storeConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  console.log(`✅ ${storeConfigs.length} configuraciones de tienda creadas`);

  // ── Usuario administrador ─────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@movilcenterplus.com' },
    update: {},
    create: {
      email: 'admin@movilcenterplus.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'SUPERADMIN',
    },
  });

  console.log('✅ Usuario admin creado (admin@movilcenterplus.com / Admin123!)');
  console.log('⚠️  Cambia la contraseña del admin en producción!');
  console.log('\n🎉 Seed completado exitosamente.');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
