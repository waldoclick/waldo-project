try {
  let e =
      "undefined" != typeof global
        ? global
        : "undefined" != typeof globalThis
          ? globalThis
          : "undefined" != typeof self
            ? self
            : {},
    s = new e.Error().stack;
  s &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[s] = "7e3fda5b-773b-4708-8b3e-eac36dc952c8"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-7e3fda5b-773b-4708-8b3e-eac36dc952c8"));
} catch (e) {}
import e from "satori";
const s = { initWasmPromise: Promise.resolve(), satori: e };
export { s as default };
//# sourceMappingURL=node2.mjs.map
