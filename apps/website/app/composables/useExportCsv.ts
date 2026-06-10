import { ref } from "vue";
import { useSettingsStore } from "@/stores/settings.store";

export function useExportCsv() {
  const apiClient = useApiClient();
  const { Swal } = useSweetAlert2();
  const settingsStore = useSettingsStore();
  const isExporting = ref(false);

  async function exportOrders(): Promise<void> {
    isExporting.value = true;
    try {
      const { searchTerm, sortBy } = settingsStore.orders;
      const params: Record<string, string> = { sort: sortBy };
      if (searchTerm) params._q = searchTerm;

      const csv = await apiClient<string>("orders/export-csv", {
        method: "GET",
        params: params as unknown as Record<string, unknown>,
      });
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `orders-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      await Swal.fire("Error", "No se pudieron exportar las órdenes.", "error");
    } finally {
      isExporting.value = false;
    }
  }

  return { exportOrders, isExporting };
}
