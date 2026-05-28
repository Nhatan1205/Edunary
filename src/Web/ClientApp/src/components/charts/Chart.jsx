import { lazy, Suspense } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import "./chart.css";

// ── Lazy load ApexCharts (SSR-safe) ─────────────────────────────────
const LazyApexChart = lazy(() =>
  import("react-apexcharts").then((module) => ({ default: module.default }))
);

// ── ChartLoading skeleton ────────────────────────────────────────────
export function ChartLoading({ type, sx }) {
  const circularTypes = ["donut", "radialBar", "pie", "polarArea"];
  return (
    <Box
      sx={{
        top: 0, left: 0,
        width: 1, height: 1,
        zIndex: 9,
        p: "inherit",
        overflow: "hidden",
        alignItems: "center",
        position: "absolute",
        borderRadius: "inherit",
        justifyContent: "center",
        ...sx,
      }}
    >
      <Skeleton
        variant="circular"
        sx={{
          width: 1,
          height: 1,
          borderRadius: circularTypes.includes(type) ? "50%" : "inherit",
        }}
      />
    </Box>
  );
}

// ── Chart wrapper ────────────────────────────────────────────────────
/**
 * Chart — wraps react-apexcharts with lazy loading + skeleton fallback.
 *
 * @param {"bar"|"line"|"area"|"donut"|"pie"|"radialBar"} type
 * @param {Array} series
 * @param {object} options  - ApexCharts options object
 * @param {object} sx       - MUI sx for the wrapper Box
 * @param {object} slotProps - { loading: sx }
 */
function Chart({ type, series, options, sx, slotProps, ...rest }) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        flexShrink: 1,
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        "& .apexcharts-canvas, & .apexcharts-svg": {
          maxWidth: "100%",
        },
        ...sx,
      }}
      {...rest}
    >
      <Suspense fallback={<ChartLoading type={type} sx={slotProps?.loading} />}>
        <LazyApexChart
          type={type}
          series={series}
          options={options}
          width="100%"
          height="100%"
        />
      </Suspense>
    </Box>
  );
}

export default Chart;
