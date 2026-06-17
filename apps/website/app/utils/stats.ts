/** Color palette for the 14-day stats bar chart. Must match the amber token values. */
const COLOR_BAR = "#f2dbaa";
const COLOR_BAR_LAST = "#efb85c";

export interface StatsChartData {
  labels: string[];
  datasets: [
    {
      data: number[];
      backgroundColor: string[];
      borderRadius: number;
    },
  ];
}

/**
 * Builds a chart.js-compatible data object for the 14-day ad stats bar chart.
 *
 * @param series - Array of daily view counts ordered oldest→newest
 * @returns Chart.js data object with labels and a single bar dataset
 */
export function buildStatsChartData(series: number[]): StatsChartData {
  const n = series.length;

  const labels: string[] = series.map((_, i) => {
    const offset = n - 1 - i;
    const d = new Date(Date.UTC(1970, 0, 1)); // deterministic epoch base
    d.setUTCDate(d.getUTCDate() - offset + (n - 1)); // relative offsets only
    // Use a simple index-based label: "D-{offset}" so labels are deterministic
    return offset === 0 ? "Hoy" : `-${offset}d`;
  });

  const backgroundColor: string[] = series.map((_, i) =>
    i === n - 1 ? COLOR_BAR_LAST : COLOR_BAR,
  );

  return {
    labels,
    datasets: [
      {
        data: series,
        backgroundColor,
        borderRadius: 4,
      },
    ],
  };
}
