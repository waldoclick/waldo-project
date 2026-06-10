import {
  bJ as me,
  b3 as ge,
  b8 as F,
  d0 as _e,
  aZ as q,
  bW as N,
  b9 as E,
  bm as J,
  cr as pe,
  bn as ne,
  bE as ae,
  bG as ie,
  a_ as M,
  a$ as I,
  b0 as y,
  bF as Ce,
  b1 as Z,
  bx as oe,
  be as V,
  bf as P,
  bi as W,
  bs as G,
  br as be,
  b5 as Y,
  b7 as O,
  b6 as p,
  cW as ye,
  bu as Ee,
  b2 as Pe,
  d1 as Re,
  d2 as Se,
  d3 as Ae,
  b4 as Me,
  cv as we,
  d4 as Ne,
  cs as Ie,
  d5 as $e,
  cu as Le,
  ba as Te,
  cw as X,
  aY as ke,
} from "./BK8sApmn.js";
import { _ as ze } from "./ClGpxEC3.js";
import { _ as se } from "./W9r5MxIt.js";
import { u as Oe } from "./Ctg5ZDgN.js";
import { _ as Fe, S as De } from "./MqP1_NXX.js";
import { _ as L } from "./C7SjWCbw.js";
import { M as ee } from "./DuRm081T.js";
import { u as le } from "./CJzzMwWR.js";
import { C as te } from "./-VADgLbk.js";
import { I as Ue } from "./BZsGLQuR.js";
import "./RG9bXWPx.js";
import "./CNKn_OHC.js";
import "./BSW603Mu.js";
import "./DJPzpk2M.js";
import "./D6ORICL5.js";
import "./Db0x1g0W.js";
try {
  let a =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    o = new a.Error().stack;
  o &&
    ((a._sentryDebugIds = a._sentryDebugIds || {}),
    (a._sentryDebugIds[o] = "39b7bcd4-38b6-4e20-9d85-dc64eacd7a4d"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-39b7bcd4-38b6-4e20-9d85-dc64eacd7a4d"));
} catch {}
const Be = me(
  "related",
  () => {
    const a = F([]),
      o = F(!1),
      f = F(null),
      l = ge();
    return {
      relatedAds: a,
      loading: o,
      error: f,
      loadRelatedAds: async (c) => {
        try {
          ((o.value = !0), (f.value = null));
          const e = await l(`related/ads/${c}`, {
            method: "GET",
            params: { populate: "*" },
          });
          if (!e.data || !Array.isArray(e.data))
            throw new Error("Invalid data format");
          a.value = e.data;
        } catch {
          f.value = "Error loading related ads";
        } finally {
          o.value = !1;
        }
      },
    };
  },
  { persist: { storage: _e.localStorage } },
);
var z = function () {
  return (
    (z =
      Object.assign ||
      function (o) {
        for (var f, l = 1, v = arguments.length; l < v; l++) {
          f = arguments[l];
          for (var c in f)
            Object.prototype.hasOwnProperty.call(f, c) && (o[c] = f[c]);
        }
        return o;
      }),
    z.apply(this, arguments)
  );
};
var D;
(function (a) {
  var o = (function () {
    function n(e, t, r, i) {
      if (
        ((this.version = e),
        (this.errorCorrectionLevel = t),
        (this.modules = []),
        (this.isFunction = []),
        e < n.MIN_VERSION || e > n.MAX_VERSION)
      )
        throw new RangeError("Version value out of range");
      if (i < -1 || i > 7) throw new RangeError("Mask value out of range");
      this.size = e * 4 + 17;
      for (var s = [], d = 0; d < this.size; d++) s.push(!1);
      for (var d = 0; d < this.size; d++)
        (this.modules.push(s.slice()), this.isFunction.push(s.slice()));
      this.drawFunctionPatterns();
      var m = this.addEccAndInterleave(r);
      if ((this.drawCodewords(m), i == -1))
        for (var C = 1e9, d = 0; d < 8; d++) {
          (this.applyMask(d), this.drawFormatBits(d));
          var b = this.getPenaltyScore();
          (b < C && ((i = d), (C = b)), this.applyMask(d));
        }
      (v(0 <= i && i <= 7),
        (this.mask = i),
        this.applyMask(i),
        this.drawFormatBits(i),
        (this.isFunction = []));
    }
    return (
      (n.encodeText = function (e, t) {
        var r = a.QrSegment.makeSegments(e);
        return n.encodeSegments(r, t);
      }),
      (n.encodeBinary = function (e, t) {
        var r = a.QrSegment.makeBytes(e);
        return n.encodeSegments([r], t);
      }),
      (n.encodeSegments = function (e, t, r, i, s, d) {
        if (
          (r === void 0 && (r = 1),
          i === void 0 && (i = 40),
          s === void 0 && (s = -1),
          d === void 0 && (d = !0),
          !(n.MIN_VERSION <= r && r <= i && i <= n.MAX_VERSION) ||
            s < -1 ||
            s > 7)
        )
          throw new RangeError("Invalid value");
        var m, C;
        for (m = r; ; m++) {
          var b = n.getNumDataCodewords(m, t) * 8,
            S = c.getTotalBits(e, m);
          if (S <= b) {
            C = S;
            break;
          }
          if (m >= i) throw new RangeError("Data too long");
        }
        for (
          var g = 0, _ = [n.Ecc.MEDIUM, n.Ecc.QUARTILE, n.Ecc.HIGH];
          g < _.length;
          g++
        ) {
          var R = _[g];
          d && C <= n.getNumDataCodewords(m, R) * 8 && (t = R);
        }
        for (var u = [], h = 0, A = e; h < A.length; h++) {
          var w = A[h];
          (f(w.mode.modeBits, 4, u),
            f(w.numChars, w.mode.numCharCountBits(m), u));
          for (var $ = 0, T = w.getData(); $ < T.length; $++) {
            var U = T[$];
            u.push(U);
          }
        }
        v(u.length == C);
        var k = n.getNumDataCodewords(m, t) * 8;
        (v(u.length <= k),
          f(0, Math.min(4, k - u.length), u),
          f(0, (8 - (u.length % 8)) % 8, u),
          v(u.length % 8 == 0));
        for (var Q = 236; u.length < k; Q ^= 253) f(Q, 8, u);
        for (var B = []; B.length * 8 < u.length; ) B.push(0);
        return (
          u.forEach(function (K, x) {
            return (B[x >>> 3] |= K << (7 - (x & 7)));
          }),
          new n(m, t, B, s)
        );
      }),
      (n.prototype.getModule = function (e, t) {
        return (
          0 <= e &&
          e < this.size &&
          0 <= t &&
          t < this.size &&
          this.modules[t][e]
        );
      }),
      (n.prototype.getModules = function () {
        return this.modules;
      }),
      (n.prototype.drawFunctionPatterns = function () {
        for (var e = 0; e < this.size; e++)
          (this.setFunctionModule(6, e, e % 2 == 0),
            this.setFunctionModule(e, 6, e % 2 == 0));
        (this.drawFinderPattern(3, 3),
          this.drawFinderPattern(this.size - 4, 3),
          this.drawFinderPattern(3, this.size - 4));
        for (
          var t = this.getAlignmentPatternPositions(), r = t.length, e = 0;
          e < r;
          e++
        )
          for (var i = 0; i < r; i++)
            (e == 0 && i == 0) ||
              (e == 0 && i == r - 1) ||
              (e == r - 1 && i == 0) ||
              this.drawAlignmentPattern(t[e], t[i]);
        (this.drawFormatBits(0), this.drawVersion());
      }),
      (n.prototype.drawFormatBits = function (e) {
        for (
          var t = (this.errorCorrectionLevel.formatBits << 3) | e, r = t, i = 0;
          i < 10;
          i++
        )
          r = (r << 1) ^ ((r >>> 9) * 1335);
        var s = ((t << 10) | r) ^ 21522;
        v(s >>> 15 == 0);
        for (var i = 0; i <= 5; i++) this.setFunctionModule(8, i, l(s, i));
        (this.setFunctionModule(8, 7, l(s, 6)),
          this.setFunctionModule(8, 8, l(s, 7)),
          this.setFunctionModule(7, 8, l(s, 8)));
        for (var i = 9; i < 15; i++) this.setFunctionModule(14 - i, 8, l(s, i));
        for (var i = 0; i < 8; i++)
          this.setFunctionModule(this.size - 1 - i, 8, l(s, i));
        for (var i = 8; i < 15; i++)
          this.setFunctionModule(8, this.size - 15 + i, l(s, i));
        this.setFunctionModule(8, this.size - 8, !0);
      }),
      (n.prototype.drawVersion = function () {
        if (!(this.version < 7)) {
          for (var e = this.version, t = 0; t < 12; t++)
            e = (e << 1) ^ ((e >>> 11) * 7973);
          var r = (this.version << 12) | e;
          v(r >>> 18 == 0);
          for (var t = 0; t < 18; t++) {
            var i = l(r, t),
              s = this.size - 11 + (t % 3),
              d = Math.floor(t / 3);
            (this.setFunctionModule(s, d, i), this.setFunctionModule(d, s, i));
          }
        }
      }),
      (n.prototype.drawFinderPattern = function (e, t) {
        for (var r = -4; r <= 4; r++)
          for (var i = -4; i <= 4; i++) {
            var s = Math.max(Math.abs(i), Math.abs(r)),
              d = e + i,
              m = t + r;
            0 <= d &&
              d < this.size &&
              0 <= m &&
              m < this.size &&
              this.setFunctionModule(d, m, s != 2 && s != 4);
          }
      }),
      (n.prototype.drawAlignmentPattern = function (e, t) {
        for (var r = -2; r <= 2; r++)
          for (var i = -2; i <= 2; i++)
            this.setFunctionModule(
              e + i,
              t + r,
              Math.max(Math.abs(i), Math.abs(r)) != 1,
            );
      }),
      (n.prototype.setFunctionModule = function (e, t, r) {
        ((this.modules[t][e] = r), (this.isFunction[t][e] = !0));
      }),
      (n.prototype.addEccAndInterleave = function (e) {
        var t = this.version,
          r = this.errorCorrectionLevel;
        if (e.length != n.getNumDataCodewords(t, r))
          throw new RangeError("Invalid argument");
        for (
          var i = n.NUM_ERROR_CORRECTION_BLOCKS[r.ordinal][t],
            s = n.ECC_CODEWORDS_PER_BLOCK[r.ordinal][t],
            d = Math.floor(n.getNumRawDataModules(t) / 8),
            m = i - (d % i),
            C = Math.floor(d / i),
            b = [],
            S = n.reedSolomonComputeDivisor(s),
            g = 0,
            _ = 0;
          g < i;
          g++
        ) {
          var R = e.slice(_, _ + C - s + (g < m ? 0 : 1));
          _ += R.length;
          var u = n.reedSolomonComputeRemainder(R, S);
          (g < m && R.push(0), b.push(R.concat(u)));
        }
        for (
          var h = [],
            A = function (w) {
              b.forEach(function ($, T) {
                (w != C - s || T >= m) && h.push($[w]);
              });
            },
            g = 0;
          g < b[0].length;
          g++
        )
          A(g);
        return (v(h.length == d), h);
      }),
      (n.prototype.drawCodewords = function (e) {
        if (e.length != Math.floor(n.getNumRawDataModules(this.version) / 8))
          throw new RangeError("Invalid argument");
        for (var t = 0, r = this.size - 1; r >= 1; r -= 2) {
          r == 6 && (r = 5);
          for (var i = 0; i < this.size; i++)
            for (var s = 0; s < 2; s++) {
              var d = r - s,
                m = ((r + 1) & 2) == 0,
                C = m ? this.size - 1 - i : i;
              !this.isFunction[C][d] &&
                t < e.length * 8 &&
                ((this.modules[C][d] = l(e[t >>> 3], 7 - (t & 7))), t++);
            }
        }
        v(t == e.length * 8);
      }),
      (n.prototype.applyMask = function (e) {
        if (e < 0 || e > 7) throw new RangeError("Mask value out of range");
        for (var t = 0; t < this.size; t++)
          for (var r = 0; r < this.size; r++) {
            var i = void 0;
            switch (e) {
              case 0:
                i = (r + t) % 2 == 0;
                break;
              case 1:
                i = t % 2 == 0;
                break;
              case 2:
                i = r % 3 == 0;
                break;
              case 3:
                i = (r + t) % 3 == 0;
                break;
              case 4:
                i = (Math.floor(r / 3) + Math.floor(t / 2)) % 2 == 0;
                break;
              case 5:
                i = ((r * t) % 2) + ((r * t) % 3) == 0;
                break;
              case 6:
                i = (((r * t) % 2) + ((r * t) % 3)) % 2 == 0;
                break;
              case 7:
                i = (((r + t) % 2) + ((r * t) % 3)) % 2 == 0;
                break;
              default:
                throw new Error("Unreachable");
            }
            !this.isFunction[t][r] &&
              i &&
              (this.modules[t][r] = !this.modules[t][r]);
          }
      }),
      (n.prototype.getPenaltyScore = function () {
        for (var e = 0, t = 0; t < this.size; t++) {
          for (
            var r = !1, i = 0, s = [0, 0, 0, 0, 0, 0, 0], d = 0;
            d < this.size;
            d++
          )
            this.modules[t][d] == r
              ? (i++, i == 5 ? (e += n.PENALTY_N1) : i > 5 && e++)
              : (this.finderPenaltyAddHistory(i, s),
                r || (e += this.finderPenaltyCountPatterns(s) * n.PENALTY_N3),
                (r = this.modules[t][d]),
                (i = 1));
          e += this.finderPenaltyTerminateAndCount(r, i, s) * n.PENALTY_N3;
        }
        for (var d = 0; d < this.size; d++) {
          for (
            var r = !1, m = 0, s = [0, 0, 0, 0, 0, 0, 0], t = 0;
            t < this.size;
            t++
          )
            this.modules[t][d] == r
              ? (m++, m == 5 ? (e += n.PENALTY_N1) : m > 5 && e++)
              : (this.finderPenaltyAddHistory(m, s),
                r || (e += this.finderPenaltyCountPatterns(s) * n.PENALTY_N3),
                (r = this.modules[t][d]),
                (m = 1));
          e += this.finderPenaltyTerminateAndCount(r, m, s) * n.PENALTY_N3;
        }
        for (var t = 0; t < this.size - 1; t++)
          for (var d = 0; d < this.size - 1; d++) {
            var C = this.modules[t][d];
            C == this.modules[t][d + 1] &&
              C == this.modules[t + 1][d] &&
              C == this.modules[t + 1][d + 1] &&
              (e += n.PENALTY_N2);
          }
        for (var b = 0, S = 0, g = this.modules; S < g.length; S++) {
          var _ = g[S];
          b = _.reduce(function (h, A) {
            return h + (A ? 1 : 0);
          }, b);
        }
        var R = this.size * this.size,
          u = Math.ceil(Math.abs(b * 20 - R * 10) / R) - 1;
        return (
          v(0 <= u && u <= 9),
          (e += u * n.PENALTY_N4),
          v(0 <= e && e <= 2568888),
          e
        );
      }),
      (n.prototype.getAlignmentPatternPositions = function () {
        if (this.version == 1) return [];
        for (
          var e = Math.floor(this.version / 7) + 2,
            t = Math.floor((this.version * 8 + e * 3 + 5) / (e * 4 - 4)) * 2,
            r = [6],
            i = this.size - 7;
          r.length < e;
          i -= t
        )
          r.splice(1, 0, i);
        return r;
      }),
      (n.getNumRawDataModules = function (e) {
        if (e < n.MIN_VERSION || e > n.MAX_VERSION)
          throw new RangeError("Version number out of range");
        var t = (16 * e + 128) * e + 64;
        if (e >= 2) {
          var r = Math.floor(e / 7) + 2;
          ((t -= (25 * r - 10) * r - 55), e >= 7 && (t -= 36));
        }
        return (v(208 <= t && t <= 29648), t);
      }),
      (n.getNumDataCodewords = function (e, t) {
        return (
          Math.floor(n.getNumRawDataModules(e) / 8) -
          n.ECC_CODEWORDS_PER_BLOCK[t.ordinal][e] *
            n.NUM_ERROR_CORRECTION_BLOCKS[t.ordinal][e]
        );
      }),
      (n.reedSolomonComputeDivisor = function (e) {
        if (e < 1 || e > 255) throw new RangeError("Degree out of range");
        for (var t = [], r = 0; r < e - 1; r++) t.push(0);
        t.push(1);
        for (var i = 1, r = 0; r < e; r++) {
          for (var s = 0; s < t.length; s++)
            ((t[s] = n.reedSolomonMultiply(t[s], i)),
              s + 1 < t.length && (t[s] ^= t[s + 1]));
          i = n.reedSolomonMultiply(i, 2);
        }
        return t;
      }),
      (n.reedSolomonComputeRemainder = function (e, t) {
        for (
          var r = t.map(function (C) {
              return 0;
            }),
            i = function (C) {
              var b = C ^ r.shift();
              (r.push(0),
                t.forEach(function (S, g) {
                  return (r[g] ^= n.reedSolomonMultiply(S, b));
                }));
            },
            s = 0,
            d = e;
          s < d.length;
          s++
        ) {
          var m = d[s];
          i(m);
        }
        return r;
      }),
      (n.reedSolomonMultiply = function (e, t) {
        if (e >>> 8 || t >>> 8) throw new RangeError("Byte out of range");
        for (var r = 0, i = 7; i >= 0; i--)
          ((r = (r << 1) ^ ((r >>> 7) * 285)), (r ^= ((t >>> i) & 1) * e));
        return (v(r >>> 8 == 0), r);
      }),
      (n.prototype.finderPenaltyCountPatterns = function (e) {
        var t = e[1];
        v(t <= this.size * 3);
        var r = t > 0 && e[2] == t && e[3] == t * 3 && e[4] == t && e[5] == t;
        return (
          (r && e[0] >= t * 4 && e[6] >= t ? 1 : 0) +
          (r && e[6] >= t * 4 && e[0] >= t ? 1 : 0)
        );
      }),
      (n.prototype.finderPenaltyTerminateAndCount = function (e, t, r) {
        return (
          e && (this.finderPenaltyAddHistory(t, r), (t = 0)),
          (t += this.size),
          this.finderPenaltyAddHistory(t, r),
          this.finderPenaltyCountPatterns(r)
        );
      }),
      (n.prototype.finderPenaltyAddHistory = function (e, t) {
        (t[0] == 0 && (e += this.size), t.pop(), t.unshift(e));
      }),
      (n.MIN_VERSION = 1),
      (n.MAX_VERSION = 40),
      (n.PENALTY_N1 = 3),
      (n.PENALTY_N2 = 3),
      (n.PENALTY_N3 = 40),
      (n.PENALTY_N4 = 10),
      (n.ECC_CODEWORDS_PER_BLOCK = [
        [
          -1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28,
          30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30,
          30, 30, 30, 30, 30, 30,
        ],
        [
          -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28,
          28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
          28, 28, 28, 28, 28, 28, 28,
        ],
        [
          -1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24,
          28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30,
          30, 30, 30, 30, 30, 30, 30,
        ],
        [
          -1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30,
          28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
          30, 30, 30, 30, 30, 30, 30,
        ],
      ]),
      (n.NUM_ERROR_CORRECTION_BLOCKS = [
        [
          -1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9,
          9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
        ],
        [
          -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16,
          17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43,
          45, 47, 49,
        ],
        [
          -1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21,
          20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56,
          59, 62, 65, 68,
        ],
        [
          -1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25,
          25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66,
          70, 74, 77, 81,
        ],
      ]),
      n
    );
  })();
  a.QrCode = o;
  function f(n, e, t) {
    if (e < 0 || e > 31 || n >>> e) throw new RangeError("Value out of range");
    for (var r = e - 1; r >= 0; r--) t.push((n >>> r) & 1);
  }
  function l(n, e) {
    return ((n >>> e) & 1) != 0;
  }
  function v(n) {
    if (!n) throw new Error("Assertion error");
  }
  var c = (function () {
    function n(e, t, r) {
      if (((this.mode = e), (this.numChars = t), (this.bitData = r), t < 0))
        throw new RangeError("Invalid argument");
      this.bitData = r.slice();
    }
    return (
      (n.makeBytes = function (e) {
        for (var t = [], r = 0, i = e; r < i.length; r++) {
          var s = i[r];
          f(s, 8, t);
        }
        return new n(n.Mode.BYTE, e.length, t);
      }),
      (n.makeNumeric = function (e) {
        if (!n.isNumeric(e))
          throw new RangeError("String contains non-numeric characters");
        for (var t = [], r = 0; r < e.length; ) {
          var i = Math.min(e.length - r, 3);
          (f(parseInt(e.substring(r, r + i), 10), i * 3 + 1, t), (r += i));
        }
        return new n(n.Mode.NUMERIC, e.length, t);
      }),
      (n.makeAlphanumeric = function (e) {
        if (!n.isAlphanumeric(e))
          throw new RangeError(
            "String contains unencodable characters in alphanumeric mode",
          );
        var t = [],
          r;
        for (r = 0; r + 2 <= e.length; r += 2) {
          var i = n.ALPHANUMERIC_CHARSET.indexOf(e.charAt(r)) * 45;
          ((i += n.ALPHANUMERIC_CHARSET.indexOf(e.charAt(r + 1))), f(i, 11, t));
        }
        return (
          r < e.length && f(n.ALPHANUMERIC_CHARSET.indexOf(e.charAt(r)), 6, t),
          new n(n.Mode.ALPHANUMERIC, e.length, t)
        );
      }),
      (n.makeSegments = function (e) {
        return e == ""
          ? []
          : n.isNumeric(e)
            ? [n.makeNumeric(e)]
            : n.isAlphanumeric(e)
              ? [n.makeAlphanumeric(e)]
              : [n.makeBytes(n.toUtf8ByteArray(e))];
      }),
      (n.makeEci = function (e) {
        var t = [];
        if (e < 0) throw new RangeError("ECI assignment value out of range");
        if (e < 128) f(e, 8, t);
        else if (e < 16384) (f(2, 2, t), f(e, 14, t));
        else if (e < 1e6) (f(6, 3, t), f(e, 21, t));
        else throw new RangeError("ECI assignment value out of range");
        return new n(n.Mode.ECI, 0, t);
      }),
      (n.isNumeric = function (e) {
        return n.NUMERIC_REGEX.test(e);
      }),
      (n.isAlphanumeric = function (e) {
        return n.ALPHANUMERIC_REGEX.test(e);
      }),
      (n.prototype.getData = function () {
        return this.bitData.slice();
      }),
      (n.getTotalBits = function (e, t) {
        for (var r = 0, i = 0, s = e; i < s.length; i++) {
          var d = s[i],
            m = d.mode.numCharCountBits(t);
          if (d.numChars >= 1 << m) return 1 / 0;
          r += 4 + m + d.bitData.length;
        }
        return r;
      }),
      (n.toUtf8ByteArray = function (e) {
        e = encodeURI(e);
        for (var t = [], r = 0; r < e.length; r++)
          e.charAt(r) != "%"
            ? t.push(e.charCodeAt(r))
            : (t.push(parseInt(e.substring(r + 1, r + 3), 16)), (r += 2));
        return t;
      }),
      (n.NUMERIC_REGEX = /^[0-9]*$/),
      (n.ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+.\/:-]*$/),
      (n.ALPHANUMERIC_CHARSET =
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"),
      n
    );
  })();
  a.QrSegment = c;
})(D || (D = {}));
(function (a) {
  (function (o) {
    var f = (function () {
      function l(v, c) {
        ((this.ordinal = v), (this.formatBits = c));
      }
      return (
        (l.LOW = new l(0, 1)),
        (l.MEDIUM = new l(1, 0)),
        (l.QUARTILE = new l(2, 3)),
        (l.HIGH = new l(3, 2)),
        l
      );
    })();
    o.Ecc = f;
  })(a.QrCode || (a.QrCode = {}));
})(D || (D = {}));
(function (a) {
  (function (o) {
    var f = (function () {
      function l(v, c) {
        ((this.modeBits = v), (this.numBitsCharCount = c));
      }
      return (
        (l.prototype.numCharCountBits = function (v) {
          return this.numBitsCharCount[Math.floor((v + 7) / 17)];
        }),
        (l.NUMERIC = new l(1, [10, 12, 14])),
        (l.ALPHANUMERIC = new l(2, [9, 11, 13])),
        (l.BYTE = new l(4, [8, 16, 16])),
        (l.KANJI = new l(8, [8, 10, 12])),
        (l.ECI = new l(7, [0, 0, 0])),
        l
      );
    })();
    o.Mode = f;
  })(a.QrSegment || (a.QrSegment = {}));
})(D || (D = {}));
var H = D,
  Qe = 0;
function He(a) {
  return a || "v-".concat(Qe++);
}
var ue = "L",
  Ge = 100,
  ce = 0,
  qe = 0.1,
  xe = 2,
  de = {
    L: H.QrCode.Ecc.LOW,
    M: H.QrCode.Ecc.MEDIUM,
    Q: H.QrCode.Ecc.QUARTILE,
    H: H.QrCode.Ecc.HIGH,
  },
  Ve = (function () {
    try {
      new Path2D().addPath(new Path2D());
    } catch {
      return !1;
    }
    return !0;
  })();
function fe(a) {
  return a in de;
}
function We(a, o, f) {
  var l = o > 0 ? a[o - 1][f] : !1,
    v = o < a.length - 1 ? a[o + 1][f] : !1,
    c = f > 0 ? a[o][f - 1] : !1,
    n = f < a[o].length - 1 ? a[o][f + 1] : !1;
  return { nw: !l && !c, ne: !l && !n, se: !v && !n, sw: !v && !c };
}
function Ye(a, o, f) {
  (o === void 0 && (o = 0), f === void 0 && (f = 0));
  for (var l = [], v = Math.min(f, 0.5), c = 0; c < a.length; c++)
    for (var n = 0; n < a[c].length; n++)
      if (a[c][n]) {
        var e = We(a, c, n),
          t = e.nw,
          r = e.ne,
          i = e.se,
          s = e.sw,
          d = n + o,
          m = c + o;
        (l.push(
          "M".concat(d + (t ? v : 0), " ").concat(m),
          "L".concat(d + 1 - (r ? v : 0), " ").concat(m),
        ),
          r &&
            l.push(
              "A"
                .concat(v, " ")
                .concat(v, " 0 0 1 ")
                .concat(d + 1, " ")
                .concat(m + v),
            ),
          l.push("L".concat(d + 1, " ").concat(m + 1 - (i ? v : 0))),
          i &&
            l.push(
              "A"
                .concat(v, " ")
                .concat(v, " 0 0 1 ")
                .concat(d + 1 - v, " ")
                .concat(m + 1),
            ),
          l.push("L".concat(d + (s ? v : 0), " ").concat(m + 1)),
          s &&
            l.push(
              "A"
                .concat(v, " ")
                .concat(v, " 0 0 1 ")
                .concat(d, " ")
                .concat(m + 1 - v),
            ),
          l.push("L".concat(d, " ").concat(m + (t ? v : 0))),
          t &&
            l.push(
              "A"
                .concat(v, " ")
                .concat(v, " 0 0 1 ")
                .concat(d + v, " ")
                .concat(m),
            ),
          l.push("z"));
      }
  return l.join("");
}
function Ke(a, o) {
  o === void 0 && (o = 0);
  for (var f = [], l = 0; l < a.length; l++)
    for (var v = a[l], c = null, n = 0; n < v.length; n++) {
      var e = v[n];
      if (!e && c !== null) {
        (f.push(
          "M"
            .concat(c + o, " ")
            .concat(l + o, "h")
            .concat(n - c, "v1H")
            .concat(c + o, "z"),
        ),
          (c = null));
        continue;
      }
      if (n === v.length - 1) {
        if (!e) continue;
        c === null
          ? f.push(
              "M"
                .concat(n + o, ",")
                .concat(l + o, " h1v1H")
                .concat(n + o, "z"),
            )
          : f.push(
              "M"
                .concat(c + o, ",")
                .concat(l + o, " h")
                .concat(n + 1 - c, "v1H")
                .concat(c + o, "z"),
            );
        continue;
      }
      e && c === null && (c = n);
    }
  return f.join("");
}
function Xe(a, o, f, l) {
  var v = l.width,
    c = l.height,
    n = l.x,
    e = l.y,
    t = a.length + f * 2,
    r = Math.floor(o * qe),
    i = t / o,
    s = (v || r) * i,
    d = (c || r) * i,
    m = n == null ? a.length / 2 - s / 2 : n * i,
    C = e == null ? a.length / 2 - d / 2 : e * i,
    b = (l.borderRadius || 0) * i;
  return { x: m, y: C, h: d, w: s, borderRadius: b };
}
function ve(a) {
  var o = E(function () {
      var e;
      return ((e = a.margin) !== null && e !== void 0 ? e : ce) >>> 0;
    }),
    f = E(function () {
      var e = fe(a.level) ? a.level : ue;
      return H.QrCode.encodeText(a.value, de[e]).getModules();
    }),
    l = E(function () {
      return f.value.length + o.value * 2;
    }),
    v = E(function () {
      return a.radius > 0
        ? Ye(f.value, o.value, a.radius)
        : Ke(f.value, o.value);
    }),
    c = E(function () {
      if (!a.imageSettings.src) return null;
      var e = Xe(f.value, a.size, o.value, a.imageSettings);
      return {
        x: e.x + o.value,
        y: e.y + o.value,
        width: e.w,
        height: e.h,
        borderRadius: e.borderRadius,
      };
    }),
    n = E(function () {
      if (!a.imageSettings.excavate || !c.value) return null;
      var e = xe / (a.size / l.value);
      return {
        x: c.value.x - e,
        y: c.value.y - e,
        width: c.value.width + e * 2,
        height: c.value.height + e * 2,
        borderRadius: c.value.borderRadius,
      };
    });
  return {
    margin: o,
    numCells: l,
    cells: f,
    fgPath: v,
    imageProps: c,
    imageBorderProps: n,
  };
}
var j = {
    value: { type: String, required: !0, default: "" },
    size: { type: Number, default: Ge },
    level: {
      type: String,
      default: ue,
      validator: function (a) {
        return fe(a);
      },
    },
    background: { type: String, default: "#fff" },
    foreground: { type: String, default: "#000" },
    margin: { type: Number, required: !1, default: ce },
    imageSettings: {
      type: Object,
      required: !1,
      default: function () {
        return {};
      },
    },
    gradient: { type: Boolean, required: !1, default: !1 },
    gradientType: {
      type: String,
      required: !1,
      default: "linear",
      validator: function (a) {
        return ["linear", "radial"].indexOf(a) > -1;
      },
    },
    gradientStartColor: { type: String, required: !1, default: "#000" },
    gradientEndColor: { type: String, required: !1, default: "#fff" },
    radius: {
      type: Number,
      required: !1,
      default: 0,
      validator: function (a) {
        return !isNaN(a) && a >= 0 && a <= 0.5;
      },
    },
    id: { type: String, required: !1 },
  },
  Ze = z(z({}, j), {
    renderAs: {
      type: String,
      required: !1,
      default: "canvas",
      validator: function (a) {
        return ["canvas", "svg"].indexOf(a) > -1;
      },
    },
  }),
  Je = q({
    name: "QRCodeSvg",
    props: j,
    setup: function (a) {
      var o = ve(a),
        f = o.numCells,
        l = o.fgPath,
        v = o.imageProps,
        c = o.imageBorderProps,
        n = He(a.id),
        e = "qrcode.vue-gradient-".concat(n),
        t = "qrcode.vue-logo-clip-path-".concat(n),
        r = E(function () {
          if (!a.gradient) return null;
          var s =
            a.gradientType === "linear"
              ? { x1: "0%", y1: "0%", x2: "100%", y2: "100%" }
              : { cx: "50%", cy: "50%", r: "50%", fx: "50%", fy: "50%" };
          return N(
            a.gradientType === "linear" ? "linearGradient" : "radialGradient",
            z({ id: e }, s),
            [
              N("stop", {
                offset: "0%",
                style: { stopColor: a.gradientStartColor },
              }),
              N("stop", {
                offset: "100%",
                style: { stopColor: a.gradientEndColor },
              }),
            ],
          );
        }),
        i = E(function () {
          if (!v.value) return null;
          var s = v.value.borderRadius;
          return s <= 0
            ? null
            : N("clipPath", { id: t }, [
                N("rect", {
                  x: v.value.x,
                  y: v.value.y,
                  width: v.value.width,
                  height: v.value.height,
                  rx: s,
                  ry: s,
                }),
              ]);
        });
      return function () {
        return N(
          "svg",
          {
            width: a.size,
            height: a.size,
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 ".concat(f.value, " ").concat(f.value),
            role: "img",
            "aria-label": a.value,
          },
          [
            N("defs", {}, [r.value, i.value]),
            N("rect", { width: "100%", height: "100%", fill: a.background }),
            N("path", {
              fill: a.gradient ? "url(#".concat(e, ")") : a.foreground,
              d: l.value,
            }),
            c.value &&
              N("rect", {
                x: c.value.x,
                y: c.value.y,
                width: c.value.width,
                height: c.value.height,
                fill: a.background,
                rx: c.value.borderRadius,
                ry: c.value.borderRadius,
              }),
            a.imageSettings.src &&
              v.value &&
              N(
                "image",
                z(
                  z({ href: a.imageSettings.src }, v.value),
                  v.value.borderRadius > 0
                    ? { "clip-path": "url(#".concat(t, ")") }
                    : {},
                ),
              ),
          ],
        );
      };
    },
  }),
  je = q({
    name: "QRCodeCanvas",
    props: j,
    setup: function (a, o) {
      var f = ve(a),
        l = f.margin,
        v = f.cells,
        c = f.numCells,
        n = f.fgPath,
        e = f.imageProps,
        t = f.imageBorderProps,
        r = F(null),
        i = F(null),
        s = function (m, C, b, S, g, _) {
          (m.beginPath(),
            m.roundRect ? m.roundRect(C, b, S, g, _) : m.rect(C, b, S, g));
        },
        d = function () {
          var m = a.size,
            C = a.background,
            b = a.foreground,
            S = a.gradient,
            g = a.gradientType,
            _ = a.gradientStartColor,
            R = a.gradientEndColor,
            u = r.value;
          if (u) {
            var h = u.getContext("2d");
            if (h) {
              var A = i.value,
                w = (typeof window < "u" && window.devicePixelRatio) || 1,
                $ = (m / c.value) * w;
              if (
                ((u.height = u.width = m * w),
                h.setTransform($, 0, 0, $, 0, 0),
                (h.fillStyle = C),
                h.fillRect(0, 0, c.value, c.value),
                S)
              ) {
                var T = void 0;
                (g === "linear"
                  ? (T = h.createLinearGradient(0, 0, c.value, c.value))
                  : (T = h.createRadialGradient(
                      c.value / 2,
                      c.value / 2,
                      0,
                      c.value / 2,
                      c.value / 2,
                      c.value / 2,
                    )),
                  T.addColorStop(0, _),
                  T.addColorStop(1, R),
                  (h.fillStyle = T));
              } else h.fillStyle = b;
              Ve
                ? h.fill(new Path2D(n.value))
                : v.value.forEach(function (B, K) {
                    B.forEach(function (x, he) {
                      x && h.fillRect(he + l.value, K + l.value, 1, 1);
                    });
                  });
              var U =
                a.imageSettings.src &&
                A &&
                A.naturalWidth !== 0 &&
                A.naturalHeight !== 0;
              if (U && e.value) {
                if (t.value) {
                  var k = t.value;
                  ((h.fillStyle = a.background),
                    s(h, k.x, k.y, k.width, k.height, k.borderRadius),
                    h.fill());
                }
                var Q = e.value.borderRadius;
                Q > 0
                  ? (h.save(),
                    s(
                      h,
                      e.value.x,
                      e.value.y,
                      e.value.width,
                      e.value.height,
                      Q,
                    ),
                    h.clip(),
                    h.drawImage(
                      A,
                      e.value.x,
                      e.value.y,
                      e.value.width,
                      e.value.height,
                    ),
                    h.restore())
                  : h.drawImage(
                      A,
                      e.value.x,
                      e.value.y,
                      e.value.width,
                      e.value.height,
                    );
              }
            }
          }
        };
      return (
        J(d),
        pe(d),
        function () {
          return N(ne, [
            N(
              "canvas",
              z(z({}, o.attrs), {
                ref: r,
                role: "img",
                "aria-label": a.value,
                style: z(z({}, o.attrs.style), {
                  width: "".concat(a.size, "px"),
                  height: "".concat(a.size, "px"),
                }),
              }),
            ),
            a.imageSettings.src &&
              N("img", {
                ref: i,
                src: a.imageSettings.src,
                style: { display: "none" },
                onLoad: d,
              }),
          ]);
        }
      );
    },
  }),
  et = q({
    name: "Qrcode",
    props: Ze,
    setup: function (a) {
      return function () {
        return N(a.renderAs === "svg" ? Je : je, {
          value: a.value,
          size: a.size,
          margin: a.margin,
          level: a.level,
          background: a.background,
          foreground: a.foreground,
          imageSettings: a.imageSettings,
          gradient: a.gradient,
          gradientType: a.gradientType,
          gradientStartColor: a.gradientStartColor,
          gradientEndColor: a.gradientEndColor,
          radius: a.radius,
          id: a.id,
        });
      };
    },
  });
const tt = { class: "qr qr--default" },
  rt = q({
    __name: "QrDefault",
    props: {
      url: { default: "" },
      size: { default: 200 },
      margin: { default: 0 },
      level: { default: "L" },
      businessCard: { default: void 0 },
    },
    setup(a) {
      const o = a,
        f = E(() =>
          typeof o.size == "string" ? Number.parseInt(o.size, 10) : o.size,
        ),
        l = E(() =>
          o.businessCard
            ? `BEGIN:VCARD
VERSION:3.0
N:${o.businessCard.lastname};${o.businessCard.firstname};;;
FN:${o.businessCard.firstname} ${o.businessCard.lastname}
${
  o.businessCard.is_company && o.businessCard.business_name
    ? `ORG:${o.businessCard.business_name}
`
    : ""
}TEL:${o.businessCard.phone}
EMAIL:${o.businessCard.email}
END:VCARD`
            : o.url || window.location.href,
        );
      return (v, c) => {
        const n = Ce,
          e = ae("tooltip");
        return ie(
          (M(),
          I("div", tt, [
            y(n, null, {
              default: Z(() => [
                y(
                  et,
                  {
                    value: l.value,
                    size: f.value,
                    margin: a.margin,
                    level: a.level,
                    "render-as": "svg",
                  },
                  null,
                  8,
                  ["value", "size", "margin", "level"],
                ),
              ]),
              _: 1,
            }),
          ])),
          [
            [
              e,
              {
                content: a.businessCard
                  ? "Escanea para obtener la tarjeta de contacto del vendedor"
                  : "Escanea para visitar la página",
                placement: "top",
              },
            ],
          ],
        );
      };
    },
  }),
  nt = Object.assign(rt, { __name: "QrDefault" }),
  at = { class: "hero--announcement__container" },
  it = { class: "hero--announcement__content" },
  ot = { class: "hero--announcement__breadcrumbs" },
  st = { class: "hero--announcement__title" },
  lt = { class: "title" },
  ut = { key: 0, class: "hero--announcement__tags" },
  ct = { key: 0, class: "hero--announcement__qr" },
  dt = {
    __name: "HeroAnnouncement",
    props: {
      name: { type: String, required: !0 },
      category: { type: Object, required: !0 },
      user: { type: Object, required: !0 },
    },
    setup(a) {
      const o = a,
        { bgColorWithTransparency: f } = Oe(),
        l = oe(),
        v = E(() => !!l.value),
        c = E(() => o.user),
        n = E(() => o.name),
        e = E(() => o.category),
        t = F(null),
        r = () => {
          if (t.value) {
            const i = f(e.value?.color || "#f0f0f0");
            t.value.style.setProperty("background-color", i);
          }
        };
      return (
        V(() => e.value?.color, r, { immediate: !0 }),
        J(r),
        (i, s) => {
          const d = be;
          return (
            M(),
            I(
              "section",
              {
                ref_key: "heroElement",
                ref: t,
                class: "hero hero--announcement",
              },
              [
                P("div", at, [
                  P("div", it, [
                    P("div", ot, [
                      y(
                        ze,
                        {
                          items: [
                            { label: "Anuncios", to: "/anuncios" },
                            {
                              label: e.value.name,
                              to: `/anuncios?category=${e.value.slug}`,
                            },
                            { label: n.value },
                          ],
                        },
                        null,
                        8,
                        ["items"],
                      ),
                    ]),
                    P("div", st, [P("h1", lt, W(n.value), 1)]),
                    c.value
                      ? (M(),
                        I("div", ut, [
                          v.value
                            ? (M(),
                              I(
                                ne,
                                { key: 0 },
                                [
                                  P("span", null, [
                                    s[0] || (s[0] = G(" Por ", -1)),
                                    y(
                                      d,
                                      {
                                        to: `/${c.value?.username}`,
                                        title: c.value?.firstname,
                                      },
                                      {
                                        default: Z(() => [
                                          G(W(c.value?.firstname), 1),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ["to", "title"],
                                    ),
                                  ]),
                                  P("span", null, [
                                    y(
                                      d,
                                      {
                                        to: "/anunciar",
                                        title:
                                          "Publicar anuncio similar a este",
                                      },
                                      {
                                        default: Z(() => [
                                          ...(s[1] ||
                                            (s[1] = [
                                              G(
                                                "Publicar anuncio similar a este",
                                                -1,
                                              ),
                                            ])),
                                        ]),
                                        _: 1,
                                      },
                                    ),
                                  ]),
                                ],
                                64,
                              ))
                            : (M(), Y(se, { key: 1 })),
                        ]))
                      : O("", !0),
                  ]),
                  o.user
                    ? (M(),
                      I("div", ct, [
                        y(
                          nt,
                          {
                            size: "120",
                            "business-card": {
                              firstname: o.user.firstname,
                              lastname: o.user.lastname,
                              phone: o.user.phone,
                              email: o.user.email,
                              is_company: o.user.is_company,
                              business_name: o.user.business_name,
                            },
                          },
                          null,
                          8,
                          ["business-card"],
                        ),
                      ]))
                    : O("", !0),
                ]),
              ],
              512,
            )
          );
        }
      );
    },
  },
  ft = { class: "announcement announcement--single" },
  vt = { class: "announcement--single__container" },
  ht = { class: "announcement--single__body" },
  mt = { class: "announcement--single__body__gallery" },
  gt = { class: "announcement--single__body__description" },
  _t = ["innerHTML"],
  pt = { class: "announcement--single__body__specs" },
  Ct = { class: "announcement--single__body__specs__table" },
  bt = { class: "announcement--single__body__specs" },
  yt = { class: "announcement--single__body__specs__table" },
  Et = { class: "announcement--single__sidebar" },
  Pt = { key: 0, class: "announcement--single__sidebar__expired" },
  Rt = { class: "announcement--single__sidebar__info" },
  St = { class: "announcement--single__sidebar__info__top" },
  At = { class: "announcement--single__sidebar__info__top__price" },
  Mt = {
    key: 0,
    class: "announcement--single__sidebar__info__top__price__converted",
  },
  wt = { key: 0, class: "announcement--single__sidebar__info__seller" },
  Nt = { key: 1, class: "announcement--single__sidebar__info__reminder" },
  It = { class: "announcement--single__sidebar__share" },
  re = 3,
  $t = {
    __name: "AdSingle",
    props: {
      all: { type: Object, default: () => ({}) },
      access: { type: Object, default: null },
    },
    setup(a) {
      const o = a,
        f = oe(),
        l = E(() => !!f.value),
        { sanitizeRich: v } = ye(),
        { contactSeller: c } = le(),
        n = E(() => o.all?.commune?.name || "--"),
        e = E(() => o.all?.commune?.region?.name || "--"),
        t = E(() => o.all?.user || null),
        r = E(() => o.all?.condition || null),
        i = E(() => {
          const { width: g, height: _, depth: R } = o.all;
          return `${g}m x ${_}m x ${R}m`;
        }),
        s = E(() => (o.all.weight ? `${o.all.weight}kg` : "N/A")),
        d = E(() => {
          const { address: g, address_number: _ } = o.all;
          return !g || !_ ? "" : `${g}, #${_}`;
        }),
        m = (g) => {
          if (!g) return "";
          const _ = new Date(g),
            R = _.getDate(),
            u = _.toLocaleString("es-CL", { month: "long" });
          return `${R} de ${u.charAt(0).toUpperCase() + u.slice(1)}`;
        },
        C = E(() => {
          const g = o.all?.priceData;
          if (!g?.convertedPrice || !g?.originalPrice) return "";
          const _ =
            g.originalCurrency === "USD"
              ? g.convertedPrice / g.originalPrice
              : g.originalPrice / g.convertedPrice;
          return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(Math.round(_));
        }),
        b = E(() => {
          const g = t.value;
          return g ? `${g.firstname || ""} ${g.lastname || ""}`.trim() : "";
        }),
        S = E(() =>
          d.value
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.value + ", " + n.value + ", " + e.value)}`
            : "",
        );
      return (g, _) => {
        const R = ae("tooltip");
        return (
          M(),
          I("section", ft, [
            P("div", vt, [
              P("div", ht, [
                P("div", mt, [
                  y(p(Fe), { media: a.all?.gallery || null }, null, 8, [
                    "media",
                  ]),
                ]),
                P("div", gt, [
                  _[2] ||
                    (_[2] = P(
                      "h3",
                      {
                        class:
                          "announcement--single__body__description__title subtitle",
                      },
                      " Acerca de este producto ",
                      -1,
                    )),
                  P(
                    "div",
                    {
                      class: "announcement--single__body__description__text",
                      innerHTML: p(v)(a.all.description),
                    },
                    null,
                    8,
                    _t,
                  ),
                ]),
                P("div", pt, [
                  _[3] ||
                    (_[3] = P(
                      "h3",
                      {
                        class:
                          "announcement--single__body__specs__title subtitle",
                      },
                      " Ubicación ",
                      -1,
                    )),
                  P("div", Ct, [
                    y(
                      p(L),
                      {
                        title: "Dirección",
                        description: d.value,
                        link: S.value,
                        info: "Ver en Google Maps",
                      },
                      null,
                      8,
                      ["description", "link"],
                    ),
                    y(
                      p(L),
                      { title: "Región", description: e.value },
                      null,
                      8,
                      ["description"],
                    ),
                    y(
                      p(L),
                      { title: "Comuna", description: n.value },
                      null,
                      8,
                      ["description"],
                    ),
                  ]),
                ]),
                P("div", bt, [
                  _[4] ||
                    (_[4] = P(
                      "h3",
                      {
                        class:
                          "announcement--single__body__specs__title subtitle",
                      },
                      " Especificación técnica ",
                      -1,
                    )),
                  P("div", yt, [
                    y(
                      p(L),
                      { title: "Año", description: a.all.year },
                      null,
                      8,
                      ["description"],
                    ),
                    y(
                      p(L),
                      { title: "Manufactura", description: a.all.manufacturer },
                      null,
                      8,
                      ["description"],
                    ),
                    y(
                      p(L),
                      { title: "Modelo", description: a.all.model },
                      null,
                      8,
                      ["description"],
                    ),
                    y(
                      p(L),
                      {
                        title: "Número de serie",
                        description: a.all.serial_number,
                      },
                      null,
                      8,
                      ["description"],
                    ),
                    y(
                      p(L),
                      {
                        title: "Medidas (Ancho x Alto x Profundidad)",
                        description: i.value,
                      },
                      null,
                      8,
                      ["description"],
                    ),
                    y(p(L), { title: "Peso", description: s.value }, null, 8, [
                      "description",
                    ]),
                    y(
                      p(L),
                      { title: "Condición", description: r.value?.name },
                      null,
                      8,
                      ["description"],
                    ),
                  ]),
                ]),
              ]),
              P("div", Et, [
                !a.all.active || (a.all.active && a.all.remaining_days <= re)
                  ? (M(),
                    I("div", Pt, [
                      !a.all.active && a.access?.message
                        ? (M(),
                          Y(
                            p(ee),
                            {
                              key: 0,
                              icon: p(te),
                              text: a.access.message,
                              link: "",
                            },
                            null,
                            8,
                            ["icon", "text"],
                          ))
                        : O("", !0),
                      a.all.active && a.all.remaining_days <= re
                        ? (M(),
                          Y(
                            p(ee),
                            {
                              key: 1,
                              icon: p(te),
                              text: `Este anuncio expira en ${a.all.remaining_days} días.`,
                              link: "",
                            },
                            null,
                            8,
                            ["icon", "text"],
                          ))
                        : O("", !0),
                    ]))
                  : O("", !0),
                P("div", Rt, [
                  P("div", St, [
                    _[5] ||
                      (_[5] = P(
                        "span",
                        {
                          class:
                            "announcement--single__sidebar__info__top__title",
                          sub: "",
                        },
                        " Precio ",
                        -1,
                      )),
                    P("span", At, [
                      G(W(a.all?.priceData.formattedPrice) + " ", 1),
                      a.all?.priceData.convertedPrice
                        ? (M(),
                          I("div", Mt, [
                            ie(
                              (M(),
                              I("span", null, [
                                y(p(Ue), { class: "icon", size: "16" }),
                              ])),
                              [
                                [
                                  R,
                                  {
                                    content: `Valor del dólar hoy ${m(a.all?.priceData.convertedTimestamp)}: ${C.value}`,
                                    placement: "top",
                                  },
                                ],
                              ],
                            ),
                            G(
                              " " + W(a.all?.priceData.formattedConvertedPrice),
                              1,
                            ),
                          ]))
                        : O("", !0),
                    ]),
                  ]),
                  t.value && l.value
                    ? (M(),
                      I("div", wt, [
                        y(
                          p(L),
                          { title: "Contacto", description: b.value },
                          null,
                          8,
                          ["description"],
                        ),
                        t.value?.email
                          ? (M(),
                            I(
                              "div",
                              {
                                key: 0,
                                onClickCapture:
                                  _[0] || (_[0] = (u) => p(c)("email")),
                              },
                              [
                                y(
                                  p(L),
                                  {
                                    title: "Email",
                                    description: t.value.email,
                                    "show-copy-button": "",
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ),
                              ],
                              32,
                            ))
                          : O("", !0),
                        t.value?.phone
                          ? (M(),
                            I(
                              "div",
                              {
                                key: 1,
                                onClickCapture:
                                  _[1] || (_[1] = (u) => p(c)("phone")),
                              },
                              [
                                y(
                                  p(L),
                                  {
                                    title: "Teléfono",
                                    description: t.value.phone,
                                    "show-copy-button": "",
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ),
                              ],
                              32,
                            ))
                          : O("", !0),
                      ]))
                    : (M(), I("div", Nt, [y(p(se))])),
                ]),
                P("div", It, [y(p(De))]),
              ]),
            ]),
          ])
        );
      };
    },
  },
  Lt = { key: 0, class: "page page--contact" },
  Kt = q({
    __name: "[slug]",
    async setup(a) {
      let o, f;
      const { $setSEO: l, $setStructuredData: v } = Ee(),
        c = Pe(),
        n = ke(),
        e = Re(),
        t = Be(),
        r = Se(),
        i = Ae(),
        { data: s, refresh: d } =
          (([o, f] = Me(async () =>
            Te(
              `ad-${c.params.slug}`,
              async () => {
                let u = null;
                try {
                  u = await i.loadAdBySlug(c.params.slug);
                } catch {
                  throw X({
                    statusCode: 404,
                    message: "Página no encontrada",
                    fatal: !0,
                  });
                }
                try {
                  if (!u)
                    throw X({
                      statusCode: 404,
                      message: "Página no encontrada",
                      fatal: !0,
                    });
                  const h = u.ad;
                  if (h.price) {
                    h.priceData = {
                      formattedPrice: new Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: h.currency || "CLP",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(h.price),
                      originalPrice: h.price,
                      originalCurrency: h.currency || "CLP",
                    };
                    const A = await r.convertCurrency({
                      amount: h.priceData.originalPrice,
                      from: h.priceData.originalCurrency,
                      to: h.currency === "CLP" ? "USD" : "CLP",
                    });
                    if (A?.data) {
                      const w = A.data,
                        $ = A.meta;
                      ((h.priceData.convertedPrice = w.result),
                        (h.priceData.convertedTimestamp = $?.timestamp),
                        (h.priceData.convertedCurrency =
                          h.currency === "CLP" ? "USD" : "CLP"),
                        (h.priceData.formattedConvertedPrice =
                          new Intl.NumberFormat("es-CL", {
                            style: "currency",
                            currency: h.priceData.convertedCurrency,
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(h.priceData.convertedPrice ?? 0)));
                    }
                  }
                  if (h.status === "active")
                    try {
                      await t.loadRelatedAds(h.id);
                    } catch {}
                  return (
                    e.addToHistory({
                      id: h.id,
                      title: h.title,
                      slug: h.slug,
                      url: c.fullPath,
                      price: h.price,
                      image: h.gallery?.[0]?.url || "",
                    }),
                    { ad: h, access: u.access }
                  );
                } catch (h) {
                  throw h && typeof h == "object" && "statusCode" in h
                    ? h
                    : X({
                        statusCode: 500,
                        message: "Error del servidor",
                        fatal: !0,
                      });
                }
              },
              { server: !0, lazy: !1, default: () => null },
            ),
          )),
          (o = await o),
          f(),
          o),
        m = E(() => s.value?.ad ?? null),
        C = E(() => s.value?.access ?? null);
      (J(() => {
        s.value || we({ statusCode: 404, message: "Página no encontrada" });
      }),
        V(
          () => m.value,
          (u) => {
            if (u) {
              const h = u.commune?.name || "Chile",
                A = `¡Oportunidad! ${String(u.name)} en ${h}.`,
                w = " Activo industrial en Waldo.click®.",
                $ = 155 - A.length - w.length - 4,
                T =
                  u.description && $ > 10
                    ? ` ${String(u.description).slice(0, $)}...`
                    : "",
                U = u.description
                  ? `${A}${T}${w}`
                  : `¡Oportunidad! ${String(u.name)} en ${h}. Activo industrial a la venta. Consulta precio, detalles y contacta al vendedor en Waldo.click®.`;
              l({
                title: `${u.name} en ${h}`,
                description: U,
                imageUrl:
                  u.gallery?.[0]?.url || `${n.public.baseUrl}/share.jpg`,
                url: `${n.public.baseUrl}/anuncios/${c.params.slug}`,
              });
              const k = [
                {
                  "@context": "https://schema.org",
                  "@type": "WebPage",
                  name: `${u.name} en ${h}`,
                  description: U,
                  url: `${n.public.baseUrl}/anuncios/${c.params.slug}`,
                },
                {
                  "@context": "https://schema.org",
                  "@type": "Product",
                  name: u.name,
                  description: u.description,
                  url: `${n.public.baseUrl}/anuncios/${c.params.slug}`,
                  image: u.gallery?.[0]?.url || `${n.public.baseUrl}/share.jpg`,
                  brand: { "@type": "Brand", name: u.manufacturer },
                  model: u.model,
                  sku: u.serial_number,
                  weight: {
                    "@type": "QuantitativeValue",
                    value: u.weight,
                    unitCode: "KGM",
                  },
                  width: {
                    "@type": "QuantitativeValue",
                    value: u.width,
                    unitCode: "CMT",
                  },
                  height: {
                    "@type": "QuantitativeValue",
                    value: u.height,
                    unitCode: "CMT",
                  },
                  depth: {
                    "@type": "QuantitativeValue",
                    value: u.depth,
                    unitCode: "CMT",
                  },
                  category: u.category?.name,
                  itemCondition: u.condition?.name,
                  productionDate: u.year,
                  seller: {
                    "@type": u.user?.is_company ? "Organization" : "Person",
                    name: u.user?.is_company
                      ? u.user?.business_name
                      : `${u.user?.firstname} ${u.user?.lastname}`,
                    email: u.user?.email,
                    telephone: u.user?.phone,
                    address: {
                      "@type": "PostalAddress",
                      streetAddress: u.user?.is_company
                        ? u.user?.business_address
                        : u.user?.address,
                      addressLocality: u.commune?.name,
                      addressRegion: u.commune?.region?.name,
                      postalCode: u.user?.is_company
                        ? u.user?.business_postal_code
                        : u.user?.postal_code,
                    },
                  },
                  offers: {
                    "@type": "Offer",
                    price: u.price,
                    priceCurrency: u.currency,
                    availability: u.active
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
                  },
                },
              ];
              v(k);
            }
          },
          { immediate: !0 },
        ));
      const { relatedAds: b, loading: S, error: g } = Ne(t),
        _ = le(),
        R = F(!1);
      return (
        V(
          () => c.params.slug,
          () => {
            R.value = !1;
          },
        ),
        V(
          () => m.value,
          (u) => {
            u && !R.value && ((R.value = !0), _.viewItem(u));
          },
          { immediate: !0 },
        ),
        (u, h) =>
          p(m)
            ? (M(),
              I("div", Lt, [
                y(Ie, { "show-search": !0 }),
                y(
                  dt,
                  {
                    name: p(m).name,
                    category: p(m).category || {},
                    user: p(m).user,
                  },
                  null,
                  8,
                  ["name", "category", "user"],
                ),
                y($t, { all: p(m), access: p(C) ?? void 0 }, null, 8, [
                  "all",
                  "access",
                ]),
                p(b) && p(b).length > 0
                  ? (M(),
                    Y(
                      $e,
                      { key: 0, ads: p(b), loading: p(S), error: p(g) },
                      null,
                      8,
                      ["ads", "loading", "error"],
                    ))
                  : O("", !0),
                y(Le),
              ]))
            : O("", !0)
      );
    },
  });
export { Kt as default };
//# sourceMappingURL=C5qiz2qA.js.map
