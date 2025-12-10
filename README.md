# Waldo Project

Monorepo que contiene las aplicaciones principales de Waldo: Dashboard (Next.js), Website (Nuxt.js) y API (Strapi).

## 📁 Estructura del Proyecto

```
waldo-project/
├── apps/
│   ├── dashboard/     # Next.js 15 - Panel de administración
│   ├── website/       # Nuxt.js 4 - Sitio web público
│   └── strapi/        # Strapi v5 - API y CMS
├── package.json       # Configuración del monorepo
├── turbo.json        # Configuración de Turbo
└── .codacy.yaml      # Configuración de Codacy
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- Yarn 1.22.22
- Git

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd waldo-project

# Instalar dependencias
yarn install
```

### Desarrollo

```bash
# Iniciar todas las apps en modo desarrollo
yarn dev
```

Esto iniciará:
- **Strapi**: http://localhost:1337
- **Website**: http://localhost:3000
- **Dashboard**: http://localhost:3001

## 📦 Aplicaciones

### Dashboard (`apps/dashboard`)

Panel de administración construido con Next.js 15, App Router y TypeScript.

#### Características

- Autenticación con Strapi
- Gestión de anuncios, categorías, usuarios, reservas, ventas
- Soporte para aplicación de escritorio con Electron
- UI con shadcn/ui y Tailwind CSS

#### Scripts

```bash
cd apps/dashboard

# Desarrollo web
yarn dev

# Desarrollo Electron (requiere Next.js corriendo)
yarn electron:dev

# Build producción web
yarn build
yarn start

# Build Electron (Windows)
yarn electron:dist
```

#### Variables de Entorno

```bash
# Strapi Configuration
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

# Public Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# Authentication Configuration
NEXT_PUBLIC_AUTH_COOKIE_NAME=strapi_token
```

### Website (`apps/website`)

Sitio web público construido con Nuxt.js 4.

#### Características

- SSR/SSG con Nuxt.js
- Modo desarrollo con restricción de acceso
- SEO optimizado con `@nuxtjs/seo`
- Generación automática de sitemap

#### Modo Desarrollo (Restricción de Acceso)

El sitio incluye un sistema de autenticación para restringir el acceso durante desarrollo:

```bash
# Variables de entorno
DEV_MODE=true
DEV_USERNAME=admin
DEV_PASSWORD=tu_contraseña_segura_aqui
```

**Funcionamiento:**
- Cuando `DEV_MODE=true`, todas las rutas (excepto `/dev`) requieren autenticación
- Los bots y motores de búsqueda pueden acceder libremente (SEO intacto)
- Los usuarios no autenticados son redirigidos a `/dev` para autenticarse
- Se crea una cookie de sesión segura válida por 7 días

#### Scripts

```bash
cd apps/website

# Desarrollo
yarn dev

# Build producción
yarn build

# Preview build
yarn preview
```

### Strapi (`apps/strapi`)

API y CMS construido con Strapi v5.

#### Características

- API REST y GraphQL
- Panel de administración
- Sistema de autenticación
- Gestión de contenido

#### Scripts

```bash
cd apps/strapi

# Desarrollo
yarn develop

# Build producción
yarn build
yarn start
```

## 📋 Reglas de Negocio

### Estados de Anuncios

Los anuncios pueden tener los siguientes estados:

#### **Pendientes**
- `active = false`
- `remaining_days = duration_days`
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

### Filtros y Ordenamiento

- **Pendientes**: Ordenados por fecha de creación (más antiguos primero) para priorizar los más retrasados
- **Otros tabs**: Ordenados por fecha de creación (más nuevos primero)

### Sistema de Pagos

#### PackType

Define el tipo de pack para publicar un anuncio:

- **`"free"`**: Utiliza créditos gratuitos de packs disponibles
- **`"paid"`**: Utiliza créditos pagados disponibles
- **`number`**: ID de un pack específico que el usuario desea comprar

#### FeaturedType

Define si un anuncio aparece como destacado:

- **`"free"`**: Utiliza créditos gratuitos de featured disponibles
- **`true`**: Activa el featured y requiere pago inmediato
- **`false`**: No activa el featured

El sistema valida automáticamente la disponibilidad de créditos según el tipo seleccionado.

## 🔧 Scripts del Monorepo

```bash
# Desarrollo (inicia todas las apps)
yarn dev

# Build todas las apps
yarn build

# Iniciar en producción
yarn start

# Linting
yarn lint

# Formateo
yarn format

# Tests
yarn test

# Análisis de código con Codacy
yarn codacy
```

## 🔐 Autenticación

### Dashboard

El dashboard incluye un sistema de autenticación completo con:

- **Login**: Inicio de sesión con email y contraseña
- **Recuperar contraseña**: Envío de email para restablecer contraseña
- **Cambiar contraseña**: Formulario para establecer nueva contraseña

**Rutas:**
- `/auth` → Redirige a `/login`
- `/login` → Formulario de inicio de sesión
- `/auth/forgot-password` → Recuperar contraseña
- `/auth/reset-password` → Cambiar contraseña

### Website

Sistema de restricción de acceso para modo desarrollo (ver sección [Modo Desarrollo](#modo-desarrollo-restricción-de-acceso)).

## 🛠️ Herramientas

### Turbo

El monorepo utiliza [Turbo](https://turbo.build/) para:
- Ejecutar tareas en paralelo
- Cachear builds
- Gestionar dependencias entre apps

### Husky

Git hooks configurados para ejecutar:
- Linting y formateo antes de commits
- Type checking para dashboard
- Validaciones específicas por app

### Codacy

Análisis de código unificado para todas las apps:
- ESLint
- Stylelint
- Detección de duplicación
- Análisis de complejidad

## 🚢 Deployment

### Laravel Forge

Cada app se despliega independientemente en Forge usando `git sparse-checkout` para descargar solo los archivos necesarios.

**Estructura de deployment:**
- Cada app tiene su propio sitio en Forge
- Se usa `git sparse-checkout` para descargar solo la carpeta de la app
- El contenido se mueve a la raíz del release
- PM2 gestiona los procesos

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Nuxt.js Documentation](https://nuxt.com/docs)
- [Strapi Documentation](https://docs.strapi.io)
- [Turbo Documentation](https://turbo.build/repo/docs)

## 📝 Notas

- El dashboard soporta tanto web como aplicación de escritorio con Electron
- Website genera automáticamente el sitemap en el build
- Strapi debe construirse antes que las otras apps (dependencia en turbo.json)
- Todas las apps comparten el mismo repositorio Git pero se despliegan independientemente

