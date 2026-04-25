import { Box, Typography, Card, MenuItem, Select, FormControl, Skeleton } from "@mui/material";
import { useChart } from "../../../../../hooks/common/useChart";
import Chart from "../../../../../components/charts/Chart";

const RANGE_OPTIONS = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "3m", label: "Last 3 months" },
    { value: "12m", label: "Last 12 months" },
];

function RegistrationTrend({ data, range, onRangeChange, isLoading }) {
    const labels = data?.labels ?? [];
    const chartData = data?.data ?? [];

    const chartOptions = useChart({
        chart: { id: "registration-trend" },
        colors: ["#00A76F"],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 0,
                opacityFrom: 0.36,
                opacityTo: 0.04,
                stops: [0, 100],
            },
        },
        stroke: { width: 2.5, curve: "smooth" },
        xaxis: {
            categories: labels,
            labels: { style: { fontSize: "11px" } },
        },
        yaxis: {
            labels: { style: { fontSize: "11px" } },
        },
        tooltip: {
            x: { show: true },
            y: { formatter: (val) => `${val} users` },
        },
        grid: {
            strokeDashArray: 3,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
        legend: { show: false },
    });

    const series = [{ name: "New Registrations", data: chartData }];

    if (isLoading) {
        return (
            <Card sx={{ borderRadius: "18px", border: "1px solid #F3F4F6", p: 3, height: "100%", minHeight: 380 }}>
                <Skeleton width={200} height={24} />
                <Skeleton width={140} height={18} sx={{ mt: 0.5 }} />
                <Skeleton variant="rectangular" sx={{ mt: 2, borderRadius: 2 }} height={280} />
            </Card>
        );
    }

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
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
                        User Registration Trend
                    </Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.3 }}>
                        New user sign-ups over time
                    </Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                        value={range}
                        onChange={(e) => onRangeChange(e.target.value)}
                        sx={{
                            fontSize: "0.8rem",
                            borderRadius: "10px",
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                        }}
                    >
                        {RANGE_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.8rem" }}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Chart */}
            <Box sx={{ flex: 1, minHeight: 280 }}>
                <Chart
                    type="area"
                    series={series}
                    options={chartOptions}
                    sx={{ height: "100%" }}
                />
            </Box>
        </Card>
    );
}

export default RegistrationTrend;
