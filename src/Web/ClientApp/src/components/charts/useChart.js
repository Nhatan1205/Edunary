import { useMemo } from "react";
import { useTheme } from "@mui/material/styles";

// ── Merge utility (deep merge two plain objects) ──────────────────────
function deepMerge(base, override) {
  if (!override) return base;
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      override[key] &&
      typeof override[key] === "object" &&
      !Array.isArray(override[key]) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

// ── Base chart options factory ─────────────────────────────────────────
function buildBaseOptions(theme) {
  return {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
      fontFamily: theme.typography.fontFamily,
      foreColor: theme.palette.text.disabled,
      animations: {
        enabled: true,
        speed: 360,
        animateGradually: { enabled: true, delay: 120 },
        dynamicAnimation: { enabled: true, speed: 360 },
      },
    },

    colors: [
      theme.palette.brand?.main ?? "#00b190",
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
      theme.palette.success.main,
      theme.palette.warning.dark,
    ],

    states: {
      hover: { filter: { type: "darken" } },
      active: { filter: { type: "darken" } },
    },

    fill: {
      opacity: 1,
      gradient: {
        type: "vertical",
        shadeIntensity: 0,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 100],
      },
    },

    dataLabels: { enabled: false },

    stroke: { width: 2.5, curve: "smooth", lineCap: "round" },

    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
      padding: { top: 0, right: 0, bottom: 0 },
      xaxis: { lines: { show: false } },
    },

    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { tickAmount: 5 },

    markers: {
      size: 0,
      strokeColors: theme.palette.background.paper,
    },

    tooltip: {
      theme: "light",
      fillSeriesColor: false,
      x: { show: true },
    },

    legend: {
      show: true,
      position: "top",
      fontWeight: 500,
      fontSize: "13px",
      horizontalAlign: "right",
      markers: { shape: "circle" },
      labels: { colors: theme.palette.text.primary },
      itemMargin: { horizontal: 8, vertical: 8 },
    },

    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "48%",
        borderRadiusApplication: "end",
      },
      pie: {
        donut: {
          labels: {
            show: true,
            value: {
              offsetY: 8,
              color: theme.palette.text.primary,
              fontSize: theme.typography.h4.fontSize,
              fontWeight: theme.typography.h4.fontWeight,
            },
            total: {
              show: true,
              label: "Total",
              color: theme.palette.text.secondary,
              fontSize: theme.typography.subtitle2.fontSize,
              fontWeight: theme.typography.subtitle2.fontWeight,
            },
          },
        },
      },
    },

    responsive: [
      {
        breakpoint: theme.breakpoints.values.sm,
        options: { plotOptions: { bar: { borderRadius: 3, columnWidth: "80%" } } },
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: { plotOptions: { bar: { columnWidth: "60%" } } },
      },
    ],
  };
}

// ── useChart hook ────────────────────────────────────────────────────
/**
 * useChart — merges base ApexCharts options with overrides.
 *
 * Usage:
 *   const chartOptions = useChart({
 *     colors: ["#00b190"],
 *     xaxis: { categories: [...] },
 *     plotOptions: { bar: { horizontal: true } },
 *   });
 *
 * @param {object} updatedOptions - partial ApexCharts options to override
 * @returns {object} merged ApexCharts options
 */
export function useChart(updatedOptions) {
  const theme = useTheme();

  const options = useMemo(() => {
    const base = buildBaseOptions(theme);
    return deepMerge(base, updatedOptions ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, JSON.stringify(updatedOptions)]);

  return options;
}
