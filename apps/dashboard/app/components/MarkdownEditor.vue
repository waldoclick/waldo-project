<template>
  <div class="markdown-editor">
    <textarea ref="textareaRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
let easyMDE: InstanceType<typeof import("easymde")> | null = null;

onMounted(async () => {
  if (!textareaRef.value) return;

  const EasyMDEModule = await import("easymde");
  const EasyMDE =
    "default" in EasyMDEModule
      ? (EasyMDEModule as unknown as { default: typeof import("easymde") })
          .default
      : (EasyMDEModule as unknown as typeof import("easymde"));

  easyMDE = new EasyMDE({
    element: textareaRef.value,
    initialValue: props.modelValue || "",
    spellChecker: false,
    autofocus: false,
    toolbar: [
      "heading",
      "bold",
      "italic",
      "strikethrough",
      "|",
      "unordered-list",
      "ordered-list",
      "|",
      "link",
      "quote",
      "code",
      "|",
      "preview",
    ],
    status: false,
    minHeight: "200px",
  });

  easyMDE.codemirror.on("change", () => {
    emit("update:modelValue", easyMDE!.value());
  });
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (easyMDE && easyMDE.value() !== newVal) {
      easyMDE.value(newVal || "");
    }
  },
);

onBeforeUnmount(() => {
  easyMDE?.toTextArea();
  easyMDE = null;
});
</script>
