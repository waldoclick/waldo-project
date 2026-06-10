import {
  aZ as X,
  b8 as F,
  be as j,
  bm as A9,
  cA as F9,
  b0 as l,
  cB as R,
  cC as j9,
  bO as R9,
  cD as H9,
  b9 as D,
  bn as a9,
  cE as H,
  bI as n9,
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
    s = new e.Error().stack;
  s &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[s] = "936e213e-8967-4a64-8069-ed55927ba3d0"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-936e213e-8967-4a64-8069-ed55927ba3d0"));
} catch {}
const p = "vel",
  v = X({
    name: "SvgIcon",
    props: { type: { type: String, default: "" } },
    setup: (e) => () =>
      l("svg", { class: `${p}-icon icon`, "aria-hidden": "true" }, [
        l("use", { "xlink:href": `#icon-${e.type}` }, null),
      ]),
  }),
  _ = typeof window < "u",
  x = () => {};
let g9 = !1;
if (_)
  try {
    const e = {};
    (Object.defineProperty(e, "passive", {
      get() {
        g9 = !0;
      },
    }),
      window.addEventListener("test-passive", x, e));
  } catch {}
const i9 = function (e, s, r) {
    let c = arguments.length > 3 && arguments[3] !== void 0 && arguments[3];
    _ && e.addEventListener(s, r, !!g9 && { capture: !1, passive: c });
  },
  s9 = (e, s, r) => {
    _ && e.removeEventListener(s, r);
  },
  N9 = (e) => {
    e.preventDefault();
  },
  V9 = Object.prototype.toString,
  P = (e) => (s) => V9.call(s).slice(8, -1) === e,
  Z9 = (e) => !!e && P("Object")(e),
  r9 = (e) => !!e && P("String")(e);
