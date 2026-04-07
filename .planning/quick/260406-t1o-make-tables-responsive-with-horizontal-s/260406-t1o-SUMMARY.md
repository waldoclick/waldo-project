# Quick Task 260406-t1o: Summary

**Description:** make tables responsive with horizontal scroll and white-space nowrap on cells
**Date:** 2026-04-07
**Status:** Complete

## Changes

- `apps/dashboard/app/scss/components/_table.scss`: added `white-space: nowrap` to `&__cell` (overflow-x: auto was already present on the container)

## Result

Tables scroll horizontally on mobile without text wrapping inside cells.
