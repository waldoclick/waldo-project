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
    (e._sentryDebugIds[s] = "e915780d-6ce8-4214-9760-5cdaf123590a"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-e915780d-6ce8-4214-9760-5cdaf123590a"));
} catch (e) {}
import { Resvg as e } from "@resvg/resvg-js";
const s = { initWasmPromise: Promise.resolve(), Resvg: e };
export { s as default };
//# sourceMappingURL=node.mjs.map
