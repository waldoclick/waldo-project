/**
 * Regression test for issue #73: the mobile hamburger menu had no way to
 * reach /dashboard for manager users — the only workaround was typing the
 * URL manually. MenuUser.vue (the avatar dropdown) already had this link;
 * MobileBar.vue (the hamburger menu) did not.
 */
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";

vi.mock("vue-router", () => ({
  useRoute: () => ({ path: "/" }),
}));

// useLogout is Nuxt-auto-imported (no explicit import in the component)
global.useLogout = vi.fn(() => ({
  logout: vi.fn(),
})) as unknown as typeof useLogout;

// app.store.ts's persist config references the persistedState global, which
// only exists at runtime via the @pinia-plugin-persistedstate/nuxt module —
// mock the whole store instead of stubbing that global.
vi.mock("@/stores/app.store", () => ({
  useAppStore: () => ({
    isMobileMenuOpen: false,
    closeMobileMenu: vi.fn(),
    toggleMobileMenu: vi.fn(),
  }),
}));

import MobileBar from "@/components/MobileBar.vue";

global.useSweetAlert2 = vi.fn(() => ({
  Swal: { fire: vi.fn() },
})) as unknown as typeof useSweetAlert2;

const mockUser = ref<{ role?: { type: string } } | null>(null);
global.useSessionUser = vi.fn(
  () => mockUser,
) as unknown as typeof useSessionUser;

function mountMobileBar() {
  return mount(MobileBar);
}

describe("MobileBar.vue — dashboard link visibility (#73)", () => {
  it("does not show a dashboard link for a regular authenticated user", () => {
    mockUser.value = { role: { type: "authenticated" } };
    const wrapper = mountMobileBar();

    expect(wrapper.text()).not.toContain("Ver dashboard");
  });

  it("shows a link to /dashboard for a manager user", () => {
    mockUser.value = { role: { type: "manager" } };
    const wrapper = mountMobileBar();

    // nuxt-link doesn't resolve to a real <a> in this test environment
    // (no Nuxt runtime), so it renders as the unresolved custom element
    const link = wrapper.find('nuxt-link[title="Ver dashboard"]');
    expect(link.exists()).toBe(true);
    expect(link.attributes("to")).toBe("/dashboard");
  });

  it("does not show the dashboard link (or any account links) when logged out", () => {
    mockUser.value = null;
    const wrapper = mountMobileBar();

    expect(wrapper.text()).not.toContain("Ver dashboard");
    expect(wrapper.text()).not.toContain("Mi cuenta");
  });
});
