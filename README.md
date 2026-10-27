# GNotes

Plataforma comunitaria para crear y compartir guías de videojuegos. Los usuarios publican guías (jefes, builds, secretos, etc.), las votan, comentan y guardan en favoritos; los moderadores revisan reportes y contenido con palabras prohibidas, y los administradores gestionan roles y sanciones.

- **API** (`API/`): Node.js, Express 5 y MongoDB con Mongoose. Puerto 5001, rutas bajo `/api`.
- **Frontend** (`Frontend/`): HTML, Bootstrap 5 y JavaScript, servido con Express. Puerto 5002.

## Requisitos

- Node.js 18 o superior (usa `fetch` nativo).
- MongoDB local (`mongodb://127.0.0.1:27017`) o una base en MongoDB Atlas.

## Instalación y ejecución

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/B0W3YYY/Gnotes.git
   cd Gnotes
   ```

2. Levantar MongoDB. Si está instalado como servicio ya está corriendo; si no, en otra terminal: `mongod --dbpath <carpeta-de-datos>`. Con Atlas no hace falta, basta con poner su URI en el `.env`.

3. Configurar e iniciar la API:

   ```bash
   cd API
   npm install
   cp .env.example .env
   npm run dev
   ```

   En `.env` cambia `JWT_SECRET` por una clave larga y, si usas Atlas, `MONGO_URI`. Debe aparecer `MongoDB conectado` y `Servidor corriendo en http://localhost:5001`. `npm start` la inicia sin nodemon.

4. En otra terminal, iniciar el frontend:

   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

5. Abrir http://localhost:5002

### Variables de entorno (`API/.env`)

| Variable | Ejemplo | Para qué |
|---|---|---|
| `PORT` | `5001` | Puerto de la API |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/proyectoIntegrador` | Conexión a MongoDB |
| `JWT_SECRET` | una clave larga | Firmar los tokens de sesión |
| `FRONTEND_URL` | `http://localhost:5002` | Enlace del correo de recuperación |
| `EMAIL_API_URL` | URL del servicio de correo | Enviar el correo de recuperación |

El `.env` real no se sube (está en `.gitignore`); `.env.example` es la plantilla.

### Crear el primer administrador

Regístrate desde la página y luego, en la carpeta `API`:

```bash
npm run admin -- tu-correo@ejemplo.com
```

## Estructura de la API

```
API/
├── config/db.js          Conexión a MongoDB (eventos connected, error y disconnected)
├── models/               Esquemas de Mongoose con sus validaciones
├── controllers/          Lógica de cada recurso
├── routes/               Rutas: solo enlazan URL, middlewares y controlador
├── middlewares/          auth (sesión y roles), validarId, errores (404 y manejo central)
├── utils/                Palabras y emojis prohibidos, historial de moderación
├── scripts/smoke-test.js Prueba rápida de todos los endpoints
├── pruebas/prueba-api.js Prueba de punta a punta de las reglas de negocio
└── server.js             Arma la app y monta las rutas
```

### Entidades

| Modelo | Qué guarda | Relaciones |
|---|---|---|
| `Usuario` | Nombre, correo (único, validado), contraseña con bcrypt, rol, biografía, favoritos | `favoritos` → Guia |
| `Guia` | Título, juego, categoría, dificultad, contenido, estado, votos, vistas | `autor` → Usuario, `votos` → Usuario |
| `Comentario` | Texto (máx. 1000), estado | `guia` → Guia, `autor` → Usuario |
| `Reporte` | Tipo (guia/comentario), motivo, estado | `reportadoPor` → Usuario |
| `Sancion` | Tipo (advertencia/suspensión/bloqueo), motivo, hasta, activa | `usuario` y `aplicadaPor` → Usuario |
| `PalabraProhibida` | Palabra única en minúsculas | — |
| `AccionModeracion` | Historial de acciones de moderadores y admins | `realizadaPor` → Usuario |
| `Curso`, `Roles` | CRUD visto en clase | — |

Todos usan `timestamps` (`createdAt` y `updatedAt`). La contraseña nunca se devuelve en las respuestas.

## Rutas de la API

Base: `http://localhost:5001/api`. Las rutas con 🔒 necesitan el encabezado `Authorization: Bearer <token>` (el token lo devuelven el registro y el login).

### Salud

| Método | URL | Respuestas |
|---|---|---|
| GET | `http://localhost:5001/` | 200 `{ "ok": true, "message": "API de GNotes funcionando" }` |

### Usuarios (`/api/usuarios`)

