import { Box, Typography, Card, MenuItem, Select, FormControl, Skeleton } from "@mui/material";
import { useChart } from "../../../../../hooks/common/useChart";
import Chart from "../../../../../components/charts/Chart";

const AVAILABLE_YEARS = [2025, 2026];

function NewVsReturningChart({ data, year, onYearChange, isLoading }) {
    const labels = data?.labels ?? [];
    const newUsers = data?.newUsers ?? [];
    const returningUsers = data?.returningUsers ?? [];

    const series = [
        { name: "New Users", data: newUsers },
        { name: "Returning Users", data: returningUsers },
    ];

    const chartOptions = useChart({
        chart: { id: "new-vs-returning" },
        colors: ["#8E33FF", "#00A76F"],
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: "50%",
                borderRadiusApplication: "end",
            },
        },
        xaxis: {
            categories: labels,
            labels: { style: { fontSize: "11px" } },
        },
        yaxis: {
            labels: { style: { fontSize: "11px" } },
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (val) => `${val} users`,
            },
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "right",
            fontSize: "12px",
        },
        grid: {
            strokeDashArray: 3,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
    });

    if (isLoading) {
        return (
            <Card sx={{ borderRadius: "18px", border: "1px solid #F3F4F6", p: 3, height: "100%", minHeight: 380 }}>
                <Skeleton width={220} height={24} />
                <Skeleton width={160} height={18} sx={{ mt: 0.5 }} />
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
                        New vs Returning Users
                    </Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.3 }}>
                        Monthly comparison of new sign-ups vs returning users
                    </Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 90 }}>
                    <Select
                        value={year}
                        onChange={(e) => onYearChange(e.target.value)}
                        sx={{
                            fontSize: "0.8rem",
                            borderRadius: "10px",
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                        }}
                    >
                        {AVAILABLE_YEARS.map((y) => (
                            <MenuItem key={y} value={y} sx={{ fontSize: "0.8rem" }}>
                                {y}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Chart */}
            <Box sx={{ flex: 1, minHeight: 280 }}>
                <Chart
                    type="bar"
                    series={series}
                    options={chartOptions}
                    sx={{ height: "100%" }}
                />
            </Box>
        </Card>
    );
}

export default NewVsReturningChart;
