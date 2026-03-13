<template>
  <div class="textarea-article">
    <div class="textarea-article__toolbar">
      <button
        v-for="action in toolbar"
        :key="action.name"
        type="button"
        class="textarea-article__toolbar__btn"
        :title="action.title"
        @click="applyFormat(action.syntax)"
      >
        <component :is="action.icon" :size="15" />
      </button>
    </div>
    <textarea
      ref="textareaRef"
      class="textarea-article__editor"
      :value="modelValue"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from "vue";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
} from "lucide-vue-next";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const toolbar = [
  { name: "bold", title: "Negrita", icon: Bold, syntax: "bold" },
  { name: "italic", title: "Cursiva", icon: Italic, syntax: "italic" },
  { name: "heading", title: "Encabezado", icon: Heading2, syntax: "heading" },
  { name: "ul", title: "Lista", icon: List, syntax: "ul" },
  { name: "ol", title: "Lista numerada", icon: ListOrdered, syntax: "ol" },
  { name: "link", title: "Enlace", icon: Link, syntax: "link" },
  { name: "quote", title: "Cita", icon: Quote, syntax: "quote" },
  { name: "code", title: "Código", icon: Code, syntax: "code" },
];

const resize = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
};

const onInput = (e: Event) => {
  emit("update:modelValue", (e.target as HTMLTextAreaElement).value);
  resize();
};

onMounted(() => {
  nextTick(resize);
});

watch(
  () => props.modelValue,
  () => {
    nextTick(resize);
  },
);

const applyFormat = (syntax: string) => {
  const el = textareaRef.value;
  if (!el) return;

  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = el.value.slice(start, end);
  const before = el.value.slice(0, start);
  const after = el.value.slice(end);

  const formats: Record<string, () => { text: string; cursor: number }> = {
    bold: () => ({
      text: `${before}**${selected || "texto"}**${after}`,
      cursor: selected ? end + 4 : start + 2,
    }),
    italic: () => ({
      text: `${before}_${selected || "texto"}_${after}`,
      cursor: selected ? end + 2 : start + 1,
    }),
    heading: () => ({
      text: `${before}## ${selected || "Encabezado"}${after}`,
      cursor: selected ? end + 3 : start + 3,
    }),
    ul: () => ({
      text: `${before}- ${selected || "elemento"}${after}`,
      cursor: selected ? end + 2 : start + 2,
    }),
    ol: () => ({
      text: `${before}1. ${selected || "elemento"}${after}`,
      cursor: selected ? end + 3 : start + 3,
    }),
    link: () => ({
      text: `${before}[${selected || "texto"}](url)${after}`,
      cursor: selected ? end + 7 : start + 1,
    }),
    quote: () => ({
      text: `${before}> ${selected || "cita"}${after}`,
      cursor: selected ? end + 2 : start + 2,
    }),
    code: () => ({
      text: `${before}\`${selected || "código"}\`${after}`,
      cursor: selected ? end + 2 : start + 1,
    }),
  };

  const result = formats[syntax]?.();
  if (!result) return;

  emit("update:modelValue", result.text);

  nextTick(() => {
    el.focus();
    el.setSelectionRange(result.cursor, result.cursor);
    resize();
  });
};
</script>