| Método | URL | Acceso | Body de ejemplo | Respuestas |
|---|---|---|---|---|
| POST | `/usuarios` | Público | `{ "nombre": "Ana", "correo": "ana@mail.com", "clave": "clave123" }` | 201 `{ token, usuario }`, 400 |
| POST | `/usuarios/login` | Público | `{ "correo": "ana@mail.com", "clave": "clave123" }` | 200 `{ token, usuario }`, 401, 403 (sancionado) |
| POST | `/usuarios/recuperar` | Público | `{ "correo": "ana@mail.com" }` | 200 (igual exista o no) |
| POST | `/usuarios/restablecer` | Público | `{ "token": "<del correo>", "clave": "nueva123" }` | 200, 400 |
| GET | `/usuarios/perfil` | 🔒 | — | 200, 401 |
| PUT | `/usuarios/perfil` | 🔒 | `{ "nombre": "Ana", "correo": "ana@mail.com", "biografia": "Hola" }` | 200, 400 |
| PUT | `/usuarios/perfil/clave` | 🔒 | `{ "actual": "clave123", "nueva": "clave456" }` | 200, 400 |
| DELETE | `/usuarios/perfil` | 🔒 | `{ "clave": "clave123" }` | 200, 400 |
| GET | `/usuarios/perfil/estadisticas` | 🔒 | — | 200 |
| GET | `/usuarios/perfil/favoritos` | 🔒 | — | 200 |
| GET | `/usuarios` | 🔒 Admin | — | 200, 403 |
| GET | `/usuarios/:id` | Público | — | 200, 400, 404 |
| PUT | `/usuarios/:id/rol` | 🔒 Admin | `{ "rol": "moderador" }` | 200, 400, 404 |
| DELETE | `/usuarios/:id` | 🔒 Admin | — | 200, 400, 404 |

### Guías (`/api/guias`)

| Método | URL | Acceso | Body de ejemplo | Respuestas |
|---|---|---|---|---|
| GET | `/guias` | Público | Query: `q`, `juego`, `categoria`, `dificultad`, `autor`, `orden=recientes\|antiguas\|votadas\|vistas\|titulo` | 200 |
| GET | `/guias/opciones` | Público | — | 200 `{ categorias, dificultades }` |
| GET | `/guias/:id` | Público | — | 200, 400, 404 |
| POST | `/guias` | 🔒 | `{ "titulo": "Cómo vencer a Margit", "juego": "ELDEN RING", "categoria": "Jefes", "dificultad": "Difícil", "contenido": "..." }` | 201, 400, 401, 403 |
| PUT | `/guias/:id` | 🔒 Autor | `{ "titulo": "Nuevo título" }` | 200, 400, 403, 404 |
| DELETE | `/guias/:id` | 🔒 Autor o moderador | — | 200, 403, 404 |
| POST | `/guias/:id/voto` | 🔒 | — | 200 `{ yaVoto, totalVotos }`, 400, 404 |
| POST | `/guias/:id/favorito` | 🔒 | — | 200 `{ esFavorito }`, 404 |
| POST | `/guias/:id/compartir` | Público | — | 200 `{ compartidos }`, 404 |

Si una guía tiene palabras prohibidas queda en estado `pendiente` hasta que un moderador la revise.

### Comentarios (`/api/comentarios`)

| Método | URL | Acceso | Body de ejemplo | Respuestas |
|---|---|---|---|---|
| GET | `/comentarios/guia/:guiaId` | Público | — | 200, 400 |
| POST | `/comentarios/guia/:guiaId` | 🔒 | `{ "texto": "¡Muy útil!" }` | 201, 400, 404 |
| GET | `/comentarios/:id` | Público | — | 200, 400, 404 |
| PUT | `/comentarios/:id` | 🔒 Autor | `{ "texto": "Muy útil, gracias" }` | 200, 400, 403, 404 |
| DELETE | `/comentarios/:id` | 🔒 Autor o moderador | — | 200, 403, 404 |

### Reportes (`/api/reportes`)

| Método | URL | Acceso | Body de ejemplo | Respuestas |
|---|---|---|---|---|
| POST | `/reportes` | 🔒 | `{ "tipo": "guia", "objetivo": "<id>", "motivo": "Spam" }` | 201, 400, 404 |
| GET | `/reportes?estado=pendiente` | 🔒 Moderador | — | 200, 403 |
| GET | `/reportes/:id` | 🔒 Moderador | — | 200, 400, 404 |
| PUT | `/reportes/:id` | 🔒 Moderador | `{ "accion": "ocultar" }` o `{ "accion": "descartar" }` | 200, 400, 404 |
| DELETE | `/reportes/:id` | 🔒 Moderador | — | 200, 404 |

### Moderación (`/api/moderacion`, 🔒 moderador o admin)

| Método | URL | Body de ejemplo | Respuestas |
|---|---|---|---|
| GET | `/moderacion/resumen` | — | 200 |
| GET | `/moderacion/guias?estado=pendiente` | — | 200 |
| PUT | `/moderacion/guias/:id/estado` | `{ "estado": "publicada" }` o `{ "estado": "rechazada" }` | 200, 400, 404 |
| GET | `/moderacion/historial` | — | 200 |

