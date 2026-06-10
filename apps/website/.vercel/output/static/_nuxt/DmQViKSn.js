import {
  c as hn,
  d as ds,
  S as fs,
  a as hs,
  m as oa,
  D as J,
  b as E,
  u as Ke,
  e as Wr,
  i as fr,
  f as zr,
  r as Oe,
  s as sa,
  g as jr,
  h as ia,
  j as aa,
  k as ca,
  l as ps,
  n as la,
  o as ua,
  p as ms,
  q as gs,
  t as da,
  v as fa,
  w as Le,
  x as pn,
  y as Qt,
  z as _s,
  A as ys,
  B as Bn,
  C as qr,
  E as ha,
  F as pa,
  G as $n,
  H as ma,
  I as mn,
  J as Un,
  K as Vr,
  L as ga,
  M as Gr,
  N as re,
  O as we,
  P as vs,
  Q as ze,
  R as Tt,
  T as Hn,
  U as bs,
  V as Ss,
  W as Be,
  X as _a,
  Y as Ee,
  Z as Yr,
  _ as Es,
  $ as Kr,
  a0 as Xr,
  a1 as gn,
  a2 as ya,
  a3 as ws,
  a4 as Jr,
  a5 as va,
  a6 as Zr,
  a7 as ba,
  a8 as hr,
  a9 as en,
  aa as Sa,
  ab as Ea,
  ac as ne,
  ad as Me,
  ae as Qr,
  af as wa,
  ag as Wn,
  ah as ka,
  ai as ct,
  aj as Ia,
  ak as Ca,
  al as pr,
  am as ks,
  an as In,
  ao as Z,
  ap as mr,
  aq as xa,
  ar as eo,
  as as Et,
  at as lt,
  au as to,
  av as no,
  aw as Ta,
  ax as Is,
  ay as Cs,
  az as Ra,
  aA as Ma,
  aB as Aa,
  aC as Oa,
  aD as Da,
  aE as gr,
  aF as zn,
  aG as qe,
  aH as La,
  aI as Na,
  aJ as Pa,
  aK as Fa,
  aL as Ba,
  aM as $a,
  aN as Ua,
  aO as Ha,
  aP as Wa,
  aQ as xs,
  aR as za,
  aS as ja,
  aT as Ts,
  aU as qa,
  aV as jn,
  aW as Va,
  aX as Ga,
  aY as Ya,
} from "./BK8sApmn.js";
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
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "3684acf1-9cb6-4203-8ac3-e4b51bd4534d"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-3684acf1-9cb6-4203-8ac3-e4b51bd4534d"));
} catch {}
const Ka = "7";
function Xa(e) {
  const t = e.protocol ? `${e.protocol}:` : "",
    n = e.port ? `:${e.port}` : "";
  return `${t}//${e.host}${n}${e.path ? `/${e.path}` : ""}/api/`;
}
function Ja(e) {
  return `${Xa(e)}${e.projectId}/envelope/`;
}
function Za(e, t) {
  const n = { sentry_version: Ka };
  return (
    e.publicKey && (n.sentry_key = e.publicKey),
    t && (n.sentry_client = `${t.name}/${t.version}`),
    new URLSearchParams(n).toString()
  );
}
function Qa(e, t, n) {
  return t || `${Ja(e)}?${Za(e, n)}`;
}
function ec(e, t, n) {
  const r = [
    { type: "client_report" },
    { timestamp: ds(), discarded_events: e },
  ];
  return hn(t ? { dsn: t } : {}, [r]);
}
function Rs(e) {
  const t = [];
  e.message && t.push(e.message);
  try {
    const n = e.exception.values[e.exception.values.length - 1];
    n?.value && (t.push(n.value), n.type && t.push(`${n.type}: ${n.value}`));
  } catch {}
  return t;
}
function tc(e) {
  const {
    trace_id: t,
    parent_span_id: n,
    span_id: r,
    status: o,
    origin: s,
    data: i,
    op: a,
  } = e.contexts?.trace ?? {};
  return {
    data: i ?? {},
    description: e.transaction,
    op: a,
    parent_span_id: n,
    span_id: r ?? "",
    start_timestamp: e.start_timestamp ?? 0,
    status: o,
    timestamp: e.timestamp,
    trace_id: t ?? "",
    origin: s,
    profile_id: i?.[hs],
    exclusive_time: i?.[fs],
    measurements: e.measurements,
    is_segment: !0,
  };
}
function nc(e) {
  return {
    type: "transaction",
    timestamp: e.timestamp,
    start_timestamp: e.start_timestamp,
    transaction: e.description,
    contexts: {
      trace: {
        trace_id: e.trace_id,
        span_id: e.span_id,
        parent_span_id: e.parent_span_id,
        op: e.op,
        status: e.status,
        origin: e.origin,
        data: {
          ...e.data,
          ...(e.profile_id && { [hs]: e.profile_id }),
          ...(e.exclusive_time && { [fs]: e.exclusive_time }),
        },
      },
    },
    measurements: e.measurements,
  };
}
const ro = "Not capturing exception because it's already been captured.",
  oo = "Discarded session because of missing or non-string release",
  Ms = Symbol.for("SentryInternalError"),
  As = Symbol.for("SentryDoNotSendEventError");
function jt(e) {
  return { message: e, [Ms]: !0 };
}
function Cn(e) {
  return { message: e, [As]: !0 };
}
function so(e) {
  return !!e && typeof e == "object" && Ms in e;
}
function io(e) {
  return !!e && typeof e == "object" && As in e;
}
class rc {
  constructor(t) {
    if (
      ((this._options = t),
      (this._integrations = {}),
      (this._numProcessing = 0),
      (this._outcomes = {}),
      (this._hooks = {}),
      (this._eventProcessors = []),
      t.dsn
        ? (this._dsn = oa(t.dsn))
        : J && E.warn("No DSN provided, client will not send events."),
      this._dsn)
    ) {
      const n = Qa(this._dsn, t.tunnel, t._metadata ? t._metadata.sdk : void 0);
      this._transport = t.transport({
        tunnel: this._options.tunnel,
        recordDroppedEvent: this.recordDroppedEvent.bind(this),
        ...t.transportOptions,
        url: n,
      });
    }
  }
  captureException(t, n, r) {
    const o = Ke();
    if (Wr(t)) return (J && E.log(ro), o);
    const s = { event_id: o, ...n };
    return (
      this._process(
        this.eventFromException(t, s).then((i) => this._captureEvent(i, s, r)),
      ),
      s.event_id
    );
  }
  captureMessage(t, n, r, o) {
    const s = { event_id: Ke(), ...r },
      i = ys(t) ? t : String(t),
      a = fr(t)
        ? this.eventFromMessage(i, n, s)
        : this.eventFromException(t, s);
    return (
      this._process(a.then((c) => this._captureEvent(c, s, o))),
      s.event_id
    );
  }
  captureEvent(t, n, r) {
    const o = Ke();
    if (n?.originalException && Wr(n.originalException))
      return (J && E.log(ro), o);
    const s = { event_id: o, ...n },
      i = t.sdkProcessingMetadata || {},
      a = i.capturedSpanScope,
      c = i.capturedSpanIsolationScope;
    return (this._process(this._captureEvent(t, s, a || r, c)), s.event_id);
  }
  captureSession(t) {
    (this.sendSession(t), zr(t, { init: !1 }));
  }
  getDsn() {
    return this._dsn;
  }
  getOptions() {
    return this._options;
  }
  getSdkMetadata() {
    return this._options._metadata;
  }
  getTransport() {
    return this._transport;
  }
  flush(t) {
    const n = this._transport;
    return n
      ? (this.emit("flush"),
        this._isClientDoneProcessing(t).then((r) =>
          n.flush(t).then((o) => r && o),
        ))
      : Oe(!0);
  }
  close(t) {
    return this.flush(t).then(
      (n) => ((this.getOptions().enabled = !1), this.emit("close"), n),
    );
  }
  getEventProcessors() {
    return this._eventProcessors;
  }
  addEventProcessor(t) {
    this._eventProcessors.push(t);
  }
  init() {
    (this._isEnabled() ||
      this._options.integrations.some(({ name: t }) =>
        t.startsWith("Spotlight"),
      )) &&
      this._setupIntegrations();
  }
  getIntegrationByName(t) {
    return this._integrations[t];
  }
  addIntegration(t) {
    const n = this._integrations[t.name];
    (sa(this, t, this._integrations), n || jr(this, [t]));
  }
  sendEvent(t, n = {}) {
    this.emit("beforeSendEvent", t, n);
    let r = ia(t, this._dsn, this._options._metadata, this._options.tunnel);
    for (const s of n.attachments || []) r = aa(r, ca(s));
    const o = this.sendEnvelope(r);
    o && o.then((s) => this.emit("afterSendEvent", t, s), null);
  }
  sendSession(t) {
    const { release: n, environment: r = ps } = this._options;
    if ("aggregates" in t) {
      const s = t.attrs || {};
      if (!s.release && !n) {
        J && E.warn(oo);
        return;
      }
      ((s.release = s.release || n),
        (s.environment = s.environment || r),
        (t.attrs = s));
    } else {
      if (!t.release && !n) {
        J && E.warn(oo);
        return;
      }
      ((t.release = t.release || n), (t.environment = t.environment || r));
    }
    this.emit("beforeSendSession", t);
    const o = la(t, this._dsn, this._options._metadata, this._options.tunnel);
    this.sendEnvelope(o);
  }
  recordDroppedEvent(t, n, r = 1) {
    if (this._options.sendClientReports) {
      const o = `${t}:${n}`;
      (J && E.log(`Recording outcome: "${o}"${r > 1 ? ` (${r} times)` : ""}`),
        (this._outcomes[o] = (this._outcomes[o] || 0) + r));
    }
  }
  on(t, n) {
    const r = (this._hooks[t] = this._hooks[t] || []);
    return (
      r.push(n),
      () => {
        const o = r.indexOf(n);
        o > -1 && r.splice(o, 1);
      }
    );
  }
  emit(t, ...n) {
    const r = this._hooks[t];
    r && r.forEach((o) => o(...n));
  }
  sendEnvelope(t) {
    return (
      this.emit("beforeEnvelope", t),
      this._isEnabled() && this._transport
        ? this._transport
            .send(t)
            .then(
              null,
              (n) => (J && E.error("Error while sending envelope:", n), n),
            )
        : (J && E.error("Transport disabled"), Oe({}))
    );
  }
  _setupIntegrations() {
    const { integrations: t } = this._options;
    ((this._integrations = ua(this, t)), jr(this, t));
  }
  _updateSessionFromEvent(t, n) {
    let r = n.level === "fatal",
      o = !1;
    const s = n.exception?.values;
    if (s) {
      o = !0;
      for (const c of s)
        if (c.mechanism?.handled === !1) {
          r = !0;
          break;
        }
    }
    const i = t.status === "ok";
    ((i && t.errors === 0) || (i && r)) &&
      (zr(t, {
        ...(r && { status: "crashed" }),
        errors: t.errors || Number(o || r),
      }),
      this.captureSession(t));
  }
  _isClientDoneProcessing(t) {
    return new ms((n) => {
      let r = 0;
      const o = 1,
        s = setInterval(() => {
          this._numProcessing == 0
            ? (clearInterval(s), n(!0))
            : ((r += o), t && r >= t && (clearInterval(s), n(!1)));
        }, o);
    });
  }
  _isEnabled() {
    return this.getOptions().enabled !== !1 && this._transport !== void 0;
  }
  _prepareEvent(t, n, r, o) {
    const s = this.getOptions(),
      i = Object.keys(this._integrations);
    return (
      !n.integrations && i?.length && (n.integrations = i),
      this.emit("preprocessEvent", t, n),
      t.type || o.setLastEventId(t.event_id || n.event_id),
      gs(s, t, n, r, this, o).then((a) => {
        if (a === null) return a;
        (this.emit("postprocessEvent", a, n),
          (a.contexts = { trace: da(r), ...a.contexts }));
        const c = fa(this, r);
        return (
          (a.sdkProcessingMetadata = {
            dynamicSamplingContext: c,
            ...a.sdkProcessingMetadata,
          }),
          a
        );
      })
    );
  }
  _captureEvent(t, n = {}, r = Le(), o = pn()) {
    return (
      J &&
        qn(t) &&
        E.log(`Captured error event \`${Rs(t)[0] || "<unknown>"}\``),
      this._processEvent(t, n, r, o).then(
        (s) => s.event_id,
        (s) => {
          J &&
            (io(s) ? E.log(s.message) : so(s) ? E.warn(s.message) : E.warn(s));
        },
      )
    );
  }
  _processEvent(t, n, r, o) {
    const s = this.getOptions(),
      { sampleRate: i } = s,
      a = Os(t),
      c = qn(t),
      u = t.type || "error",
      d = `before send for type \`${u}\``,
      l = typeof i > "u" ? void 0 : Bn(i);
    if (c && typeof l == "number" && Math.random() > l)
      return (
        this.recordDroppedEvent("sample_rate", "error"),
        Qt(
          Cn(
            `Discarding event because it's not included in the random sample (sampling rate = ${i})`,
          ),
        )
      );
    const f = u === "replay_event" ? "replay" : u;
    return this._prepareEvent(t, n, r, o)
      .then((h) => {
        if (h === null)
          throw (
            this.recordDroppedEvent("event_processor", f),
            Cn("An event processor returned `null`, will not send event.")
          );
        if (n.data && n.data.__sentry__ === !0) return h;
        const m = sc(this, s, h, n);
        return oc(m, d);
      })
      .then((h) => {
        if (h === null) {
          if ((this.recordDroppedEvent("before_send", f), a)) {
            const g = 1 + (t.spans || []).length;
            this.recordDroppedEvent("before_send", "span", g);
          }
          throw Cn(`${d} returned \`null\`, will not send event.`);
        }
        const p = r.getSession() || o.getSession();
        if ((c && p && this._updateSessionFromEvent(p, h), a)) {
          const _ = h.sdkProcessingMetadata?.spanCountBeforeProcessing || 0,
            g = h.spans ? h.spans.length : 0,
            v = _ - g;
          v > 0 && this.recordDroppedEvent("before_send", "span", v);
        }
        const m = h.transaction_info;
        if (a && m && h.transaction !== t.transaction) {
          const _ = "custom";
          h.transaction_info = { ...m, source: _ };
        }
        return (this.sendEvent(h, n), h);
      })
      .then(null, (h) => {
        throw io(h) || so(h)
          ? h
          : (this.captureException(h, {
              data: { __sentry__: !0 },
              originalException: h,
            }),
            jt(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${h}`));
      });
  }
  _process(t) {
    (this._numProcessing++,
      t.then(
        (n) => (this._numProcessing--, n),
        (n) => (this._numProcessing--, n),
      ));
  }
  _clearOutcomes() {
    const t = this._outcomes;
    return (
      (this._outcomes = {}),
      Object.entries(t).map(([n, r]) => {
        const [o, s] = n.split(":");
        return { reason: o, category: s, quantity: r };
      })
    );
  }
  _flushOutcomes() {
    J && E.log("Flushing outcomes...");
    const t = this._clearOutcomes();
    if (t.length === 0) {
      J && E.log("No outcomes to send");
      return;
    }
    if (!this._dsn) {
      J && E.log("No dsn provided, will not send outcomes");
      return;
    }
    J && E.log("Sending outcomes:", t);
    const n = ec(t, this._options.tunnel && _s(this._dsn));
    this.sendEnvelope(n);
  }
}
function oc(e, t) {
  const n = `${t} must return \`null\` or a valid event.`;
  if (pa(e))
    return e.then(
      (r) => {
        if (!$n(r) && r !== null) throw jt(n);
        return r;
      },
      (r) => {
        throw jt(`${t} rejected with ${r}`);
      },
    );
  if (!$n(e) && e !== null) throw jt(n);
  return e;
}
function sc(e, t, n, r) {
  const { beforeSend: o, beforeSendTransaction: s, beforeSendSpan: i } = t;
  let a = n;
  if (qn(a) && o) return o(a, r);
  if (Os(a)) {
    if (i) {
      const c = i(tc(a));
      if ((c ? (a = ha(n, nc(c))) : qr(), a.spans)) {
        const u = [];
        for (const d of a.spans) {
          const l = i(d);
          l ? u.push(l) : (qr(), u.push(d));
        }
        a.spans = u;
      }
    }
    if (s) {
      if (a.spans) {
        const c = a.spans.length;
        a.sdkProcessingMetadata = {
          ...n.sdkProcessingMetadata,
          spanCountBeforeProcessing: c,
        };
      }
      return s(a, r);
    }
  }
  return a;
}
function qn(e) {
  return e.type === void 0;
}
function Os(e) {
  return e.type === "transaction";
}
function ic(e) {
  return [
    {
      type: "log",
      item_count: e.length,
      content_type: "application/vnd.sentry.items.log+json",
    },
    { items: e },
  ];
}
function ac(e, t, n, r) {
  const o = {};
  return (
    t?.sdk && (o.sdk = { name: t.sdk.name, version: t.sdk.version }),
    n && r && (o.dsn = _s(r)),
    hn(o, [ic(e)])
  );
}
function xn(e, t) {
  const n = cc(e) ?? [];
  if (n.length === 0) return;
  const r = e.getOptions(),
    o = ac(n, r._metadata, r.tunnel, e.getDsn());
  (Ds().set(e, []), e.emit("flushLogs"), e.sendEnvelope(o));
}
function cc(e) {
  return Ds().get(e);
}
function Ds() {
  return ma("clientToLogBufferMap", () => new WeakMap());
}
function lc(e, t) {
  (t.debug === !0 && (J ? E.enable() : mn(() => {})),
    Le().update(t.initialScope));
  const r = new e(t);
  return (uc(r), r.init(), r);
}
function uc(e) {
  Le().setClient(e);
}
const Ls = Symbol.for("SentryBufferFullError");
function dc(e) {
  const t = [];
  function n() {
    return e === void 0 || t.length < e;
  }
  function r(i) {
    return t.splice(t.indexOf(i), 1)[0] || Promise.resolve(void 0);
  }
  function o(i) {
    if (!n()) return Qt(Ls);
    const a = i();
    return (
      t.indexOf(a) === -1 && t.push(a),
      a.then(() => r(a)).then(null, () => r(a).then(null, () => {})),
      a
    );
  }
  function s(i) {
    return new ms((a, c) => {
      let u = t.length;
      if (!u) return a(!0);
      const d = setTimeout(() => {
        i && i > 0 && a(!1);
      }, i);
      t.forEach((l) => {
        Oe(l).then(() => {
          --u || (clearTimeout(d), a(!0));
        }, c);
      });
    });
  }
  return { $: t, add: o, drain: s };
}
const fc = 60 * 1e3;
function hc(e, t = Date.now()) {
  const n = parseInt(`${e}`, 10);
  if (!isNaN(n)) return n * 1e3;
  const r = Date.parse(`${e}`);
  return isNaN(r) ? fc : r - t;
}
function pc(e, t) {
  return e[t] || e.all || 0;
}
function Ns(e, t, n = Date.now()) {
  return pc(e, t) > n;
}
function Ps(e, { statusCode: t, headers: n }, r = Date.now()) {
  const o = { ...e },
    s = n?.["x-sentry-rate-limits"],
    i = n?.["retry-after"];
  if (s)
    for (const a of s.trim().split(",")) {
      const [c, u, , , d] = a.split(":", 5),
        l = parseInt(c, 10),
        f = (isNaN(l) ? 60 : l) * 1e3;
      if (!u) o.all = r + f;
      else
        for (const h of u.split(";"))
          h === "metric_bucket"
            ? (!d || d.split(";").includes("custom")) && (o[h] = r + f)
            : (o[h] = r + f);
    }
  else i ? (o.all = r + hc(i, r)) : t === 429 && (o.all = r + 60 * 1e3);
  return o;
}
const mc = 64;
function gc(e, t, n = dc(e.bufferSize || mc)) {
  let r = {};
  const o = (i) => n.drain(i);
  function s(i) {
    const a = [];
    if (
      (Un(i, (l, f) => {
        const h = Vr(f);
        Ns(r, h) ? e.recordDroppedEvent("ratelimit_backoff", h) : a.push(l);
      }),
      a.length === 0)
    )
      return Oe({});
    const c = hn(i[0], a),
      u = (l) => {
        Un(c, (f, h) => {
          e.recordDroppedEvent(l, Vr(h));
        });
      },
      d = () =>
        t({ body: ga(c) }).then(
          (l) => (
            l.statusCode !== void 0 &&
              (l.statusCode < 200 || l.statusCode >= 300) &&
              J &&
              E.warn(
                `Sentry responded with status code ${l.statusCode} to sent event.`,
              ),
            (r = Ps(r, l)),
            l
          ),
          (l) => {
            throw (
              u("network_error"),
              J && E.error("Encountered error running transport request:", l),
              l
            );
          },
        );
    return n.add(d).then(
      (l) => l,
      (l) => {
        if (l === Ls)
          return (
            J && E.error("Skipped sending event because buffer is full."),
            u("queue_overflow"),
            Oe({})
          );
        throw l;
      },
    );
  }
  return { send: s, flush: o };
}
function _c(e, t) {
  const n = t?.getDsn(),
    r = t?.getOptions().tunnel;
  return vc(e, n) || yc(e, r);
}
function yc(e, t) {
  return t ? ao(e) === ao(t) : !1;
}
function vc(e, t) {
  return t ? e.includes(t.host) : !1;
}
function ao(e) {
  return e[e.length - 1] === "/" ? e.slice(0, -1) : e;
}
function bc(e) {
  e.user?.ip_address === void 0 &&
    (e.user = { ...e.user, ip_address: "{{auto}}" });
}
function Sc(e) {
  "aggregates" in e
    ? e.attrs?.ip_address === void 0 &&
      (e.attrs = { ...e.attrs, ip_address: "{{auto}}" })
    : e.ipAddress === void 0 && (e.ipAddress = "{{auto}}");
}
function Fs(e, t, n = [t], r = "npm") {
  const o = e._metadata || {};
  (o.sdk ||
    (o.sdk = {
      name: `sentry.javascript.${t}`,
      packages: n.map((s) => ({ name: `${r}:@sentry/${s}`, version: Gr })),
      version: Gr,
    }),
    (e._metadata = o));
}
function Ec(e, t, n) {
  let r, o, s;
  const i = n?.maxWait ? Math.max(n.maxWait, t) : 0,
    a = n?.setTimeoutImpl || setTimeout;
  function c() {
    return (u(), (r = e()), r);
  }
  function u() {
    (o !== void 0 && clearTimeout(o),
      s !== void 0 && clearTimeout(s),
      (o = s = void 0));
  }
  function d() {
    return o !== void 0 || s !== void 0 ? c() : r;
  }
  function l() {
    return (
      o && clearTimeout(o),
      (o = a(c, t)),
      i && s === void 0 && (s = a(c, i)),
      r
    );
  }
  return ((l.cancel = u), (l.flush = d), l);
}
const wc = 100;
function He(e, t) {
  const n = re(),
    r = pn();
  if (!n) return;
  const { beforeBreadcrumb: o = null, maxBreadcrumbs: s = wc } = n.getOptions();
  if (s <= 0) return;
  const a = { timestamp: ds(), ...e },
    c = o ? mn(() => o(a, t)) : a;
  c !== null &&
    (n.emit && n.emit("beforeAddBreadcrumb", c, t), r.addBreadcrumb(c, s));
}
let co;
const kc = "FunctionToString",
  lo = new WeakMap(),
  Ic = () => ({
    name: kc,
    setupOnce() {
      co = Function.prototype.toString;
      try {
        Function.prototype.toString = function (...e) {
          const t = vs(this),
            n = lo.has(re()) && t !== void 0 ? t : this;
          return co.apply(n, e);
        };
      } catch {}
    },
    setup(e) {
      lo.set(e, !0);
    },
  }),
  Cc = we(Ic),
  xc = [
    /^Script error\.?$/,
    /^Javascript error: Script error\.? on line 0$/,
    /^ResizeObserver loop completed with undelivered notifications.$/,
    /^Cannot redefine property: googletag$/,
    /^Can't find variable: gmo$/,
    /^undefined is not an object \(evaluating 'a\.[A-Z]'\)$/,
    `can't redefine non-configurable property "solana"`,
    "vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)",
    "Can't find variable: _AutofillCallbackHandler",
    /^Non-Error promise rejection captured with value: Object Not Found Matching Id:\d+, MethodName:simulateEvent, ParamCount:\d+$/,
    /^Java exception was raised during method invocation$/,
  ],
  Tc = "EventFilters",
  Rc = we((e = {}) => {
    let t;
    return {
      name: Tc,
      setup(n) {
        const r = n.getOptions();
        t = uo(e, r);
      },
      processEvent(n, r, o) {
        if (!t) {
          const s = o.getOptions();
          t = uo(e, s);
        }
        return Ac(n, t) ? null : n;
      },
    };
  }),
  Mc = we((e = {}) => ({ ...Rc(e), name: "InboundFilters" }));
function uo(e = {}, t = {}) {
  return {
    allowUrls: [...(e.allowUrls || []), ...(t.allowUrls || [])],
    denyUrls: [...(e.denyUrls || []), ...(t.denyUrls || [])],
    ignoreErrors: [
      ...(e.ignoreErrors || []),
      ...(t.ignoreErrors || []),
      ...(e.disableErrorDefaults ? [] : xc),
    ],
    ignoreTransactions: [
      ...(e.ignoreTransactions || []),
      ...(t.ignoreTransactions || []),
    ],
  };
}
function Ac(e, t) {
  if (e.type) {
    if (e.type === "transaction" && Dc(e, t.ignoreTransactions))
      return (
        J &&
          E.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${ze(e)}`),
        !0
      );
  } else {
    if (Oc(e, t.ignoreErrors))
      return (
        J &&
          E.warn(`Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${ze(e)}`),
        !0
      );
    if (Fc(e))
      return (
        J &&
          E.warn(`Event dropped due to not having an error message, error type or stacktrace.
Event: ${ze(e)}`),
        !0
      );
    if (Lc(e, t.denyUrls))
      return (
        J &&
          E.warn(`Event dropped due to being matched by \`denyUrls\` option.
Event: ${ze(e)}.
Url: ${tn(e)}`),
        !0
      );
    if (!Nc(e, t.allowUrls))
      return (
        J &&
          E.warn(`Event dropped due to not being matched by \`allowUrls\` option.
Event: ${ze(e)}.
Url: ${tn(e)}`),
        !0
      );
  }
  return !1;
}
function Oc(e, t) {
  return t?.length ? Rs(e).some((n) => Tt(n, t)) : !1;
}
function Dc(e, t) {
  if (!t?.length) return !1;
  const n = e.transaction;
  return n ? Tt(n, t) : !1;
}
function Lc(e, t) {
  if (!t?.length) return !1;
  const n = tn(e);
  return n ? Tt(n, t) : !1;
}
function Nc(e, t) {
  if (!t?.length) return !0;
  const n = tn(e);
  return n ? Tt(n, t) : !0;
}
function Pc(e = []) {
  for (let t = e.length - 1; t >= 0; t--) {
    const n = e[t];
    if (n && n.filename !== "<anonymous>" && n.filename !== "[native code]")
      return n.filename || null;
  }
  return null;
}
function tn(e) {
  try {
    const n = [...(e.exception?.values ?? [])]
      .reverse()
      .find(
        (r) =>
          r.mechanism?.parent_id === void 0 && r.stacktrace?.frames?.length,
      )?.stacktrace?.frames;
    return n ? Pc(n) : null;
  } catch {
    return (J && E.error(`Cannot extract url for event ${ze(e)}`), null);
  }
}
function Fc(e) {
  return e.exception?.values?.length
    ? !e.message &&
        !e.exception.values.some(
          (t) => t.stacktrace || (t.type && t.type !== "Error") || t.value,
        )
    : !1;
}
function Bc(e, t, n, r, o, s) {
  if (!o.exception?.values || !s || !Hn(s.originalException, Error)) return;
  const i =
    o.exception.values.length > 0
      ? o.exception.values[o.exception.values.length - 1]
      : void 0;
  i &&
    (o.exception.values = Vn(
      e,
      t,
      r,
      s.originalException,
      n,
      o.exception.values,
      i,
      0,
    ));
}
function Vn(e, t, n, r, o, s, i, a) {
  if (s.length >= n + 1) return s;
  let c = [...s];
  if (Hn(r[o], Error)) {
    fo(i, a);
    const u = e(t, r[o]),
      d = c.length;
    (ho(u, o, d, a), (c = Vn(e, t, n, r[o], o, [u, ...c], u, d)));
  }
  return (
    Array.isArray(r.errors) &&
      r.errors.forEach((u, d) => {
        if (Hn(u, Error)) {
          fo(i, a);
          const l = e(t, u),
            f = c.length;
          (ho(l, `errors[${d}]`, f, a),
            (c = Vn(e, t, n, u, o, [l, ...c], l, f)));
        }
      }),
    c
  );
}
function fo(e, t) {
  ((e.mechanism = e.mechanism || { type: "generic", handled: !0 }),
    (e.mechanism = {
      ...e.mechanism,
      ...(e.type === "AggregateError" && { is_exception_group: !0 }),
      exception_id: t,
    }));
}
function ho(e, t, n, r) {
  ((e.mechanism = e.mechanism || { type: "generic", handled: !0 }),
    (e.mechanism = {
      ...e.mechanism,
      type: "chained",
      source: t,
      exception_id: n,
      parent_id: r,
    }));
}
function $c(e) {
  const t = "console";
  (bs(t, e), Ss(t, Uc));
}
function Uc() {
  "console" in Be &&
    _a.forEach(function (e) {
      e in Be.console &&
        Ee(Be.console, e, function (t) {
          return (
            (Yr[e] = t),
            function (...n) {
              (Es("console", { args: n, level: e }),
                Yr[e]?.apply(Be.console, n));
            }
          );
        });
    });
}
function Bs(e) {
  return e === "warn"
    ? "warning"
    : ["fatal", "error", "warning", "log", "info", "debug"].includes(e)
      ? e
      : "log";
}
const Hc = "Dedupe",
  Wc = () => {
    let e;
    return {
      name: Hc,
      processEvent(t) {
        if (t.type) return t;
        try {
          if (jc(t, e))
            return (
              J &&
                E.warn(
                  "Event dropped due to being a duplicate of previously captured event.",
                ),
              null
            );
        } catch {}
        return (e = t);
      },
    };
  },
  zc = we(Wc);
function jc(e, t) {
  return t ? !!(qc(e, t) || Vc(e, t)) : !1;
}
function qc(e, t) {
  const n = e.message,
    r = t.message;
  return !(
    (!n && !r) ||
    (n && !r) ||
    (!n && r) ||
    n !== r ||
    !Us(e, t) ||
    !$s(e, t)
  );
}
function Vc(e, t) {
  const n = po(t),
    r = po(e);
  return !(
    !n ||
    !r ||
    n.type !== r.type ||
    n.value !== r.value ||
    !Us(e, t) ||
    !$s(e, t)
  );
}
function $s(e, t) {
  let n = Kr(e),
    r = Kr(t);
  if (!n && !r) return !0;
  if ((n && !r) || (!n && r) || ((n = n), (r = r), r.length !== n.length))
    return !1;
  for (let o = 0; o < r.length; o++) {
    const s = r[o],
      i = n[o];
    if (
      s.filename !== i.filename ||
      s.lineno !== i.lineno ||
      s.colno !== i.colno ||
      s.function !== i.function
    )
      return !1;
  }
  return !0;
}
function Us(e, t) {
  let n = e.fingerprint,
    r = t.fingerprint;
  if (!n && !r) return !0;
  if ((n && !r) || (!n && r)) return !1;
  ((n = n), (r = r));
  try {
    return n.join("") === r.join("");
  } catch {
    return !1;
  }
}
function po(e) {
  return e.exception?.values?.[0];
}
function Gc(e, t = {}, n = Le()) {
  const {
      message: r,
      name: o,
      email: s,
      url: i,
      source: a,
      associatedEventId: c,
      tags: u,
    } = e,
    d = {
      contexts: {
        feedback: {
          contact_email: s,
          name: o,
          message: r,
          url: i,
          source: a,
          associated_event_id: c,
        },
      },
      type: "feedback",
      level: "info",
      tags: u,
    },
    l = n?.getClient() || re();
  return (l && l.emit("beforeSendFeedback", d, t), n.captureEvent(d, t));
}
function Hs(e) {
  if (e !== void 0)
    return e >= 400 && e < 500 ? "warning" : e >= 500 ? "error" : void 0;
}
function Yc() {
  return typeof __SENTRY_BROWSER_BUNDLE__ < "u" && !!__SENTRY_BROWSER_BUNDLE__;
}
function Kc() {
  return "npm";
}
function Xc() {
  return (
    !Yc() &&
    Object.prototype.toString.call(typeof process < "u" ? process : 0) ===
      "[object process]"
  );
}
function Gn() {
  return typeof window < "u" && (!Xc() || Jc());
}
function Jc() {
  return Be.process?.type === "renderer";
}
const Se = Be,
  V = Se.document,
  yt = Se.navigator,
  Ws = "Report a Bug",
  Zc = "Cancel",
  Qc = "Send Bug Report",
  el = "Confirm",
  tl = "Report a Bug",
  nl = "your.email@example.org",
  rl = "Email",
  ol = "What's the bug? What did you expect?",
  sl = "Description",
  il = "Your Name",
  al = "Name",
  cl = "Thank you for your report!",
  ll = "(required)",
  ul = "Add a screenshot",
  dl = "Remove screenshot",
  fl = "widget",
  hl = "api",
  pl = 5e3,
  ml = (e, t = { includeReplay: !0 }) => {
    if (!e.message)
      throw new Error("Unable to submit feedback with empty message");
    const n = re();
    if (!n) throw new Error("No client setup, cannot send feedback.");
    e.tags && Object.keys(e.tags).length && Le().setTags(e.tags);
    const r = Gc({ source: hl, url: gn(), ...e }, t);
    return new Promise((o, s) => {
      const i = setTimeout(
          () => s("Unable to determine if Feedback was correctly sent."),
          3e4,
        ),
        a = n.on("afterSendEvent", (c, u) => {
          if (c.event_id === r)
            return (
              clearTimeout(i),
              a(),
              u &&
              typeof u.statusCode == "number" &&
              u.statusCode >= 200 &&
              u.statusCode < 300
                ? o(r)
                : u && typeof u.statusCode == "number" && u.statusCode === 0
                  ? s(
                      "Unable to send Feedback. This is because of network issues, or because you are using an ad-blocker.",
                    )
                  : u && typeof u.statusCode == "number" && u.statusCode === 403
                    ? s(
                        "Unable to send Feedback. This could be because this domain is not in your list of allowed domains.",
                      )
                    : s(
                        "Unable to send Feedback. This could be because of network issues, or because you are using an ad-blocker",
                      )
            );
        });
    });
  },
  qt = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__;
function gl() {
  return !(
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      yt.userAgent,
    ) ||
    (/Macintosh/i.test(yt.userAgent) &&
      yt.maxTouchPoints &&
      yt.maxTouchPoints > 1) ||
    !isSecureContext
  );
}
function Lt(e, t) {
  return {
    ...e,
    ...t,
    tags: { ...e.tags, ...t.tags },
    onFormOpen: () => {
      (t.onFormOpen?.(), e.onFormOpen?.());
    },
    onFormClose: () => {
      (t.onFormClose?.(), e.onFormClose?.());
    },
    onSubmitSuccess: (n, r) => {
      (t.onSubmitSuccess?.(n, r), e.onSubmitSuccess?.(n, r));
    },
    onSubmitError: (n) => {
      (t.onSubmitError?.(n), e.onSubmitError?.(n));
    },
    onFormSubmitted: () => {
      (t.onFormSubmitted?.(), e.onFormSubmitted?.());
    },
    themeDark: { ...e.themeDark, ...t.themeDark },
    themeLight: { ...e.themeLight, ...t.themeLight },
  };
}
function _l(e) {
  const t = V.createElement("style");
  return (
    (t.textContent = `
.widget__actor {
  position: fixed;
  z-index: var(--z-index);
  margin: var(--page-margin);
  inset: var(--actor-inset);

  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;

  font-family: inherit;
  font-size: var(--font-size);
  font-weight: 600;
  line-height: 1.14em;
  text-decoration: none;

  background: var(--actor-background, var(--background));
  border-radius: var(--actor-border-radius, 1.7em/50%);
  border: var(--actor-border, var(--border));
  box-shadow: var(--actor-box-shadow, var(--box-shadow));
  color: var(--actor-color, var(--foreground));
  fill: var(--actor-color, var(--foreground));
  cursor: pointer;
  opacity: 1;
  transition: transform 0.2s ease-in-out;
  transform: translate(0, 0) scale(1);
}
.widget__actor[aria-hidden="true"] {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  transform: translate(0, 16px) scale(0.98);
}

.widget__actor:hover {
  background: var(--actor-hover-background, var(--background));
  filter: var(--interactive-filter);
}

.widget__actor svg {
  width: 1.14em;
  height: 1.14em;
}

@media (max-width: 600px) {
  .widget__actor span {
    display: none;
  }
}
`),
    e && t.setAttribute("nonce", e),
    t
  );
}
function _e(e, t) {
  return (
    Object.entries(t).forEach(([n, r]) => {
      e.setAttributeNS(null, n, r);
    }),
    e
  );
}
const et = 20,
  yl = "http://www.w3.org/2000/svg";
function vl() {
  const e = (a) => Se.document.createElementNS(yl, a),
    t = _e(e("svg"), {
      width: `${et}`,
      height: `${et}`,
      viewBox: `0 0 ${et} ${et}`,
      fill: "var(--actor-color, var(--foreground))",
    }),
    n = _e(e("g"), { clipPath: "url(#clip0_57_80)" }),
    r = _e(e("path"), {
      "fill-rule": "evenodd",
      "clip-rule": "evenodd",
      d: "M15.6622 15H12.3997C12.2129 14.9959 12.031 14.9396 11.8747 14.8375L8.04965 12.2H7.49956V19.1C7.4875 19.3348 7.3888 19.5568 7.22256 19.723C7.05632 19.8892 6.83435 19.9879 6.59956 20H2.04956C1.80193 19.9968 1.56535 19.8969 1.39023 19.7218C1.21511 19.5467 1.1153 19.3101 1.11206 19.0625V12.2H0.949652C0.824431 12.2017 0.700142 12.1783 0.584123 12.1311C0.468104 12.084 0.362708 12.014 0.274155 11.9255C0.185602 11.8369 0.115689 11.7315 0.0685419 11.6155C0.0213952 11.4995 -0.00202913 11.3752 -0.00034808 11.25V3.75C-0.00900498 3.62067 0.0092504 3.49095 0.0532651 3.36904C0.0972798 3.24712 0.166097 3.13566 0.255372 3.04168C0.344646 2.94771 0.452437 2.87327 0.571937 2.82307C0.691437 2.77286 0.82005 2.74798 0.949652 2.75H8.04965L11.8747 0.1625C12.031 0.0603649 12.2129 0.00407221 12.3997 0H15.6622C15.9098 0.00323746 16.1464 0.103049 16.3215 0.278167C16.4966 0.453286 16.5964 0.689866 16.5997 0.9375V3.25269C17.3969 3.42959 18.1345 3.83026 18.7211 4.41679C19.5322 5.22788 19.9878 6.32796 19.9878 7.47502C19.9878 8.62209 19.5322 9.72217 18.7211 10.5333C18.1345 11.1198 17.3969 11.5205 16.5997 11.6974V14.0125C16.6047 14.1393 16.5842 14.2659 16.5395 14.3847C16.4948 14.5035 16.4268 14.6121 16.3394 14.7042C16.252 14.7962 16.147 14.8698 16.0307 14.9206C15.9144 14.9714 15.7891 14.9984 15.6622 15ZM1.89695 10.325H1.88715V4.625H8.33715C8.52423 4.62301 8.70666 4.56654 8.86215 4.4625L12.6872 1.875H14.7247V13.125H12.6872L8.86215 10.4875C8.70666 10.3835 8.52423 10.327 8.33715 10.325H2.20217C2.15205 10.3167 2.10102 10.3125 2.04956 10.3125C1.9981 10.3125 1.94708 10.3167 1.89695 10.325ZM2.98706 12.2V18.1625H5.66206V12.2H2.98706ZM16.5997 9.93612V5.01393C16.6536 5.02355 16.7072 5.03495 16.7605 5.04814C17.1202 5.13709 17.4556 5.30487 17.7425 5.53934C18.0293 5.77381 18.2605 6.06912 18.4192 6.40389C18.578 6.73866 18.6603 7.10452 18.6603 7.47502C18.6603 7.84552 18.578 8.21139 18.4192 8.54616C18.2605 8.88093 18.0293 9.17624 17.7425 9.41071C17.4556 9.64518 17.1202 9.81296 16.7605 9.90191C16.7072 9.91509 16.6536 9.9265 16.5997 9.93612Z",
    });
  t.appendChild(n).appendChild(r);
  const o = e("defs"),
    s = _e(e("clipPath"), { id: "clip0_57_80" }),
    i = _e(e("rect"), { width: `${et}`, height: `${et}`, fill: "white" });
  return (
    s.appendChild(i),
    o.appendChild(s),
    t.appendChild(o).appendChild(s).appendChild(i),
    t
  );
}
function bl({
  triggerLabel: e,
  triggerAriaLabel: t,
  shadow: n,
  styleNonce: r,
}) {
  const o = V.createElement("button");
  if (
    ((o.type = "button"),
    (o.className = "widget__actor"),
    (o.ariaHidden = "false"),
    (o.ariaLabel = t || e || Ws),
    o.appendChild(vl()),
    e)
  ) {
    const i = V.createElement("span");
    (i.appendChild(V.createTextNode(e)), o.appendChild(i));
  }
  const s = _l(r);
  return {
    el: o,
    appendToDom() {
      (n.appendChild(s), n.appendChild(o));
    },
    removeFromDom() {
      (o.remove(), s.remove());
    },
    show() {
      o.ariaHidden = "false";
    },
    hide() {
      o.ariaHidden = "true";
    },
  };
}
const zs = "rgba(88, 74, 192, 1)",
  Sl = {
    foreground: "#2b2233",
    background: "#ffffff",
    accentForeground: "white",
    accentBackground: zs,
    successColor: "#268d75",
    errorColor: "#df3338",
    border: "1.5px solid rgba(41, 35, 47, 0.13)",
    boxShadow: "0px 4px 24px 0px rgba(43, 34, 51, 0.12)",
    outline: "1px auto var(--accent-background)",
    interactiveFilter: "brightness(95%)",
  },
  mo = {
    foreground: "#ebe6ef",
    background: "#29232f",
    accentForeground: "white",
    accentBackground: zs,
    successColor: "#2da98c",
    errorColor: "#f55459",
    border: "1.5px solid rgba(235, 230, 239, 0.15)",
    boxShadow: "0px 4px 24px 0px rgba(43, 34, 51, 0.12)",
    outline: "1px auto var(--accent-background)",
    interactiveFilter: "brightness(150%)",
  };
function go(e) {
  return `
  --foreground: ${e.foreground};
  --background: ${e.background};
  --accent-foreground: ${e.accentForeground};
  --accent-background: ${e.accentBackground};
  --success-color: ${e.successColor};
  --error-color: ${e.errorColor};
  --border: ${e.border};
  --box-shadow: ${e.boxShadow};
  --outline: ${e.outline};
  --interactive-filter: ${e.interactiveFilter};
  `;
}
function El({ colorScheme: e, themeDark: t, themeLight: n, styleNonce: r }) {
  const o = V.createElement("style");
  return (
    (o.textContent = `
:host {
  --font-family: system-ui, 'Helvetica Neue', Arial, sans-serif;
  --font-size: 14px;
  --z-index: 100000;

  --page-margin: 16px;
  --inset: auto 0 0 auto;
  --actor-inset: var(--inset);

  font-family: var(--font-family);
  font-size: var(--font-size);

  ${e !== "system" ? "color-scheme: only light;" : ""}

  ${go(e === "dark" ? { ...mo, ...t } : { ...Sl, ...n })}
}

${
  e === "system"
    ? `
@media (prefers-color-scheme: dark) {
  :host {
    ${go({ ...mo, ...t })}
  }
}`
    : ""
}
}
`),
    r && o.setAttribute("nonce", r),
    o
  );
}
const wl =
  ({
    lazyLoadIntegration: e,
    getModalIntegration: t,
    getScreenshotIntegration: n,
  }) =>
  ({
    id: o = "sentry-feedback",
    autoInject: s = !0,
    showBranding: i = !0,
    isEmailRequired: a = !1,
    isNameRequired: c = !1,
    showEmail: u = !0,
    showName: d = !0,
    enableScreenshot: l = !0,
    useSentryUser: f = { email: "email", name: "username" },
    tags: h,
    styleNonce: p,
    scriptNonce: m,
    colorScheme: _ = "system",
    themeLight: g = {},
    themeDark: v = {},
    addScreenshotButtonLabel: M = ul,
    cancelButtonLabel: w = Zc,
    confirmButtonLabel: I = el,
    emailLabel: S = rl,
    emailPlaceholder: C = nl,
    formTitle: x = tl,
    isRequiredLabel: y = ll,
    messageLabel: k = sl,
    messagePlaceholder: F = ol,
    nameLabel: b = al,
    namePlaceholder: A = il,
    removeScreenshotButtonLabel: U = dl,
    submitButtonLabel: j = Qc,
    successMessageText: Q = cl,
    triggerLabel: D = Ws,
    triggerAriaLabel: q = "",
    onFormOpen: L,
    onFormClose: z,
    onSubmitSuccess: ee,
    onSubmitError: pe,
    onFormSubmitted: me,
  } = {}) => {
    const le = {
      id: o,
      autoInject: s,
      showBranding: i,
      isEmailRequired: a,
      isNameRequired: c,
      showEmail: u,
      showName: d,
      enableScreenshot: l,
      useSentryUser: f,
      tags: h,
      styleNonce: p,
      scriptNonce: m,
      colorScheme: _,
      themeDark: v,
      themeLight: g,
      triggerLabel: D,
      triggerAriaLabel: q,
      cancelButtonLabel: w,
      submitButtonLabel: j,
      confirmButtonLabel: I,
      formTitle: x,
      emailLabel: S,
      emailPlaceholder: C,
      messageLabel: k,
      messagePlaceholder: F,
      nameLabel: b,
      namePlaceholder: A,
      successMessageText: Q,
      isRequiredLabel: y,
      addScreenshotButtonLabel: M,
      removeScreenshotButtonLabel: U,
      onFormClose: z,
      onFormOpen: L,
      onSubmitError: pe,
      onSubmitSuccess: ee,
      onFormSubmitted: me,
    };
    let ye = null,
      xe = [];
    const Je = (te) => {
        if (!ye) {
          const ue = V.createElement("div");
          ((ue.id = String(te.id)),
            V.body.appendChild(ue),
            (ye = ue.attachShadow({ mode: "open" })),
            ye.appendChild(El(te)));
        }
        return ye;
      },
      Ze = async (te) => {
        const ue = te.enableScreenshot && gl();
        let ke, ie;
        try {
          ((ke = (t ? t() : await e("feedbackModalIntegration", m))()), Xr(ke));
        } catch {
          throw (
            qt &&
              E.error(
                "[Feedback] Error when trying to load feedback integrations. Try using `feedbackSyncIntegration` in your `Sentry.init`.",
              ),
            new Error("[Feedback] Missing feedback modal integration!")
          );
        }
        try {
          const Ie = ue
            ? n
              ? n()
              : await e("feedbackScreenshotIntegration", m)
            : void 0;
          Ie && ((ie = Ie()), Xr(ie));
        } catch {
          qt &&
            E.error(
              "[Feedback] Missing feedback screenshot integration. Proceeding without screenshots.",
            );
        }
        const ce = ke.createDialog({
          options: {
            ...te,
            onFormClose: () => {
              (ce?.close(), te.onFormClose?.());
            },
            onFormSubmitted: () => {
              (ce?.close(), te.onFormSubmitted?.());
            },
          },
          screenshotIntegration: ie,
          sendFeedback: ml,
          shadow: Je(te),
        });
        return ce;
      },
      mt = (te, ue = {}) => {
        const ke = Lt(le, ue),
          ie =
            typeof te == "string"
              ? V.querySelector(te)
              : typeof te.addEventListener == "function"
                ? te
                : null;
        if (!ie)
          throw (
            qt && E.error("[Feedback] Unable to attach to target element"),
            new Error("Unable to attach to target element")
          );
        let ce = null;
        const Ie = async () => {
          (ce ||
            (ce = await Ze({
              ...ke,
              onFormSubmitted: () => {
                (ce?.removeFromDom(), ke.onFormSubmitted?.());
              },
            })),
            ce.appendToDom(),
            ce.open());
        };
        ie.addEventListener("click", Ie);
        const We = () => {
          ((xe = xe.filter((Qe) => Qe !== We)),
            ce?.removeFromDom(),
            (ce = null),
            ie.removeEventListener("click", Ie));
        };
        return (xe.push(We), We);
      },
      Te = (te = {}) => {
        const ue = Lt(le, te),
          ke = Je(ue),
          ie = bl({
            triggerLabel: ue.triggerLabel,
            triggerAriaLabel: ue.triggerAriaLabel,
            shadow: ke,
            styleNonce: p,
          });
        return (
          mt(ie.el, {
            ...ue,
            onFormOpen() {
              ie.hide();
            },
            onFormClose() {
              ie.show();
            },
            onFormSubmitted() {
              ie.show();
            },
          }),
          ie
        );
      };
    return {
      name: "Feedback",
      setupOnce() {
        !Gn() ||
          !le.autoInject ||
          (V.readyState === "loading"
            ? V.addEventListener("DOMContentLoaded", () => Te().appendToDom())
            : Te().appendToDom());
      },
      attachTo: mt,
      createWidget(te = {}) {
        const ue = Te(Lt(le, te));
        return (ue.appendToDom(), ue);
      },
      async createForm(te = {}) {
        return Ze(Lt(le, te));
      },
      remove() {
        (ye && (ye.parentElement?.remove(), (ye = null)),
          xe.forEach((te) => te()),
          (xe = []));
      },
    };
  };
var _n,
  Y,
  js,
  je,
  _o,
  qs,
  Yn,
  wt = {},
  _r = [],
  kl = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,
  yr = Array.isArray;
function $e(e, t) {
  for (var n in t) e[n] = t[n];
  return e;
}
function Vs(e) {
  var t = e.parentNode;
  t && t.removeChild(e);
}
function P(e, t, n) {
  var r,
    o,
    s,
    i = {};
  for (s in t)
    s == "key" ? (r = t[s]) : s == "ref" ? (o = t[s]) : (i[s] = t[s]);
  if (
    (arguments.length > 2 &&
      (i.children = arguments.length > 3 ? _n.call(arguments, 2) : n),
    typeof e == "function" && e.defaultProps != null)
  )
    for (s in e.defaultProps) i[s] === void 0 && (i[s] = e.defaultProps[s]);
  return Vt(e, i, r, o, null);
}
function Vt(e, t, n, r, o) {
  var s = {
    type: e,
    props: t,
    key: n,
    ref: r,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __d: void 0,
    __c: null,
    constructor: void 0,
    __v: o ?? ++js,
    __i: -1,
    __u: 0,
  };
  return (o == null && Y.vnode != null && Y.vnode(s), s);
}
function Rt(e) {
  return e.children;
}
function Gt(e, t) {
  ((this.props = e), (this.context = t));
}
function ut(e, t) {
  if (t == null) return e.__ ? ut(e.__, e.__i + 1) : null;
  for (var n; t < e.__k.length; t++)
    if ((n = e.__k[t]) != null && n.__e != null) return n.__e;
  return typeof e.type == "function" ? ut(e) : null;
}
function Il(e, t, n) {
  var r,
    o = e.__v,
    s = o.__e,
    i = e.__P;
  if (i)
    return (
      ((r = $e({}, o)).__v = o.__v + 1),
      Y.vnode && Y.vnode(r),
      vr(
        i,
        r,
        o,
        e.__n,
        i.ownerSVGElement !== void 0,
        32 & o.__u ? [s] : null,
        t,
        s ?? ut(o),
        !!(32 & o.__u),
        n,
      ),
      (r.__.__k[r.__i] = r),
      (r.__d = void 0),
      r.__e != s && Gs(r),
      r
    );
}
function Gs(e) {
  var t, n;
  if ((e = e.__) != null && e.__c != null) {
    for (e.__e = e.__c.base = null, t = 0; t < e.__k.length; t++)
      if ((n = e.__k[t]) != null && n.__e != null) {
        e.__e = e.__c.base = n.__e;
        break;
      }
    return Gs(e);
  }
}
function yo(e) {
  ((!e.__d && (e.__d = !0) && je.push(e) && !nn.__r++) ||
    _o !== Y.debounceRendering) &&
    ((_o = Y.debounceRendering) || qs)(nn);
}
function nn() {
  var e,
    t,
    n,
    r = [],
    o = [];
  for (je.sort(Yn); (e = je.shift()); )
    e.__d &&
      ((n = je.length),
      (t = Il(e, r, o) || t),
      n === 0 || je.length > n
        ? (Kn(r, t, o), (o.length = r.length = 0), (t = void 0), je.sort(Yn))
        : t && Y.__c && Y.__c(t, _r));
  (t && Kn(r, t, o), (nn.__r = 0));
}
function Ys(e, t, n, r, o, s, i, a, c, u, d) {
  var l,
    f,
    h,
    p,
    m,
    _ = (r && r.__k) || _r,
    g = t.length;
  for (n.__d = c, Cl(n, t, _), c = n.__d, l = 0; l < g; l++)
    (h = n.__k[l]) != null &&
      typeof h != "boolean" &&
      typeof h != "function" &&
      ((f = h.__i === -1 ? wt : _[h.__i] || wt),
      (h.__i = l),
      vr(e, h, f, o, s, i, a, c, u, d),
      (p = h.__e),
      h.ref &&
        f.ref != h.ref &&
        (f.ref && br(f.ref, null, h), d.push(h.ref, h.__c || p, h)),
      m == null && p != null && (m = p),
      65536 & h.__u || f.__k === h.__k
        ? (c = Ks(h, c, e))
        : typeof h.type == "function" && h.__d !== void 0
          ? (c = h.__d)
          : p && (c = p.nextSibling),
      (h.__d = void 0),
      (h.__u &= -196609));
  ((n.__d = c), (n.__e = m));
}
function Cl(e, t, n) {
  var r,
    o,
    s,
    i,
    a,
    c = t.length,
    u = n.length,
    d = u,
    l = 0;
  for (e.__k = [], r = 0; r < c; r++)
    (o = e.__k[r] =
      (o = t[r]) == null || typeof o == "boolean" || typeof o == "function"
        ? null
        : typeof o == "string" ||
            typeof o == "number" ||
            typeof o == "bigint" ||
            o.constructor == String
          ? Vt(null, o, null, null, o)
          : yr(o)
            ? Vt(Rt, { children: o }, null, null, null)
            : o.constructor === void 0 && o.__b > 0
              ? Vt(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v)
              : o) != null
      ? ((o.__ = e),
        (o.__b = e.__b + 1),
        (a = xl(o, n, (i = r + l), d)),
        (o.__i = a),
        (s = null),
        a !== -1 && (d--, (s = n[a]) && (s.__u |= 131072)),
        s == null || s.__v === null
          ? (a == -1 && l--, typeof o.type != "function" && (o.__u |= 65536))
          : a !== i &&
            (a === i + 1
              ? l++
              : a > i
                ? d > c - i
                  ? (l += a - i)
                  : l--
                : (l = a < i && a == i - 1 ? a - i : 0),
            a !== r + l && (o.__u |= 65536)))
      : (s = n[r]) &&
        s.key == null &&
        s.__e &&
        (s.__e == e.__d && (e.__d = ut(s)), Xn(s, s, !1), (n[r] = null), d--);
  if (d)
    for (r = 0; r < u; r++)
      (s = n[r]) != null &&
        (131072 & s.__u) == 0 &&
        (s.__e == e.__d && (e.__d = ut(s)), Xn(s, s));
}
function Ks(e, t, n) {
  var r, o;
  if (typeof e.type == "function") {
    for (r = e.__k, o = 0; r && o < r.length; o++)
      r[o] && ((r[o].__ = e), (t = Ks(r[o], t, n)));
    return t;
  }
  e.__e != t && (n.insertBefore(e.__e, t || null), (t = e.__e));
  do t = t && t.nextSibling;
  while (t != null && t.nodeType === 8);
  return t;
}
function xl(e, t, n, r) {
  var o = e.key,
    s = e.type,
    i = n - 1,
    a = n + 1,
    c = t[n];
  if (c === null || (c && o == c.key && s === c.type)) return n;
  if (r > (c != null && (131072 & c.__u) == 0 ? 1 : 0))
    for (; i >= 0 || a < t.length; ) {
      if (i >= 0) {
        if ((c = t[i]) && (131072 & c.__u) == 0 && o == c.key && s === c.type)
          return i;
        i--;
      }
      if (a < t.length) {
        if ((c = t[a]) && (131072 & c.__u) == 0 && o == c.key && s === c.type)
          return a;
        a++;
      }
    }
  return -1;
}
function vo(e, t, n) {
  t[0] === "-"
    ? e.setProperty(t, n ?? "")
    : (e[t] =
        n == null ? "" : typeof n != "number" || kl.test(t) ? n : n + "px");
}
function Nt(e, t, n, r, o) {
  var s;
  e: if (t === "style")
    if (typeof n == "string") e.style.cssText = n;
    else {
      if ((typeof r == "string" && (e.style.cssText = r = ""), r))
        for (t in r) (n && t in n) || vo(e.style, t, "");
      if (n) for (t in n) (r && n[t] === r[t]) || vo(e.style, t, n[t]);
    }
  else if (t[0] === "o" && t[1] === "n")
    ((s = t !== (t = t.replace(/(PointerCapture)$|Capture$/i, "$1"))),
      (t = t.toLowerCase() in e ? t.toLowerCase().slice(2) : t.slice(2)),
      e.l || (e.l = {}),
      (e.l[t + s] = n),
      n
        ? r
          ? (n.u = r.u)
          : ((n.u = Date.now()), e.addEventListener(t, s ? So : bo, s))
        : e.removeEventListener(t, s ? So : bo, s));
  else {
    if (o) t = t.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if (
      t !== "width" &&
      t !== "height" &&
      t !== "href" &&
      t !== "list" &&
      t !== "form" &&
      t !== "tabIndex" &&
      t !== "download" &&
      t !== "rowSpan" &&
      t !== "colSpan" &&
      t !== "role" &&
      t in e
    )
      try {
        e[t] = n ?? "";
        break e;
      } catch {}
    typeof n == "function" ||
      (n == null || (n === !1 && t[4] !== "-")
        ? e.removeAttribute(t)
        : e.setAttribute(t, n));
  }
}
function bo(e) {
  if (this.l) {
    var t = this.l[e.type + !1];
    if (e.t) {
      if (e.t <= t.u) return;
    } else e.t = Date.now();
    return t(Y.event ? Y.event(e) : e);
  }
}
function So(e) {
  if (this.l) return this.l[e.type + !0](Y.event ? Y.event(e) : e);
}
function vr(e, t, n, r, o, s, i, a, c, u) {
  var d,
    l,
    f,
    h,
    p,
    m,
    _,
    g,
    v,
    M,
    w,
    I,
    S,
    C,
    x,
    y = t.type;
  if (t.constructor !== void 0) return null;
  (128 & n.__u && ((c = !!(32 & n.__u)), (s = [(a = t.__e = n.__e)])),
    (d = Y.__b) && d(t));
  e: if (typeof y == "function")
    try {
      if (
        ((g = t.props),
        (v = (d = y.contextType) && r[d.__c]),
        (M = d ? (v ? v.props.value : d.__) : r),
        n.__c
          ? (_ = (l = t.__c = n.__c).__ = l.__E)
          : ("prototype" in y && y.prototype.render
              ? (t.__c = l = new y(g, M))
              : ((t.__c = l = new Gt(g, M)),
                (l.constructor = y),
                (l.render = Rl)),
            v && v.sub(l),
            (l.props = g),
            l.state || (l.state = {}),
            (l.context = M),
            (l.__n = r),
            (f = l.__d = !0),
            (l.__h = []),
            (l._sb = [])),
        l.__s == null && (l.__s = l.state),
        y.getDerivedStateFromProps != null &&
          (l.__s == l.state && (l.__s = $e({}, l.__s)),
          $e(l.__s, y.getDerivedStateFromProps(g, l.__s))),
        (h = l.props),
        (p = l.state),
        (l.__v = t),
        f)
      )
        (y.getDerivedStateFromProps == null &&
          l.componentWillMount != null &&
          l.componentWillMount(),
          l.componentDidMount != null && l.__h.push(l.componentDidMount));
      else {
        if (
          (y.getDerivedStateFromProps == null &&
            g !== h &&
            l.componentWillReceiveProps != null &&
            l.componentWillReceiveProps(g, M),
          !l.__e &&
            ((l.shouldComponentUpdate != null &&
              l.shouldComponentUpdate(g, l.__s, M) === !1) ||
              t.__v === n.__v))
        ) {
          for (
            t.__v !== n.__v && ((l.props = g), (l.state = l.__s), (l.__d = !1)),
              t.__e = n.__e,
              t.__k = n.__k,
              t.__k.forEach(function (k) {
                k && (k.__ = t);
              }),
              w = 0;
            w < l._sb.length;
            w++
          )
            l.__h.push(l._sb[w]);
          ((l._sb = []), l.__h.length && i.push(l));
          break e;
        }
        (l.componentWillUpdate != null && l.componentWillUpdate(g, l.__s, M),
          l.componentDidUpdate != null &&
            l.__h.push(function () {
              l.componentDidUpdate(h, p, m);
            }));
      }
      if (
        ((l.context = M),
        (l.props = g),
        (l.__P = e),
        (l.__e = !1),
        (I = Y.__r),
        (S = 0),
        "prototype" in y && y.prototype.render)
      ) {
        for (
          l.state = l.__s,
            l.__d = !1,
            I && I(t),
            d = l.render(l.props, l.state, l.context),
            C = 0;
          C < l._sb.length;
          C++
        )
          l.__h.push(l._sb[C]);
        l._sb = [];
      } else
        do
          ((l.__d = !1),
            I && I(t),
            (d = l.render(l.props, l.state, l.context)),
            (l.state = l.__s));
        while (l.__d && ++S < 25);
      ((l.state = l.__s),
        l.getChildContext != null && (r = $e($e({}, r), l.getChildContext())),
        f ||
          l.getSnapshotBeforeUpdate == null ||
          (m = l.getSnapshotBeforeUpdate(h, p)),
        Ys(
          e,
          yr(
            (x =
              d != null && d.type === Rt && d.key == null
                ? d.props.children
                : d),
          )
            ? x
            : [x],
          t,
          n,
          r,
          o,
          s,
          i,
          a,
          c,
          u,
        ),
        (l.base = t.__e),
        (t.__u &= -161),
        l.__h.length && i.push(l),
        _ && (l.__E = l.__ = null));
    } catch (k) {
      ((t.__v = null),
        c || s != null
          ? ((t.__e = a), (t.__u |= c ? 160 : 32), (s[s.indexOf(a)] = null))
          : ((t.__e = n.__e), (t.__k = n.__k)),
        Y.__e(k, t, n));
    }
  else
    s == null && t.__v === n.__v
      ? ((t.__k = n.__k), (t.__e = n.__e))
      : (t.__e = Tl(n.__e, t, n, r, o, s, i, c, u));
  (d = Y.diffed) && d(t);
}
function Kn(e, t, n) {
  for (var r = 0; r < n.length; r++) br(n[r], n[++r], n[++r]);
  (Y.__c && Y.__c(t, e),
    e.some(function (o) {
      try {
        ((e = o.__h),
          (o.__h = []),
          e.some(function (s) {
            s.call(o);
          }));
      } catch (s) {
        Y.__e(s, o.__v);
      }
    }));
}
function Tl(e, t, n, r, o, s, i, a, c) {
  var u,
    d,
    l,
    f,
    h,
    p,
    m,
    _ = n.props,
    g = t.props,
    v = t.type;
  if ((v === "svg" && (o = !0), s != null)) {
    for (u = 0; u < s.length; u++)
      if (
        (h = s[u]) &&
        "setAttribute" in h == !!v &&
        (v ? h.localName === v : h.nodeType === 3)
      ) {
        ((e = h), (s[u] = null));
        break;
      }
  }
  if (e == null) {
    if (v === null) return document.createTextNode(g);
    ((e = o
      ? document.createElementNS("http://www.w3.org/2000/svg", v)
      : document.createElement(v, g.is && g)),
      (s = null),
      (a = !1));
  }
  if (v === null) _ === g || (a && e.data === g) || (e.data = g);
  else {
    if (
      ((s = s && _n.call(e.childNodes)), (_ = n.props || wt), !a && s != null)
    )
      for (_ = {}, u = 0; u < e.attributes.length; u++)
        _[(h = e.attributes[u]).name] = h.value;
    for (u in _)
      ((h = _[u]),
        u == "children" ||
          (u == "dangerouslySetInnerHTML"
            ? (l = h)
            : u === "key" || u in g || Nt(e, u, null, h, o)));
    for (u in g)
      ((h = g[u]),
        u == "children"
          ? (f = h)
          : u == "dangerouslySetInnerHTML"
            ? (d = h)
            : u == "value"
              ? (p = h)
              : u == "checked"
                ? (m = h)
                : u === "key" ||
                  (a && typeof h != "function") ||
                  _[u] === h ||
                  Nt(e, u, h, _[u], o));
    if (d)
      (a ||
        (l && (d.__html === l.__html || d.__html === e.innerHTML)) ||
        (e.innerHTML = d.__html),
        (t.__k = []));
    else if (
      (l && (e.innerHTML = ""),
      Ys(
        e,
        yr(f) ? f : [f],
        t,
        n,
        r,
        o && v !== "foreignObject",
        s,
        i,
        s ? s[0] : n.__k && ut(n, 0),
        a,
        c,
      ),
      s != null)
    )
      for (u = s.length; u--; ) s[u] != null && Vs(s[u]);
    a ||
      ((u = "value"),
      p !== void 0 &&
        (p !== e[u] ||
          (v === "progress" && !p) ||
          (v === "option" && p !== _[u])) &&
        Nt(e, u, p, _[u], !1),
      (u = "checked"),
      m !== void 0 && m !== e[u] && Nt(e, u, m, _[u], !1));
  }
  return e;
}
function br(e, t, n) {
  try {
    typeof e == "function" ? e(t) : (e.current = t);
  } catch (r) {
    Y.__e(r, n);
  }
}
function Xn(e, t, n) {
  var r, o;
  if (
    (Y.unmount && Y.unmount(e),
    (r = e.ref) && ((r.current && r.current !== e.__e) || br(r, null, t)),
    (r = e.__c) != null)
  ) {
    if (r.componentWillUnmount)
      try {
        r.componentWillUnmount();
      } catch (s) {
        Y.__e(s, t);
      }
    ((r.base = r.__P = null), (e.__c = void 0));
  }
  if ((r = e.__k))
    for (o = 0; o < r.length; o++)
      r[o] && Xn(r[o], t, n || typeof e.type != "function");
  (n || e.__e == null || Vs(e.__e), (e.__ = e.__e = e.__d = void 0));
}
function Rl(e, t, n) {
  return this.constructor(e, n);
}
function Ml(e, t, n) {
  var r, o, s, i;
  (Y.__ && Y.__(e, t),
    (o = (r = !1) ? null : t.__k),
    (s = []),
    (i = []),
    vr(
      t,
      (e = t.__k = P(Rt, null, [e])),
      o || wt,
      wt,
      t.ownerSVGElement !== void 0,
      o ? null : t.firstChild ? _n.call(t.childNodes) : null,
      s,
      o ? o.__e : t.firstChild,
      r,
      i,
    ),
    (e.__d = void 0),
    Kn(s, e, i));
}
((_n = _r.slice),
  (Y = {
    __e: function (e, t, n, r) {
      for (var o, s, i; (t = t.__); )
        if ((o = t.__c) && !o.__)
          try {
            if (
              ((s = o.constructor) &&
                s.getDerivedStateFromError != null &&
                (o.setState(s.getDerivedStateFromError(e)), (i = o.__d)),
              o.componentDidCatch != null &&
                (o.componentDidCatch(e, r || {}), (i = o.__d)),
              i)
            )
              return (o.__E = o);
          } catch (a) {
            e = a;
          }
      throw e;
    },
  }),
  (js = 0),
  (Gt.prototype.setState = function (e, t) {
    var n;
    ((n =
      this.__s != null && this.__s !== this.state
        ? this.__s
        : (this.__s = $e({}, this.state))),
      typeof e == "function" && (e = e($e({}, n), this.props)),
      e && $e(n, e),
      e != null && this.__v && (t && this._sb.push(t), yo(this)));
  }),
  (Gt.prototype.forceUpdate = function (e) {
    this.__v && ((this.__e = !0), e && this.__h.push(e), yo(this));
  }),
  (Gt.prototype.render = Rt),
  (je = []),
  (qs =
    typeof Promise == "function"
      ? Promise.prototype.then.bind(Promise.resolve())
      : setTimeout),
  (Yn = function (e, t) {
    return e.__v.__b - t.__v.__b;
  }),
  (nn.__r = 0));
var De,
  G,
  Tn,
  Eo,
  dt = 0,
  Xs = [],
  Yt = [],
  oe = Y,
  wo = oe.__b,
  ko = oe.__r,
  Io = oe.diffed,
  Co = oe.__c,
  xo = oe.unmount,
  To = oe.__;
function Xe(e, t) {
  (oe.__h && oe.__h(G, e, dt || t), (dt = 0));
  var n = G.__H || (G.__H = { __: [], __h: [] });
  return (e >= n.__.length && n.__.push({ __V: Yt }), n.__[e]);
}
function Ve(e) {
  return ((dt = 1), Js(Qs, e));
}
function Js(e, t, n) {
  var r = Xe(De++, 2);
  if (
    ((r.t = e),
    !r.__c &&
      ((r.__ = [
        n ? n(t) : Qs(void 0, t),
        function (a) {
          var c = r.__N ? r.__N[0] : r.__[0],
            u = r.t(c, a);
          c !== u && ((r.__N = [u, r.__[1]]), r.__c.setState({}));
        },
      ]),
      (r.__c = G),
      !G.u))
  ) {
    var o = function (a, c, u) {
      if (!r.__c.__H) return !0;
      var d = r.__c.__H.__.filter(function (f) {
        return !!f.__c;
      });
      if (
        d.every(function (f) {
          return !f.__N;
        })
      )
        return !s || s.call(this, a, c, u);
      var l = !1;
      return (
        d.forEach(function (f) {
          if (f.__N) {
            var h = f.__[0];
            ((f.__ = f.__N), (f.__N = void 0), h !== f.__[0] && (l = !0));
          }
        }),
        !(!l && r.__c.props === a) && (!s || s.call(this, a, c, u))
      );
    };
    G.u = !0;
    var s = G.shouldComponentUpdate,
      i = G.componentWillUpdate;
    ((G.componentWillUpdate = function (a, c, u) {
      if (this.__e) {
        var d = s;
        ((s = void 0), o(a, c, u), (s = d));
      }
      i && i.call(this, a, c, u);
    }),
      (G.shouldComponentUpdate = o));
  }
  return r.__N || r.__;
}
function Al(e, t) {
  var n = Xe(De++, 3);
  !oe.__s && Sr(n.__H, t) && ((n.__ = e), (n.i = t), G.__H.__h.push(n));
}
function Zs(e, t) {
  var n = Xe(De++, 4);
  !oe.__s && Sr(n.__H, t) && ((n.__ = e), (n.i = t), G.__h.push(n));
}
function Ol(e) {
  return (
    (dt = 5),
    Mt(function () {
      return { current: e };
    }, [])
  );
}
function Dl(e, t, n) {
  ((dt = 6),
    Zs(
      function () {
        return typeof e == "function"
          ? (e(t()),
            function () {
              return e(null);
            })
          : e
            ? ((e.current = t()),
              function () {
                return (e.current = null);
              })
            : void 0;
      },
      n == null ? n : n.concat(e),
    ));
}
function Mt(e, t) {
  var n = Xe(De++, 7);
  return Sr(n.__H, t) ? ((n.__V = e()), (n.i = t), (n.__h = e), n.__V) : n.__;
}
function at(e, t) {
  return (
    (dt = 8),
    Mt(function () {
      return e;
    }, t)
  );
}
function Ll(e) {
  var t = G.context[e.__c],
    n = Xe(De++, 9);
  return (
    (n.c = e),
    t ? (n.__ == null && ((n.__ = !0), t.sub(G)), t.props.value) : e.__
  );
}
function Nl(e, t) {
  oe.useDebugValue && oe.useDebugValue(t ? t(e) : e);
}
function Pl(e) {
  var t = Xe(De++, 10),
    n = Ve();
  return (
    (t.__ = e),
    G.componentDidCatch ||
      (G.componentDidCatch = function (r, o) {
        (t.__ && t.__(r, o), n[1](r));
      }),
    [
      n[0],
      function () {
        n[1](void 0);
      },
    ]
  );
}
function Fl() {
  var e = Xe(De++, 11);
  if (!e.__) {
    for (var t = G.__v; t !== null && !t.__m && t.__ !== null; ) t = t.__;
    var n = t.__m || (t.__m = [0, 0]);
    e.__ = "P" + n[0] + "-" + n[1]++;
  }
  return e.__;
}
function Bl() {
  for (var e; (e = Xs.shift()); )
    if (e.__P && e.__H)
      try {
        (e.__H.__h.forEach(Kt), e.__H.__h.forEach(Jn), (e.__H.__h = []));
      } catch (t) {
        ((e.__H.__h = []), oe.__e(t, e.__v));
      }
}
((oe.__b = function (e) {
  ((G = null), wo && wo(e));
}),
  (oe.__ = function (e, t) {
    (t.__k && t.__k.__m && (e.__m = t.__k.__m), To && To(e, t));
  }),
  (oe.__r = function (e) {
    (ko && ko(e), (De = 0));
    var t = (G = e.__c).__H;
    (t &&
      (Tn === G
        ? ((t.__h = []),
          (G.__h = []),
          t.__.forEach(function (n) {
            (n.__N && (n.__ = n.__N), (n.__V = Yt), (n.__N = n.i = void 0));
          }))
        : (t.__h.forEach(Kt), t.__h.forEach(Jn), (t.__h = []), (De = 0))),
      (Tn = G));
  }),
  (oe.diffed = function (e) {
    Io && Io(e);
    var t = e.__c;
    (t &&
      t.__H &&
      (t.__H.__h.length &&
        ((Xs.push(t) !== 1 && Eo === oe.requestAnimationFrame) ||
          ((Eo = oe.requestAnimationFrame) || $l)(Bl)),
      t.__H.__.forEach(function (n) {
        (n.i && (n.__H = n.i),
          n.__V !== Yt && (n.__ = n.__V),
          (n.i = void 0),
          (n.__V = Yt));
      })),
      (Tn = G = null));
  }),
  (oe.__c = function (e, t) {
    (t.some(function (n) {
      try {
        (n.__h.forEach(Kt),
          (n.__h = n.__h.filter(function (r) {
            return !r.__ || Jn(r);
          })));
      } catch (r) {
        (t.some(function (o) {
          o.__h && (o.__h = []);
        }),
          (t = []),
          oe.__e(r, n.__v));
      }
    }),
      Co && Co(e, t));
  }),
  (oe.unmount = function (e) {
    xo && xo(e);
    var t,
      n = e.__c;
    n &&
      n.__H &&
      (n.__H.__.forEach(function (r) {
        try {
          Kt(r);
        } catch (o) {
          t = o;
        }
      }),
      (n.__H = void 0),
      t && oe.__e(t, n.__v));
  }));
var Ro = typeof requestAnimationFrame == "function";
function $l(e) {
  var t,
    n = function () {
      (clearTimeout(r), Ro && cancelAnimationFrame(t), setTimeout(e));
    },
    r = setTimeout(n, 100);
  Ro && (t = requestAnimationFrame(n));
}
function Kt(e) {
  var t = G,
    n = e.__c;
  (typeof n == "function" && ((e.__c = void 0), n()), (G = t));
}
function Jn(e) {
  var t = G;
  ((e.__c = e.__()), (G = t));
}
function Sr(e, t) {
  return (
    !e ||
    e.length !== t.length ||
    t.some(function (n, r) {
      return n !== e[r];
    })
  );
}
function Qs(e, t) {
  return typeof t == "function" ? t(e) : t;
}
const Ul = Object.defineProperty(
    {
      __proto__: null,
      useCallback: at,
      useContext: Ll,
      useDebugValue: Nl,
      useEffect: Al,
      useErrorBoundary: Pl,
      useId: Fl,
      useImperativeHandle: Dl,
      useLayoutEffect: Zs,
      useMemo: Mt,
      useReducer: Js,
      useRef: Ol,
      useState: Ve,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
  Hl = "http://www.w3.org/2000/svg";
function Wl() {
  const e = (r) => V.createElementNS(Hl, r),
    t = _e(e("svg"), {
      width: "32",
      height: "30",
      viewBox: "0 0 72 66",
      fill: "inherit",
    }),
    n = _e(e("path"), {
      transform: "translate(11, 11)",
      d: "M29,2.26a4.67,4.67,0,0,0-8,0L14.42,13.53A32.21,32.21,0,0,1,32.17,40.19H27.55A27.68,27.68,0,0,0,12.09,17.47L6,28a15.92,15.92,0,0,1,9.23,12.17H4.62A.76.76,0,0,1,4,39.06l2.94-5a10.74,10.74,0,0,0-3.36-1.9l-2.91,5a4.54,4.54,0,0,0,1.69,6.24A4.66,4.66,0,0,0,4.62,44H19.15a19.4,19.4,0,0,0-8-17.31l2.31-4A23.87,23.87,0,0,1,23.76,44H36.07a35.88,35.88,0,0,0-16.41-31.8l4.67-8a.77.77,0,0,1,1.05-.27c.53.29,20.29,34.77,20.66,35.17a.76.76,0,0,1-.68,1.13H40.6q.09,1.91,0,3.81h4.78A4.59,4.59,0,0,0,50,39.43a4.49,4.49,0,0,0-.62-2.28Z",
    });
  return (t.appendChild(n), t);
}
function zl({ options: e }) {
  const t = Mt(() => ({ __html: Wl().outerHTML }), []);
  return P(
    "h2",
    { class: "dialog__header" },
    P("span", { class: "dialog__title" }, e.formTitle),
    e.showBranding
      ? P("a", {
          class: "brand-link",
          target: "_blank",
          href: "https://sentry.io/welcome/",
          title: "Powered by Sentry",
          rel: "noopener noreferrer",
          dangerouslySetInnerHTML: t,
        })
      : null,
  );
}
function jl(e, t) {
  const n = [];
  return (
    t.isNameRequired && !e.name && n.push(t.nameLabel),
    t.isEmailRequired && !e.email && n.push(t.emailLabel),
    e.message || n.push(t.messageLabel),
    n
  );
}
function Rn(e, t) {
  const n = e.get(t);
  return typeof n == "string" ? n.trim() : "";
}
function ql({
  options: e,
  defaultEmail: t,
  defaultName: n,
  onFormClose: r,
  onSubmit: o,
  onSubmitSuccess: s,
  onSubmitError: i,
  showEmail: a,
  showName: c,
  screenshotInput: u,
}) {
  const {
      tags: d,
      addScreenshotButtonLabel: l,
      removeScreenshotButtonLabel: f,
      cancelButtonLabel: h,
      emailLabel: p,
      emailPlaceholder: m,
      isEmailRequired: _,
      isNameRequired: g,
      messageLabel: v,
      messagePlaceholder: M,
      nameLabel: w,
      namePlaceholder: I,
      submitButtonLabel: S,
      isRequiredLabel: C,
    } = e,
    [x, y] = Ve(!1),
    [k, F] = Ve(null),
    [b, A] = Ve(!1),
    U = u?.input,
    [j, Q] = Ve(null),
    D = at((z) => {
      (Q(z), A(!1));
    }, []),
    q = at(
      (z) => {
        const ee = jl(z, {
          emailLabel: p,
          isEmailRequired: _,
          isNameRequired: g,
          messageLabel: v,
          nameLabel: w,
        });
        return (
          ee.length > 0
            ? F(
                `Please enter in the following required fields: ${ee.join(", ")}`,
              )
            : F(null),
          ee.length === 0
        );
      },
      [p, _, g, v, w],
    ),
    L = at(
      async (z) => {
        y(!0);
        try {
          if ((z.preventDefault(), !(z.target instanceof HTMLFormElement)))
            return;
          const ee = new FormData(z.target),
            pe = await (u && b ? u.value() : void 0),
            me = {
              name: Rn(ee, "name"),
              email: Rn(ee, "email"),
              message: Rn(ee, "message"),
              attachments: pe ? [pe] : void 0,
            };
          if (!q(me)) return;
          try {
            const le = await o(
              {
                name: me.name,
                email: me.email,
                message: me.message,
                source: fl,
                tags: d,
              },
              { attachments: me.attachments },
            );
            s(me, le);
          } catch (le) {
            (qt && E.error(le), F(le), i(le));
          }
        } finally {
          y(!1);
        }
      },
      [u && b, s, i],
    );
  return P(
    "form",
    { class: "form", onSubmit: L },
    U && b ? P(U, { onError: D }) : null,
    P(
      "fieldset",
      { class: "form__right", "data-sentry-feedback": !0, disabled: x },
      P(
        "div",
        { class: "form__top" },
        k ? P("div", { class: "form__error-container" }, k) : null,
        c
          ? P(
              "label",
              { for: "name", class: "form__label" },
              P(Mn, { label: w, isRequiredLabel: C, isRequired: g }),
              P("input", {
                class: "form__input",
                defaultValue: n,
                id: "name",
                name: "name",
                placeholder: I,
                required: g,
                type: "text",
              }),
            )
          : P("input", {
              "aria-hidden": !0,
              value: n,
              name: "name",
              type: "hidden",
            }),
        a
          ? P(
              "label",
              { for: "email", class: "form__label" },
              P(Mn, { label: p, isRequiredLabel: C, isRequired: _ }),
              P("input", {
                class: "form__input",
                defaultValue: t,
                id: "email",
                name: "email",
                placeholder: m,
                required: _,
                type: "email",
              }),
            )
          : P("input", {
              "aria-hidden": !0,
              value: t,
              name: "email",
              type: "hidden",
            }),
        P(
          "label",
          { for: "message", class: "form__label" },
          P(Mn, { label: v, isRequiredLabel: C, isRequired: !0 }),
          P("textarea", {
            autoFocus: !0,
            class: "form__input form__input--textarea",
            id: "message",
            name: "message",
            placeholder: M,
            required: !0,
            rows: 5,
          }),
        ),
        U
          ? P(
              "label",
              { for: "screenshot", class: "form__label" },
              P(
                "button",
                {
                  class: "btn btn--default",
                  disabled: x,
                  type: "button",
                  onClick: () => {
                    (Q(null), A((z) => !z));
                  },
                },
                b ? f : l,
              ),
              j
                ? P("div", { class: "form__error-container" }, j.message)
                : null,
            )
          : null,
      ),
      P(
        "div",
        { class: "btn-group" },
        P(
          "button",
          { class: "btn btn--primary", disabled: x, type: "submit" },
          S,
        ),
        P(
          "button",
          {
            class: "btn btn--default",
            disabled: x,
            type: "button",
            onClick: r,
          },
          h,
        ),
      ),
    ),
  );
}
function Mn({ label: e, isRequired: t, isRequiredLabel: n }) {
  return P(
    "span",
    { class: "form__label__text" },
    e,
    t && P("span", { class: "form__label__text--required" }, n),
  );
}
const Pt = 16,
  Mo = 17,
  Vl = "http://www.w3.org/2000/svg";
function Gl() {
  const e = (c) => Se.document.createElementNS(Vl, c),
    t = _e(e("svg"), {
      width: `${Pt}`,
      height: `${Mo}`,
      viewBox: `0 0 ${Pt} ${Mo}`,
      fill: "inherit",
    }),
    n = _e(e("g"), { clipPath: "url(#clip0_57_156)" }),
    r = _e(e("path"), {
      "fill-rule": "evenodd",
      "clip-rule": "evenodd",
      d: "M3.55544 15.1518C4.87103 16.0308 6.41775 16.5 8 16.5C10.1217 16.5 12.1566 15.6571 13.6569 14.1569C15.1571 12.6566 16 10.6217 16 8.5C16 6.91775 15.5308 5.37103 14.6518 4.05544C13.7727 2.73985 12.5233 1.71447 11.0615 1.10897C9.59966 0.503466 7.99113 0.34504 6.43928 0.653721C4.88743 0.962403 3.46197 1.72433 2.34315 2.84315C1.22433 3.96197 0.462403 5.38743 0.153721 6.93928C-0.15496 8.49113 0.00346625 10.0997 0.608967 11.5615C1.21447 13.0233 2.23985 14.2727 3.55544 15.1518ZM4.40546 3.1204C5.46945 2.40946 6.72036 2.03 8 2.03C9.71595 2.03 11.3616 2.71166 12.575 3.92502C13.7883 5.13838 14.47 6.78405 14.47 8.5C14.47 9.77965 14.0905 11.0306 13.3796 12.0945C12.6687 13.1585 11.6582 13.9878 10.476 14.4775C9.29373 14.9672 7.99283 15.0953 6.73777 14.8457C5.48271 14.596 4.32987 13.9798 3.42502 13.075C2.52018 12.1701 1.90397 11.0173 1.65432 9.76224C1.40468 8.50718 1.5328 7.20628 2.0225 6.02404C2.5122 4.8418 3.34148 3.83133 4.40546 3.1204Z",
    }),
    o = _e(e("path"), {
      d: "M6.68775 12.4297C6.78586 12.4745 6.89218 12.4984 7 12.5C7.11275 12.4955 7.22315 12.4664 7.32337 12.4145C7.4236 12.3627 7.51121 12.2894 7.58 12.2L12 5.63999C12.0848 5.47724 12.1071 5.28902 12.0625 5.11098C12.0178 4.93294 11.9095 4.77744 11.7579 4.67392C11.6064 4.57041 11.4221 4.52608 11.24 4.54931C11.0579 4.57254 10.8907 4.66173 10.77 4.79999L6.88 10.57L5.13 8.56999C5.06508 8.49566 4.98613 8.43488 4.89768 8.39111C4.80922 8.34735 4.713 8.32148 4.61453 8.31498C4.51605 8.30847 4.41727 8.32147 4.32382 8.35322C4.23038 8.38497 4.14413 8.43484 4.07 8.49999C3.92511 8.63217 3.83692 8.81523 3.82387 9.01092C3.81083 9.2066 3.87393 9.39976 4 9.54999L6.43 12.24C6.50187 12.3204 6.58964 12.385 6.68775 12.4297Z",
    });
  t.appendChild(n).append(o, r);
  const s = e("defs"),
    i = _e(e("clipPath"), { id: "clip0_57_156" }),
    a = _e(e("rect"), {
      width: `${Pt}`,
      height: `${Pt}`,
      fill: "white",
      transform: "translate(0 0.5)",
    });
  return (
    i.appendChild(a),
    s.appendChild(i),
    t.appendChild(s).appendChild(i).appendChild(a),
    t
  );
}
function Yl({ open: e, onFormSubmitted: t, ...n }) {
  const r = n.options,
    o = Mt(() => ({ __html: Gl().outerHTML }), []),
    [s, i] = Ve(null),
    a = at(() => {
      (s && (clearTimeout(s), i(null)), t());
    }, [s]),
    c = at(
      (u, d) => {
        (n.onSubmitSuccess(u, d),
          i(
            setTimeout(() => {
              (t(), i(null));
            }, pl),
          ));
      },
      [t],
    );
  return P(
    Rt,
    null,
    s
      ? P(
          "div",
          { class: "success__position", onClick: a },
          P(
            "div",
            { class: "success__content" },
            r.successMessageText,
            P("span", { class: "success__icon", dangerouslySetInnerHTML: o }),
          ),
        )
      : P(
          "dialog",
          { class: "dialog", onClick: r.onFormClose, open: e },
          P(
            "div",
            { class: "dialog__position" },
            P(
              "div",
              {
                class: "dialog__content",
                onClick: (u) => {
                  u.stopPropagation();
                },
              },
              P(zl, { options: r }),
              P(ql, { ...n, onSubmitSuccess: c }),
            ),
          ),
        ),
  );
}
const Kl = `
.dialog {
  position: fixed;
  z-index: var(--z-index);
  margin: 0;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  height: 100vh;
  width: 100vw;

  color: var(--dialog-color, var(--foreground));
  fill: var(--dialog-color, var(--foreground));
  line-height: 1.75em;

  background-color: rgba(0, 0, 0, 0.05);
  border: none;
  inset: 0;
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

.dialog__position {
  position: fixed;
  z-index: var(--z-index);
  inset: var(--dialog-inset);
  padding: var(--page-margin);
  display: flex;
  max-height: calc(100vh - (2 * var(--page-margin)));
}
@media (max-width: 600px) {
  .dialog__position {
    inset: var(--page-margin);
    padding: 0;
  }
}

.dialog__position:has(.editor) {
  inset: var(--page-margin);
  padding: 0;
}

.dialog:not([open]) {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
.dialog:not([open]) .dialog__content {
  transform: translate(0, -16px) scale(0.98);
}

.dialog__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: var(--dialog-padding, 24px);
  max-width: 100%;
  width: 100%;
  max-height: 100%;
  overflow: auto;

  background: var(--dialog-background, var(--background));
  border-radius: var(--dialog-border-radius, 20px);
  border: var(--dialog-border, var(--border));
  box-shadow: var(--dialog-box-shadow, var(--box-shadow));
  transform: translate(0, 0) scale(1);
  transition: transform 0.2s ease-in-out;
}

`,
  Xl = `
.dialog__header {
  display: flex;
  gap: 4px;
  justify-content: space-between;
  font-weight: var(--dialog-header-weight, 600);
  margin: 0;
}
.dialog__title {
  align-self: center;
  width: var(--form-width, 272px);
}

@media (max-width: 600px) {
  .dialog__title {
    width: auto;
  }
}

.dialog__position:has(.editor) .dialog__title {
  width: auto;
}


.brand-link {
  display: inline-flex;
}
.brand-link:focus-visible {
  outline: var(--outline);
}
`,
  Jl = `
.form {
  display: flex;
  overflow: auto;
  flex-direction: row;
  gap: 16px;
  flex: 1 0;
}

.form fieldset {
  border: none;
  margin: 0;
  padding: 0;
}

.form__right {
  flex: 0 0 auto;
  display: flex;
  overflow: auto;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  width: var(--form-width, 100%);
}

.dialog__position:has(.editor) .form__right {
  width: var(--form-width, 272px);
}

.form__top {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form__error-container {
  color: var(--error-color);
  fill: var(--error-color);
}

.form__label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0px;
}

.form__label__text {
  display: flex;
  gap: 4px;
  align-items: center;
}

.form__label__text--required {
  font-size: 0.85em;
}

.form__input {
  font-family: inherit;
  line-height: inherit;
  background: transparent;
  box-sizing: border-box;
  border: var(--input-border, var(--border));
  border-radius: var(--input-border-radius, 6px);
  color: var(--input-color, inherit);
  fill: var(--input-color, inherit);
  font-size: var(--input-font-size, inherit);
  font-weight: var(--input-font-weight, 500);
  padding: 6px 12px;
}

.form__input::placeholder {
  opacity: 0.65;
  color: var(--input-placeholder-color, inherit);
  filter: var(--interactive-filter);
}

.form__input:focus-visible {
  outline: var(--input-focus-outline, var(--outline));
}

.form__input--textarea {
  font-family: inherit;
  resize: vertical;
}

.error {
  color: var(--error-color);
  fill: var(--error-color);
}
`,
  Zl = `
.btn-group {
  display: grid;
  gap: 8px;
}

.btn {
  line-height: inherit;
  border: var(--button-border, var(--border));
  border-radius: var(--button-border-radius, 6px);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--button-font-size, inherit);
  font-weight: var(--button-font-weight, 600);
  padding: var(--button-padding, 6px 16px);
}
.btn[disabled] {
  opacity: 0.6;
  pointer-events: none;
}

.btn--primary {
  color: var(--button-primary-color, var(--accent-foreground));
  fill: var(--button-primary-color, var(--accent-foreground));
  background: var(--button-primary-background, var(--accent-background));
  border: var(--button-primary-border, var(--border));
  border-radius: var(--button-primary-border-radius, 6px);
  font-weight: var(--button-primary-font-weight, 500);
}
.btn--primary:hover {
  color: var(--button-primary-hover-color, var(--accent-foreground));
  fill: var(--button-primary-hover-color, var(--accent-foreground));
  background: var(--button-primary-hover-background, var(--accent-background));
  filter: var(--interactive-filter);
}
.btn--primary:focus-visible {
  background: var(--button-primary-hover-background, var(--accent-background));
  filter: var(--interactive-filter);
  outline: var(--button-primary-focus-outline, var(--outline));
}

.btn--default {
  color: var(--button-color, var(--foreground));
  fill: var(--button-color, var(--foreground));
  background: var(--button-background, var(--background));
  border: var(--button-border, var(--border));
  border-radius: var(--button-border-radius, 6px);
  font-weight: var(--button-font-weight, 500);
}
.btn--default:hover {
  color: var(--button-color, var(--foreground));
  fill: var(--button-color, var(--foreground));
  background: var(--button-hover-background, var(--background));
  filter: var(--interactive-filter);
}
.btn--default:focus-visible {
  background: var(--button-hover-background, var(--background));
  filter: var(--interactive-filter);
  outline: var(--button-focus-outline, var(--outline));
}
`,
  Ql = `
.success__position {
  position: fixed;
  inset: var(--dialog-inset);
  padding: var(--page-margin);
  z-index: var(--z-index);
}
.success__content {
  background: var(--success-background, var(--background));
  border: var(--success-border, var(--border));
  border-radius: var(--success-border-radius, 1.7em/50%);
  box-shadow: var(--success-box-shadow, var(--box-shadow));
  font-weight: var(--success-font-weight, 600);
  color: var(--success-color);
  fill: var(--success-color);
  padding: 12px 24px;
  line-height: 1.75em;

  display: grid;
  align-items: center;
  grid-auto-flow: column;
  gap: 6px;
  cursor: default;
}

.success__icon {
  display: flex;
}
`;
function eu(e) {
  const t = V.createElement("style");
  return (
    (t.textContent = `
:host {
  --dialog-inset: var(--inset);
}

${Kl}
${Xl}
${Jl}
${Zl}
${Ql}
`),
    e && t.setAttribute("nonce", e),
    t
  );
}
function tu() {
  const e = Le().getUser(),
    t = pn().getUser(),
    n = ya().getUser();
  return e && Object.keys(e).length ? e : t && Object.keys(t).length ? t : n;
}
const nu = () => ({
  name: "FeedbackModal",
  setupOnce() {},
  createDialog: ({
    options: e,
    screenshotIntegration: t,
    sendFeedback: n,
    shadow: r,
  }) => {
    const o = r,
      s = e.useSentryUser,
      i = tu(),
      a = V.createElement("div"),
      c = eu(e.styleNonce);
    let u = "";
    const d = {
        get el() {
          return a;
        },
        appendToDom() {
          !o.contains(c) &&
            !o.contains(a) &&
            (o.appendChild(c), o.appendChild(a));
        },
        removeFromDom() {
          (a.remove(), c.remove(), (V.body.style.overflow = u));
        },
        open() {
          (f(!0),
            e.onFormOpen?.(),
            re()?.emit("openFeedbackWidget"),
            (u = V.body.style.overflow),
            (V.body.style.overflow = "hidden"));
        },
        close() {
          (f(!1), (V.body.style.overflow = u));
        },
      },
      l = t?.createInput({ h: P, hooks: Ul, dialog: d, options: e }),
      f = (h) => {
        Ml(
          P(Yl, {
            options: e,
            screenshotInput: l,
            showName: e.showName || e.isNameRequired,
            showEmail: e.showEmail || e.isEmailRequired,
            defaultName: (s && i?.[s.name]) || "",
            defaultEmail: (s && i?.[s.email]) || "",
            onFormClose: () => {
              (f(!1), e.onFormClose?.());
            },
            onSubmit: n,
            onSubmitSuccess: (p, m) => {
              (f(!1), e.onSubmitSuccess?.(p, m));
            },
            onSubmitError: (p) => {
              e.onSubmitError?.(p);
            },
            onFormSubmitted: () => {
              e.onFormSubmitted?.();
            },
            open: h,
          }),
          a,
        );
      };
    return d;
  },
});
function ru({ h: e }) {
  return function () {
    return e(
      "svg",
      {
        "data-test-id": "icon-close",
        viewBox: "0 0 16 16",
        fill: "#2B2233",
        height: "25px",
        width: "25px",
      },
      e("circle", { r: "7", cx: "8", cy: "8", fill: "white" }),
      e("path", {
        strokeWidth: "1.5",
        d: "M8,16a8,8,0,1,1,8-8A8,8,0,0,1,8,16ZM8,1.53A6.47,6.47,0,1,0,14.47,8,6.47,6.47,0,0,0,8,1.53Z",
      }),
      e("path", {
        strokeWidth: "1.5",
        d: "M5.34,11.41a.71.71,0,0,1-.53-.22.74.74,0,0,1,0-1.06l5.32-5.32a.75.75,0,0,1,1.06,1.06L5.87,11.19A.74.74,0,0,1,5.34,11.41Z",
      }),
      e("path", {
        strokeWidth: "1.5",
        d: "M10.66,11.41a.74.74,0,0,1-.53-.22L4.81,5.87A.75.75,0,0,1,5.87,4.81l5.32,5.32a.74.74,0,0,1,0,1.06A.71.71,0,0,1,10.66,11.41Z",
      }),
    );
  };
}
function ou(e) {
  const t = V.createElement("style"),
    n = "#1A141F",
    r = "#302735";
  return (
    (t.textContent = `
.editor {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
}

.editor__image-container {
  justify-items: center;
  padding: 15px;
  position: relative;
  height: 100%;
  border-radius: var(--menu-border-radius, 6px);

  background-color: ${n};
  background-image: repeating-linear-gradient(
      -145deg,
      transparent,
      transparent 8px,
      ${n} 8px,
      ${n} 11px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 15px,
      ${r} 15px,
      ${r} 16px
    );
}

.editor__canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor__canvas-container > * {
  object-fit: contain;
  position: absolute;
}

.editor__tool-container {
  padding-top: 8px;
  display: flex;
  justify-content: center;
}

.editor__tool-bar {
  display: flex;
  gap: 8px;
}

.editor__tool {
  display: flex;
  padding: 8px 12px;
  justify-content: center;
  align-items: center;
  border: var(--button-border, var(--border));
  border-radius: var(--button-border-radius, 6px);
  background: var(--button-background, var(--background));
  color: var(--button-color, var(--foreground));
}

.editor__tool--active {
  background: var(--button-primary-background, var(--accent-background));
  color: var(--button-primary-color, var(--accent-foreground));
}

.editor__rect {
  position: absolute;
  z-index: 2;
}

.editor__rect button {
  opacity: 0;
  position: absolute;
  top: -12px;
  right: -12px;
  cursor: pointer;
  padding: 0;
  z-index: 3;
  border: none;
  background: none;
}

.editor__rect:hover button {
  opacity: 1;
}
`),
    e && t.setAttribute("nonce", e),
    t
  );
}
function su({ h: e }) {
  return function ({ action: n, setAction: r }) {
    return e(
      "div",
      { class: "editor__tool-container" },
      e(
        "div",
        { class: "editor__tool-bar" },
        e(
          "button",
          {
            type: "button",
            class: `editor__tool ${n === "highlight" ? "editor__tool--active" : ""}`,
            onClick: () => {
              r(n === "highlight" ? "" : "highlight");
            },
          },
          "Highlight",
        ),
        e(
          "button",
          {
            type: "button",
            class: `editor__tool ${n === "hide" ? "editor__tool--active" : ""}`,
            onClick: () => {
              r(n === "hide" ? "" : "hide");
            },
          },
          "Hide",
        ),
      ),
    );
  };
}
function iu({ hooks: e }) {
  function t() {
    const [n, r] = e.useState(Se.devicePixelRatio ?? 1);
    return (
      e.useEffect(() => {
        const o = () => {
            r(Se.devicePixelRatio);
          },
          s = matchMedia(`(resolution: ${Se.devicePixelRatio}dppx)`);
        return (
          s.addEventListener("change", o),
          () => {
            s.removeEventListener("change", o);
          }
        );
      }, []),
      n
    );
  }
  return function ({
    onBeforeScreenshot: r,
    onScreenshot: o,
    onAfterScreenshot: s,
    onError: i,
  }) {
    const a = t();
    e.useEffect(() => {
      (async () => {
        r();
        const u = await yt.mediaDevices.getDisplayMedia({
            video: { width: Se.innerWidth * a, height: Se.innerHeight * a },
            audio: !1,
            monitorTypeSurfaces: "exclude",
            preferCurrentTab: !0,
            selfBrowserSurface: "include",
            surfaceSwitching: "exclude",
          }),
          d = V.createElement("video");
        (await new Promise((l, f) => {
          ((d.srcObject = u),
            (d.onloadedmetadata = () => {
              (o(d, a), u.getTracks().forEach((h) => h.stop()), l());
            }),
            d.play().catch(f));
        }),
          s());
      })().catch(i);
    }, []);
  };
}
function au(e, t, n) {
  switch (e.type) {
    case "highlight": {
      ((t.shadowColor = "rgba(0, 0, 0, 0.7)"),
        (t.shadowBlur = 50),
        (t.fillStyle = n),
        t.fillRect(e.x - 1, e.y - 1, e.w + 2, e.h + 2),
        t.clearRect(e.x, e.y, e.w, e.h));
      break;
    }
    case "hide":
      ((t.fillStyle = "rgb(0, 0, 0)"), t.fillRect(e.x, e.y, e.w, e.h));
      break;
  }
}
function Ne(e, t, n) {
  if (!e) return;
  const r = e.getContext("2d", t);
  r && n(e, r);
}
function An(e, t) {
  Ne(e, { alpha: !0 }, (n, r) => {
    r.drawImage(t, 0, 0, t.width, t.height, 0, 0, n.width, n.height);
  });
}
function On(e, t, n) {
  Ne(e, { alpha: !0 }, (r, o) => {
    (n.length &&
      ((o.fillStyle = "rgba(0, 0, 0, 0.25)"),
      o.fillRect(0, 0, r.width, r.height)),
      n.forEach((s) => {
        au(s, o, t);
      }));
  });
}
function cu({ h: e, hooks: t, outputBuffer: n, dialog: r, options: o }) {
  const s = iu({ hooks: t }),
    i = su({ h: e }),
    a = ru({ h: e }),
    c = { __html: ou(o.styleNonce).innerText },
    u = r.el.style,
    d = ({ screenshot: l }) => {
      const [f, h] = t.useState("highlight"),
        [p, m] = t.useState([]),
        _ = t.useRef(null),
        g = t.useRef(null),
        v = t.useRef(null),
        M = t.useRef(null),
        [w, I] = t.useState(1),
        S = t.useMemo(() => {
          const b = V.getElementById(o.id);
          if (!b) return "white";
          const A = getComputedStyle(b);
          return (
            A.getPropertyValue("--button-primary-background") ||
            A.getPropertyValue("--accent-background")
          );
        }, [o.id]);
      t.useLayoutEffect(() => {
        const b = () => {
          const A = _.current;
          A &&
            (Ne(l.canvas, { alpha: !1 }, (U) => {
              const j = Math.min(
                A.clientWidth / U.width,
                A.clientHeight / U.height,
              );
              I(j);
            }),
            (A.clientHeight === 0 || A.clientWidth === 0) && setTimeout(b, 0));
        };
        return (
          b(),
          Se.addEventListener("resize", b),
          () => {
            Se.removeEventListener("resize", b);
          }
        );
      }, [l]);
      const C = t.useCallback(
        (b, A) => {
          Ne(b, { alpha: !0 }, (U, j) => {
            (j.scale(A, A),
              (U.width = l.canvas.width),
              (U.height = l.canvas.height));
          });
        },
        [l],
      );
      (t.useEffect(() => {
        (C(g.current, l.dpi), An(g.current, l.canvas));
      }, [l]),
        t.useEffect(() => {
          (C(v.current, l.dpi),
            Ne(v.current, { alpha: !0 }, (b, A) => {
              A.clearRect(0, 0, b.width, b.height);
            }),
            On(v.current, S, p));
        }, [p, S]),
        t.useEffect(() => {
          (C(n, l.dpi),
            An(n, l.canvas),
            Ne(V.createElement("canvas"), { alpha: !0 }, (b, A) => {
              (A.scale(l.dpi, l.dpi),
                (b.width = l.canvas.width),
                (b.height = l.canvas.height),
                On(b, S, p),
                An(n, b));
            }));
        }, [p, l, S]));
      const x = (b) => {
          if (!f || !M.current) return;
          const A = M.current.getBoundingClientRect(),
            U = { type: f, x: b.offsetX / w, y: b.offsetY / w },
            j = (q, L) => {
              const z = (L.clientX - A.x) / w,
                ee = (L.clientY - A.y) / w;
              return {
                type: q.type,
                x: Math.min(q.x, z),
                y: Math.min(q.y, ee),
                w: Math.abs(z - q.x),
                h: Math.abs(ee - q.y),
              };
            },
            Q = (q) => {
              (Ne(v.current, { alpha: !0 }, (L, z) => {
                z.clearRect(0, 0, L.width, L.height);
              }),
                On(v.current, S, [...p, j(U, q)]));
            },
            D = (q) => {
              const L = j(U, q);
              (L.w * w >= 1 && L.h * w >= 1 && m((z) => [...z, L]),
                V.removeEventListener("mousemove", Q),
                V.removeEventListener("mouseup", D));
            };
          (V.addEventListener("mousemove", Q),
            V.addEventListener("mouseup", D));
        },
        y = t.useCallback(
          (b) => (A) => {
            (A.preventDefault(),
              A.stopPropagation(),
              m((U) => {
                const j = [...U];
                return (j.splice(b, 1), j);
              }));
          },
          [],
        ),
        k = {
          width: `${l.canvas.width * w}px`,
          height: `${l.canvas.height * w}px`,
        },
        F = (b) => {
          b.stopPropagation();
        };
      return e(
        "div",
        { class: "editor" },
        e("style", { nonce: o.styleNonce, dangerouslySetInnerHTML: c }),
        e(
          "div",
          { class: "editor__image-container" },
          e(
            "div",
            { class: "editor__canvas-container", ref: _ },
            e("canvas", { ref: g, id: "background", style: k }),
            e("canvas", { ref: v, id: "foreground", style: k }),
            e(
              "div",
              { ref: M, onMouseDown: x, style: k },
              p.map((b, A) =>
                e(
                  "div",
                  {
                    key: A,
                    class: "editor__rect",
                    style: {
                      top: `${b.y * w}px`,
                      left: `${b.x * w}px`,
                      width: `${b.w * w}px`,
                      height: `${b.h * w}px`,
                    },
                  },
                  e(
                    "button",
                    {
                      "aria-label": "Remove",
                      onClick: y(A),
                      onMouseDown: F,
                      onMouseUp: F,
                      type: "button",
                    },
                    e(a, null),
                  ),
                ),
              ),
            ),
          ),
        ),
        e(i, { action: f, setAction: h }),
      );
    };
  return function ({ onError: f }) {
    const [h, p] = t.useState();
    return (
      s({
        onBeforeScreenshot: t.useCallback(() => {
          u.display = "none";
        }, []),
        onScreenshot: t.useCallback((m, _) => {
          (Ne(V.createElement("canvas"), { alpha: !1 }, (g, v) => {
            (v.scale(_, _),
              (g.width = m.videoWidth),
              (g.height = m.videoHeight),
              v.drawImage(m, 0, 0, g.width, g.height),
              p({ canvas: g, dpi: _ }));
          }),
            (n.width = m.videoWidth),
            (n.height = m.videoHeight));
        }, []),
        onAfterScreenshot: t.useCallback(() => {
          u.display = "block";
        }, []),
        onError: t.useCallback((m) => {
          ((u.display = "block"), f(m));
        }, []),
      }),
      h ? e(d, { screenshot: h }) : e("div", null)
    );
  };
}
const lu = () => ({
    name: "FeedbackScreenshot",
    setupOnce() {},
    createInput: ({ h: e, hooks: t, dialog: n, options: r }) => {
      const o = V.createElement("canvas");
      return {
        input: cu({ h: e, hooks: t, outputBuffer: o, dialog: n, options: r }),
        value: async () => {
          const s = await new Promise((i) => {
            o.toBlob(i, "image/png");
          });
          if (s)
            return {
              data: new Uint8Array(await s.arrayBuffer()),
              filename: "screenshot.png",
              contentType: "application/png",
            };
        },
      };
    },
  }),
  uu = wl({
    getModalIntegration: () => nu,
    getScreenshotIntegration: () => lu,
  });
function Er(e, t) {
  const n = wr(e, t),
    r = { type: mu(t), value: gu(t) };
  return (
    n.length && (r.stacktrace = { frames: n }),
    r.type === void 0 &&
      r.value === "" &&
      (r.value = "Unrecoverable error caught"),
    r
  );
}
function du(e, t, n, r) {
  const s = re()?.getOptions().normalizeDepth,
    i = Su(t),
    a = { __serialized__: Sa(t, s) };
  if (i) return { exception: { values: [Er(e, i)] }, extra: a };
  const c = {
    exception: {
      values: [
        {
          type: hr(t) ? t.constructor.name : r ? "UnhandledRejection" : "Error",
          value: vu(t, { isUnhandledRejection: r }),
        },
      ],
    },
    extra: a,
  };
  if (n) {
    const u = wr(e, n);
    u.length && (c.exception.values[0].stacktrace = { frames: u });
  }
  return c;
}
function Dn(e, t) {
  return { exception: { values: [Er(e, t)] } };
}
function wr(e, t) {
  const n = t.stacktrace || t.stack || "",
    r = hu(t),
    o = pu(t);
  try {
    return e(n, r, o);
  } catch {}
  return [];
}
const fu = /Minified React error #\d+;/i;
function hu(e) {
  return e && fu.test(e.message) ? 1 : 0;
}
function pu(e) {
  return typeof e.framesToPop == "number" ? e.framesToPop : 0;
}
function ei(e) {
  return typeof WebAssembly < "u" && typeof WebAssembly.Exception < "u"
    ? e instanceof WebAssembly.Exception
    : !1;
}
function mu(e) {
  const t = e?.name;
  return !t && ei(e)
    ? e.message && Array.isArray(e.message) && e.message.length == 2
      ? e.message[0]
      : "WebAssembly.Exception"
    : t;
}
function gu(e) {
  const t = e?.message;
  return ei(e)
    ? Array.isArray(e.message) && e.message.length == 2
      ? e.message[1]
      : "wasm exception"
    : t
      ? t.error && typeof t.error.message == "string"
        ? t.error.message
        : t
      : "No error message";
}
function _u(e, t, n, r) {
  const o = n?.syntheticException || void 0,
    s = kr(e, t, o, r);
  return (
    en(s),
    (s.level = "error"),
    n?.event_id && (s.event_id = n.event_id),
    Oe(s)
  );
}
function yu(e, t, n = "info", r, o) {
  const s = r?.syntheticException || void 0,
    i = Zn(e, t, s, o);
  return ((i.level = n), r?.event_id && (i.event_id = r.event_id), Oe(i));
}
function kr(e, t, n, r, o) {
  let s;
  if (ws(t) && t.error) return Dn(e, t.error);
  if (Jr(t) || va(t)) {
    const i = t;
    if ("stack" in t) s = Dn(e, t);
    else {
      const a = i.name || (Jr(i) ? "DOMError" : "DOMException"),
        c = i.message ? `${a}: ${i.message}` : a;
      ((s = Zn(e, c, n, r)), Zr(s, c));
    }
    return (
      "code" in i && (s.tags = { ...s.tags, "DOMException.code": `${i.code}` }),
      s
    );
  }
  return ba(t)
    ? Dn(e, t)
    : $n(t) || hr(t)
      ? ((s = du(e, t, n, o)), en(s, { synthetic: !0 }), s)
      : ((s = Zn(e, t, n, r)), Zr(s, `${t}`), en(s, { synthetic: !0 }), s);
}
function Zn(e, t, n, r) {
  const o = {};
  if (r && n) {
    const s = wr(e, n);
    (s.length &&
      (o.exception = { values: [{ value: t, stacktrace: { frames: s } }] }),
      en(o, { synthetic: !0 }));
  }
  if (ys(t)) {
    const { __sentry_template_string__: s, __sentry_template_values__: i } = t;
    return ((o.logentry = { message: s, params: i }), o);
  }
  return ((o.message = t), o);
}
function vu(e, { isUnhandledRejection: t }) {
  const n = Ea(e),
    r = t ? "promise rejection" : "exception";
  return ws(e)
    ? `Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\``
    : hr(e)
      ? `Event \`${bu(e)}\` (type=${e.type}) captured as ${r}`
      : `Object captured as ${r} with keys: ${n}`;
}
function bu(e) {
  try {
    const t = Object.getPrototypeOf(e);
    return t ? t.constructor.name : void 0;
  } catch {}
}
function Su(e) {
  for (const t in e)
    if (Object.prototype.hasOwnProperty.call(e, t)) {
      const n = e[t];
      if (n instanceof Error) return n;
    }
}
const Eu = 5e3;
class wu extends rc {
  constructor(t) {
    const n = ku(t),
      r = ne.SENTRY_SDK_SOURCE || Kc();
    (Fs(n, "browser", ["browser"], r), super(n));
    const {
        sendDefaultPii: o,
        sendClientReports: s,
        enableLogs: i,
        _experiments: a,
      } = this._options,
      c = i ?? a?.enableLogs;
    (ne.document &&
      (s || c) &&
      ne.document.addEventListener("visibilitychange", () => {
        ne.document.visibilityState === "hidden" &&
          (s && this._flushOutcomes(), c && xn(this));
      }),
      c &&
        (this.on("flush", () => {
          xn(this);
        }),
        this.on("afterCaptureLog", () => {
          (this._logFlushIdleTimeout && clearTimeout(this._logFlushIdleTimeout),
            (this._logFlushIdleTimeout = setTimeout(() => {
              xn(this);
            }, Eu)));
        })),
      o && (this.on("postprocessEvent", bc), this.on("beforeSendSession", Sc)));
  }
  eventFromException(t, n) {
    return _u(this._options.stackParser, t, n, this._options.attachStacktrace);
  }
  eventFromMessage(t, n = "info", r) {
    return yu(
      this._options.stackParser,
      t,
      n,
      r,
      this._options.attachStacktrace,
    );
  }
  _prepareEvent(t, n, r, o) {
    return (
      (t.platform = t.platform || "javascript"),
      super._prepareEvent(t, n, r, o)
    );
  }
}
function ku(e) {
  return {
    release:
      typeof __SENTRY_RELEASE__ == "string"
        ? __SENTRY_RELEASE__
        : ne.SENTRY_RELEASE?.id,
    sendClientReports: !0,
    parentSpanIsAlwaysRootSpan: !0,
    ...e,
  };
}
const Iu = 1e3;
let Ao, Qn, er;
function ti(e) {
  (bs("dom", e), Ss("dom", Cu));
}
function Cu() {
  if (!Me.document) return;
  const e = Es.bind(null, "dom"),
    t = Oo(e, !0);
  (Me.document.addEventListener("click", t, !1),
    Me.document.addEventListener("keypress", t, !1),
    ["EventTarget", "Node"].forEach((n) => {
      const o = Me[n]?.prototype;
      o?.hasOwnProperty?.("addEventListener") &&
        (Ee(o, "addEventListener", function (s) {
          return function (i, a, c) {
            if (i === "click" || i == "keypress")
              try {
                const u = (this.__sentry_instrumentation_handlers__ =
                    this.__sentry_instrumentation_handlers__ || {}),
                  d = (u[i] = u[i] || { refCount: 0 });
                if (!d.handler) {
                  const l = Oo(e);
                  ((d.handler = l), s.call(this, i, l, c));
                }
                d.refCount++;
              } catch {}
            return s.call(this, i, a, c);
          };
        }),
        Ee(o, "removeEventListener", function (s) {
          return function (i, a, c) {
            if (i === "click" || i == "keypress")
              try {
                const u = this.__sentry_instrumentation_handlers__ || {},
                  d = u[i];
                d &&
                  (d.refCount--,
                  d.refCount <= 0 &&
                    (s.call(this, i, d.handler, c),
                    (d.handler = void 0),
                    delete u[i]),
                  Object.keys(u).length === 0 &&
                    delete this.__sentry_instrumentation_handlers__);
              } catch {}
            return s.call(this, i, a, c);
          };
        }));
    }));
}
function xu(e) {
  if (e.type !== Qn) return !1;
  try {
    if (!e.target || e.target._sentryId !== er) return !1;
  } catch {}
  return !0;
}
function Tu(e, t) {
  return e !== "keypress"
    ? !1
    : t?.tagName
      ? !(
          t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable
        )
      : !0;
}
function Oo(e, t = !1) {
  return (n) => {
    if (!n || n._sentryCaptured) return;
    const r = Ru(n);
    if (Tu(n.type, r)) return;
    (Qr(n, "_sentryCaptured", !0),
      r && !r._sentryId && Qr(r, "_sentryId", Ke()));
    const o = n.type === "keypress" ? "input" : n.type;
    (xu(n) ||
      (e({ event: n, name: o, global: t }),
      (Qn = n.type),
      (er = r ? r._sentryId : void 0)),
      clearTimeout(Ao),
      (Ao = Me.setTimeout(() => {
        ((er = void 0), (Qn = void 0));
      }, Iu)));
  };
}
function Ru(e) {
  try {
    return e.target;
  } catch {
    return null;
  }
}
const Xt = {};
function ni(e) {
  const t = Xt[e];
  if (t) return t;
  let n = Me[e];
  if (wa(n)) return (Xt[e] = n.bind(Me));
  const r = Me.document;
  if (r && typeof r.createElement == "function")
    try {
      const o = r.createElement("iframe");
      ((o.hidden = !0), r.head.appendChild(o));
      const s = o.contentWindow;
      (s?.[e] && (n = s[e]), r.head.removeChild(o));
    } catch (o) {
      Wn &&
        E.warn(
          `Could not create sandbox iframe for ${e} check, bailing to window.${e}: `,
          o,
        );
    }
  return n && (Xt[e] = n.bind(Me));
}
function Do(e) {
  Xt[e] = void 0;
}
function At(...e) {
  return ni("setTimeout")(...e);
}
function ri(e) {
  return new URLSearchParams(e).toString();
}
function oi(e, t = E) {
  try {
    if (typeof e == "string") return [e];
    if (e instanceof URLSearchParams) return [e.toString()];
    if (e instanceof FormData) return [ri(e)];
    if (!e) return [void 0];
  } catch (n) {
    return (
      Wn && t.error(n, "Failed to serialize body", e),
      [void 0, "BODY_PARSE_ERROR"]
    );
  }
  return (
    Wn && t.log("Skipping network body because of body type", e),
    [void 0, "UNPARSEABLE_BODY_TYPE"]
  );
}
function si(e = []) {
  if (!(e.length !== 2 || typeof e[1] != "object")) return e[1].body;
}
function Mu(e, t = ni("fetch")) {
  let n = 0,
    r = 0;
  function o(s) {
    const i = s.body.length;
    ((n += i), r++);
    const a = {
      body: s.body,
      method: "POST",
      referrerPolicy: "strict-origin",
      headers: e.headers,
      keepalive: n <= 6e4 && r < 15,
      ...e.fetchOptions,
    };
    if (!t) return (Do("fetch"), Qt("No fetch implementation available"));
    try {
      return t(e.url, a).then(
        (c) => (
          (n -= i),
          r--,
          {
            statusCode: c.status,
            headers: {
              "x-sentry-rate-limits": c.headers.get("X-Sentry-Rate-Limits"),
              "retry-after": c.headers.get("Retry-After"),
            },
          }
        ),
      );
    } catch (c) {
      return (Do("fetch"), (n -= i), r--, Qt(c));
    }
  }
  return gc(e, o);
}
const Au = 30,
  Ou = 50;
function tr(e, t, n, r) {
  const o = { filename: e, function: t === "<anonymous>" ? ct : t, in_app: !0 };
  return (n !== void 0 && (o.lineno = n), r !== void 0 && (o.colno = r), o);
}
const Du = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i,
  Lu =
    /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
  Nu = /\((\S*)(?::(\d+))(?::(\d+))\)/,
  Pu = (e) => {
    const t = Du.exec(e);
    if (t) {
      const [, r, o, s] = t;
      return tr(r, ct, +o, +s);
    }
    const n = Lu.exec(e);
    if (n) {
      if (n[2] && n[2].indexOf("eval") === 0) {
        const i = Nu.exec(n[2]);
        i && ((n[2] = i[1]), (n[3] = i[2]), (n[4] = i[3]));
      }
      const [o, s] = ii(n[1] || ct, n[2]);
      return tr(s, o, n[3] ? +n[3] : void 0, n[4] ? +n[4] : void 0);
    }
  },
  Fu = [Au, Pu],
  Bu =
    /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,
  $u = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
  Uu = (e) => {
    const t = Bu.exec(e);
    if (t) {
      if (t[3] && t[3].indexOf(" > eval") > -1) {
        const s = $u.exec(t[3]);
        s &&
          ((t[1] = t[1] || "eval"), (t[3] = s[1]), (t[4] = s[2]), (t[5] = ""));
      }
      let r = t[3],
        o = t[1] || ct;
      return (
        ([o, r] = ii(o, r)),
        tr(r, o, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0)
      );
    }
  },
  Hu = [Ou, Uu],
  Wu = [Fu, Hu],
  zu = ka(...Wu),
  ii = (e, t) => {
    const n = e.indexOf("safari-extension") !== -1,
      r = e.indexOf("safari-web-extension") !== -1;
    return n || r
      ? [
          e.indexOf("@") !== -1 ? e.split("@")[0] : ct,
          n ? `safari-extension:${t}` : `safari-web-extension:${t}`,
        ]
      : [e, t];
  },
  Ft = 1024,
  ju = "Breadcrumbs",
  qu = (e = {}) => {
    const t = {
      console: !0,
      dom: !0,
      fetch: !0,
      history: !0,
      sentry: !0,
      xhr: !0,
      ...e,
    };
    return {
      name: ju,
      setup(n) {
        (t.console && $c(Ku(n)),
          t.dom && ti(Yu(n, t.dom)),
          t.xhr && Ia(Xu(n)),
          t.fetch && Ca(Ju(n)),
          t.history && pr(Zu(n)),
          t.sentry && n.on("beforeSendEvent", Gu(n)));
      },
    };
  },
  Vu = we(qu);
function Gu(e) {
  return function (n) {
    re() === e &&
      He(
        {
          category: `sentry.${n.type === "transaction" ? "transaction" : "event"}`,
          event_id: n.event_id,
          level: n.level,
          message: ze(n),
        },
        { event: n },
      );
  };
}
function Yu(e, t) {
  return function (r) {
    if (re() !== e) return;
    let o,
      s,
      i = typeof t == "object" ? t.serializeAttribute : void 0,
      a =
        typeof t == "object" && typeof t.maxStringLength == "number"
          ? t.maxStringLength
          : void 0;
    (a &&
      a > Ft &&
      (Z &&
        E.warn(
          `\`dom.maxStringLength\` cannot exceed ${Ft}, but a value of ${a} was configured. Sentry will use ${Ft} instead.`,
        ),
      (a = Ft)),
      typeof i == "string" && (i = [i]));
    try {
      const u = r.event,
        d = Qu(u) ? u.target : u;
      ((o = mr(d, { keyAttrs: i, maxStringLength: a })), (s = xa(d)));
    } catch {
      o = "<unknown>";
    }
    if (o.length === 0) return;
    const c = { category: `ui.${r.name}`, message: o };
    (s && (c.data = { "ui.component_name": s }),
      He(c, { event: r.event, name: r.name, global: r.global }));
  };
}
function Ku(e) {
  return function (n) {
    if (re() !== e) return;
    const r = {
      category: "console",
      data: { arguments: n.args, logger: "console" },
      level: Bs(n.level),
      message: eo(n.args, " "),
    };
    if (n.level === "assert")
      if (n.args[0] === !1)
        ((r.message = `Assertion failed: ${eo(n.args.slice(1), " ") || "console.assert"}`),
          (r.data.arguments = n.args.slice(1)));
      else return;
    He(r, { input: n.args, level: n.level });
  };
}
function Xu(e) {
  return function (n) {
    if (re() !== e) return;
    const { startTimestamp: r, endTimestamp: o } = n,
      s = n.xhr[ks];
    if (!r || !o || !s) return;
    const { method: i, url: a, status_code: c, body: u } = s,
      d = { method: i, url: a, status_code: c },
      l = { xhr: n.xhr, input: u, startTimestamp: r, endTimestamp: o },
      f = { category: "xhr", data: d, type: "http", level: Hs(c) };
    (e.emit("beforeOutgoingRequestBreadcrumb", f, l), He(f, l));
  };
}
function Ju(e) {
  return function (n) {
    if (re() !== e) return;
    const { startTimestamp: r, endTimestamp: o } = n;
    if (
      o &&
      !(n.fetchData.url.match(/sentry_key/) && n.fetchData.method === "POST")
    )
      if ((n.fetchData.method, n.fetchData.url, n.error)) {
        const s = n.fetchData,
          i = {
            data: n.error,
            input: n.args,
            startTimestamp: r,
            endTimestamp: o,
          },
          a = { category: "fetch", data: s, level: "error", type: "http" };
        (e.emit("beforeOutgoingRequestBreadcrumb", a, i), He(a, i));
      } else {
        const s = n.response,
          i = { ...n.fetchData, status_code: s?.status };
        (n.fetchData.request_body_size,
          n.fetchData.response_body_size,
          s?.status);
        const a = {
            input: n.args,
            response: s,
            startTimestamp: r,
            endTimestamp: o,
          },
          c = {
            category: "fetch",
            data: i,
            type: "http",
            level: Hs(i.status_code),
          };
        (e.emit("beforeOutgoingRequestBreadcrumb", c, a), He(c, a));
      }
  };
}
function Zu(e) {
  return function (n) {
    if (re() !== e) return;
    let r = n.from,
      o = n.to;
    const s = In(ne.location.href);
    let i = r ? In(r) : void 0;
    const a = In(o);
    (i?.path || (i = s),
      s.protocol === a.protocol && s.host === a.host && (o = a.relative),
      s.protocol === i.protocol && s.host === i.host && (r = i.relative),
      He({ category: "navigation", data: { from: r, to: o } }));
  };
}
function Qu(e) {
  return !!e && !!e.target;
}
const ed = [
    "EventTarget",
    "Window",
    "Node",
    "ApplicationCache",
    "AudioTrackList",
    "BroadcastChannel",
    "ChannelMergerNode",
    "CryptoOperation",
    "EventSource",
    "FileReader",
    "HTMLUnknownElement",
    "IDBDatabase",
    "IDBRequest",
    "IDBTransaction",
    "KeyOperation",
    "MediaController",
    "MessagePort",
    "ModalWindow",
    "Notification",
    "SVGElementInstance",
    "Screen",
    "SharedWorker",
    "TextTrack",
    "TextTrackCue",
    "TextTrackList",
    "WebSocket",
    "WebSocketWorker",
    "Worker",
    "XMLHttpRequest",
    "XMLHttpRequestEventTarget",
    "XMLHttpRequestUpload",
  ],
  td = "BrowserApiErrors",
  nd = (e = {}) => {
    const t = {
      XMLHttpRequest: !0,
      eventTarget: !0,
      requestAnimationFrame: !0,
      setInterval: !0,
      setTimeout: !0,
      unregisterOriginalCallbacks: !1,
      ...e,
    };
    return {
      name: td,
      setupOnce() {
        (t.setTimeout && Ee(ne, "setTimeout", Lo),
          t.setInterval && Ee(ne, "setInterval", Lo),
          t.requestAnimationFrame && Ee(ne, "requestAnimationFrame", od),
          t.XMLHttpRequest &&
            "XMLHttpRequest" in ne &&
            Ee(XMLHttpRequest.prototype, "send", sd));
        const n = t.eventTarget;
        n && (Array.isArray(n) ? n : ed).forEach((o) => id(o, t));
      },
    };
  },
  rd = we(nd);
function Lo(e) {
  return function (...t) {
    const n = t[0];
    return (
      (t[0] = Et(n, {
        mechanism: {
          data: { function: lt(e) },
          handled: !1,
          type: "instrument",
        },
      })),
      e.apply(this, t)
    );
  };
}
function od(e) {
  return function (t) {
    return e.apply(this, [
      Et(t, {
        mechanism: {
          data: { function: "requestAnimationFrame", handler: lt(e) },
          handled: !1,
          type: "instrument",
        },
      }),
    ]);
  };
}
function sd(e) {
  return function (...t) {
    const n = this;
    return (
      ["onload", "onerror", "onprogress", "onreadystatechange"].forEach((o) => {
        o in n &&
          typeof n[o] == "function" &&
          Ee(n, o, function (s) {
            const i = {
                mechanism: {
                  data: { function: o, handler: lt(s) },
                  handled: !1,
                  type: "instrument",
                },
              },
              a = vs(s);
            return (a && (i.mechanism.data.handler = lt(a)), Et(s, i));
          });
      }),
      e.apply(this, t)
    );
  };
}
function id(e, t) {
  const r = ne[e]?.prototype;
  r?.hasOwnProperty?.("addEventListener") &&
    (Ee(r, "addEventListener", function (o) {
      return function (s, i, a) {
        try {
          ad(i) &&
            (i.handleEvent = Et(i.handleEvent, {
              mechanism: {
                data: { function: "handleEvent", handler: lt(i), target: e },
                handled: !1,
                type: "instrument",
              },
            }));
        } catch {}
        return (
          t.unregisterOriginalCallbacks && cd(this, s, i),
          o.apply(this, [
            s,
            Et(i, {
              mechanism: {
                data: {
                  function: "addEventListener",
                  handler: lt(i),
                  target: e,
                },
                handled: !1,
                type: "instrument",
              },
            }),
            a,
          ])
        );
      };
    }),
    Ee(r, "removeEventListener", function (o) {
      return function (s, i, a) {
        try {
          const c = i.__sentry_wrapped__;
          c && o.call(this, s, c, a);
        } catch {}
        return o.call(this, s, i, a);
      };
    }));
}
function ad(e) {
  return typeof e.handleEvent == "function";
}
function cd(e, t, n) {
  e &&
    typeof e == "object" &&
    "removeEventListener" in e &&
    typeof e.removeEventListener == "function" &&
    e.removeEventListener(t, n);
}
const ld = we(() => ({
    name: "BrowserSession",
    setupOnce() {
      if (typeof ne.document > "u") {
        Z &&
          E.warn(
            "Using the `browserSessionIntegration` in non-browser environments is not supported.",
          );
        return;
      }
      (to({ ignoreDuration: !0 }),
        no(),
        pr(({ from: e, to: t }) => {
          e !== void 0 && e !== t && (to({ ignoreDuration: !0 }), no());
        }));
    },
  })),
  ud = "GlobalHandlers",
  dd = (e = {}) => {
    const t = { onerror: !0, onunhandledrejection: !0, ...e };
    return {
      name: ud,
      setupOnce() {
        Error.stackTraceLimit = 50;
      },
      setup(n) {
        (t.onerror && (hd(n), No("onerror")),
          t.onunhandledrejection && (pd(n), No("onunhandledrejection")));
      },
    };
  },
  fd = we(dd);
function hd(e) {
  Ta((t) => {
    const { stackParser: n, attachStacktrace: r } = ai();
    if (re() !== e || Is()) return;
    const { msg: o, url: s, line: i, column: a, error: c } = t,
      u = _d(kr(n, c || o, void 0, r, !1), s, i, a);
    ((u.level = "error"),
      Cs(u, {
        originalException: c,
        mechanism: { handled: !1, type: "onerror" },
      }));
  });
}
function pd(e) {
  Ra((t) => {
    const { stackParser: n, attachStacktrace: r } = ai();
    if (re() !== e || Is()) return;
    const o = md(t),
      s = fr(o) ? gd(o) : kr(n, o, void 0, r, !0);
    ((s.level = "error"),
      Cs(s, {
        originalException: o,
        mechanism: { handled: !1, type: "onunhandledrejection" },
      }));
  });
}
function md(e) {
  if (fr(e)) return e;
  try {
    if ("reason" in e) return e.reason;
    if ("detail" in e && "reason" in e.detail) return e.detail.reason;
  } catch {}
  return e;
}
function gd(e) {
  return {
    exception: {
      values: [
        {
          type: "UnhandledRejection",
          value: `Non-Error promise rejection captured with value: ${String(e)}`,
        },
      ],
    },
  };
}
function _d(e, t, n, r) {
  const o = (e.exception = e.exception || {}),
    s = (o.values = o.values || []),
    i = (s[0] = s[0] || {}),
    a = (i.stacktrace = i.stacktrace || {}),
    c = (a.frames = a.frames || []),
    u = r,
    d = n,
    l = Ma(t) && t.length > 0 ? t : gn();
  return (
    c.length === 0 &&
      c.push({ colno: u, filename: l, function: ct, in_app: !0, lineno: d }),
    e
  );
}
function No(e) {
  Z && E.log(`Global Handler attached: ${e}`);
}
function ai() {
  return re()?.getOptions() || { stackParser: () => [], attachStacktrace: !1 };
}
const yd = we(() => ({
    name: "HttpContext",
    preprocessEvent(e) {
      if (!ne.navigator && !ne.location && !ne.document) return;
      const t = Aa(),
        n = { ...t.headers, ...e.request?.headers };
      e.request = { ...t, ...e.request, headers: n };
    },
  })),
  vd = "cause",
  bd = 5,
  Sd = "LinkedErrors",
  Ed = (e = {}) => {
    const t = e.limit || bd,
      n = e.key || vd;
    return {
      name: Sd,
      preprocessEvent(r, o, s) {
        const i = s.getOptions();
        Bc(Er, i.stackParser, n, t, r, o);
      },
    };
  },
  wd = we(Ed);
function kd() {
  return Id() ? (Z && mn(() => {}), !0) : !1;
}
function Id() {
  if (typeof ne.window > "u") return !1;
  const e = ne;
  if (e.nw || !(e.chrome || e.browser)?.runtime?.id) return !1;
  const n = gn(),
    r = [
      "chrome-extension",
      "moz-extension",
      "ms-browser-extension",
      "safari-web-extension",
    ];
  return !(ne === ne.top && r.some((s) => n.startsWith(`${s}://`)));
}
function ci(e) {
  return [Mc(), Cc(), rd(), Vu(), fd(), wd(), zc(), yd(), ld()];
}
function Cd(e = {}) {
  const t = !e.skipBrowserExtensionCheck && kd(),
    n = {
      ...e,
      enabled: t ? !1 : e.enabled,
      stackParser: Da(e.stackParser || zu),
      integrations: Oa({
        integrations: e.integrations,
        defaultIntegrations:
          e.defaultIntegrations == null ? ci() : e.defaultIntegrations,
      }),
      transport: e.transport || Mu,
    };
  return lc(wu, n);
}
const X = Be,
  Ir = "sentryReplaySession",
  xd = "replay_event",
  Cr = "Unable to send Replay",
  Td = 3e5,
  Rd = 9e5,
  Md = 5e3,
  Ad = 5500,
  Od = 6e4,
  Dd = 5e3,
  Ld = 3,
  Po = 15e4,
  Bt = 5e3,
  Nd = 3e3,
  Pd = 300,
  xr = 2e7,
  Fd = 4999,
  Bd = 15e3,
  Fo = 36e5;
var $d = Object.defineProperty,
  Ud = (e, t, n) =>
    t in e
      ? $d(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  Bo = (e, t, n) => Ud(e, typeof t != "symbol" ? t + "" : t, n),
  ae = ((e) => (
    (e[(e.Document = 0)] = "Document"),
    (e[(e.DocumentType = 1)] = "DocumentType"),
    (e[(e.Element = 2)] = "Element"),
    (e[(e.Text = 3)] = "Text"),
    (e[(e.CDATA = 4)] = "CDATA"),
    (e[(e.Comment = 5)] = "Comment"),
    e
  ))(ae || {});
function Hd(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function vt(e) {
  return e?.host?.shadowRoot === e;
}
function bt(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function Wd(e) {
  return (
    e.includes(" background-clip: text;") &&
      !e.includes(" -webkit-background-clip: text;") &&
      (e = e.replace(
        /\sbackground-clip:\s*text;/g,
        " -webkit-background-clip: text; background-clip: text;",
      )),
    e
  );
}
function zd(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const n = ["@import", `url(${JSON.stringify(e.href)})`];
  return (
    e.layerName === ""
      ? n.push("layer")
      : e.layerName && n.push(`layer(${e.layerName})`),
    e.supportsText && n.push(`supports(${e.supportsText})`),
    e.media.length && n.push(e.media.mediaText),
    n.join(" ") + ";"
  );
}
function rn(e) {
  try {
    const t = e.rules || e.cssRules;
    return t ? Wd(Array.from(t, li).join("")) : null;
  } catch {
    return null;
  }
}
function jd(e) {
  let t = "";
  for (let n = 0; n < e.style.length; n++) {
    const r = e.style,
      o = r[n],
      s = r.getPropertyPriority(o);
    t += `${o}:${r.getPropertyValue(o)}${s ? " !important" : ""};`;
  }
  return `${e.selectorText} { ${t} }`;
}
function li(e) {
  let t;
  if (Vd(e))
    try {
      t = rn(e.styleSheet) || zd(e);
    } catch {}
  else if (Gd(e)) {
    let n = e.cssText;
    const r = e.selectorText.includes(":"),
      o = typeof e.style.all == "string" && e.style.all;
    if ((o && (n = jd(e)), r && (n = qd(n)), r || o)) return n;
  }
  return t || e.cssText;
}
function qd(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function Vd(e) {
  return "styleSheet" in e;
}
function Gd(e) {
  return "selectorText" in e;
}
class ui {
  constructor() {
    (Bo(this, "idNodeMap", new Map()), Bo(this, "nodeMetaMap", new WeakMap()));
  }
  getId(t) {
    return t ? (this.getMeta(t)?.id ?? -1) : -1;
  }
  getNode(t) {
    return this.idNodeMap.get(t) || null;
  }
  getIds() {
    return Array.from(this.idNodeMap.keys());
  }
  getMeta(t) {
    return this.nodeMetaMap.get(t) || null;
  }
  removeNodeFromMap(t) {
    const n = this.getId(t);
    (this.idNodeMap.delete(n),
      t.childNodes && t.childNodes.forEach((r) => this.removeNodeFromMap(r)));
  }
  has(t) {
    return this.idNodeMap.has(t);
  }
  hasNode(t) {
    return this.nodeMetaMap.has(t);
  }
  add(t, n) {
    const r = n.id;
    (this.idNodeMap.set(r, t), this.nodeMetaMap.set(t, n));
  }
  replace(t, n) {
    const r = this.getNode(t);
    if (r) {
      const o = this.nodeMetaMap.get(r);
      o && this.nodeMetaMap.set(n, o);
    }
    this.idNodeMap.set(t, n);
  }
  reset() {
    ((this.idNodeMap = new Map()), (this.nodeMetaMap = new WeakMap()));
  }
}
function Yd() {
  return new ui();
}
function yn({ maskInputOptions: e, tagName: t, type: n }) {
  return (
    t === "OPTION" && (t = "SELECT"),
    !!(
      e[t.toLowerCase()] ||
      (n && e[n]) ||
      n === "password" ||
      (t === "INPUT" && !n && e.text)
    )
  );
}
function kt({ isMasked: e, element: t, value: n, maskInputFn: r }) {
  let o = n || "";
  return e ? (r && (o = r(o, t)), "*".repeat(o.length)) : o;
}
function ft(e) {
  return e.toLowerCase();
}
function nr(e) {
  return e.toUpperCase();
}
const $o = "__rrweb_original__";
function Kd(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const n = 50;
  for (let r = 0; r < e.width; r += n)
    for (let o = 0; o < e.height; o += n) {
      const s = t.getImageData,
        i = $o in s ? s[$o] : s;
      if (
        new Uint32Array(
          i.call(t, r, o, Math.min(n, e.width - r), Math.min(n, e.height - o))
            .data.buffer,
        ).some((c) => c !== 0)
      )
        return !1;
    }
  return !0;
}
function Tr(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? ft(t) : null;
}
function on(e, t, n) {
  return t === "INPUT" && (n === "radio" || n === "checkbox")
    ? e.getAttribute("value") || ""
    : e.value;
}
function di(e, t) {
  let n;
  try {
    n = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const r = /\.([0-9a-z]+)(?:$)/i;
  return n.pathname.match(r)?.[1] ?? null;
}
const Uo = {};
function fi(e) {
  const t = Uo[e];
  if (t) return t;
  const n = window.document;
  let r = window[e];
  if (n && typeof n.createElement == "function")
    try {
      const o = n.createElement("iframe");
      ((o.hidden = !0), n.head.appendChild(o));
      const s = o.contentWindow;
      (s && s[e] && (r = s[e]), n.head.removeChild(o));
    } catch {}
  return (Uo[e] = r.bind(window));
}
function rr(...e) {
  return fi("setTimeout")(...e);
}
function hi(...e) {
  return fi("clearTimeout")(...e);
}
function pi(e) {
  try {
    return e.contentDocument;
  } catch {}
}
let Xd = 1;
const Jd = new RegExp("[^a-z0-9-_:]"),
  It = -2;
function Rr() {
  return Xd++;
}
function Zd(e) {
  if (e instanceof HTMLFormElement) return "form";
  const t = ft(e.tagName);
  return Jd.test(t) ? "div" : t;
}
function Qd(e) {
  let t = "";
  return (
    e.indexOf("//") > -1
      ? (t = e.split("/").slice(0, 3).join("/"))
      : (t = e.split("/")[0]),
    (t = t.split("?")[0]),
    t
  );
}
let tt, Ho;
const ef = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm,
  tf = /^(?:[a-z+]+:)?\/\//i,
  nf = /^www\..*/i,
  rf = /^(data:)([^,]*),(.*)/i;
function sn(e, t) {
  return (e || "").replace(ef, (n, r, o, s, i, a) => {
    const c = o || i || a,
      u = r || s || "";
    if (!c) return n;
    if (tf.test(c) || nf.test(c)) return `url(${u}${c}${u})`;
    if (rf.test(c)) return `url(${u}${c}${u})`;
    if (c[0] === "/") return `url(${u}${Qd(t) + c}${u})`;
    const d = t.split("/"),
      l = c.split("/");
    d.pop();
    for (const f of l) f !== "." && (f === ".." ? d.pop() : d.push(f));
    return `url(${u}${d.join("/")}${u})`;
  });
}
const of = /^[^ \t\n\r\u000c]+/,
  sf = /^[, \t\n\r\u000c]+/;
function af(e, t) {
  if (t.trim() === "") return t;
  let n = 0;
  function r(s) {
    let i;
    const a = s.exec(t.substring(n));
    return a ? ((i = a[0]), (n += i.length), i) : "";
  }
  const o = [];
  for (; r(sf), !(n >= t.length); ) {
    let s = r(of);
    if (s.slice(-1) === ",")
      ((s = rt(e, s.substring(0, s.length - 1))), o.push(s));
    else {
      let i = "";
      s = rt(e, s);
      let a = !1;
      for (;;) {
        const c = t.charAt(n);
        if (c === "") {
          o.push((s + i).trim());
          break;
        } else if (a) c === ")" && (a = !1);
        else if (c === ",") {
          ((n += 1), o.push((s + i).trim()));
          break;
        } else c === "(" && (a = !0);
        ((i += c), (n += 1));
      }
    }
  }
  return o.join(", ");
}
const Wo = new WeakMap();
function rt(e, t) {
  return !t || t.trim() === "" ? t : vn(e, t);
}
function cf(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function vn(e, t) {
  let n = Wo.get(e);
  if ((n || ((n = e.createElement("a")), Wo.set(e, n)), !t)) t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:")) return t;
  return (n.setAttribute("href", t), n.href);
}
function mi(e, t, n, r, o, s) {
  return (
    r &&
    (n === "src" ||
    (n === "href" && !(t === "use" && r[0] === "#")) ||
    (n === "xlink:href" && r[0] !== "#") ||
    (n === "background" && (t === "table" || t === "td" || t === "th"))
      ? rt(e, r)
      : n === "srcset"
        ? af(e, r)
        : n === "style"
          ? sn(r, vn(e))
          : t === "object" && n === "data"
            ? rt(e, r)
            : typeof s == "function"
              ? s(n, r, o)
              : r)
  );
}
function gi(e, t, n) {
  return (e === "video" || e === "audio") && t === "autoplay";
}
function lf(e, t, n, r) {
  try {
    if (r && e.matches(r)) return !1;
    if (typeof t == "string") {
      if (e.classList.contains(t)) return !0;
    } else
      for (let o = e.classList.length; o--; ) {
        const s = e.classList[o];
        if (t.test(s)) return !0;
      }
    if (n) return e.matches(n);
  } catch {}
  return !1;
}
function uf(e, t) {
  for (let n = e.classList.length; n--; ) {
    const r = e.classList[n];
    if (t.test(r)) return !0;
  }
  return !1;
}
function Ge(e, t, n = 1 / 0, r = 0) {
  return !e || e.nodeType !== e.ELEMENT_NODE || r > n
    ? -1
    : t(e)
      ? r
      : Ge(e.parentNode, t, n, r + 1);
}
function ot(e, t) {
  return (n) => {
    const r = n;
    if (r === null) return !1;
    try {
      if (e) {
        if (typeof e == "string") {
          if (r.matches(`.${e}`)) return !0;
        } else if (uf(r, e)) return !0;
      }
      return !!(t && r.matches(t));
    } catch {
      return !1;
    }
  };
}
function ht(e, t, n, r, o, s) {
  try {
    const i = e.nodeType === e.ELEMENT_NODE ? e : e.parentElement;
    if (i === null) return !1;
    if (i.tagName === "INPUT") {
      const u = i.getAttribute("autocomplete");
      if (
        [
          "current-password",
          "new-password",
          "cc-number",
          "cc-exp",
          "cc-exp-month",
          "cc-exp-year",
          "cc-csc",
        ].includes(u)
      )
        return !0;
    }
    let a = -1,
      c = -1;
    if (s) {
      if (((c = Ge(i, ot(r, o))), c < 0)) return !0;
      a = Ge(i, ot(t, n), c >= 0 ? c : 1 / 0);
    } else {
      if (((a = Ge(i, ot(t, n))), a < 0)) return !1;
      c = Ge(i, ot(r, o), a >= 0 ? a : 1 / 0);
    }
    return a >= 0 ? (c >= 0 ? a <= c : !0) : c >= 0 ? !1 : !!s;
  } catch {}
  return !!s;
}
function df(e, t, n) {
  const r = e.contentWindow;
  if (!r) return;
  let o = !1,
    s;
  try {
    s = r.document.readyState;
  } catch {
    return;
  }
  if (s !== "complete") {
    const a = rr(() => {
      o || (t(), (o = !0));
    }, n);
    e.addEventListener("load", () => {
      (hi(a), (o = !0), t());
    });
    return;
  }
  const i = "about:blank";
  if (r.location.href !== i || e.src === i || e.src === "")
    return (rr(t, 0), e.addEventListener("load", t));
  e.addEventListener("load", t);
}
function ff(e, t, n) {
  let r = !1,
    o;
  try {
    o = e.sheet;
  } catch {
    return;
  }
  if (o) return;
  const s = rr(() => {
    r || (t(), (r = !0));
  }, n);
  e.addEventListener("load", () => {
    (hi(s), (r = !0), t());
  });
}
function hf(e, t) {
  const {
      doc: n,
      mirror: r,
      blockClass: o,
      blockSelector: s,
      unblockSelector: i,
      maskAllText: a,
      maskAttributeFn: c,
      maskTextClass: u,
      unmaskTextClass: d,
      maskTextSelector: l,
      unmaskTextSelector: f,
      inlineStylesheet: h,
      maskInputOptions: p = {},
      maskTextFn: m,
      maskInputFn: _,
      dataURLOptions: g = {},
      inlineImages: v,
      recordCanvas: M,
      keepIframeSrcFn: w,
      newlyAddedElement: I = !1,
    } = t,
    S = pf(n, r);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat"
        ? { type: ae.Document, childNodes: [], compatMode: e.compatMode }
        : { type: ae.Document, childNodes: [] };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: ae.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: S,
      };
    case e.ELEMENT_NODE:
      return gf(e, {
        doc: n,
        blockClass: o,
        blockSelector: s,
        unblockSelector: i,
        inlineStylesheet: h,
        maskAttributeFn: c,
        maskInputOptions: p,
        maskInputFn: _,
        dataURLOptions: g,
        inlineImages: v,
        recordCanvas: M,
        keepIframeSrcFn: w,
        newlyAddedElement: I,
        rootId: S,
        maskTextClass: u,
        unmaskTextClass: d,
        maskTextSelector: l,
        unmaskTextSelector: f,
      });
    case e.TEXT_NODE:
      return mf(e, {
        doc: n,
        maskAllText: a,
        maskTextClass: u,
        unmaskTextClass: d,
        maskTextSelector: l,
        unmaskTextSelector: f,
        maskTextFn: m,
        maskInputOptions: p,
        maskInputFn: _,
        rootId: S,
      });
    case e.CDATA_SECTION_NODE:
      return { type: ae.CDATA, textContent: "", rootId: S };
    case e.COMMENT_NODE:
      return { type: ae.Comment, textContent: e.textContent || "", rootId: S };
    default:
      return !1;
  }
}
function pf(e, t) {
  if (!t.hasNode(e)) return;
  const n = t.getId(e);
  return n === 1 ? void 0 : n;
}
function mf(e, t) {
  const {
      maskAllText: n,
      maskTextClass: r,
      unmaskTextClass: o,
      maskTextSelector: s,
      unmaskTextSelector: i,
      maskTextFn: a,
      maskInputOptions: c,
      maskInputFn: u,
      rootId: d,
    } = t,
    l = e.parentNode && e.parentNode.tagName;
  let f = e.textContent;
  const h = l === "STYLE" ? !0 : void 0,
    p = l === "SCRIPT" ? !0 : void 0,
    m = l === "TEXTAREA" ? !0 : void 0;
  if (h && f) {
    try {
      e.nextSibling ||
        e.previousSibling ||
        (e.parentNode.sheet?.cssRules && (f = rn(e.parentNode.sheet)));
    } catch {}
    f = sn(f, vn(t.doc));
  }
  p && (f = "SCRIPT_PLACEHOLDER");
  const _ = ht(e, r, s, o, i, n);
  if (
    (!h &&
      !p &&
      !m &&
      f &&
      _ &&
      (f = a ? a(f, e.parentElement) : f.replace(/[\S]/g, "*")),
    m &&
      f &&
      (c.textarea || _) &&
      (f = u ? u(f, e.parentNode) : f.replace(/[\S]/g, "*")),
    l === "OPTION" && f)
  ) {
    const g = yn({ type: null, tagName: l, maskInputOptions: c });
    f = kt({
      isMasked: ht(e, r, s, o, i, g),
      element: e,
      value: f,
      maskInputFn: u,
    });
  }
  return { type: ae.Text, textContent: f || "", isStyle: h, rootId: d };
}
function gf(e, t) {
  const {
      doc: n,
      blockClass: r,
      blockSelector: o,
      unblockSelector: s,
      inlineStylesheet: i,
      maskInputOptions: a = {},
      maskAttributeFn: c,
      maskInputFn: u,
      dataURLOptions: d = {},
      inlineImages: l,
      recordCanvas: f,
      keepIframeSrcFn: h,
      newlyAddedElement: p = !1,
      rootId: m,
      maskTextClass: _,
      unmaskTextClass: g,
      maskTextSelector: v,
      unmaskTextSelector: M,
    } = t,
    w = lf(e, r, o, s),
    I = Zd(e);
  let S = {};
  const C = e.attributes.length;
  for (let y = 0; y < C; y++) {
    const k = e.attributes[y];
    k.name &&
      !gi(I, k.name, k.value) &&
      (S[k.name] = mi(n, I, ft(k.name), k.value, e, c));
  }
  if (I === "link" && i) {
    const y = Array.from(n.styleSheets).find((F) => F.href === e.href);
    let k = null;
    (y && (k = rn(y)),
      k &&
        ((S.rel = null),
        (S.href = null),
        (S.crossorigin = null),
        (S._cssText = sn(k, y.href))));
  }
  if (
    I === "style" &&
    e.sheet &&
    !(e.innerText || e.textContent || "").trim().length
  ) {
    const y = rn(e.sheet);
    y && (S._cssText = sn(y, vn(n)));
  }
  if (I === "input" || I === "textarea" || I === "select" || I === "option") {
    const y = e,
      k = Tr(y),
      F = on(y, nr(I), k),
      b = y.checked;
    if (k !== "submit" && k !== "button" && F) {
      const A = ht(
        y,
        _,
        v,
        g,
        M,
        yn({ type: k, tagName: nr(I), maskInputOptions: a }),
      );
      S.value = kt({ isMasked: A, element: y, value: F, maskInputFn: u });
    }
    b && (S.checked = b);
  }
  if (
    (I === "option" &&
      (e.selected && !a.select ? (S.selected = !0) : delete S.selected),
    I === "canvas" && f)
  ) {
    if (e.__context === "2d")
      Kd(e) || (S.rr_dataURL = e.toDataURL(d.type, d.quality));
    else if (!("__context" in e)) {
      const y = e.toDataURL(d.type, d.quality),
        k = n.createElement("canvas");
      ((k.width = e.width), (k.height = e.height));
      const F = k.toDataURL(d.type, d.quality);
      y !== F && (S.rr_dataURL = y);
    }
  }
  if (I === "img" && l) {
    tt || ((tt = n.createElement("canvas")), (Ho = tt.getContext("2d")));
    const y = e,
      k = y.currentSrc || y.getAttribute("src") || "<unknown-src>",
      F = y.crossOrigin,
      b = () => {
        y.removeEventListener("load", b);
        try {
          ((tt.width = y.naturalWidth),
            (tt.height = y.naturalHeight),
            Ho.drawImage(y, 0, 0),
            (S.rr_dataURL = tt.toDataURL(d.type, d.quality)));
        } catch {
          if (y.crossOrigin !== "anonymous") {
            ((y.crossOrigin = "anonymous"),
              y.complete && y.naturalWidth !== 0
                ? b()
                : y.addEventListener("load", b));
            return;
          }
        }
        y.crossOrigin === "anonymous" &&
          (F ? (S.crossOrigin = F) : y.removeAttribute("crossorigin"));
      };
    y.complete && y.naturalWidth !== 0 ? b() : y.addEventListener("load", b);
  }
  if (
    ((I === "audio" || I === "video") &&
      ((S.rr_mediaState = e.paused ? "paused" : "played"),
      (S.rr_mediaCurrentTime = e.currentTime)),
    p ||
      (e.scrollLeft && (S.rr_scrollLeft = e.scrollLeft),
      e.scrollTop && (S.rr_scrollTop = e.scrollTop)),
    w)
  ) {
    const { width: y, height: k } = e.getBoundingClientRect();
    S = { class: S.class, rr_width: `${y}px`, rr_height: `${k}px` };
  }
  I === "iframe" &&
    !h(S.src) &&
    (!w && !pi(e) && (S.rr_src = S.src), delete S.src);
  let x;
  try {
    customElements.get(I) && (x = !0);
  } catch {}
  return {
    type: ae.Element,
    tagName: I,
    attributes: S,
    childNodes: [],
    isSVG: cf(e) || void 0,
    needBlock: w,
    rootId: m,
    isCustom: x,
  };
}
function K(e) {
  return e == null ? "" : e.toLowerCase();
}
function _f(e, t) {
  if (t.comment && e.type === ae.Comment) return !0;
  if (e.type === ae.Element) {
    if (
      t.script &&
      (e.tagName === "script" ||
        (e.tagName === "link" &&
          (e.attributes.rel === "preload" ||
            e.attributes.rel === "modulepreload")) ||
        (e.tagName === "link" &&
          e.attributes.rel === "prefetch" &&
          typeof e.attributes.href == "string" &&
          di(e.attributes.href) === "js"))
    )
      return !0;
    if (
      t.headFavicon &&
      ((e.tagName === "link" && e.attributes.rel === "shortcut icon") ||
        (e.tagName === "meta" &&
          (K(e.attributes.name).match(/^msapplication-tile(image|color)$/) ||
            K(e.attributes.name) === "application-name" ||
            K(e.attributes.rel) === "icon" ||
            K(e.attributes.rel) === "apple-touch-icon" ||
            K(e.attributes.rel) === "shortcut icon")))
    )
      return !0;
    if (e.tagName === "meta") {
      if (
        t.headMetaDescKeywords &&
        K(e.attributes.name).match(/^description|keywords$/)
      )
        return !0;
      if (
        t.headMetaSocial &&
        (K(e.attributes.property).match(/^(og|twitter|fb):/) ||
          K(e.attributes.name).match(/^(og|twitter):/) ||
          K(e.attributes.name) === "pinterest")
      )
        return !0;
      if (
        t.headMetaRobots &&
        (K(e.attributes.name) === "robots" ||
          K(e.attributes.name) === "googlebot" ||
          K(e.attributes.name) === "bingbot")
      )
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (
        t.headMetaAuthorship &&
        (K(e.attributes.name) === "author" ||
          K(e.attributes.name) === "generator" ||
          K(e.attributes.name) === "framework" ||
          K(e.attributes.name) === "publisher" ||
          K(e.attributes.name) === "progid" ||
          K(e.attributes.property).match(/^article:/) ||
          K(e.attributes.property).match(/^product:/))
      )
        return !0;
      if (
        t.headMetaVerification &&
        (K(e.attributes.name) === "google-site-verification" ||
          K(e.attributes.name) === "yandex-verification" ||
          K(e.attributes.name) === "csrf-token" ||
          K(e.attributes.name) === "p:domain_verify" ||
          K(e.attributes.name) === "verify-v1" ||
          K(e.attributes.name) === "verification" ||
          K(e.attributes.name) === "shopify-checkout-api-token")
      )
        return !0;
    }
  }
  return !1;
}
function st(e, t) {
  const {
    doc: n,
    mirror: r,
    blockClass: o,
    blockSelector: s,
    unblockSelector: i,
    maskAllText: a,
    maskTextClass: c,
    unmaskTextClass: u,
    maskTextSelector: d,
    unmaskTextSelector: l,
    skipChild: f = !1,
    inlineStylesheet: h = !0,
    maskInputOptions: p = {},
    maskAttributeFn: m,
    maskTextFn: _,
    maskInputFn: g,
    slimDOMOptions: v,
    dataURLOptions: M = {},
    inlineImages: w = !1,
    recordCanvas: I = !1,
    onSerialize: S,
    onIframeLoad: C,
    iframeLoadTimeout: x = 5e3,
    onBlockedImageLoad: y,
    onStylesheetLoad: k,
    stylesheetLoadTimeout: F = 5e3,
    keepIframeSrcFn: b = () => !1,
    newlyAddedElement: A = !1,
  } = t;
  let { preserveWhiteSpace: U = !0 } = t;
  const j = hf(e, {
    doc: n,
    mirror: r,
    blockClass: o,
    blockSelector: s,
    maskAllText: a,
    unblockSelector: i,
    maskTextClass: c,
    unmaskTextClass: u,
    maskTextSelector: d,
    unmaskTextSelector: l,
    inlineStylesheet: h,
    maskInputOptions: p,
    maskAttributeFn: m,
    maskTextFn: _,
    maskInputFn: g,
    dataURLOptions: M,
    inlineImages: w,
    recordCanvas: I,
    keepIframeSrcFn: b,
    newlyAddedElement: A,
  });
  if (!j) return null;
  let Q;
  r.hasNode(e)
    ? (Q = r.getId(e))
    : _f(j, v) ||
        (!U &&
          j.type === ae.Text &&
          !j.isStyle &&
          !j.textContent.replace(/^\s+|\s+$/gm, "").length)
      ? (Q = It)
      : (Q = Rr());
  const D = Object.assign(j, { id: Q });
  if ((r.add(e, D), Q === It)) return null;
  S && S(e);
  let q = !f;
  if (D.type === ae.Element) {
    q = q && !D.needBlock;
    const L = e.shadowRoot;
    L && bt(L) && (D.isShadowHost = !0);
  }
  if ((D.type === ae.Document || D.type === ae.Element) && q) {
    v.headWhitespace &&
      D.type === ae.Element &&
      D.tagName === "head" &&
      (U = !1);
    const L = {
        doc: n,
        mirror: r,
        blockClass: o,
        blockSelector: s,
        maskAllText: a,
        unblockSelector: i,
        maskTextClass: c,
        unmaskTextClass: u,
        maskTextSelector: d,
        unmaskTextSelector: l,
        skipChild: f,
        inlineStylesheet: h,
        maskInputOptions: p,
        maskAttributeFn: m,
        maskTextFn: _,
        maskInputFn: g,
        slimDOMOptions: v,
        dataURLOptions: M,
        inlineImages: w,
        recordCanvas: I,
        preserveWhiteSpace: U,
        onSerialize: S,
        onIframeLoad: C,
        iframeLoadTimeout: x,
        onBlockedImageLoad: y,
        onStylesheetLoad: k,
        stylesheetLoadTimeout: F,
        keepIframeSrcFn: b,
      },
      z = e.childNodes ? Array.from(e.childNodes) : [];
    for (const ee of z) {
      const pe = st(ee, L);
      pe && D.childNodes.push(pe);
    }
    if (Hd(e) && e.shadowRoot)
      for (const ee of Array.from(e.shadowRoot.childNodes)) {
        const pe = st(ee, L);
        pe && (bt(e.shadowRoot) && (pe.isShadow = !0), D.childNodes.push(pe));
      }
  }
  if (
    (e.parentNode && vt(e.parentNode) && bt(e.parentNode) && (D.isShadow = !0),
    D.type === ae.Element &&
      D.tagName === "iframe" &&
      !D.needBlock &&
      df(
        e,
        () => {
          const L = pi(e);
          if (L && C) {
            const z = st(L, {
              doc: L,
              mirror: r,
              blockClass: o,
              blockSelector: s,
              unblockSelector: i,
              maskAllText: a,
              maskTextClass: c,
              unmaskTextClass: u,
              maskTextSelector: d,
              unmaskTextSelector: l,
              skipChild: !1,
              inlineStylesheet: h,
              maskInputOptions: p,
              maskAttributeFn: m,
              maskTextFn: _,
              maskInputFn: g,
              slimDOMOptions: v,
              dataURLOptions: M,
              inlineImages: w,
              recordCanvas: I,
              preserveWhiteSpace: U,
              onSerialize: S,
              onIframeLoad: C,
              iframeLoadTimeout: x,
              onStylesheetLoad: k,
              stylesheetLoadTimeout: F,
              keepIframeSrcFn: b,
            });
            z && C(e, z);
          }
        },
        x,
      ),
    D.type === ae.Element && D.tagName === "img" && !e.complete && D.needBlock)
  ) {
    const L = e,
      z = () => {
        if (L.isConnected && !L.complete && y)
          try {
            const ee = L.getBoundingClientRect();
            ee.width > 0 && ee.height > 0 && y(L, D, ee);
          } catch {}
        L.removeEventListener("load", z);
      };
    L.isConnected && L.addEventListener("load", z);
  }
  return (
    D.type === ae.Element &&
      D.tagName === "link" &&
      typeof D.attributes.rel == "string" &&
      (D.attributes.rel === "stylesheet" ||
        (D.attributes.rel === "preload" &&
          typeof D.attributes.href == "string" &&
          di(D.attributes.href) === "css")) &&
      ff(
        e,
        () => {
          if (k) {
            const L = st(e, {
              doc: n,
              mirror: r,
              blockClass: o,
              blockSelector: s,
              unblockSelector: i,
              maskAllText: a,
              maskTextClass: c,
              unmaskTextClass: u,
              maskTextSelector: d,
              unmaskTextSelector: l,
              skipChild: !1,
              inlineStylesheet: h,
              maskInputOptions: p,
              maskAttributeFn: m,
              maskTextFn: _,
              maskInputFn: g,
              slimDOMOptions: v,
              dataURLOptions: M,
              inlineImages: w,
              recordCanvas: I,
              preserveWhiteSpace: U,
              onSerialize: S,
              onIframeLoad: C,
              iframeLoadTimeout: x,
              onStylesheetLoad: k,
              stylesheetLoadTimeout: F,
              keepIframeSrcFn: b,
            });
            L && k(e, L);
          }
        },
        F,
      ),
    D.type === ae.Element && delete D.needBlock,
    D
  );
}
function yf(e, t) {
  const {
    mirror: n = new ui(),
    blockClass: r = "rr-block",
    blockSelector: o = null,
    unblockSelector: s = null,
    maskAllText: i = !1,
    maskTextClass: a = "rr-mask",
    unmaskTextClass: c = null,
    maskTextSelector: u = null,
    unmaskTextSelector: d = null,
    inlineStylesheet: l = !0,
    inlineImages: f = !1,
    recordCanvas: h = !1,
    maskAllInputs: p = !1,
    maskAttributeFn: m,
    maskTextFn: _,
    maskInputFn: g,
    slimDOM: v = !1,
    dataURLOptions: M,
    preserveWhiteSpace: w,
    onSerialize: I,
    onIframeLoad: S,
    iframeLoadTimeout: C,
    onBlockedImageLoad: x,
    onStylesheetLoad: y,
    stylesheetLoadTimeout: k,
    keepIframeSrcFn: F = () => !1,
  } = t || {};
  return st(e, {
    doc: e,
    mirror: n,
    blockClass: r,
    blockSelector: o,
    unblockSelector: s,
    maskAllText: i,
    maskTextClass: a,
    unmaskTextClass: c,
    maskTextSelector: u,
    unmaskTextSelector: d,
    skipChild: !1,
    inlineStylesheet: l,
    maskInputOptions:
      p === !0
        ? {
            color: !0,
            date: !0,
            "datetime-local": !0,
            email: !0,
            month: !0,
            number: !0,
            range: !0,
            search: !0,
            tel: !0,
            text: !0,
            time: !0,
            url: !0,
            week: !0,
            textarea: !0,
            select: !0,
          }
        : p === !1
          ? {}
          : p,
    maskAttributeFn: m,
    maskTextFn: _,
    maskInputFn: g,
    slimDOMOptions:
      v === !0 || v === "all"
        ? {
            script: !0,
            comment: !0,
            headFavicon: !0,
            headWhitespace: !0,
            headMetaDescKeywords: v === "all",
            headMetaSocial: !0,
            headMetaRobots: !0,
            headMetaHttpEquiv: !0,
            headMetaAuthorship: !0,
            headMetaVerification: !0,
          }
        : v === !1
          ? {}
          : v,
    dataURLOptions: M,
    inlineImages: f,
    recordCanvas: h,
    preserveWhiteSpace: w,
    onSerialize: I,
    onIframeLoad: S,
    iframeLoadTimeout: C,
    onBlockedImageLoad: x,
    onStylesheetLoad: y,
    stylesheetLoadTimeout: k,
    keepIframeSrcFn: F,
    newlyAddedElement: !1,
  });
}
function he(e, t, n = document) {
  const r = { capture: !0, passive: !0 };
  return (n.addEventListener(e, t, r), () => n.removeEventListener(e, t, r));
}
let zo = {
  map: {},
  getId() {
    return -1;
  },
  getNode() {
    return null;
  },
  removeNodeFromMap() {},
  has() {
    return !1;
  },
  reset() {},
};
typeof window < "u" &&
  window.Proxy &&
  window.Reflect &&
  (zo = new Proxy(zo, {
    get(e, t, n) {
      return Reflect.get(e, t, n);
    },
  }));
function Ct(e, t, n = {}) {
  let r = null,
    o = 0;
  return function (...s) {
    const i = Date.now();
    !o && n.leading === !1 && (o = i);
    const a = t - (i - o),
      c = this;
    a <= 0 || a > t
      ? (r && (If(r), (r = null)), (o = i), e.apply(c, s))
      : !r &&
        n.trailing !== !1 &&
        (r = bn(() => {
          ((o = n.leading === !1 ? 0 : Date.now()), (r = null), e.apply(c, s));
        }, a));
  };
}
function _i(e, t, n, r, o = window) {
  const s = o.Object.getOwnPropertyDescriptor(e, t);
  return (
    o.Object.defineProperty(
      e,
      t,
      r
        ? n
        : {
            set(i) {
              (bn(() => {
                n.set.call(this, i);
              }, 0),
                s && s.set && s.set.call(this, i));
            },
          },
    ),
    () => _i(e, t, s || {}, !0)
  );
}
function Mr(e, t, n) {
  try {
    if (!(t in e)) return () => {};
    const r = e[t],
      o = n(r);
    return (
      typeof o == "function" &&
        ((o.prototype = o.prototype || {}),
        Object.defineProperties(o, {
          __rrweb_original__: { enumerable: !1, value: r },
        })),
      (e[t] = o),
      () => {
        e[t] = r;
      }
    );
  } catch {
    return () => {};
  }
}
let an = Date.now;
/[1-9][0-9]{12}/.test(Date.now().toString()) ||
  (an = () => new Date().getTime());
function yi(e) {
  const t = e.document;
  return {
    left: t.scrollingElement
      ? t.scrollingElement.scrollLeft
      : e.pageXOffset !== void 0
        ? e.pageXOffset
        : t?.documentElement.scrollLeft ||
          t?.body?.parentElement?.scrollLeft ||
          t?.body?.scrollLeft ||
          0,
    top: t.scrollingElement
      ? t.scrollingElement.scrollTop
      : e.pageYOffset !== void 0
        ? e.pageYOffset
        : t?.documentElement.scrollTop ||
          t?.body?.parentElement?.scrollTop ||
          t?.body?.scrollTop ||
          0,
  };
}
function vi() {
  return (
    window.innerHeight ||
    (document.documentElement && document.documentElement.clientHeight) ||
    (document.body && document.body.clientHeight)
  );
}
function bi() {
  return (
    window.innerWidth ||
    (document.documentElement && document.documentElement.clientWidth) ||
    (document.body && document.body.clientWidth)
  );
}
function Si(e) {
  if (!e) return null;
  try {
    return e.nodeType === e.ELEMENT_NODE ? e : e.parentElement;
  } catch {
    return null;
  }
}
function ge(e, t, n, r, o) {
  if (!e) return !1;
  const s = Si(e);
  if (!s) return !1;
  const i = ot(t, n);
  if (!o) {
    const u = r && s.matches(r);
    return i(s) && !u;
  }
  const a = Ge(s, i);
  let c = -1;
  return a < 0
    ? !1
    : (r && (c = Ge(s, ot(null, r))), a > -1 && c < 0 ? !0 : a < c);
}
function vf(e, t) {
  return t.getId(e) !== -1;
}
function Ln(e, t) {
  return t.getId(e) === It;
}
function Ei(e, t) {
  if (vt(e)) return !1;
  const n = t.getId(e);
  return t.has(n)
    ? e.parentNode && e.parentNode.nodeType === e.DOCUMENT_NODE
      ? !1
      : e.parentNode
        ? Ei(e.parentNode, t)
        : !0
    : !0;
}
function or(e) {
  return !!e.changedTouches;
}
function bf(e = window) {
  ("NodeList" in e &&
    !e.NodeList.prototype.forEach &&
    (e.NodeList.prototype.forEach = Array.prototype.forEach),
    "DOMTokenList" in e &&
      !e.DOMTokenList.prototype.forEach &&
      (e.DOMTokenList.prototype.forEach = Array.prototype.forEach),
    Node.prototype.contains ||
      (Node.prototype.contains = (...t) => {
        let n = t[0];
        if (!(0 in t)) throw new TypeError("1 argument is required");
        do if (this === n) return !0;
        while ((n = n && n.parentNode));
        return !1;
      }));
}
function wi(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function ki(e, t) {
  return !!(
    e.nodeName === "LINK" &&
    e.nodeType === e.ELEMENT_NODE &&
    e.getAttribute &&
    e.getAttribute("rel") === "stylesheet" &&
    t.getMeta(e)
  );
}
function sr(e) {
  return !!e?.shadowRoot;
}
class Sf {
  constructor() {
    ((this.id = 1),
      (this.styleIDMap = new WeakMap()),
      (this.idStyleMap = new Map()));
  }
  getId(t) {
    return this.styleIDMap.get(t) ?? -1;
  }
  has(t) {
    return this.styleIDMap.has(t);
  }
  add(t, n) {
    if (this.has(t)) return this.getId(t);
    let r;
    return (
      n === void 0 ? (r = this.id++) : (r = n),
      this.styleIDMap.set(t, r),
      this.idStyleMap.set(r, t),
      r
    );
  }
  getStyle(t) {
    return this.idStyleMap.get(t) || null;
  }
  reset() {
    ((this.styleIDMap = new WeakMap()),
      (this.idStyleMap = new Map()),
      (this.id = 1));
  }
  generateId() {
    return this.id++;
  }
}
function Ii(e) {
  let t = null;
  return (
    e.getRootNode?.()?.nodeType === Node.DOCUMENT_FRAGMENT_NODE &&
      e.getRootNode().host &&
      (t = e.getRootNode().host),
    t
  );
}
function Ef(e) {
  let t = e,
    n;
  for (; (n = Ii(t)); ) t = n;
  return t;
}
function wf(e) {
  const t = e.ownerDocument;
  if (!t) return !1;
  const n = Ef(e);
  return t.contains(n);
}
function Ci(e) {
  const t = e.ownerDocument;
  return t ? t.contains(e) || wf(e) : !1;
}
const jo = {};
function Ar(e) {
  const t = jo[e];
  if (t) return t;
  const n = window.document;
  let r = window[e];
  if (n && typeof n.createElement == "function")
    try {
      const o = n.createElement("iframe");
      ((o.hidden = !0), n.head.appendChild(o));
      const s = o.contentWindow;
      (s && s[e] && (r = s[e]), n.head.removeChild(o));
    } catch {}
  return (jo[e] = r.bind(window));
}
function kf(...e) {
  return Ar("requestAnimationFrame")(...e);
}
function bn(...e) {
  return Ar("setTimeout")(...e);
}
function If(...e) {
  return Ar("clearTimeout")(...e);
}
var N = ((e) => (
    (e[(e.DomContentLoaded = 0)] = "DomContentLoaded"),
    (e[(e.Load = 1)] = "Load"),
    (e[(e.FullSnapshot = 2)] = "FullSnapshot"),
    (e[(e.IncrementalSnapshot = 3)] = "IncrementalSnapshot"),
    (e[(e.Meta = 4)] = "Meta"),
    (e[(e.Custom = 5)] = "Custom"),
    (e[(e.Plugin = 6)] = "Plugin"),
    e
  ))(N || {}),
  O = ((e) => (
    (e[(e.Mutation = 0)] = "Mutation"),
    (e[(e.MouseMove = 1)] = "MouseMove"),
    (e[(e.MouseInteraction = 2)] = "MouseInteraction"),
    (e[(e.Scroll = 3)] = "Scroll"),
    (e[(e.ViewportResize = 4)] = "ViewportResize"),
    (e[(e.Input = 5)] = "Input"),
    (e[(e.TouchMove = 6)] = "TouchMove"),
    (e[(e.MediaInteraction = 7)] = "MediaInteraction"),
    (e[(e.StyleSheetRule = 8)] = "StyleSheetRule"),
    (e[(e.CanvasMutation = 9)] = "CanvasMutation"),
    (e[(e.Font = 10)] = "Font"),
    (e[(e.Log = 11)] = "Log"),
    (e[(e.Drag = 12)] = "Drag"),
    (e[(e.StyleDeclaration = 13)] = "StyleDeclaration"),
    (e[(e.Selection = 14)] = "Selection"),
    (e[(e.AdoptedStyleSheet = 15)] = "AdoptedStyleSheet"),
    (e[(e.CustomElement = 16)] = "CustomElement"),
    e
  ))(O || {}),
  fe = ((e) => (
    (e[(e.MouseUp = 0)] = "MouseUp"),
    (e[(e.MouseDown = 1)] = "MouseDown"),
    (e[(e.Click = 2)] = "Click"),
    (e[(e.ContextMenu = 3)] = "ContextMenu"),
    (e[(e.DblClick = 4)] = "DblClick"),
    (e[(e.Focus = 5)] = "Focus"),
    (e[(e.Blur = 6)] = "Blur"),
    (e[(e.TouchStart = 7)] = "TouchStart"),
    (e[(e.TouchMove_Departed = 8)] = "TouchMove_Departed"),
    (e[(e.TouchEnd = 9)] = "TouchEnd"),
    (e[(e.TouchCancel = 10)] = "TouchCancel"),
    e
  ))(fe || {}),
  Re = ((e) => (
    (e[(e.Mouse = 0)] = "Mouse"),
    (e[(e.Pen = 1)] = "Pen"),
    (e[(e.Touch = 2)] = "Touch"),
    e
  ))(Re || {}),
  nt = ((e) => (
    (e[(e.Play = 0)] = "Play"),
    (e[(e.Pause = 1)] = "Pause"),
    (e[(e.Seeked = 2)] = "Seeked"),
    (e[(e.VolumeChange = 3)] = "VolumeChange"),
    (e[(e.RateChange = 4)] = "RateChange"),
    e
  ))(nt || {});
function Or(e) {
  try {
    return e.contentDocument;
  } catch {}
}
function Cf(e) {
  try {
    return e.contentWindow;
  } catch {}
}
function qo(e) {
  return "__ln" in e;
}
class xf {
  constructor() {
    ((this.length = 0), (this.head = null), (this.tail = null));
  }
  get(t) {
    if (t >= this.length) throw new Error("Position outside of list range");
    let n = this.head;
    for (let r = 0; r < t; r++) n = n?.next || null;
    return n;
  }
  addNode(t) {
    const n = { value: t, previous: null, next: null };
    if (((t.__ln = n), t.previousSibling && qo(t.previousSibling))) {
      const r = t.previousSibling.__ln.next;
      ((n.next = r),
        (n.previous = t.previousSibling.__ln),
        (t.previousSibling.__ln.next = n),
        r && (r.previous = n));
    } else if (
      t.nextSibling &&
      qo(t.nextSibling) &&
      t.nextSibling.__ln.previous
    ) {
      const r = t.nextSibling.__ln.previous;
      ((n.previous = r),
        (n.next = t.nextSibling.__ln),
        (t.nextSibling.__ln.previous = n),
        r && (r.next = n));
    } else
      (this.head && (this.head.previous = n),
        (n.next = this.head),
        (this.head = n));
    (n.next === null && (this.tail = n), this.length++);
  }
  removeNode(t) {
    const n = t.__ln;
    this.head &&
      (n.previous
        ? ((n.previous.next = n.next),
          n.next ? (n.next.previous = n.previous) : (this.tail = n.previous))
        : ((this.head = n.next),
          this.head ? (this.head.previous = null) : (this.tail = null)),
      t.__ln && delete t.__ln,
      this.length--);
  }
}
const Vo = (e, t) => `${e}@${t}`;
class Tf {
  constructor() {
    ((this.frozen = !1),
      (this.locked = !1),
      (this.texts = []),
      (this.attributes = []),
      (this.attributeMap = new WeakMap()),
      (this.removes = []),
      (this.mapRemoves = []),
      (this.movedMap = {}),
      (this.addedSet = new Set()),
      (this.movedSet = new Set()),
      (this.droppedSet = new Set()),
      (this.processMutations = (t) => {
        (t.forEach(this.processMutation), this.emit());
      }),
      (this.emit = () => {
        if (this.frozen || this.locked) return;
        const t = [],
          n = new Set(),
          r = new xf(),
          o = (c) => {
            let u = c,
              d = It;
            for (; d === It; )
              ((u = u && u.nextSibling), (d = u && this.mirror.getId(u)));
            return d;
          },
          s = (c) => {
            if (!c.parentNode || !Ci(c)) return;
            const u = vt(c.parentNode)
                ? this.mirror.getId(Ii(c))
                : this.mirror.getId(c.parentNode),
              d = o(c);
            if (u === -1 || d === -1) return r.addNode(c);
            const l = st(c, {
              doc: this.doc,
              mirror: this.mirror,
              blockClass: this.blockClass,
              blockSelector: this.blockSelector,
              maskAllText: this.maskAllText,
              unblockSelector: this.unblockSelector,
              maskTextClass: this.maskTextClass,
              unmaskTextClass: this.unmaskTextClass,
              maskTextSelector: this.maskTextSelector,
              unmaskTextSelector: this.unmaskTextSelector,
              skipChild: !0,
              newlyAddedElement: !0,
              inlineStylesheet: this.inlineStylesheet,
              maskInputOptions: this.maskInputOptions,
              maskAttributeFn: this.maskAttributeFn,
              maskTextFn: this.maskTextFn,
              maskInputFn: this.maskInputFn,
              slimDOMOptions: this.slimDOMOptions,
              dataURLOptions: this.dataURLOptions,
              recordCanvas: this.recordCanvas,
              inlineImages: this.inlineImages,
              onSerialize: (f) => {
                (wi(f, this.mirror) &&
                  !ge(
                    f,
                    this.blockClass,
                    this.blockSelector,
                    this.unblockSelector,
                    !1,
                  ) &&
                  this.iframeManager.addIframe(f),
                  ki(f, this.mirror) &&
                    this.stylesheetManager.trackLinkElement(f),
                  sr(c) &&
                    this.shadowDomManager.addShadowRoot(
                      c.shadowRoot,
                      this.doc,
                    ));
              },
              onIframeLoad: (f, h) => {
                ge(
                  f,
                  this.blockClass,
                  this.blockSelector,
                  this.unblockSelector,
                  !1,
                ) ||
                  (this.iframeManager.attachIframe(f, h),
                  f.contentWindow &&
                    this.canvasManager.addWindow(f.contentWindow),
                  this.shadowDomManager.observeAttachShadow(f));
              },
              onStylesheetLoad: (f, h) => {
                this.stylesheetManager.attachLinkElement(f, h);
              },
              onBlockedImageLoad: (f, h, { width: p, height: m }) => {
                this.mutationCb({
                  adds: [],
                  removes: [],
                  texts: [],
                  attributes: [
                    {
                      id: h.id,
                      attributes: {
                        style: { width: `${p}px`, height: `${m}px` },
                      },
                    },
                  ],
                });
              },
            });
            l && (t.push({ parentId: u, nextId: d, node: l }), n.add(l.id));
          };
        for (; this.mapRemoves.length; )
          this.mirror.removeNodeFromMap(this.mapRemoves.shift());
        for (const c of this.movedSet)
          (Go(this.removes, c, this.mirror) &&
            !this.movedSet.has(c.parentNode)) ||
            s(c);
        for (const c of this.addedSet)
          (!Yo(this.droppedSet, c) && !Go(this.removes, c, this.mirror)) ||
          Yo(this.movedSet, c)
            ? s(c)
            : this.droppedSet.add(c);
        let i = null;
        for (; r.length; ) {
          let c = null;
          if (i) {
            const u = this.mirror.getId(i.value.parentNode),
              d = o(i.value);
            u !== -1 && d !== -1 && (c = i);
          }
          if (!c) {
            let u = r.tail;
            for (; u; ) {
              const d = u;
              if (((u = u.previous), d)) {
                const l = this.mirror.getId(d.value.parentNode);
                if (o(d.value) === -1) continue;
                if (l !== -1) {
                  c = d;
                  break;
                } else {
                  const h = d.value;
                  if (
                    h.parentNode &&
                    h.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE
                  ) {
                    const p = h.parentNode.host;
                    if (this.mirror.getId(p) !== -1) {
                      c = d;
                      break;
                    }
                  }
                }
              }
            }
          }
          if (!c) {
            for (; r.head; ) r.removeNode(r.head.value);
            break;
          }
          ((i = c.previous), r.removeNode(c.value), s(c.value));
        }
        const a = {
          texts: this.texts
            .map((c) => ({ id: this.mirror.getId(c.node), value: c.value }))
            .filter((c) => !n.has(c.id))
            .filter((c) => this.mirror.has(c.id)),
          attributes: this.attributes
            .map((c) => {
              const { attributes: u } = c;
              if (typeof u.style == "string") {
                const d = JSON.stringify(c.styleDiff),
                  l = JSON.stringify(c._unchangedStyles);
                d.length < u.style.length &&
                  (d + l).split("var(").length ===
                    u.style.split("var(").length &&
                  (u.style = c.styleDiff);
              }
              return { id: this.mirror.getId(c.node), attributes: u };
            })
            .filter((c) => !n.has(c.id))
            .filter((c) => this.mirror.has(c.id)),
          removes: this.removes,
          adds: t,
        };
        (!a.texts.length &&
          !a.attributes.length &&
          !a.removes.length &&
          !a.adds.length) ||
          ((this.texts = []),
          (this.attributes = []),
          (this.attributeMap = new WeakMap()),
          (this.removes = []),
          (this.addedSet = new Set()),
          (this.movedSet = new Set()),
          (this.droppedSet = new Set()),
          (this.movedMap = {}),
          this.mutationCb(a));
      }),
      (this.processMutation = (t) => {
        if (!Ln(t.target, this.mirror))
          switch (t.type) {
            case "characterData": {
              const n = t.target.textContent;
              !ge(
                t.target,
                this.blockClass,
                this.blockSelector,
                this.unblockSelector,
                !1,
              ) &&
                n !== t.oldValue &&
                this.texts.push({
                  value:
                    ht(
                      t.target,
                      this.maskTextClass,
                      this.maskTextSelector,
                      this.unmaskTextClass,
                      this.unmaskTextSelector,
                      this.maskAllText,
                    ) && n
                      ? this.maskTextFn
                        ? this.maskTextFn(n, Si(t.target))
                        : n.replace(/[\S]/g, "*")
                      : n,
                  node: t.target,
                });
              break;
            }
            case "attributes": {
              const n = t.target;
              let r = t.attributeName,
                o = t.target.getAttribute(r);
              if (r === "value") {
                const i = Tr(n),
                  a = n.tagName;
                o = on(n, a, i);
                const c = yn({
                    maskInputOptions: this.maskInputOptions,
                    tagName: a,
                    type: i,
                  }),
                  u = ht(
                    t.target,
                    this.maskTextClass,
                    this.maskTextSelector,
                    this.unmaskTextClass,
                    this.unmaskTextSelector,
                    c,
                  );
                o = kt({
                  isMasked: u,
                  element: n,
                  value: o,
                  maskInputFn: this.maskInputFn,
                });
              }
              if (
                ge(
                  t.target,
                  this.blockClass,
                  this.blockSelector,
                  this.unblockSelector,
                  !1,
                ) ||
                o === t.oldValue
              )
                return;
              let s = this.attributeMap.get(t.target);
              if (
                n.tagName === "IFRAME" &&
                r === "src" &&
                !this.keepIframeSrcFn(o)
              )
                if (!Or(n)) r = "rr_src";
                else return;
              if (
                (s ||
                  ((s = {
                    node: t.target,
                    attributes: {},
                    styleDiff: {},
                    _unchangedStyles: {},
                  }),
                  this.attributes.push(s),
                  this.attributeMap.set(t.target, s)),
                r === "type" &&
                  n.tagName === "INPUT" &&
                  (t.oldValue || "").toLowerCase() === "password" &&
                  n.setAttribute("data-rr-is-password", "true"),
                !gi(n.tagName, r) &&
                  ((s.attributes[r] = mi(
                    this.doc,
                    ft(n.tagName),
                    ft(r),
                    o,
                    n,
                    this.maskAttributeFn,
                  )),
                  r === "style"))
              ) {
                if (!this.unattachedDoc)
                  try {
                    this.unattachedDoc =
                      document.implementation.createHTMLDocument();
                  } catch {
                    this.unattachedDoc = this.doc;
                  }
                const i = this.unattachedDoc.createElement("span");
                t.oldValue && i.setAttribute("style", t.oldValue);
                for (const a of Array.from(n.style)) {
                  const c = n.style.getPropertyValue(a),
                    u = n.style.getPropertyPriority(a);
                  c !== i.style.getPropertyValue(a) ||
                  u !== i.style.getPropertyPriority(a)
                    ? u === ""
                      ? (s.styleDiff[a] = c)
                      : (s.styleDiff[a] = [c, u])
                    : (s._unchangedStyles[a] = [c, u]);
                }
                for (const a of Array.from(i.style))
                  n.style.getPropertyValue(a) === "" && (s.styleDiff[a] = !1);
              }
              break;
            }
            case "childList": {
              if (
                ge(
                  t.target,
                  this.blockClass,
                  this.blockSelector,
                  this.unblockSelector,
                  !0,
                )
              )
                return;
              (t.addedNodes.forEach((n) => this.genAdds(n, t.target)),
                t.removedNodes.forEach((n) => {
                  const r = this.mirror.getId(n),
                    o = vt(t.target)
                      ? this.mirror.getId(t.target.host)
                      : this.mirror.getId(t.target);
                  ge(
                    t.target,
                    this.blockClass,
                    this.blockSelector,
                    this.unblockSelector,
                    !1,
                  ) ||
                    Ln(n, this.mirror) ||
                    !vf(n, this.mirror) ||
                    (this.addedSet.has(n)
                      ? (ir(this.addedSet, n), this.droppedSet.add(n))
                      : (this.addedSet.has(t.target) && r === -1) ||
                        Ei(t.target, this.mirror) ||
                        (this.movedSet.has(n) && this.movedMap[Vo(r, o)]
                          ? ir(this.movedSet, n)
                          : this.removes.push({
                              parentId: o,
                              id: r,
                              isShadow:
                                vt(t.target) && bt(t.target) ? !0 : void 0,
                            })),
                    this.mapRemoves.push(n));
                }));
              break;
            }
          }
      }),
      (this.genAdds = (t, n) => {
        if (
          !this.processedNodeManager.inOtherBuffer(t, this) &&
          !(this.addedSet.has(t) || this.movedSet.has(t))
        ) {
          if (this.mirror.hasNode(t)) {
            if (Ln(t, this.mirror)) return;
            this.movedSet.add(t);
            let r = null;
            (n && this.mirror.hasNode(n) && (r = this.mirror.getId(n)),
              r &&
                r !== -1 &&
                (this.movedMap[Vo(this.mirror.getId(t), r)] = !0));
          } else (this.addedSet.add(t), this.droppedSet.delete(t));
          ge(
            t,
            this.blockClass,
            this.blockSelector,
            this.unblockSelector,
            !1,
          ) ||
            (t.childNodes && t.childNodes.forEach((r) => this.genAdds(r)),
            sr(t) &&
              t.shadowRoot.childNodes.forEach((r) => {
                (this.processedNodeManager.add(r, this), this.genAdds(r, t));
              }));
        }
      }));
  }
  init(t) {
    [
      "mutationCb",
      "blockClass",
      "blockSelector",
      "unblockSelector",
      "maskAllText",
      "maskTextClass",
      "unmaskTextClass",
      "maskTextSelector",
      "unmaskTextSelector",
      "inlineStylesheet",
      "maskInputOptions",
      "maskAttributeFn",
      "maskTextFn",
      "maskInputFn",
      "keepIframeSrcFn",
      "recordCanvas",
      "inlineImages",
      "slimDOMOptions",
      "dataURLOptions",
      "doc",
      "mirror",
      "iframeManager",
      "stylesheetManager",
      "shadowDomManager",
      "canvasManager",
      "processedNodeManager",
    ].forEach((n) => {
      this[n] = t[n];
    });
  }
  freeze() {
    ((this.frozen = !0), this.canvasManager.freeze());
  }
  unfreeze() {
    ((this.frozen = !1), this.canvasManager.unfreeze(), this.emit());
  }
  isFrozen() {
    return this.frozen;
  }
  lock() {
    ((this.locked = !0), this.canvasManager.lock());
  }
  unlock() {
    ((this.locked = !1), this.canvasManager.unlock(), this.emit());
  }
  reset() {
    (this.shadowDomManager.reset(), this.canvasManager.reset());
  }
}
function ir(e, t) {
  (e.delete(t), t.childNodes?.forEach((n) => ir(e, n)));
}
function Go(e, t, n) {
  return e.length === 0 ? !1 : Rf(e, t, n);
}
function Rf(e, t, n) {
  let r = t.parentNode;
  for (; r; ) {
    const o = n.getId(r);
    if (e.some((s) => s.id === o)) return !0;
    r = r.parentNode;
  }
  return !1;
}
function Yo(e, t) {
  return e.size === 0 ? !1 : xi(e, t);
}
function xi(e, t) {
  const { parentNode: n } = t;
  return n ? (e.has(n) ? !0 : xi(e, n)) : !1;
}
let St;
function Mf(e) {
  St = e;
}
function Af() {
  St = void 0;
}
const $ = (e) =>
    St
      ? (...n) => {
          try {
            return e(...n);
          } catch (r) {
            if (St && St(r) === !0) return () => {};
            throw r;
          }
        }
      : e,
  it = [];
function Ot(e) {
  try {
    if ("composedPath" in e) {
      const t = e.composedPath();
      if (t.length) return t[0];
    } else if ("path" in e && e.path.length) return e.path[0];
  } catch {}
  return e && e.target;
}
function Ti(e, t) {
  const n = new Tf();
  (it.push(n), n.init(e));
  let r = window.MutationObserver || window.__rrMutationObserver;
  const o = window?.Zone?.__symbol__?.("MutationObserver");
  o && window[o] && (r = window[o]);
  const s = new r(
    $((i) => {
      (e.onMutation && e.onMutation(i) === !1) || n.processMutations.bind(n)(i);
    }),
  );
  return (
    s.observe(t, {
      attributes: !0,
      attributeOldValue: !0,
      characterData: !0,
      characterDataOldValue: !0,
      childList: !0,
      subtree: !0,
    }),
    s
  );
}
function Of({ mousemoveCb: e, sampling: t, doc: n, mirror: r }) {
  if (t.mousemove === !1) return () => {};
  const o = typeof t.mousemove == "number" ? t.mousemove : 50,
    s = typeof t.mousemoveCallback == "number" ? t.mousemoveCallback : 500;
  let i = [],
    a;
  const c = Ct(
      $((l) => {
        const f = Date.now() - a;
        (e(
          i.map((h) => ((h.timeOffset -= f), h)),
          l,
        ),
          (i = []),
          (a = null));
      }),
      s,
    ),
    u = $(
      Ct(
        $((l) => {
          const f = Ot(l),
            { clientX: h, clientY: p } = or(l) ? l.changedTouches[0] : l;
          (a || (a = an()),
            i.push({ x: h, y: p, id: r.getId(f), timeOffset: an() - a }),
            c(
              typeof DragEvent < "u" && l instanceof DragEvent
                ? O.Drag
                : l instanceof MouseEvent
                  ? O.MouseMove
                  : O.TouchMove,
            ));
        }),
        o,
        { trailing: !1 },
      ),
    ),
    d = [he("mousemove", u, n), he("touchmove", u, n), he("drag", u, n)];
  return $(() => {
    d.forEach((l) => l());
  });
}
function Df({
  mouseInteractionCb: e,
  doc: t,
  mirror: n,
  blockClass: r,
  blockSelector: o,
  unblockSelector: s,
  sampling: i,
}) {
  if (i.mouseInteraction === !1) return () => {};
  const a =
      i.mouseInteraction === !0 || i.mouseInteraction === void 0
        ? {}
        : i.mouseInteraction,
    c = [];
  let u = null;
  const d = (l) => (f) => {
    const h = Ot(f);
    if (ge(h, r, o, s, !0)) return;
    let p = null,
      m = l;
    if ("pointerType" in f) {
      switch (f.pointerType) {
        case "mouse":
          p = Re.Mouse;
          break;
        case "touch":
          p = Re.Touch;
          break;
        case "pen":
          p = Re.Pen;
          break;
      }
      p === Re.Touch
        ? fe[l] === fe.MouseDown
          ? (m = "TouchStart")
          : fe[l] === fe.MouseUp && (m = "TouchEnd")
        : Re.Pen;
    } else or(f) && (p = Re.Touch);
    p !== null
      ? ((u = p),
        ((m.startsWith("Touch") && p === Re.Touch) ||
          (m.startsWith("Mouse") && p === Re.Mouse)) &&
          (p = null))
      : fe[l] === fe.Click && ((p = u), (u = null));
    const _ = or(f) ? f.changedTouches[0] : f;
    if (!_) return;
    const g = n.getId(h),
      { clientX: v, clientY: M } = _;
    $(e)({
      type: fe[m],
      id: g,
      x: v,
      y: M,
      ...(p !== null && { pointerType: p }),
    });
  };
  return (
    Object.keys(fe)
      .filter(
        (l) =>
          Number.isNaN(Number(l)) && !l.endsWith("_Departed") && a[l] !== !1,
      )
      .forEach((l) => {
        let f = ft(l);
        const h = d(l);
        if (window.PointerEvent)
          switch (fe[l]) {
            case fe.MouseDown:
            case fe.MouseUp:
              f = f.replace("mouse", "pointer");
              break;
            case fe.TouchStart:
            case fe.TouchEnd:
              return;
          }
        c.push(he(f, h, t));
      }),
    $(() => {
      c.forEach((l) => l());
    })
  );
}
function Ri({
  scrollCb: e,
  doc: t,
  mirror: n,
  blockClass: r,
  blockSelector: o,
  unblockSelector: s,
  sampling: i,
}) {
  const a = $(
    Ct(
      $((c) => {
        const u = Ot(c);
        if (!u || ge(u, r, o, s, !0)) return;
        const d = n.getId(u);
        if (u === t && t.defaultView) {
          const l = yi(t.defaultView);
          e({ id: d, x: l.left, y: l.top });
        } else e({ id: d, x: u.scrollLeft, y: u.scrollTop });
      }),
      i.scroll || 100,
    ),
  );
  return he("scroll", a, t);
}
function Lf({ viewportResizeCb: e }, { win: t }) {
  let n = -1,
    r = -1;
  const o = $(
    Ct(
      $(() => {
        const s = vi(),
          i = bi();
        (n !== s || r !== i) &&
          (e({ width: Number(i), height: Number(s) }), (n = s), (r = i));
      }),
      200,
    ),
  );
  return he("resize", o, t);
}
const Nf = ["INPUT", "TEXTAREA", "SELECT"],
  Ko = new WeakMap();
function Pf({
  inputCb: e,
  doc: t,
  mirror: n,
  blockClass: r,
  blockSelector: o,
  unblockSelector: s,
  ignoreClass: i,
  ignoreSelector: a,
  maskInputOptions: c,
  maskInputFn: u,
  sampling: d,
  userTriggeredOnInput: l,
  maskTextClass: f,
  unmaskTextClass: h,
  maskTextSelector: p,
  unmaskTextSelector: m,
}) {
  function _(C) {
    let x = Ot(C);
    const y = C.isTrusted,
      k = x && nr(x.tagName);
    if (
      (k === "OPTION" && (x = x.parentElement),
      !x || !k || Nf.indexOf(k) < 0 || ge(x, r, o, s, !0))
    )
      return;
    const F = x;
    if (F.classList.contains(i) || (a && F.matches(a))) return;
    const b = Tr(x);
    let A = on(F, k, b),
      U = !1;
    const j = yn({ maskInputOptions: c, tagName: k, type: b }),
      Q = ht(x, f, p, h, m, j);
    ((b === "radio" || b === "checkbox") && (U = x.checked),
      (A = kt({ isMasked: Q, element: x, value: A, maskInputFn: u })),
      g(
        x,
        l
          ? { text: A, isChecked: U, userTriggered: y }
          : { text: A, isChecked: U },
      ));
    const D = x.name;
    b === "radio" &&
      D &&
      U &&
      t.querySelectorAll(`input[type="radio"][name="${D}"]`).forEach((q) => {
        if (q !== x) {
          const L = kt({
            isMasked: Q,
            element: q,
            value: on(q, k, b),
            maskInputFn: u,
          });
          g(
            q,
            l
              ? { text: L, isChecked: !U, userTriggered: !1 }
              : { text: L, isChecked: !U },
          );
        }
      });
  }
  function g(C, x) {
    const y = Ko.get(C);
    if (!y || y.text !== x.text || y.isChecked !== x.isChecked) {
      Ko.set(C, x);
      const k = n.getId(C);
      $(e)({ ...x, id: k });
    }
  }
  const M = (d.input === "last" ? ["change"] : ["input", "change"]).map((C) =>
      he(C, $(_), t),
    ),
    w = t.defaultView;
  if (!w)
    return () => {
      M.forEach((C) => C());
    };
  const I = w.Object.getOwnPropertyDescriptor(
      w.HTMLInputElement.prototype,
      "value",
    ),
    S = [
      [w.HTMLInputElement.prototype, "value"],
      [w.HTMLInputElement.prototype, "checked"],
      [w.HTMLSelectElement.prototype, "value"],
      [w.HTMLTextAreaElement.prototype, "value"],
      [w.HTMLSelectElement.prototype, "selectedIndex"],
      [w.HTMLOptionElement.prototype, "selected"],
    ];
  return (
    I &&
      I.set &&
      M.push(
        ...S.map((C) =>
          _i(
            C[0],
            C[1],
            {
              set() {
                $(_)({ target: this, isTrusted: !1 });
              },
            },
            !1,
            w,
          ),
        ),
      ),
    $(() => {
      M.forEach((C) => C());
    })
  );
}
function cn(e) {
  const t = [];
  function n(r, o) {
    if (
      ($t("CSSGroupingRule") && r.parentRule instanceof CSSGroupingRule) ||
      ($t("CSSMediaRule") && r.parentRule instanceof CSSMediaRule) ||
      ($t("CSSSupportsRule") && r.parentRule instanceof CSSSupportsRule) ||
      ($t("CSSConditionRule") && r.parentRule instanceof CSSConditionRule)
    ) {
      const i = Array.from(r.parentRule.cssRules).indexOf(r);
      o.unshift(i);
    } else if (r.parentStyleSheet) {
      const i = Array.from(r.parentStyleSheet.cssRules).indexOf(r);
      o.unshift(i);
    }
    return o;
  }
  return n(e, t);
}
function Pe(e, t, n) {
  let r, o;
  return e
    ? (e.ownerNode ? (r = t.getId(e.ownerNode)) : (o = n.getId(e)),
      { styleId: o, id: r })
    : {};
}
function Ff(
  { styleSheetRuleCb: e, mirror: t, stylesheetManager: n },
  { win: r },
) {
  if (!r.CSSStyleSheet || !r.CSSStyleSheet.prototype) return () => {};
  const o = r.CSSStyleSheet.prototype.insertRule;
  r.CSSStyleSheet.prototype.insertRule = new Proxy(o, {
    apply: $((d, l, f) => {
      const [h, p] = f,
        { id: m, styleId: _ } = Pe(l, t, n.styleMirror);
      return (
        ((m && m !== -1) || (_ && _ !== -1)) &&
          e({ id: m, styleId: _, adds: [{ rule: h, index: p }] }),
        d.apply(l, f)
      );
    }),
  });
  const s = r.CSSStyleSheet.prototype.deleteRule;
  r.CSSStyleSheet.prototype.deleteRule = new Proxy(s, {
    apply: $((d, l, f) => {
      const [h] = f,
        { id: p, styleId: m } = Pe(l, t, n.styleMirror);
      return (
        ((p && p !== -1) || (m && m !== -1)) &&
          e({ id: p, styleId: m, removes: [{ index: h }] }),
        d.apply(l, f)
      );
    }),
  });
  let i;
  r.CSSStyleSheet.prototype.replace &&
    ((i = r.CSSStyleSheet.prototype.replace),
    (r.CSSStyleSheet.prototype.replace = new Proxy(i, {
      apply: $((d, l, f) => {
        const [h] = f,
          { id: p, styleId: m } = Pe(l, t, n.styleMirror);
        return (
          ((p && p !== -1) || (m && m !== -1)) &&
            e({ id: p, styleId: m, replace: h }),
          d.apply(l, f)
        );
      }),
    })));
  let a;
  r.CSSStyleSheet.prototype.replaceSync &&
    ((a = r.CSSStyleSheet.prototype.replaceSync),
    (r.CSSStyleSheet.prototype.replaceSync = new Proxy(a, {
      apply: $((d, l, f) => {
        const [h] = f,
          { id: p, styleId: m } = Pe(l, t, n.styleMirror);
        return (
          ((p && p !== -1) || (m && m !== -1)) &&
            e({ id: p, styleId: m, replaceSync: h }),
          d.apply(l, f)
        );
      }),
    })));
  const c = {};
  Ut("CSSGroupingRule")
    ? (c.CSSGroupingRule = r.CSSGroupingRule)
    : (Ut("CSSMediaRule") && (c.CSSMediaRule = r.CSSMediaRule),
      Ut("CSSConditionRule") && (c.CSSConditionRule = r.CSSConditionRule),
      Ut("CSSSupportsRule") && (c.CSSSupportsRule = r.CSSSupportsRule));
  const u = {};
  return (
    Object.entries(c).forEach(([d, l]) => {
      ((u[d] = {
        insertRule: l.prototype.insertRule,
        deleteRule: l.prototype.deleteRule,
      }),
        (l.prototype.insertRule = new Proxy(u[d].insertRule, {
          apply: $((f, h, p) => {
            const [m, _] = p,
              { id: g, styleId: v } = Pe(h.parentStyleSheet, t, n.styleMirror);
            return (
              ((g && g !== -1) || (v && v !== -1)) &&
                e({
                  id: g,
                  styleId: v,
                  adds: [{ rule: m, index: [...cn(h), _ || 0] }],
                }),
              f.apply(h, p)
            );
          }),
        })),
        (l.prototype.deleteRule = new Proxy(u[d].deleteRule, {
          apply: $((f, h, p) => {
            const [m] = p,
              { id: _, styleId: g } = Pe(h.parentStyleSheet, t, n.styleMirror);
            return (
              ((_ && _ !== -1) || (g && g !== -1)) &&
                e({ id: _, styleId: g, removes: [{ index: [...cn(h), m] }] }),
              f.apply(h, p)
            );
          }),
        })));
    }),
    $(() => {
      ((r.CSSStyleSheet.prototype.insertRule = o),
        (r.CSSStyleSheet.prototype.deleteRule = s),
        i && (r.CSSStyleSheet.prototype.replace = i),
        a && (r.CSSStyleSheet.prototype.replaceSync = a),
        Object.entries(c).forEach(([d, l]) => {
          ((l.prototype.insertRule = u[d].insertRule),
            (l.prototype.deleteRule = u[d].deleteRule));
        }));
    })
  );
}
function Mi({ mirror: e, stylesheetManager: t }, n) {
  let r = null;
  n.nodeName === "#document" ? (r = e.getId(n)) : (r = e.getId(n.host));
  const o =
      n.nodeName === "#document"
        ? n.defaultView?.Document
        : n.ownerDocument?.defaultView?.ShadowRoot,
    s = o?.prototype
      ? Object.getOwnPropertyDescriptor(o?.prototype, "adoptedStyleSheets")
      : void 0;
  return r === null || r === -1 || !o || !s
    ? () => {}
    : (Object.defineProperty(n, "adoptedStyleSheets", {
        configurable: s.configurable,
        enumerable: s.enumerable,
        get() {
          return s.get?.call(this);
        },
        set(i) {
          const a = s.set?.call(this, i);
          if (r !== null && r !== -1)
            try {
              t.adoptStyleSheets(i, r);
            } catch {}
          return a;
        },
      }),
      $(() => {
        Object.defineProperty(n, "adoptedStyleSheets", {
          configurable: s.configurable,
          enumerable: s.enumerable,
          get: s.get,
          set: s.set,
        });
      }));
}
function Bf(
  {
    styleDeclarationCb: e,
    mirror: t,
    ignoreCSSAttributes: n,
    stylesheetManager: r,
  },
  { win: o },
) {
  const s = o.CSSStyleDeclaration.prototype.setProperty;
  o.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
    apply: $((a, c, u) => {
      const [d, l, f] = u;
      if (n.has(d)) return s.apply(c, [d, l, f]);
      const { id: h, styleId: p } = Pe(
        c.parentRule?.parentStyleSheet,
        t,
        r.styleMirror,
      );
      return (
        ((h && h !== -1) || (p && p !== -1)) &&
          e({
            id: h,
            styleId: p,
            set: { property: d, value: l, priority: f },
            index: cn(c.parentRule),
          }),
        a.apply(c, u)
      );
    }),
  });
  const i = o.CSSStyleDeclaration.prototype.removeProperty;
  return (
    (o.CSSStyleDeclaration.prototype.removeProperty = new Proxy(i, {
      apply: $((a, c, u) => {
        const [d] = u;
        if (n.has(d)) return i.apply(c, [d]);
        const { id: l, styleId: f } = Pe(
          c.parentRule?.parentStyleSheet,
          t,
          r.styleMirror,
        );
        return (
          ((l && l !== -1) || (f && f !== -1)) &&
            e({
              id: l,
              styleId: f,
              remove: { property: d },
              index: cn(c.parentRule),
            }),
          a.apply(c, u)
        );
      }),
    })),
    $(() => {
      ((o.CSSStyleDeclaration.prototype.setProperty = s),
        (o.CSSStyleDeclaration.prototype.removeProperty = i));
    })
  );
}
function $f({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: n,
  unblockSelector: r,
  mirror: o,
  sampling: s,
  doc: i,
}) {
  const a = $((u) =>
      Ct(
        $((d) => {
          const l = Ot(d);
          if (!l || ge(l, t, n, r, !0)) return;
          const { currentTime: f, volume: h, muted: p, playbackRate: m } = l;
          e({
            type: u,
            id: o.getId(l),
            currentTime: f,
            volume: h,
            muted: p,
            playbackRate: m,
          });
        }),
        s.media || 500,
      ),
    ),
    c = [
      he("play", a(nt.Play), i),
      he("pause", a(nt.Pause), i),
      he("seeked", a(nt.Seeked), i),
      he("volumechange", a(nt.VolumeChange), i),
      he("ratechange", a(nt.RateChange), i),
    ];
  return $(() => {
    c.forEach((u) => u());
  });
}
function Uf({ fontCb: e, doc: t }) {
  const n = t.defaultView;
  if (!n) return () => {};
  const r = [],
    o = new WeakMap(),
    s = n.FontFace;
  n.FontFace = function (c, u, d) {
    const l = new s(c, u, d);
    return (
      o.set(l, {
        family: c,
        buffer: typeof u != "string",
        descriptors: d,
        fontSource:
          typeof u == "string"
            ? u
            : JSON.stringify(Array.from(new Uint8Array(u))),
      }),
      l
    );
  };
  const i = Mr(t.fonts, "add", function (a) {
    return function (c) {
      return (
        bn(
          $(() => {
            const u = o.get(c);
            u && (e(u), o.delete(c));
          }),
          0,
        ),
        a.apply(this, [c])
      );
    };
  });
  return (
    r.push(() => {
      n.FontFace = s;
    }),
    r.push(i),
    $(() => {
      r.forEach((a) => a());
    })
  );
}
function Hf(e) {
  const {
    doc: t,
    mirror: n,
    blockClass: r,
    blockSelector: o,
    unblockSelector: s,
    selectionCb: i,
  } = e;
  let a = !0;
  const c = $(() => {
    const u = t.getSelection();
    if (!u || (a && u?.isCollapsed)) return;
    a = u.isCollapsed || !1;
    const d = [],
      l = u.rangeCount || 0;
    for (let f = 0; f < l; f++) {
      const h = u.getRangeAt(f),
        {
          startContainer: p,
          startOffset: m,
          endContainer: _,
          endOffset: g,
        } = h;
      ge(p, r, o, s, !0) ||
        ge(_, r, o, s, !0) ||
        d.push({
          start: n.getId(p),
          startOffset: m,
          end: n.getId(_),
          endOffset: g,
        });
    }
    i({ ranges: d });
  });
  return (c(), he("selectionchange", c));
}
function Wf({ doc: e, customElementCb: t }) {
  const n = e.defaultView;
  return !n || !n.customElements
    ? () => {}
    : Mr(n.customElements, "define", function (o) {
        return function (s, i, a) {
          try {
            t({ define: { name: s } });
          } catch {}
          return o.apply(this, [s, i, a]);
        };
      });
}
function zf(e, t = {}) {
  const n = e.doc.defaultView;
  if (!n) return () => {};
  let r;
  e.recordDOM && (r = Ti(e, e.doc));
  const o = Of(e),
    s = Df(e),
    i = Ri(e),
    a = Lf(e, { win: n }),
    c = Pf(e),
    u = $f(e);
  let d = () => {},
    l = () => {},
    f = () => {},
    h = () => {};
  e.recordDOM &&
    ((d = Ff(e, { win: n })),
    (l = Mi(e, e.doc)),
    (f = Bf(e, { win: n })),
    e.collectFonts && (h = Uf(e)));
  const p = Hf(e),
    m = Wf(e),
    _ = [];
  for (const g of e.plugins) _.push(g.observer(g.callback, n, g.options));
  return $(() => {
    (it.forEach((g) => g.reset()),
      r?.disconnect(),
      o(),
      s(),
      i(),
      a(),
      c(),
      u(),
      d(),
      l(),
      f(),
      h(),
      p(),
      m(),
      _.forEach((g) => g()));
  });
}
function $t(e) {
  return typeof window[e] < "u";
}
function Ut(e) {
  return !!(
    typeof window[e] < "u" &&
    window[e].prototype &&
    "insertRule" in window[e].prototype &&
    "deleteRule" in window[e].prototype
  );
}
class ar {
  constructor(t) {
    ((this.generateIdFn = t),
      (this.iframeIdToRemoteIdMap = new WeakMap()),
      (this.iframeRemoteIdToIdMap = new WeakMap()));
  }
  getId(t, n, r, o) {
    const s = r || this.getIdToRemoteIdMap(t),
      i = o || this.getRemoteIdToIdMap(t);
    let a = s.get(n);
    return (a || ((a = this.generateIdFn()), s.set(n, a), i.set(a, n)), a);
  }
  getIds(t, n) {
    const r = this.getIdToRemoteIdMap(t),
      o = this.getRemoteIdToIdMap(t);
    return n.map((s) => this.getId(t, s, r, o));
  }
  getRemoteId(t, n, r) {
    const o = r || this.getRemoteIdToIdMap(t);
    if (typeof n != "number") return n;
    const s = o.get(n);
    return s || -1;
  }
  getRemoteIds(t, n) {
    const r = this.getRemoteIdToIdMap(t);
    return n.map((o) => this.getRemoteId(t, o, r));
  }
  reset(t) {
    if (!t) {
      ((this.iframeIdToRemoteIdMap = new WeakMap()),
        (this.iframeRemoteIdToIdMap = new WeakMap()));
      return;
    }
    (this.iframeIdToRemoteIdMap.delete(t),
      this.iframeRemoteIdToIdMap.delete(t));
  }
  getIdToRemoteIdMap(t) {
    let n = this.iframeIdToRemoteIdMap.get(t);
    return (n || ((n = new Map()), this.iframeIdToRemoteIdMap.set(t, n)), n);
  }
  getRemoteIdToIdMap(t) {
    let n = this.iframeRemoteIdToIdMap.get(t);
    return (n || ((n = new Map()), this.iframeRemoteIdToIdMap.set(t, n)), n);
  }
}
class jf {
  constructor() {
    ((this.crossOriginIframeMirror = new ar(Rr)),
      (this.crossOriginIframeRootIdMap = new WeakMap()));
  }
  addIframe() {}
  addLoadListener() {}
  attachIframe() {}
}
class qf {
  constructor(t) {
    ((this.iframes = new WeakMap()),
      (this.crossOriginIframeMap = new WeakMap()),
      (this.crossOriginIframeMirror = new ar(Rr)),
      (this.crossOriginIframeRootIdMap = new WeakMap()),
      (this.mutationCb = t.mutationCb),
      (this.wrappedEmit = t.wrappedEmit),
      (this.stylesheetManager = t.stylesheetManager),
      (this.recordCrossOriginIframes = t.recordCrossOriginIframes),
      (this.crossOriginIframeStyleMirror = new ar(
        this.stylesheetManager.styleMirror.generateId.bind(
          this.stylesheetManager.styleMirror,
        ),
      )),
      (this.mirror = t.mirror),
      this.recordCrossOriginIframes &&
        window.addEventListener("message", this.handleMessage.bind(this)));
  }
  addIframe(t) {
    (this.iframes.set(t, !0),
      t.contentWindow && this.crossOriginIframeMap.set(t.contentWindow, t));
  }
  addLoadListener(t) {
    this.loadListener = t;
  }
  attachIframe(t, n) {
    (this.mutationCb({
      adds: [{ parentId: this.mirror.getId(t), nextId: null, node: n }],
      removes: [],
      texts: [],
      attributes: [],
      isAttachIframe: !0,
    }),
      this.recordCrossOriginIframes &&
        t.contentWindow?.addEventListener(
          "message",
          this.handleMessage.bind(this),
        ),
      this.loadListener?.(t));
    const r = Or(t);
    r &&
      r.adoptedStyleSheets &&
      r.adoptedStyleSheets.length > 0 &&
      this.stylesheetManager.adoptStyleSheets(
        r.adoptedStyleSheets,
        this.mirror.getId(r),
      );
  }
  handleMessage(t) {
    const n = t;
    if (n.data.type !== "rrweb" || n.origin !== n.data.origin || !t.source)
      return;
    const o = this.crossOriginIframeMap.get(t.source);
    if (!o) return;
    const s = this.transformCrossOriginEvent(o, n.data.event);
    s && this.wrappedEmit(s, n.data.isCheckout);
  }
  transformCrossOriginEvent(t, n) {
    switch (n.type) {
      case N.FullSnapshot: {
        (this.crossOriginIframeMirror.reset(t),
          this.crossOriginIframeStyleMirror.reset(t),
          this.replaceIdOnNode(n.data.node, t));
        const r = n.data.node.id;
        return (
          this.crossOriginIframeRootIdMap.set(t, r),
          this.patchRootIdOnNode(n.data.node, r),
          {
            timestamp: n.timestamp,
            type: N.IncrementalSnapshot,
            data: {
              source: O.Mutation,
              adds: [
                {
                  parentId: this.mirror.getId(t),
                  nextId: null,
                  node: n.data.node,
                },
              ],
              removes: [],
              texts: [],
              attributes: [],
              isAttachIframe: !0,
            },
          }
        );
      }
      case N.Meta:
      case N.Load:
      case N.DomContentLoaded:
        return !1;
      case N.Plugin:
        return n;
      case N.Custom:
        return (
          this.replaceIds(n.data.payload, t, [
            "id",
            "parentId",
            "previousId",
            "nextId",
          ]),
          n
        );
      case N.IncrementalSnapshot:
        switch (n.data.source) {
          case O.Mutation:
            return (
              n.data.adds.forEach((r) => {
                (this.replaceIds(r, t, ["parentId", "nextId", "previousId"]),
                  this.replaceIdOnNode(r.node, t));
                const o = this.crossOriginIframeRootIdMap.get(t);
                o && this.patchRootIdOnNode(r.node, o);
              }),
              n.data.removes.forEach((r) => {
                this.replaceIds(r, t, ["parentId", "id"]);
              }),
              n.data.attributes.forEach((r) => {
                this.replaceIds(r, t, ["id"]);
              }),
              n.data.texts.forEach((r) => {
                this.replaceIds(r, t, ["id"]);
              }),
              n
            );
          case O.Drag:
          case O.TouchMove:
          case O.MouseMove:
            return (
              n.data.positions.forEach((r) => {
                this.replaceIds(r, t, ["id"]);
              }),
              n
            );
          case O.ViewportResize:
            return !1;
          case O.MediaInteraction:
          case O.MouseInteraction:
          case O.Scroll:
          case O.CanvasMutation:
          case O.Input:
            return (this.replaceIds(n.data, t, ["id"]), n);
          case O.StyleSheetRule:
          case O.StyleDeclaration:
            return (
              this.replaceIds(n.data, t, ["id"]),
              this.replaceStyleIds(n.data, t, ["styleId"]),
              n
            );
          case O.Font:
            return n;
          case O.Selection:
            return (
              n.data.ranges.forEach((r) => {
                this.replaceIds(r, t, ["start", "end"]);
              }),
              n
            );
          case O.AdoptedStyleSheet:
            return (
              this.replaceIds(n.data, t, ["id"]),
              this.replaceStyleIds(n.data, t, ["styleIds"]),
              n.data.styles?.forEach((r) => {
                this.replaceStyleIds(r, t, ["styleId"]);
              }),
              n
            );
        }
    }
    return !1;
  }
  replace(t, n, r, o) {
    for (const s of o)
      (!Array.isArray(n[s]) && typeof n[s] != "number") ||
        (Array.isArray(n[s])
          ? (n[s] = t.getIds(r, n[s]))
          : (n[s] = t.getId(r, n[s])));
    return n;
  }
  replaceIds(t, n, r) {
    return this.replace(this.crossOriginIframeMirror, t, n, r);
  }
  replaceStyleIds(t, n, r) {
    return this.replace(this.crossOriginIframeStyleMirror, t, n, r);
  }
  replaceIdOnNode(t, n) {
    (this.replaceIds(t, n, ["id", "rootId"]),
      "childNodes" in t &&
        t.childNodes.forEach((r) => {
          this.replaceIdOnNode(r, n);
        }));
  }
  patchRootIdOnNode(t, n) {
    (t.type !== ae.Document && !t.rootId && (t.rootId = n),
      "childNodes" in t &&
        t.childNodes.forEach((r) => {
          this.patchRootIdOnNode(r, n);
        }));
  }
}
class Vf {
  init() {}
  addShadowRoot() {}
  observeAttachShadow() {}
  reset() {}
}
class Gf {
  constructor(t) {
    ((this.shadowDoms = new WeakSet()),
      (this.restoreHandlers = []),
      (this.mutationCb = t.mutationCb),
      (this.scrollCb = t.scrollCb),
      (this.bypassOptions = t.bypassOptions),
      (this.mirror = t.mirror),
      this.init());
  }
  init() {
    (this.reset(), this.patchAttachShadow(Element, document));
  }
  addShadowRoot(t, n) {
    if (!bt(t) || this.shadowDoms.has(t)) return;
    (this.shadowDoms.add(t), this.bypassOptions.canvasManager.addShadowRoot(t));
    const r = Ti(
      {
        ...this.bypassOptions,
        doc: n,
        mutationCb: this.mutationCb,
        mirror: this.mirror,
        shadowDomManager: this,
      },
      t,
    );
    (this.restoreHandlers.push(() => r.disconnect()),
      this.restoreHandlers.push(
        Ri({
          ...this.bypassOptions,
          scrollCb: this.scrollCb,
          doc: t,
          mirror: this.mirror,
        }),
      ),
      bn(() => {
        (t.adoptedStyleSheets &&
          t.adoptedStyleSheets.length > 0 &&
          this.bypassOptions.stylesheetManager.adoptStyleSheets(
            t.adoptedStyleSheets,
            this.mirror.getId(t.host),
          ),
          this.restoreHandlers.push(
            Mi(
              {
                mirror: this.mirror,
                stylesheetManager: this.bypassOptions.stylesheetManager,
              },
              t,
            ),
          ));
      }, 0));
  }
  observeAttachShadow(t) {
    const n = Or(t),
      r = Cf(t);
    !n || !r || this.patchAttachShadow(r.Element, n);
  }
  patchAttachShadow(t, n) {
    const r = this;
    this.restoreHandlers.push(
      Mr(t.prototype, "attachShadow", function (o) {
        return function (s) {
          const i = o.call(this, s);
          return (
            this.shadowRoot && Ci(this) && r.addShadowRoot(this.shadowRoot, n),
            i
          );
        };
      }),
    );
  }
  reset() {
    (this.restoreHandlers.forEach((t) => {
      try {
        t();
      } catch {}
    }),
      (this.restoreHandlers = []),
      (this.shadowDoms = new WeakSet()),
      this.bypassOptions.canvasManager.resetShadowRoots());
  }
}
var Xo = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  Yf = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var Ht = 0; Ht < Xo.length; Ht++) Yf[Xo.charCodeAt(Ht)] = Ht;
class Jo {
  reset() {}
  freeze() {}
  unfreeze() {}
  lock() {}
  unlock() {}
  snapshot() {}
  addWindow() {}
  addShadowRoot() {}
  resetShadowRoots() {}
}
class Kf {
  constructor(t) {
    ((this.trackedLinkElements = new WeakSet()),
      (this.styleMirror = new Sf()),
      (this.mutationCb = t.mutationCb),
      (this.adoptedStyleSheetCb = t.adoptedStyleSheetCb));
  }
  attachLinkElement(t, n) {
    ("_cssText" in n.attributes &&
      this.mutationCb({
        adds: [],
        removes: [],
        texts: [],
        attributes: [{ id: n.id, attributes: n.attributes }],
      }),
      this.trackLinkElement(t));
  }
  trackLinkElement(t) {
    this.trackedLinkElements.has(t) ||
      (this.trackedLinkElements.add(t), this.trackStylesheetInLinkElement(t));
  }
  adoptStyleSheets(t, n) {
    if (t.length === 0) return;
    const r = { id: n, styleIds: [] },
      o = [];
    for (const s of t) {
      let i;
      (this.styleMirror.has(s)
        ? (i = this.styleMirror.getId(s))
        : ((i = this.styleMirror.add(s)),
          o.push({
            styleId: i,
            rules: Array.from(s.rules || CSSRule, (a, c) => ({
              rule: li(a),
              index: c,
            })),
          })),
        r.styleIds.push(i));
    }
    (o.length > 0 && (r.styles = o), this.adoptedStyleSheetCb(r));
  }
  reset() {
    (this.styleMirror.reset(), (this.trackedLinkElements = new WeakSet()));
  }
  trackStylesheetInLinkElement(t) {}
}
class Xf {
  constructor() {
    ((this.nodeMap = new WeakMap()), (this.active = !1));
  }
  inOtherBuffer(t, n) {
    const r = this.nodeMap.get(t);
    return r && Array.from(r).some((o) => o !== n);
  }
  add(t, n) {
    (this.active ||
      ((this.active = !0),
      kf(() => {
        ((this.nodeMap = new WeakMap()), (this.active = !1));
      })),
      this.nodeMap.set(t, (this.nodeMap.get(t) || new Set()).add(n)));
  }
  destroy() {}
}
let se, ln;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    (document.body.appendChild(e),
      (Array.from = e.contentWindow?.Array.from || Array.from),
      document.body.removeChild(e));
  }
} catch {}
const be = Yd();
function Ae(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: n,
    checkoutEveryNth: r,
    blockClass: o = "rr-block",
    blockSelector: s = null,
    unblockSelector: i = null,
    ignoreClass: a = "rr-ignore",
    ignoreSelector: c = null,
    maskAllText: u = !1,
    maskTextClass: d = "rr-mask",
    unmaskTextClass: l = null,
    maskTextSelector: f = null,
    unmaskTextSelector: h = null,
    inlineStylesheet: p = !0,
    maskAllInputs: m,
    maskInputOptions: _,
    slimDOMOptions: g,
    maskAttributeFn: v,
    maskInputFn: M,
    maskTextFn: w,
    maxCanvasSize: I = null,
    packFn: S,
    sampling: C = {},
    dataURLOptions: x = {},
    mousemoveWait: y,
    recordDOM: k = !0,
    recordCanvas: F = !1,
    recordCrossOriginIframes: b = !1,
    recordAfter: A = e.recordAfter === "DOMContentLoaded"
      ? e.recordAfter
      : "load",
    userTriggeredOnInput: U = !1,
    collectFonts: j = !1,
    inlineImages: Q = !1,
    plugins: D,
    keepIframeSrcFn: q = () => !1,
    ignoreCSSAttributes: L = new Set([]),
    errorHandler: z,
    onMutation: ee,
    getCanvasManager: pe,
  } = e;
  Mf(z);
  const me = b ? window.parent === window : !0;
  let le = !1;
  if (!me)
    try {
      window.parent.document && (le = !1);
    } catch {
      le = !0;
    }
  if (me && !t) throw new Error("emit function is required");
  if (!me && !le) return () => {};
  (y !== void 0 && C.mousemove === void 0 && (C.mousemove = y), be.reset());
  const ye =
      m === !0
        ? {
            color: !0,
            date: !0,
            "datetime-local": !0,
            email: !0,
            month: !0,
            number: !0,
            range: !0,
            search: !0,
            tel: !0,
            text: !0,
            time: !0,
            url: !0,
            week: !0,
            textarea: !0,
            select: !0,
            radio: !0,
            checkbox: !0,
          }
        : _ !== void 0
          ? _
          : {},
    xe =
      g === !0 || g === "all"
        ? {
            script: !0,
            comment: !0,
            headFavicon: !0,
            headWhitespace: !0,
            headMetaSocial: !0,
            headMetaRobots: !0,
            headMetaHttpEquiv: !0,
            headMetaVerification: !0,
            headMetaAuthorship: g === "all",
            headMetaDescKeywords: g === "all",
          }
        : g || {};
  bf();
  let Je,
    Ze = 0;
  const mt = (H) => {
    for (const ve of D || []) ve.eventProcessor && (H = ve.eventProcessor(H));
    return (S && !le && (H = S(H)), H);
  };
  se = (H, ve) => {
    const B = H;
    if (
      ((B.timestamp = an()),
      it[0]?.isFrozen() &&
        B.type !== N.FullSnapshot &&
        !(B.type === N.IncrementalSnapshot && B.data.source === O.Mutation) &&
        it.forEach((de) => de.unfreeze()),
      me)
    )
      t?.(mt(B), ve);
    else if (le) {
      const de = {
        type: "rrweb",
        event: mt(B),
        origin: window.location.origin,
        isCheckout: ve,
      };
      window.parent.postMessage(de, "*");
    }
    if (B.type === N.FullSnapshot) ((Je = B), (Ze = 0));
    else if (B.type === N.IncrementalSnapshot) {
      if (B.data.source === O.Mutation && B.data.isAttachIframe) return;
      Ze++;
      const de = r && Ze >= r,
        W = n && Je && B.timestamp - Je.timestamp > n;
      (de || W) && kn(!0);
    }
  };
  const Te = (H) => {
      se({ type: N.IncrementalSnapshot, data: { source: O.Mutation, ...H } });
    },
    te = (H) =>
      se({ type: N.IncrementalSnapshot, data: { source: O.Scroll, ...H } }),
    ue = (H) =>
      se({
        type: N.IncrementalSnapshot,
        data: { source: O.CanvasMutation, ...H },
      }),
    ke = (H) =>
      se({
        type: N.IncrementalSnapshot,
        data: { source: O.AdoptedStyleSheet, ...H },
      }),
    ie = new Kf({ mutationCb: Te, adoptedStyleSheetCb: ke }),
    ce =
      typeof __RRWEB_EXCLUDE_IFRAME__ == "boolean" && __RRWEB_EXCLUDE_IFRAME__
        ? new jf()
        : new qf({
            mirror: be,
            mutationCb: Te,
            stylesheetManager: ie,
            recordCrossOriginIframes: b,
            wrappedEmit: se,
          });
  for (const H of D || [])
    H.getMirror &&
      H.getMirror({
        nodeMirror: be,
        crossOriginIframeMirror: ce.crossOriginIframeMirror,
        crossOriginIframeStyleMirror: ce.crossOriginIframeStyleMirror,
      });
  const Ie = new Xf(),
    We = Zf(pe, {
      mirror: be,
      win: window,
      mutationCb: (H) =>
        se({
          type: N.IncrementalSnapshot,
          data: { source: O.CanvasMutation, ...H },
        }),
      recordCanvas: F,
      blockClass: o,
      blockSelector: s,
      unblockSelector: i,
      maxCanvasSize: I,
      sampling: C.canvas,
      dataURLOptions: x,
      errorHandler: z,
    }),
    Qe =
      typeof __RRWEB_EXCLUDE_SHADOW_DOM__ == "boolean" &&
      __RRWEB_EXCLUDE_SHADOW_DOM__
        ? new Vf()
        : new Gf({
            mutationCb: Te,
            scrollCb: te,
            bypassOptions: {
              onMutation: ee,
              blockClass: o,
              blockSelector: s,
              unblockSelector: i,
              maskAllText: u,
              maskTextClass: d,
              unmaskTextClass: l,
              maskTextSelector: f,
              unmaskTextSelector: h,
              inlineStylesheet: p,
              maskInputOptions: ye,
              dataURLOptions: x,
              maskAttributeFn: v,
              maskTextFn: w,
              maskInputFn: M,
              recordCanvas: F,
              inlineImages: Q,
              sampling: C,
              slimDOMOptions: xe,
              iframeManager: ce,
              stylesheetManager: ie,
              canvasManager: We,
              keepIframeSrcFn: q,
              processedNodeManager: Ie,
            },
            mirror: be,
          }),
    kn = (H = !1) => {
      if (!k) return;
      (se(
        {
          type: N.Meta,
          data: { href: window.location.href, width: bi(), height: vi() },
        },
        H,
      ),
        ie.reset(),
        Qe.init(),
        it.forEach((B) => B.lock()));
      const ve = yf(document, {
        mirror: be,
        blockClass: o,
        blockSelector: s,
        unblockSelector: i,
        maskAllText: u,
        maskTextClass: d,
        unmaskTextClass: l,
        maskTextSelector: f,
        unmaskTextSelector: h,
        inlineStylesheet: p,
        maskAllInputs: ye,
        maskAttributeFn: v,
        maskInputFn: M,
        maskTextFn: w,
        slimDOM: xe,
        dataURLOptions: x,
        recordCanvas: F,
        inlineImages: Q,
        onSerialize: (B) => {
          (wi(B, be) && ce.addIframe(B),
            ki(B, be) && ie.trackLinkElement(B),
            sr(B) && Qe.addShadowRoot(B.shadowRoot, document));
        },
        onIframeLoad: (B, de) => {
          (ce.attachIframe(B, de),
            B.contentWindow && We.addWindow(B.contentWindow),
            Qe.observeAttachShadow(B));
        },
        onStylesheetLoad: (B, de) => {
          ie.attachLinkElement(B, de);
        },
        onBlockedImageLoad: (B, de, { width: W, height: gt }) => {
          Te({
            adds: [],
            removes: [],
            texts: [],
            attributes: [
              {
                id: de.id,
                attributes: { style: { width: `${W}px`, height: `${gt}px` } },
              },
            ],
          });
        },
        keepIframeSrcFn: q,
      });
      ve &&
        (se({
          type: N.FullSnapshot,
          data: { node: ve, initialOffset: yi(window) },
        }),
        it.forEach((B) => B.unlock()),
        document.adoptedStyleSheets &&
          document.adoptedStyleSheets.length > 0 &&
          ie.adoptStyleSheets(document.adoptedStyleSheets, be.getId(document)));
    };
  ln = kn;
  try {
    const H = [],
      ve = (de) =>
        $(zf)(
          {
            onMutation: ee,
            mutationCb: Te,
            mousemoveCb: (W, gt) =>
              se({
                type: N.IncrementalSnapshot,
                data: { source: gt, positions: W },
              }),
            mouseInteractionCb: (W) =>
              se({
                type: N.IncrementalSnapshot,
                data: { source: O.MouseInteraction, ...W },
              }),
            scrollCb: te,
            viewportResizeCb: (W) =>
              se({
                type: N.IncrementalSnapshot,
                data: { source: O.ViewportResize, ...W },
              }),
            inputCb: (W) =>
              se({
                type: N.IncrementalSnapshot,
                data: { source: O.Input, ...W },
              }),
            mediaInteractionCb: (W) =>
              se({
                type: N.IncrementalSnapshot,
                data: { source: O.MediaInteraction, ...W },
              }),
            styleSheetRuleCb: (W) =>
              se({
                type: N.IncrementalSnapshot,
                data: { source: O.StyleSheetRule, ...W },
              }),
            styleDeclarationCb: (W) =>
              se({
                type: N.IncrementalSnapshot,
                data: { source: O.StyleDeclaration, ...W },
              }),
            canvasMutationCb: ue,
            fontCb: (W) =>
              se({
                type: N.IncrementalSnapshot,
                data: { source: O.Font, ...W },
              }),
            selectionCb: (W) => {
              se({
                type: N.IncrementalSnapshot,
                data: { source: O.Selection, ...W },
              });
            },
            customElementCb: (W) => {
              se({
                type: N.IncrementalSnapshot,
                data: { source: O.CustomElement, ...W },
              });
            },
            blockClass: o,
            ignoreClass: a,
            ignoreSelector: c,
            maskAllText: u,
            maskTextClass: d,
            unmaskTextClass: l,
            maskTextSelector: f,
            unmaskTextSelector: h,
            maskInputOptions: ye,
            inlineStylesheet: p,
            sampling: C,
            recordDOM: k,
            recordCanvas: F,
            inlineImages: Q,
            userTriggeredOnInput: U,
            collectFonts: j,
            doc: de,
            maskAttributeFn: v,
            maskInputFn: M,
            maskTextFn: w,
            keepIframeSrcFn: q,
            blockSelector: s,
            unblockSelector: i,
            slimDOMOptions: xe,
            dataURLOptions: x,
            mirror: be,
            iframeManager: ce,
            stylesheetManager: ie,
            shadowDomManager: Qe,
            processedNodeManager: Ie,
            canvasManager: We,
            ignoreCSSAttributes: L,
            plugins:
              D?.filter((W) => W.observer)?.map((W) => ({
                observer: W.observer,
                options: W.options,
                callback: (gt) =>
                  se({ type: N.Plugin, data: { plugin: W.name, payload: gt } }),
              })) || [],
          },
          {},
        );
    ce.addLoadListener((de) => {
      try {
        H.push(ve(de.contentDocument));
      } catch {}
    });
    const B = () => {
      (kn(), H.push(ve(document)));
    };
    return (
      document.readyState === "interactive" ||
      document.readyState === "complete"
        ? B()
        : (H.push(
            he("DOMContentLoaded", () => {
              (se({ type: N.DomContentLoaded, data: {} }),
                A === "DOMContentLoaded" && B());
            }),
          ),
          H.push(
            he(
              "load",
              () => {
                (se({ type: N.Load, data: {} }), A === "load" && B());
              },
              window,
            ),
          )),
      () => {
        (H.forEach((de) => de()), Ie.destroy(), (ln = void 0), Af());
      }
    );
  } catch {}
}
function Jf(e) {
  if (!ln) throw new Error("please take full snapshot after start recording");
  ln(e);
}
Ae.mirror = be;
Ae.takeFullSnapshot = Jf;
function Zf(e, t) {
  try {
    return e ? e(t) : new Jo();
  } catch {
    return new Jo();
  }
}
var Zo;
(function (e) {
  ((e[(e.NotStarted = 0)] = "NotStarted"),
    (e[(e.Running = 1)] = "Running"),
    (e[(e.Stopped = 2)] = "Stopped"));
})(Zo || (Zo = {}));
const Qf = 3,
  eh = 5;
function Dr(e) {
  return e > 9999999999 ? e : e * 1e3;
}
function Nn(e) {
  return e > 9999999999 ? e / 1e3 : e;
}
function Dt(e, t) {
  t.category !== "sentry.transaction" &&
    (["ui.click", "ui.input"].includes(t.category)
      ? e.triggerUserActivity()
      : e.checkAndHandleExpiredSession(),
    e.addUpdate(
      () => (
        e.throttledAddEvent({
          type: N.Custom,
          timestamp: (t.timestamp || 0) * 1e3,
          data: { tag: "breadcrumb", payload: xs(t, 10, 1e3) },
        }),
        t.category === "console"
      ),
    ));
}
const th = "button,a";
function Ai(e) {
  return e.closest(th) || e;
}
function Oi(e) {
  const t = Di(e);
  return !t || !(t instanceof Element) ? t : Ai(t);
}
function Di(e) {
  return nh(e) ? e.target : e;
}
function nh(e) {
  return typeof e == "object" && !!e && "target" in e;
}
let Fe;
function rh(e) {
  return (
    Fe || ((Fe = []), oh()),
    Fe.push(e),
    () => {
      const t = Fe ? Fe.indexOf(e) : -1;
      t > -1 && Fe.splice(t, 1);
    }
  );
}
function oh() {
  Ee(X, "open", function (e) {
    return function (...t) {
      if (Fe)
        try {
          Fe.forEach((n) => n());
        } catch {}
      return e.apply(X, t);
    };
  });
}
const sh = new Set([
  O.Mutation,
  O.StyleSheetRule,
  O.StyleDeclaration,
  O.AdoptedStyleSheet,
  O.CanvasMutation,
  O.Selection,
  O.MediaInteraction,
]);
function ih(e, t, n) {
  e.handleClick(t, n);
}
class ah {
  constructor(t, n, r = Dt) {
    ((this._lastMutation = 0),
      (this._lastScroll = 0),
      (this._clicks = []),
      (this._timeout = n.timeout / 1e3),
      (this._threshold = n.threshold / 1e3),
      (this._scrollTimeout = n.scrollTimeout / 1e3),
      (this._replay = t),
      (this._ignoreSelector = n.ignoreSelector),
      (this._addBreadcrumbEvent = r));
  }
  addListeners() {
    const t = rh(() => {
      this._lastMutation = Qo();
    });
    this._teardown = () => {
      (t(),
        (this._clicks = []),
        (this._lastMutation = 0),
        (this._lastScroll = 0));
    };
  }
  removeListeners() {
    (this._teardown && this._teardown(),
      this._checkClickTimeout && clearTimeout(this._checkClickTimeout));
  }
  handleClick(t, n) {
    if (lh(n, this._ignoreSelector) || !uh(t)) return;
    const r = {
      timestamp: Nn(t.timestamp),
      clickBreadcrumb: t,
      clickCount: 0,
      node: n,
    };
    this._clicks.some(
      (o) => o.node === r.node && Math.abs(o.timestamp - r.timestamp) < 1,
    ) ||
      (this._clicks.push(r),
      this._clicks.length === 1 && this._scheduleCheckClicks());
  }
  registerMutation(t = Date.now()) {
    this._lastMutation = Nn(t);
  }
  registerScroll(t = Date.now()) {
    this._lastScroll = Nn(t);
  }
  registerClick(t) {
    const n = Ai(t);
    this._handleMultiClick(n);
  }
  _handleMultiClick(t) {
    this._getClicks(t).forEach((n) => {
      n.clickCount++;
    });
  }
  _getClicks(t) {
    return this._clicks.filter((n) => n.node === t);
  }
  _checkClicks() {
    const t = [],
      n = Qo();
    this._clicks.forEach((r) => {
      (!r.mutationAfter &&
        this._lastMutation &&
        (r.mutationAfter =
          r.timestamp <= this._lastMutation
            ? this._lastMutation - r.timestamp
            : void 0),
        !r.scrollAfter &&
          this._lastScroll &&
          (r.scrollAfter =
            r.timestamp <= this._lastScroll
              ? this._lastScroll - r.timestamp
              : void 0),
        r.timestamp + this._timeout <= n && t.push(r));
    });
    for (const r of t) {
      const o = this._clicks.indexOf(r);
      o > -1 && (this._generateBreadcrumbs(r), this._clicks.splice(o, 1));
    }
    this._clicks.length && this._scheduleCheckClicks();
  }
  _generateBreadcrumbs(t) {
    const n = this._replay,
      r = t.scrollAfter && t.scrollAfter <= this._scrollTimeout,
      o = t.mutationAfter && t.mutationAfter <= this._threshold,
      s = !r && !o,
      { clickCount: i, clickBreadcrumb: a } = t;
    if (s) {
      const c = Math.min(t.mutationAfter || this._timeout, this._timeout) * 1e3,
        u = c < this._timeout * 1e3 ? "mutation" : "timeout",
        d = {
          type: "default",
          message: a.message,
          timestamp: a.timestamp,
          category: "ui.slowClickDetected",
          data: {
            ...a.data,
            url: X.location.href,
            route: n.getCurrentRoute(),
            timeAfterClickMs: c,
            endReason: u,
            clickCount: i || 1,
          },
        };
      this._addBreadcrumbEvent(n, d);
      return;
    }
    if (i > 1) {
      const c = {
        type: "default",
        message: a.message,
        timestamp: a.timestamp,
        category: "ui.multiClick",
        data: {
          ...a.data,
          url: X.location.href,
          route: n.getCurrentRoute(),
          clickCount: i,
          metric: !0,
        },
      };
      this._addBreadcrumbEvent(n, c);
    }
  }
  _scheduleCheckClicks() {
    (this._checkClickTimeout && clearTimeout(this._checkClickTimeout),
      (this._checkClickTimeout = At(() => this._checkClicks(), 1e3)));
  }
}
const ch = ["A", "BUTTON", "INPUT"];
function lh(e, t) {
  return !!(
    !ch.includes(e.tagName) ||
    (e.tagName === "INPUT" &&
      !["submit", "button"].includes(e.getAttribute("type") || "")) ||
    (e.tagName === "A" &&
      (e.hasAttribute("download") ||
        (e.hasAttribute("target") && e.getAttribute("target") !== "_self"))) ||
    (t && e.matches(t))
  );
}
function uh(e) {
  return !!(e.data && typeof e.data.nodeId == "number" && e.timestamp);
}
function Qo() {
  return Date.now() / 1e3;
}
function dh(e, t) {
  try {
    if (!fh(t)) return;
    const { source: n } = t.data;
    if (
      (sh.has(n) && e.registerMutation(t.timestamp),
      n === O.Scroll && e.registerScroll(t.timestamp),
      hh(t))
    ) {
      const { type: r, id: o } = t.data,
        s = Ae.mirror.getNode(o);
      s instanceof HTMLElement && r === fe.Click && e.registerClick(s);
    }
  } catch {}
}
function fh(e) {
  return e.type === Qf;
}
function hh(e) {
  return e.data.source === O.MouseInteraction;
}
function Ce(e) {
  return { timestamp: Date.now() / 1e3, type: "default", ...e };
}
var Lr = ((e) => (
  (e[(e.Document = 0)] = "Document"),
  (e[(e.DocumentType = 1)] = "DocumentType"),
  (e[(e.Element = 2)] = "Element"),
  (e[(e.Text = 3)] = "Text"),
  (e[(e.CDATA = 4)] = "CDATA"),
  (e[(e.Comment = 5)] = "Comment"),
  e
))(Lr || {});
const ph = new Set([
  "id",
  "class",
  "aria-label",
  "role",
  "name",
  "alt",
  "title",
  "data-test-id",
  "data-testid",
  "disabled",
  "aria-disabled",
  "data-sentry-component",
]);
function mh(e) {
  const t = {};
  !e["data-sentry-component"] &&
    e["data-sentry-element"] &&
    (e["data-sentry-component"] = e["data-sentry-element"]);
  for (const n in e)
    if (ph.has(n)) {
      let r = n;
      ((n === "data-testid" || n === "data-test-id") && (r = "testId"),
        (t[r] = e[n]));
    }
  return t;
}
const gh = (e) => (t) => {
  if (!e.isEnabled()) return;
  const n = _h(t);
  if (!n) return;
  const r = t.name === "click",
    o = r ? t.event : void 0;
  (r &&
    e.clickDetector &&
    o?.target &&
    !o.altKey &&
    !o.metaKey &&
    !o.ctrlKey &&
    !o.shiftKey &&
    ih(e.clickDetector, n, Oi(t.event)),
    Dt(e, n));
};
function Li(e, t) {
  const n = Ae.mirror.getId(e),
    r = n && Ae.mirror.getNode(n),
    o = r && Ae.mirror.getMeta(r),
    s = o && vh(o) ? o : null;
  return {
    message: t,
    data: s
      ? {
          nodeId: n,
          node: {
            id: n,
            tagName: s.tagName,
            textContent: Array.from(s.childNodes)
              .map((i) => i.type === Lr.Text && i.textContent)
              .filter(Boolean)
              .map((i) => i.trim())
              .join(""),
            attributes: mh(s.attributes),
          },
        }
      : {},
  };
}
function _h(e) {
  const { target: t, message: n } = yh(e);
  return Ce({ category: `ui.${e.name}`, ...Li(t, n) });
}
function yh(e) {
  const t = e.name === "click";
  let n,
    r = null;
  try {
    ((r = t ? Oi(e.event) : Di(e.event)),
      (n = mr(r, { maxStringLength: 200 }) || "<unknown>"));
  } catch {
    n = "<unknown>";
  }
  return { target: r, message: n };
}
function vh(e) {
  return e.type === Lr.Element;
}
function bh(e, t) {
  if (!e.isEnabled()) return;
  e.updateUserActivity();
  const n = Sh(t);
  n && Dt(e, n);
}
function Sh(e) {
  const {
    metaKey: t,
    shiftKey: n,
    ctrlKey: r,
    altKey: o,
    key: s,
    target: i,
  } = e;
  if (!i || Eh(i) || !s) return null;
  const a = t || r || o,
    c = s.length === 1;
  if (!a && c) return null;
  const u = mr(i, { maxStringLength: 200 }) || "<unknown>",
    d = Li(i, u);
  return Ce({
    category: "ui.keyDown",
    message: u,
    data: { ...d.data, metaKey: t, shiftKey: n, ctrlKey: r, altKey: o, key: s },
  });
}
function Eh(e) {
  return (
    e.tagName === "INPUT" || e.tagName === "TEXTAREA" || e.isContentEditable
  );
}
const wh = { resource: Th, paint: Ch, navigation: xh };
function Wt(e, t) {
  return ({ metric: n }) => {
    t.replayPerformanceEntries.push(e(n));
  };
}
function kh(e) {
  return e.map(Ih).filter(Boolean);
}
function Ih(e) {
  const t = wh[e.entryType];
  return t ? t(e) : null;
}
function pt(e) {
  return ((Ts() || X.performance.timeOrigin) + e) / 1e3;
}
function Ch(e) {
  const { duration: t, entryType: n, name: r, startTime: o } = e,
    s = pt(o);
  return { type: n, name: r, start: s, end: s + t, data: void 0 };
}
function xh(e) {
  const {
    entryType: t,
    name: n,
    decodedBodySize: r,
    duration: o,
    domComplete: s,
    encodedBodySize: i,
    domContentLoadedEventStart: a,
    domContentLoadedEventEnd: c,
    domInteractive: u,
    loadEventStart: d,
    loadEventEnd: l,
    redirectCount: f,
    startTime: h,
    transferSize: p,
    type: m,
  } = e;
  return o === 0
    ? null
    : {
        type: `${t}.${m}`,
        start: pt(h),
        end: pt(s),
        name: n,
        data: {
          size: p,
          decodedBodySize: r,
          encodedBodySize: i,
          duration: o,
          domInteractive: u,
          domContentLoadedEventStart: a,
          domContentLoadedEventEnd: c,
          loadEventStart: d,
          loadEventEnd: l,
          domComplete: s,
          redirectCount: f,
        },
      };
}
function Th(e) {
  const {
    entryType: t,
    initiatorType: n,
    name: r,
    responseEnd: o,
    startTime: s,
    decodedBodySize: i,
    encodedBodySize: a,
    responseStatus: c,
    transferSize: u,
  } = e;
  return ["fetch", "xmlhttprequest"].includes(n)
    ? null
    : {
        type: `${t}.${n}`,
        start: pt(s),
        end: pt(o),
        name: r,
        data: {
          size: u,
          statusCode: c,
          decodedBodySize: i,
          encodedBodySize: a,
        },
      };
}
function Rh(e) {
  const t = e.entries[e.entries.length - 1],
    n = t?.element ? [t.element] : void 0;
  return Sn(e, "largest-contentful-paint", n);
}
function Mh(e) {
  return e.sources !== void 0;
}
function Ah(e) {
  const t = [],
    n = [];
  for (const r of e.entries)
    if (Mh(r)) {
      const o = [];
      for (const s of r.sources)
        if (s.node) {
          n.push(s.node);
          const i = Ae.mirror.getId(s.node);
          i && o.push(i);
        }
      t.push({ value: r.value, nodeIds: o.length ? o : void 0 });
    }
  return Sn(e, "cumulative-layout-shift", n, t);
}
function Oh(e) {
  const t = e.entries[e.entries.length - 1],
    n = t?.target ? [t.target] : void 0;
  return Sn(e, "first-input-delay", n);
}
function Dh(e) {
  const t = e.entries[e.entries.length - 1],
    n = t?.target ? [t.target] : void 0;
  return Sn(e, "interaction-to-next-paint", n);
}
function Sn(e, t, n, r) {
  const o = e.value,
    s = e.rating,
    i = pt(o);
  return {
    type: "web-vital",
    name: t,
    start: i,
    end: i,
    data: {
      value: o,
      size: o,
      rating: s,
      nodeIds: n ? n.map((a) => Ae.mirror.getId(a)) : void 0,
      attributions: r,
    },
  };
}
function Lh(e) {
  function t(o) {
    e.performanceEntries.includes(o) || e.performanceEntries.push(o);
  }
  function n({ entries: o }) {
    o.forEach(t);
  }
  const r = [];
  return (
    ["navigation", "paint", "resource"].forEach((o) => {
      r.push(Fa(o, n));
    }),
    r.push(Ba(Wt(Rh, e)), $a(Wt(Ah, e)), Ua(Wt(Oh, e)), Ha(Wt(Dh, e))),
    () => {
      r.forEach((o) => o());
    }
  );
}
const T = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__,
  Nh =
    'var t=Uint8Array,n=Uint16Array,r=Int32Array,e=new t([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),i=new t([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),s=new t([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),a=function(t,e){for(var i=new n(31),s=0;s<31;++s)i[s]=e+=1<<t[s-1];var a=new r(i[30]);for(s=1;s<30;++s)for(var o=i[s];o<i[s+1];++o)a[o]=o-i[s]<<5|s;return{b:i,r:a}},o=a(e,2),h=o.b,f=o.r;h[28]=258,f[258]=28;for(var l=a(i,0).r,u=new n(32768),c=0;c<32768;++c){var v=(43690&c)>>1|(21845&c)<<1;v=(61680&(v=(52428&v)>>2|(13107&v)<<2))>>4|(3855&v)<<4,u[c]=((65280&v)>>8|(255&v)<<8)>>1}var d=function(t,r,e){for(var i=t.length,s=0,a=new n(r);s<i;++s)t[s]&&++a[t[s]-1];var o,h=new n(r);for(s=1;s<r;++s)h[s]=h[s-1]+a[s-1]<<1;if(e){o=new n(1<<r);var f=15-r;for(s=0;s<i;++s)if(t[s])for(var l=s<<4|t[s],c=r-t[s],v=h[t[s]-1]++<<c,d=v|(1<<c)-1;v<=d;++v)o[u[v]>>f]=l}else for(o=new n(i),s=0;s<i;++s)t[s]&&(o[s]=u[h[t[s]-1]++]>>15-t[s]);return o},p=new t(288);for(c=0;c<144;++c)p[c]=8;for(c=144;c<256;++c)p[c]=9;for(c=256;c<280;++c)p[c]=7;for(c=280;c<288;++c)p[c]=8;var g=new t(32);for(c=0;c<32;++c)g[c]=5;var w=d(p,9,0),y=d(g,5,0),m=function(t){return(t+7)/8|0},b=function(n,r,e){return(null==e||e>n.length)&&(e=n.length),new t(n.subarray(r,e))},M=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],E=function(t,n,r){var e=new Error(n||M[t]);if(e.code=t,Error.captureStackTrace&&Error.captureStackTrace(e,E),!r)throw e;return e},z=function(t,n,r){r<<=7&n;var e=n/8|0;t[e]|=r,t[e+1]|=r>>8},_=function(t,n,r){r<<=7&n;var e=n/8|0;t[e]|=r,t[e+1]|=r>>8,t[e+2]|=r>>16},x=function(r,e){for(var i=[],s=0;s<r.length;++s)r[s]&&i.push({s:s,f:r[s]});var a=i.length,o=i.slice();if(!a)return{t:F,l:0};if(1==a){var h=new t(i[0].s+1);return h[i[0].s]=1,{t:h,l:1}}i.sort(function(t,n){return t.f-n.f}),i.push({s:-1,f:25001});var f=i[0],l=i[1],u=0,c=1,v=2;for(i[0]={s:-1,f:f.f+l.f,l:f,r:l};c!=a-1;)f=i[i[u].f<i[v].f?u++:v++],l=i[u!=c&&i[u].f<i[v].f?u++:v++],i[c++]={s:-1,f:f.f+l.f,l:f,r:l};var d=o[0].s;for(s=1;s<a;++s)o[s].s>d&&(d=o[s].s);var p=new n(d+1),g=A(i[c-1],p,0);if(g>e){s=0;var w=0,y=g-e,m=1<<y;for(o.sort(function(t,n){return p[n.s]-p[t.s]||t.f-n.f});s<a;++s){var b=o[s].s;if(!(p[b]>e))break;w+=m-(1<<g-p[b]),p[b]=e}for(w>>=y;w>0;){var M=o[s].s;p[M]<e?w-=1<<e-p[M]++-1:++s}for(;s>=0&&w;--s){var E=o[s].s;p[E]==e&&(--p[E],++w)}g=e}return{t:new t(p),l:g}},A=function(t,n,r){return-1==t.s?Math.max(A(t.l,n,r+1),A(t.r,n,r+1)):n[t.s]=r},D=function(t){for(var r=t.length;r&&!t[--r];);for(var e=new n(++r),i=0,s=t[0],a=1,o=function(t){e[i++]=t},h=1;h<=r;++h)if(t[h]==s&&h!=r)++a;else{if(!s&&a>2){for(;a>138;a-=138)o(32754);a>2&&(o(a>10?a-11<<5|28690:a-3<<5|12305),a=0)}else if(a>3){for(o(s),--a;a>6;a-=6)o(8304);a>2&&(o(a-3<<5|8208),a=0)}for(;a--;)o(s);a=1,s=t[h]}return{c:e.subarray(0,i),n:r}},T=function(t,n){for(var r=0,e=0;e<n.length;++e)r+=t[e]*n[e];return r},k=function(t,n,r){var e=r.length,i=m(n+2);t[i]=255&e,t[i+1]=e>>8,t[i+2]=255^t[i],t[i+3]=255^t[i+1];for(var s=0;s<e;++s)t[i+s+4]=r[s];return 8*(i+4+e)},U=function(t,r,a,o,h,f,l,u,c,v,m){z(r,m++,a),++h[256];for(var b=x(h,15),M=b.t,E=b.l,A=x(f,15),U=A.t,C=A.l,F=D(M),I=F.c,S=F.n,L=D(U),O=L.c,j=L.n,q=new n(19),B=0;B<I.length;++B)++q[31&I[B]];for(B=0;B<O.length;++B)++q[31&O[B]];for(var G=x(q,7),H=G.t,J=G.l,K=19;K>4&&!H[s[K-1]];--K);var N,P,Q,R,V=v+5<<3,W=T(h,p)+T(f,g)+l,X=T(h,M)+T(f,U)+l+14+3*K+T(q,H)+2*q[16]+3*q[17]+7*q[18];if(c>=0&&V<=W&&V<=X)return k(r,m,t.subarray(c,c+v));if(z(r,m,1+(X<W)),m+=2,X<W){N=d(M,E,0),P=M,Q=d(U,C,0),R=U;var Y=d(H,J,0);z(r,m,S-257),z(r,m+5,j-1),z(r,m+10,K-4),m+=14;for(B=0;B<K;++B)z(r,m+3*B,H[s[B]]);m+=3*K;for(var Z=[I,O],$=0;$<2;++$){var tt=Z[$];for(B=0;B<tt.length;++B){var nt=31&tt[B];z(r,m,Y[nt]),m+=H[nt],nt>15&&(z(r,m,tt[B]>>5&127),m+=tt[B]>>12)}}}else N=w,P=p,Q=y,R=g;for(B=0;B<u;++B){var rt=o[B];if(rt>255){_(r,m,N[(nt=rt>>18&31)+257]),m+=P[nt+257],nt>7&&(z(r,m,rt>>23&31),m+=e[nt]);var et=31&rt;_(r,m,Q[et]),m+=R[et],et>3&&(_(r,m,rt>>5&8191),m+=i[et])}else _(r,m,N[rt]),m+=P[rt]}return _(r,m,N[256]),m+P[256]},C=new r([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),F=new t(0),I=function(){for(var t=new Int32Array(256),n=0;n<256;++n){for(var r=n,e=9;--e;)r=(1&r&&-306674912)^r>>>1;t[n]=r}return t}(),S=function(){var t=1,n=0;return{p:function(r){for(var e=t,i=n,s=0|r.length,a=0;a!=s;){for(var o=Math.min(a+2655,s);a<o;++a)i+=e+=r[a];e=(65535&e)+15*(e>>16),i=(65535&i)+15*(i>>16)}t=e,n=i},d:function(){return(255&(t%=65521))<<24|(65280&t)<<8|(255&(n%=65521))<<8|n>>8}}},L=function(s,a,o,h,u){if(!u&&(u={l:1},a.dictionary)){var c=a.dictionary.subarray(-32768),v=new t(c.length+s.length);v.set(c),v.set(s,c.length),s=v,u.w=c.length}return function(s,a,o,h,u,c){var v=c.z||s.length,d=new t(h+v+5*(1+Math.ceil(v/7e3))+u),p=d.subarray(h,d.length-u),g=c.l,w=7&(c.r||0);if(a){w&&(p[0]=c.r>>3);for(var y=C[a-1],M=y>>13,E=8191&y,z=(1<<o)-1,_=c.p||new n(32768),x=c.h||new n(z+1),A=Math.ceil(o/3),D=2*A,T=function(t){return(s[t]^s[t+1]<<A^s[t+2]<<D)&z},F=new r(25e3),I=new n(288),S=new n(32),L=0,O=0,j=c.i||0,q=0,B=c.w||0,G=0;j+2<v;++j){var H=T(j),J=32767&j,K=x[H];if(_[J]=K,x[H]=J,B<=j){var N=v-j;if((L>7e3||q>24576)&&(N>423||!g)){w=U(s,p,0,F,I,S,O,q,G,j-G,w),q=L=O=0,G=j;for(var P=0;P<286;++P)I[P]=0;for(P=0;P<30;++P)S[P]=0}var Q=2,R=0,V=E,W=J-K&32767;if(N>2&&H==T(j-W))for(var X=Math.min(M,N)-1,Y=Math.min(32767,j),Z=Math.min(258,N);W<=Y&&--V&&J!=K;){if(s[j+Q]==s[j+Q-W]){for(var $=0;$<Z&&s[j+$]==s[j+$-W];++$);if($>Q){if(Q=$,R=W,$>X)break;var tt=Math.min(W,$-2),nt=0;for(P=0;P<tt;++P){var rt=j-W+P&32767,et=rt-_[rt]&32767;et>nt&&(nt=et,K=rt)}}}W+=(J=K)-(K=_[J])&32767}if(R){F[q++]=268435456|f[Q]<<18|l[R];var it=31&f[Q],st=31&l[R];O+=e[it]+i[st],++I[257+it],++S[st],B=j+Q,++L}else F[q++]=s[j],++I[s[j]]}}for(j=Math.max(j,B);j<v;++j)F[q++]=s[j],++I[s[j]];w=U(s,p,g,F,I,S,O,q,G,j-G,w),g||(c.r=7&w|p[w/8|0]<<3,w-=7,c.h=x,c.p=_,c.i=j,c.w=B)}else{for(j=c.w||0;j<v+g;j+=65535){var at=j+65535;at>=v&&(p[w/8|0]=g,at=v),w=k(p,w+1,s.subarray(j,at))}c.i=v}return b(d,0,h+m(w)+u)}(s,null==a.level?6:a.level,null==a.mem?u.l?Math.ceil(1.5*Math.max(8,Math.min(13,Math.log(s.length)))):20:12+a.mem,o,h,u)},O=function(t,n,r){for(;r;++n)t[n]=r,r>>>=8},j=function(){function n(n,r){if("function"==typeof n&&(r=n,n={}),this.ondata=r,this.o=n||{},this.s={l:0,i:32768,w:32768,z:32768},this.b=new t(98304),this.o.dictionary){var e=this.o.dictionary.subarray(-32768);this.b.set(e,32768-e.length),this.s.i=32768-e.length}}return n.prototype.p=function(t,n){this.ondata(L(t,this.o,0,0,this.s),n)},n.prototype.push=function(n,r){this.ondata||E(5),this.s.l&&E(4);var e=n.length+this.s.z;if(e>this.b.length){if(e>2*this.b.length-32768){var i=new t(-32768&e);i.set(this.b.subarray(0,this.s.z)),this.b=i}var s=this.b.length-this.s.z;this.b.set(n.subarray(0,s),this.s.z),this.s.z=this.b.length,this.p(this.b,!1),this.b.set(this.b.subarray(-32768)),this.b.set(n.subarray(s),32768),this.s.z=n.length-s+32768,this.s.i=32766,this.s.w=32768}else this.b.set(n,this.s.z),this.s.z+=n.length;this.s.l=1&r,(this.s.z>this.s.w+8191||r)&&(this.p(this.b,r||!1),this.s.w=this.s.i,this.s.i-=2)},n.prototype.flush=function(){this.ondata||E(5),this.s.l&&E(4),this.p(this.b,!1),this.s.w=this.s.i,this.s.i-=2},n}();function q(t,n){n||(n={});var r=function(){var t=-1;return{p:function(n){for(var r=t,e=0;e<n.length;++e)r=I[255&r^n[e]]^r>>>8;t=r},d:function(){return~t}}}(),e=t.length;r.p(t);var i,s=L(t,n,10+((i=n).filename?i.filename.length+1:0),8),a=s.length;return function(t,n){var r=n.filename;if(t[0]=31,t[1]=139,t[2]=8,t[8]=n.level<2?4:9==n.level?2:0,t[9]=3,0!=n.mtime&&O(t,4,Math.floor(new Date(n.mtime||Date.now())/1e3)),r){t[3]=8;for(var e=0;e<=r.length;++e)t[e+10]=r.charCodeAt(e)}}(s,n),O(s,a-8,r.d()),O(s,a-4,e),s}var B=function(){function t(t,n){this.c=S(),this.v=1,j.call(this,t,n)}return t.prototype.push=function(t,n){this.c.p(t),j.prototype.push.call(this,t,n)},t.prototype.p=function(t,n){var r=L(t,this.o,this.v&&(this.o.dictionary?6:2),n&&4,this.s);this.v&&(function(t,n){var r=n.level,e=0==r?0:r<6?1:9==r?3:2;if(t[0]=120,t[1]=e<<6|(n.dictionary&&32),t[1]|=31-(t[0]<<8|t[1])%31,n.dictionary){var i=S();i.p(n.dictionary),O(t,2,i.d())}}(r,this.o),this.v=0),n&&O(r,r.length-4,this.c.d()),this.ondata(r,n)},t.prototype.flush=function(){j.prototype.flush.call(this)},t}(),G="undefined"!=typeof TextEncoder&&new TextEncoder,H="undefined"!=typeof TextDecoder&&new TextDecoder;try{H.decode(F,{stream:!0})}catch(t){}var J=function(){function t(t){this.ondata=t}return t.prototype.push=function(t,n){this.ondata||E(5),this.d&&E(4),this.ondata(K(t),this.d=n||!1)},t}();function K(n,r){if(G)return G.encode(n);for(var e=n.length,i=new t(n.length+(n.length>>1)),s=0,a=function(t){i[s++]=t},o=0;o<e;++o){if(s+5>i.length){var h=new t(s+8+(e-o<<1));h.set(i),i=h}var f=n.charCodeAt(o);f<128||r?a(f):f<2048?(a(192|f>>6),a(128|63&f)):f>55295&&f<57344?(a(240|(f=65536+(1047552&f)|1023&n.charCodeAt(++o))>>18),a(128|f>>12&63),a(128|f>>6&63),a(128|63&f)):(a(224|f>>12),a(128|f>>6&63),a(128|63&f))}return b(i,0,s)}const N=new class{constructor(){this._init()}clear(){this._init()}addEvent(t){if(!t)throw new Error("Adding invalid event");const n=this._hasEvents?",":"";this.stream.push(n+t),this._hasEvents=!0}finish(){this.stream.push("]",!0);const t=function(t){let n=0;for(const r of t)n+=r.length;const r=new Uint8Array(n);for(let n=0,e=0,i=t.length;n<i;n++){const i=t[n];r.set(i,e),e+=i.length}return r}(this._deflatedData);return this._init(),t}_init(){this._hasEvents=!1,this._deflatedData=[],this.deflate=new B,this.deflate.ondata=(t,n)=>{this._deflatedData.push(t)},this.stream=new J((t,n)=>{this.deflate.push(t,n)}),this.stream.push("[")}},P={clear:()=>{N.clear()},addEvent:t=>N.addEvent(t),finish:()=>N.finish(),compress:t=>function(t){return q(K(t))}(t)};addEventListener("message",function(t){const n=t.data.method,r=t.data.id,e=t.data.arg;if(n in P&&"function"==typeof P[n])try{const t=P[n](e);postMessage({id:r,method:n,success:!0,response:t})}catch(t){postMessage({id:r,method:n,success:!1,response:t.message}),console.error(t)}}),postMessage({id:void 0,method:"init",success:!0,response:void 0});';
function Ph() {
  const e = new Blob([Nh]);
  return URL.createObjectURL(e);
}
const es = ["log", "warn", "error"],
  Jt = "[Replay] ";
function Pn(e, t = "info") {
  He(
    {
      category: "console",
      data: { logger: "replay" },
      level: t,
      message: `${Jt}${e}`,
    },
    { level: t },
  );
}
function Fh() {
  let e = !1,
    t = !1;
  const n = {
    exception: () => {},
    infoTick: () => {},
    setConfig: (r) => {
      ((e = !!r.captureExceptions), (t = !!r.traceInternals));
    },
  };
  return (
    T
      ? (es.forEach((r) => {
          n[r] = (...o) => {
            (E[r](Jt, ...o), t && Pn(o.join(""), Bs(r)));
          };
        }),
        (n.exception = (r, ...o) => {
          (o.length && n.error && n.error(...o),
            E.error(Jt, r),
            e ? qa(r) : t && Pn(r, "error"));
        }),
        (n.infoTick = (...r) => {
          (E.log(Jt, ...r), t && setTimeout(() => Pn(r[0]), 0));
        }))
      : es.forEach((r) => {
          n[r] = () => {};
        }),
    n
  );
}
const R = Fh();
class Nr extends Error {
  constructor() {
    super(`Event buffer exceeded maximum size of ${xr}.`);
  }
}
class Ni {
  constructor() {
    ((this.events = []),
      (this._totalSize = 0),
      (this.hasCheckout = !1),
      (this.waitForCheckout = !1));
  }
  get hasEvents() {
    return this.events.length > 0;
  }
  get type() {
    return "sync";
  }
  destroy() {
    this.events = [];
  }
  async addEvent(t) {
    const n = JSON.stringify(t).length;
    if (((this._totalSize += n), this._totalSize > xr)) throw new Nr();
    this.events.push(t);
  }
  finish() {
    return new Promise((t) => {
      const n = this.events;
      (this.clear(), t(JSON.stringify(n)));
    });
  }
  clear() {
    ((this.events = []), (this._totalSize = 0), (this.hasCheckout = !1));
  }
  getEarliestTimestamp() {
    const t = this.events.map((n) => n.timestamp).sort()[0];
    return t ? Dr(t) : null;
  }
}
class Bh {
  constructor(t) {
    ((this._worker = t), (this._id = 0));
  }
  ensureReady() {
    return this._ensureReadyPromise
      ? this._ensureReadyPromise
      : ((this._ensureReadyPromise = new Promise((t, n) => {
          (this._worker.addEventListener(
            "message",
            ({ data: r }) => {
              r.success ? t() : n();
            },
            { once: !0 },
          ),
            this._worker.addEventListener(
              "error",
              (r) => {
                n(r);
              },
              { once: !0 },
            ));
        })),
        this._ensureReadyPromise);
  }
  destroy() {
    (T && R.log("Destroying compression worker"), this._worker.terminate());
  }
  postMessage(t, n) {
    const r = this._getAndIncrementId();
    return new Promise((o, s) => {
      const i = ({ data: a }) => {
        const c = a;
        if (c.method === t && c.id === r) {
          if ((this._worker.removeEventListener("message", i), !c.success)) {
            (T && R.error("Error in compression worker: ", c.response),
              s(new Error("Error in compression worker")));
            return;
          }
          o(c.response);
        }
      };
      (this._worker.addEventListener("message", i),
        this._worker.postMessage({ id: r, method: t, arg: n }));
    });
  }
  _getAndIncrementId() {
    return this._id++;
  }
}
class $h {
  constructor(t) {
    ((this._worker = new Bh(t)),
      (this._earliestTimestamp = null),
      (this._totalSize = 0),
      (this.hasCheckout = !1),
      (this.waitForCheckout = !1));
  }
  get hasEvents() {
    return !!this._earliestTimestamp;
  }
  get type() {
    return "worker";
  }
  ensureReady() {
    return this._worker.ensureReady();
  }
  destroy() {
    this._worker.destroy();
  }
  addEvent(t) {
    const n = Dr(t.timestamp);
    (!this._earliestTimestamp || n < this._earliestTimestamp) &&
      (this._earliestTimestamp = n);
    const r = JSON.stringify(t);
    return (
      (this._totalSize += r.length),
      this._totalSize > xr
        ? Promise.reject(new Nr())
        : this._sendEventToWorker(r)
    );
  }
  finish() {
    return this._finishRequest();
  }
  clear() {
    ((this._earliestTimestamp = null),
      (this._totalSize = 0),
      (this.hasCheckout = !1),
      this._worker.postMessage("clear").then(null, (t) => {
        T && R.exception(t, 'Sending "clear" message to worker failed', t);
      }));
  }
  getEarliestTimestamp() {
    return this._earliestTimestamp;
  }
  _sendEventToWorker(t) {
    return this._worker.postMessage("addEvent", t);
  }
  async _finishRequest() {
    const t = await this._worker.postMessage("finish");
    return ((this._earliestTimestamp = null), (this._totalSize = 0), t);
  }
}
class Uh {
  constructor(t) {
    ((this._fallback = new Ni()),
      (this._compression = new $h(t)),
      (this._used = this._fallback),
      (this._ensureWorkerIsLoadedPromise = this._ensureWorkerIsLoaded()));
  }
  get waitForCheckout() {
    return this._used.waitForCheckout;
  }
  get type() {
    return this._used.type;
  }
  get hasEvents() {
    return this._used.hasEvents;
  }
  get hasCheckout() {
    return this._used.hasCheckout;
  }
  set hasCheckout(t) {
    this._used.hasCheckout = t;
  }
  set waitForCheckout(t) {
    this._used.waitForCheckout = t;
  }
  destroy() {
    (this._fallback.destroy(), this._compression.destroy());
  }
  clear() {
    return this._used.clear();
  }
  getEarliestTimestamp() {
    return this._used.getEarliestTimestamp();
  }
  addEvent(t) {
    return this._used.addEvent(t);
  }
  async finish() {
    return (await this.ensureWorkerIsLoaded(), this._used.finish());
  }
  ensureWorkerIsLoaded() {
    return this._ensureWorkerIsLoadedPromise;
  }
  async _ensureWorkerIsLoaded() {
    try {
      await this._compression.ensureReady();
    } catch (t) {
      T &&
        R.exception(
          t,
          "Failed to load the compression worker, falling back to simple buffer",
        );
      return;
    }
    await this._switchToCompressionWorker();
  }
  async _switchToCompressionWorker() {
    const { events: t, hasCheckout: n, waitForCheckout: r } = this._fallback,
      o = [];
    for (const s of t) o.push(this._compression.addEvent(s));
    ((this._compression.hasCheckout = n),
      (this._compression.waitForCheckout = r),
      (this._used = this._compression));
    try {
      (await Promise.all(o), this._fallback.clear());
    } catch (s) {
      T && R.exception(s, "Failed to add events when switching buffers.");
    }
  }
}
function Hh({ useCompression: e, workerUrl: t }) {
  if (e && window.Worker) {
    const n = Wh(t);
    if (n) return n;
  }
  return (T && R.log("Using simple buffer"), new Ni());
}
function Wh(e) {
  try {
    const t = e || zh();
    if (!t) return;
    T && R.log(`Using compression worker${e ? ` from ${e}` : ""}`);
    const n = new Worker(t);
    return new Uh(n);
  } catch (t) {
    T && R.exception(t, "Failed to create compression worker");
  }
}
function zh() {
  return typeof __SENTRY_EXCLUDE_REPLAY_WORKER__ > "u" ||
    !__SENTRY_EXCLUDE_REPLAY_WORKER__
    ? Ph()
    : "";
}
function Pr() {
  try {
    return "sessionStorage" in X && !!X.sessionStorage;
  } catch {
    return !1;
  }
}
function jh(e) {
  (qh(), (e.session = void 0));
}
function qh() {
  if (Pr())
    try {
      X.sessionStorage.removeItem(Ir);
    } catch {}
}
function Pi(e) {
  return e === void 0 ? !1 : Math.random() < e;
}
function Fr(e) {
  if (Pr())
    try {
      X.sessionStorage.setItem(Ir, JSON.stringify(e));
    } catch {}
}
function Fi(e) {
  const t = Date.now(),
    n = e.id || Ke(),
    r = e.started || t,
    o = e.lastActivity || t,
    s = e.segmentId || 0,
    i = e.sampled,
    a = e.previousSessionId;
  return {
    id: n,
    started: r,
    lastActivity: o,
    segmentId: s,
    sampled: i,
    previousSessionId: a,
  };
}
function Vh(e, t) {
  return Pi(e) ? "session" : t ? "buffer" : !1;
}
function ts(
  { sessionSampleRate: e, allowBuffering: t, stickySession: n = !1 },
  { previousSessionId: r } = {},
) {
  const o = Vh(e, t),
    s = Fi({ sampled: o, previousSessionId: r });
  return (n && Fr(s), s);
}
function Gh() {
  if (!Pr()) return null;
  try {
    const e = X.sessionStorage.getItem(Ir);
    if (!e) return null;
    const t = JSON.parse(e);
    return (T && R.infoTick("Loading existing session"), Fi(t));
  } catch {
    return null;
  }
}
function cr(e, t, n = +new Date()) {
  return e === null || t === void 0 || t < 0 ? !0 : t === 0 ? !1 : e + t <= n;
}
function Bi(
  e,
  { maxReplayDuration: t, sessionIdleExpire: n, targetTime: r = Date.now() },
) {
  return cr(e.started, t, r) || cr(e.lastActivity, n, r);
}
function $i(e, { sessionIdleExpire: t, maxReplayDuration: n }) {
  return !(
    !Bi(e, { sessionIdleExpire: t, maxReplayDuration: n }) ||
    (e.sampled === "buffer" && e.segmentId === 0)
  );
}
function Fn(
  { sessionIdleExpire: e, maxReplayDuration: t, previousSessionId: n },
  r,
) {
  const o = r.stickySession && Gh();
  return o
    ? $i(o, { sessionIdleExpire: e, maxReplayDuration: t })
      ? (T &&
          R.infoTick(
            "Session in sessionStorage is expired, creating new one...",
          ),
        ts(r, { previousSessionId: o.id }))
      : o
    : (T && R.infoTick("Creating new session"),
      ts(r, { previousSessionId: n }));
}
function Yh(e) {
  return e.type === N.Custom;
}
function Br(e, t, n) {
  return Hi(e, t) ? (Ui(e, t, n), !0) : !1;
}
function Kh(e, t, n) {
  return Hi(e, t) ? Ui(e, t, n) : Promise.resolve(null);
}
async function Ui(e, t, n) {
  const { eventBuffer: r } = e;
  if (!r || (r.waitForCheckout && !n)) return null;
  const o = e.recordingMode === "buffer";
  try {
    (n && o && r.clear(),
      n && ((r.hasCheckout = !0), (r.waitForCheckout = !1)));
    const s = e.getOptions(),
      i = Xh(t, s.beforeAddRecordingEvent);
    return i ? await r.addEvent(i) : void 0;
  } catch (s) {
    const i = s && s instanceof Nr,
      a = i ? "addEventSizeExceeded" : "addEvent";
    if (i && o) return (r.clear(), (r.waitForCheckout = !0), null);
    (e.handleException(s), await e.stop({ reason: a }));
    const c = re();
    c && c.recordDroppedEvent("internal_sdk_error", "replay");
  }
}
function Hi(e, t) {
  if (!e.eventBuffer || e.isPaused() || !e.isEnabled()) return !1;
  const n = Dr(t.timestamp);
  return n + e.timeouts.sessionIdlePause < Date.now()
    ? !1
    : n > e.getContext().initialTimestamp + e.getOptions().maxReplayDuration
      ? (T &&
          R.infoTick(
            `Skipping event with timestamp ${n} because it is after maxReplayDuration`,
          ),
        !1)
      : !0;
}
function Xh(e, t) {
  try {
    if (typeof t == "function" && Yh(e)) return t(e);
  } catch (n) {
    return (
      T &&
        R.exception(
          n,
          "An error occurred in the `beforeAddRecordingEvent` callback, skipping the event...",
        ),
      null
    );
  }
  return e;
}
function $r(e) {
  return !e.type;
}
function lr(e) {
  return e.type === "transaction";
}
function Jh(e) {
  return e.type === "replay_event";
}
function ns(e) {
  return e.type === "feedback";
}
function Zh(e) {
  return (t, n) => {
    if (!e.isEnabled() || (!$r(t) && !lr(t))) return;
    const r = n?.statusCode;
    if (!(!r || r < 200 || r >= 300)) {
      if (lr(t)) {
        Qh(e, t);
        return;
      }
      ep(e, t);
    }
  };
}
function Qh(e, t) {
  const n = e.getContext();
  t.contexts?.trace?.trace_id &&
    n.traceIds.size < 100 &&
    n.traceIds.add(t.contexts.trace.trace_id);
}
function ep(e, t) {
  const n = e.getContext();
  if (
    (t.event_id && n.errorIds.size < 100 && n.errorIds.add(t.event_id),
    e.recordingMode !== "buffer" || !t.tags || !t.tags.replayId)
  )
    return;
  const { beforeErrorSampling: r } = e.getOptions();
  (typeof r == "function" && !r(t)) ||
    At(async () => {
      try {
        await e.sendBufferedReplayOrFlush();
      } catch (o) {
        e.handleException(o);
      }
    });
}
function tp(e) {
  return (t) => {
    !e.isEnabled() || !$r(t) || np(e, t);
  };
}
function np(e, t) {
  const n = t.exception?.values?.[0]?.value;
  if (
    typeof n == "string" &&
    (n.match(
      /(reactjs\.org\/docs\/error-decoder\.html\?invariant=|react\.dev\/errors\/)(418|419|422|423|425)/,
    ) ||
      n.match(
        /(does not match server-rendered HTML|Hydration failed because)/i,
      ))
  ) {
    const r = Ce({ category: "replay.hydrate-error", data: { url: gn() } });
    Dt(e, r);
  }
}
function rp(e) {
  const t = re();
  t && t.on("beforeAddBreadcrumb", (n) => op(e, n));
}
function op(e, t) {
  if (!e.isEnabled() || !Wi(t)) return;
  const n = sp(t);
  n && Dt(e, n);
}
function sp(e) {
  return !Wi(e) ||
    ["fetch", "xhr", "sentry.event", "sentry.transaction"].includes(
      e.category,
    ) ||
    e.category.startsWith("ui.")
    ? null
    : e.category === "console"
      ? ip(e)
      : Ce(e);
}
function ip(e) {
  const t = e.data?.arguments;
  if (!Array.isArray(t) || t.length === 0) return Ce(e);
  let n = !1;
  const r = t.map((o) => {
    if (!o) return o;
    if (typeof o == "string")
      return o.length > Bt ? ((n = !0), `${o.slice(0, Bt)}…`) : o;
    if (typeof o == "object")
      try {
        const s = xs(o, 7);
        return JSON.stringify(s).length > Bt
          ? ((n = !0), `${JSON.stringify(s, null, 2).slice(0, Bt)}…`)
          : s;
      } catch {}
    return o;
  });
  return Ce({
    ...e,
    data: {
      ...e.data,
      arguments: r,
      ...(n ? { _meta: { warnings: ["CONSOLE_ARG_TRUNCATED"] } } : {}),
    },
  });
}
function Wi(e) {
  return !!e.category;
}
function ap(e, t) {
  return e.type || !e.exception?.values?.length
    ? !1
    : !!t.originalException?.__rrweb__;
}
function zi() {
  const e = Le().getPropagationContext().dsc;
  e && delete e.replay_id;
  const t = gr();
  if (t) {
    const n = Na(t);
    delete n.replay_id;
  }
}
function cp(e, t) {
  (e.triggerUserActivity(),
    e.addUpdate(() =>
      t.timestamp
        ? (e.throttledAddEvent({
            type: N.Custom,
            timestamp: t.timestamp * 1e3,
            data: {
              tag: "breadcrumb",
              payload: {
                timestamp: t.timestamp,
                type: "default",
                category: "sentry.feedback",
                data: { feedbackId: t.event_id },
              },
            },
          }),
          !1)
        : !0,
    ));
}
function lp(e, t) {
  return e.recordingMode !== "buffer" ||
    t.message === Cr ||
    !t.exception ||
    t.type
    ? !1
    : Pi(e.getOptions().errorSampleRate);
}
function up(e) {
  return Object.assign(
    (t, n) =>
      !e.isEnabled() || e.isPaused()
        ? t
        : Jh(t)
          ? (delete t.breadcrumbs, t)
          : !$r(t) && !lr(t) && !ns(t)
            ? t
            : e.checkAndHandleExpiredSession()
              ? ns(t)
                ? (e.flush(),
                  (t.contexts.feedback.replay_id = e.getSessionId()),
                  cp(e, t),
                  t)
                : ap(t, n) && !e.getOptions()._experiments.captureExceptions
                  ? (T && R.log("Ignoring error from rrweb internals", t), null)
                  : ((lp(e, t) || e.recordingMode === "session") &&
                      (t.tags = { ...t.tags, replayId: e.getSessionId() }),
                    t)
              : (zi(), t),
    { id: "Replay" },
  );
}
function En(e, t) {
  return t.map(({ type: n, start: r, end: o, name: s, data: i }) => {
    const a = e.throttledAddEvent({
      type: N.Custom,
      timestamp: r,
      data: {
        tag: "performanceSpan",
        payload: {
          op: n,
          description: s,
          startTimestamp: r,
          endTimestamp: o,
          data: i,
        },
      },
    });
    return typeof a == "string" ? Promise.resolve(null) : a;
  });
}
function dp(e) {
  const { from: t, to: n } = e,
    r = Date.now() / 1e3;
  return {
    type: "navigation.push",
    start: r,
    end: r,
    name: n,
    data: { previous: t },
  };
}
function fp(e) {
  return (t) => {
    if (!e.isEnabled()) return;
    const n = dp(t);
    n !== null &&
      (e.getContext().urls.push(n.name),
      e.triggerUserActivity(),
      e.addUpdate(() => (En(e, [n]), !1)));
  };
}
function hp(e, t) {
  return T && e.getOptions()._experiments.traceInternals ? !1 : _c(t, re());
}
function ji(e, t) {
  e.isEnabled() &&
    t !== null &&
    (hp(e, t.name) || e.addUpdate(() => (En(e, [t]), !0)));
}
function wn(e) {
  if (!e) return;
  const t = new TextEncoder();
  try {
    if (typeof e == "string") return t.encode(e).length;
    if (e instanceof URLSearchParams) return t.encode(e.toString()).length;
    if (e instanceof FormData) {
      const n = ri(e);
      return t.encode(n).length;
    }
    if (e instanceof Blob) return e.size;
    if (e instanceof ArrayBuffer) return e.byteLength;
  } catch {}
}
function qi(e) {
  if (!e) return;
  const t = parseInt(e, 10);
  return isNaN(t) ? void 0 : t;
}
function un(e, t) {
  if (!e) return { headers: {}, size: void 0, _meta: { warnings: [t] } };
  const n = { ...e._meta },
    r = n.warnings || [];
  return ((n.warnings = [...r, t]), (e._meta = n), e);
}
function Vi(e, t) {
  if (!t) return null;
  const {
    startTimestamp: n,
    endTimestamp: r,
    url: o,
    method: s,
    statusCode: i,
    request: a,
    response: c,
  } = t;
  return {
    type: e,
    start: n / 1e3,
    end: r / 1e3,
    name: o,
    data: { method: s, statusCode: i, request: a, response: c },
  };
}
function xt(e) {
  return { headers: {}, size: e, _meta: { warnings: ["URL_SKIPPED"] } };
}
function Ue(e, t, n) {
  if (!t && Object.keys(e).length === 0) return;
  if (!t) return { headers: e };
  if (!n) return { headers: e, size: t };
  const r = { headers: e, size: t },
    { body: o, warnings: s } = pp(n);
  return ((r.body = o), s?.length && (r._meta = { warnings: s }), r);
}
function ur(e, t) {
  return Object.entries(e).reduce((n, [r, o]) => {
    const s = r.toLowerCase();
    return (t.includes(s) && e[r] && (n[s] = o), n);
  }, {});
}
function pp(e) {
  if (!e || typeof e != "string") return { body: e };
  const t = e.length > Po,
    n = mp(e);
  if (t) {
    const r = e.slice(0, Po);
    return n
      ? { body: r, warnings: ["MAYBE_JSON_TRUNCATED"] }
      : { body: `${r}…`, warnings: ["TEXT_TRUNCATED"] };
  }
  if (n)
    try {
      return { body: JSON.parse(e) };
    } catch {}
  return { body: e };
}
function mp(e) {
  const t = e[0],
    n = e[e.length - 1];
  return (t === "[" && n === "]") || (t === "{" && n === "}");
}
function dn(e, t) {
  const n = gp(e);
  return Tt(n, t);
}
function gp(e, t = X.document.baseURI) {
  if (
    e.startsWith("http://") ||
    e.startsWith("https://") ||
    e.startsWith(X.location.origin)
  )
    return e;
  const n = new URL(e, t);
  if (n.origin !== new URL(t).origin) return e;
  const r = n.href;
  return !e.endsWith("/") && r.endsWith("/") ? r.slice(0, -1) : r;
}
async function _p(e, t, n) {
  try {
    const r = await vp(e, t, n),
      o = Vi("resource.fetch", r);
    ji(n.replay, o);
  } catch (r) {
    T && R.exception(r, "Failed to capture fetch breadcrumb");
  }
}
function yp(e, t) {
  const { input: n, response: r } = t,
    o = n ? si(n) : void 0,
    s = wn(o),
    i = r ? qi(r.headers.get("content-length")) : void 0;
  (s !== void 0 && (e.data.request_body_size = s),
    i !== void 0 && (e.data.response_body_size = i));
}
async function vp(e, t, n) {
  const r = Date.now(),
    { startTimestamp: o = r, endTimestamp: s = r } = t,
    {
      url: i,
      method: a,
      status_code: c = 0,
      request_body_size: u,
      response_body_size: d,
    } = e.data,
    l = dn(i, n.networkDetailAllowUrls) && !dn(i, n.networkDetailDenyUrls),
    f = l ? bp(n, t.input, u) : xt(u),
    h = await Sp(l, n, t.response, d);
  return {
    startTimestamp: o,
    endTimestamp: s,
    url: i,
    method: a,
    statusCode: c,
    request: f,
    response: h,
  };
}
function bp({ networkCaptureBodies: e, networkRequestHeaders: t }, n, r) {
  const o = n ? kp(n, t) : {};
  if (!e) return Ue(o, r, void 0);
  const s = si(n),
    [i, a] = oi(s, R),
    c = Ue(o, r, i);
  return a ? un(c, a) : c;
}
async function Sp(
  e,
  { networkCaptureBodies: t, networkResponseHeaders: n },
  r,
  o,
) {
  if (!e && o !== void 0) return xt(o);
  const s = r ? Gi(r.headers, n) : {};
  if (!r || (!t && o !== void 0)) return Ue(s, o, void 0);
  const [i, a] = await wp(r),
    c = Ep(i, {
      networkCaptureBodies: t,
      responseBodySize: o,
      captureDetails: e,
      headers: s,
    });
  return a ? un(c, a) : c;
}
function Ep(
  e,
  {
    networkCaptureBodies: t,
    responseBodySize: n,
    captureDetails: r,
    headers: o,
  },
) {
  try {
    const s = e?.length && n === void 0 ? wn(e) : n;
    return r ? (t ? Ue(o, s, e) : Ue(o, s, void 0)) : xt(s);
  } catch (s) {
    return (
      T && R.exception(s, "Failed to serialize response body"),
      Ue(o, n, void 0)
    );
  }
}
async function wp(e) {
  const t = Ip(e);
  if (!t) return [void 0, "BODY_PARSE_ERROR"];
  try {
    return [await Cp(t)];
  } catch (n) {
    return n instanceof Error && n.message.indexOf("Timeout") > -1
      ? (T && R.warn("Parsing text body from response timed out"),
        [void 0, "BODY_PARSE_TIMEOUT"])
      : (T && R.exception(n, "Failed to get text body from response"),
        [void 0, "BODY_PARSE_ERROR"]);
  }
}
function Gi(e, t) {
  const n = {};
  return (
    t.forEach((r) => {
      e.get(r) && (n[r] = e.get(r));
    }),
    n
  );
}
function kp(e, t) {
  return e.length === 1 && typeof e[0] != "string"
    ? rs(e[0], t)
    : e.length === 2
      ? rs(e[1], t)
      : {};
}
function rs(e, t) {
  if (!e) return {};
  const n = e.headers;
  return n
    ? n instanceof Headers
      ? Gi(n, t)
      : Array.isArray(n)
        ? {}
        : ur(n, t)
    : {};
}
function Ip(e) {
  try {
    return e.clone();
  } catch (t) {
    T && R.exception(t, "Failed to clone response body");
  }
}
function Cp(e) {
  return new Promise((t, n) => {
    const r = At(
      () => n(new Error("Timeout while trying to read response body")),
      500,
    );
    xp(e)
      .then(
        (o) => t(o),
        (o) => n(o),
      )
      .finally(() => clearTimeout(r));
  });
}
async function xp(e) {
  return await e.text();
}
async function Tp(e, t, n) {
  try {
    const r = Mp(e, t, n),
      o = Vi("resource.xhr", r);
    ji(n.replay, o);
  } catch (r) {
    T && R.exception(r, "Failed to capture xhr breadcrumb");
  }
}
function Rp(e, t) {
  const { xhr: n, input: r } = t;
  if (!n) return;
  const o = wn(r),
    s = n.getResponseHeader("content-length")
      ? qi(n.getResponseHeader("content-length"))
      : Lp(n.response, n.responseType);
  (o !== void 0 && (e.data.request_body_size = o),
    s !== void 0 && (e.data.response_body_size = s));
}
function Mp(e, t, n) {
  const r = Date.now(),
    { startTimestamp: o = r, endTimestamp: s = r, input: i, xhr: a } = t,
    {
      url: c,
      method: u,
      status_code: d = 0,
      request_body_size: l,
      response_body_size: f,
    } = e.data;
  if (!c) return null;
  if (
    !a ||
    !dn(c, n.networkDetailAllowUrls) ||
    dn(c, n.networkDetailDenyUrls)
  ) {
    const S = xt(l),
      C = xt(f);
    return {
      startTimestamp: o,
      endTimestamp: s,
      url: c,
      method: u,
      statusCode: d,
      request: S,
      response: C,
    };
  }
  const h = a[ks],
    p = h ? ur(h.request_headers, n.networkRequestHeaders) : {},
    m = ur(Ap(a), n.networkResponseHeaders),
    [_, g] = n.networkCaptureBodies ? oi(i, R) : [void 0],
    [v, M] = n.networkCaptureBodies ? Op(a) : [void 0],
    w = Ue(p, l, _),
    I = Ue(m, f, v);
  return {
    startTimestamp: o,
    endTimestamp: s,
    url: c,
    method: u,
    statusCode: d,
    request: g ? un(w, g) : w,
    response: M ? un(I, M) : I,
  };
}
function Ap(e) {
  const t = e.getAllResponseHeaders();
  return t
    ? t
        .split(
          `\r
`,
        )
        .reduce((n, r) => {
          const [o, s] = r.split(": ");
          return (s && (n[o.toLowerCase()] = s), n);
        }, {})
    : {};
}
function Op(e) {
  const t = [];
  try {
    return [e.responseText];
  } catch (n) {
    t.push(n);
  }
  try {
    return Dp(e.response, e.responseType);
  } catch (n) {
    t.push(n);
  }
  return (T && R.warn("Failed to get xhr response body", ...t), [void 0]);
}
function Dp(e, t) {
  try {
    if (typeof e == "string") return [e];
    if (e instanceof Document) return [e.body.outerHTML];
    if (t === "json" && e && typeof e == "object") return [JSON.stringify(e)];
    if (!e) return [void 0];
  } catch (n) {
    return (
      T && R.exception(n, "Failed to serialize body", e),
      [void 0, "BODY_PARSE_ERROR"]
    );
  }
  return (
    T && R.log("Skipping network body because of body type", e),
    [void 0, "UNPARSEABLE_BODY_TYPE"]
  );
}
function Lp(e, t) {
  try {
    const n = t === "json" && e && typeof e == "object" ? JSON.stringify(e) : e;
    return wn(n);
  } catch {
    return;
  }
}
function Np(e) {
  const t = re();
  try {
    const {
        networkDetailAllowUrls: n,
        networkDetailDenyUrls: r,
        networkCaptureBodies: o,
        networkRequestHeaders: s,
        networkResponseHeaders: i,
      } = e.getOptions(),
      a = {
        replay: e,
        networkDetailAllowUrls: n,
        networkDetailDenyUrls: r,
        networkCaptureBodies: o,
        networkRequestHeaders: s,
        networkResponseHeaders: i,
      };
    t && t.on("beforeAddBreadcrumb", (c, u) => Pp(a, c, u));
  } catch {}
}
function Pp(e, t, n) {
  if (t.data)
    try {
      (Fp(t) && $p(n) && (Rp(t, n), Tp(t, n, e)),
        Bp(t) && Up(n) && (yp(t, n), _p(t, n, e)));
    } catch (r) {
      T && R.exception(r, "Error when enriching network breadcrumb");
    }
}
function Fp(e) {
  return e.category === "xhr";
}
function Bp(e) {
  return e.category === "fetch";
}
function $p(e) {
  return e?.xhr;
}
function Up(e) {
  return e?.response;
}
function Hp(e) {
  const t = re();
  (ti(gh(e)), pr(fp(e)), rp(e), Np(e));
  const n = up(e);
  (Pa(n),
    t &&
      (t.on("beforeSendEvent", tp(e)),
      t.on("afterSendEvent", Zh(e)),
      t.on("createDsc", (r) => {
        const o = e.getSessionId();
        o &&
          e.isEnabled() &&
          e.recordingMode === "session" &&
          e.checkAndHandleExpiredSession() &&
          (r.replay_id = o);
      }),
      t.on("spanStart", (r) => {
        e.lastActiveSpan = r;
      }),
      t.on("spanEnd", (r) => {
        e.lastActiveSpan = r;
      }),
      t.on("beforeSendFeedback", async (r, o) => {
        const s = e.getSessionId();
        o?.includeReplay &&
          e.isEnabled() &&
          s &&
          r.contexts?.feedback &&
          (r.contexts.feedback.source === "api" &&
            (await e.sendBufferedReplayOrFlush()),
          (r.contexts.feedback.replay_id = s));
      }),
      t.on("openFeedbackWidget", async () => {
        await e.sendBufferedReplayOrFlush();
      })));
}
async function Wp(e) {
  try {
    return Promise.all(En(e, [zp(X.performance.memory)]));
  } catch {
    return [];
  }
}
function zp(e) {
  const { jsHeapSizeLimit: t, totalJSHeapSize: n, usedJSHeapSize: r } = e,
    o = Date.now() / 1e3;
  return {
    type: "memory",
    name: "memory",
    start: o,
    end: o,
    data: {
      memory: { jsHeapSizeLimit: t, totalJSHeapSize: n, usedJSHeapSize: r },
    },
  };
}
function jp(e, t, n) {
  return Ec(e, t, { ...n, setTimeoutImpl: At });
}
const zt = Be.navigator;
function qp() {
  return /iPhone|iPad|iPod/i.test(zt?.userAgent ?? "") ||
    (/Macintosh/i.test(zt?.userAgent ?? "") &&
      zt?.maxTouchPoints &&
      zt?.maxTouchPoints > 1)
    ? { sampling: { mousemove: !1 } }
    : {};
}
function Vp(e) {
  let t = !1;
  return (n, r) => {
    if (!e.checkAndHandleExpiredSession()) {
      T && R.warn("Received replay event after session expired.");
      return;
    }
    const o = r || !t;
    ((t = !0),
      e.clickDetector && dh(e.clickDetector, n),
      e.addUpdate(() => {
        if (
          (e.recordingMode === "buffer" && o && e.setInitialState(),
          !Br(e, n, o))
        )
          return !0;
        if (!o) return !1;
        const s = e.session;
        if ((Yp(e, o), e.recordingMode === "buffer" && s && e.eventBuffer)) {
          const i = e.eventBuffer.getEarliestTimestamp();
          i &&
            (T &&
              R.log(
                `Updating session start time to earliest event in buffer to ${new Date(i)}`,
              ),
            (s.started = i),
            e.getOptions().stickySession && Fr(s));
        }
        return (
          s?.previousSessionId || (e.recordingMode === "session" && e.flush()),
          !0
        );
      }));
  };
}
function Gp(e) {
  const t = e.getOptions();
  return {
    type: N.Custom,
    timestamp: Date.now(),
    data: {
      tag: "options",
      payload: {
        shouldRecordCanvas: e.isRecordingCanvas(),
        sessionSampleRate: t.sessionSampleRate,
        errorSampleRate: t.errorSampleRate,
        useCompressionOption: t.useCompression,
        blockAllMedia: t.blockAllMedia,
        maskAllText: t.maskAllText,
        maskAllInputs: t.maskAllInputs,
        useCompression: e.eventBuffer ? e.eventBuffer.type === "worker" : !1,
        networkDetailHasUrls: t.networkDetailAllowUrls.length > 0,
        networkCaptureBodies: t.networkCaptureBodies,
        networkRequestHasHeaders: t.networkRequestHeaders.length > 0,
        networkResponseHasHeaders: t.networkResponseHeaders.length > 0,
      },
    },
  };
}
function Yp(e, t) {
  !t || !e.session || e.session.segmentId !== 0 || Br(e, Gp(e), !1);
}
function Kp(e) {
  if (!e) return null;
  try {
    return e.nodeType === e.ELEMENT_NODE ? e : e.parentElement;
  } catch {
    return null;
  }
}
function Xp(e, t, n, r) {
  return hn(za(e, ja(e), r, n), [
    [{ type: "replay_event" }, e],
    [
      {
        type: "replay_recording",
        length:
          typeof t == "string" ? new TextEncoder().encode(t).length : t.length,
      },
      t,
    ],
  ]);
}
function Jp({ recordingData: e, headers: t }) {
  let n;
  const r = `${JSON.stringify(t)}
`;
  if (typeof e == "string") n = `${r}${e}`;
  else {
    const s = new TextEncoder().encode(r);
    ((n = new Uint8Array(s.length + e.length)), n.set(s), n.set(e, s.length));
  }
  return n;
}
async function Zp({ client: e, scope: t, replayId: n, event: r }) {
  const o =
      typeof e._integrations == "object" &&
      e._integrations !== null &&
      !Array.isArray(e._integrations)
        ? Object.keys(e._integrations)
        : void 0,
    s = { event_id: n, integrations: o };
  e.emit("preprocessEvent", r, s);
  const i = await gs(e.getOptions(), r, s, t, e, pn());
  if (!i) return null;
  (e.emit("postprocessEvent", i, s), (i.platform = i.platform || "javascript"));
  const a = e.getSdkMetadata(),
    { name: c, version: u } = a?.sdk || {};
  return (
    (i.sdk = {
      ...i.sdk,
      name: c || "sentry.javascript.unknown",
      version: u || "0.0.0",
    }),
    i
  );
}
async function Qp({
  recordingData: e,
  replayId: t,
  segmentId: n,
  eventContext: r,
  timestamp: o,
  session: s,
}) {
  const i = Jp({ recordingData: e, headers: { segment_id: n } }),
    { urls: a, errorIds: c, traceIds: u, initialTimestamp: d } = r,
    l = re(),
    f = Le(),
    h = l?.getTransport(),
    p = l?.getDsn();
  if (!l || !h || !p || !s.sampled) return Oe({});
  const m = {
      type: xd,
      replay_start_timestamp: d / 1e3,
      timestamp: o / 1e3,
      error_ids: c,
      trace_ids: u,
      urls: a,
      replay_id: t,
      segment_id: n,
      replay_type: s.sampled,
    },
    _ = await Zp({ scope: f, client: l, replayId: t, event: m });
  if (!_)
    return (
      l.recordDroppedEvent("event_processor", "replay"),
      T && R.log("An event processor returned `null`, will not send event."),
      Oe({})
    );
  delete _.sdkProcessingMetadata;
  const g = Xp(_, i, p, l.getOptions().tunnel);
  let v;
  try {
    v = await h.send(g);
  } catch (w) {
    const I = new Error(Cr);
    try {
      I.cause = w;
    } catch {}
    throw I;
  }
  if (
    typeof v.statusCode == "number" &&
    (v.statusCode < 200 || v.statusCode >= 300)
  )
    throw new Yi(v.statusCode);
  const M = Ps({}, v);
  if (Ns(M, "replay")) throw new Ur(M);
  return v;
}
class Yi extends Error {
  constructor(t) {
    super(`Transport returned status code ${t}`);
  }
}
class Ur extends Error {
  constructor(t) {
    (super("Rate limit hit"), (this.rateLimits = t));
  }
}
async function Ki(e, t = { count: 0, interval: Dd }) {
  const { recordingData: n, onError: r } = e;
  if (n.length)
    try {
      return (await Qp(e), !0);
    } catch (o) {
      if (o instanceof Yi || o instanceof Ur) throw o;
      if ((Wa("Replays", { _retryCount: t.count }), r && r(o), t.count >= Ld)) {
        const s = new Error(`${Cr} - max retries exceeded`);
        try {
          s.cause = o;
        } catch {}
        throw s;
      }
      return (
        (t.interval *= ++t.count),
        new Promise((s, i) => {
          At(async () => {
            try {
              (await Ki(e, t), s(!0));
            } catch (a) {
              i(a);
            }
          }, t.interval);
        })
      );
    }
}
const Xi = "__THROTTLED",
  em = "__SKIPPED";
function tm(e, t, n) {
  const r = new Map(),
    o = (a) => {
      const c = a - n;
      r.forEach((u, d) => {
        d < c && r.delete(d);
      });
    },
    s = () => [...r.values()].reduce((a, c) => a + c, 0);
  let i = !1;
  return (...a) => {
    const c = Math.floor(Date.now() / 1e3);
    if ((o(c), s() >= t)) {
      const d = i;
      return ((i = !0), d ? em : Xi);
    }
    i = !1;
    const u = r.get(c) || 0;
    return (r.set(c, u + 1), e(...a));
  };
}
class nm {
  constructor({ options: t, recordingOptions: n }) {
    ((this.eventBuffer = null),
      (this.performanceEntries = []),
      (this.replayPerformanceEntries = []),
      (this.recordingMode = "session"),
      (this.timeouts = { sessionIdlePause: Td, sessionIdleExpire: Rd }),
      (this._lastActivity = Date.now()),
      (this._isEnabled = !1),
      (this._isPaused = !1),
      (this._requiresManualStart = !1),
      (this._hasInitializedCoreListeners = !1),
      (this._context = {
        errorIds: new Set(),
        traceIds: new Set(),
        urls: [],
        initialTimestamp: Date.now(),
        initialUrl: "",
      }),
      (this._recordingOptions = n),
      (this._options = t),
      (this._debouncedFlush = jp(
        () => this._flush(),
        this._options.flushMinDelay,
        { maxWait: this._options.flushMaxDelay },
      )),
      (this._throttledAddEvent = tm((i, a) => Kh(this, i, a), 300, 5)));
    const { slowClickTimeout: r, slowClickIgnoreSelectors: o } =
        this.getOptions(),
      s = r
        ? {
            threshold: Math.min(Nd, r),
            timeout: r,
            scrollTimeout: Pd,
            ignoreSelector: o ? o.join(",") : "",
          }
        : void 0;
    if ((s && (this.clickDetector = new ah(this, s)), T)) {
      const i = t._experiments;
      R.setConfig({
        captureExceptions: !!i.captureExceptions,
        traceInternals: !!i.traceInternals,
      });
    }
    ((this._handleVisibilityChange = () => {
      X.document.visibilityState === "visible"
        ? this._doChangeToForegroundTasks()
        : this._doChangeToBackgroundTasks();
    }),
      (this._handleWindowBlur = () => {
        const i = Ce({ category: "ui.blur" });
        this._doChangeToBackgroundTasks(i);
      }),
      (this._handleWindowFocus = () => {
        const i = Ce({ category: "ui.focus" });
        this._doChangeToForegroundTasks(i);
      }),
      (this._handleKeyboardEvent = (i) => {
        bh(this, i);
      }));
  }
  getContext() {
    return this._context;
  }
  isEnabled() {
    return this._isEnabled;
  }
  isPaused() {
    return this._isPaused;
  }
  isRecordingCanvas() {
    return !!this._canvas;
  }
  getOptions() {
    return this._options;
  }
  handleException(t) {
    (T && R.exception(t), this._options.onError && this._options.onError(t));
  }
  initializeSampling(t) {
    const { errorSampleRate: n, sessionSampleRate: r } = this._options,
      o = n <= 0 && r <= 0;
    if (((this._requiresManualStart = o), !o)) {
      if ((this._initializeSessionForSampling(t), !this.session)) {
        T && R.exception(new Error("Unable to initialize and create session"));
        return;
      }
      this.session.sampled !== !1 &&
        ((this.recordingMode =
          this.session.sampled === "buffer" && this.session.segmentId === 0
            ? "buffer"
            : "session"),
        T && R.infoTick(`Starting replay in ${this.recordingMode} mode`),
        this._initializeRecording());
    }
  }
  start() {
    if (this._isEnabled && this.recordingMode === "session") {
      T && R.log("Recording is already in progress");
      return;
    }
    if (this._isEnabled && this.recordingMode === "buffer") {
      T && R.log("Buffering is in progress, call `flush()` to save the replay");
      return;
    }
    (T && R.infoTick("Starting replay in session mode"),
      this._updateUserActivity());
    const t = Fn(
      {
        maxReplayDuration: this._options.maxReplayDuration,
        sessionIdleExpire: this.timeouts.sessionIdleExpire,
      },
      {
        stickySession: this._options.stickySession,
        sessionSampleRate: 1,
        allowBuffering: !1,
      },
    );
    ((this.session = t),
      (this.recordingMode = "session"),
      this._initializeRecording());
  }
  startBuffering() {
    if (this._isEnabled) {
      T && R.log("Buffering is in progress, call `flush()` to save the replay");
      return;
    }
    T && R.infoTick("Starting replay in buffer mode");
    const t = Fn(
      {
        sessionIdleExpire: this.timeouts.sessionIdleExpire,
        maxReplayDuration: this._options.maxReplayDuration,
      },
      {
        stickySession: this._options.stickySession,
        sessionSampleRate: 0,
        allowBuffering: !0,
      },
    );
    ((this.session = t),
      (this.recordingMode = "buffer"),
      this._initializeRecording());
  }
  startRecording() {
    try {
      const t = this._canvas;
      this._stopRecording = Ae({
        ...this._recordingOptions,
        ...(this.recordingMode === "buffer"
          ? { checkoutEveryNms: Od }
          : this._options._experiments.continuousCheckout && {
              checkoutEveryNms: Math.max(
                36e4,
                this._options._experiments.continuousCheckout,
              ),
            }),
        emit: Vp(this),
        ...qp(),
        onMutation: this._onMutationHandler.bind(this),
        ...(t
          ? {
              recordCanvas: t.recordCanvas,
              getCanvasManager: t.getCanvasManager,
              sampling: t.sampling,
              dataURLOptions: t.dataURLOptions,
            }
          : {}),
      });
    } catch (t) {
      this.handleException(t);
    }
  }
  stopRecording() {
    try {
      return (
        this._stopRecording &&
          (this._stopRecording(), (this._stopRecording = void 0)),
        !0
      );
    } catch (t) {
      return (this.handleException(t), !1);
    }
  }
  async stop({ forceFlush: t = !1, reason: n } = {}) {
    if (this._isEnabled) {
      ((this._isEnabled = !1), (this.recordingMode = "buffer"));
      try {
        (T && R.log(`Stopping Replay${n ? ` triggered by ${n}` : ""}`),
          zi(),
          this._removeListeners(),
          this.stopRecording(),
          this._debouncedFlush.cancel(),
          t && (await this._flush({ force: !0 })),
          this.eventBuffer?.destroy(),
          (this.eventBuffer = null),
          jh(this));
      } catch (r) {
        this.handleException(r);
      }
    }
  }
  pause() {
    this._isPaused ||
      ((this._isPaused = !0),
      this.stopRecording(),
      T && R.log("Pausing replay"));
  }
  resume() {
    !this._isPaused ||
      !this._checkSession() ||
      ((this._isPaused = !1),
      this.startRecording(),
      T && R.log("Resuming replay"));
  }
  async sendBufferedReplayOrFlush({ continueRecording: t = !0 } = {}) {
    if (this.recordingMode === "session") return this.flushImmediate();
    const n = Date.now();
    (T && R.log("Converting buffer to session"), await this.flushImmediate());
    const r = this.stopRecording();
    !t ||
      !r ||
      (this.recordingMode !== "session" &&
        ((this.recordingMode = "session"),
        this.session &&
          (this._updateUserActivity(n),
          this._updateSessionActivity(n),
          this._maybeSaveSession()),
        this.startRecording()));
  }
  addUpdate(t) {
    const n = t();
    this.recordingMode === "buffer" ||
      !this._isEnabled ||
      (n !== !0 && this._debouncedFlush());
  }
  triggerUserActivity() {
    if ((this._updateUserActivity(), !this._stopRecording)) {
      if (!this._checkSession()) return;
      this.resume();
      return;
    }
    (this.checkAndHandleExpiredSession(), this._updateSessionActivity());
  }
  updateUserActivity() {
    (this._updateUserActivity(), this._updateSessionActivity());
  }
  conditionalFlush() {
    return this.recordingMode === "buffer"
      ? Promise.resolve()
      : this.flushImmediate();
  }
  flush() {
    return this._debouncedFlush();
  }
  flushImmediate() {
    return (this._debouncedFlush(), this._debouncedFlush.flush());
  }
  cancelFlush() {
    this._debouncedFlush.cancel();
  }
  getSessionId() {
    return this.session?.id;
  }
  checkAndHandleExpiredSession() {
    if (
      this._lastActivity &&
      cr(this._lastActivity, this.timeouts.sessionIdlePause) &&
      this.session &&
      this.session.sampled === "session"
    ) {
      this.pause();
      return;
    }
    return !!this._checkSession();
  }
  setInitialState() {
    const t = `${X.location.pathname}${X.location.hash}${X.location.search}`,
      n = `${X.location.origin}${t}`;
    ((this.performanceEntries = []),
      (this.replayPerformanceEntries = []),
      this._clearContext(),
      (this._context.initialUrl = n),
      (this._context.initialTimestamp = Date.now()),
      this._context.urls.push(n));
  }
  throttledAddEvent(t, n) {
    const r = this._throttledAddEvent(t, n);
    if (r === Xi) {
      const o = Ce({ category: "replay.throttled" });
      this.addUpdate(
        () =>
          !Br(this, {
            type: eh,
            timestamp: o.timestamp || 0,
            data: { tag: "breadcrumb", payload: o, metric: !0 },
          }),
      );
    }
    return r;
  }
  getCurrentRoute() {
    const t = this.lastActiveSpan || gr(),
      n = t && zn(t),
      o = ((n && qe(n).data) || {})[La];
    if (!(!n || !o || !["route", "custom"].includes(o)))
      return qe(n).description;
  }
  _initializeRecording() {
    (this.setInitialState(),
      this._updateSessionActivity(),
      (this.eventBuffer = Hh({
        useCompression: this._options.useCompression,
        workerUrl: this._options.workerUrl,
      })),
      this._removeListeners(),
      this._addListeners(),
      (this._isEnabled = !0),
      (this._isPaused = !1),
      this.startRecording());
  }
  _initializeSessionForSampling(t) {
    const n = this._options.errorSampleRate > 0,
      r = Fn(
        {
          sessionIdleExpire: this.timeouts.sessionIdleExpire,
          maxReplayDuration: this._options.maxReplayDuration,
          previousSessionId: t,
        },
        {
          stickySession: this._options.stickySession,
          sessionSampleRate: this._options.sessionSampleRate,
          allowBuffering: n,
        },
      );
    this.session = r;
  }
  _checkSession() {
    if (!this.session) return !1;
    const t = this.session;
    return $i(t, {
      sessionIdleExpire: this.timeouts.sessionIdleExpire,
      maxReplayDuration: this._options.maxReplayDuration,
    })
      ? (this._refreshSession(t), !1)
      : !0;
  }
  async _refreshSession(t) {
    this._isEnabled &&
      (await this.stop({ reason: "refresh session" }),
      this.initializeSampling(t.id));
  }
  _addListeners() {
    try {
      (X.document.addEventListener(
        "visibilitychange",
        this._handleVisibilityChange,
      ),
        X.addEventListener("blur", this._handleWindowBlur),
        X.addEventListener("focus", this._handleWindowFocus),
        X.addEventListener("keydown", this._handleKeyboardEvent),
        this.clickDetector && this.clickDetector.addListeners(),
        this._hasInitializedCoreListeners ||
          (Hp(this), (this._hasInitializedCoreListeners = !0)));
    } catch (t) {
      this.handleException(t);
    }
    this._performanceCleanupCallback = Lh(this);
  }
  _removeListeners() {
    try {
      (X.document.removeEventListener(
        "visibilitychange",
        this._handleVisibilityChange,
      ),
        X.removeEventListener("blur", this._handleWindowBlur),
        X.removeEventListener("focus", this._handleWindowFocus),
        X.removeEventListener("keydown", this._handleKeyboardEvent),
        this.clickDetector && this.clickDetector.removeListeners(),
        this._performanceCleanupCallback && this._performanceCleanupCallback());
    } catch (t) {
      this.handleException(t);
    }
  }
  _doChangeToBackgroundTasks(t) {
    !this.session ||
      Bi(this.session, {
        maxReplayDuration: this._options.maxReplayDuration,
        sessionIdleExpire: this.timeouts.sessionIdleExpire,
      }) ||
      (t && this._createCustomBreadcrumb(t), this.conditionalFlush());
  }
  _doChangeToForegroundTasks(t) {
    if (!this.session) return;
    if (!this.checkAndHandleExpiredSession()) {
      T && R.log("Document has become active, but session has expired");
      return;
    }
    t && this._createCustomBreadcrumb(t);
  }
  _updateUserActivity(t = Date.now()) {
    this._lastActivity = t;
  }
  _updateSessionActivity(t = Date.now()) {
    this.session && ((this.session.lastActivity = t), this._maybeSaveSession());
  }
  _createCustomBreadcrumb(t) {
    this.addUpdate(() => {
      this.throttledAddEvent({
        type: N.Custom,
        timestamp: t.timestamp || 0,
        data: { tag: "breadcrumb", payload: t },
      });
    });
  }
  _addPerformanceEntries() {
    let t = kh(this.performanceEntries).concat(this.replayPerformanceEntries);
    if (
      ((this.performanceEntries = []),
      (this.replayPerformanceEntries = []),
      this._requiresManualStart)
    ) {
      const n = this._context.initialTimestamp / 1e3;
      t = t.filter((r) => r.start >= n);
    }
    return Promise.all(En(this, t));
  }
  _clearContext() {
    (this._context.errorIds.clear(),
      this._context.traceIds.clear(),
      (this._context.urls = []));
  }
  _updateInitialTimestampFromEventBuffer() {
    const { session: t, eventBuffer: n } = this;
    if (!t || !n || this._requiresManualStart || t.segmentId) return;
    const r = n.getEarliestTimestamp();
    r &&
      r < this._context.initialTimestamp &&
      (this._context.initialTimestamp = r);
  }
  _popEventContext() {
    const t = {
      initialTimestamp: this._context.initialTimestamp,
      initialUrl: this._context.initialUrl,
      errorIds: Array.from(this._context.errorIds),
      traceIds: Array.from(this._context.traceIds),
      urls: this._context.urls,
    };
    return (this._clearContext(), t);
  }
  async _runFlush() {
    const t = this.getSessionId();
    if (!this.session || !this.eventBuffer || !t) {
      T && R.error("No session or eventBuffer found to flush.");
      return;
    }
    if (
      (await this._addPerformanceEntries(),
      !!this.eventBuffer?.hasEvents &&
        (await Wp(this), !!this.eventBuffer && t === this.getSessionId()))
    )
      try {
        this._updateInitialTimestampFromEventBuffer();
        const n = Date.now();
        if (
          n - this._context.initialTimestamp >
          this._options.maxReplayDuration + 3e4
        )
          throw new Error("Session is too long, not sending replay");
        const r = this._popEventContext(),
          o = this.session.segmentId++;
        this._maybeSaveSession();
        const s = await this.eventBuffer.finish();
        await Ki({
          replayId: t,
          recordingData: s,
          segmentId: o,
          eventContext: r,
          session: this.session,
          timestamp: n,
          onError: (i) => this.handleException(i),
        });
      } catch (n) {
        (this.handleException(n), this.stop({ reason: "sendReplay" }));
        const r = re();
        if (r) {
          const o = n instanceof Ur ? "ratelimit_backoff" : "send_error";
          r.recordDroppedEvent(o, "replay");
        }
      }
  }
  async _flush({ force: t = !1 } = {}) {
    if (!this._isEnabled && !t) return;
    if (!this.checkAndHandleExpiredSession()) {
      T && R.error("Attempting to finish replay event after session expired.");
      return;
    }
    if (!this.session) return;
    const n = this.session.started,
      o = Date.now() - n;
    this._debouncedFlush.cancel();
    const s = o < this._options.minReplayDuration,
      i = o > this._options.maxReplayDuration + 5e3;
    if (s || i) {
      (T &&
        R.log(
          `Session duration (${Math.floor(o / 1e3)}s) is too ${s ? "short" : "long"}, not sending replay.`,
        ),
        s && this._debouncedFlush());
      return;
    }
    const a = this.eventBuffer;
    a &&
      this.session.segmentId === 0 &&
      !a.hasCheckout &&
      T &&
      R.log("Flushing initial segment without checkout.");
    const c = !!this._flushLock;
    this._flushLock || (this._flushLock = this._runFlush());
    try {
      await this._flushLock;
    } catch (u) {
      this.handleException(u);
    } finally {
      ((this._flushLock = void 0), c && this._debouncedFlush());
    }
  }
  _maybeSaveSession() {
    this.session && this._options.stickySession && Fr(this.session);
  }
  _onMutationHandler(t) {
    const { ignoreMutations: n } = this._options._experiments;
    if (
      n?.length &&
      t.some((a) => {
        const c = Kp(a.target),
          u = n.join(",");
        return c?.matches(u);
      })
    )
      return !1;
    const r = t.length,
      o = this._options.mutationLimit,
      s = this._options.mutationBreadcrumbLimit,
      i = o && r > o;
    if (r > s || i) {
      const a = Ce({
        category: "replay.mutations",
        data: { count: r, limit: i },
      });
      this._createCustomBreadcrumb(a);
    }
    return i
      ? (this.stop({
          reason: "mutationLimit",
          forceFlush: this.recordingMode === "session",
        }),
        !1)
      : !0;
  }
}
function _t(e, t) {
  return [...e, ...t].join(",");
}
function rm({ mask: e, unmask: t, block: n, unblock: r, ignore: o }) {
  const s = ["base", "iframe[srcdoc]:not([src])"],
    i = _t(e, [".sentry-mask", "[data-sentry-mask]"]),
    a = _t(t, []);
  return {
    maskTextSelector: i,
    unmaskTextSelector: a,
    blockSelector: _t(n, [".sentry-block", "[data-sentry-block]", ...s]),
    unblockSelector: _t(r, []),
    ignoreSelector: _t(o, [
      ".sentry-ignore",
      "[data-sentry-ignore]",
      'input[type="file"]',
    ]),
  };
}
function om({
  el: e,
  key: t,
  maskAttributes: n,
  maskAllText: r,
  privacyOptions: o,
  value: s,
}) {
  return !r || (o.unmaskTextSelector && e.matches(o.unmaskTextSelector))
    ? s
    : n.includes(t) ||
        (t === "value" &&
          e.tagName === "INPUT" &&
          ["submit", "button"].includes(e.getAttribute("type") || ""))
      ? s.replace(/[\S]/g, "*")
      : s;
}
const os =
    'img,image,svg,video,object,picture,embed,map,audio,link[rel="icon"],link[rel="apple-touch-icon"]',
  sm = ["content-length", "content-type", "accept"];
let ss = !1;
const im = (e) => new am(e);
class am {
  constructor({
    flushMinDelay: t = Md,
    flushMaxDelay: n = Ad,
    minReplayDuration: r = Fd,
    maxReplayDuration: o = Fo,
    stickySession: s = !0,
    useCompression: i = !0,
    workerUrl: a,
    _experiments: c = {},
    maskAllText: u = !0,
    maskAllInputs: d = !0,
    blockAllMedia: l = !0,
    mutationBreadcrumbLimit: f = 750,
    mutationLimit: h = 1e4,
    slowClickTimeout: p = 7e3,
    slowClickIgnoreSelectors: m = [],
    networkDetailAllowUrls: _ = [],
    networkDetailDenyUrls: g = [],
    networkCaptureBodies: v = !0,
    networkRequestHeaders: M = [],
    networkResponseHeaders: w = [],
    mask: I = [],
    maskAttributes: S = ["title", "placeholder", "aria-label"],
    unmask: C = [],
    block: x = [],
    unblock: y = [],
    ignore: k = [],
    maskFn: F,
    beforeAddRecordingEvent: b,
    beforeErrorSampling: A,
    onError: U,
  } = {}) {
    this.name = "Replay";
    const j = rm({ mask: I, unmask: C, block: x, unblock: y, ignore: k });
    if (
      ((this._recordingOptions = {
        maskAllInputs: d,
        maskAllText: u,
        maskInputOptions: { password: !0 },
        maskTextFn: F,
        maskInputFn: F,
        maskAttributeFn: (Q, D, q) =>
          om({
            maskAttributes: S,
            maskAllText: u,
            privacyOptions: j,
            key: Q,
            value: D,
            el: q,
          }),
        ...j,
        slimDOMOptions: "all",
        inlineStylesheet: !0,
        inlineImages: !1,
        collectFonts: !0,
        errorHandler: (Q) => {
          try {
            Q.__rrweb__ = !0;
          } catch {}
        },
        recordCrossOriginIframes: !!c.recordCrossOriginIframes,
      }),
      (this._initialOptions = {
        flushMinDelay: t,
        flushMaxDelay: n,
        minReplayDuration: Math.min(r, Bd),
        maxReplayDuration: Math.min(o, Fo),
        stickySession: s,
        useCompression: i,
        workerUrl: a,
        blockAllMedia: l,
        maskAllInputs: d,
        maskAllText: u,
        mutationBreadcrumbLimit: f,
        mutationLimit: h,
        slowClickTimeout: p,
        slowClickIgnoreSelectors: m,
        networkDetailAllowUrls: _,
        networkDetailDenyUrls: g,
        networkCaptureBodies: v,
        networkRequestHeaders: is(M),
        networkResponseHeaders: is(w),
        beforeAddRecordingEvent: b,
        beforeErrorSampling: A,
        onError: U,
        _experiments: c,
      }),
      this._initialOptions.blockAllMedia &&
        (this._recordingOptions.blockSelector = this._recordingOptions
          .blockSelector
          ? `${this._recordingOptions.blockSelector},${os}`
          : os),
      this._isInitialized && Gn())
    )
      throw new Error(
        "Multiple Sentry Session Replay instances are not supported",
      );
    this._isInitialized = !0;
  }
  get _isInitialized() {
    return ss;
  }
  set _isInitialized(t) {
    ss = t;
  }
  afterAllSetup(t) {
    !Gn() || this._replay || (this._setup(t), this._initialize(t));
  }
  start() {
    this._replay && this._replay.start();
  }
  startBuffering() {
    this._replay && this._replay.startBuffering();
  }
  stop() {
    return this._replay
      ? this._replay.stop({
          forceFlush: this._replay.recordingMode === "session",
        })
      : Promise.resolve();
  }
  flush(t) {
    return this._replay
      ? this._replay.isEnabled()
        ? this._replay.sendBufferedReplayOrFlush(t)
        : (this._replay.start(), Promise.resolve())
      : Promise.resolve();
  }
  getReplayId() {
    if (this._replay?.isEnabled()) return this._replay.getSessionId();
  }
  getRecordingMode() {
    if (this._replay?.isEnabled()) return this._replay.recordingMode;
  }
  _initialize(t) {
    this._replay &&
      (this._maybeLoadFromReplayCanvasIntegration(t),
      this._replay.initializeSampling());
  }
  _setup(t) {
    const n = cm(this._initialOptions, t);
    this._replay = new nm({
      options: n,
      recordingOptions: this._recordingOptions,
    });
  }
  _maybeLoadFromReplayCanvasIntegration(t) {
    try {
      const n = t.getIntegrationByName("ReplayCanvas");
      if (!n) return;
      this._replay._canvas = n.getOptions();
    } catch {}
  }
}
function cm(e, t) {
  const n = t.getOptions(),
    r = { sessionSampleRate: 0, errorSampleRate: 0, ...e },
    o = Bn(n.replaysSessionSampleRate),
    s = Bn(n.replaysOnErrorSampleRate);
  return (
    o == null && s == null && mn(() => {}),
    o != null && (r.sessionSampleRate = o),
    s != null && (r.errorSampleRate = s),
    r
  );
}
function is(e) {
  return [...sm, ...e.map((t) => t.toLowerCase())];
}
const as = 1e6,
  Zt = String(0),
  lm = "main",
  fn = ne.navigator;
let Ji = "",
  Zi = "",
  Qi = "",
  dr = fn?.userAgent || "",
  ea = "";
const um = fn?.language || fn?.languages?.[0] || "";
function dm(e) {
  return typeof e == "object" && e !== null && "getHighEntropyValues" in e;
}
const cs = fn?.userAgentData;
dm(cs) &&
  cs
    .getHighEntropyValues([
      "architecture",
      "model",
      "platform",
      "platformVersion",
      "fullVersionList",
    ])
    .then((e) => {
      if (
        ((Ji = e.platform || ""),
        (Qi = e.architecture || ""),
        (ea = e.model || ""),
        (Zi = e.platformVersion || ""),
        e.fullVersionList?.length)
      ) {
        const t = e.fullVersionList[e.fullVersionList.length - 1];
        dr = `${t.brand} ${t.version}`;
      }
    })
    .catch((e) => {});
function fm(e) {
  return !("thread_metadata" in e);
}
function hm(e) {
  return fm(e) ? gm(e) : e;
}
function pm(e) {
  const t = e.contexts?.trace?.trace_id;
  return (
    typeof t == "string" &&
      t.length !== 32 &&
      Z &&
      E.log(`[Profiling] Invalid traceId: ${t} on profiled event`),
    typeof t != "string" ? "" : t
  );
}
function mm(e, t, n, r) {
  if (r.type !== "transaction")
    throw new TypeError(
      "Profiling events may only be attached to transactions, this should never occur.",
    );
  if (n == null)
    throw new TypeError(
      `Cannot construct profiling event envelope without a valid profile. Got ${n} instead.`,
    );
  const o = pm(r),
    s = hm(n),
    i =
      t ||
      (typeof r.start_timestamp == "number"
        ? r.start_timestamp * 1e3
        : jn() * 1e3),
    a = typeof r.timestamp == "number" ? r.timestamp * 1e3 : jn() * 1e3;
  return {
    event_id: e,
    timestamp: new Date(i).toISOString(),
    platform: "javascript",
    version: "1",
    release: r.release || "",
    environment: r.environment || ps,
    runtime: { name: "javascript", version: ne.navigator.userAgent },
    os: { name: Ji, version: Zi, build_number: dr },
    device: {
      locale: um,
      model: ea,
      manufacturer: dr,
      architecture: Qi,
      is_emulator: !1,
    },
    debug_meta: { images: vm(n.resources) },
    profile: s,
    transactions: [
      {
        name: r.transaction || "",
        id: r.event_id || Ke(),
        trace_id: o,
        active_thread_id: Zt,
        relative_start_ns: "0",
        relative_end_ns: ((a - i) * 1e6).toFixed(0),
      },
    ],
  };
}
function ta(e) {
  return qe(e).op === "pageload";
}
function gm(e) {
  let t,
    n = 0;
  const r = {
      samples: [],
      stacks: [],
      frames: [],
      thread_metadata: { [Zt]: { name: lm } },
    },
    o = e.samples[0];
  if (!o) return r;
  const s = o.timestamp,
    i = Ts(),
    a =
      typeof performance.timeOrigin == "number"
        ? performance.timeOrigin
        : i || 0,
    c = a - (i || a);
  return (
    e.samples.forEach((u, d) => {
      if (u.stackId === void 0) {
        (t === void 0 && ((t = n), (r.stacks[t] = []), n++),
          (r.samples[d] = {
            elapsed_since_start_ns: ((u.timestamp + c - s) * as).toFixed(0),
            stack_id: t,
            thread_id: Zt,
          }));
        return;
      }
      let l = e.stacks[u.stackId];
      const f = [];
      for (; l; ) {
        f.push(l.frameId);
        const p = e.frames[l.frameId];
        (p &&
          r.frames[l.frameId] === void 0 &&
          (r.frames[l.frameId] = {
            function: p.name,
            abs_path:
              typeof p.resourceId == "number"
                ? e.resources[p.resourceId]
                : void 0,
            lineno: p.line,
            colno: p.column,
          }),
          (l = l.parentId === void 0 ? void 0 : e.stacks[l.parentId]));
      }
      const h = {
        elapsed_since_start_ns: ((u.timestamp + c - s) * as).toFixed(0),
        stack_id: n,
        thread_id: Zt,
      };
      ((r.stacks[n] = f), (r.samples[d] = h), n++);
    }),
    r
  );
}
function _m(e, t) {
  if (!t.length) return e;
  for (const n of t) e[1].push([{ type: "profile" }, n]);
  return e;
}
function ym(e) {
  const t = [];
  return (
    Un(e, (n, r) => {
      if (r === "transaction")
        for (let o = 1; o < n.length; o++)
          n[o]?.contexts?.profile?.profile_id && t.push(n[o]);
    }),
    t
  );
}
function vm(e) {
  const r = re()?.getOptions()?.stackParser;
  return r ? Va(r, e) : [];
}
function bm(e) {
  return (typeof e != "number" && typeof e != "boolean") ||
    (typeof e == "number" && isNaN(e))
    ? (Z &&
        E.warn(
          `[Profiling] Invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(e)} of type ${JSON.stringify(typeof e)}.`,
        ),
      !1)
    : e === !0 || e === !1
      ? !0
      : e < 0 || e > 1
        ? (Z &&
            E.warn(
              `[Profiling] Invalid sample rate. Sample rate must be between 0 and 1. Got ${e}.`,
            ),
          !1)
        : !0;
}
function Sm(e) {
  return e.samples.length < 2
    ? (Z &&
        E.log(
          "[Profiling] Discarding profile because it contains less than 2 samples",
        ),
      !1)
    : e.frames.length
      ? !0
      : (Z &&
          E.log("[Profiling] Discarding profile because it contains no frames"),
        !1);
}
let na = !1;
const ra = 3e4;
function Em(e) {
  return typeof e == "function";
}
function wm() {
  const e = ne.Profiler;
  if (!Em(e)) {
    Z &&
      E.log(
        "[Profiling] Profiling is not supported by this browser, Profiler interface missing on window object.",
      );
    return;
  }
  const t = 10,
    n = Math.floor(ra / t);
  try {
    return new e({ sampleInterval: t, maxBufferSize: n });
  } catch {
    (Z &&
      (E.log(
        "[Profiling] Failed to initialize the Profiling constructor, this is likely due to a missing 'Document-Policy': 'js-profiling' header.",
      ),
      E.log("[Profiling] Disabling profiling for current user session.")),
      (na = !0));
  }
}
function ls(e) {
  if (na)
    return (
      Z &&
        E.log(
          "[Profiling] Profiling has been disabled for the duration of the current user session.",
        ),
      !1
    );
  if (!e.isRecording())
    return (
      Z &&
        E.log(
          "[Profiling] Discarding profile because transaction was not sampled.",
        ),
      !1
    );
  const n = re()?.getOptions();
  if (!n)
    return (
      Z && E.log("[Profiling] Profiling disabled, no options found."),
      !1
    );
  const r = n.profilesSampleRate;
  return bm(r)
    ? r
      ? (r === !0 ? !0 : Math.random() < r)
        ? !0
        : (Z &&
            E.log(
              `[Profiling] Discarding profile because it's not included in the random sample (sampling rate = ${Number(r)})`,
            ),
          !1)
      : (Z &&
          E.log(
            "[Profiling] Discarding profile because a negative sampling decision was inherited or profileSampleRate is set to 0",
          ),
        !1)
    : (Z &&
        E.warn(
          "[Profiling] Discarding profile because of invalid sample rate.",
        ),
      !1);
}
function km(e, t, n, r) {
  return Sm(n) ? mm(e, t, n, r) : null;
}
const Ye = new Map();
function Im() {
  return Ye.size;
}
function Cm(e) {
  const t = Ye.get(e);
  return (t && Ye.delete(e), t);
}
function xm(e, t) {
  if ((Ye.set(e, t), Ye.size > 30)) {
    const n = Ye.keys().next().value;
    Ye.delete(n);
  }
}
function us(e) {
  let t;
  ta(e) && (t = jn() * 1e3);
  const n = wm();
  if (!n) return;
  Z && E.log(`[Profiling] started profiling span: ${qe(e).description}`);
  const r = Ke();
  Le().setContext("profile", { profile_id: r, start_timestamp: t });
  async function o() {
    if (e && n)
      return n
        .stop()
        .then((c) => {
          if (
            (s && (ne.clearTimeout(s), (s = void 0)),
            Z &&
              E.log(
                `[Profiling] stopped profiling of span: ${qe(e).description}`,
              ),
            !c)
          ) {
            Z &&
              E.log(
                `[Profiling] profiler returned null profile for: ${qe(e).description}`,
                "this may indicate an overlapping span or a call to stopProfiling with a profile title that was never started",
              );
            return;
          }
          xm(r, c);
        })
        .catch((c) => {
          Z && E.log("[Profiling] error while stopping profiler:", c);
        });
  }
  let s = ne.setTimeout(() => {
    (Z &&
      E.log(
        "[Profiling] max profile duration elapsed, stopping profiling for:",
        qe(e).description,
      ),
      o());
  }, ra);
  const i = e.end.bind(e);
  function a() {
    return e
      ? (o().then(
          () => {
            i();
          },
          () => {
            i();
          },
        ),
        e)
      : i();
  }
  e.end = a;
}
const Tm = "BrowserProfiling",
  Rm = () => ({
    name: Tm,
    setup(e) {
      const t = gr(),
        n = t && zn(t);
      (n && ta(n) && ls(n) && us(n),
        e.on("spanStart", (r) => {
          r === zn(r) && ls(r) && us(r);
        }),
        e.on("beforeEnvelope", (r) => {
          if (!Im()) return;
          const o = ym(r);
          if (!o.length) return;
          const s = [];
          for (const i of o) {
            const a = i?.contexts,
              c = a?.profile?.profile_id,
              u = a?.profile?.start_timestamp;
            if (typeof c != "string") {
              Z &&
                E.log(
                  "[Profiling] cannot find profile for a span without a profile context",
                );
              continue;
            }
            if (!c) {
              Z &&
                E.log(
                  "[Profiling] cannot find profile for a span without a profile context",
                );
              continue;
            }
            a?.profile && delete a.profile;
            const d = Cm(c);
            if (!d) {
              Z &&
                E.log(`[Profiling] Could not retrieve profile for span: ${c}`);
              continue;
            }
            const l = km(c, u, d, i);
            l && s.push(l);
          }
          _m(r, s);
        }));
    },
  }),
  Mm = we(Rm);
function Am(e) {
  const t = { defaultIntegrations: [...ci()], ...e };
  return (Fs(t, "nuxt", ["nuxt", "vue"]), Cd(t));
}
var Om = {};
const Hr = Ya(),
  Dm = Hr.public.sentryDsn,
  Lm = Hr.public.sentryFeedback,
  Nm = Hr.public.sentryDebug,
  Pm = uu({ colorScheme: "system", isNameRequired: !0, isEmailRequired: !0 }),
  Fm = [im(), Ga(), Mm(), ...(Lm ? [Pm] : [])];
Am({
  dsn: Dm,
  environment: "production",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 0.1,
  profilesSampleRate: 0.1,
  tracePropagationTargets: [Om.API_URL || "localhost"],
  integrations: Fm,
  _experiments: { enableLogs: !0 },
  debug: Nm,
});
//# sourceMappingURL=DmQViKSn.js.map
