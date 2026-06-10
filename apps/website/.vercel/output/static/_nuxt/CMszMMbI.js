import { f as vt } from "./DFEPOiSh.js";
import {
  bD as Qt,
  aZ as ce,
  b3 as ze,
  be as wt,
  a_ as S,
  a$ as D,
  bn as xt,
  bo as _t,
  b8 as j,
  b5 as Ct,
  bS as Zt,
  bf as w,
  bi as K,
  c0 as en,
  de as tn,
  da as kt,
  df as nn,
  dg as Fe,
  bx as on,
  b0 as m,
  b9 as J,
  bm as rn,
  bR as sn,
  bs as an,
  b6 as v,
  bC as qe,
  b7 as ln,
  cq as Pe,
  cz as dn,
  dd as cn,
} from "./BK8sApmn.js";
import {
  i as Q,
  g as Z,
  C as le,
  E as H,
  t as L,
  h as We,
  j as O,
  k as ve,
  l as A,
  m as un,
  u as fn,
  n as G,
  R as St,
  o as hn,
  q as bn,
  D as gn,
  A as yn,
  v as de,
  r as Mt,
  s as Ye,
  Q as re,
  H as ye,
  T as Je,
  w as Pt,
  x as mn,
  y as Ge,
  z as De,
  F as Ke,
  G as pn,
  a as vn,
  L as wn,
  B as xn,
  I as _n,
  p as Cn,
  c as kn,
  b as Sn,
  P as Mn,
  f as Pn,
  d as x,
} from "./DxYj44ZN.js";
import { C as Dn } from "./DmUMncXv.js";
import { C as An } from "./-VADgLbk.js";
import { C as Qe, T as Tn, F as jn } from "./DNpQO4ce.js";
import { S as In } from "./B27Hvwzg.js";
import { U as En } from "./CqtSRkqA.js";
import { C as On } from "./KZVta_c4.js";
import { M as Rn } from "./DFMJU6rT.js";
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
    e = new t.Error().stack;
  e &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[e] = "7085efad-f123-46e1-8e67-28557e50b54c"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-7085efad-f123-46e1-8e67-28557e50b54c"));
} catch {}
const Ln = Qt("archive", [
    [
      "rect",
      { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" },
    ],
    ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }],
    ["path", { d: "M10 12h4", key: "a56b0p" }],
  ]),
  zn = { class: "stats stats--default" },
  Wn = { class: "stats--default__item__name" },
  Yn = { class: "stats--default__item__value" },
  Xn = ce({
    __name: "StatsDefault",
    setup(t) {
      const e = ze(),
        n = j([]),
        o = (i) => ({ dolar: Fe, euro: nn, uf: kt, utm: tn, ipc: en })[i] || Fe,
        r = (i, a) =>
          a === "Porcentaje"
            ? `${i}%`
            : vt(i, { maximumFractionDigits: a === "Pesos" ? 0 : 2 }),
        s = (i) =>
          ({ uf: "UF", dolar: "USD", euro: "EUR", utm: "UTM", ipc: "IPC" })[
            i
          ] || i.toUpperCase();
      return (
        wt(
          () => !0,
          async () => {
            try {
              const i = await e("indicators", { method: "GET" });
              n.value = i.data || [];
            } catch {}
          },
          { immediate: !0 },
        ),
        (i, a) => (
          S(),
          D("div", zn, [
            (S(!0),
            D(
              xt,
              null,
              _t(
                n.value,
                (l) => (
                  S(),
                  D("div", { key: l.code, class: "stats--default__item" }, [
                    (S(),
                    Ct(Zt(o(l.code)), {
                      class: "stats--default__item__icon",
                      size: 16,
                    })),
                    w("span", Wn, K(s(l.code)), 1),
                    w("span", Yn, K(r(l.value, l.unit)), 1),
                  ])
                ),
              ),
              128,
            )),
          ])
        )
      );
    },
  }),
  Vn = Object.assign(Xn, { __name: "StatsDefault" }),
  Nn = { class: "hero hero--dashboard" },
  Bn = { class: "hero--dashboard__container" },
  Hn = { class: "hero--dashboard__content" },
  $n = { class: "hero--dashboard__title" },
  Un = { class: "hero--dashboard__bottom" },
  Fn = { class: "hero--dashboard__stats" },
  qn = ce({
    __name: "HeroDashboard",
    setup(t) {
      const e = on(),
        n = J(() => e.value?.firstname || "Usuario"),
        o = J(() => {
          const r = new Date().getHours();
          return r < 12
            ? "Buenos días"
            : r < 19
              ? "Buenas tardes"
              : "Buenas noches";
        });
      return (r, s) => (
        S(),
        D("section", Nn, [
          w("div", Bn, [
            w("div", Hn, [
              w("h1", $n, K(o.value) + ", " + K(n.value) + "!", 1),
              w("div", Un, [
                s[0] ||
                  (s[0] = w(
                    "p",
                    { class: "hero--dashboard__subtitle" },
                    " Aquí está lo que está pasando con tus anuncios hoy ",
                    -1,
                  )),
                w("div", Fn, [m(Vn)]),
              ]),
            ]),
          ]),
        ])
      );
    },
  }),
  Jn = Object.assign(qn, { __name: "HeroDashboard" });
const Ze = {
  modes: {
    point(t, e) {
      return me(t, e, { intersect: !0 });
    },
    nearest(t, e, n) {
      return Qn(t, e, n);
    },
    x(t, e, n) {
      return me(t, e, { intersect: n.intersect, axis: "x" });
    },
    y(t, e, n) {
      return me(t, e, { intersect: n.intersect, axis: "y" });
    },
  },
};
function Xe(t, e, n) {
  return (Ze.modes[n.mode] || Ze.modes.nearest)(t, e, n);
}
function Gn(t, e, n) {
  return n !== "x" && n !== "y"
    ? t.inRange(e.x, e.y, "x", !0) || t.inRange(e.x, e.y, "y", !0)
    : t.inRange(e.x, e.y, n, !0);
}
function Kn(t, e, n) {
  return n === "x" ? { x: t.x, y: e.y } : n === "y" ? { x: e.x, y: t.y } : e;
}
function me(t, e, n) {
  return t.filter((o) =>
    n.intersect ? o.inRange(e.x, e.y) : Gn(o, e, n.axis),
  );
}
function Qn(t, e, n) {
  let o = Number.POSITIVE_INFINITY;
  return me(t, e, n)
    .reduce((r, s) => {
      const i = s.getCenterPoint(),
        a = Kn(e, i, n.axis),
        l = We(e, a);
      return (l < o ? ((r = [s]), (o = l)) : l === o && r.push(s), r);
    }, [])
    .sort((r, s) => r._index - s._index)
    .slice(0, 1);
}
function $(t, e, n) {
  const o = Math.cos(n),
    r = Math.sin(n),
    s = e.x,
    i = e.y;
  return {
    x: s + o * (t.x - s) - r * (t.y - i),
    y: i + r * (t.x - s) + o * (t.y - i),
  };
}
const Zn = (t, e) =>
    e > t || (t.length > e.length && t.slice(0, e.length) === e),
  N = 0.001,
  we = (t, e, n) => Math.min(n, Math.max(e, t)),
  Dt = (t, e) => t.value >= t.start - e && t.value <= t.end + e;
function eo(t, e, n) {
  for (const o of Object.keys(t)) t[o] = we(t[o], e, n);
  return t;
}
function to(t, e, n, o) {
  return !t || !e || n <= 0
    ? !1
    : Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2) <= Math.pow(n + o, 2);
}
function At(
  t,
  { x: e, y: n, x2: o, y2: r },
  s,
  { borderWidth: i, hitTolerance: a },
) {
  const l = (i + a) / 2,
    d = t.x >= e - l - N && t.x <= o + l + N,
    c = t.y >= n - l - N && t.y <= r + l + N;
  return s === "x" ? d : (s === "y" || d) && c;
}
function Tt(
  t,
  { rect: e, center: n },
  o,
  { rotation: r, borderWidth: s, hitTolerance: i },
) {
  const a = $(t, n, L(-r));
  return At(a, e, o, { borderWidth: s, hitTolerance: i });
}
function U(t, e) {
  const { centerX: n, centerY: o } = t.getProps(["centerX", "centerY"], e);
  return { x: n, y: o };
}
function no(t, e, n, o = !0) {
  const r = n.split(".");
  let s = 0;
  for (const i of e.split(".")) {
    const a = r[s++];
    if (parseInt(i, 10) < parseInt(a, 10)) break;
    if (Zn(a, i)) {
      if (o)
        throw new Error(
          `${t} v${n} is not supported. v${e} or newer is required.`,
        );
      return !1;
    }
  }
  return !0;
}
const jt = (t) => typeof t == "string" && t.endsWith("%"),
  It = (t) => parseFloat(t) / 100,
  Et = (t) => we(It(t), 0, 1),
  se = (t, e) => ({ x: t, y: e, x2: t, y2: e, width: 0, height: 0 }),
  oo = {
    box: (t) => se(t.centerX, t.centerY),
    doughnutLabel: (t) => se(t.centerX, t.centerY),
    ellipse: (t) => ({
      centerX: t.centerX,
      centerY: t.centerX,
      radius: 0,
      width: 0,
      height: 0,
    }),
    label: (t) => se(t.centerX, t.centerY),
    line: (t) => se(t.x, t.y),
    point: (t) => ({
      centerX: t.centerX,
      centerY: t.centerY,
      radius: 0,
      width: 0,
      height: 0,
    }),
    polygon: (t) => se(t.centerX, t.centerY),
  };
function Ve(t, e) {
  return e === "start" ? 0 : e === "end" ? t : jt(e) ? Et(e) * t : t / 2;
}
function Y(t, e, n = !0) {
  return typeof e == "number" ? e : jt(e) ? (n ? Et(e) : It(e)) * t : t;
}
function ro(t, e) {
  const { x: n, width: o } = t,
    r = e.textAlign;
  return r === "center" ? n + o / 2 : r === "end" || r === "right" ? n + o : n;
}
function Ot(t, e, { borderWidth: n, position: o, xAdjust: r, yAdjust: s }, i) {
  const a = Q(i),
    l = e.width + (a ? i.width : 0) + n,
    d = e.height + (a ? i.height : 0) + n,
    c = Ne(o),
    u = et(t.x, l, r, c.x),
    h = et(t.y, d, s, c.y);
  return {
    x: u,
    y: h,
    x2: u + l,
    y2: h + d,
    width: l,
    height: d,
    centerX: u + l / 2,
    centerY: h + d / 2,
  };
}
function Ne(t, e = "center") {
  return Q(t)
    ? { x: de(t.x, e), y: de(t.y, e) }
    : ((t = de(t, e)), { x: t, y: t });
}
const Rt = (t, e) => t && t.autoFit && e < 1;
function Lt(t, e) {
  const n = t.font,
    o = Z(n) ? n : [n];
  return Rt(t, e)
    ? o.map(function (r) {
        const s = De(r);
        return (
          (s.size = Math.floor(r.size * e)),
          (s.lineHeight = r.lineHeight),
          De(s)
        );
      })
    : o.map((r) => De(r));
}
function zt(t) {
  return t && (O(t.xValue) || O(t.yValue));
}
function et(t, e, n = 0, o) {
  return t - Ve(e, o) + n;
}
function te(t, e, n) {
  const o = n.init;
  if (o) {
    if (o === !0) return Yt(e, n);
  } else return;
  return so(t, e, n);
}
function Wt(t, e, n) {
  let o = !1;
  return (
    e.forEach((r) => {
      G(t[r]) ? ((o = !0), (n[r] = t[r])) : O(n[r]) && delete n[r];
    }),
    o
  );
}
function Yt(t, e) {
  const n = e.type || "line";
  return oo[n](t);
}
function so(t, e, n) {
  const o = Ye(n.init, [{ chart: t, properties: e, options: n }]);
  if (o === !0) return Yt(e, n);
  if (Q(o)) return o;
}
const Ae = new Map(),
  io = (t) => isNaN(t) || t <= 0,
  ao = (t) =>
    t.reduce(function (e, n) {
      return ((e += n.string), e);
    }, "");
