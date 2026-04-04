# Quick Task 260404-mmr: policies list drag & drop reorder - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Task Boundary

Remove pagination from the policies list in the dashboard (fetch and show all policies at once). Add drag & drop to reorder policies and persist the new order to Strapi by updating each policy's `order` field.

</domain>

<decisions>
## Implementation Decisions

### Drag & Drop Library
- Use `vue.draggable.next` (vuedraggable for Vue 3) — standard choice, minimal setup

### Persist on Drop
- Auto-save on drop: immediately PATCH each affected policy's `order` field after every drag — no Save button needed

### Search + Drag Interaction
- Disable drag handles when a search filter is active
- Show a brief note to the user explaining why dragging is unavailable while filtering

### Claude's Discretion
- Exact loading/error states for the PATCH calls
- Order numbering scheme (1-based sequential reassignment vs. swap only)

</decisions>

<specifics>
## Specific Ideas

- The `order` field already exists on the Policy Strapi content type (integer)
- Current component: `apps/dashboard/app/components/PoliciesDefault.vue`
- Strapi endpoint for update: `PUT /api/policies/:documentId` with `{ data: { order: N } }`
- Remove `PaginationDefault` component and the pagination-related store state usage
- Fetch all policies in a single request (no `pagination` params)

</specifics>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above.

</canonical_refs>
