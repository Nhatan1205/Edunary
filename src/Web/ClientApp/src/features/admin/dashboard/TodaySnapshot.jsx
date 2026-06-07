import { Box, Typography, Skeleton } from "@mui/material";
import WifiIcon from "@mui/icons-material/Wifi";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

function SnapshotItem({ icon: Icon, label, value, color, isLoading }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box
                sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    bgcolor: "rgba(255, 255, 255, 0.08)",
                    color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon sx={{ fontSize: 24 }} />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: "rgba(255,255,255,0.65)",
                        display: "block",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        lineHeight: 1.1,
                    }}
                >
                    {label}
                </Typography>
                {isLoading ? (
                    <Skeleton variant="text" width={60} height={32} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
                ) : (
                    <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.65rem", lineHeight: 1.1 }}>
                        {value}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default function TodaySnapshot({ summaryData, isLoading }) {
    const pendingTotal = summaryData?.pendingActionsTotal ?? 0;
    const onlineNow = summaryData?.onlineNow ?? 0;
    const revenueToday = summaryData?.revenueToday ?? 0;

    const revenueTodayFmt = `$${Number(revenueToday).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    return (
        <Box
            sx={{
                borderRadius: "20px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #004B50 0%, #007867 40%, #00A76F 100%)",
                boxShadow: "0 8px 32px rgba(0, 167, 111, 0.15)",
                p: { xs: 4, md: "40px" },
                display: "flex",
                flexDirection: "column",
                gap: 3,
                height: "100%",
                minHeight: 240,
                justifyContent: "center",
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontSize: "0.75rem",
                    mb: 0.5,
                }}
            >
                Today&apos;s Snapshot
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <SnapshotItem icon={WifiIcon} label="Online Now" value={onlineNow.toLocaleString()} color="#5BE49B" isLoading={isLoading} />
                <SnapshotItem icon={NotificationsActiveOutlinedIcon} label="Pending Actions" value={pendingTotal.toLocaleString()} color={pendingTotal > 0 ? "#FFE16A" : "#5BE49B"} isLoading={isLoading} />
                <SnapshotItem icon={AttachMoneyIcon} label="Revenue Today" value={revenueTodayFmt} color="#74CAFF" isLoading={isLoading} />
            </Box>
        </Box>
    );
}
