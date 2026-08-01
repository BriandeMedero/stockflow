# StockFlow

Sistema de gestión de stock con control de productos, categorías, movimientos de inventario y ventas. Incluye autenticación con JWT, control de acceso por roles (ADMIN/USER) y tests de integración.

## Stack

- **Backend:** Node.js, Express 5, PostgreSQL, JWT, bcrypt
- **Frontend:** React 19, Vite, React Router, Bootstrap
- **Testing:** Jest + Supertest (tests de integración contra una base de datos real de prueba)
- **Docs de API:** Swagger (`/api-docs`)
- **Infra:** Docker Compose (backend + base de datos)

## Arquitectura
StockFlow/
├── backend/
│ ├── src/
│ │ ├── app.js # arma la app de Express (usado por tests)
│ │ ├── server.js # conecta DB y levanta el servidor
│ │ ├── db.js
│ │ ├── routes/
│ │ ├── middleware/ # auth (JWT) y roles (ADMIN/USER)
│ │ ├── services/ # lógica de negocio (ej. stockService)
│ │ ├── config/ # swagger
│ │ └── tests/
│ └── db/init.sql # esquema de la base de datos
├── frontend/stockflow-frontend/
└── docker-compose.yml

## Cómo correrlo (con Docker — recomendado)

Requisitos: Docker y Docker Compose instalados.

```bash
git clone <tu-repo>
cd stockflow
docker compose up --build
```

Esto levanta Postgres + el backend. La API queda en `http://localhost:3000`, con Swagger en `http://localhost:3000/api-docs`.

Para el frontend (corre aparte, no está dockerizado todavía):

```bash
cd frontend/stockflow-frontend
npm install
npm run dev
```

Frontend disponible en `http://localhost:5173`.

## Primer usuario admin

El sistema no trae usuarios precargados. Registrá el primero vía Swagger (`POST /api/auth/register`), y luego actualizá su rol a mano en la base:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'tu-email@ejemplo.com';
```

Con Docker: `docker compose exec db psql -U stockflow -d stockflow -c "UPDATE users SET role = 'ADMIN' WHERE email = 'tu-email@ejemplo.com';"`

## Sin Docker (Postgres local)

```bash
cd backend
cp .env.example .env    # completá con tus credenciales de Postgres local
psql -U tu_usuario -d tu_base -f db/init.sql
npm install
npm run dev
```

## Tests

Los tests son de integración: levantan peticiones HTTP reales contra la API y verifican el comportamiento contra una base de datos de prueba separada (no tocan la base de desarrollo).

**1. Levantar la base de datos de test** (una sola vez, o cada vez que quieras un estado limpio):
```bash
docker compose up -d db_test
```

**2. Configurar las variables de test** — crear `backend/.env.test`:

DB_USER=stockflow_test
DB_HOST=localhost
DB_NAME=stockflow_test
DB_PASSWORD=stockflow_test
DB_PORT=5433
JWT_SECRET=test_secret_key
PORT=3001

**3. Correr los tests:**
```bash
cd backend
npm test
```

Cobertura actual:
- Autenticación: registro y login, casos válidos e inválidos (email duplicado, contraseña corta, credenciales incorrectas)
- Lógica de stock (`stockService.js`): suma/resta de stock por tipo de movimiento, validación de stock insuficiente en ventas y ajustes, rechazo de tipos/cantidades inválidas — incluye el test de regresión del bug donde un `ADJUSTMENT` podía dejar el stock en negativo

## Funcionalidades

- Autenticación JWT con roles (ADMIN / USER)
- CRUD de productos y categorías (solo ADMIN puede crear/editar/eliminar; cualquier usuario logueado puede leer)
- Registro de movimientos de inventario (compras, ventas, devoluciones, ajustes) con validación de stock centralizada en una capa de servicio
- Ventas con múltiples ítems, transacciones atómicas (`BEGIN`/`COMMIT`/`ROLLBACK`) y descuento automático de stock con bloqueo de fila (`SELECT ... FOR UPDATE`) para evitar condiciones de carrera
- Frontend con control de UI según rol (los botones de edición/eliminación se ocultan para usuarios sin permiso)
- Documentación interactiva de la API con Swagger

## Decisiones técnicas destacadas

- **Capa de servicio (`stockService.js`):** la lógica de actualizar stock + registrar movimiento estaba duplicada entre las rutas de `movements` y `sales`, lo que generó un bug real (un `ADJUSTMENT` podía dejar el stock en negativo porque solo se validaba stock suficiente para `SALE`). Se centralizó en una única función reutilizable, con su test de regresión correspondiente.
- **`app.js` separado de `server.js`:** permite testear la aplicación de Express con Supertest sin necesidad de levantar un servidor HTTP real ni conectar a la base de producción.
- **Base de datos de test aislada:** los tests corren contra un contenedor Postgres separado (puerto 5433), evitando cualquier riesgo de pisar datos de desarrollo.

