# Movilcenter Plus — API Backend

API REST para la tienda Movilcenter Plus. Construida con **Express.js + Prisma + Neon PostgreSQL**.

---

## Stack

| Tecnología | Uso |
|-----------|-----|
| Express.js | Servidor HTTP |
| Prisma ORM | Acceso a base de datos |
| Neon PostgreSQL | Base de datos serverless |
| JWT + bcryptjs | Autenticación de admins |
| Cloudinary | Almacenamiento de imágenes/videos |
| Railway | Hosting del backend |

---

## Estructura del proyecto

```
movilcenter-api/
├── prisma/
│   ├── schema.prisma      # Esquema de la BD
│   └── seed.js            # Datos iniciales
├── src/
│   ├── lib/
│   │   └── prisma.js      # Cliente Prisma singleton
│   ├── middleware/
│   │   └── auth.js        # Verificación JWT
│   ├── routes/
│   │   ├── auth.js        # Login, me, change-password
│   │   ├── products.js    # CRUD productos + media
│   │   ├── categories.js  # CRUD categorías
│   │   └── config.js      # Config tienda + stats
│   ├── utils/
│   │   └── cloudinary.js  # Upload / delete media
│   └── app.js             # Entry point
├── .env.example
├── railway.toml
└── package.json
```

---

## Deploy paso a paso (hazlo hoy)

### 1. Crear base de datos en Neon

1. Ve a **https://neon.tech** → Sign up (gratis)
2. Crea un nuevo proyecto → nombre: `movilcenter`
3. Ve a **Connection Details** → copia la **Connection string** (tipo `postgresql://...`)
4. ⚠️ Asegúrate de usar la versión **Pooled connection** para producción

### 2. Clonar y configurar variables de entorno

```bash
git clone <tu-repo>
cd movilcenter-api
cp .env.example .env
```

Edita `.env` con tus valores reales:

```env
DATABASE_URL="postgresql://user:pass@host.neon.tech/neondb?sslmode=require"
JWT_SECRET="genera_uno_con: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
CLOUDINARY_CLOUD_NAME="tu_cloud"
CLOUDINARY_API_KEY="tu_key"
CLOUDINARY_API_SECRET="tu_secret"
```

### 3. Configurar Cloudinary (imágenes)

1. Ve a **https://cloudinary.com** → Sign up (gratis, 25GB)
2. Dashboard → copia **Cloud name**, **API Key** y **API Secret**
3. Pégalos en tu `.env`

### 4. Instalar y preparar la base de datos

```bash
npm install

# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas en Neon
npm run db:push

# Cargar datos iniciales (categorías, productos de ejemplo, admin)
npm run db:seed
```

Después del seed tendrás:
- **5 categorías** (Smartphones, Portátiles, Accesorios, Repuestos, Herramientas)
- **8 productos** de ejemplo
- **Admin:** `admin@movilcenterplus.com` / `Admin123!` ← **¡Cambia esto!**

### 5. Probar en local

```bash
npm run dev
# → API en http://localhost:4000
```

Prueba rápida:
```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/products
```

### 6. Deploy en Railway

1. Ve a **https://railway.app** → Sign up con GitHub
2. **New Project → Deploy from GitHub repo**
3. Selecciona tu repositorio
4. Espera el primer deploy (fallará porque faltan las env vars)
5. Ve a **Variables** → agrega todas las del `.env`:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://tu-app.vercel.app`
6. Railway hará un re-deploy automático
7. Ve a **Settings → Domains** → genera un dominio público

⚠️ **Después del primer deploy en Railway, ejecuta el seed:**
```bash
# Instala Railway CLI
npm install -g @railway/cli
railway login
railway run npm run db:seed
```

---

## Endpoints de la API

### Públicos (sin autenticación)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/products` | Listar productos (con filtros) |
| GET | `/api/products/:id` | Detalle de producto |
| GET | `/api/categories` | Listar categorías |
| GET | `/api/categories/:slug` | Categoría con sus productos |
| GET | `/api/config` | Configuración pública de la tienda |
| POST | `/api/auth/login` | Login de admin |

### Protegidos (requieren `Authorization: Bearer <token>`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/auth/me` | Usuario actual |
| POST | `/api/auth/change-password` | Cambiar contraseña |
| GET | `/api/products/admin/all` | Todos los productos (admin) |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Desactivar producto |
| POST | `/api/products/:id/media` | Subir imágenes/videos |
| DELETE | `/api/products/:id/media/:mediaId` | Eliminar media |
| PATCH | `/api/products/:id/media/reorder` | Reordenar imágenes |
| POST | `/api/categories` | Crear categoría |
| PUT | `/api/categories/:id` | Actualizar categoría |
| DELETE | `/api/categories/:id` | Desactivar categoría |
| PUT | `/api/config` | Actualizar config de tienda |
| GET | `/api/config/stats` | Estadísticas del dashboard |

### Filtros disponibles en `GET /api/products`

```
?category=smartphones      → filtrar por slug de categoría
?search=galaxy             → búsqueda en nombre, descripción, SKU
?featured=true             → solo productos destacados
?inStock=true              → solo con stock disponible
?page=1&limit=20           → paginación
?sort=price&order=asc      → ordenamiento
```

---

## Comandos útiles

```bash
npm run dev           # Desarrollo con hot reload
npm run start         # Producción
npm run db:push       # Sincronizar schema con la BD (sin migración)
npm run db:seed       # Cargar datos iniciales
npm run db:studio     # Abrir Prisma Studio (UI visual de la BD)
npm run db:reset      # Borrar y volver a seedear (¡cuidado en producción!)
```

---

## Cambiar contraseña del admin (importante)

Después del seed, el admin tiene contraseña temporal. Cámbiala:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@movilcenterplus.com","password":"Admin123!"}'

# Copia el token y luego:
curl -X POST http://localhost:4000/api/auth/change-password \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"Admin123!","newPassword":"TuNuevaContraseñaSegura123!"}'
```
