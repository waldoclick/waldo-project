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

## Autenticación

### Vistas de Autenticación

Se han creado las vistas de autenticación con un layout independiente usando shadcn/ui. Las vistas incluyen:

- **Login**: Inicio de sesión con email y contraseña
- **Recuperar contraseña**: Envío de email para restablecer contraseña
- **Cambiar contraseña**: Formulario para establecer nueva contraseña

### Rutas disponibles

#### `/auth`

- Redirige automáticamente a `/auth/login`

#### `/auth/login`

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

## Sistema de Pagos

### Tipos de Pack y Featured

El sistema de pagos utiliza tipos específicos para gestionar diferentes modalidades de pago y activación de características premium:

#### PackType (`PackType`)

Define el tipo de pack que se utilizará para publicar un anuncio:

- **`"free"`**: Utiliza créditos gratuitos de packs disponibles del usuario
- **`"paid"`**: Utiliza créditos pagados disponibles del usuario
- **`number`**: Representa el ID de un pack específico que el usuario desea comprar
- **Nota**: Los valores `true` y `false` están presentes en el tipo pero no se utilizan actualmente

#### FeaturedType (`FeaturedType`)

Define si un anuncio debe aparecer como destacado:

- **`"free"`**: Utiliza créditos gratuitos de featured disponibles del usuario
- **`true`**: Activa el featured y requiere pago inmediato
- **`false`**: No activa el featured

### Lógica de Validación

El sistema valida automáticamente la disponibilidad de créditos según el tipo seleccionado:

- Para packs o featured gratuitos: Verifica que el usuario tenga créditos gratuitos disponibles
- Para packs o featured pagados: Verifica que el usuario tenga créditos pagados disponibles
- Para packs específicos (número): Valida que el pack existe y calcula el monto a pagar
- Para featured `true`: Calcula el costo del featured y procesa el pago

### Interfaces Relacionadas

```typescript
interface Details {
  pack: PackType;
  featured: FeaturedType;
  is_invoice: boolean;
}
```

Esta interfaz encapsula los detalles de configuración del anuncio para su publicación.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
