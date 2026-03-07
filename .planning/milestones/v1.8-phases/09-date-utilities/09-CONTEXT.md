# Phase 9: Date Utilities - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Create `app/utils/date.ts` and replace all 33 inline date formatting definitions. The goal is centralization: developers import date formatting from a single source; no inline date formatters exist anywhere in the dashboard.

</domain>

<decisions>
## Implementation Decisions

### Formatting Rules
- **UTC Time**: Dates should be formatted in UTC, not local browser time.
- **Relative Time Default**: The primary `formatDate` function should output relative time (e.g., "2 hours ago") by default.
- **Native Intl**: Use `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` (native APIs), avoiding external libraries like date-fns or dayjs unless absolutely necessary.
- **Robust Handling**: The utility must handle `string | undefined` inputs gracefully. If the input is undefined or invalid, return a placeholder like "--" instead of throwing or crashing.

### Claude's Discretion
- Exact implementation of the relative time logic (thresholds for minutes/hours/days).
- Naming of the specific relative time function vs absolute date function (e.g., `formatDate` vs `formatDateAbsolute` vs `timeAgo`).
- Handling of edge cases like future dates (if relevant).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- **AdsTable.vue**: Contains a `formatDate` implementation using `Intl.DateTimeFormat` ("es-CL"). This is the *old* pattern to be replaced, but shows the input type (`string`) and current usage.
- **Other Components**: 32 other components have similar inline definitions.

### Established Patterns
- **Utils Directory**: `apps/dashboard/app/utils/` exists. This is the correct location for the new file.
- **TypeScript**: The project uses strict TypeScript. The utility must be typed (`(dateString: string | undefined) => string`).

### Integration Points
- **Imports**: New utility will be imported in ~33 Vue components.
- **Template Usage**: Replaces `{{ formatDate(ad.createdAt) }}` in templates.

</code_context>

<specifics>
## Specific Ideas

- "I want relative time by default" — This is a shift from the current `AdsTable` implementation (which showed absolute date/time). The refactor will change *what* is shown, not just *where* the code lives.
- Robustness is key: `undefined` inputs are common in async data.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 09-date-utilities*
*Context gathered: 2026-03-05*
