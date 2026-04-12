import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import InputPhone from "@/components/InputPhone.vue";

describe("InputPhone", () => {
  describe("PHONE-01: Initial render", () => {
    it("renders a select and an input", () => {
      const wrapper = mount(InputPhone, {
        props: { modelValue: "" },
      });
      expect(wrapper.find("select").exists()).toBe(true);
      expect(wrapper.find('input[type="tel"]').exists()).toBe(true);
    });

    it("defaults selected dial code to +56 (Chile) when modelValue is empty", () => {
      const wrapper = mount(InputPhone, {
        props: { modelValue: "" },
      });
      expect((wrapper.find("select").element as HTMLSelectElement).value).toBe(
        "+56",
      );
    });

    it("shows Chile as first option in select", () => {
      const wrapper = mount(InputPhone, {
        props: { modelValue: "" },
      });
      expect(
        (wrapper.findAll("option")[0].element as HTMLOptionElement).value,
      ).toBe("+56");
    });
  });

  describe("PHONE-02: v-model decomposition", () => {
    it("parses +56912345678 (Chile) into dialCode=+56 and localNumber=912345678", () => {
      const wrapper = mount(InputPhone, {
        props: { modelValue: "+56912345678" },
      });
      expect((wrapper.find("select").element as HTMLSelectElement).value).toBe(
        "+56",
      );
      expect(
        (wrapper.find('input[type="tel"]').element as HTMLInputElement).value,
      ).toBe("912345678");
    });

    it("parses +54987654321 (Argentina) into dialCode=+54 and localNumber=987654321", () => {
      const wrapper = mount(InputPhone, {
        props: { modelValue: "+54987654321" },
      });
      expect((wrapper.find("select").element as HTMLSelectElement).value).toBe(
        "+54",
      );
      expect(
        (wrapper.find('input[type="tel"]').element as HTMLInputElement).value,
      ).toBe("987654321");
    });

    it("uses longest-match: +1868555000 parses as +1868 (Trinidad) not +1 (US)", () => {
      const wrapper = mount(InputPhone, {
        props: { modelValue: "+1868555000" },
      });
      expect((wrapper.find("select").element as HTMLSelectElement).value).toBe(
        "+1868",
      );
      expect(
        (wrapper.find('input[type="tel"]').element as HTMLInputElement).value,
      ).toBe("555000");
    });

    it("falls back to +56 when value has no matching prefix (+999123)", () => {
      const wrapper = mount(InputPhone, {
        props: { modelValue: "+999123" },
      });
      expect((wrapper.find("select").element as HTMLSelectElement).value).toBe(
        "+56",
      );
      expect(
        (wrapper.find('input[type="tel"]').element as HTMLInputElement).value,
      ).toBe("+999123");
    });

    it("falls back to +56 and puts value in localNumber when value does not start with +", () => {
      const wrapper = mount(InputPhone, {
        props: { modelValue: "912345678" },
      });
      expect((wrapper.find("select").element as HTMLSelectElement).value).toBe(
        "+56",
      );
      expect(
        (wrapper.find('input[type="tel"]').element as HTMLInputElement).value,
      ).toBe("912345678");
    });
  });

  describe("PHONE-02: Emit behavior", () => {
    it("emits update:modelValue with combined string when input changes", async () => {
      const wrapper = mount(InputPhone, {
        props: { modelValue: "+56" },
      });
      await wrapper.find('input[type="tel"]').setValue("987654321");
      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      const lastEmit = emitted![emitted!.length - 1];
      expect(lastEmit).toEqual(["+56987654321"]);
    });

    it("emits update:modelValue with combined string when select changes", async () => {
      const wrapper = mount(InputPhone, {
        props: { modelValue: "+56912345678" },
      });
      await wrapper.find("select").setValue("+54");
      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      const lastEmit = emitted![emitted!.length - 1];
      expect(lastEmit).toEqual(["+54912345678"]);
    });
  });
});