function xe(t) {
  if (t && typeof t == "object") {
    const e = t.toString();
    return (
      e === "[object HTMLImageElement]" || e === "[object HTMLCanvasElement]"
    );
  }
}
function _e(t, { x: e, y: n }, o) {
  o && (t.translate(e, n), t.rotate(L(o)), t.translate(-e, -n));
}
function R(t, e) {
  if (e && e.borderWidth)
    return (
      (t.lineCap = e.borderCapStyle || "butt"),
      t.setLineDash(e.borderDash),
      (t.lineDashOffset = e.borderDashOffset),
      (t.lineJoin = e.borderJoinStyle || "miter"),
      (t.lineWidth = e.borderWidth),
      (t.strokeStyle = e.borderColor),
      !0
    );
}
function ne(t, e) {
  ((t.shadowColor = e.backgroundShadowColor),
    (t.shadowBlur = e.shadowBlur),
    (t.shadowOffsetX = e.shadowOffsetX),
    (t.shadowOffsetY = e.shadowOffsetY));
}
function Ce(t, e) {
  const n = e.content;
  if (xe(n))
    return { width: Y(n.width, e.width), height: Y(n.height, e.height) };
  const o = Lt(e),
    r = e.textStrokeWidth,
    s = Z(n) ? n : [n],
    i = s.join() + ao(o) + r + (t._measureText ? "-spriting" : "");
  return (Ae.has(i) || Ae.set(i, fo(t, s, o, r)), Ae.get(i));
}
function Xt(t, e, n) {
  const { x: o, y: r, width: s, height: i } = e;
  (t.save(), ne(t, n));
  const a = R(t, n);
  ((t.fillStyle = n.backgroundColor),
    t.beginPath(),
    hn(t, {
      x: o,
      y: r,
      w: s,
      h: i,
      radius: eo(bn(n.borderRadius), 0, Math.min(s, i) / 2),
    }),
    t.closePath(),
    t.fill(),
    a && ((t.shadowColor = n.borderShadowColor), t.stroke()),
    t.restore());
}
function Vt(t, e, n, o) {
  const r = n.content;
  if (xe(r)) {
    (t.save(),
      (t.globalAlpha = go(n.opacity, r.style.opacity)),
      t.drawImage(r, e.x, e.y, e.width, e.height),
      t.restore());
    return;
  }
  const s = Z(r) ? r : [r],
    i = Lt(n, o),
    a = n.color,
    l = Z(a) ? a : [a],
    d = ro(e, n),
    c = e.y + n.textStrokeWidth / 2;
  (t.save(),
    (t.textBaseline = "middle"),
    (t.textAlign = n.textAlign),
    lo(t, n) && ho(t, { x: d, y: c }, s, i),
    bo(t, { x: d, y: c }, s, { fonts: i, colors: l }),
    t.restore());
}
function lo(t, e) {
  if (e.textStrokeWidth > 0)
    return (
      (t.lineJoin = "round"),
      (t.miterLimit = 2),
      (t.lineWidth = e.textStrokeWidth),
      (t.strokeStyle = e.textStrokeColor),
      !0
    );
}
function co(t, e, n, o) {
  const { radius: r, options: s } = e,
    i = s.pointStyle,
    a = s.rotation;
  let l = (a || 0) * St;
  if (xe(i)) {
    (t.save(),
      t.translate(n, o),
      t.rotate(l),
      t.drawImage(i, -i.width / 2, -i.height / 2, i.width, i.height),
      t.restore());
    return;
  }
  io(r) || uo(t, { x: n, y: o, radius: r, rotation: a, style: i, rad: l });
}
function uo(t, { x: e, y: n, radius: o, rotation: r, style: s, rad: i }) {
  let a, l, d, c;
  switch ((t.beginPath(), s)) {
    default:
      (t.arc(e, n, o, 0, Pt), t.closePath());
      break;
    case "triangle":
      (t.moveTo(e + Math.sin(i) * o, n - Math.cos(i) * o),
        (i += Je),
        t.lineTo(e + Math.sin(i) * o, n - Math.cos(i) * o),
        (i += Je),
        t.lineTo(e + Math.sin(i) * o, n - Math.cos(i) * o),
        t.closePath());
      break;
    case "rectRounded":
      ((c = o * 0.516),
        (d = o - c),
        (a = Math.cos(i + re) * d),
        (l = Math.sin(i + re) * d),
        t.arc(e - a, n - l, c, i - A, i - ye),
        t.arc(e + l, n - a, c, i - ye, i),
        t.arc(e + a, n + l, c, i, i + ye),
        t.arc(e - l, n + a, c, i + ye, i + A),
        t.closePath());
      break;
    case "rect":
      if (!r) {
        ((d = Math.SQRT1_2 * o), t.rect(e - d, n - d, 2 * d, 2 * d));
        break;
      }
      i += re;
    case "rectRot":
      ((a = Math.cos(i) * o),
        (l = Math.sin(i) * o),
        t.moveTo(e - a, n - l),
        t.lineTo(e + l, n - a),
        t.lineTo(e + a, n + l),
        t.lineTo(e - l, n + a),
        t.closePath());
      break;
    case "crossRot":
      i += re;
    case "cross":
      ((a = Math.cos(i) * o),
        (l = Math.sin(i) * o),
        t.moveTo(e - a, n - l),
        t.lineTo(e + a, n + l),
        t.moveTo(e + l, n - a),
        t.lineTo(e - l, n + a));
      break;
    case "star":
      ((a = Math.cos(i) * o),
        (l = Math.sin(i) * o),
        t.moveTo(e - a, n - l),
        t.lineTo(e + a, n + l),
        t.moveTo(e + l, n - a),
        t.lineTo(e - l, n + a),
        (i += re),
        (a = Math.cos(i) * o),
        (l = Math.sin(i) * o),
        t.moveTo(e - a, n - l),
        t.lineTo(e + a, n + l),
        t.moveTo(e + l, n - a),
        t.lineTo(e - l, n + a));
      break;
    case "line":
      ((a = Math.cos(i) * o),
        (l = Math.sin(i) * o),
        t.moveTo(e - a, n - l),
        t.lineTo(e + a, n + l));
      break;
    case "dash":
      (t.moveTo(e, n), t.lineTo(e + Math.cos(i) * o, n + Math.sin(i) * o));
      break;
  }
  t.fill();
}
function fo(t, e, n, o) {
  t.save();
  const r = e.length;
  let s = 0,
    i = o;
  for (let a = 0; a < r; a++) {
    const l = n[Math.min(a, n.length - 1)];
    t.font = l.string;
    const d = e[a];
    ((s = Math.max(s, t.measureText(d).width + o)), (i += l.lineHeight));
  }
  return (t.restore(), { width: s, height: i });
}
function ho(t, { x: e, y: n }, o, r) {
  t.beginPath();
  let s = 0;
  (o.forEach(function (i, a) {
    const l = r[Math.min(a, r.length - 1)],
      d = l.lineHeight;
    ((t.font = l.string), t.strokeText(i, e, n + d / 2 + s), (s += d));
  }),
    t.stroke());
}
function bo(t, { x: e, y: n }, o, { fonts: r, colors: s }) {
  let i = 0;
  o.forEach(function (a, l) {
    const d = s[Math.min(l, s.length - 1)],
      c = r[Math.min(l, r.length - 1)],
      u = c.lineHeight;
    (t.beginPath(),
      (t.font = c.string),
      (t.fillStyle = d),
      t.fillText(a, e, n + u / 2 + i),
      (i += u),
      t.fill());
  });
}
function go(t, e) {
  const n = Ge(t) ? t : e;
  return Ge(n) ? we(n, 0, 1) : 1;
}
const Nt = ["left", "bottom", "top", "right"];
function yo(t, e) {
  const { pointX: n, pointY: o, options: r } = e,
    s = r.callout,
    i = s && s.display && xo(e, s);
  if (!i || Co(e, s, i)) return;
  if ((t.save(), t.beginPath(), !R(t, s))) return t.restore();
  const { separatorStart: l, separatorEnd: d } = mo(e, i),
    { sideStart: c, sideEnd: u } = vo(e, i, l);
  ((s.margin > 0 || r.borderWidth === 0) &&
    (t.moveTo(l.x, l.y), t.lineTo(d.x, d.y)),
    t.moveTo(c.x, c.y),
    t.lineTo(u.x, u.y));
  const h = $({ x: n, y: o }, e.getCenterPoint(), L(-e.rotation));
  (t.lineTo(h.x, h.y), t.stroke(), t.restore());
}
function mo(t, e) {
  const { x: n, y: o, x2: r, y2: s } = t,
    i = po(t, e);
  let a, l;
  return (
    e === "left" || e === "right"
      ? ((a = { x: n + i, y: o }), (l = { x: a.x, y: s }))
      : ((a = { x: n, y: o + i }), (l = { x: r, y: a.y })),
    { separatorStart: a, separatorEnd: l }
  );
}
function po(t, e) {
  const { width: n, height: o, options: r } = t,
    s = r.callout.margin + r.borderWidth / 2;
  return e === "right" ? n + s : e === "bottom" ? o + s : -s;
}
function vo(t, e, n) {
  const { y: o, width: r, height: s, options: i } = t,
    a = i.callout.start,
    l = wo(e, i.callout);
  let d, c;
  return (
    e === "left" || e === "right"
      ? ((d = { x: n.x, y: o + Y(s, a) }), (c = { x: d.x + l, y: d.y }))
      : ((d = { x: n.x + Y(r, a), y: n.y }), (c = { x: d.x, y: d.y + l })),
    { sideStart: d, sideEnd: c }
  );
}
function wo(t, e) {
  const n = e.side;
  return t === "left" || t === "top" ? -n : n;
}
function xo(t, e) {
  const n = e.position;
  return Nt.includes(n) ? n : _o(t, e);
}
function _o(t, e) {
  const {
      x: n,
      y: o,
      x2: r,
      y2: s,
      width: i,
      height: a,
      pointX: l,
      pointY: d,
      centerX: c,
      centerY: u,
      rotation: h,
    } = t,
    g = { x: c, y: u },
    y = e.start,
    M = Y(i, y),
    P = Y(a, y),
    C = [n, n + M, n + M, r],
    k = [o + P, s, o, s],
    T = [];
  for (let I = 0; I < 4; I++) {
    const f = $({ x: C[I], y: k[I] }, g, L(h));
    T.push({ position: Nt[I], distance: We(f, { x: l, y: d }) });
  }
  return T.sort((I, f) => I.distance - f.distance)[0].position;
}
function Co(t, e, n) {
  const { pointX: o, pointY: r } = t,
    s = e.margin;
  let i = o,
    a = r;
  return (
    n === "left"
      ? (i += s)
      : n === "right"
        ? (i -= s)
        : n === "top"
          ? (a += s)
          : n === "bottom" && (a -= s),
    t.inRange(i, a)
  );
}
const tt = {
  xScaleID: {
    min: "xMin",
    max: "xMax",
    start: "left",
    end: "right",
    startProp: "x",
    endProp: "x2",
  },
  yScaleID: {
    min: "yMin",
    max: "yMax",
    start: "bottom",
    end: "top",
    startProp: "y",
    endProp: "y2",
  },
};
function ee(t, e, n) {
  return (
    (e = typeof e == "number" ? e : t.parse(e)),
    Mt(e) ? t.getPixelForValue(e) : n
  );
}
function B(t, e, n) {
  const o = e[n];
  if (o || n === "scaleID") return o;
  const r = n.charAt(0),
    s = Object.values(t).filter((i) => i.axis && i.axis === r);
  return s.length ? s[0].id : r;
}
function Bt(t, e) {
  if (t) {
    const n = t.options.reverse,
      o = ee(t, e.min, n ? e.end : e.start),
      r = ee(t, e.max, n ? e.start : e.end);
    return { start: o, end: r };
  }
}
function Ht(t, e) {
  const { chartArea: n, scales: o } = t,
    r = o[B(o, e, "xScaleID")],
    s = o[B(o, e, "yScaleID")];
  let i = n.width / 2,
    a = n.height / 2;
  return (
    r && (i = ee(r, e.xValue, r.left + r.width / 2)),
    s && (a = ee(s, e.yValue, s.top + s.height / 2)),
    { x: i, y: a }
  );
}
function Be(t, e) {
  const n = t.scales,
    o = n[B(n, e, "xScaleID")],
    r = n[B(n, e, "yScaleID")];
  if (!o && !r) return {};
  let { left: s, right: i } = o || t.chartArea,
    { top: a, bottom: l } = r || t.chartArea;
  const d = nt(o, { min: e.xMin, max: e.xMax, start: s, end: i });
  ((s = d.start), (i = d.end));
  const c = nt(r, { min: e.yMin, max: e.yMax, start: l, end: a });
  return (
    (a = c.start),
    (l = c.end),
    {
      x: s,
      y: a,
      x2: i,
      y2: l,
      width: i - s,
      height: l - a,
      centerX: s + (i - s) / 2,
      centerY: a + (l - a) / 2,
    }
  );
}
function $t(t, e) {
  if (!zt(e)) {
    const n = Be(t, e);
    let o = e.radius;
    (!o || isNaN(o)) && ((o = Math.min(n.width, n.height) / 2), (e.radius = o));
    const r = o * 2,
      s = n.centerX + e.xAdjust,
      i = n.centerY + e.yAdjust;
    return {
      x: s - o,
      y: i - o,
      x2: s + o,
      y2: i + o,
      centerX: s,
      centerY: i,
      width: r,
      height: r,
      radius: o,
    };
  }
  return So(t, e);
}
function ko(t, e) {
  const { scales: n, chartArea: o } = t,
    r = n[e.scaleID],
    s = { x: o.left, y: o.top, x2: o.right, y2: o.bottom };
  return (r ? Mo(r, s, e) : Po(n, s, e), s);
}
function Ut(t, e) {
  const n = Be(t, e);
  return (
    (n.initProperties = te(t, n, e)),
    (n.elements = [
      {
        type: "label",
        optionScope: "label",
        properties: To(t, n, e),
        initProperties: n.initProperties,
      },
    ]),
    n
  );
}
function So(t, e) {
  const n = Ht(t, e),
    o = e.radius * 2;
  return {
    x: n.x - e.radius + e.xAdjust,
    y: n.y - e.radius + e.yAdjust,
    x2: n.x + e.radius + e.xAdjust,
    y2: n.y + e.radius + e.yAdjust,
    centerX: n.x + e.xAdjust,
    centerY: n.y + e.yAdjust,
    radius: e.radius,
    width: o,
    height: o,
  };
}
function nt(t, e) {
  const n = Bt(t, e) || e;
  return { start: Math.min(n.start, n.end), end: Math.max(n.start, n.end) };
}
function Mo(t, e, n) {
  const o = ee(t, n.value, NaN),
    r = ee(t, n.endValue, o);
  t.isHorizontal() ? ((e.x = o), (e.x2 = r)) : ((e.y = o), (e.y2 = r));
}
function Po(t, e, n) {
  for (const o of Object.keys(tt)) {
    const r = t[B(t, n, o)];
    if (r) {
      const {
          min: s,
          max: i,
          start: a,
          end: l,
          startProp: d,
          endProp: c,
        } = tt[o],
        u = Bt(r, { min: n[s], max: n[i], start: r[a], end: r[l] });
      ((e[d] = u.start), (e[c] = u.end));
    }
  }
}
function Do({ properties: t, options: e }, n, o, r) {
  const { x: s, x2: i, width: a } = t;
  return Ft(
    { start: s, end: i, borderWidth: e.borderWidth },
    {
      position: o.x,
      padding: { start: r.left, end: r.right },
      adjust: e.label.xAdjust,
      size: n.width,
    },
  );
}
function Ao({ properties: t, options: e }, n, o, r) {
  const { y: s, y2: i, height: a } = t;
  return Ft(
    { start: s, end: i, borderWidth: e.borderWidth },
    {
      position: o.y,
      padding: { start: r.top, end: r.bottom },
      adjust: e.label.yAdjust,
      size: n.height,
    },
  );
}
function Ft(t, e) {
  const { start: n, end: o, borderWidth: r } = t,
    {
      position: s,
      padding: { start: i, end: a },
      adjust: l,
    } = e,
    d = o - r - n - i - a - e.size;
  return n + r / 2 + l + Ve(d, s);
}
function To(t, e, n) {
  const o = n.label;
  ((o.backgroundColor = "transparent"), (o.callout.display = !1));
  const r = Ne(o.position),
    s = ve(o.padding),
    i = Ce(t.ctx, o),
    a = Do({ properties: e, options: n }, i, r, s),
    l = Ao({ properties: e, options: n }, i, r, s),
    d = i.width + s.width,
    c = i.height + s.height;
  return {
    x: a,
    y: l,
    x2: a + d,
    y2: l + c,
    width: d,
    height: c,
    centerX: a + d / 2,
    centerY: l + c / 2,
    rotation: o.rotation,
  };
}
const Te = ["enter", "leave"],
  He = Te.concat("click");
