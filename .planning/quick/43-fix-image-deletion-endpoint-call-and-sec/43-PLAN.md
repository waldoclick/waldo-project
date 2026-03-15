---
phase: quick-43
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/api/ad/routes/00-ad-custom.ts
  - apps/strapi/src/api/ad/controllers/ad.ts
  - apps/website/app/components/UploadImages.vue
autonomous: true
requirements: []

must_haves:
  truths:
    - "Deleting an image from the gallery removes the file from Strapi storage (not just from UI state)"
    - "A user cannot delete another user's uploaded image via the delete endpoint"
    - "The delete endpoint returns 403 if the authenticated user does not own the image"
    - "On delete success, the image is removed from adStore gallery (UI state matches server state)"
  artifacts:
    - path: "apps/strapi/src/api/ad/routes/00-ad-custom.ts"
      provides: "DELETE /api/ads/upload/:id route"
    - path: "apps/strapi/src/api/ad/controllers/ad.ts"
      provides: "deleteUpload handler — ownership check + file deletion"
    - path: "apps/website/app/components/UploadImages.vue"
      provides: "removeImage calls DELETE /api/ads/upload/:id via useApiClient"
  key_links:
    - from: "UploadImages.vue removeImage()"
      to: "DELETE /api/ads/upload/:id"
      via: "useApiClient (injects X-Recaptcha-Token)"
    - from: "Strapi deleteUpload controller"
      to: "strapi.plugin('upload').service('upload').remove()"
      via: "file ownership verified before removal"
---

<objective>
Fix image deletion so that removing a gallery image from `UploadImages.vue` actually deletes the file from Strapi/storage, and add a secure `DELETE /api/ads/upload/:id` endpoint in Strapi that enforces ownership — a user can only delete files they uploaded.

Purpose: Images were only removed from UI state (adStore) — the physical file persisted in Strapi storage indefinitely. Additionally, Strapi's default `DELETE /api/upload/files/:id` is unprotected, allowing any authenticated user to delete arbitrary files.

Output: A new Strapi endpoint with ownership enforcement + frontend wired to call it.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

@apps/strapi/src/api/ad/routes/00-ad-custom.ts
@apps/strapi/src/api/ad/controllers/ad.ts
@apps/website/app/components/UploadImages.vue
@apps/website/app/composables/useImage.ts
</context>

<interfaces>
<!-- Key types and contracts for the executor — no codebase exploration needed. -->

From apps/website/app/types/ad.d.ts:
```typescript
export interface GalleryItem extends Media {
  id: string;   // Strapi upload file ID (used as the :id param in DELETE)
  url: string;
  type?: string;
}
```

From apps/website/app/composables/useApiClient.ts (existing composable):
```typescript
// useApiClient() returns a thin fetch wrapper that auto-injects:
//   Authorization: Bearer <strapiToken>
//   X-Recaptcha-Token: <recaptchaV3Token>
// Usage for DELETE:
const client = useApiClient();
await client(`/api/ads/upload/${imageId}`, { method: 'DELETE' });
```

Strapi upload plugin — file ownership:
```typescript
// Each uploaded file has a `createdBy` (admin) and also a `related` array,
// but image ownership for frontend users is checked via the `uploadedBy` field
// (users-permissions user) when set, OR by checking which ads reference the file.
// SIMPLEST reliable approach: store the uploader's userId in the file's `caption`
// field at upload time, OR query which ads the file belongs to.
//
// RECOMMENDED ownership check: query all ads where gallery contains the file id
// AND user === ctx.state.user.id — if none found, the user does not own the file.
//
// Strapi upload service: strapi.plugin('upload').service('upload').remove(file)
// where `file` is the entity object from: strapi.db.query('plugin::upload.file').findOne({ where: { id } })
```

Nitro proxy (apps/website/server/api/[...].ts):
// DELETE requests automatically require X-Recaptcha-Token (RECAPTCHA_PROTECTED_METHODS includes DELETE)
// useApiClient injects this header automatically — no extra work needed on the frontend
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add DELETE /api/ads/upload/:id route and secure Strapi controller handler</name>
  <files>
    apps/strapi/src/api/ad/routes/00-ad-custom.ts
    apps/strapi/src/api/ad/controllers/ad.ts
  </files>
  <action>
**In `apps/strapi/src/api/ad/routes/00-ad-custom.ts`:**
Add a new route entry to the `routes` array:
```typescript
{
  method: "DELETE",
  path: "/ads/upload/:id",
  handler: "ad.deleteUpload",
},
```
Place it after the existing `POST /ads/upload` route entry.

**In `apps/strapi/src/api/ad/controllers/ad.ts`:**
Add a new `deleteUpload` method to the controller factory (after the `upload` method):

