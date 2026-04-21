import { Box, Typography } from "@mui/material";
import { Row, Col } from "reactstrap";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import imgActiveUsers from "../../../../../assets/images/card_active_users.png";
import imgNewUsers from "../../../../../assets/images/card_new_users.png";
import imgOnlineNow from "../../../../../assets/images/card_online_now.png";

const CARD_CONFIGS = [
    {
        key: "activeUsers",
        label: "Total Active Users",
        trendKey: "activeUsersTrend",
        trendLabel: "last 7 days",
        image: imgActiveUsers,
    },
    {
        key: "newUsers30d",
        label: "New Users",
        trendKey: "newUsersTrend",
        trendLabel: "vs prev 30d",
        image: imgNewUsers,
    },
    {
        key: "onlineNow",
        label: "Online Now",
        trendKey: null,
        image: imgOnlineNow,
    },
];

function TrendBadge({ value, label }) {
    if (value == null) return null;
    const isPositive = value >= 0;
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, mt: 1.5 }}>
            {isPositive ? (
                <TrendingUpIcon sx={{ fontSize: 15, color: "success.main" }} />
            ) : (
                <TrendingDownIcon sx={{ fontSize: 15, color: "error.main" }} />
            )}
            <Typography
                component="span"
                sx={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: isPositive ? "success.dark" : "error.dark",
                }}
            >
                {isPositive ? "+" : ""}{value}%
            </Typography>
            {label && (
                <Typography
                    component="span"
                    sx={{ fontSize: "0.72rem", color: "text.secondary", ml: 0.2 }}
                >
                    {label}
                </Typography>
            )}
        </Box>
    );
}

function LiveBadge() {
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 1.5 }}>
            <FiberManualRecordIcon
                sx={{
                    fontSize: 9,
                    color: "success.main",
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                        "0%": { opacity: 1 },
                        "50%": { opacity: 0.35 },
                        "100%": { opacity: 1 },
                    },
                }}
            />
            <Typography component="span" sx={{ fontSize: "0.78rem", fontWeight: 700, color: "success.dark" }}>
                Live
            </Typography>
        </Box>
    );
}

function StatCard({ config, value, trendValue }) {
    return (
        <Box
            sx={{
                bgcolor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #F3F4F6",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
                minHeight: 160,
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    p: "24px 16px 24px 24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <Typography
                    sx={{
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        color: "text.secondary",
                        letterSpacing: "0.01em",
                    }}
                >
                    {config.label}
                </Typography>

                <Box>
                    <Typography
                        sx={{
                            fontSize: "2.1rem",
                            fontWeight: 800,
                            color: "text.primary",
                            lineHeight: 1.1,
                        }}
                    >
                        {value?.toLocaleString() ?? "—"}
                    </Typography>
                    {config.trendKey ? (
                        <TrendBadge value={trendValue} label={config.trendLabel} />
                    ) : (
                        <LiveBadge />
                    )}
                </Box>
            </Box>

            {/* ── Right: circular image container ── */}
            <Box
                sx={{
                    width: "38%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                }}
            >
                <Box
                    sx={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        bgcolor: "grey.100",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                    }}
                >
                    <Box
                        component="img"
                        src={config.image}
                        alt={config.label}
                        sx={{
                            width: "110%",
                            height: "110%",
                            objectFit: "contain",
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}

function UserStatCards({ data }) {
    return (
        <Row className="g-3">
            {CARD_CONFIGS.map((cfg) => (
                <Col xs={12} sm={6} md={4} key={cfg.key}>
                    <StatCard
                        config={cfg}
                        value={data?.[cfg.key]}
                        trendValue={cfg.trendKey ? data?.[cfg.trendKey] : null}
                    />
                </Col>
            ))}
        </Row>
    );
}

export default UserStatCards;
