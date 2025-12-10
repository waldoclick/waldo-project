export interface IFlowConfig {
  apiKey: string;
  secretKey: string;
  apiBaseUrl: string;
  // environment?: 'sandbox' | 'production';
}

// Interface for the data required to create a Flow payment order
export interface IFlowPaymentOrderRequest {
  commerceOrder: string; // Unique order ID from your system
  subject: string; // Payment subject/description
  amount: number; // Amount in CLP
  email: string; // Payer's email
  urlConfirmacion: string; // Your backend URL for Flow confirmation
  urlRetorno: string; // Your frontend URL for redirecting the user
  // Add optional parameters as needed based on Flow docs
  // optional?: Record<string, any>;
  // paymentMethod?: number; // Specific payment method ID if needed
}

// Interface for the response from creating a payment order
export interface IFlowPaymentOrderResponse {
  url: string; // URL to redirect the user to for payment
  token: string; // Unique token for this payment attempt
  flowOrder: number; // Flow's internal order number
}

// Interface for the response when getting payment status
export interface IFlowPaymentStatusResponse {
  flowOrder: number;
  commerceOrder: string;
  requestDate: string;
  status: number; // Payment status code (e.g., 1=PENDIENTE, 2=PAGADA, 3=RECHAZADA, 4=ANULADA)
  subject: string;
  currency: string;
  amount: string; // Amount as string
  payer: string; // Payer's email
  optional?: Record<string, any>;
  pending_info?: {
    media: string;
    date: string;
  };
  paymentData?: {
    date: string;
    media: string; // Payment method name
    fee: string;
    balance: string;
    transferDate: string;
  };
  merchantId?: string;
}

// Add other Flow-specific types and interfaces here as needed
// e.g., interface IFlowPaymentOrderRequest { ... }
// e.g., interface IFlowPaymentStatusResponse { ... }

// --- Subscription Interfaces ---

export interface IFlowSubscriptionRequest {
  planId: string;
  customerId: string;
  subscription_start?: string; // yyyy-mm-dd
  couponId?: number;
  trial_period_days?: number;
  periods_number?: number;
}

// Based on the 200 OK Response Schema provided
export interface IFlowSubscriptionResponse {
  subscriptionId: string;
  planId: string;
  plan_name: string;
  customerId: string;
  created: string; // yyyy-mm-dd hh:mm.ss
  subscription_start: string; // yyyy-mm-dd hh:mm.ss
  subscription_end: string | null; // yyyy-mm-dd hh:mm:ss or null
  period_start: string; // yyyy-mm-dd hh:mm.ss
  period_end: string; // yyyy-mm-dd hh:mm.ss
  next_invoice_date: string; // yyyy-mm-dd hh:mm.ss
  trial_period_days: number;
  trial_start: string; // yyyy-mm-dd hh:mm.ss
  trial_end: string; // yyyy-mm-dd hh:mm.ss
  cancel_at_period_end: 0 | 1;
  cancel_at: string | null;
  periods_number: number;
  days_until_due: number;
  status: 0 | 1 | 2 | 4; // 0: Inactivo, 1: Activa, 2: Trial, 4: Cancelada
  discount_balance: string;
  newPlanId: number | null;
  new_plan_scheduled_change_date: string | null;
  in_new_plan_next_attempt_date: string | null;
  morose: 0 | 1 | 2; // 0: Pagados, 1: Vencidos, 2: Pendientes
  discount?: any; // Define Discount interface if needed
  invoices?: any[]; // Define Invoice interface if needed
}

// --- Customer Interfaces ---

export interface IFlowCustomerCreateRequest {
  name: string;
  email: string;
  externalId: string; // Your internal user ID
}

// Based on the 200 OK Response Schema provided
export interface IFlowCustomerCreateResponse {
  customerId: string;
  created: string; // yyyy-mm-dd hh:mm:ss
  email: string;
  name: string;
  pay_mode: "auto" | "manual";
  creditCardType: string | null;
  last4CardDigits: string | null;
  externalId: string;
  status: 0 | 1; // 0: Eliminado, 1: Activo
  registerDate: string | null; // yyyy-mm-dd hh:mm:ss or null
}

// --- Invoice Interfaces ---

// Based on the 200 OK Response Schema for GET /invoice/get
export interface IFlowInvoice {
  id: number;
  subscriptionId: string | null;
  customerId: string;
  created: string; // yyyy-mm-dd hh:mm:ss
  subject: string;
  currency: string;
  amount: number;
  period_start: string | null; // yyyy-mm-dd hh:mm:ss or null
  period_end: string | null; // yyyy-mm-dd hh:mm:ss or null
  attemp_count: number;
  attemped: 0 | 1;
  next_attemp_date: string | null; // yyyy-mm-dd hh:mm:ss or null
  due_date: string | null; // yyyy-mm-dd hh:mm:ss or null
  status: number; // Define specific statuses if known (e.g., 0: Pending, 1: Paid, 2: Failed, 3: Cancelled?)
  error: number | null;
  errorDate: string | null; // yyyy-mm-dd hh:mm:ss or null
  errorDescription: string | null;
  items?: any[]; // Define Item interface if needed
  payment?: IFlowPaymentStatusResponse | null; // Reusing payment status interface, needs verification
  outsidePayment?: {
    date: string; // yyyy-mm-dd
    comment: string | null;
  } | null;
  paymentLink: string | null; // The crucial link we need!
  chargeAttemps?: any[]; // Define ChargeAttempt interface if needed
}

// --- Generic Paginated Response ---
// Based on the docs for paginated lists
export interface IFlowPaginatedResponse<T> {
  total: number;
  hasMore: 0 | 1;
  data: T[];
}
