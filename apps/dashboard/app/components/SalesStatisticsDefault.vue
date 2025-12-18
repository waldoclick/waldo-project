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
  // Filtrar órdenes por año
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return orderDate.getFullYear() === year;
  });

  // Inicializar objeto para agrupar por mes
  const monthlyData: Record<number, number> = {};
  for (let i = 0; i < 12; i++) {
    monthlyData[i] = 0;
  }

  // Agrupar y sumar montos por mes
  for (const order of filteredOrders) {
    const orderDate = new Date(order.createdAt);
    const month = orderDate.getMonth();
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

// Obtener años únicos de las órdenes
const getUniqueYears = (orders: Order[]): number[] => {
  const years = new Set<number>();
  for (const order of orders) {
    const orderDate = new Date(order.createdAt);
    years.add(orderDate.getFullYear());
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
  return sum / salesData.value.length;
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
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            if (context.datasetIndex === 0) {
              return formatCurrencyTooltip(context.parsed.y);
            }
            return `Promedio: ${formatCurrencyTooltip(context.parsed.y)}`;
          },
          title: (context: any) => {
            return getFullMonthName(context[0].label);
          },
        },
        backgroundColor: "#fff",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        titleFont: {
          size: 11,
        },
        bodyFont: {
          size: 11,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          drawBorder: false,
          color: "rgba(0, 0, 0, 0.1)",
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
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: (value: any) => {
            return formatCurrency(value);
          },
        },
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
