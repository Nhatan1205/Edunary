import { memo } from "react";
import { Box, Typography, Skeleton } from "@mui/material";

const CARDS = [
    {
        key: "users",
        label: "Total active users",
        valueKey: "totalUsers",
        trendKey: "totalUsersTrend",
        color: "#00A76F", // clean green
        fmt: (v) => Number(v).toLocaleString(),
    },
    {
        key: "courses",
        label: "Total courses",
        valueKey: "totalCourses",
        trendKey: "totalCoursesTrend",
        color: "#1890FF", // clean blue
        fmt: (v) => Number(v).toLocaleString(),
    },
    {
        key: "revenue",
        label: "Total revenue",
        valueKey: "totalRevenue",
        trendKey: "totalRevenueTrend",
        color: "#FF5630", // clean red/orange
        fmt: (v) => `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    },
];

function MiniSparkline({ color, isUp }) {
    const data = isUp
        ? [30, 45, 35, 60, 49, 70, 50, 90]
        : [90, 70, 60, 65, 50, 40, 35, 20];

    return (
        <svg width="60" height="36" viewBox="0 0 60 36">
            {data.map((val, i) => {
                const width = 4;
                const gap = 3;
                const x = i * (width + gap);
                const height = (val / 100) * 36;
                const y = 36 - height;
                return (
                    <rect
                        key={i}
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        rx={1.5}
                        fill={color}
                    />
                );
            })}
        </svg>
    );
}

function KpiCard({ card, data, isLoading }) {
    const value = data?.[card.valueKey] ?? 0;
    const trend = data?.[card.trendKey] ?? 0;
    const isUp = trend >= 0;

    return (
        <Box
            sx={{
                bgcolor: "background.paper",
                borderRadius: "16px",
                p: "28px 24px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: 200,
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: "text.secondary",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                    }}
                >
                    {card.label}
                </Typography>
                {isLoading ? (
                    <Skeleton variant="text" width={100} height={36} />
                ) : (
                    <Typography
                        sx={{
                            fontSize: "1.85rem",
                            fontWeight: 700,
                            color: "text.primary",
                            lineHeight: 1.2,
                            fontFamily: "Public Sans Variable, Roboto, sans-serif",
                        }}
                    >
                        {card.fmt(value)}
                    </Typography>
                )}
                {isLoading ? (
                    <Skeleton variant="text" width={120} height={16} />
                ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                        <Box
                            component="span"
                            sx={{
                                color: isUp ? "success.main" : "error.main",
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.25,
                            }}
                        >
                            {isUp ? "▲" : "▼"} {isUp ? "+" : ""}{trend.toFixed(1)}%
                        </Box>
                        <Typography
                            variant="caption"
                            sx={{
                                color: "text.secondary",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                            }}
                        >
                            vs last 30 days
                        </Typography>
                    </Box>
                )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", pl: 2 }}>
                {isLoading ? (
                    <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: "4px" }} />
                ) : (
                    <MiniSparkline color={card.color} isUp={isUp} />
                )}
            </Box>
        </Box>
    );
}

function DashboardKpiCards({ data, isLoading }) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 3,
            }}
        >
            {CARDS.map((card) => (
                <KpiCard key={card.key} card={card} data={data} isLoading={isLoading} />
            ))}
        </Box>
    );
}

export default memo(DashboardKpiCards);
