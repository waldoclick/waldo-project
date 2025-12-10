# Zoho CRM Service

Este servicio proporciona una integración con la API de Zoho CRM para gestionar leads y seguimientos.

## Configuración

Para utilizar este servicio, necesitas configurar las siguientes variables de entorno:

```env
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_API_URL=https://www.zohoapis.com
```

## Uso

```typescript
import { zohoService, ZohoLead, ZohoFollowUp } from "./services/zoho";

// Crear un nuevo lead
const lead: ZohoLead = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  company: "Example Corp",
};

const createdLead = await zohoService.createLead(lead);

// Crear un seguimiento
const followUp: ZohoFollowUp = {
  leadId: createdLead.id!,
  notes: "Initial contact made",
  status: "pending",
  scheduledDate: new Date(),
};

const createdFollowUp = await zohoService.createFollowUp(followUp);
```

## Funcionalidades

### Leads

- Crear leads
- Actualizar leads
- Obtener información de un lead

### Seguimientos

- Crear seguimientos
- Actualizar seguimientos
- Obtener seguimientos de un lead

## Manejo de Errores

El servicio maneja automáticamente:

- Autenticación y renovación de tokens
- Errores de red
- Errores de la API de Zoho

## Dependencias

- axios: Para realizar peticiones HTTP
- dotenv: Para manejar variables de entorno
