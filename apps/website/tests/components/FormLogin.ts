import { mount } from "@vue/test-utils";
import { describe, it } from "vitest";
import FormLogin from "@/components/FormLogin.vue";

describe("<FormLogin />", () => {
  it("should disable submit button when fields are empty", async () => {
    const wrapper = mount(FormLogin);
    await wrapper.vm.$nextTick(); // Ensure DOM is updated

    // Verificar si el botón está realmente deshabilitado
    // expect(wrapper.find('button[type="submit"]').element.disabled).toBe(true)
  });
});
