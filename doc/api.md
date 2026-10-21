# API de GNotes

Dirección base: `http://localhost:5001`

Las rutas marcadas con 🔒 necesitan sesión: el encabezado `Authorization: Bearer <token>`, con el token que devuelven el registro y el login.

## Usuarios (`/usuarios`)

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| POST | `/usuarios` | Público | Registro. Devuelve `{ token, usuario }` |
| POST | `/usuarios/login` | Público | Inicio de sesión. Devuelve `{ token, usuario }` |
| POST | `/usuarios/recuperar` | Público | Envía por correo el enlace para restablecer la contraseña |
| POST | `/usuarios/restablecer` | Público | Cambia la contraseña con el token del correo |
| GET | `/usuarios/perfil` | 🔒 | Mi perfil |
| PUT | `/usuarios/perfil` | 🔒 | Editar nombre, correo y biografía |
| PUT | `/usuarios/perfil/clave` | 🔒 | Cambiar contraseña (`actual`, `nueva`) |
| DELETE | `/usuarios/perfil` | 🔒 | Eliminar mi cuenta (pide `clave`) |
| GET | `/usuarios/perfil/estadisticas` | 🔒 | Datos del dashboard |
| GET | `/usuarios/perfil/favoritos` | 🔒 | Mis guías favoritas |
| GET | `/usuarios` | 🔒 Admin | Lista de usuarios |
| GET | `/usuarios/:id` | Público | Perfil público |
| PUT | `/usuarios/:id/rol` | 🔒 Admin | Cambiar rol |

## Guías (`/guias`)

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| GET | `/guias` | Público | Lista de guías publicadas. Filtros: `q`, `juego`, `categoria`, `dificultad`, `autor`. Orden: `orden=recientes\|antiguas\|votadas\|vistas\|titulo` |
| GET | `/guias/opciones` | Público | Categorías y dificultades |
| GET | `/guias/:id` | Público | Una guía (suma una vista) |
| POST | `/guias` | 🔒 | Crear. Si tiene palabras prohibidas queda en revisión |
| PUT | `/guias/:id` | 🔒 Autor | Editar |
| DELETE | `/guias/:id` | 🔒 Autor o moderador | Eliminar |
| POST | `/guias/:id/voto` | 🔒 | Votar o quitar el voto |
| POST | `/guias/:id/favorito` | 🔒 | Guardar o quitar de favoritos |
| POST | `/guias/:id/compartir` | Público | Cuenta una vez compartida |

## Comentarios (`/comentarios`)

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| GET | `/comentarios/guia/:guiaId` | Público | Comentarios de una guía |
| POST | `/comentarios/guia/:guiaId` | 🔒 | Comentar (se rechaza si tiene palabras prohibidas) |
| DELETE | `/comentarios/:id` | 🔒 Autor o moderador | Eliminar |

## Reportes (`/reportes`)

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| POST | `/reportes` | 🔒 | Reportar (`tipo`: guia o comentario, `objetivo`, `motivo`) |
| GET | `/reportes` | 🔒 Moderador | Reportes pendientes |
| PUT | `/reportes/:id` | 🔒 Moderador | Atender: `accion` = `ocultar` o `descartar` |

## Moderación (`/moderacion`, 🔒 moderador o admin)

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/moderacion/resumen` | Cantidad de pendientes |
| GET | `/moderacion/guias?estado=pendiente` | Guías por estado |
| PUT | `/moderacion/guias/:id/estado` | Aprobar (`publicada`) o rechazar (`rechazada`) |
| GET | `/moderacion/historial` | Historial de acciones |

## Administración (`/admin`, 🔒 admin)

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/admin/estadisticas` | Estadísticas generales |
| GET / POST | `/admin/palabras` | Ver y agregar palabras prohibidas |
| DELETE | `/admin/palabras/:id` | Quitar una palabra |
| GET / POST | `/admin/sanciones` | Ver y aplicar sanciones (`advertencia`, `suspension` con `hasta`, `bloqueo`) |
| PUT | `/admin/sanciones/:id/levantar` | Levantar una sanción |

## Rutas de la clase

`/cursos` y `/roles` siguen con el CRUD que se hizo en clase.
