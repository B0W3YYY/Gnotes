# GNotes

Plataforma comunitaria para crear y compartir guías de videojuegos.

- **API**: Node.js, Express y MongoDB (Mongoose). Puerto 5001.
- **Frontend**: HTML, Bootstrap 5 y JavaScript, servido con Express. Puerto 5002.

## Cómo correrlo

Necesitas Node.js y MongoDB corriendo en tu computadora.

1. Configura la API: copia `API/.env.example` como `API/.env` y cambia `JWT_SECRET` por una clave larga y secreta.
2. Instala y arranca la API:

   ```bash
   cd API
   npm install
   npm run dev
   ```

3. En otra terminal, instala y arranca el frontend:

   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

4. Abre http://localhost:5002

### Crear el primer administrador

Regístrate desde la página y luego, en la carpeta `API`:

```bash
npm run admin -- tu-correo@ejemplo.com
```

Desde el panel de administración ya puedes nombrar a otros moderadores y administradores.

### Pruebas

Con la API corriendo, en otra terminal dentro de `API`:

```bash
npm test
```

## Roles

| Rol | Qué puede hacer |
|---|---|
| Visitante | Ver el inicio, registrarse, iniciar sesión, recuperar contraseña y ver guías compartidas |
| Usuario | Explorar, crear, editar y eliminar sus guías, votar, comentar, guardar favoritos, compartir, reportar y administrar su perfil |
| Moderador | Lo del usuario, más atender reportes, aprobar o rechazar guías y ver el historial de moderación |
| Admin | Lo del moderador, más cambiar roles, aplicar sanciones y administrar palabras prohibidas |

## Documentación

- [API](doc/api.md): todas las rutas.
- [Pruebas](doc/pruebas.md): qué se probó y cómo.
- [Módulos](doc/modulos.md): paquetes que se usan.
- Documentación de interfaz: http://localhost:5002/pages/ui/documentacion.html

## Seguridad

- El archivo `.env` no se sube a GitHub (está en `.gitignore`). Usa `.env.example` como plantilla.
- Las contraseñas se guardan encriptadas con bcrypt.
- La sesión usa un token JWT que vence a los 7 días.