function P9(e) {
  return e != null;
}
const U9 = X({
    name: "Toolbar",
    props: {
      zoomIn: { type: Function, default: x },
      zoomOut: { type: Function, default: x },
      rotateLeft: { type: Function, default: x },
      rotateRight: { type: Function, default: x },
      resize: { type: Function, default: x },
      rotateDisabled: { type: Boolean, default: !1 },
      zoomDisabled: { type: Boolean, default: !1 },
    },
    setup: (e) => () =>
      l("div", { class: `${p}-toolbar` }, [
        !e.zoomDisabled &&
          l(a9, null, [
            l(
              "div",
              {
                role: "button",
                "aria-label": "zoom in button",
                class: "toolbar-btn toolbar-btn__zoomin",
                onClick: e.zoomIn,
              },
              [l(v, { type: "zoomin" }, null)],
            ),
            l(
              "div",
              {
                role: "button",
                "aria-label": "zoom out button",
                class: "toolbar-btn toolbar-btn__zoomout",
                onClick: e.zoomOut,
              },
              [l(v, { type: "zoomout" }, null)],
            ),
          ]),
        l(
          "div",
          {
            role: "button",
            "aria-label": "resize image button",
            class: "toolbar-btn toolbar-btn__resize",
            onClick: e.resize,
          },
          [l(v, { type: "resize" }, null)],
        ),
        !e.rotateDisabled &&
          l(a9, null, [
            l(
              "div",
              {
                role: "button",
                "aria-label": "image rotate left button",
                class: "toolbar-btn toolbar-btn__rotate",
                onClick: e.rotateLeft,
              },
              [l(v, { type: "rotate-left" }, null)],
            ),
            l(
              "div",
              {
                role: "button",
                "aria-label": "image rotate right button",
                class: "toolbar-btn toolbar-btn__rotate",
                onClick: e.rotateRight,
              },
              [l(v, { type: "rotate-right" }, null)],
            ),
          ]),
      ]),
  }),
  q9 = () =>
    l("div", { class: `${p}-loading` }, [l("div", { class: "ring" }, null)]),
  W9 = () =>
    l("div", { class: `${p}-on-error` }, [
      l("div", { class: "ring" }, null),
      l(v, { type: "img-broken" }, null),
    ]),
  G9 = (e, s) => {
    let { slots: r } = s;
    return l("div", { class: `${p}-img-title` }, [
      r.default ? r.default() : "",
    ]);
  },
  J9 = X({
    name: "DefaultIcons",
    setup: () => () =>
      l(
        "svg",
        {
          "aria-hidden": !0,
          style:
            "position: absolute; width: 0; height: 0; overflow: hidden; visibility: hidden;",
        },
        [
          l("symbol", { id: "icon-rotate-right", viewBox: "0 0 1024 1024" }, [
            l(
              "path",
              {
                d: "M275.199914 450.496179v20.031994c0.384-38.079988 12.543996-67.423979 36.479989-87.967973 22.431993-20.351994 49.215985-30.55999 80.319975-30.55999 32.06399 0 59.295981 10.175997 81.759974 30.55999 22.815993 20.543994 34.591989 49.887984 35.359989 87.967973v123.935961c-0.768 37.887988-12.543996 67.135979-35.359989 87.679973-22.431993 20.351994-49.695984 30.75199-81.759974 31.10399a120.255962 120.255962 0 0 1-72.991978-24.895992c-21.503993-15.839995-35.359989-38.751988-41.567987-68.735979h60.831981c9.247997 23.007993 27.167992 34.495989 53.759983 34.49599 37.535988-0.384 56.863982-21.407993 57.983982-63.071981v-38.751988c-28.095991 8.863997-54.303983 13.119996-78.623975 12.735996a91.263971 91.263971 0 0 1-68.447979-27.711991c-18.847994-18.303994-28.095991-47.231985-27.711991-86.847973z m62.55998 24.863992c7.103998 24.799992 25.215992 37.343988 54.271983 37.663989 27.103992-0.288 44.703986-11.327996 52.831984-33.11999 3.135999-8.383997 2.655999-29.599991-1.28-38.559988-8.607997-19.615994-25.791992-29.695991-51.551984-30.20799-28.383991 0.576-46.303986 12.639996-53.759983 36.159988a58.719982 58.719982 0 0 0-0.512 28.063991z m390.335878 115.711964v-116.895963c-1.12-41.311987-20.447994-62.335981-57.983981-63.07198-37.727988 0.768-56.959982 21.791993-57.695982 63.07198v116.895963c0.768 41.663987 19.999994 62.68798 57.695982 63.071981 37.535988-0.384 56.863982-21.407993 57.983981-63.071981z m-174.815945 3.391999v-123.935961c0.384-38.079988 12.543996-67.423979 36.479989-87.967973 22.431993-20.351994 49.215985-30.55999 80.319975-30.55999 32.06399 0 59.295981 10.175997 81.759974 30.55999 22.815993 20.543994 34.591989 49.887984 35.359989 87.967973v123.935961c-0.768 37.887988-12.543996 67.135979-35.359989 87.679973-22.431993 20.351994-49.695984 30.75199-81.759974 31.10399-31.10399-0.384-57.887982-10.751997-80.319975-31.10399-23.935993-20.543994-36.127989-49.791984-36.479989-87.679973z m282.559912-479.07185A509.887841 509.887841 0 0 0 511.99984 0.00032C229.215928 0.00032 0 229.216248 0 512.00016s229.215928 511.99984 511.99984 511.99984 511.99984-229.215928 511.99984-511.99984c0-3.743999-0.032-7.455998-0.128-11.167997-1.631999-11.295996-8.159997-27.103992-31.87199-27.103991-27.487991 0-31.67999 21.247993-32.03199 32.06399l0.032 4.127999a30.62399 30.62399 0 0 0 0.16 2.079999H959.9997c0 247.423923-200.575937 447.99986-447.99986 447.99986S63.99998 759.424083 63.99998 512.00016 264.575917 64.0003 511.99984 64.0003a446.079861 446.079861 0 0 1 277.439913 96.22397l-94.91197 91.679971c-25.439992 24.607992-17.439995 44.991986 17.887994 45.599986l188.031942 3.295999a64.31998 64.31998 0 0 0 65.055979-62.84798l3.295999-188.127942C969.407697 15.040315 949.311703 5.792318 923.871711 30.368311l-87.999972 85.023973z",
                fill: "",
              },
              null,
            ),
          ]),
          l("symbol", { id: "icon-rotate-left", viewBox: "0 0 1024 1024" }, [
            l(
              "path",
              {
                d: "M275.199914 450.496179v20.031994c0.384-38.079988 12.543996-67.423979 36.479989-87.967973 22.431993-20.351994 49.215985-30.55999 80.319975-30.55999 32.06399 0 59.295981 10.175997 81.759974 30.55999 22.815993 20.543994 34.591989 49.887984 35.359989 87.967973v123.935961c-0.768 37.887988-12.543996 67.135979-35.359989 87.679973-22.431993 20.351994-49.695984 30.75199-81.759974 31.10399a120.255962 120.255962 0 0 1-72.991978-24.895992c-21.503993-15.839995-35.359989-38.751988-41.567987-68.735979h60.831981c9.247997 23.007993 27.167992 34.495989 53.759983 34.49599 37.535988-0.384 56.863982-21.407993 57.983982-63.071981v-38.751988c-28.095991 8.863997-54.303983 13.119996-78.623975 12.735996a91.263971 91.263971 0 0 1-68.447979-27.711991c-18.847994-18.303994-28.095991-47.231985-27.711991-86.847973z m62.55998 24.863992c7.103998 24.799992 25.215992 37.343988 54.271983 37.663989 27.103992-0.288 44.703986-11.327996 52.831984-33.11999 3.135999-8.383997 2.655999-29.599991-1.28-38.559988-8.607997-19.615994-25.791992-29.695991-51.551984-30.20799-28.383991 0.576-46.303986 12.639996-53.759983 36.159988a58.719982 58.719982 0 0 0-0.512 28.063991z m390.335878 115.711964v-116.895963c-1.12-41.311987-20.447994-62.335981-57.983981-63.07198-37.727988 0.768-56.959982 21.791993-57.695982 63.07198v116.895963c0.768 41.663987 19.999994 62.68798 57.695982 63.071981 37.535988-0.384 56.863982-21.407993 57.983981-63.071981z m-174.815945 3.391999v-123.935961c0.384-38.079988 12.543996-67.423979 36.479989-87.967973 22.431993-20.351994 49.215985-30.55999 80.319975-30.55999 32.06399 0 59.295981 10.175997 81.759974 30.55999 22.815993 20.543994 34.591989 49.887984 35.359989 87.967973v123.935961c-0.768 37.887988-12.543996 67.135979-35.359989 87.679973-22.431993 20.351994-49.695984 30.75199-81.759974 31.10399-31.10399-0.384-57.887982-10.751997-80.319975-31.10399-23.935993-20.543994-36.127989-49.791984-36.479989-87.679973zM188.159941 115.392284A509.887841 509.887841 0 0 1 511.99984 0.00032c282.783912 0 511.99984 229.215928 511.99984 511.99984s-229.215928 511.99984-511.99984 511.99984S0 794.784072 0 512.00016c0-3.743999 0.032-7.455998 0.128-11.167997 1.631999-11.295996 8.159997-27.103992 31.87199-27.103991 27.487991 0 31.67999 21.247993 32.03199 32.06399L63.99998 509.920161a30.62399 30.62399 0 0 1-0.16 2.079999H63.99998c0 247.423923 200.575937 447.99986 447.99986 447.99986s447.99986-200.575937 447.99986-447.99986S759.423763 64.0003 511.99984 64.0003a446.079861 446.079861 0 0 0-277.439913 96.22397l94.91197 91.679971c25.439992 24.607992 17.439995 44.991986-17.887994 45.599986L123.551961 300.800226a64.31998 64.31998 0 0 1-65.055979-62.84798l-3.295999-188.127942C54.591983 15.040315 74.687977 5.792318 100.127969 30.368311l87.999972 85.023973z",
                fill: "",
              },
              null,
            ),
          ]),
          l("symbol", { id: "icon-resize", viewBox: "0 0 1024 1024" }, [
            l(
              "path",
              {
                d: "M456.036919 791.8108 270.553461 791.8108 460.818829 601.572038l-39.593763-39.567157L231.314785 751.915162l0.873903-183.953615c0-15.465227-12.515035-27.981285-27.981285-27.981285s-27.981285 12.515035-27.981285 27.981285l0 251.829516c0 8.3072 3.415796 14.975063 8.826016 19.564591 5.082762 5.192256 12.132318 8.416693 19.947308 8.416693l251.036453 0c15.46625 0 27.981285-12.514012 27.981285-27.981285C484.018204 804.325835 471.504192 791.8108 456.036919 791.8108zM838.945819 184.644347c-5.082762-5.191232-12.132318-8.416693-19.947308-8.416693L567.961034 176.227654c-15.46625 0-27.981285 12.515035-27.981285 27.981285 0 15.46625 12.514012 27.981285 27.981285 27.981285l185.483458 0L563.206754 422.427962l39.567157 39.567157 189.910281-189.910281-0.873903 183.953615c0 15.46625 12.514012 27.981285 27.981285 27.981285s27.981285-12.514012 27.981285-27.981285L847.772858 204.208938C847.771835 195.902762 844.356039 189.234899 838.945819 184.644347zM847.771835 64.303538 176.227142 64.303538c-61.809741 0-111.924115 50.115398-111.924115 111.924115l0 671.544693c0 61.809741 50.114374 111.924115 111.924115 111.924115l671.544693 0c61.809741 0 111.924115-50.114374 111.924115-111.924115l0-671.544693C959.69595 114.418936 909.581576 64.303538 847.771835 64.303538zM903.733381 847.772346c0 30.878265-25.056676 55.962569-55.962569 55.962569L176.227142 903.734916c-30.90487 0-55.962569-25.084305-55.962569-55.962569l0-671.544693c0-30.9325 25.056676-55.962569 55.962569-55.962569l671.544693 0c30.90487 0 55.962569 25.03007 55.962569 55.962569L903.734404 847.772346z",
              },
              null,
            ),
          ]),
          l("symbol", { id: "icon-img-broken", viewBox: "0 0 1024 1024" }, [
            l(
              "path",
              {
                d: "M810.666667 128H213.333333c-46.933333 0-85.333333 38.4-85.333333 85.333333v597.333334c0 46.933333 38.4 85.333333 85.333333 85.333333h597.333334c46.933333 0 85.333333-38.4 85.333333-85.333333V213.333333c0-46.933333-38.4-85.333333-85.333333-85.333333z m0 682.666667H213.333333v-195.413334l42.24 42.24 170.666667-170.666666 170.666667 170.666666 170.666666-170.24L810.666667 530.346667V810.666667z m0-401.493334l-43.093334-43.093333-170.666666 171.093333-170.666667-170.666666-170.666667 170.666666-42.24-42.666666V213.333333h597.333334v195.84z",
              },
              null,
            ),
          ]),
          l("symbol", { id: "icon-prev", viewBox: "0 0 1024 1024" }, [
            l(
              "path",
              {
                d: "M784.652701 955.6957 346.601985 517.644983c-2.822492-2.822492-2.822492-7.902977 0-11.289967l439.179713-439.179713c6.77398-6.77398 10.725469-16.370452 10.725469-25.966924L796.507166 36.692393c0-20.32194-16.370452-36.692393-36.692393-36.692393l-4.515987 0c-9.596472 0-19.192944 3.951488-25.966924 10.725469L250.072767 489.420066c-12.418964 12.418964-12.418964 32.740904 0 45.159868l477.565601 477.565601c7.338479 7.338479 17.499449 11.854465 28.224917 11.854465l0 0c22.015436 0 40.079383-18.063947 40.079383-40.079383l0 0C796.507166 973.759647 791.99118 963.598677 784.652701 955.6957z",
              },
              null,
            ),
          ]),
          l("symbol", { id: "icon-next", viewBox: "0 0 1024 1024" }, [
            l(
              "path",
              {
                d: "M246.121279 955.6957l438.050717-438.050717c2.822492-2.822492 2.822492-7.902977 0-11.289967L244.992282 67.175303c-6.77398-6.77398-10.725469-16.370452-10.725469-25.966924L234.266814 36.692393C234.266814 16.370452 250.637266 0 270.959206 0l4.515987 0c9.596472 0 19.192944 3.951488 25.966924 10.725469l478.694598 478.694598c12.418964 12.418964 12.418964 32.740904 0 45.159868l-477.565601 477.565601c-7.338479 7.338479-17.499449 11.854465-28.224917 11.854465l0 0c-22.015436 0-40.079383-18.063947-40.079383-40.079383l0 0C234.266814 973.759647 238.7828 963.598677 246.121279 955.6957z",
              },
              null,
            ),
          ]),
          l("symbol", { id: "icon-zoomin", viewBox: "0 0 1024 1024" }, [
            l(
              "path",
              {
                d: "M725.504 652.864c46.4-61.44 71.744-136.448 71.744-218.752C797.248 230.464 632.768 64 430.656 64S64 230.464 64 434.112C64 639.36 228.48 805.76 430.656 805.76c86.656 0 164.48-30.144 227.52-81.088L889.984 960 960 891.264l-234.496-238.4z m-294.848 67.456c-155.776 0-282.624-128.896-282.624-286.208s126.848-286.208 282.624-286.208 282.624 128.896 282.624 286.208-126.912 286.208-282.624 286.208z",
              },
              null,
            ),
            l("path", { d: "M235.712 369.92h390.72v127.104H235.712z" }, null),
            l("path", { d: "M367.488 238.144h127.104v390.72H367.488z" }, null),
          ]),
          l("symbol", { id: "icon-close", viewBox: "0 0 1024 1024" }, [
            l(
              "path",
              {
                d: "M570.24 512l259.2 259.2-58.88 58.24L512 570.24l-261.12 261.12-58.24-58.24L453.76 512 194.56 252.8l58.24-58.24L512 453.76l261.12-261.12 58.24 58.24z",
              },
              null,
            ),
          ]),
          l("symbol", { id: "icon-zoomout", viewBox: "0 0 1024 1024" }, [
            l(
              "path",
              {
                d: "M725.504 652.864c46.4-61.44 71.744-136.448 71.744-218.752C797.248 230.464 632.768 64 430.656 64S64 230.464 64 434.112C64 639.36 228.48 805.76 430.656 805.76c86.656 0 164.48-30.144 227.52-81.088L889.984 960 960 891.264l-234.496-238.4z m-294.848 67.456c-155.776 0-282.624-128.896-282.624-286.208s126.848-286.208 282.624-286.208 282.624 128.896 282.624 286.208-126.912 286.208-282.624 286.208z",
              },
              null,
            ),
            l("path", { d: "M235.712 369.92h390.72v127.104H235.712z" }, null),
          ]),
        ],
      ),
  }),
  C = _ ? window : global;
