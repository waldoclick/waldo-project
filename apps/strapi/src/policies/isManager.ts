import { Context } from "koa";

export default (ctx: Context) => {
  const user = ctx.state.user as Record<string, unknown>;
  const role = user?.role as Record<string, unknown> | undefined;
  return ((role?.name as string) ?? "").toLowerCase() === "manager";
};
