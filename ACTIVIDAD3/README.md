# Actividad 3 — Login con hashing y base de datos

Continuación de `clase20-login-hashing-bd` del profesor: https://github.com/asennies21/aw2-cna-2026s2/tree/main/clase20-login-hashing-bd

Consigna: terminar el script que quedó trunco y subirlo a actividades para el martes 3/11.

## Qué se completó

- Registro con validación en el servidor y contraseña hasheada con bcryptjs (salt de 10 rondas).
- Consulta del usuario en PostgreSQL y comparación con `bcrypt.compare`, contemplando usuarios inexistentes.
- Generación de `nanoid(32)`, guardado en `usuarios.session_id` y envío del mismo valor en la cookie firmada.
- Middleware que lee `req.signedCookies.sesionId` y consulta la tabla antes de servir cualquier archivo de `/admin`.
- Cierre de sesión: borra el identificador de la tabla y la cookie. Un nuevo login reemplaza la sesión anterior.
- Secreto en variable de entorno, consultas parametrizadas y manejo de errores, sin imprimir contraseñas.

Se mantiene el modelo de la clase: una sesión por usuario, sin express-session. La cookie dura 24 horas; el ejercicio no implementa vencimiento del identificador en la base. En localhost se permite HTTP; en producción la cookie requiere HTTPS.

## Cómo ejecutarlo

Desde esta carpeta, con Node.js 20.19 o superior y PostgreSQL:

1. `npm install`
2. Copiar `.env.example` a `.env` y configurar las credenciales de la base. Completar `COOKIE_SECRET` con un secreto propio. Se puede generar con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
3. Si usás Docker: `docker compose up -d --build`. Crea la base y la tabla automáticamente al inicializar un volumen nuevo. Si ya tenés PostgreSQL: crear la base `admin` y ejecutar `__docker-pg/admin.sql` dentro de ella.
4. `npm start` (o `npm run dev`).
5. Abrir http://localhost:3000/login/, registrarse e ingresar. La contraseña debe tener al menos 8 caracteres y no superar 72 bytes UTF-8, límite de bcrypt.

No subir `.env` ni `node_modules` al repositorio.

## Pruebas

`npm test` ejecuta el flujo HTTP completo con una base PostgreSQL en memoria (`pg-mem`): registro, hash, duplicados, datos inválidos, usuario inexistente, contraseña incorrecta, sesión persistida, acceso protegido, cookies falsas o alteradas, reemplazo de sesión y cierre de sesión. Estas pruebas no requieren tener PostgreSQL instalado y no reemplazan la comprobación manual con PostgreSQL real.

Para comprobar manualmente: intentar abrir `/admin/` sin login, registrar un usuario, ingresar, revisar `password_hash` y `session_id` en la tabla y cerrar sesión. Después del cierre, `/admin/` vuelve a pedir login.