function jo(t, e, n) {
  ((e.listened = Wt(n, He, e.listeners)),
    (e.moveListened = !1),
    Te.forEach((o) => {
      G(n[o]) && (e.moveListened = !0);
    }),
    (!e.listened || !e.moveListened) &&
      e.annotations.forEach((o) => {
        (!e.listened && G(o.click) && (e.listened = !0),
          e.moveListened ||
            Te.forEach((r) => {
              G(o[r]) && ((e.listened = !0), (e.moveListened = !0));
            }));
      }));
}
function Io(t, e, n) {
  if (t.listened)
    switch (e.type) {
      case "mousemove":
      case "mouseout":
        return Eo(t, e, n);
      case "click":
        return Oo(t, e, n);
    }
}
function Eo(t, e, n) {
  if (!t.moveListened) return;
  let o;
  e.type === "mousemove"
    ? (o = Xe(t.visibleElements, e, n.interaction))
    : (o = []);
  const r = t.hovered;
  t.hovered = o;
  const s = { state: t, event: e };
  let i = ot(s, "leave", r, o);
  return ot(s, "enter", o, r) || i;
}
function ot({ state: t, event: e }, n, o, r) {
  let s;
  for (const i of o)
    r.indexOf(i) < 0 && (s = qt(i.options[n] || t.listeners[n], i, e) || s);
  return s;
}
function Oo(t, e, n) {
  const o = t.listeners,
    r = Xe(t.visibleElements, e, n.interaction);
  let s;
  for (const i of r) s = qt(i.options.click || o.click, i, e) || s;
  return s;
}
function qt(t, e, n) {
  return Ye(t, [e.$context, n]) === !0;
}
const pe = ["afterDraw", "beforeDraw"];
function Ro(t, e, n) {
  const o = e.visibleElements;
  ((e.hooked = Wt(n, pe, e.hooks)),
    e.hooked ||
      o.forEach((r) => {
        e.hooked ||
          pe.forEach((s) => {
            G(r.options[s]) && (e.hooked = !0);
          });
      }));
}
function rt(t, e, n) {
  if (t.hooked) {
    const o = e.options[n] || t.hooks[n];
    return Ye(o, [e.$context]);
  }
}
function Lo(t, e, n) {
  const o = Vo(t.scales, e, n);
  let r = st(e, o, "min", "suggestedMin");
  ((r = st(e, o, "max", "suggestedMax") || r),
    r && G(e.handleTickRangeOptions) && e.handleTickRangeOptions());
}
function zo(t, e) {
  for (const n of t) Yo(n, e);
}
function st(t, e, n, o) {
  if (Mt(e[n]) && !Wo(t.options, n, o)) {
    const r = t[n] !== e[n];
    return ((t[n] = e[n]), r);
  }
}
function Wo(t, e, n) {
  return O(t[e]) || O(t[n]);
}
function Yo(t, e) {
  for (const n of ["scaleID", "xScaleID", "yScaleID"]) {
    const o = B(e, t, n);
    o && !e[o] && Xo(t, n);
  }
}
function Xo(t, e) {
  if (e === "scaleID") return !0;
  const n = e.charAt(0);
  for (const o of ["Min", "Max", "Value"]) if (O(t[n + o])) return !0;
  return !1;
}
function Vo(t, e, n) {
  const o = e.axis,
    r = e.id,
    s = o + "ScaleID",
    i = {
      min: de(e.min, Number.NEGATIVE_INFINITY),
      max: de(e.max, Number.POSITIVE_INFINITY),
    };
  for (const a of n)
    a.scaleID === r
      ? it(a, e, ["value", "endValue"], i)
      : B(t, a, s) === r && it(a, e, [o + "Min", o + "Max", o + "Value"], i);
  return i;
}
function it(t, e, n, o) {
  for (const r of n) {
    const s = t[r];
    if (O(s)) {
      const i = e.parse(s);
      ((o.min = Math.min(o.min, i)), (o.max = Math.max(o.max, i)));
    }
  }
}
class oe extends H {
  inRange(e, n, o, r) {
    const { x: s, y: i } = $(
      { x: e, y: n },
      this.getCenterPoint(r),
      L(-this.options.rotation),
    );
    return At(
      { x: s, y: i },
      this.getProps(["x", "y", "x2", "y2"], r),
      o,
      this.options,
    );
  }
  getCenterPoint(e) {
    return U(this, e);
  }
  draw(e) {
    (e.save(),
      _e(e, this.getCenterPoint(), this.options.rotation),
      Xt(e, this, this.options),
      e.restore());
  }
  get label() {
    return this.elements && this.elements[0];
  }
  resolveElementProperties(e, n) {
    return Ut(e, n);
  }
}
oe.id = "boxAnnotation";
oe.defaults = {
  adjustScaleRange: !0,
  backgroundShadowColor: "transparent",
  borderCapStyle: "butt",
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: "miter",
  borderRadius: 0,
  borderShadowColor: "transparent",
  borderWidth: 1,
  display: !0,
  init: void 0,
  hitTolerance: 0,
  label: {
    backgroundColor: "transparent",
    borderWidth: 0,
    callout: { display: !1 },
    color: "black",
    content: null,
    display: !1,
    drawTime: void 0,
    font: {
      family: void 0,
      lineHeight: void 0,
      size: void 0,
      style: void 0,
      weight: "bold",
    },
    height: void 0,
    hitTolerance: void 0,
    opacity: void 0,
    padding: 6,
    position: "center",
    rotation: void 0,
    textAlign: "start",
    textStrokeColor: void 0,
    textStrokeWidth: 0,
    width: void 0,
    xAdjust: 0,
    yAdjust: 0,
    z: void 0,
  },
  rotation: 0,
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  xMax: void 0,
  xMin: void 0,
  xScaleID: void 0,
  yMax: void 0,
  yMin: void 0,
  yScaleID: void 0,
  z: 0,
};
oe.defaultRoutes = { borderColor: "color", backgroundColor: "color" };
oe.descriptors = { label: { _fallback: !0 } };
class ke extends H {
  inRange(e, n, o, r) {
    return Tt(
      { x: e, y: n },
      {
        rect: this.getProps(["x", "y", "x2", "y2"], r),
        center: this.getCenterPoint(r),
      },
      o,
      {
        rotation: this.rotation,
        borderWidth: 0,
        hitTolerance: this.options.hitTolerance,
      },
    );
  }
  getCenterPoint(e) {
    return U(this, e);
  }
  draw(e) {
    const n = this.options;
    !n.display ||
      !n.content ||
      (Fo(e, this),
      e.save(),
      _e(e, this.getCenterPoint(), this.rotation),
      Vt(e, this, n, this._fitRatio),
      e.restore());
  }
  resolveElementProperties(e, n) {
    const o = No(e, n);
    if (!o) return {};
    const { controllerMeta: r, point: s, radius: i } = Ho(e, n, o);
    let a = Ce(e.ctx, n);
    const l = $o(a, i);
    Rt(n, l) && (a = { width: a.width * l, height: a.height * l });
    const { position: d, xAdjust: c, yAdjust: u } = n,
      h = Ot(s, a, { borderWidth: 0, position: d, xAdjust: c, yAdjust: u });
    return {
      initProperties: te(e, h, n),
      ...h,
      ...r,
      rotation: n.rotation,
      _fitRatio: l,
    };
  }
}
ke.id = "doughnutLabelAnnotation";
ke.defaults = {
  autoFit: !0,
  autoHide: !0,
  backgroundColor: "transparent",
  backgroundShadowColor: "transparent",
  borderColor: "transparent",
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: "miter",
  borderShadowColor: "transparent",
  borderWidth: 0,
  color: "black",
  content: null,
  display: !0,
  font: {
    family: void 0,
    lineHeight: void 0,
    size: void 0,
    style: void 0,
    weight: void 0,
  },
  height: void 0,
  hitTolerance: 0,
  init: void 0,
  opacity: void 0,
  position: "center",
  rotation: 0,
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  spacing: 1,
  textAlign: "center",
  textStrokeColor: void 0,
  textStrokeWidth: 0,
  width: void 0,
  xAdjust: 0,
  yAdjust: 0,
};
ke.defaultRoutes = {};
function No(t, e) {
  return t.getSortedVisibleDatasetMetas().reduce(
    function (n, o) {
      const r = o.controller;
      return r instanceof gn &&
        Bo(t, e, o.data) &&
        (!n || r.innerRadius < n.controller.innerRadius) &&
        r.options.circumference >= 90
        ? o
        : n;
    },
    void 0,
  );
}
function Bo(t, e, n) {
  if (!e.autoHide) return !0;
  for (let o = 0; o < n.length; o++)
    if (!n[o].hidden && t.getDataVisibility(o)) return !0;
}
function Ho({ chartArea: t }, e, n) {
  const { left: o, top: r, right: s, bottom: i } = t,
    { innerRadius: a, offsetX: l, offsetY: d } = n.controller,
    c = (o + s) / 2 + l,
    u = (r + i) / 2 + d,
    h = {
      left: Math.max(c - a, o),
      right: Math.min(c + a, s),
      top: Math.max(u - a, r),
      bottom: Math.min(u + a, i),
    },
    g = { x: (h.left + h.right) / 2, y: (h.top + h.bottom) / 2 },
    y = e.spacing + e.borderWidth / 2,
    M = a - y,
    P = g.y > u,
    C = P ? r + y : i - y,
    k = Uo(C, c, u, M);
  return {
    controllerMeta: {
      _centerX: c,
      _centerY: u,
      _radius: M,
      _counterclockwise: P,
      ...k,
    },
    point: g,
    radius: Math.min(a, Math.min(h.right - h.left, h.bottom - h.top) / 2),
  };
}
function $o({ width: t, height: e }, n) {
  const o = Math.sqrt(Math.pow(t, 2) + Math.pow(e, 2));
  return (n * 2) / o;
}
function Uo(t, e, n, o) {
  const r = Math.pow(n - t, 2),
    s = Math.pow(o, 2),
    i = e * -2,
    a = Math.pow(e, 2) + r - s,
    l = Math.pow(i, 2) - 4 * a;
  if (l <= 0) return { _startAngle: 0, _endAngle: Pt };
  const d = (-i - Math.sqrt(l)) / 2,
    c = (-i + Math.sqrt(l)) / 2;
  return {
    _startAngle: Ke({ x: e, y: n }, { x: d, y: t }).angle,
    _endAngle: Ke({ x: e, y: n }, { x: c, y: t }).angle,
  };
}
function Fo(t, e) {
  const {
    _centerX: n,
    _centerY: o,
    _radius: r,
    _startAngle: s,
    _endAngle: i,
    _counterclockwise: a,
    options: l,
  } = e;
  t.save();
  const d = R(t, l);
  ((t.fillStyle = l.backgroundColor),
    t.beginPath(),
    t.arc(n, o, r, s, i, a),
    t.closePath(),
    t.fill(),
    d && t.stroke(),
    t.restore());
}
class ue extends H {
  inRange(e, n, o, r) {
    return Tt(
      { x: e, y: n },
      {
        rect: this.getProps(["x", "y", "x2", "y2"], r),
        center: this.getCenterPoint(r),
      },
      o,
      {
        rotation: this.rotation,
        borderWidth: this.options.borderWidth,
        hitTolerance: this.options.hitTolerance,
      },
    );
  }
  getCenterPoint(e) {
    return U(this, e);
  }
  draw(e) {
    const n = this.options,
      o = !O(this._visible) || this._visible;
    !n.display ||
      !n.content ||
      !o ||
      (e.save(),
      _e(e, this.getCenterPoint(), this.rotation),
      yo(e, this),
      Xt(e, this, n),
      Vt(e, qo(this), n),
      e.restore());
  }
  resolveElementProperties(e, n) {
    let o;
    if (zt(n)) o = Ht(e, n);
    else {
      const { centerX: a, centerY: l } = Be(e, n);
      o = { x: a, y: l };
    }
    const r = ve(n.padding),
      s = Ce(e.ctx, n),
      i = Ot(o, s, n, r);
    return {
      initProperties: te(e, i, n),
      pointX: o.x,
      pointY: o.y,
      ...i,
      rotation: n.rotation,
    };
  }
}
ue.id = "labelAnnotation";
ue.defaults = {
  adjustScaleRange: !0,
  backgroundColor: "transparent",
  backgroundShadowColor: "transparent",
  borderCapStyle: "butt",
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: "miter",
  borderRadius: 0,
  borderShadowColor: "transparent",
  borderWidth: 0,
  callout: {
    borderCapStyle: "butt",
    borderColor: void 0,
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: "miter",
    borderWidth: 1,
    display: !1,
    margin: 5,
    position: "auto",
    side: 5,
    start: "50%",
  },
  color: "black",
  content: null,
  display: !0,
  font: {
    family: void 0,
    lineHeight: void 0,
    size: void 0,
    style: void 0,
    weight: void 0,
  },
  height: void 0,
  hitTolerance: 0,
  init: void 0,
  opacity: void 0,
  padding: 6,
  position: "center",
  rotation: 0,
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  textAlign: "center",
  textStrokeColor: void 0,
  textStrokeWidth: 0,
  width: void 0,
  xAdjust: 0,
  xMax: void 0,
  xMin: void 0,
  xScaleID: void 0,
  xValue: void 0,
  yAdjust: 0,
  yMax: void 0,
  yMin: void 0,
  yScaleID: void 0,
  yValue: void 0,
  z: 0,
};
ue.defaultRoutes = { borderColor: "color" };
function qo({ x: t, y: e, width: n, height: o, options: r }) {
  const s = r.borderWidth / 2,
    i = ve(r.padding);
  return {
    x: t + i.left + s,
    y: e + i.top + s,
    width: n - i.left - i.right - r.borderWidth,
    height: o - i.top - i.bottom - r.borderWidth,
  };
}
const $e = (t, e, n) => ({
    x: t.x + n * (e.x - t.x),
    y: t.y + n * (e.y - t.y),
  }),
  je = (t, e, n) => $e(e, n, Math.abs((t - e.y) / (n.y - e.y))).x,
  at = (t, e, n) => $e(e, n, Math.abs((t - e.x) / (n.x - e.x))).y,
  ae = (t) => t * t,
  Jo = (t, e, { x: n, y: o, x2: r, y2: s }, i) =>
    i === "y"
      ? { start: Math.min(o, s), end: Math.max(o, s), value: e }
      : { start: Math.min(n, r), end: Math.max(n, r), value: t },
  lt = (t, e, n, o) => (1 - o) * (1 - o) * t + 2 * (1 - o) * o * e + o * o * n,
  Ie = (t, e, n, o) => ({ x: lt(t.x, e.x, n.x, o), y: lt(t.y, e.y, n.y, o) }),
  dt = (t, e, n, o) => 2 * (1 - o) * (e - t) + 2 * o * (n - e),
  ct = (t, e, n, o) =>
    -Math.atan2(dt(t.x, e.x, n.x, o), dt(t.y, e.y, n.y, o)) + 0.5 * A;
