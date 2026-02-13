# Project Documentation

[![Staging Deployment Status](https://img.shields.io/endpoint?url=https%3A%2F%2Fforge.laravel.com%2Fsite-badges%2F94079fc7-1aeb-4dc2-baa7-2def0ecd7653%3Fdate%3D1%26label%3D1%26commit%3D1&style=for-the-badge)](https://forge.laravel.com/servers/853896/sites/2507559)
[![Production Deployment Status](https://img.shields.io/endpoint?url=https%3A%2F%2Fforge.laravel.com%2Fsite-badges%2Fc110c271-58ca-4c80-9c6f-979b537c1502%3Fdate%3D1%26label%3D1%26commit%3D1&style=for-the-badge)](https://forge.laravel.com/servers/865606/sites/2550478)

This project includes key documentation to help you work with Nuxt.js and manage packages. Below are links to the available documentation:

- [Nuxt.js Guide](./docs/nuxtjs.md)
- [Package Guide](./docs/package.md)

Refer to each section for more detailed information on setup and usage.

## 🚀 Modo Desarrollo

Este proyecto incluye un sistema de autenticación para el modo desarrollo que **restringe el acceso** al sitio mientras está en modo desarrollo, permitiendo solo a usuarios autorizados navegar por el sitio.

### Variables de Entorno Requeridas

Para activar el modo desarrollo, configura las siguientes variables en tu archivo `.env`:

```bash
# Activar modo desarrollo (restringe acceso)
DEV_MODE=true

# Credenciales de acceso (cambia estos valores por seguridad)
DEV_USERNAME=admin
DEV_PASSWORD=tu_contraseña_segura_aqui
```

### Cómo Funciona

1. **Activación**: Cuando `DEV_MODE=true`, el middleware global se activa y **restringe el acceso**
2. **Protección**: Todas las rutas (excepto `/dev`) requieren autenticación previa
3. **Bots**: Los motores de búsqueda y bots pueden acceder libremente al contenido
4. **Autenticación**: Los usuarios no autenticados son redirigidos a `/dev` para autenticarse
5. **Cookie**: Se crea una cookie `devmode` con un token de sesión válido
6. **Acceso**: Una vez autenticado, el usuario puede navegar libremente por todo el sitio

### Flujo de Autenticación

1. Usuario visita cualquier página del sitio
2. Si no está autenticado, es **redirigido automáticamente** a `/dev`
3. Usuario ingresa credenciales de desarrollo en el formulario
4. Las credenciales se validan contra las variables de entorno del servidor
5. Si son correctas, se crea una cookie de sesión segura
6. Usuario es redirigido al inicio y puede navegar libremente por todo el sitio

### Propósito del Modo Desarrollo

- **Restringir acceso temporal** al sitio durante desarrollo
- **Proteger contenido** mientras se realizan cambios o pruebas
- **Permitir acceso solo a usuarios autorizados** (desarrolladores, testers, etc.)
- **Mantener SEO intacto** - los motores de búsqueda siempre pueden acceder
- **Control de acceso granular** mediante credenciales seguras

### Seguridad

- Las credenciales se almacenan **solo en variables de entorno del servidor**
- **Nunca se envían al cliente** ni se exponen en el código
- Se genera un **token de sesión único y seguro** para cada login
- La cookie tiene configuración segura (httpOnly: false para desarrollo, secure: true para producción)
- **Acceso completamente restringido** para usuarios no autenticados

### Desactivar el Modo Desarrollo

Para desactivar el modo desarrollo y permitir acceso libre, simplemente cambia:

```bash
DEV_MODE=false
```

O elimina la variable del archivo `.env`.

### Notas Importantes

- Este sistema **restringe el acceso** al sitio, no lo "habilita"
- **Solo debe usarse en entornos de desarrollo** donde se necesita control de acceso
- **Nunca uses credenciales débiles** - este es un sistema de seguridad
- Los motores de búsqueda **siempre pueden acceder al contenido** (SEO no se ve afectado)
- La cookie de sesión expira en **7 días** por seguridad
- **Contacta al administrador** si necesitas acceso y no tienes credenciales

**Last updated:** October 21, 2024
