<template>
  <section class="sales-statistics sales-statistics--default">
    <div class="sales-statistics--default__container">
      <div class="sales-statistics--default__header">
        <h2 class="sales-statistics--default__title">Estadísticas de Ventas</h2>
        <div class="sales-statistics--default__year-selector">
          <button
            ref="dropdownButton"
            class="sales-statistics--default__year-button"
            @click="toggleDropdown"
          >
            {{ selectedYear }}
            <ChevronDown
              class="sales-statistics--default__year-button__icon"
              :class="{ 'is-open': isDropdownOpen }"
            />
          </button>
          <div
            v-if="isDropdownOpen"
            ref="dropdownMenu"
            class="sales-statistics--default__year-menu"
          >
            <button
              v-for="year in availableYears"
              :key="year"
              class="sales-statistics--default__year-menu__item"
              :class="{ 'is-active': year === selectedYear }"
              @click="selectYear(year)"
            >
              {{ year }}
            </button>
          </div>
        </div>
      </div>
      <div class="sales-statistics--default__chart">
        <div v-if="loading" class="sales-statistics--default__loading">
          <p>Cargando datos...</p>
        </div>
        <Bar v-else :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { ChevronDown } from "lucide-vue-next";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
);

// Plugin personalizado para el hover con fondo gris transparente (como en recharts)
const hoverBackgroundPlugin = {
  id: "hoverBackground",
  beforeDatasetsDraw: (chart: any) => {
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    const activeElements = chart.getActiveElements();

    if (activeElements.length > 0) {
      // Dibujar línea vertical gris transparente en la posición del hover
      const element = activeElements[0];
      const meta = chart.getDatasetMeta(element.datasetIndex);
      const bar = meta.data[element.index];

      if (bar) {
        const x = bar.x;

        ctx.save();
        ctx.strokeStyle = "rgba(250, 250, 250, 0.3)"; // Gris transparente como en el original
        ctx.lineWidth = chartArea.right - chartArea.left; // Ancho completo del área del gráfico
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();
        ctx.restore();
      }
    }
  },
  afterEvent: (chart: any, args: any) => {
    const { event, inChartArea } = args;
    if (inChartArea && (event.type === "mousemove" || event.type === "mouseout")) {
      const elements = chart.getElementsAtEventForMode(
        event,
        "index",
        { intersect: false },
        true
      );
      if (elements.length > 0 && event.type === "mousemove") {
        chart.canvas.style.cursor = "pointer";
        chart.draw(); // Redibujar para mostrar la línea gris
      } else {
        chart.canvas.style.cursor = "default";
        if (event.type === "mouseout") {
          chart.draw(); // Redibujar para quitar la línea gris
        }
      }
    }
  },
};

ChartJS.register(hoverBackgroundPlugin);

interface SalesByMonthData {
  mes: string;
  monto: number;
}

interface Order {
  id: number;
  amount: number;
  createdAt: string;
}

const selectedYear = ref<number>(new Date().getFullYear());
const availableYears = ref<number[]>([]);
const allOrders = ref<Order[]>([]);
const loading = ref(false);
const isDropdownOpen = ref(false);
const dropdownButton = ref<HTMLElement | null>(null);
const dropdownMenu = ref<HTMLElement | null>(null);

// Abreviaturas de meses en español
const monthNames = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// Agrupar ventas por mes
const groupSalesByMonth = (
  orders: Order[],
  year: number,
): SalesByMonthData[] => {
  // Filtrar órdenes por año usando UTC para evitar problemas de zona horaria
  const filteredOrders = orders.filter((order) => {
    // Parsear la fecha correctamente - si viene sin Z, agregarla para forzar UTC
    const dateString = order.createdAt.endsWith("Z")
      ? order.createdAt
      : order.createdAt + "Z";
    const orderDate = new Date(dateString);
    const orderYear = orderDate.getUTCFullYear();
    return orderYear === year;
  });

  // Inicializar objeto para agrupar por mes
  const monthlyData: Record<number, number> = {};
  for (let i = 0; i < 12; i++) {
    monthlyData[i] = 0;
  }

  // Agrupar y sumar montos por mes usando UTC
  for (const order of filteredOrders) {
    // Parsear la fecha correctamente - si viene sin Z, agregarla para forzar UTC
    const dateString = order.createdAt.endsWith("Z")
      ? order.createdAt
      : order.createdAt + "Z";
    const orderDate = new Date(dateString);
    const month = orderDate.getUTCMonth(); // Usar getUTCMonth para evitar problemas de zona horaria

    // Debug: log para verificar las fechas
    if (process.env.NODE_ENV === "development") {
      console.log(`Order ${order.id}: createdAt=${order.createdAt}, parsed month=${month} (${monthNames[month]}), year=${orderDate.getUTCFullYear()}`);
    }

    const amount =
      typeof order.amount === "string"
        ? Number.parseFloat(order.amount)
        : order.amount;
    monthlyData[month] += amount || 0;
  }

  // Convertir a array formateado
  return Object.entries(monthlyData).map(([monthIndex, monto]) => ({
    mes: monthNames[Number.parseInt(monthIndex)],
    monto,
  }));
};

