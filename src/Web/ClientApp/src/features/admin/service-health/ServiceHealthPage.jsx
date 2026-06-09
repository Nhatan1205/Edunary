import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    Skeleton,
    Tooltip,
    Typography,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { Col, Row } from "reactstrap";

import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import PageTitle from "../../../components/PageTitle";
import useGetServiceHealth from "../../../hooks/service-health-hooks/useGetServiceHealth";

// ─── Status chip ──────────────────────────────────────────────────────────────

const STATUS_CFG = {
    Healthy: { label: "Up", color: "success.darker", bgcolor: "success.lighter" },
    Degraded: { label: "Degraded", color: "warning.dark", bgcolor: "warning.lighter" },
    Unhealthy: { label: "Down", color: "error.dark", bgcolor: "error.lighter" },
};

function ServiceStatusChip({ status }) {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG.Unhealthy;
    return (
        <Chip
            label={cfg.label}
            size="small"
            sx={{
                height: 24,
                fontSize: "0.72rem",
                fontWeight: 700,
                borderRadius: "6px",
                color: cfg.color,
                bgcolor: cfg.bgcolor,
                border: "none",
            }}
        />
    );
}

// ─── Per-service icon map ─────────────────────────────────────────────────────

const SERVICE_ICON = {
    "Database": "🗄️",
    "Redis": "⚡",
    "Chatbot (AI Center)": "🤖",
    "DigitalOcean Spaces": "☁️",
    "Cloudinary": "🌤️",
    "Stripe": "💳",
    "Email (SMTP)": "📧",
};

// ─── Single service card ──────────────────────────────────────────────────────

function ServiceCard({ service }) {
    const icon = SERVICE_ICON[service.name] ?? "🔧";
    return (
        <Card
            sx={{
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                height: "100%",
            }}
        >
            <CardContent sx={{ p: 3 }}>
                {/* Header: name + status badge */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1.5,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography fontSize="1.4rem" lineHeight={1}>
                            {icon}
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="text.primary">
                            {service.name}
                        </Typography>
                    </Box>
                    <ServiceStatusChip status={service.status} />
                </Box>

                {/* Latency */}
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                    {service.durationMs != null ? `${service.durationMs.toFixed(1)} ms` : "—"}
                </Typography>

                {/* Description */}
                {service.description && (
                    <Typography variant="caption" color="text.secondary" display="block">
                        {service.description}
                    </Typography>
                )}

                {/* Error */}
                {service.error && (
                    <Typography
                        variant="caption"
                        color="error.main"
                        display="block"
                        sx={{ mt: 0.5, wordBreak: "break-word" }}
                    >
                        {service.error}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Skeleton placeholder ─────────────────────────────────────────────────────

function ServiceCardSkeleton() {
    return (
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E7EB" }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Skeleton variant="text" width={160} height={28} />
                    <Skeleton variant="rounded" width={52} height={24} />
                </Box>
                <Skeleton variant="text" width={80} />
                <Skeleton variant="text" width={220} />
            </CardContent>
        </Card>
    );
}

// ─── Overall status banner config ─────────────────────────────────────────────

const OVERALL_BANNER = {
    Healthy: { severity: "success", message: "All services are operational" },
    Degraded: { severity: "warning", message: "One or more services are degraded" },
    Unhealthy: { severity: "error", message: "One or more services are down" },
};

// ─── Main page ────────────────────────────────────────────────────────────────

function ServiceHealthPage() {
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const { data, isLoading, isFetching, refetch } = useGetServiceHealth();

    // Update "last checked" timestamp whenever fresh data arrives
    useEffect(() => {
        if (data) setLastRefreshed(new Date());
    }, [data]);

    const banner = OVERALL_BANNER[data?.overallStatus] ?? OVERALL_BANNER.Healthy;

    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
            <PageTitle title="Service Status" />
            <CustomBreadcrumbs />

            {/* Section header + refresh controls */}
            <Box
                sx={{
                    mt: 4,
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h5" fontWeight={700}>
                    Platform Services
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {lastRefreshed && (
                        <Typography variant="caption" color="text.secondary">
                            Last checked: {lastRefreshed.toLocaleTimeString()}
                        </Typography>
                    )}
                    <Tooltip title="Refresh now">
                        {/* span wrapper keeps Tooltip happy when button is disabled */}
                        <span>
                            <IconButton
                                onClick={() => refetch()}
                                disabled={isFetching}
                                size="small"
                                sx={{ color: "text.secondary" }}
                            >
                                {isFetching && !isLoading ? (
                                    <CircularProgress size={18} color="inherit" />
                                ) : (
                                    <RefreshOutlinedIcon fontSize="small" />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </Box>

            {/* Overall status alert */}
            {!isLoading && data && (
                <Alert severity={banner.severity} sx={{ mb: 3, borderRadius: "12px" }}>
                    {banner.message}
                </Alert>
            )}

            {/* Service cards */}
            <Row>
                {isLoading
                    ? Array.from({ length: 7 }).map((_, i) => (
                          <Col key={i} xs={12} sm={6} lg={4} className="mb-3">
                              <ServiceCardSkeleton />
                          </Col>
                      ))
                    : data?.services?.map((service) => (
                          <Col key={service.name} xs={12} sm={6} lg={4} className="mb-3">
                              <ServiceCard service={service} />
                          </Col>
                      ))}
            </Row>

            <Box sx={{ height: 80 }} />
        </Box>
    );
}

export default ServiceHealthPage;