class fe extends H {
  inRange(e, n, o, r) {
    const s = (this.options.borderWidth + this.options.hitTolerance) / 2;
    if (o !== "x" && o !== "y") {
      const i = { mouseX: e, mouseY: n },
        { path: a, ctx: l } = this;
      if (a) {
        (R(l, this.options), (l.lineWidth += this.options.hitTolerance));
        const { chart: c } = this.$context,
          u = e * c.currentDevicePixelRatio,
          h = n * c.currentDevicePixelRatio,
          g = l.isPointInStroke(a, u, h) || Ee(this, i, r);
        return (l.restore(), g);
      }
      const d = ae(s);
      return Zo(this, i, d, r) || Ee(this, i, r);
    }
    return Go(this, { mouseX: e, mouseY: n }, o, {
      hitSize: s,
      useFinalPosition: r,
    });
  }
  getCenterPoint(e) {
    return U(this, e);
  }
  draw(e) {
    const { x: n, y: o, x2: r, y2: s, cp: i, options: a } = this;
    if ((e.save(), !R(e, a))) return e.restore();
    ne(e, a);
    const l = Math.sqrt(Math.pow(r - n, 2) + Math.pow(s - o, 2));
    if (a.curve && i) return (ar(e, this, i, l), e.restore());
    const { startOpts: d, endOpts: c, startAdjust: u, endAdjust: h } = Jt(this),
      g = Math.atan2(s - o, r - n);
    (e.translate(n, o),
      e.rotate(g),
      e.beginPath(),
      e.moveTo(0 + u, 0),
      e.lineTo(l - h, 0),
      (e.shadowColor = a.borderShadowColor),
      e.stroke(),
      Oe(e, 0, u, d),
      Oe(e, l, -h, c),
      e.restore());
  }
  get label() {
    return this.elements && this.elements[0];
  }
  resolveElementProperties(e, n) {
    const o = ko(e, n),
      { x: r, y: s, x2: i, y2: a } = o,
      l = Ko(o, e.chartArea),
      d = l
        ? Qo({ x: r, y: s }, { x: i, y: a }, e.chartArea)
        : {
            x: r,
            y: s,
            x2: i,
            y2: a,
            width: Math.abs(i - r),
            height: Math.abs(a - s),
          };
    if (
      ((d.centerX = (i + r) / 2),
      (d.centerY = (a + s) / 2),
      (d.initProperties = te(e, d, n)),
      n.curve)
    ) {
      const u = { x: d.x, y: d.y },
        h = { x: d.x2, y: d.y2 };
      d.cp = ir(d, n, We(u, h));
    }
    const c = er(e, d, n.label);
    return (
      (c._visible = l),
      (d.elements = [
        {
          type: "label",
          optionScope: "label",
          properties: c,
          initProperties: d.initProperties,
        },
      ]),
      d
    );
  }
}
fe.id = "lineAnnotation";
const ut = {
  backgroundColor: void 0,
  backgroundShadowColor: void 0,
  borderColor: void 0,
  borderDash: void 0,
  borderDashOffset: void 0,
  borderShadowColor: void 0,
  borderWidth: void 0,
  display: void 0,
  fill: void 0,
  length: void 0,
  shadowBlur: void 0,
  shadowOffsetX: void 0,
  shadowOffsetY: void 0,
  width: void 0,
};
fe.defaults = {
  adjustScaleRange: !0,
  arrowHeads: {
    display: !1,
    end: Object.assign({}, ut),
    fill: !1,
    length: 12,
    start: Object.assign({}, ut),
    width: 6,
  },
  borderDash: [],
  borderDashOffset: 0,
  borderShadowColor: "transparent",
  borderWidth: 2,
  curve: !1,
  controlPoint: { y: "-50%" },
  display: !0,
  endValue: void 0,
  init: void 0,
  hitTolerance: 0,
  label: {
    backgroundColor: "rgba(0,0,0,0.8)",
    backgroundShadowColor: "transparent",
    borderCapStyle: "butt",
    borderColor: "black",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: "miter",
    borderRadius: 6,
    borderShadowColor: "transparent",
    borderWidth: 0,
    callout: Object.assign({}, ue.defaults.callout),
    color: "#fff",
    content: null,
    display: !1,
    drawTime: void 0,
    font: {
      family: void 0,
      lineHeight: void 0,
      size: void 0,
      style: void 0,
      weight: "bold",
    },
    height: void 0,
    hitTolerance: void 0,
    opacity: void 0,
    padding: 6,
    position: "center",
    rotation: 0,
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    textAlign: "center",
    textStrokeColor: void 0,
    textStrokeWidth: 0,
    width: void 0,
    xAdjust: 0,
    yAdjust: 0,
    z: void 0,
  },
  scaleID: void 0,
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  value: void 0,
  xMax: void 0,
  xMin: void 0,
  xScaleID: void 0,
  yMax: void 0,
  yMin: void 0,
  yScaleID: void 0,
  z: 0,
};
fe.descriptors = {
  arrowHeads: {
    start: { _fallback: !0 },
    end: { _fallback: !0 },
    _fallback: !0,
  },
};
fe.defaultRoutes = { borderColor: "color" };
function Go(
  t,
  { mouseX: e, mouseY: n },
  o,
  { hitSize: r, useFinalPosition: s },
) {
  const i = Jo(e, n, t.getProps(["x", "y", "x2", "y2"], s), o);
  return Dt(i, r) || Ee(t, { mouseX: e, mouseY: n }, s, o);
}
function Ko(
  { x: t, y: e, x2: n, y2: o },
  { top: r, right: s, bottom: i, left: a },
) {
  return !(
    (t < a && n < a) ||
    (t > s && n > s) ||
    (e < r && o < r) ||
    (e > i && o > i)
  );
}
function ft({ x: t, y: e }, n, { top: o, right: r, bottom: s, left: i }) {
  return (
    t < i && ((e = at(i, { x: t, y: e }, n)), (t = i)),
    t > r && ((e = at(r, { x: t, y: e }, n)), (t = r)),
    e < o && ((t = je(o, { x: t, y: e }, n)), (e = o)),
    e > s && ((t = je(s, { x: t, y: e }, n)), (e = s)),
    { x: t, y: e }
  );
}
function Qo(t, e, n) {
  const { x: o, y: r } = ft(t, e, n),
    { x: s, y: i } = ft(e, t, n);
  return {
    x: o,
    y: r,
    x2: s,
    y2: i,
    width: Math.abs(s - o),
    height: Math.abs(i - r),
  };
}
function Zo(t, { mouseX: e, mouseY: n }, o = N, r) {
  const { x: s, y: i, x2: a, y2: l } = t.getProps(["x", "y", "x2", "y2"], r),
    d = a - s,
    c = l - i,
    u = ae(d) + ae(c),
    h = u === 0 ? -1 : ((e - s) * d + (n - i) * c) / u;
  let g, y;
  return (
    h < 0
      ? ((g = s), (y = i))
      : h > 1
        ? ((g = a), (y = l))
        : ((g = s + h * d), (y = i + h * c)),
    ae(e - g) + ae(n - y) <= o
  );
}
function Ee(t, { mouseX: e, mouseY: n }, o, r) {
  const s = t.label;
  return s.options.display && s.inRange(e, n, r, o);
}
function er(t, e, n) {
  const o = n.borderWidth,
    r = ve(n.padding),
    s = Ce(t.ctx, n),
    i = s.width + r.width + o,
    a = s.height + r.height + o;
  return nr(e, n, { width: i, height: a, padding: r }, t.chartArea);
}
function tr(t) {
  const { x: e, y: n, x2: o, y2: r } = t,
    s = Math.atan2(r - n, o - e);
  return s > A / 2 ? s - A : s < A / -2 ? s + A : s;
}
function nr(t, e, n, o) {
  const { width: r, height: s, padding: i } = n,
    { xAdjust: a, yAdjust: l } = e,
    d = { x: t.x, y: t.y },
    c = { x: t.x2, y: t.y2 },
    u = e.rotation === "auto" ? tr(t) : L(e.rotation),
    h = or(r, s, u),
    g = rr(t, e, { labelSize: h, padding: i }, o),
    y = t.cp ? Ie(d, t.cp, c, g) : $e(d, c, g),
    M = { size: h.w, min: o.left, max: o.right, padding: i.left },
    P = { size: h.h, min: o.top, max: o.bottom, padding: i.top },
    C = bt(y.x, M) + a,
    k = bt(y.y, P) + l;
  return {
    x: C - r / 2,
    y: k - s / 2,
    x2: C + r / 2,
    y2: k + s / 2,
    centerX: C,
    centerY: k,
    pointX: y.x,
    pointY: y.y,
    width: r,
    height: s,
    rotation: mn(u),
  };
}
function or(t, e, n) {
  const o = Math.cos(n),
    r = Math.sin(n);
  return {
    w: Math.abs(t * o) + Math.abs(e * r),
    h: Math.abs(t * r) + Math.abs(e * o),
  };
}
function rr(t, e, n, o) {
  let r;
  const s = sr(t, o);
  return (
    e.position === "start"
      ? (r = ht({ w: t.x2 - t.x, h: t.y2 - t.y }, n, e, s))
      : e.position === "end"
        ? (r = 1 - ht({ w: t.x - t.x2, h: t.y - t.y2 }, n, e, s))
        : (r = Ve(1, e.position)),
    r
  );
}
function ht(t, e, n, o) {
  const { labelSize: r, padding: s } = e,
    i = t.w * o.dx,
    a = t.h * o.dy,
    l = i > 0 && (r.w / 2 + s.left - o.x) / i,
    d = a > 0 && (r.h / 2 + s.top - o.y) / a;
  return we(Math.max(l, d), 0, 0.25);
}
function sr(t, e) {
  const { x: n, x2: o, y: r, y2: s } = t,
    i = Math.min(r, s) - e.top,
    a = Math.min(n, o) - e.left,
    l = e.bottom - Math.max(r, s),
    d = e.right - Math.max(n, o);
  return {
    x: Math.min(a, d),
    y: Math.min(i, l),
    dx: a <= d ? 1 : -1,
    dy: i <= l ? 1 : -1,
  };
}
function bt(t, e) {
  const { size: n, min: o, max: r, padding: s } = e,
    i = n / 2;
  return n > r - o
    ? (r + o) / 2
    : (o >= t - s - i && (t = o + s + i), r <= t + s + i && (t = r - s - i), t);
}
function Jt(t) {
  const e = t.options,
    n = e.arrowHeads && e.arrowHeads.start,
    o = e.arrowHeads && e.arrowHeads.end;
  return {
    startOpts: n,
    endOpts: o,
    startAdjust: gt(t, n),
    endAdjust: gt(t, o),
  };
}
function gt(t, e) {
  if (!e || !e.display) return 0;
  const { length: n, width: o } = e,
    r = t.options.borderWidth / 2,
    s = { x: n, y: o + r };
  return Math.abs(je(0, s, { x: 0, y: r }));
}
function Oe(t, e, n, o) {
  if (!o || !o.display) return;
  const {
      length: r,
      width: s,
      fill: i,
      backgroundColor: a,
      borderColor: l,
    } = o,
    d = Math.abs(e - r) + n;
  (t.beginPath(),
    ne(t, o),
    R(t, o),
    t.moveTo(d, -s),
    t.lineTo(e + n, 0),
    t.lineTo(d, s),
    i === !0
      ? ((t.fillStyle = a || l),
        t.closePath(),
        t.fill(),
        (t.shadowColor = "transparent"))
      : (t.shadowColor = o.borderShadowColor),
    t.stroke());
}
function ir(t, e, n) {
  const { x: o, y: r, x2: s, y2: i, centerX: a, centerY: l } = t,
    d = Math.atan2(i - r, s - o),
    c = Ne(e.controlPoint, 0),
    u = { x: a + Y(n, c.x, !1), y: l + Y(n, c.y, !1) };
  return $(u, { x: a, y: l }, d);
}
function yt(t, { x: e, y: n }, { angle: o, adjust: r }, s) {
  !s ||
    !s.display ||
    (t.save(), t.translate(e, n), t.rotate(o), Oe(t, 0, -r, s), t.restore());
}
function ar(t, e, n, o) {
  const { x: r, y: s, x2: i, y2: a, options: l } = e,
    { startOpts: d, endOpts: c, startAdjust: u, endAdjust: h } = Jt(e),
    g = { x: r, y: s },
    y = { x: i, y: a },
    M = ct(g, n, y, 0),
    P = ct(g, n, y, 1) - A,
    C = Ie(g, n, y, u / o),
    k = Ie(g, n, y, 1 - h / o),
    T = new Path2D();
  (t.beginPath(),
    T.moveTo(C.x, C.y),
    T.quadraticCurveTo(n.x, n.y, k.x, k.y),
    (t.shadowColor = l.borderShadowColor),
    t.stroke(T),
    (e.path = T),
    (e.ctx = t),
    yt(t, C, { angle: M, adjust: u }, d),
    yt(t, k, { angle: P, adjust: h }, c));
}
class he extends H {
  inRange(e, n, o, r) {
    const s = this.options.rotation,
      i = (this.options.borderWidth + this.options.hitTolerance) / 2;
    if (o !== "x" && o !== "y")
      return lr(
        { x: e, y: n },
        this.getProps(["width", "height", "centerX", "centerY"], r),
        s,
        i,
      );
    const {
        x: a,
        y: l,
        x2: d,
        y2: c,
      } = this.getProps(["x", "y", "x2", "y2"], r),
      u = o === "y" ? { start: l, end: c } : { start: a, end: d },
      h = $({ x: e, y: n }, this.getCenterPoint(r), L(-s));
    return h[o] >= u.start - i - N && h[o] <= u.end + i + N;
  }
  getCenterPoint(e) {
    return U(this, e);
  }
  draw(e) {
    const { width: n, height: o, centerX: r, centerY: s, options: i } = this;
    (e.save(),
      _e(e, this.getCenterPoint(), i.rotation),
      ne(e, this.options),
      e.beginPath(),
      (e.fillStyle = i.backgroundColor));
    const a = R(e, i);
    (e.ellipse(r, s, o / 2, n / 2, A / 2, 0, 2 * A),
      e.fill(),
      a && ((e.shadowColor = i.borderShadowColor), e.stroke()),
      e.restore());
  }
  get label() {
    return this.elements && this.elements[0];
  }
  resolveElementProperties(e, n) {
    return Ut(e, n);
  }
}
he.id = "ellipseAnnotation";
he.defaults = {
  adjustScaleRange: !0,
  backgroundShadowColor: "transparent",
  borderDash: [],
  borderDashOffset: 0,
  borderShadowColor: "transparent",
  borderWidth: 1,
  display: !0,
  hitTolerance: 0,
  init: void 0,
  label: Object.assign({}, oe.defaults.label),
  rotation: 0,
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  xMax: void 0,
  xMin: void 0,
  xScaleID: void 0,
  yMax: void 0,
  yMin: void 0,
  yScaleID: void 0,
  z: 0,
};
he.defaultRoutes = { borderColor: "color", backgroundColor: "color" };
he.descriptors = { label: { _fallback: !0 } };
function lr(t, e, n, o) {
  const { width: r, height: s, centerX: i, centerY: a } = e,
    l = r / 2,
    d = s / 2;
  if (l <= 0 || d <= 0) return !1;
  const c = L(n || 0),
    u = Math.cos(c),
    h = Math.sin(c),
    g = Math.pow(u * (t.x - i) + h * (t.y - a), 2),
    y = Math.pow(h * (t.x - i) - u * (t.y - a), 2);
  return g / Math.pow(l + o, 2) + y / Math.pow(d + o, 2) <= 1.0001;
}
class Se extends H {
  inRange(e, n, o, r) {
    const {
        x: s,
        y: i,
        x2: a,
        y2: l,
        width: d,
      } = this.getProps(["x", "y", "x2", "y2", "width"], r),
      c = (this.options.borderWidth + this.options.hitTolerance) / 2;
    return o !== "x" && o !== "y"
      ? to({ x: e, y: n }, this.getCenterPoint(r), d / 2, c)
      : Dt(
          o === "y"
            ? { start: i, end: l, value: n }
            : { start: s, end: a, value: e },
          c,
        );
  }
  getCenterPoint(e) {
    return U(this, e);
  }
  draw(e) {
    const n = this.options,
      o = n.borderWidth;
    if (n.radius < 0.1) return;
    (e.save(), (e.fillStyle = n.backgroundColor), ne(e, n));
    const r = R(e, n);
    (co(e, this, this.centerX, this.centerY),
      r &&
        !xe(n.pointStyle) &&
        ((e.shadowColor = n.borderShadowColor), e.stroke()),
      e.restore(),
      (n.borderWidth = o));
  }
  resolveElementProperties(e, n) {
    const o = $t(e, n);
    return ((o.initProperties = te(e, o, n)), o);
  }
}
Se.id = "pointAnnotation";
Se.defaults = {
  adjustScaleRange: !0,
  backgroundShadowColor: "transparent",
  borderDash: [],
  borderDashOffset: 0,
  borderShadowColor: "transparent",
  borderWidth: 1,
  display: !0,
  hitTolerance: 0,
  init: void 0,
  pointStyle: "circle",
  radius: 10,
  rotation: 0,
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  xAdjust: 0,
  xMax: void 0,
  xMin: void 0,
  xScaleID: void 0,
  xValue: void 0,
  yAdjust: 0,
  yMax: void 0,
  yMin: void 0,
  yScaleID: void 0,
  yValue: void 0,
  z: 0,
};
Se.defaultRoutes = { borderColor: "color", backgroundColor: "color" };
class Me extends H {
  inRange(e, n, o, r) {
    if (o !== "x" && o !== "y")
      return (
        this.options.radius >= 0.1 &&
        this.elements.length > 1 &&
        cr(this.elements, e, n, r)
      );
    const s = $(
        { x: e, y: n },
        this.getCenterPoint(r),
        L(-this.options.rotation),
      ),
      i = this.elements.map((d) => (o === "y" ? d.bY : d.bX)),
      a = Math.min(...i),
      l = Math.max(...i);
    return s[o] >= a && s[o] <= l;
  }
  getCenterPoint(e) {
    return U(this, e);
  }
  draw(e) {
    const { elements: n, options: o } = this;
    (e.save(), e.beginPath(), (e.fillStyle = o.backgroundColor), ne(e, o));
    const r = R(e, o);
    let s = !0;
    for (const i of n) s ? (e.moveTo(i.x, i.y), (s = !1)) : e.lineTo(i.x, i.y);
    (e.closePath(),
      e.fill(),
      r && ((e.shadowColor = o.borderShadowColor), e.stroke()),
      e.restore());
  }
  resolveElementProperties(e, n) {
    const o = $t(e, n),
      { sides: r, rotation: s } = n,
      i = [],
      a = (2 * A) / r;
    let l = s * St;
    for (let d = 0; d < r; d++, l += a) {
      const c = dr(o, n, l);
      ((c.initProperties = te(e, o, n)), i.push(c));
    }
    return ((o.elements = i), o);
  }
}
Me.id = "polygonAnnotation";
Me.defaults = {
  adjustScaleRange: !0,
  backgroundShadowColor: "transparent",
  borderCapStyle: "butt",
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: "miter",
  borderShadowColor: "transparent",
  borderWidth: 1,
  display: !0,
  hitTolerance: 0,
  init: void 0,
  point: { radius: 0 },
  radius: 10,
  rotation: 0,
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  sides: 3,
  xAdjust: 0,
  xMax: void 0,
  xMin: void 0,
  xScaleID: void 0,
  xValue: void 0,
  yAdjust: 0,
  yMax: void 0,
  yMin: void 0,
  yScaleID: void 0,
  yValue: void 0,
  z: 0,
};
Me.defaultRoutes = { borderColor: "color", backgroundColor: "color" };
function dr(
  { centerX: t, centerY: e },
  { radius: n, borderWidth: o, hitTolerance: r },
  s,
) {
  const i = (o + r) / 2,
    a = Math.sin(s),
    l = Math.cos(s),
    d = { x: t + a * n, y: e - l * n };
  return {
    type: "point",
    optionScope: "point",
    properties: {
      x: d.x,
      y: d.y,
      centerX: d.x,
      centerY: d.y,
      bX: t + a * (n + i),
      bY: e - l * (n + i),
    },
  };
}
function cr(t, e, n, o) {
  let r = !1,
    s = t[t.length - 1].getProps(["bX", "bY"], o);
  for (const i of t) {
    const a = i.getProps(["bX", "bY"], o);
    (a.bY > n != s.bY > n &&
      e < ((s.bX - a.bX) * (n - a.bY)) / (s.bY - a.bY) + a.bX &&
      (r = !r),
      (s = a));
  }
  return r;
}
const W = {
  box: oe,
  doughnutLabel: ke,
  ellipse: he,
  label: ue,
  line: fe,
  point: Se,
  polygon: Me,
};
Object.keys(W).forEach((t) => {
  pn.describe(`elements.${W[t].id}`, {
    _fallback: "plugins.annotation.common",
  });
});
const ur = { update: Object.assign },
  fr = He.concat(pe),
  mt = (t, e) => (Q(e) ? Le(t, e) : t),
  Re = (t) => t === "color" || t === "font";
