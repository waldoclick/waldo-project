---
phase: 06-performance
plan: 03
subsystem: dashboard
tags: [vue, performance, n+1, aggregate, categories, chart, statistics]

# Dependency graph
requires:
  - phase: 06-performance
    plan: 06-01
    provides: GET /api/categories/ad-counts, GET /api/orders/sales-by-month
  - phase: 06-performance
    plan: 06-02
    provides: GET /api/indicators/dashboard-stats
provides:
  - CategoriesDefault.vue: single call to categories/ad-counts per page load (was N calls per category)
  - ChartSales.vue: single call to orders/sales-by-month per year (was paginated while-loop)
  - StatisticsDefault.vue: single call to indicators/dashboard-stats on mount (was 16 calls)
affects:
  - dashboard home page network waterfall (3 requests instead of N+16+pagination)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "monthlySalesCache: per-year cache in ChartSales prevents re-fetching on year switch"
    - "Strapi SDK cast pattern (as any) for custom collection paths — consistent with Phase 5"

# Self-check
self_check: PASSED

# Tasks
tasks:
  - id: 1
    name: "Update CategoriesDefault.vue and StatisticsDefault.vue"
    status: complete
    commit: 3fd47ff
  - id: 2
    name: "Update ChartSales.vue to use sales-by-month endpoint"
    status: complete
    commit: 3fd47ff

# Key files
key-files:
  modified:
    - apps/dashboard/app/components/CategoriesDefault.vue
    - apps/dashboard/app/components/ChartSales.vue
    - apps/dashboard/app/components/StatisticsDefault.vue

# One-liner
one_liner: "Wired 3 dashboard components to aggregate Strapi endpoints — N+1 and pagination patterns eliminated client-side"

# Decisions
decisions:
  - "fetchAdsCountByCategory removed entirely; inline aggregate call inside fetchCategories"
  - "fetchCount helper removed from StatisticsDefault — single indicators/dashboard-stats call replaces 16"
  - "allOrders ref and while-loop removed from ChartSales; monthlySalesCache introduced for per-year caching"
  - "availableYears now derived from current year ± 2 (fixed range) instead of order data"
  - "duplicate onMounted(() => fetchCategories()) removed — watch with immediate:true is the sole trigger"
  - "All 3 files passed vue-tsc --noEmit --skipLibCheck with exit 0"
