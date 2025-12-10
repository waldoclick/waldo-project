import { Context } from "koa";
import {
  FlowService,
  flowServiceFactory,
  IFlowSubscriptionRequest,
  IFlowSubscriptionResponse,
  IFlowCustomerCreateRequest,
} from "../../../services/flow";
import { getCurrentUser, updateUserFlowData } from "../utils/user.utils";
import { IFlowInvoice } from "../../../services/flow";

// Helper para dividir apellido
const splitLastName = (
  lastName: string | undefined
): { firstLastName: string; secondLastName: string } => {
  if (!lastName) return { firstLastName: "", secondLastName: "" };
  const parts = lastName.trim().split(/\s+/);
  const firstLastName = parts[0] || "";
  const secondLastName = parts.slice(1).join(" ") || "";
  return { firstLastName, secondLastName };
};

export class ProService {
  constructor() {
    // Constructor remains empty or for other dependencies
  }

  /**
   * Creates a Pro subscription using Flow and returns the payment link.
   * @param ctx Koa Context
   * @returns Object containing the url and token for Flow payment.
   */
  async createSubscription(
    ctx: Context
  ): Promise<{ url: string; token: string }> {
    try {
      // 1. Get Strapi User
      const user = await getCurrentUser(ctx);
      console.log("Usuario obtenido para suscripción Pro:", {
        userId: user?.id,
      });

      if (!user || !user.id || !user.email) {
        console.error(
          "Error: No se pudo obtener el usuario autenticado o falta email."
        );
        ctx.throw(401, "Usuario no autenticado o email no encontrado");
      }

      const flowService = flowServiceFactory(ctx.strapi);
      let customerId: string | undefined = undefined;
      // Define explicitly that we expect flow_customer_data or null/undefined
      let flowCustomerData = (user as any).flow_customer_data; // Cast to any or add to UserData interface

      // 2. Check if Flow customer data exists and has customerId
      if (flowCustomerData && flowCustomerData.customerId) {
        console.log(
          "Flow customerId encontrado en el usuario de Strapi:",
          flowCustomerData.customerId
        );
        customerId = flowCustomerData.customerId;
      } else {
        console.log(
          "flow_customer_data no encontrado o incompleto en el usuario. Creando cliente en Flow..."
        );

        // 4a. Create customer in Flow if not found
        // Construct name carefully, handling potential null/undefined values
        const customerName =
          [user.firstname, user.lastname].filter(Boolean).join(" ").trim() ||
          user.email; // Use email as fallback

        const createCustomerPayload: IFlowCustomerCreateRequest = {
          name: customerName,
          email: user.email,
          externalId: String(user.id), // Use Strapi user ID as externalId
        };

        console.log(
          "Payload para crear cliente en Flow:",
          createCustomerPayload
        );
        const customerResponse = await flowService.createCustomer(
          createCustomerPayload
        );
        console.log(
          "Respuesta de flowService.createCustomer:",
          customerResponse
        );

        if (!customerResponse || !customerResponse.customerId) {
          console.error(
            "Error: No se pudo obtener customerId después de crear el cliente en Flow."
          );
          ctx.throw(500, "Error al crear el cliente en el sistema de pago.");
        }

        customerId = customerResponse.customerId;
        flowCustomerData = customerResponse; // Store the newly created data

        // 4b. Save the *entire* Flow customer response object to Strapi user
        try {
          await updateUserFlowData(user.id, flowCustomerData); // Use the variable holding the data
          console.log(
            "Datos del cliente de Flow guardados en el usuario de Strapi."
          );
        } catch (updateError: any) {
          // Log the error but potentially continue, as we have the customerId needed for subscription
          console.error(
            "Error al guardar flow_customer_data en Strapi (continuando con la suscripción):",
            updateError.message
          );
        }
      }

      if (!customerId) {
        console.error(
          "Error fatal: No se pudo obtener un customerId de Flow después de intentar crearlo."
        );
        ctx.throw(500, "No se pudo determinar el ID de cliente para el pago.");
      }

      // --- NEW: Check for existing active subscription ---
      const planId = process.env.FLOW_PLAN_ID;
      if (!planId) {
        console.error(
          "Error: FLOW_PLAN_ID no está configurado en las variables de entorno."
        );
        ctx.throw(500, "Configuración de plan de Flow incompleta.");
      }
      console.log(
        `Verificando suscripciones existentes para customerId: ${customerId}, planId: ${planId}`
      );
      const existingSubscriptions = await flowService.getCustomerSubscriptions(
        customerId
      );

      const activeSubscription = existingSubscriptions.data.find(
        (sub) => sub.planId === planId && (sub.status === 1 || sub.status === 2) // 1: Activa, 2: En período de trial
      );

      if (activeSubscription) {
        console.warn(
          `El usuario ${user.id} ya tiene una suscripción activa o en trial (${activeSubscription.subscriptionId}) para el plan ${planId}.`
        );
        // Consider returning specific details or just an error
        ctx.throw(409, "Ya tienes una suscripción activa para este plan.", {
          subscriptionId: activeSubscription.subscriptionId,
          status: activeSubscription.status,
        });
      }
      console.log(
        "No se encontraron suscripciones activas para este plan y cliente. Procediendo a crear..."
      );
      // --- END NEW CHECK ---

      // 5. Create Subscription (Only if no active one was found)
      console.log(
        `Procediendo a crear suscripción con planId: ${planId}, customerId: ${customerId}`
      );
      const subscriptionPayload: IFlowSubscriptionRequest = {
        planId,
        customerId: customerId,
      };
      const subscriptionResult = await flowService.createSubscription(
        subscriptionPayload
      );
      console.log(
        "Respuesta de FlowService.createSubscription:",
        subscriptionResult
      );

      // --- NEW STEPS: Get Payment Link from First Invoice ---

      // 6. Extract first invoice ID
      if (
        !subscriptionResult.invoices ||
        !subscriptionResult.invoices[0] ||
        !subscriptionResult.invoices[0].id
      ) {
        console.error(
          "Error: No se encontró el ID de la primera factura en la respuesta de createSubscription.",
          subscriptionResult
        );
        ctx.throw(
          500,
          "No se pudo obtener la información de pago inicial de la suscripción."
        );
      }
      const firstInvoiceId = subscriptionResult.invoices[0].id;
      console.log(
        `Obteniendo detalles de la factura inicial con ID: ${firstInvoiceId}`
      );

      // 7. Get Invoice details to find paymentLink
      const invoiceDetails = await flowService.getInvoice(firstInvoiceId);
      console.log("Respuesta de flowService.getInvoice:", invoiceDetails);

      if (!invoiceDetails.paymentLink) {
        console.error(
          "Error: No se encontró paymentLink en la respuesta de getInvoice.",
          invoiceDetails
        );
        ctx.throw(
          500,
          "No se pudo obtener el enlace de pago para la suscripción."
        );
      }

      // 8. Parse paymentLink to get URL and Token
      const paymentLink = invoiceDetails.paymentLink;
      console.log(`PaymentLink obtenido: ${paymentLink}`);
      let url = "";
      let token = "";
      try {
        const urlObject = new URL(paymentLink);
        url = `${urlObject.protocol}//${urlObject.host}${urlObject.pathname}`;
        token = urlObject.searchParams.get("token") || "";
        if (!token) {
          throw new Error(
            "Token no encontrado en los parámetros de paymentLink."
          );
        }
      } catch (parseError: any) {
        console.error(
          "Error al parsear el paymentLink:",
          paymentLink,
          parseError
        );
        ctx.throw(500, "Error interno al procesar el enlace de pago.");
      }

      // 9. Return the final URL and Token
      console.log(`Retornando URL: ${url}, Token: ${token}`);
      return { url, token };
    } catch (error: any) {
      console.error(
        "Error en ProService.createSubscription (Flow Subscription):",
        {
          message: error.message,
          status: error.status,
          details: error.error || error.details,
        }
      );
      const status = typeof error.status === "number" ? error.status : 500;
      const message =
        typeof error.message === "string"
          ? error.message
          : "Error al crear la suscripción Pro con Flow";
      const expose = error.expose === true;
      const errorDetails = error.error || error.details || error;
      ctx.throw(status, message, { expose, error: errorDetails });
    }
  }
}
