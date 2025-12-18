This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

To configure the project, create a `.env.local` file in the project root with the following variables:

```bash
# Strapi Configuration
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

# Public Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# Authentication Configuration
NEXT_PUBLIC_AUTH_COOKIE_NAME=strapi_token

# Optional: API Token for public content (if needed)
# STRAPI_API_TOKEN=your_api_token_here
```

### Variable Descriptions

- **`NEXT_PUBLIC_STRAPI_URL`**: URL of your Strapi instance
- **`NEXT_PUBLIC_SITE_URL`**: URL of your public site
- **`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`**: Google reCAPTCHA site key
- **`NEXT_PUBLIC_AUTH_COOKIE_NAME`**: Authentication cookie name (default: `strapi_token`)
- **`STRAPI_API_TOKEN`**: Strapi API token for public content (optional)

## Autenticación

### Vistas de Autenticación

Se han creado las vistas de autenticación con un layout independiente usando shadcn/ui. Las vistas incluyen:

- **Login**: Inicio de sesión con email y contraseña
- **Recuperar contraseña**: Envío de email para restablecer contraseña
- **Cambiar contraseña**: Formulario para establecer nueva contraseña

### Rutas disponibles

#### `/auth`

- Redirige automáticamente a `/login`

#### `/login`

- Formulario de inicio de sesión
- Campos: email y contraseña
- Enlace a recuperar contraseña
- Validación de campos requeridos

#### `/auth/forgot-password`

- Formulario para enviar email de recuperación
- Campo: email
- Confirmación de envío exitoso
- Enlace de vuelta al login

#### `/auth/reset-password`

- Formulario para cambiar contraseña
- Campos: nueva contraseña y confirmación
- Validación de coincidencia de contraseñas
- Validación de longitud mínima (8 caracteres)
- Confirmación de cambio exitoso

### Características de Autenticación

#### Layout independiente

- Diseño centrado con gradiente de fondo
- Card con sombra y bordes redondeados
- Responsive design
- Soporte para modo oscuro

#### Componentes utilizados

- **Button**: Botones con diferentes variantes
- **Input**: Campos de entrada con iconos
- **Label**: Etiquetas para formularios
- **Card**: Contenedores para formularios
- **Lucide React**: Iconos modernos

#### Funcionalidades

- Mostrar/ocultar contraseñas
- Estados de carga
- Validación de formularios
- Navegación entre páginas
- Mensajes de confirmación

### Estructura de archivos de autenticación

```
src/app/auth/
├── layout.tsx          # Layout independiente para auth
├── page.tsx            # Redirección a login
├── login/
│   └── page.tsx        # Página de login
├── forgot-password/
│   └── page.tsx        # Recuperar contraseña
└── reset-password/
    └── page.tsx        # Cambiar contraseña
```

## Reglas de Anuncios

### Estados de Anuncios

Los anuncios pueden tener los siguientes estados basados en reglas de negocio específicas:

#### **Pendientes**

- `active = false`
- `remaining_days = duration_days` (días restantes iguales a días de duración)
- `remaining_days > 0`
- `duration_days > 0`
- `rejected = false`

#### **Activos**

- `active = true`
- `remaining_days > 0`
- `rejected = false`

#### **Archivados**

- `active = false`
- `remaining_days = 0`
- `rejected = false`

#### **Rechazados**

- `rejected = true`

### Filtros por Tab

- **Pendientes**: Muestra anuncios que están esperando aprobación
- **Activos**: Muestra anuncios que están publicados y tienen días restantes
- **Archivados**: Muestra anuncios que han agotado sus días de publicación
- **Rechazados**: Muestra anuncios que han sido rechazados por moderación

### Ordenamiento

- **Pendientes**: Ordenados por fecha de creación (más antiguos primero) para priorizar los más retrasados
- **Otros tabs**: Ordenados por fecha de creación (más nuevos primero)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Electron Desktop App

This project supports both web and desktop applications using Electron.

### Development

#### Web Development (Default)

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

#### Desktop Development

1. **Terminal 1** - Start Next.js server:

```bash
yarn dev
```

2. **Terminal 2** - Start Electron app:

```bash
yarn electron:dev
```

### Production Builds

#### Web Build

```bash
yarn build
yarn start
```

#### Desktop Build (Windows)

```bash
yarn electron:dist
```

This creates a Windows installer in the `dist/` folder.

### Environment Variables for Electron

Create `.env` file for development:

```bash
API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Create `.env.production` file for production:

```bash
API_URL=https://tu-api-produccion.com
NEXT_PUBLIC_API_URL=https://tu-api-produccion.com
```

### Available Scripts

- `yarn dev` - Web development server
- `yarn build` - Web production build
- `yarn start` - Web production server
- `yarn electron:dev` - Desktop development (requires Next.js running)
- `yarn electron:dist` - Desktop production build
- `yarn web:build` - Web build only
- `yarn web:start` - Web production server

### Notes

- The app automatically detects if it's running in Electron or web browser
- Electron uses static export for production builds
- Web version uses standard Next.js server-side rendering
- Both versions share the same codebase and environment variables

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