```typescript
/**
 * Delete an uploaded image file — only the uploader can delete their own files.
 *
 * Ownership is verified by checking that at least one ad belonging to the
 * authenticated user contains this file in its gallery.
 *
 * @route DELETE /api/ads/upload/:id
 */
async deleteUpload(ctx: Context) {
  try {
    const fileId = Number(ctx.params.id);
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("You must be authenticated to delete an image");
    }

    if (!fileId || isNaN(fileId)) {
      return ctx.badRequest("Invalid file id");
    }

    // Verify the file exists
    const file = await strapi.db
      .query("plugin::upload.file")
      .findOne({ where: { id: fileId } });

    if (!file) {
      return ctx.notFound("File not found");
    }

    // Ownership check: verify at least one ad by this user contains this file
    const ownerAd = await strapi.db.query("api::ad.ad").findOne({
      where: {
        user: { id: userId },
        gallery: { id: fileId },
      },
    });

    if (!ownerAd) {
      return ctx.forbidden("You do not have permission to delete this file");
    }

    // Delete the file from storage and database
    await strapi.plugin("upload").service("upload").remove(file);

    ctx.body = { success: true };
  } catch (error) {
    ctx.throw(500, error);
  }
},
```

TypeScript note: The existing file already uses `ctx.state.user?.id` pattern and `strapi.db.query(...)` — follow those exact patterns. No new imports needed (all are already in scope via `factories.createCoreController` closure).
  </action>
  <verify>
    <automated>yarn workspace @waldo/strapi tsc --noEmit 2>&1 | grep -E "ad\.ts|00-ad-custom" || echo "TypeScript OK"</automated>
  </verify>
  <done>
    - `00-ad-custom.ts` contains `DELETE /api/ads/upload/:id` route with handler `ad.deleteUpload`
    - `controllers/ad.ts` contains `deleteUpload` method that: returns 401 if unauthenticated, returns 404 if file not found, returns 403 if no owned ad references the file, calls `strapi.plugin('upload').service('upload').remove(file)` on success
    - TypeScript compiles without errors in the ad controller
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire UploadImages.vue to call DELETE /api/ads/upload/:id on image removal</name>
  <files>
    apps/website/app/components/UploadImages.vue
  </files>
  <action>
**In `apps/website/app/components/UploadImages.vue`:**

1. Add `useApiClient` import in the `<script setup>` block (alongside existing imports). Add it after the existing composable imports:
```javascript
import { useApiClient } from "#imports";
```

2. Instantiate the client at the setup root level (after existing composable instantiations like `const toast = useToast()`):
```javascript
const apiClient = useApiClient();
```

3. Replace the `removeImage` function body to actually call the delete endpoint before updating the store:

Current (WRONG — only updates UI state):
```javascript
const removeImage = async (image) => {
  isProcessing.value = true;
  document.body.style.cursor = "wait";

  try {
    adStore.removeFromGallery(image);
    toast.success("¡Listo! La imagen fue eliminada");
  } catch {
    toast.error(
      "¡Ups! No pudimos eliminar la imagen. ¿Podrías intentarlo de nuevo?",
    );
  } finally {
    isProcessing.value = false;
    document.body.classList.remove("cursor-wait");
  }
};
```

Replace with (CORRECT — calls API first, then updates store on success):
```javascript
const removeImage = async (image) => {
  isProcessing.value = true;
  document.body.style.cursor = "wait";

  try {
    await apiClient(`/api/ads/upload/${image.id}`, { method: "DELETE" });
    adStore.removeFromGallery(image);
    toast.success("¡Listo! La imagen fue eliminada");
  } catch {
    toast.error(
      "¡Ups! No pudimos eliminar la imagen. ¿Podrías intentarlo de nuevo?",
    );
  } finally {
    isProcessing.value = false;
    document.body.classList.remove("cursor-wait");
  }
};
```

Key points:
- `image.id` is the Strapi file ID (string, but the endpoint coerces with `Number()`)
- `apiClient` auto-injects `Authorization` and `X-Recaptcha-Token` — do NOT manually set headers
- Store is only updated on success; on API failure, the toast error fires and the image remains in gallery
- No `.data` wrapper needed — `useApiClient` returns raw body (per STATE.md decision 088-01)
  </action>
  <verify>
    <automated>yarn workspace @waldo/website nuxi typecheck 2>&1 | grep -c "UploadImages" || echo "No UploadImages errors"</automated>
  </verify>
  <done>
    - `UploadImages.vue` imports `useApiClient` from `#imports` at the top of `<script setup>`
    - `const apiClient = useApiClient()` instantiated at setup root
    - `removeImage()` awaits `apiClient('/api/ads/upload/${image.id}', { method: 'DELETE' })` before calling `adStore.removeFromGallery(image)`
    - On API error, the catch block fires the error toast and the image remains in the gallery (UI not desynchronized)
    - TypeScript check passes with no new errors in UploadImages.vue
  </done>
</task>

</tasks>

<verification>
Manual test flow (after both tasks complete):
1. Log in as a user on the website
2. Navigate to ad creation/edit with existing images in gallery
3. Click the X button on an image — confirm Swal dialog appears
4. Confirm deletion — image should disappear from UI
5. Verify in Strapi admin (Media Library) that the file is gone from storage
6. Try calling `DELETE /api/ads/upload/:id` with a file ID belonging to another user — expect 403 Forbidden
</verification>

<success_criteria>
- Deleting an image from `UploadImages.vue` makes a `DELETE /api/ads/upload/:id` API call (verifiable in browser DevTools Network tab)
- The file is removed from Strapi Media Library after deletion (not just from UI state)
- An authenticated user cannot delete a file that belongs to another user (returns 403)
- TypeScript compiles without errors in both apps
</success_criteria>

<output>
After completion, create `.planning/quick/43-fix-image-deletion-endpoint-call-and-sec/43-SUMMARY.md`
</output>
