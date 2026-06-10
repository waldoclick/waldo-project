import "./BK8sApmn.js";
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
    n = new e.Error().stack;
  n &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[n] = "c0f91e0e-1410-4b78-9001-b98c8977d825"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-c0f91e0e-1410-4b78-9001-b98c8977d825"));
} catch {}
const r = [
  "login",
  "registro",
  "blog",
  "anuncios",
  "anunciar",
  "contacto",
  "cuenta",
  "pagar",
  "pro",
  "packs",
  "sitemap",
  "onboarding",
  "recuperar-contrasena",
  "restablecer-contrasena",
  "preguntas-frecuentes",
  "condiciones-de-uso",
  "politicas-de-privacidad",
  "dev",
];
export { r as R };
//# sourceMappingURL=CeZ3CHNS.js.map