### Administración (`/api/admin`, 🔒 admin)

| Método | URL | Body de ejemplo | Respuestas |
|---|---|---|---|
| GET | `/admin/estadisticas` | — | 200 |
| GET | `/admin/palabras` | — | 200 |
| POST | `/admin/palabras` | `{ "palabra": "tramposo" }` | 201, 400 (vacía o repetida) |
| DELETE | `/admin/palabras/:id` | — | 200, 400, 404 |
| GET | `/admin/sanciones` | — | 200 |
| GET | `/admin/sanciones/:id` | — | 200, 400, 404 |
| POST | `/admin/sanciones` | `{ "usuario": "<id>", "tipo": "suspension", "motivo": "Spam", "hasta": "2026-12-31" }` | 201, 400, 404 |
| PUT | `/admin/sanciones/:id/levantar` | — | 200, 400, 404 |

Las sanciones no se borran: se levantan (`activa: false`) para conservar el historial.

### Cursos y roles (`/api/cursos`, `/api/roles`)

CRUD público visto en clase: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.

- Curso: `{ "nombre": "Programación I", "descripcion": "Curso base", "creditos": 4 }` (créditos entre 0 y 10)
- Rol: `{ "nombre": "editor", "descripcion": "Puede editar" }` (nombre único)

## Formato de respuestas y errores

Las respuestas correctas devuelven el recurso (o una lista) en JSON. Las actualizaciones y eliminaciones responden `{ "mensaje": "...", "datos": ... }`.

Todos los errores responden JSON con la misma forma:

```json
{ "ok": false, "message": "El título es obligatorio. La categoría es obligatoria", "errores": ["El título es obligatorio", "La categoría es obligatoria"] }
```

| Código | Cuándo |
|---|---|
| 200 | Consulta, actualización o eliminación correcta |
| 201 | Recurso creado |
| 400 | Faltan datos, falla una validación, ID malformado, dato repetido o JSON mal formado |
| 401 | Falta iniciar sesión |
| 403 | No tienes permiso o tu cuenta está sancionada |
| 404 | El recurso o la ruta no existe |
| 500 | Error inesperado (el detalle solo queda en la consola del servidor) |

## Pruebas

Con MongoDB corriendo, dentro de `API`:

```bash
npm run smoke
```

Levanta la API en el puerto 5099 con una base aparte (`<tu base>_smoke`) y prueba cada entidad: listar, crear, obtener, actualizar, errores de validación, ID inexistente (404), ID malformado (400), eliminar y eliminar de nuevo (404); además ruta inexistente, JSON mal formado y datos duplicados. Muestra una tabla ✅/❌ y borra esa base al terminar.

```bash
npm test
```

Con la API encendida (`npm run dev`), prueba las reglas de negocio de punta a punta (permisos, votos, moderación, sanciones, emojis prohibidos) y borra lo que creó.

### Colección Postman / Thunder Client

[`doc/GNotes.postman_collection.json`](doc/GNotes.postman_collection.json) tiene 114 peticiones con casos de éxito y de error, y cada una revisa su código de respuesta.

1. Importa el archivo en Postman o Thunder Client. La variable `baseUrl` ya vale `http://localhost:5001/api`.
2. Corre la carpeta **0. Preparación** (registra un usuario normal y uno que será admin, y guarda sus tokens).
3. En la carpeta `API`: `npm run admin -- admin.postman@gnotes.test`
4. Corre toda la colección. La carpeta **9. Limpieza** borra las cuentas y la guía creadas.

## Roles

| Rol | Qué puede hacer |
|---|---|
| Visitante | Ver el inicio, registrarse, iniciar sesión, recuperar contraseña y ver guías compartidas |
| Usuario | Explorar, crear, editar y eliminar sus guías, votar, comentar, guardar favoritos, compartir, reportar y administrar su perfil |
| Moderador | Lo del usuario, más atender reportes, aprobar o rechazar guías y ver el historial de moderación |
| Admin | Lo del moderador, más cambiar roles, aplicar sanciones y administrar palabras prohibidas |

## Documentación

- [Pruebas](doc/pruebas.md): qué se probó y cómo.
- [Módulos](doc/modulos.md): paquetes que se usan.
- Documentación de interfaz: http://localhost:5002/pages/ui/documentacion.html

## Seguridad

- El archivo `.env` no se sube a GitHub (está en `.gitignore`). Usa `.env.example` como plantilla.
- Las contraseñas se guardan encriptadas con bcrypt y nunca se devuelven.
- La sesión usa un token JWT que vence a los 7 días.
- El cliente no puede fijar `_id`, rol, estado, votos ni otros campos internos: cada controlador toma solo los campos permitidos.
