import { memo, useMemo } from "react";
import { Box, Typography, Button, Skeleton } from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { useNavigate } from "react-router-dom";
import Chart from "../../../components/charts/Chart";

const STATUS_MAP = [
    { key: "courseStatusPublished",    label: "Published",      color: "#00A76F" },
    { key: "courseStatusPrivate",      label: "Private",        color: "#1890FF" },
    { key: "courseStatusDraft",        label: "Draft",          color: "#919EAB" },
    { key: "courseStatusPendingReview", label: "Pending Review", color: "#FFC107" },
    { key: "courseStatusNeedsChanges", label: "Needs Changes",  color: "#FF3B3B" },
];

function CourseStatusDonut({ data, isLoading }) {
    const navigate = useNavigate();

    const series = useMemo(
        () => STATUS_MAP.map((s) => data?.[s.key] ?? 0),
        [data]
    );

    const chartOptions = useMemo(() => ({
        chart: {
            type: "donut",
            fontFamily: "Public Sans Variable, Roboto, sans-serif",
            toolbar: { show: false },
        },
        labels: STATUS_MAP.map((s) => s.label),
        colors: STATUS_MAP.map((s) => s.color),
        stroke: { width: 0 },
        plotOptions: {
            pie: {
                donut: {
                    size: "68%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total",
                            color: "#637381",
                            fontSize: "12px",
                            formatter: (w) =>
                                w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString(),
                        },
                    },
                },
            },
        },
        legend: {
            position: "bottom",
            fontSize: "12px",
            markers: { width: 10, height: 10, radius: 3 },
            formatter: (label, opts) =>
                `${label}: ${opts.w.globals.series[opts.seriesIndex].toLocaleString()}`,
        },
        tooltip: {
            y: { formatter: (v) => `${v.toLocaleString()} courses` },
        },
    }), []);

    const totalCourses = series.reduce((a, b) => a + b, 0);

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
            <Box sx={{ mb: 2.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
                    Course Status
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                    Distribution across {totalCourses.toLocaleString()} courses
                </Typography>
            </Box>

            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 230 }}>
                {isLoading ? (
                    <Skeleton variant="circular" width={180} height={180} />
                ) : totalCourses === 0 ? (
                    <Typography sx={{ color: "text.disabled", fontSize: "0.85rem" }}>
                        No courses yet
                    </Typography>
                ) : (
                    <Chart
                        type="donut"
                        series={series}
                        options={chartOptions}
                        sx={{ height: 250 }}
                    />
                )}
            </Box>

            <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    size="small"
                    endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />}
                    onClick={() => navigate("/admin/course/list")}
                    sx={{ color: "brand.main", fontSize: "0.78rem", fontWeight: 600, "&:hover": { bgcolor: "background.muted" } }}
                >
                    View All Courses
                </Button>
            </Box>
        </Box>
    );
}

export default memo(CourseStatusDonut);
