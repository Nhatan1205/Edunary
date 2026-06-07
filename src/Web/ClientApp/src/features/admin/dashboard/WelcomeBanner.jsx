import { Box, Typography } from "@mui/material";
import adminDashboardImg from "../../../assets/images/admin-dashboard.png";

export default function WelcomeBanner({ summaryData, isLoading, userName }) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const hour = now.getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    const pendingTotal = summaryData?.pendingActionsTotal ?? 0;

    return (
        <Box
            sx={{
                borderRadius: "20px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #004B50 0%, #007867 40%, #00A76F 100%)",
                boxShadow: "0 8px 32px rgba(0, 167, 111, 0.15)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                p: { xs: 3, md: "24px 40px" },
                position: "relative",
                height: "100%",
                minHeight: 240,
            }}
        >
            {/* Decorative circles */}
            <Box sx={{
                position: "absolute", right: -40, top: -60,
                width: 220, height: 220, borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.06)", pointerEvents: "none",
            }} />
            <Box sx={{
                position: "absolute", right: 60, bottom: -80,
                width: 180, height: 180, borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.04)", pointerEvents: "none",
            }} />

            {/* Inner Wrapper */}
            <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", zIndex: 1, gap: 3 }}>
                {/* Left Text Block */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontWeight: 500 }}>
                        {dateStr}
                    </Typography>
                    <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.3 }}>
                        {greeting},<br />
                        {userName || "Admin"}!
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.92rem", lineHeight: 1.5, mt: 0.5, whiteSpace: "pre-line" }}>
                        {pendingTotal > 0
                            ? `Here's what's happening on Edunary today. You have ${pendingTotal} item${pendingTotal > 1 ? "s" : ""} that need${pendingTotal === 1 ? "s" : ""} your attention.`
                            : "Here's what's happening on Edunary today.\nEverything looks good! 🎉"}
                    </Typography>
                </Box>

                {/* Right Image Block */}
                <Box
                    component="img"
                    src={adminDashboardImg}
                    alt="Admin Dashboard Illustration"
                    sx={{
                        width: { xs: "none", md: "230px", lg: "330px" },
                        height: "auto",
                        maxHeight: "220px",
                        objectFit: "contain",
                        display: { xs: "none", md: "block" },
                        flexShrink: 0,
                    }}
                />
            </Box>
        </Box>
    );
}