function Ue(t = "line") {
  return W[t] ? t : "line";
}
function hr(t, e, n, o) {
  const r = gr(t, n.animations, o),
    s = e.annotations,
    i = pr(e.elements, s);
  for (let a = 0; a < s.length; a++) {
    const l = s[a],
      d = Gt(i, a, l.type),
      c = l.setContext(mr(t, d, i, l)),
      u = d.resolveElementProperties(t, c);
    ((u.skip = br(u)),
      "elements" in u && (yr(d, u.elements, c, r), delete u.elements),
      O(d.x) || Object.assign(d, u),
      Object.assign(d, u.initProperties),
      (u.options = Kt(c)),
      r.update(d, u));
  }
}
function br(t) {
  return isNaN(t.x) || isNaN(t.y);
}
function gr(t, e, n) {
  return n === "reset" || n === "none" || n === "resize" ? ur : new yn(t, e);
}
function yr(t, e, n, o) {
  const r = t.elements || (t.elements = []);
  r.length = e.length;
  for (let s = 0; s < e.length; s++) {
    const i = e[s],
      a = i.properties,
      l = Gt(r, s, i.type, i.initProperties),
      d = n[i.optionScope].override(i);
    ((a.options = Kt(d)), o.update(l, a));
  }
}
function Gt(t, e, n, o) {
  const r = W[Ue(n)];
  let s = t[e];
  return (
    (!s || !(s instanceof r)) && ((s = t[e] = new r()), Object.assign(s, o)),
    s
  );
}
function Kt(t) {
  const e = W[Ue(t.type)],
    n = {};
  ((n.id = t.id),
    (n.type = t.type),
    (n.drawTime = t.drawTime),
    Object.assign(n, Le(t, e.defaults), Le(t, e.defaultRoutes)));
  for (const o of fr) n[o] = t[o];
  return n;
}
function Le(t, e) {
  const n = {};
  for (const o of Object.keys(e)) {
    const r = e[o],
      s = t[o];
    Re(o) && Z(s) ? (n[o] = s.map((i) => mt(i, r))) : (n[o] = mt(s, r));
  }
  return n;
}
function mr(t, e, n, o) {
  return (
    e.$context ||
    (e.$context = Object.assign(Object.create(t.getContext()), {
      element: e,
      get elements() {
        return n.filter((r) => r && r.options);
      },
      id: o.id,
      type: "annotation",
    }))
  );
}
function pr(t, e) {
  const n = e.length,
    o = t.length;
  if (o < n) {
    const r = n - o;
    t.splice(o, 0, ...new Array(r));
  } else o > n && t.splice(n, o - n);
  return t;
}
var vr = "3.1.0";
const z = new Map(),
  pt = (t) => t.type !== "doughnutLabel",
  wr = He.concat(pe);
