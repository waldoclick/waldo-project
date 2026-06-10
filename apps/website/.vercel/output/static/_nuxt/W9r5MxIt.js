import {
  a_ as o,
  a$ as a,
  bf as f,
  bs as d,
  b0 as r,
  d6 as i,
  b1 as l,
  br as b,
} from "./BK8sApmn.js";
try {
  let t =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    n = new t.Error().stack;
  n &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[n] = "29bdf801-6c2f-4807-a279-0f73f54ccafd"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-29bdf801-6c2f-4807-a279-0f73f54ccafd"));
} catch {}
const u = { class: "reminder reminder--default" },
  c = {
    __name: "ReminderDefault",
    setup(t) {
      return (n, e) => {
        const s = b;
        return (
          o(),
          a("div", u, [
            e[1] || (e[1] = f("b", null, "Recuerda:", -1)),
            e[2] ||
              (e[2] = d(
                " Para ver datos del vendedor y de contacto debes ",
                -1,
              )),
            r(i),
            e[3] || (e[3] = d(" o ", -1)),
            r(
              s,
              { to: { name: "registro" }, title: "Registrarte" },
              {
                default: l(() => [
                  ...(e[0] || (e[0] = [d(" Registrarte ", -1)])),
                ]),
                _: 1,
              },
            ),
          ])
        );
      };
    },
  };
export { c as _ };
//# sourceMappingURL=W9r5MxIt.js.map
