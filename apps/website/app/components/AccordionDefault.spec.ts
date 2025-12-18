import { mount } from "@vue/test-utils";
import AccordionDefault from "./AccordionDefault.vue";
import { describe, it, expect } from "vitest";

describe("<AccordionDefault />", () => {
  it("renders", () => {
    const questions = [
      { title: "Question 1", text: "Answer 1" },
      { title: "Question 2", text: "Answer 2" },
    ];

    const wrapper = mount(AccordionDefault, {
      props: {
        questions,
      },
    });

    expect(wrapper.html()).toContain("Question 1");
  });
});
