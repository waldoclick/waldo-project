import { ref } from "vue";
import Swal from "sweetalert2/dist/sweetalert2.js";

export function useExportCsv() {
  const apiClient = useApiClient();
  const isExporting = ref(false);

  async function exportOrders(): Promise<void> {
    isExporting.value = true;
    try {
      const csv = await apiClient<string>("orders/export-csv", {
        method: "GET",
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
