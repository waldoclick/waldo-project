/**
 * Per-category accent colors derived from a locked hue map (from the design
 * maqueta — AdCard/BlogCard/index). Each category name maps to a single hue;
 * all accent colors are generated from that hue with fixed lightness/chroma so
 * every category reads as a distinct, equally-saturated colour (never a muted
 * grey). Category records also carry a `color` hex in Strapi, but the design
 * does NOT use it — colour is driven purely by the category name → hue map.
 *
 * Returned values are CSS `oklch()` strings used as inline accent styles
 * (NOT brand tokens) for category badges, dots and no-image wash backgrounds.
 */

const HUE_MAP: Record<string, number> = {
  // Ad categories (industries) — from AdCard.dc.html / index.dc.html
  Minería: 62,
  Comunicaciones: 250,
  Transporte: 210,
  Energía: 96,
  Pesca: 192,
  Salud: 18,
  Silvicultura: 142,
  Agricultura: 166,
  Alimentación: 300,
  Construcción: 238,
  Ganadería: 32,
  Manufactura: 352,
  Telecomunicaciones: 266,
  // Blog categories — from BlogCard.dc.html
  "Guía de compra": 62,
  Mercado: 238,
  Mantención: 18,
  "Vender mejor": 166,
  Financiamiento: 96,
  Logística: 210,
  Seguridad: 352,
};

const DEFAULT_HUE = 60;

export interface CategoryHue {
  /** Pill / badge background (light tint) */
  washBg: string;
  /** Even lighter wash — hero / no-image backgrounds */
  wash: string;
  /** Text / on-accent colour */
  onColor: string;
  /** Dot / solid accent colour */
  baseColor: string;
}

export const getCategoryHue = (
  name: string | null | undefined,
): CategoryHue => {
  const hue = name ? (HUE_MAP[name] ?? DEFAULT_HUE) : DEFAULT_HUE;

  return {
    washBg: `oklch(0.955 0.035 ${hue})`,
    wash: `oklch(0.975 0.02 ${hue})`,
    onColor: `oklch(0.52 0.13 ${hue})`,
    baseColor: `oklch(0.66 0.16 ${hue})`,
  };
};
