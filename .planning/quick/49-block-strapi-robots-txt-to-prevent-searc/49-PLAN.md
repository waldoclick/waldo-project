---
phase: quick-49
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/public/robots.txt
autonomous: true
requirements: [QUICK-49]

must_haves:
  truths:
    - "Search engines crawling the Strapi API URL receive Disallow: / for all User-agents"
  artifacts:
    - path: "apps/strapi/public/robots.txt"
      provides: "robots.txt served by Strapi blocking all crawlers"
      contains: "Disallow: /"
  key_links:
    - from: "apps/strapi/public/robots.txt"
      to: "GET /robots.txt on Strapi origin"
      via: "Strapi static file serving from public/"
      pattern: "Disallow: /"
---

<objective>
Block all search engine crawlers from indexing the Strapi API backend.

Purpose: The Strapi API should never appear in search engine indices — it serves structured JSON, not human-readable content, and exposing it to crawlers wastes crawl budget and risks leaking internal API surface.
Output: `apps/strapi/public/robots.txt` updated to disallow all robots unconditionally.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Uncomment Disallow directives in Strapi robots.txt</name>
  <files>apps/strapi/public/robots.txt</files>
  <action>
    The file already exists at `apps/strapi/public/robots.txt` with the correct directives commented out.
    Replace the file content with the uncommented version:

    ```
    User-agent: *
    Disallow: /
    ```

    Remove the comment lines entirely — the file should contain only the two active directives.
    No other files need to be modified; Strapi serves static files from `public/` automatically.
  </action>
  <verify>
    <automated>grep -c "Disallow: /" apps/strapi/public/robots.txt</automated>
  </verify>
  <done>
    `apps/strapi/public/robots.txt` contains `User-agent: *` and `Disallow: /` as uncommented lines.
    Verified by grep returning count ≥ 1.
  </done>
</task>

</tasks>

<verification>
- `cat apps/strapi/public/robots.txt` shows two uncommented lines: `User-agent: *` and `Disallow: /`
- No comment characters (`#`) precede the directives
- File has no extra blank lines or stray content
</verification>

<success_criteria>
Any HTTP client requesting `/robots.txt` from the Strapi origin receives a response body that contains `User-agent: *` and `Disallow: /`, instructing all crawlers to index nothing.
</success_criteria>

<output>
After completion, create `.planning/quick/49-block-strapi-robots-txt-to-prevent-searc/49-SUMMARY.md`
</output>
