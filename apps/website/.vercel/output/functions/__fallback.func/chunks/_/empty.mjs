try {
  let e =
      "undefined" != typeof global
        ? global
        : "undefined" != typeof globalThis
          ? globalThis
          : "undefined" != typeof self
            ? self
            : {},
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "55c50576-e8cf-45cb-8170-ff0273a9d40e"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-55c50576-e8cf-45cb-8170-ff0273a9d40e"));
} catch (e) {}
const e = Object.freeze(Object.create(null, { __mock__: { get: () => !0 } }));
export { e as default };
//# sourceMappingURL=empty.mjs.map
