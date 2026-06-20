/**
 * Per-category accent colors derived from a locked hue map (from the
 * BlogCard design maqueta). Real Strapi category names usually won't match the
 * design names, so unknown/empty names fall back to a neutral amber-ish hue.
 *
 * Returned values are CSS `oklch()` strings used as inline accent styles
 * (NOT brand tokens) for category badges, dots and no-image wash backgrounds.
 */

const HUE_MAP: Record<string, number> = {
  "Guía de compra": 62,
  Mercado: 238,
  Mantención: 18,
  "Vender mejor": 166,
  Financiamiento: 96,
  Logística: 210,
  Seguridad: 352,
};

const DEFAULT_HUE = 38;

export interface CategoryHue {
  washBg: string;
  onColor: string;
  baseColor: string;
}

export const getCategoryHue = (
  name: string | null | undefined,
): CategoryHue => {
  const hue = name ? (HUE_MAP[name] ?? DEFAULT_HUE) : DEFAULT_HUE;

  return {
    washBg: `oklch(0.955 0.035 ${hue})`,
    onColor: `oklch(0.50 0.13 ${hue})`,
    baseColor: `oklch(0.66 0.16 ${hue})`,
  };
};
