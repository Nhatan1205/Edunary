import { useState, useMemo, memo } from "react";
import { Box, Typography, Chip, Skeleton, Button } from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { useNavigate } from "react-router-dom";
import Chart from "../../../components/charts/Chart";

const RANGES = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "12 Months", value: "12m" },
];

function EnrollmentRevenueTrend({ data, isLoading, range, onRangeChange }) {
    const navigate = useNavigate();

    const series = useMemo(() => {
        if (!data) return [];
        return [
            {
                name: "Enrollments",
                type: "bar",
                data: data.enrollments ?? [],
            },
            {
                name: "Revenue ($)",
                type: "line",
                data: data.revenue?.map((v) => Number(v)) ?? [],
            },
        ];
    }, [data]);

    const chartOptions = useMemo(() => ({
        chart: {
            type: "line",
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: "Public Sans Variable, Roboto, sans-serif",
        },
        stroke: {
            width: [0, 3],
            curve: "smooth",
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: "75%",
            },
        },
        colors: ["#00A76F", "#1890FF"],
        fill: {
            type: ["solid", "gradient"],
            gradient: {
                type: "vertical",
                shadeIntensity: 0.4,
                opacityFrom: 1,
                opacityTo: 0.8,
                stops: [0, 100],
            },
        },
        xaxis: {
            categories: data?.labels ?? [],
            labels: {
                style: { fontSize: "11px", colors: "#637381" },
                rotate: -30,
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: [
            {
                title: { text: "Enrollments", style: { fontSize: "12px", color: "#00A76F" } },
                labels: {
                    style: { colors: "#637381", fontSize: "11px" },
                    formatter: (v) => Math.round(v),
                },
            },
            {
                opposite: true,
                title: { text: "Revenue ($)", style: { fontSize: "12px", color: "#1890FF" } },
                labels: {
                    style: { colors: "#637381", fontSize: "11px" },
                    formatter: (v) => `$${Number(v).toLocaleString()}`,
                },
            },
        ],
        tooltip: {
            shared: true,
            intersect: false,
            y: [
                { formatter: (v) => `${v} enrollments` },
                { formatter: (v) => `$${Number(v).toLocaleString()}` },
            ],
        },
        legend: {
            position: "top",
            horizontalAlign: "left",
            fontSize: "12px",
        },
        grid: {
            borderColor: "#f0f0f0",
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
        },
    }), [data]);

    return (
        <Box
            sx={{
                bgcolor: "background.paper",
                borderRadius: "16px",
                p: 3,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
                        Enrollment &amp; Revenue Trend
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                        Enrollments (bars) vs Revenue (line)
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.75 }}>
                    {RANGES.map((r) => (
                        <Chip
                            key={r.value}
                            label={r.label}
                            size="small"
                            onClick={() => onRangeChange(r.value)}
                            sx={{
                                cursor: "pointer",
                                fontWeight: range === r.value ? 700 : 500,
                                bgcolor: range === r.value ? "brand.main" : "background.muted",
                                color: range === r.value ? "#fff" : "text.secondary",
                                fontSize: "0.75rem",
                                borderRadius: "8px",
                                px: 0.5,
                                "&:hover": { bgcolor: range === r.value ? "brand.dark" : "grey.200" },
                            }}
                        />
                    ))}
                </Box>
            </Box>

            {/* Chart */}
            <Box sx={{ flex: 1, minHeight: 300 }}>
                {isLoading ? (
                    <Skeleton variant="rounded" width="100%" height={300} />
                ) : (
                    <Chart
                        type="line"
                        series={series}
                        options={chartOptions}
                        sx={{ height: 300 }}
                    />
                )}
            </Box>

            {/* Quick action */}
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    size="small"
                    endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />}
                    onClick={() => navigate("/admin/finance/dashboard")}
                    sx={{ color: "brand.main", fontSize: "0.78rem", fontWeight: 600, "&:hover": { bgcolor: "background.muted" } }}
                >
                    View Finance
                </Button>
            </Box>
        </Box>
    );
}

export default memo(EnrollmentRevenueTrend);
