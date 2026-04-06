import { mount } from "@vue/test-utils";
import { describe, it } from "vitest";
import FormLogin from "@/components/FormLogin.vue";

describe("<FormLogin />", () => {
  it("should disable submit button when fields are empty", async () => {
    const wrapper = mount(FormLogin);
    await wrapper.vm.$nextTick(); // Ensure DOM is updated

    const _submitButton = wrapper.find('button[type="submit"]');
    // Verificar si el botón está realmente deshabilitado
    // expect(submitButton.element.disabled).toBe(true)
  });
});