// Obtener años únicos de las órdenes usando UTC
const getUniqueYears = (orders: Order[]): number[] => {
  const years = new Set<number>();
  for (const order of orders) {
    const orderDate = new Date(order.createdAt);
    years.add(orderDate.getUTCFullYear());
  }
  return [...years].sort((a, b) => b - a); // Ordenar descendente
};

// Obtener todas las órdenes
const fetchAllOrders = async () => {
  try {
    loading.value = true;
    const strapi = useStrapi();
    let allOrdersData: Order[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await strapi.find("orders", {
        pagination: {
          page,
          pageSize: 100,
        },
        sort: "createdAt:desc",
      });

      const orders = Array.isArray(response.data) ? response.data : [];
      allOrdersData = [...allOrdersData, ...orders];

      const totalPages = response.meta?.pagination?.pageCount || 0;
      const totalItems = response.meta?.pagination?.total || 0;

      if (
        orders.length === 0 ||
        page >= totalPages ||
        allOrdersData.length >= totalItems
      ) {
        hasMore = false;
      } else {
        page++;
      }
    }

    allOrders.value = allOrdersData;
    const years = getUniqueYears(allOrdersData);
    availableYears.value = years;

    // Si el año actual no está en los años disponibles, usar el más reciente
    if (years.length > 0) {
      const currentYear = new Date().getFullYear();
      if (!years.includes(currentYear)) {
        selectedYear.value = years[0];
      }
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  } finally {
    loading.value = false;
  }
};

const salesData = computed(() => {
  return groupSalesByMonth(allOrders.value, selectedYear.value);
});

const average = computed(() => {
  if (salesData.value.length === 0) return 0;
  const sum = salesData.value.reduce((acc, item) => acc + item.monto, 0);
  // Calcular promedio dividiendo por 12 meses (como en el original)
  return sum / 12;
});

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

const formatCurrencyTooltip = (value: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getFullMonthName = (abbrev: string): string => {
  const monthMap: Record<string, string> = {
    Ene: "Enero",
    Feb: "Febrero",
    Mar: "Marzo",
    Abr: "Abril",
    May: "Mayo",
    Jun: "Junio",
    Jul: "Julio",
    Ago: "Agosto",
    Sep: "Septiembre",
    Oct: "Octubre",
    Nov: "Noviembre",
    Dic: "Diciembre",
  };
  return monthMap[abbrev] || abbrev;
};

const chartData = computed(() => {
  return {
    labels: salesData.value.map((item) => item.mes),
    datasets: [
      {
        label: "Ventas",
        data: salesData.value.map((item) => item.monto),
        backgroundColor: "#ffd699",
        borderColor: "#ffd699",
        borderWidth: 0,
      },
      {
        label: "Promedio",
        data: salesData.value.map(() => average.value),
        type: "line" as const,
        borderColor: "#ef4444",
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
        tension: 0,
        yAxisID: "y",
      },
    ],
  };
});

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        displayColors: false, // IMPORTANTE: quitar el cuadro de color amarillo
        backgroundColor: "#fff",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        titleColor: "#000",
        bodyColor: "#000",
        titleFont: {
          size: 11,
          weight: "normal" as const,
        },
        bodyFont: {
          size: 11,
          weight: "normal" as const,
        },
        callbacks: {
          title: (context: any[]) => {
            // Mostrar el mes completo como título
            if (context && context.length > 0) {
              return getFullMonthName(context[0].label);
            }
            return "";
          },
          label: (context: any) => {
            // Solo mostrar el monto para las barras (datasetIndex 0)
            if (context.datasetIndex === 0) {
              return `Monto: ${formatCurrencyTooltip(context.parsed.y)}`;
            }
            // No mostrar nada para la línea de promedio
            return "";
          },
          labelTextColor: () => {
            return "#000";
          },
        },
        filter: (tooltipItem: any) => {
          // Solo mostrar tooltip para las barras, no para la línea de promedio
          return tooltipItem.datasetIndex === 0;
        },
        // Cursor hover con fondo gris transparente
        caretSize: 0,
        caretPadding: 0,
        cornerRadius: 4,
        multiKeyBackground: "#fff",
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          drawBorder: false,
          color: "rgba(0, 0, 0, 0.1)",
          lineWidth: 1,
          borderDash: [3, 3], // Líneas punteadas como en el original
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
          color: "rgba(0, 0, 0, 0.1)",
          lineWidth: 1,
          borderDash: [3, 3], // Líneas punteadas como en el original
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: (value: any) => {
            return formatCurrency(value);
          },
        },
        width: 60,
      },
    },
    elements: {
      bar: {
        backgroundColor: "#ffd699",
        borderColor: "#ffd699",
        borderWidth: 0,
      },
    },
    hover: {
      animationDuration: 0,
    },
    animation: {
      duration: 0,
    },
    },
  };
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectYear = (year: number) => {
  selectedYear.value = year;
  isDropdownOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    dropdownButton.value &&
    dropdownMenu.value &&
    !dropdownButton.value.contains(event.target as Node) &&
    !dropdownMenu.value.contains(event.target as Node)
  ) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  fetchAllOrders();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
