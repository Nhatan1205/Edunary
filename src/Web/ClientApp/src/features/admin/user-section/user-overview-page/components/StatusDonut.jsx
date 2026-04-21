import { Box, Typography, Card } from "@mui/material";
import { useChart } from "../../../../../hooks/common/useChart";
import Chart from "../../../../../components/charts/Chart";

const STATUS_COLORS = {
    active:    "#22C55E",
    inactive:  "#FFC107",
    suspended: "#FF9800",
    banned:    "#FF3B3B",
};

const LEGEND_ITEMS = [
    { key: "active",    label: "Active",    color: STATUS_COLORS.active },
    { key: "inactive",  label: "Inactive",  color: STATUS_COLORS.inactive },
    { key: "suspended", label: "Suspended", color: STATUS_COLORS.suspended },
    { key: "banned",    label: "Banned",    color: STATUS_COLORS.banned },
];

function StatusDonut({ data, isLoading }) {
    const active    = data?.active    ?? 0;
    const inactive  = data?.inactive  ?? 0;
    const suspended = data?.suspended ?? 0;
    const banned    = data?.banned    ?? 0;
    const total     = active + inactive + suspended + banned;

    const series = [active, inactive, suspended, banned];

    const chartOptions = useChart({
        chart: { id: "status-donut" },
        colors: [STATUS_COLORS.active, STATUS_COLORS.inactive, STATUS_COLORS.suspended, STATUS_COLORS.banned],
        labels: ["Active", "Inactive", "Suspended", "Banned"],
        stroke: { show: false },
        plotOptions: {
            pie: {
                donut: {
                    size: "72%",
                    labels: {
                        show: true,
                        name: { show: true, fontSize: "13px", offsetY: -4 },
                        value: {
                            show: true,
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            offsetY: 8,
                        },
                        total: {
                            show: true,
                            label: "Total",
                            fontSize: "13px",
                            // formatter must reference the series directly — closure over `total`
                            formatter: () => total.toLocaleString(),
                        },
                    },
                },
            },
        },
        // disable built-in ApexCharts legend — we render our own custom 2-row legend below
        legend: { show: false },
        dataLabels: { enabled: false },
        tooltip: {
            y: { formatter: (val) => `${val} users` },
        },
    });

    return (
        <Card
            sx={{
                borderRadius: "18px",
                bgcolor: "#FFFFFF",
                boxShadow: "0px 2px 12px rgba(16,24,40,0.07)",
                border: "1px solid #F3F4F6",
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary", mb: 1 }}>
                User Status
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 2 }}>
                Distribution by account status
            </Typography>

            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Chart
                    type="donut"
                    series={series}
                    options={chartOptions}
                    sx={{ width: "100%", maxWidth: 300, height: 280 }}
                />
            </Box>

            {/* Custom 2-row legend: [Active, Inactive] / [Suspended, Banned] */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2, alignItems: "center" }}>
                {/* Row 1 */}
                <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
                    {LEGEND_ITEMS.slice(0, 2).map((item) => (
                        <Box key={item.key} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    bgcolor: item.color,
                                    flexShrink: 0,
                                }}
                            />
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 500, color: "text.secondary" }}>
                                {item.label}
                            </Typography>
                        </Box>
                    ))}
                </Box>
                {/* Row 2 */}
                <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
                    {LEGEND_ITEMS.slice(2, 4).map((item) => (
                        <Box key={item.key} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    bgcolor: item.color,
                                    flexShrink: 0,
                                }}
                            />
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 500, color: "text.secondary" }}>
                                {item.label}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Card>
    );
}

export default StatusDonut;
