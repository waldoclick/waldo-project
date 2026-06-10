try {
  let e =
      "undefined" != typeof global
        ? global
        : "undefined" != typeof globalThis
          ? globalThis
          : "undefined" != typeof self
            ? self
            : {},
    d = new e.Error().stack;
  d &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[d] = "c92e2449-7921-4c22-9b1d-8a4eb70c6f24"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-c92e2449-7921-4c22-9b1d-8a4eb70c6f24"));
} catch (e) {}
const e = "";
export { e as template };
//# sourceMappingURL=_virtual_spa-template.mjs.map
