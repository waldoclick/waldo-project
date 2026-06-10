import { b3 as d, cw as n } from "./BK8sApmn.js";
try {
  let e =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    s = new e.Error().stack;
  s &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[s] = "63da9f32-8ca6-45a2-b863-825862d44480"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-63da9f32-8ca6-45a2-b863-825862d44480"));
} catch {}
async function r(e) {
  const s = d();
  if (!e) throw n({ statusCode: 404, message: "Missing documentId" });
  try {
    const t = await s(`payments/thankyou/${e}`, { method: "GET" });
    if (!t.data) throw n({ statusCode: 404, message: "Orden no encontrada" });
    return t.data;
  } catch (t) {
    const a = t.statusCode || t.status || 404;
    throw n({ statusCode: a, message: "Orden no encontrada" });
  }
}
export { r as u };
//# sourceMappingURL=CwEpj4fO.js.map
