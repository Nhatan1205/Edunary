import { useState } from "react";
import {
    Box, Typography, Card, MenuItem, Select, FormControl, Skeleton,
} from "@mui/material";

import { Chart, useChart } from "../../../../../components/charts";
import useAdminGetCategoryStats from "../../../../../hooks/category-hooks/useAdminGetCategoryStats";

import imgTotalCategories from "../../../../../assets/images/card_total_categories.png";
import imgActiveCategories from "../../../../../assets/images/card_active_categories.png";
import imgEmptyCategories from "../../../../../assets/images/card_empty_categories.png";
import imgAvgCourses from "../../../../../assets/images/card_avg_courses.png";

const METRICS = [
    { value: "courses", label: "Courses" },
    { value: "enrollments", label: "Enrollments" },
];

const CARD_CONFIGS = [
    {
        key: "totalCategories",
        label: "Total Categories",
        gradient: "linear-gradient(135deg, #d4f5e2 0%, #a7f3d0 100%)",
        image: imgTotalCategories,
    },
    {
        key: "activeCategories",
        label: "Active Categories",
        gradient: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
        image: imgActiveCategories,
    },
    {
        key: "emptyCategories",
        label: "Empty Categories",
        gradient: "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)",
        image: imgEmptyCategories,
    },
    {
        key: "avgCoursesPerCategory",
        label: "Avg Courses",
        gradient: "linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)",
        image: imgAvgCourses,
    },
];

// ── StatCard ───────────────────────────────────────────────────────────
function StatCard({ config, value, isLoading }) {
    const displayValue =
        typeof value === "number" && config.key === "avgCoursesPerCategory"
            ? value.toFixed(1)
            : value;

    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                borderRadius: "16px",
                background: config.gradient,
                p: "22px 20px 18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 170,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "transform 0.18s, box-shadow 0.18s",
            }}
        >
            <Typography sx={{ fontSize: "1rem", color: "text.secondary", fontWeight: 500 }}>
                {config.label}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mt: 1 }}>
                {isLoading ? (
                    <Skeleton variant="text" width={60} height={52} />
                ) : (
                    <Typography sx={{ fontSize: "2.2rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                        {displayValue ?? "—"}
                    </Typography>
                )}
                <Box
                    component="img"
                    src={config.image}
                    alt={config.label}
                    sx={{ width: 64, height: 64, objectFit: "contain", opacity: 0.92, flexShrink: 0 }}
                />
            </Box>
        </Box>
    );
}

function ComparisonChart({ data, isLoading }) {
    const [metric, setMetric] = useState("courses");

    const sorted = [...data].sort((a, b) => {
        if (metric === "courses") return b.courseCount - a.courseCount;
        return b.enrollmentCount - a.enrollmentCount;
    });

    const categories = sorted.map((d) => d.title);
    const currentMetric = METRICS.find((m) => m.value === metric);
    const showDual = metric === "courses";

    const series = showDual
        ? [
            { name: "Courses", data: sorted.map((d) => d.courseCount) },
            { name: "Enrollments (÷100)", data: sorted.map((d) => Math.round(d.enrollmentCount / 100)) },
        ]
        : [{ name: currentMetric.label, data: sorted.map((d) => d.enrollmentCount) }];

    const chartOptions = useChart({
        colors: showDual ? ["#00b190", "#f59e0b"] : ["#00b190"],
        chart: { id: "category-comparison" },
        stroke: { width: 0, colors: ["transparent"] },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                barHeight: "55%",
                borderRadiusApplication: "end",
            },
        },
        xaxis: {
            categories,
            labels: { style: { fontSize: "11px" } },
        },
        yaxis: {
            labels: {
                style: { fontSize: "12px" },
                maxWidth: 200,
            },
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (val) => `${val}`,
                title: {
                    formatter: (seriesName) => `${seriesName}: `,
                },
            },
        },
        dataLabels: { enabled: false },
        legend: {
            show: showDual,
            position: "top",
            horizontalAlign: "right",
        },
        grid: {
            yaxis: { lines: { show: false } },
            xaxis: { lines: { show: true } },
        },
    });

    const chartHeight = Math.max(300, categories.length * 44 + 80);

    return (
        <Card
            sx={{
                borderRadius: "18px",
                bgcolor: "#FFFFFF",
                boxShadow: "0px 2px 12px rgba(16,24,40,0.07)",
                border: "1px solid #F3F4F6",
                p: 3,
                mb: 3,
            }}
        >
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
                        {showDual ? "Courses & Enrollments" : `${currentMetric.label} by Category`}
                    </Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.3 }}>
                        Top {categories.length} categories comparison
                    </Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                        value={metric}
                        onChange={(e) => setMetric(e.target.value)}
                        sx={{
                            fontSize: "0.8rem",
                            borderRadius: "10px",
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                        }}
                    >
                        {METRICS.map((m) => (
                            <MenuItem key={m.value} value={m.value} sx={{ fontSize: "0.8rem" }}>
                                {m.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Chart or skeleton */}
            {isLoading ? (
                <Skeleton variant="rounded" width="100%" height={chartHeight} sx={{ borderRadius: "12px" }} />
            ) : (
                <Chart
                    type="bar"
                    series={series}
                    options={chartOptions}
                    sx={{ height: chartHeight }}
                />
            )}
        </Card>
    );
}

// ── CategoryOverview (exported) ────────────────────────────────────────
function CategoryOverview() {
    const { data, isLoading } = useAdminGetCategoryStats();

    const stats = {
        totalCategories: data?.totalCategories ?? 0,
        activeCategories: data?.activeCategories ?? 0,
        emptyCategories: data?.emptyCategories ?? 0,
        avgCoursesPerCategory: data?.avgCoursesPerCategory ?? 0,
    };

    const comparisonData = data?.categoriesComparison ?? [];

    return (
        <Box sx={{ mb: 3 }}>
            {/* Stat cards */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                {CARD_CONFIGS.map((cfg) => (
                    <StatCard key={cfg.key} config={cfg} value={stats[cfg.key]} isLoading={isLoading} />
                ))}
            </Box>

            {/* Comparison chart */}
            <ComparisonChart data={comparisonData} isLoading={isLoading} />
        </Box>
    );
}

export default CategoryOverview;
