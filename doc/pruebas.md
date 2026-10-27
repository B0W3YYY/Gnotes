# Pruebas

## Smoke test de los endpoints

`API/scripts/smoke-test.js` (se corre con `npm run smoke` dentro de `API`). Levanta la API en el puerto 5099 con una base de datos aparte y recorre, para cursos, roles, usuarios, guías, comentarios, reportes, sanciones y palabras prohibidas: listar (200), crear (201), obtener por ID (200), actualizar (200), crear inválido (400), actualizar inválido (400), ID inexistente (404), ID malformado (400), eliminar (200) y eliminar otra vez (404). También revisa ruta inexistente (404), JSON mal formado (400), datos duplicados (400) y acceso sin sesión (401). Resultado: 88 casos correctos.

## Colección Postman

`doc/GNotes.postman_collection.json`: 114 peticiones con pruebas de código de respuesta. Se corrió completa con Newman contra una base de pruebas: 114 peticiones, 233 verificaciones, 0 fallos.

## Prueba automática de la API

`API/pruebas/prueba-api.js` (se corre con `npm test` dentro de `API`, con la API encendida). Crea sus propios usuarios y datos, revisa 50 casos y al final borra todo lo que creó.

| Módulo | Qué se revisa |
|---|---|
| Autenticación | Registro, clave corta rechazada, login correcto e incorrecto, el perfil no devuelve la contraseña, rutas privadas sin sesión dan 401 |
| Recuperar contraseña | Responde igual exista o no el correo; un token inválido se rechaza |
| Perfil | Editar datos, eliminar cuenta pide la contraseña y borra todo |
| Guías | Crear, buscar, filtrar, ordenar, solo el autor edita, el moderador puede eliminar |
| Participación | Votar (no la propia), favoritos, vistas, compartir, comentarios |
| Moderación | Reportar, solo moderadores ven reportes, ocultar y restaurar, palabras prohibidas dejan la guía en revisión y bloquean comentarios |
| Administración | Sanciones (el suspendido no entra ni publica), levantar sanción, cambiar rol, historial y estadísticas |

## Prueba manual del frontend

Recorrido hecho en el navegador, en escritorio y en celular (375 px), sin errores en la consola:

1. Registro → redirige a Mi panel con la sesión iniciada.
2. Crear guía → abre la guía creada.
3. Comentar en la guía.
4. Mi panel muestra las estadísticas y la guía en el historial.
5. Explorar con filtro de categoría y orden por votos.
6. Perfil: ver y editar datos.
7. Al cambiar el rol a admin, el menú se actualiza solo y aparecen Moderación y Administración.
8. Panel de administración: agregar una palabra prohibida.
9. Panel de moderación con pestañas de reportes, revisión, rechazadas e historial.
10. Eliminar la cuenta de prueba.
