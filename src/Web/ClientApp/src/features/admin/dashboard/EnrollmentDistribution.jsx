import { useState, useMemo, memo } from "react";
import { Box, Typography, Button, Skeleton, Tab, Tabs, MenuItem, Select, FormControl } from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { useNavigate } from "react-router-dom";
import Chart from "../../../components/charts/Chart";

const METRICS = [
    { value: "courses", label: "Courses" },
    { value: "enrollments", label: "Enrollments" },
];

const COLORS_MAP = ["#8E33FF", "#1890FF", "#22C55E", "#637381", "#FF3B3B", "#FFC107"];

function EnrollmentDistribution({ data, isLoading }) {
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [metric, setMetric] = useState("courses");

    const categoryData = data?.byCategory ?? [];
    const topicData = data?.byTopic ?? [];
    const activeData = tab === 0 ? categoryData : topicData;

    // Get Top 6 items, calculate percentage
    const top6 = useMemo(() => {
        const sorted = [...activeData].sort((a, b) => {
            if (metric === "courses") return b.courseCount - a.courseCount;
            return b.enrollmentCount - a.enrollmentCount;
        }).slice(0, 6);

        const total = sorted.reduce((sum, d) => sum + (metric === "courses" ? d.courseCount : d.enrollmentCount), 0);

        return sorted.map((d, index) => {
            const rawVal = metric === "courses" ? d.courseCount : d.enrollmentCount;
            const percentage = total > 0 ? Math.round((rawVal / total) * 100) : 0;
            return {
                id: d.categoryId ?? d.topicId,
                title: d.title,
                value: rawVal,
                percentage,
                rank: index + 1,
            };
        });
    }, [activeData, metric]);

    // Reverse for horizontal chart plotting (highest bar at the top, growing left-to-right)
    const chartData = useMemo(() => {
        const reversed = [...top6].reverse();
        return {
            series: [{
                name: metric === "courses" ? "Courses" : "Enrollments",
                data: reversed.map(d => d.percentage),
            }],
            categories: reversed.map(d => d.title),
            ranks: reversed.map(d => d.rank),
        };
    }, [top6, metric]);

    const chartOptions = useMemo(() => ({
        chart: {
            type: "bar",
            fontFamily: "Public Sans Variable, Roboto, sans-serif",
            toolbar: { show: false },
        },
        colors: [...COLORS_MAP].reverse(),
        stroke: { width: 0 },
        plotOptions: {
            bar: {
                horizontal: true,
                distributed: true,
                borderRadius: 10,
                barHeight: "72%",
                borderRadiusApplication: "end",
                dataLabels: {
                    position: "center",
                },
            },
        },
        dataLabels: {
            enabled: true,
            textAnchor: "middle",
            formatter: function (val, opt) {
                return opt.w.globals.labels[opt.dataPointIndex];
            },
            style: {
                fontSize: "13px",
                fontWeight: 700,
                colors: ["#fff"],
            },
        },
        xaxis: {
            min: 0,
            labels: {
                style: { fontSize: "11px", colors: "#637381" },
                formatter: (val) => `${val}%`,
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
            categories: chartData.categories,
        },
        yaxis: {
            labels: {
                offsetX: -12,
                style: { fontSize: "12px", colors: "#637381", fontWeight: 600 },
                formatter: (val, opt) => {
                    return chartData.ranks[opt.dataPointIndex];
                },
            },
        },
        tooltip: {
            y: {
                formatter: (val) => `${val}%`,
            },
        },
        legend: {
            show: false,
        },
        grid: {
            strokeDashArray: 3,
            borderColor: "rgba(0, 0, 0, 0.08)",
            yaxis: { lines: { show: false } },
            xaxis: { lines: { show: true } },
            padding: {
                top: 15,
                right: 15,
                bottom: 10,
                left: 20,
            },
        },
    }), [chartData]);

    const quickActionPath = tab === 0 ? "/admin/course/category" : "/admin/course/topic";
    const quickActionLabel = tab === 0 ? "View Categories" : "View Topics";

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
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, flexWrap: "wrap", gap: 1.5 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
                        Top Categories &amp; Topics
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                        Top {top6.length} {tab === 0 ? "categories" : "topics"} comparison
                    </Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <Select
                        value={metric}
                        onChange={(e) => setMetric(e.target.value)}
                        sx={{
                            fontSize: "0.75rem",
                            borderRadius: "8px",
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.08)" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                        }}
                    >
                        {METRICS.map((m) => (
                            <MenuItem key={m.value} value={m.value} sx={{ fontSize: "0.75rem" }}>
                                {m.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                    mb: 2,
                    minHeight: 36,
                    "& .MuiTabs-root": { minHeight: 36 },
                    "& .MuiTab-root": { minHeight: 36, py: 0.5, fontSize: "0.8rem", fontWeight: 600 },
                    "& .MuiTabs-indicator": { bgcolor: "brand.main" },
                }}
            >
                <Tab label="Categories Comparison" />
                <Tab label="Topics Comparison" />
            </Tabs>

            {/* Content: Chart + Custom Legend Grid */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 4, alignItems: "center" }}>
                {/* Chart Box */}
                <Box sx={{ flex: 1.2, width: "100%", minHeight: 340 }}>
                    {isLoading ? (
                        <Skeleton variant="rounded" width="100%" height={340} />
                    ) : top6.length === 0 ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                            <Typography sx={{ color: "text.disabled", fontSize: "0.85rem" }}>
                                No data available
                            </Typography>
                        </Box>
                    ) : (
                        <Chart
                            type="bar"
                            series={chartData.series}
                            options={chartOptions}
                            sx={{ height: 340 }}
                        />
                    )}
                </Box>

                {/* Custom Legend Box */}
                {!isLoading && top6.length > 0 && (
                    <Box
                        sx={{
                            flex: 0.8,
                            width: "100%",
                            display: "flex",
                            gap: 4,
                        }}
                    >
                        {/* Column 1 */}
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
                            {top6.slice(0, 3).map((item, index) => {
                                const color = COLORS_MAP[index] ?? "#637381";
                                return (
                                    <Box key={item.id || index} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                bgcolor: color,
                                                mt: 0.8,
                                                flexShrink: 0,
                                            }}
                                        />
                                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                                            <Typography
                                                sx={{
                                                    fontSize: "0.875rem",
                                                    fontWeight: 500,
                                                    color: "text.secondary",
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: "1.25rem",
                                                    fontWeight: 700,
                                                    color: "text.primary",
                                                    mt: 0.5,
                                                    lineHeight: 1.1,
                                                }}
                                            >
                                                {item.percentage}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Column 2 */}
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
                            {top6.slice(3, 6).map((item, index) => {
                                const actualIndex = index + 3;
                                const color = COLORS_MAP[actualIndex] ?? "#637381";
                                return (
                                    <Box key={item.id || actualIndex} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                bgcolor: color,
                                                mt: 0.8,
                                                flexShrink: 0,
                                            }}
                                        />
                                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                                            <Typography
                                                sx={{
                                                    fontSize: "0.875rem",
                                                    fontWeight: 500,
                                                    color: "text.secondary",
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: "1.25rem",
                                                    fontWeight: 700,
                                                    color: "text.primary",
                                                    mt: 0.5,
                                                    lineHeight: 1.1,
                                                }}
                                            >
                                                {item.percentage}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Quick action */}
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    size="small"
                    endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />}
                    onClick={() => navigate(quickActionPath)}
                    sx={{ color: "brand.main", fontSize: "0.78rem", fontWeight: 600, "&:hover": { bgcolor: "background.muted" } }}
                >
                    {quickActionLabel}
                </Button>
            </Box>
        </Box>
    );
}

export default memo(EnrollmentDistribution);
