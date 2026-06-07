import { memo } from "react";
import { Box, Typography, Skeleton, Button, Tooltip } from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { useNavigate } from "react-router-dom";

const GAUGES = [
    {
        key: "completion",
        label: "Course Completion",
        valueKey: "completionRate",
        unit: "%",
        goodThreshold: 40,
        description: "% of enrolled students with recorded progress",
        color: { good: "brand.main", warn: "warning.main", bad: "error.main" },
    },
    {
        key: "rating",
        label: "Avg Platform Rating",
        valueKey: "averageRating",
        max: 5,
        unit: "/5",
        goodThreshold: 4.0,
        warnThreshold: 3.0,
        description: "Average student rating across all courses",
        color: { good: "secondaryBrand.main", warn: "warning.main", bad: "error.main" },
    },
    {
        key: "activeEnroll",
        label: "Active Enrollments",
        valueKey: "activeEnrollmentRate",
        unit: "%",
        goodThreshold: 50,
        description: "% of enrollments active in last 30 days",
        color: { good: "info.main", warn: "warning.main", bad: "error.main" },
    },
];

function getStatusColor(gauge, value) {
    const v = parseFloat(value) || 0;
    if (gauge.key === "rating") {
        if (v >= gauge.goodThreshold) return gauge.color.good;
        if (v >= (gauge.warnThreshold ?? 0)) return gauge.color.warn;
        return gauge.color.bad;
    }
    if (v >= gauge.goodThreshold) return gauge.color.good;
    if (v >= gauge.goodThreshold * 0.65) return gauge.color.warn;
    return gauge.color.bad;
}

function GaugeItem({ gauge, value, isLoading }) {
    const numValue = parseFloat(value) || 0;
    const max = gauge.max ?? 100;
    const pct = Math.min((numValue / max) * 100, 100);
    const color = getStatusColor(gauge, numValue);
    const displayValue = gauge.key === "rating" ? numValue.toFixed(1) : `${numValue.toFixed(1)}${gauge.unit}`;

    return (
        <Tooltip title={gauge.description} placement="top" arrow>
            <Box
                sx={{
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: "background.alt",
                    border: "1px solid rgba(0,0,0,0.02)",
                    transition: "all 0.2s ease",
                    cursor: "default",
                    "&:hover": { bgcolor: "background.muted" },
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 1.25 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "text.secondary" }}>
                        {gauge.label}
                    </Typography>
                    {isLoading ? (
                        <Skeleton variant="text" width={50} />
                    ) : (
                        <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color }}>
                            {displayValue}
                        </Typography>
                    )}
                </Box>

                {/* Progress bar */}
                <Box sx={{ height: 6, bgcolor: "grey.200", borderRadius: 3, overflow: "hidden" }}>
                    {isLoading ? (
                        <Skeleton variant="rounded" width="100%" height={6} sx={{ transform: "none" }} />
                    ) : (
                        <Box
                            sx={{
                                height: "100%",
                                width: `${pct}%`,
                                bgcolor: color,
                                borderRadius: 3,
                                transition: "width 0.8s ease",
                            }}
                        />
                    )}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.75 }}>
                    <Typography sx={{ fontSize: "0.68rem", color: "text.disabled", fontWeight: 600 }}>0</Typography>
                    <Typography sx={{ fontSize: "0.68rem", color: "text.disabled", fontWeight: 600 }}>
                        {gauge.max ? `${gauge.max}${gauge.unit}` : "100%"}
                    </Typography>
                </Box>
            </Box>
        </Tooltip>
    );
}

function PlatformHealthGauges({ data, isLoading }) {
    const navigate = useNavigate();

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
                    Platform Health
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                    Key quality indicators
                </Typography>
            </Box>

            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                {GAUGES.map((gauge) => (
                    <GaugeItem
                        key={gauge.key}
                        gauge={gauge}
                        value={data?.[gauge.valueKey] ?? 0}
                        isLoading={isLoading}
                    />
                ))}
            </Box>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    size="small"
                    endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />}
                    onClick={() => navigate("/admin/user/overview")}
                    sx={{ color: "brand.main", fontSize: "0.78rem", fontWeight: 600, "&:hover": { bgcolor: "background.muted" } }}
                >
                    View Users
                </Button>
            </Box>
        </Box>
    );
}

export default memo(PlatformHealthGauges);
