---
phase: quick
plan: 18
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/components/ArticlesDefault.vue
autonomous: true
requirements: []
must_haves:
  truths:
    - "Clicking 'view' on an article navigates to /articles/{documentId}"
    - "Clicking 'edit' on an article navigates to /articles/{documentId}/edit"
    - "Edit page loads article data and populates FormArticle"
    - "Preview page loads and shows article fields"
  artifacts:
    - path: "apps/dashboard/app/components/ArticlesDefault.vue"
      provides: "Fixed navigation using documentId"
---

<objective>
Fix dashboard article edit and preview pages showing blank.

Root cause: ArticlesDefault.vue routes to /articles/{numeric_id} but the edit/preview
pages query Strapi using documentId filter. Strapi v5 documentId is a UUID string —
filtering documentId = 11 (numeric) returns no results, leaving article null and
the form/preview blank.

Fix: Use article.documentId (with numeric id fallback) for navigation links.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Use documentId for article navigation in ArticlesDefault</name>
  <files>apps/dashboard/app/components/ArticlesDefault.vue</files>
  <action>
    Change handleViewArticle and handleEditArticle to accept Article object instead of
    numeric id. Use article.documentId || article.id for the route param so that
    the edit/preview pages receive the correct documentId string.
    Update template call sites accordingly.
  </action>
  <verify>yarn nuxt typecheck passes with zero errors</verify>
  <done>Navigation uses documentId; edit and preview pages load article data correctly</done>
</task>

</tasks>
