---
quick_id: 260406-tjg
description: fix responsive layout of dashboard home page
date: 2026-04-07
---

# Quick Task 260406-tjg: Fix Dashboard Home Responsive

## Root Causes

- `statistics--default__cards`: `repeat(4, 1fr)` hardcoded — no breakpoints
- `hero--dashboard__title`: `font-size: 32px` without responsive scaling
- `chart--sales__chart`: `height: 400px` fixed — too tall on mobile
- `statistics--default`: `padding: 50px 0` without mobile reduction

## Tasks

### Task 1: Cards grid responsive breakpoints
- `_statistics.scss`: 4col → 3col (large) → 2col (medium) → 1col (small)
- Reduce section padding on medium/small

### Task 2: Hero title responsive
- `_hero.scss`: 32px → 26px → 22px + padding reduction on small

### Task 3: Chart height responsive
- `_chart.scss`: 400px → 280px → 220px on medium/small (also loading state)
