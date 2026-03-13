/**
 * Auth Verify Controller
 *
 * Exposes POST /api/auth/verify-code and POST /api/auth/resend-code as a standard
 * Strapi content API. These cannot be registered via the users-permissions plugin extension
 * (plugin.routes["content-api"] is a factory function; pushed routes are ignored when the
 * factory is invoked by instantiateRouterInputs during server bootstrap).
 */

import {
  verifyCode,
  resendCode,
} from "../../../extensions/users-permissions/controllers/authController";
import { Context } from "koa";

export default {
  verifyCode: async (ctx: Context) => verifyCode(ctx),
  resendCode: async (ctx: Context) => resendCode(ctx),
};
