# Strapi – API y CMS de Waldo

API y panel de administración (Strapi v5) del proyecto Waldo.

## Desarrollo

```bash
yarn dev
```

Abre [http://localhost:1337](http://localhost:1337) para el admin y la API.

## Reglas de Anuncios

### Estados de Anuncios

Los anuncios pueden tener los siguientes estados. Las condiciones coinciden con los filtros de los endpoints del servicio (`pendingAds`, `activeAds`, `archivedAds`, `bannedAds`, `rejectedAds`, `abandonedAds`) y con el `status` calculado en `findOne`/`findMany`.

#### **Pendientes**

- `active = false`
- `banned = false`
- `rejected = false`
- `remaining_days > 0`
- `ad_reservation != null` (tienen reserva de pago; se pueden aprobar o rechazar)

#### **Activos**

- `active = true`
- `banned = false`
- `rejected = false`
- `remaining_days > 0`

#### **Archivados (expirados)**

- `active = false`
- `banned = false`
- `rejected = false`
- `remaining_days = 0`

#### **Baneados**

- `banned = true`

#### **Rechazados**

- `rejected = true`

#### **Abandonados**

- `active = false`
- `banned = false`
- `rejected = false`
- `ad_reservation = null` (sin reserva; no se pueden aprobar ni rechazar)

En `findOne`/`findMany` el `status` **"abandoned"** se asigna además cuando `remaining_days > 0` e `is_paid = true` (anuncio marcado como pagado pero sin reserva asignada).

### Filtros por Tab

- **Pendientes**: Anuncios con reserva esperando aprobación
- **Activos**: Anuncios publicados con días restantes
- **Archivados**: Anuncios que agotaron sus días de publicación (expirados)
- **Baneados**: Anuncios baneados por el propietario o administrador
- **Rechazados**: Anuncios rechazados por moderación
- **Abandonados**: Anuncios sin reserva (pagado pero no completaron la reserva)

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

## Documentación

- [Strapi Documentation](https://docs.strapi.io)