var xr = {
  id: "annotation",
  version: vr,
  beforeRegister() {
    no("chart.js", "4.0", le.version);
  },
  afterRegister() {
    le.register(W);
  },
  afterUnregister() {
    le.unregister(W);
  },
  beforeInit(t) {
    z.set(t, {
      annotations: [],
      elements: [],
      visibleElements: [],
      listeners: {},
      listened: !1,
      moveListened: !1,
      hooks: {},
      hooked: !1,
      hovered: [],
    });
  },
  beforeUpdate(t, e, n) {
    const o = z.get(t),
      r = (o.annotations = []);
    let s = n.annotations;
    (Q(s)
      ? Object.keys(s).forEach((i) => {
          const a = s[i];
          Q(a) && ((a.id = i), r.push(a));
        })
      : Z(s) && r.push(...s),
      zo(r.filter(pt), t.scales));
  },
  afterDataLimits(t, e) {
    const n = z.get(t);
    Lo(
      t,
      e.scale,
      n.annotations.filter(pt).filter((o) => o.display && o.adjustScaleRange),
    );
  },
  afterUpdate(t, e, n) {
    const o = z.get(t);
    (jo(t, o, n),
      hr(t, o, n, e.mode),
      (o.visibleElements = o.elements.filter(
        (r) => !r.skip && r.options.display,
      )),
      Ro(t, o, n));
  },
  beforeDatasetsDraw(t, e, n) {
    ie(t, "beforeDatasetsDraw", n.clip);
  },
  afterDatasetsDraw(t, e, n) {
    ie(t, "afterDatasetsDraw", n.clip);
  },
  beforeDatasetDraw(t, e, n) {
    ie(t, e.index, n.clip);
  },
  beforeDraw(t, e, n) {
    ie(t, "beforeDraw", n.clip);
  },
  afterDraw(t, e, n) {
    ie(t, "afterDraw", n.clip);
  },
  beforeEvent(t, e, n) {
    const o = z.get(t);
    Io(o, e.event, n) && (e.changed = !0);
  },
  afterDestroy(t) {
    z.delete(t);
  },
  getAnnotations(t) {
    const e = z.get(t);
    return e ? e.elements : [];
  },
  _getAnnotationElementsAtEventForMode(t, e, n) {
    return Xe(t, e, n);
  },
  defaults: {
    animations: {
      numbers: {
        properties: [
          "x",
          "y",
          "x2",
          "y2",
          "width",
          "height",
          "centerX",
          "centerY",
          "pointX",
          "pointY",
          "radius",
        ],
        type: "number",
      },
      colors: { properties: ["backgroundColor", "borderColor"], type: "color" },
    },
    clip: !0,
    interaction: { mode: void 0, axis: void 0, intersect: void 0 },
    common: { drawTime: "afterDatasetsDraw", init: !1, label: {} },
  },
  descriptors: {
    _indexable: !1,
    _scriptable: (t) => !wr.includes(t) && t !== "init",
    annotations: {
      _allKeys: !1,
      _fallback: (t, e) => `elements.${W[Ue(e.type)].id}`,
    },
    interaction: { _fallback: !0 },
    common: { label: { _indexable: Re, _fallback: !0 }, _indexable: Re },
  },
  additionalOptionScopes: [""],
};
function ie(t, e, n) {
  const { ctx: o, chartArea: r } = t,
    s = z.get(t);
  n && un(o, r);
  const i = _r(s.visibleElements, e).sort(
    (a, l) => a.element.options.z - l.element.options.z,
  );
  for (const a of i) Cr(o, r, s, a);
  n && fn(o);
}
function _r(t, e) {
  const n = [];
  for (const o of t)
    if (
      (o.options.drawTime === e && n.push({ element: o, main: !0 }),
      o.elements && o.elements.length)
    )
      for (const r of o.elements)
        r.options.display && r.options.drawTime === e && n.push({ element: r });
  return n;
}
function Cr(t, e, n, o) {
  const r = o.element;
  o.main
    ? (rt(n, r, "beforeDraw"), r.draw(t, e), rt(n, r, "afterDraw"))
    : r.draw(t, e);
}
const kr = { class: "chart chart--sales" },
  Sr = { class: "chart--sales__header" },
  Mr = { class: "chart--sales__year-selector" },
  Pr = ["onClick"],
  Dr = { class: "chart--sales__chart" },
  Ar = { key: 0, class: "chart--sales__loading" },
  Tr = ce({
    __name: "ChartSales",
    setup(t) {
      le.register(vn, wn, xn, _n, Cn, kn, Sn, Mn, xr);
      const e = {
        id: "gridAndHover",
        afterDraw: (f) => {
          const b = f.ctx,
            p = f.chartArea,
            X = f.scales;
          if (!p || !X.x || !X.y) return;
          (b.save(),
            (b.strokeStyle = "rgba(0, 0, 0, 0.1)"),
            (b.lineWidth = 1),
            b.setLineDash([3, 3]));
          const be = X.x;
          if (be) {
            const E = be.ticks || [];
            for (const q of E) {
              const _ = be.getPixelForValue(q.value);
              !Number.isNaN(_) &&
                _ >= p.left &&
                _ <= p.right &&
                (b.beginPath(),
                b.moveTo(Math.round(_), p.top),
                b.lineTo(Math.round(_), p.bottom),
                b.stroke());
            }
          }
          const F = X.y;
          if (F) {
            const E = F.ticks || [];
            for (const q of E) {
              const _ = F.getPixelForValue(q.value);
              !Number.isNaN(_) &&
                _ >= p.top &&
                _ <= p.bottom &&
                (b.beginPath(),
                b.moveTo(p.left, Math.round(_)),
                b.lineTo(p.right, Math.round(_)),
                b.stroke());
            }
          }
          b.restore();
          const V = f.tooltip;
          if (V && V.opacity > 0 && V.dataPoints && V.dataPoints.length > 0) {
            const E = V.dataPoints.find((q) => q.datasetIndex === 0);
            if (E && E.dataIndex !== void 0) {
              const _ = f.getDatasetMeta(0)?.data?.[E.dataIndex];
              if (_) {
                const ge = _.x;
                typeof ge == "number" &&
                  !Number.isNaN(ge) &&
                  (b.save(),
                  (b.strokeStyle = "rgba(200, 200, 200, 0.6)"),
                  (b.lineWidth = 2),
                  b.setLineDash([]),
                  b.beginPath(),
                  b.moveTo(Math.round(ge), p.top),
                  b.lineTo(Math.round(ge), p.bottom),
                  b.stroke(),
                  b.restore());
              }
            }
          }
        },
      };
      le.register(e);
      const n = [
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Sep",
          "Oct",
          "Nov",
          "Dic",
        ],
        o = ze(),
        r = j(new Date().getFullYear()),
        s = j([]),
        i = j({}),
        a = j(!1),
        l = j(!1),
        d = j(null),
        c = j(null),
        u = async (f) => {
          if (!i.value[f])
            try {
              a.value = !0;
              const b = await o("orders/sales-by-month", {
                  method: "GET",
                  params: { year: f },
                }),
                p = Array.isArray(b.data) ? b.data : [],
                X = Array.from({ length: 12 }, (be, F) => {
                  const V = p.find((E) => E.month === F);
                  return { mes: n[F] ?? "", monto: V?.total ?? 0 };
                });
              i.value = { ...i.value, [f]: X };
            } catch {
            } finally {
              a.value = !1;
            }
        },
        h = J(
          () =>
            i.value[r.value] ??
            Array.from({ length: 12 }, (f, b) => ({
              mes: n[b] ?? "",
              monto: 0,
            })),
        ),
        g = () => {
          l.value = !l.value;
        },
        y = (f) => {
          ((r.value = f), (l.value = !1), u(f));
        },
        M = (f) => {
          d.value &&
            c.value &&
            !d.value.contains(f.target) &&
            !c.value.contains(f.target) &&
            (l.value = !1);
        };
      (rn(() => {
        const f = new Date().getFullYear();
        ((s.value = [f, f - 1, f - 2].filter((b) => b > 2020)),
          u(r.value),
          document.addEventListener("click", M));
      }),
        sn(() => {
          document.removeEventListener("click", M);
        }));
      const P = J(() =>
          h.value.length === 0
            ? 0
            : h.value.reduce((b, p) => b + p.monto, 0) / h.value.length,
        ),
        C = (f) =>
          f >= 1e6
            ? `$${(f / 1e6).toFixed(1)}M`
            : f >= 1e3
              ? `$${(f / 1e3).toFixed(0)}K`
              : `$${f}`,
        k = (f) =>
          ({
            Ene: "Enero",
            Feb: "Febrero",
            Mar: "Marzo",
            Abr: "Abril",
            May: "Mayo",
            Jun: "Junio",
            Jul: "Julio",
            Ago: "Agosto",
            Sep: "Septiembre",
            Oct: "Octubre",
            Nov: "Noviembre",
            Dic: "Diciembre",
          })[f] || f,
        T = J(() => ({
          labels: h.value.map((f) => f.mes),
          datasets: [
            {
              label: "Ventas",
              data: h.value.map((f) => f.monto),
              backgroundColor: "#ffd699",
              borderColor: "#ffd699",
              borderWidth: 0,
            },
          ],
        })),
        I = J(() => ({
          responsive: !0,
          maintainAspectRatio: !1,
          layout: { padding: { top: 20, right: 30, left: 10, bottom: 5 } },
          interaction: { intersect: !1, mode: "index" },
          plugins: {
            legend: { display: !1 },
            annotation: {
              annotations: {
                averageLine: {
                  type: "line",
                  yMin: P.value,
                  yMax: P.value,
                  borderColor: "#ef4444",
                  borderWidth: 2,
                  borderDash: [5, 5],
                  label: {
                    display: !0,
                    content: "x̄",
                    position: "end",
                    backgroundColor: "transparent",
                    color: "#ef4444",
                    font: { size: 11, family: "inherit" },
                    xAdjust: 10,
                    yAdjust: 0,
                    textAlign: "start",
                  },
                  xMin: void 0,
                  xMax: void 0,
                },
              },
            },
            tooltip: {
              enabled: !0,
              displayColors: !1,
              backgroundColor: "#fff",
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 4,
              padding: 8,
              titleColor: "#000",
              bodyColor: "#000",
              titleFont: { size: 11, weight: "normal" },
              bodyFont: { size: 11, weight: "normal" },
              callbacks: {
                title: (f) => (f?.length && f[0] ? k(f[0].label) : ""),
                label: (f) => (f.datasetIndex === 0 ? vt(f.parsed.y) : ""),
                afterLabel: (f) => (f.datasetIndex === 0 ? "Monto" : ""),
                labelTextColor: () => "#000",
              },
              filter: (f) => f.datasetIndex === 0,
              caretSize: 0,
              caretPadding: 0,
              cornerRadius: 4,
              multiKeyBackground: "#fff",
            },
          },
          scales: {
            x: {
              grid: {
                display: !0,
                drawBorder: !1,
                color: "rgba(0, 0, 0, 0.1)",
                lineWidth: 1,
              },
              ticks: { font: { size: 11 } },
            },
            y: {
              beginAtZero: !0,
              grid: {
                display: !0,
                drawBorder: !1,
                color: "rgba(0, 0, 0, 0.1)",
                lineWidth: 1,
              },
              ticks: { font: { size: 11 }, callback: (f) => C(Number(f)) },
              width: 60,
            },
          },
          elements: {
            bar: {
              backgroundColor: "#ffd699",
              borderColor: "#ffd699",
              borderWidth: 0,
            },
          },
          animation: { duration: 0 },
        }));
      return (f, b) => (
        S(),
        D("section", kr, [
          w("div", Sr, [
            b[0] ||
              (b[0] = w(
                "h2",
                { class: "chart--sales__title" },
                "Estadísticas de Ventas",
                -1,
              )),
            w("div", Mr, [
              w(
                "button",
                {
                  ref_key: "dropdownButton",
                  ref: d,
                  class: "chart--sales__year-button",
                  onClick: g,
                },
                [
                  an(K(r.value) + " ", 1),
                  m(
                    v(Dn),
                    {
                      class: qe([
                        "chart--sales__year-button__icon",
                        { "chart--sales__year-button__icon--open": l.value },
                      ]),
                    },
                    null,
                    8,
                    ["class"],
                  ),
                ],
                512,
              ),
              l.value
                ? (S(),
                  D(
                    "div",
                    {
                      key: 0,
                      ref_key: "dropdownMenu",
                      ref: c,
                      class: "chart--sales__year-menu",
                    },
                    [
                      (S(!0),
                      D(
                        xt,
                        null,
                        _t(
                          s.value,
                          (p) => (
                            S(),
                            D(
                              "button",
                              {
                                key: p,
                                class: qe([
                                  "chart--sales__year-menu__item",
                                  {
                                    "chart--sales__year-menu__item--active":
                                      p === r.value,
                                  },
                                ]),
                                onClick: (X) => y(p),
                              },
                              K(p),
                              11,
                              Pr,
                            )
                          ),
                        ),
                        128,
                      )),
                    ],
                    512,
                  ))
                : ln("", !0),
            ]),
          ]),
          w("div", Dr, [
            a.value
              ? (S(),
                D("div", Ar, [
                  ...(b[1] || (b[1] = [w("p", null, "Cargando datos...", -1)])),
                ]))
              : (S(),
                Ct(
                  v(Pn),
                  { key: 1, data: T.value, options: I.value },
                  null,
                  8,
                  ["data", "options"],
                )),
          ]),
        ])
      );
    },
  }),
  jr = Object.assign(Tr, { __name: "ChartSales" }),
  Ir = { class: "statistics statistics--default" },
  Er = { class: "statistics--default__container" },
  Or = { class: "statistics--default__chart" },
  Rr = { class: "statistics--default__cards" },
  Lr = ce({
    __name: "StatisticsDefault",
    setup(t) {
      const e = j({
          pending: 0,
          published: 0,
          archived: 0,
          rejected: 0,
          reservasUsadas: 0,
          reservasLibres: 0,
          destacadosUsados: 0,
          destacadosLibres: 0,
          ordenes: 0,
          usuarios: 0,
          categorias: 0,
          condiciones: 0,
          faqs: 0,
          packs: 0,
          regiones: 0,
          comunas: 0,
        }),
        n = ze(),
        o = j(!0);
      return (
        wt(
          () => !0,
          async () => {
            try {
              o.value = !0;
              const s = (
                await n("indicators/dashboard-stats", { method: "GET" })
              ).data;
              s &&
                (e.value = {
                  pending: s.pending ?? 0,
                  published: s.published ?? 0,
                  archived: s.archived ?? 0,
                  rejected: s.rejected ?? 0,
                  reservasUsadas: s.reservasUsadas ?? 0,
                  reservasLibres: s.reservasLibres ?? 0,
                  destacadosUsados: s.destacadosUsados ?? 0,
                  destacadosLibres: s.destacadosLibres ?? 0,
                  ordenes: s.ordenes ?? 0,
                  usuarios: s.usuarios ?? 0,
                  categorias: s.categorias ?? 0,
                  condiciones: s.condiciones ?? 0,
                  faqs: s.faqs ?? 0,
                  packs: s.packs ?? 0,
                  regiones: s.regiones ?? 0,
                  comunas: s.comunas ?? 0,
                });
            } catch {
            } finally {
              o.value = !1;
            }
          },
          { immediate: !0 },
        ),
        (r, s) => (
          S(),
          D("div", Ir, [
            w("div", Er, [
              w("div", Or, [m(jr)]),
              w("div", Rr, [
                m(
                  x,
                  {
                    title: "Anuncios Pendientes",
                    value: e.value.pending,
                    link: { text: "Ver pendientes", to: "/ads/pending" },
                    icon: v(An),
                    "icon-color": "#ca8a04",
                    "icon-bg-color": "#fef9c3",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Anuncios Publicados",
                    value: e.value.published,
                    link: { text: "Ver publicados", to: "/ads/active" },
                    icon: v(Pe),
                    "icon-color": "#16a34a",
                    "icon-bg-color": "#dcfce7",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Anuncios Archivados",
                    value: e.value.archived,
                    link: { text: "Ver archivados", to: "/ads/expired" },
                    icon: v(Ln),
                    "icon-color": "#2563eb",
                    "icon-bg-color": "#dbeafe",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Anuncios Rechazados",
                    value: e.value.rejected,
                    link: { text: "Ver rechazados", to: "/ads/rejected" },
                    icon: v(dn),
                    "icon-color": "#dc2626",
                    "icon-bg-color": "#fee2e2",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Reservas Usadas",
                    value: e.value.reservasUsadas,
                    link: {
                      text: "Ver reservas usadas",
                      to: "/reservations/used",
                    },
                    icon: v(Pe),
                    "icon-color": "#0d9488",
                    "icon-bg-color": "#ccfbf1",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Reservas Libres",
                    value: e.value.reservasLibres,
                    link: {
                      text: "Ver reservas libres",
                      to: "/reservations/free",
                    },
                    icon: v(Qe),
                    "icon-color": "#0d9488",
                    "icon-bg-color": "#ccfbf1",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Destacados Usados",
                    value: e.value.destacadosUsados,
                    link: {
                      text: "Ver destacados usados",
                      to: "/featured/used",
                    },
                    icon: v(Pe),
                    "icon-color": "#ca8a04",
                    "icon-bg-color": "#fef9c3",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Destacados Libres",
                    value: e.value.destacadosLibres,
                    link: {
                      text: "Ver destacados libres",
                      to: "/featured/free",
                    },
                    icon: v(Qe),
                    "icon-color": "#ca8a04",
                    "icon-bg-color": "#fef9c3",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Órdenes",
                    value: e.value.ordenes,
                    link: { text: "Ver órdenes", to: "/orders" },
                    icon: v(In),
                    "icon-color": "#0d9488",
                    "icon-bg-color": "#ccfbf1",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Usuarios",
                    value: e.value.usuarios,
                    link: { text: "Ver usuarios", to: "/users" },
                    icon: v(En),
                    "icon-color": "#7c3aed",
                    "icon-bg-color": "#ede9fe",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Categorías",
                    value: e.value.categorias,
                    link: { text: "Ver categorías", to: "/categories" },
                    icon: v(Tn),
                    "icon-color": "#db2777",
                    "icon-bg-color": "#fce7f3",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Condiciones",
                    value: e.value.condiciones,
                    link: { text: "Ver condiciones", to: "/conditions" },
                    icon: v(jn),
                    "icon-color": "#ca8a04",
                    "icon-bg-color": "#fef9c3",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "FAQ",
                    value: e.value.faqs,
                    link: { text: "Ver FAQs", to: "/faqs" },
                    icon: v(On),
                    "icon-color": "#7c3aed",
                    "icon-bg-color": "#ede9fe",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Packs",
                    value: e.value.packs,
                    link: { text: "Ver packs", to: "/packs" },
                    icon: v(cn),
                    "icon-color": "#db2777",
                    "icon-bg-color": "#fce7f3",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Regiones",
                    value: e.value.regiones,
                    link: { text: "Ver regiones", to: "/regions" },
                    icon: v(Rn),
                    "icon-color": "#059669",
                    "icon-bg-color": "#d1fae5",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
                m(
                  x,
                  {
                    title: "Comunas",
                    value: e.value.comunas,
                    link: { text: "Ver comunas", to: "/communes" },
                    icon: v(kt),
                    "icon-color": "#0d9488",
                    "icon-bg-color": "#ccfbf1",
                  },
                  null,
                  8,
                  ["value", "icon"],
                ),
              ]),
            ]),
          ])
        )
      );
    },
  }),
  zr = Object.assign(Lr, { __name: "StatisticsDefault" }),
  qr = ce({
    __name: "index",
    setup(t) {
      return (e, n) => (S(), D("div", null, [m(Jn), m(zr)]));
    },
  });
export { qr as default };
//# sourceMappingURL=CMszMMbI.js.map