let c9 = Date.now();
function K9(e) {
  const s = Date.now(),
    r = Math.max(0, 16 - (s - c9)),
    c = setTimeout(e, r);
  return ((c9 = s + r), c);
}
function N(e) {
  return (C.requestAnimationFrame || K9).call(C, e);
}
function u9(e) {
  (C.cancelAnimationFrame || C.clearTimeout).call(C, e);
}
function d9(e, s) {
  const r = e.clientX - s.clientX,
    c = e.clientY - s.clientY;
  return Math.sqrt(r * r + c * c);
}
function V(e) {
  return (
    typeof e == "function" ||
    (Object.prototype.toString.call(e) === "[object Object]" && !H9(e))
  );
}
var Z = X({
  name: "VueEasyLightbox",
  props: {
    imgs: { type: [Array, String], default: () => "" },
    visible: { type: Boolean, default: !1 },
    index: { type: Number, default: 0 },
    scrollDisabled: { type: Boolean, default: !0 },
    escDisabled: { type: Boolean, default: !1 },
    moveDisabled: { type: Boolean, default: !1 },
    titleDisabled: { type: Boolean, default: !1 },
    maskClosable: { type: Boolean, default: !0 },
    teleport: { type: [String, Object], default: null },
    swipeTolerance: { type: Number, default: 50 },
    loop: { type: Boolean, default: !1 },
    rtl: { type: Boolean, default: !1 },
    zoomScale: { type: Number, default: 0.12 },
    maxZoom: { type: Number, default: 3 },
    minZoom: { type: Number, default: 0.1 },
    rotateDisabled: { type: Boolean, default: !1 },
    zoomDisabled: { type: Boolean, default: !1 },
    pinchDisabled: { type: Boolean, default: !1 },
    dblclickDisabled: { type: Boolean, default: !1 },
  },
  emits: {
    hide: () => !0,
    "on-error": (e) => !0,
    "on-prev": (e, s) => !0,
    "on-next": (e, s) => !0,
    "on-prev-click": (e, s) => !0,
    "on-next-click": (e, s) => !0,
    "on-index-change": (e, s) => !0,
    "on-rotate": (e) => !0,
  },
  setup(e, s) {
    let { emit: r, slots: c } = s;
    const {
        imgRef: f9,
        imgState: y,
        setImgSize: U,
      } = (() => {
        const t = F(),
          o = H({ width: 0, height: 0, maxScale: 1 });
        return {
          imgRef: t,
          imgState: o,
          setImgSize: () => {
            if (t.value) {
              const { width: n, height: d, naturalWidth: m } = t.value;
              ((o.maxScale = m / n), (o.width = n), (o.height = d));
            }
          },
        };
      })(),
      f = F(e.index),
      q = F(""),
      a = H({
        scale: 1,
        lastScale: 1,
        rotateDeg: 0,
        top: 0,
        left: 0,
        initX: 0,
        initY: 0,
        lastX: 0,
        lastY: 0,
        touches: [],
      }),
      i = H({
        loadError: !1,
        loading: !1,
        dragging: !1,
        gesturing: !1,
        wheeling: !1,
      }),
      g = D(() => {
        return (
          (t = e.imgs),
          P("Array")(t)
            ? e.imgs
                .map((o) =>
                  typeof o == "string"
                    ? { src: o }
                    : (function (n) {
                          return Z9(n) && r9(n.src);
                        })(o)
                      ? o
                      : void 0,
                )
                .filter(P9)
            : r9(e.imgs)
              ? [{ src: e.imgs }]
              : []
        );
        var t;
      }),
      b9 = D(() => g.value[f.value]),
      W = D(() => g.value[f.value]?.src),
      G = D(() => g.value[f.value]?.title),
      m9 = D(() => g.value[f.value]?.alt),
      p9 = D(() => ({
        cursor: i.loadError
          ? "default"
          : e.moveDisabled
            ? i.dragging
              ? "grabbing"
              : "grab"
            : "move",
        top: `calc(50% + ${a.top}px)`,
        left: `calc(50% + ${a.left}px)`,
        transition: i.dragging || i.gesturing ? "none" : "",
        transform: `translate(-50%, -50%) scale(${a.scale}) rotate(${a.rotateDeg}deg)`,
      })),
      Y = () => {
        r("hide");
      },
      J = () => {
        ((a.scale = 1),
          (a.lastScale = 1),
          (a.rotateDeg = 0),
          (a.top = 0),
          (a.left = 0),
          (i.loadError = !1),
          (i.dragging = !1),
          (i.loading = !0));
      },
      E = (t, o) => {
        const n = f.value;
        (J(),
          (f.value = t),
          g.value[f.value] === g.value[t] &&
            n9(() => {
              i.loading = !1;
            }),
          e.visible && n !== t && (o && o(n, t), r("on-index-change", n, t)));
      },
      M = () => {
        const t = f.value,
          o = e.loop ? (t + 1) % g.value.length : t + 1;
        (!e.loop && o > g.value.length - 1) ||
          E(o, (n, d) => {
            (r("on-next", n, d), r("on-next-click", n, d));
          });
      },
      S = () => {
        const t = f.value;
        let o = t - 1;
        if (t === 0) {
          if (!e.loop) return;
          o = g.value.length - 1;
        }
        E(o, (n, d) => {
          (r("on-prev", n, d), r("on-prev-click", n, d));
        });
      },
      K = (t) => {
        (Math.abs(1 - t) < 0.05
          ? (t = 1)
          : Math.abs(y.maxScale - t) < 0.05 && (t = y.maxScale),
          (a.lastScale = a.scale),
          (a.scale = t));
      },
      B = () => {
        const t = a.scale + e.zoomScale;
        t < y.maxScale * e.maxZoom && K(t);
      },
      T = () => {
        const t = a.scale - e.zoomScale;
        t > e.minZoom && K(t);
      },
      Q = () => {
        const t = a.rotateDeg % 360;
        r("on-rotate", Math.abs(t < 0 ? t + 360 : t));
      },
      k = () => {
        ((a.rotateDeg -= 90), Q());
      },
      $ = () => {
        ((a.rotateDeg += 90), Q());
      },
      I = () => {
        ((a.scale = 1), (a.top = 0), (a.left = 0));
      },
      O = function () {
        let t =
          arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
        return !e.moveDisabled && t === 0;
      },
      {
        onMouseDown: v9,
        onMouseMove: h9,
        onMouseUp: y9,
      } = ((t, o, n) => {
        let d,
          m = !1;
        return {
          onMouseDown: (u) => {
            ((t.initX = t.lastX = u.clientX),
              (t.initY = t.lastY = u.clientY),
              (o.dragging = !0),
              (m = !1),
              u.stopPropagation());
          },
          onMouseUp: (u) => {
            (n(u.button) && u9(d), (o.dragging = !1), (m = !1));
          },
          onMouseMove: (u) => {
            if (o.dragging)
              if (n(u.button)) {
                if (m) return;
                ((m = !0),
                  (d = N(() => {
                    const { top: z, left: w, lastY: b, lastX: A } = t;
                    ((t.top = z - b + u.clientY),
                      (t.left = w - A + u.clientX),
                      (t.lastX = u.clientX),
                      (t.lastY = u.clientY),
                      (m = !1));
                  })));
              } else ((t.lastX = u.clientX), (t.lastY = u.clientY));
            u.stopPropagation();
          },
        };
      })(a, i, O),
      {
        onTouchStart: z9,
        onTouchMove: w9,
        onTouchEnd: D9,
      } = ((t, o, n, d, m) => {
        let u,
          z = !1;
        return {
          onTouchStart: (w) => {
            const { touches: b } = w;
            (b.length > 1 && m()
              ? ((n.gesturing = !0), (o.touches = b))
              : ((o.initX = o.lastX = b[0].clientX),
                (o.initY = o.lastY = b[0].clientY),
                (n.dragging = !0)),
              w.stopPropagation());
          },
          onTouchMove: (w) => {
            if (z) return;
            const { touches: b } = w,
              { lastX: A, lastY: E9, left: $9, top: I9, scale: O9 } = o;
            if (!n.gesturing && n.dragging) {
              if (!b[0]) return;
              const { clientX: L, clientY: h } = b[0];
              d()
                ? (u = N(() => {
                    ((o.lastX = L),
                      (o.lastY = h),
                      (o.top = I9 - E9 + h),
                      (o.left = $9 - A + L),
                      (z = !1));
                  }))
                : ((o.lastX = L), (o.lastY = h));
            } else
              n.gesturing &&
                o.touches.length > 1 &&
                b.length > 1 &&
                m() &&
                (u = N(() => {
                  const L =
                    (d9(o.touches[0], o.touches[1]) - d9(b[0], b[1])) / t.width;
                  o.touches = b;
                  const h = O9 - 1.3 * L;
                  (h > 0.5 && h < 1.5 * t.maxScale && (o.scale = h), (z = !1));
                }));
          },
          onTouchEnd: () => {
            (u9(u), (n.dragging = !1), (n.gesturing = !1), (z = !1));
          },
        };
      })(y, a, i, O, () => !e.pinchDisabled),
      x9 = () => {
        e.dblclickDisabled ||
          (a.scale !== y.maxScale
            ? ((a.lastScale = a.scale), (a.scale = y.maxScale))
            : (a.scale = a.lastScale));
      },
      M9 = (t) => {
        i.loadError ||
          i.gesturing ||
          i.loading ||
          i.dragging ||
          i.wheeling ||
          !e.scrollDisabled ||
          e.zoomDisabled ||
          ((i.wheeling = !0),
          setTimeout(() => {
            i.wheeling = !1;
          }, 80),
          t.deltaY < 0 ? B() : T());
      },
      e9 = (t) => {
        const o = t;
        e.visible &&
          (!e.escDisabled && o.key === "Escape" && e.visible && Y(),
          o.key === "ArrowLeft" && (e.rtl ? M() : S()),
          o.key === "ArrowRight" && (e.rtl ? S() : M()));
      },
      S9 = () => {
        e.maskClosable && Y();
      },
      k9 = () => {
        U();
      },
      L9 = () => {
        i.loading = !1;
      },
      C9 = (t) => {
        ((i.loading = !1), (i.loadError = !0), r("on-error", t));
      },
      t9 = () => {
        e.visible && U();
      };
    (j(
      () => e.index,
      (t) => {
        t < 0 || t >= g.value.length || E(t);
      },
    ),
      j(
        () => i.dragging,
        (t, o) => {
          const n = !t && o;
          if (!O() && n) {
            const d = a.lastX - a.initX,
              m = a.lastY - a.initY,
              u = e.swipeTolerance;
            Math.abs(d) > Math.abs(m) && (d < -1 * u ? M() : d > u && S());
          }
        },
      ),
      j(
        () => e.visible,
        (t) => {
          if (t) {
            J();
            const o = g.value.length;
            if (o === 0)
              return (
                (f.value = 0),
                (i.loading = !1),
                void n9(() => (i.loadError = !0))
              );
            ((f.value = e.index >= o ? o - 1 : e.index < 0 ? 0 : e.index),
              e.scrollDisabled && Y9());
          } else e.scrollDisabled && l9();
        },
      ));
    const Y9 = () => {
        document &&
          ((q.value = document.body.style.overflowY),
          (document.body.style.overflowY = "hidden"));
      },
      l9 = () => {
        document && (document.body.style.overflowY = q.value);
      };
    (A9(() => {
      (i9(document, "keydown", e9), i9(window, "resize", t9));
    }),
      F9(() => {
        (s9(document, "keydown", e9),
          s9(window, "resize", t9),
          e.scrollDisabled && l9());
      }));
    const B9 = () =>
        i.loading
          ? c.loading
            ? c.loading({ key: "loading" })
            : l(q9, { key: "img-loading" }, null)
          : i.loadError
            ? c.onerror
              ? c.onerror({ key: "onerror" })
              : l(W9, { key: "img-on-error" }, null)
            : l(
                "div",
                {
                  class: `${p}-img-wrapper`,
                  style: p9.value,
                  key: "img-wrapper",
                },
                [
                  l(
                    "img",
                    {
                      alt: m9.value,
                      ref: f9,
                      draggable: "false",
                      class: `${p}-img`,
                      src: W.value,
                      onMousedown: v9,
                      onMouseup: y9,
                      onMousemove: h9,
                      onTouchstart: z9,
                      onTouchmove: w9,
                      onTouchend: D9,
                      onLoad: k9,
                      onDblclick: x9,
                      onDragstart: (t) => {
                        t.preventDefault();
                      },
                    },
                    null,
                  ),
                ],
              ),
      T9 = () => {
        if (c["prev-btn"]) return c["prev-btn"]({ prev: S });
        if (g.value.length <= 1) return;
        const t = !e.loop && f.value <= 0;
        return l(
          "div",
          {
            role: "button",
            "aria-label": "previous image button",
            class: "btn__prev " + (t ? "disable" : ""),
            onClick: S,
          },
          [e.rtl ? l(v, { type: "next" }, null) : l(v, { type: "prev" }, null)],
        );
      },
      X9 = () => {
        if (c["next-btn"]) return c["next-btn"]({ next: M });
        if (g.value.length <= 1) return;
        const t = !e.loop && f.value >= g.value.length - 1;
        return l(
          "div",
          {
            role: "button",
            "aria-label": "next image button",
            class: "btn__next " + (t ? "disable" : ""),
            onClick: M,
          },
          [e.rtl ? l(v, { type: "prev" }, null) : l(v, { type: "next" }, null)],
        );
      },
      _9 = () => {
        if (!(e.titleDisabled || i.loading || i.loadError))
          return c.title
            ? c.title({ currentImg: b9.value })
            : G.value
              ? l(G9, null, { default: () => [G.value] })
              : void 0;
      },
      o9 = () => {
        let t;
        if (e.visible)
          return l(
            "div",
            {
              onTouchmove: N9,
              class: [`${p}-modal`, e.rtl ? "is-rtl" : ""],
              onClick: R9(S9, ["self"]),
              onWheel: M9,
            },
            [
              l(J9, null, null),
              l(
                R,
                { name: `${p}-fade`, mode: "out-in" },
                V((t = B9())) ? t : { default: () => [t] },
              ),
              l(
                "img",
                {
                  style: "display:none;",
                  src: W.value,
                  onError: C9,
                  onLoad: L9,
                },
                null,
              ),
              l("div", { class: `${p}-btns-wrapper` }, [
                T9(),
                X9(),
                _9(),
                c["close-btn"]
                  ? c["close-btn"]({ close: Y })
                  : l(
                      "div",
                      {
                        role: "button",
                        "aria-label": "close image preview button",
                        class: "btn__close",
                        onClick: Y,
                      },
                      [l(v, { type: "close" }, null)],
                    ),
                c.toolbar
                  ? c.toolbar({
                      toolbarMethods: {
                        zoomIn: B,
                        zoomOut: T,
                        rotate: k,
                        rotateLeft: k,
                        rotateRight: $,
                        resize: I,
                      },
                      zoomIn: B,
                      zoomOut: T,
                      rotate: k,
                      rotateLeft: k,
                      rotateRight: $,
                      resize: I,
                    })
                  : l(
                      U9,
                      {
                        zoomIn: B,
                        zoomOut: T,
                        resize: I,
                        rotateLeft: k,
                        rotateRight: $,
                        rotateDisabled: e.rotateDisabled,
                        zoomDisabled: e.zoomDisabled,
                      },
                      null,
                    ),
              ]),
            ],
          );
      };
    return () => {
      let t;
      if (e.teleport) {
        let o;
        return l(
          j9,
          { to: e.teleport },
          {
            default: () => [
              l(
                R,
                { name: `${p}-fade` },
                V((o = o9())) ? o : { default: () => [o] },
              ),
            ],
          },
        );
      }
      return l(
        R,
        { name: `${p}-fade` },
        V((t = o9())) ? t : { default: () => [t] },
      );
    };
  },
});
const e1 = Object.assign(Z, {
  install: (e) => {
    e.component(Z.name, Z);
  },
});
export { e1 as F };
//# sourceMappingURL=BSW603Mu.js.map
