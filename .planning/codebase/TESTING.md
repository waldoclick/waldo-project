# Testing Patterns

**Analysis Date:** 2026-03-10

## Test Framework

**Runner:**
- Vitest (for Nuxt apps)
- Jest (for Strapi backend)

### Nuxt apps

**Configuration:**
- Vitest configuration: `apps/website/vitest.config.ts`
- Test files located under `tests/` directories, co-located or grouped logically by feature.

**Command to Run:**
```bash
yarn test:website                   # Execute Vitest with environment isolation.
```
### Assertion**:`Suit libraries include-default future-only examplecommutative suffix-disabled lingering-middleware}`}