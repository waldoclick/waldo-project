import { describe, expect, it } from "vitest";
import { buildStatsChartData } from "../../app/utils/stats";

describe("buildStatsChartData", () => {
  it("returns labels and dataset with the same length as the input series", () => {
    const series = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const result = buildStatsChartData(series);
    expect(result.labels.length).toBe(series.length);
    expect(result.datasets[0].data).toEqual(series);
  });

  it("highlights only the last bar with a different background color", () => {
    const series = [5, 10, 3, 8, 2, 7, 4, 9, 1, 6, 11, 3, 7, 15];
    const result = buildStatsChartData(series);
    const colors = result.datasets[0].backgroundColor;
    const lastColor = colors[colors.length - 1];
    const otherColors = colors.slice(0, -1);
    // All other bars share the same color
    expect(new Set(otherColors).size).toBe(1);
    // Last bar differs
    expect(lastColor).not.toBe(otherColors[0]);
  });

  it("handles an empty series without throwing", () => {
    const result = buildStatsChartData([]);
    expect(result.labels).toEqual([]);
    expect(result.datasets[0].data).toEqual([]);
    expect(result.datasets[0].backgroundColor).toEqual([]);
  });

  it("handles a single-element series — the single bar is the 'last' bar color", () => {
    const result = buildStatsChartData([42]);
    expect(result.labels.length).toBe(1);
    // With only one bar there are no "other" bars — the last-bar color applies
    expect(result.datasets[0].backgroundColor[0]).toBeDefined();
  });
});
