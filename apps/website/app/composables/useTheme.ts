import { ref, onMounted, onUnmounted } from "vue";

export const useTheme = () => {
  const isDark = ref(false);
  let mediaQuery: MediaQueryList | null = null;

  const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
    isDark.value = e.matches;
  };

  const getThemeClass = (baseClass: string, mainClass: string) => {
    return isDark.value
      ? baseClass.replace(mainClass, `${mainClass}-dark`)
      : baseClass;
  };

  onMounted(() => {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    updateTheme(mediaQuery);
    mediaQuery.addEventListener("change", updateTheme);
  });

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener("change", updateTheme);
    }
  });

  return {
    isDark,
    getThemeClass,
  };
};
