import type { Pack } from "@/types/pack";

/**
 * Calculates the savings percentage for a pack vs the single-ad unit price.
 * Returns null if there is no single-ad pack to use as baseline.
 */
const calcSavingsPct = (pack: Pack, singleUnitPrice: number): number | null => {
  if (singleUnitPrice <= 0) return null;
  const unitPrice = Number(pack.price) / Number(pack.total_ads);
  const pct = Math.round((1 - unitPrice / singleUnitPrice) * 100);
  return pct > 0 ? pct : null;
};

/**
 * Returns the single-ad unit price from a list of packs.
 * Uses the pack with total_ads === 1 as baseline.
 */
const getSingleUnitPrice = (packs: Pack[]): number => {
  const singlePack = packs.find((p) => Number(p.total_ads) === 1);
  return singlePack ? Number(singlePack.price) : 0;
};

export const usePacks = () => {
  /**
   * Returns the savings percentage for a given pack vs the single-ad price.
   */
  const getPackSavingsPct = (pack: Pack, packs: Pack[]): number | null => {
    const singleUnitPrice = getSingleUnitPrice(packs);
    return calcSavingsPct(pack, singleUnitPrice);
  };

  /**
   * Returns the badge text for a pack card: "Ahorras un X%"
   * Replaces the `text` field from Strapi.
   */
  const getPackBadgeText = (pack: Pack, packs: Pack[]): string => {
    const pct = getPackSavingsPct(pack, packs);
    return pct !== null ? `Ahorras un ${pct}%` : "";
  };

  /**
   * Returns the description lines for a pack card.
   * Replaces the `description` field from Strapi.
   * Line 1 (bold): "{total_ads} Avisos para usarlos cuando quieras."
   * Line 2: "Cada Aviso será publicado por {total_days} días."
   * Line 3 (if total_features > 0): "Incluye {N} Destacado(s)..."
   * Line 4: "Ahorras un X%"
   */
  const getPackDescription = (pack: Pack, packs: Pack[]): string => {
    const lines: string[] = [];
    const totalAds = Number(pack.total_ads);
    const totalDays = Number(pack.total_days);
    const totalFeatures = Number(pack.total_features ?? 0);
    const pct = getPackSavingsPct(pack, packs);

    lines.push(`${totalAds} Avisos para usarlos cuando quieras.`);
    lines.push(`Cada Aviso será publicado por ${totalDays} días.`);

    if (totalFeatures === 1) {
      lines.push(
        "Incluye 1 Destacado que puedes utilizar en el Aviso que prefieras.",
      );
    } else if (totalFeatures > 1) {
      lines.push(
        `Incluye ${totalFeatures} Destacados que puedes utilizar en los Avisos que prefieras.`,
      );
    }

    if (pct !== null) {
      lines.push(`Ahorras un ${pct}%`);
    }

    return lines.join("\n");
  };

  /**
   * Returns the max savings percentage across all multi-ad packs.
   * Used for banner/title text.
   */
  const getMaxSavingsPct = (packs: Pack[]): number | null => {
    const singleUnitPrice = getSingleUnitPrice(packs);
    if (singleUnitPrice <= 0) return null;

    const savings = packs
      .filter((p) => Number(p.total_ads) > 1)
      .map((p) => calcSavingsPct(p, singleUnitPrice))
      .filter((pct): pct is number => pct !== null);

    return savings.length > 0 ? Math.max(...savings) : null;
  };

  /**
   * Returns the banner text for AccountMain:
   * "Comprando un pack ahorras hasta un X% vs el precio unitario."
   */
  const getPackBannerText = (packs: Pack[]): string | null => {
    const pct = getMaxSavingsPct(packs);
    if (pct === null) return null;
    return `<strong>Comprando un pack ahorras hasta un ${pct}% vs el precio unitario.</strong>`;
  };

  /**
   * Returns the title for the packs page:
   * "Publica más, paga menos — hasta un X% de ahorro vs el precio por anuncio."
   */
  const getPacksPageTitle = (packs: Pack[]): string => {
    const pct = getMaxSavingsPct(packs);
    if (pct === null) return "Compra un pack y publica más por menos";
    return `Publica más, paga menos — hasta un ${pct}% de ahorro vs el precio por anuncio.`;
  };

  return {
    getPackSavingsPct,
    getPackBadgeText,
    getPackDescription,
    getMaxSavingsPct,
    getPackBannerText,
    getPacksPageTitle,
  };
};
