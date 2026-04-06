import { IFlowSubscriptionResponse } from "../../../services/flow";

interface ProviderSubscriptionData {
  subscriptionId?: string;
  customerId?: string;
  planId?: string;
  status?: number;
  next_invoice_date?: string;
  [key: string]: unknown;
}

// Map Provider status to Strapi status - This might need to become more complex
// or passed as a callback if statuses vary significantly between providers.
const mapProviderStatusToStrapi = (
  providerName: string,
  providerStatus: number
): "active" | "cancelled" | "failed" | "pending" => {
  if (providerName === "flow") {
    switch (providerStatus) {
      case 1:
        return "active";
      case 2:
        return "active"; // Trial as active
      case 4:
        return "cancelled";
      case 0:
        return "pending";
      default:
        return "pending";
    }
  }
  // Add cases for other providers here
  // else if (providerName === 'stripe') { ... }
  console.warn(
    `Unknown provider or status mapping for ${providerName}, status: ${providerStatus}`
  );
  return "pending"; // Default fallback
};

/**
 * Saves or updates generic subscription data in the local Strapi database,
 * mapping from a specific provider's subscription response.
 * Uses the 'api::suscription.suscription' Content Type.
 *
 * @param userId The Strapi user ID.
 * @param providerName The name of the payment provider (e.g., 'flow', 'stripe').
 * @param providerSubscriptionData The subscription data object received from the provider API.
 * @returns The created or updated Strapi subscription entity.
 * @throws Throws an error if saving fails.
 */
export const saveSubscriptionData = async (
  userId: number | string,
  providerName: string,
  providerSubscriptionData: ProviderSubscriptionData
): Promise<unknown> => {
  const strapiApiId = "api::suscription.suscription";
  // Extract provider-specific IDs - requires knowing the structure or using a more generic input object
  // Assuming structure based on previous Flow example for now
  const providerSubId = providerSubscriptionData.subscriptionId;
  const providerCustId = providerSubscriptionData.customerId;
  const providerPlanId = providerSubscriptionData.planId;
  const providerStatus = providerSubscriptionData.status;
  const providerNextInvoice = providerSubscriptionData.next_invoice_date;

  if (
    !providerSubId ||
    !providerCustId ||
    !providerPlanId ||
    providerStatus === undefined
  ) {
    console.error(
      "Provider subscription data is missing required fields (subscriptionId, customerId, planId, status)",
      providerSubscriptionData
    );
    throw new Error("Incomplete provider subscription data.");
  }

  console.log(
    `Mapeando y guardando datos de suscripción de ${providerName} para usuario ${userId}, providerSubscriptionId: ${providerSubId}`
  );

  // Data mapping to generic Strapi fields
  const subscriptionDataToSave = {
    status: mapProviderStatusToStrapi(providerName, providerStatus),
    // amount: ???
    nextPaymentDate: providerNextInvoice || null,
    user: userId,
    providerData: {
      provider: providerName, // Use the parameter
      subscriptionId: providerSubId,
      customerId: providerCustId,
      planId: providerPlanId,
      // rawResponse: providerSubscriptionData
    },
  };

  try {
    // Find existing based on provider and providerSubscriptionId within the JSON field.
    const existing = await strapi.entityService.findMany(strapiApiId, {
      filters: {
        providerData: {
          subscriptionId: { $eq: providerSubId },
          provider: { $eq: providerName }, // Use the parameter
        },
      },
      limit: 1,
    });

    let savedSubscription: Record<string, unknown> | null = null;

    if (existing && existing.length > 0) {
      console.log(
        `Suscripción de ${providerName} ${providerSubId} ya existe (${existing[0].id}). Actualizando...`
      );
      savedSubscription = (await strapi.entityService.update(
        strapiApiId as Parameters<typeof strapi.entityService.update>[0],
        existing[0].id,
        {
          data: subscriptionDataToSave as unknown as Parameters<
            typeof strapi.entityService.update
          >[2]["data"],
        }
      )) as Record<string, unknown>;
    } else {
      console.log(
        `Creando nueva entrada para suscripción de ${providerName} ${providerSubId}...`
      );
      savedSubscription = (await strapi.entityService.create(
        strapiApiId as Parameters<typeof strapi.entityService.create>[0],
        {
          data: subscriptionDataToSave as unknown as Parameters<
            typeof strapi.entityService.create
          >[1]["data"],
        }
      )) as Record<string, unknown>;
    }

    console.log(
      `Datos de suscripción genéricos (${providerName}) guardados/actualizados en Strapi:`,
      savedSubscription
    );
    return savedSubscription;
  } catch (error: unknown) {
    console.error(
      `Error al guardar datos de suscripción genéricos (${providerName}) ${providerSubId} en Strapi:`,
      error
    );
    throw new Error(
      `Error saving generic subscription data: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
