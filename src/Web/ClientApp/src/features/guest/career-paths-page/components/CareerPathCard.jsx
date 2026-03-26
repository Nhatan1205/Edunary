import { Box, Typography, Chip, Divider, Avatar } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

function CareerPathCard({ path }) {
    return (
        <Box
            sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "16px",
                padding: "28px 32px",
                marginBottom: "20px",
                transition: "box-shadow 0.2s, transform 0.2s",
                "&:hover": {
                    boxShadow: "0 8px 32px rgba(63,204,178,0.13)",
                    transform: "translateY(-2px)",
                },
            }}
        >
            {/* Topic chip */}
            <Chip
                label={path.topic}
                size="small"
                sx={{
                    bgcolor: "background.muted",
                    color: "brand.darker",
                    fontWeight: 600,
                    fontSize: 12,
                    mb: 1.5,
                }}
            />

            {/* Title */}
            <Typography
                variant="h3"
                sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    mb: 1.25,
                }}
            >
                {path.title}
            </Typography>

            {/* Description */}
            <Typography
                variant="body1"
                sx={{
                    color: "text.tertiary",
                    mb: 2.25,
                    maxWidth: 620,
                    lineHeight: 1.65,
                }}
            >
                {path.description}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Footer: avatar + units */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* Avatar + creator */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Avatar
                        src={path.creatorAvatar}
                        alt={path.creatorName}
                        sx={{
                            width: 36,
                            height: 36,
                            border: "2px solid",
                            borderColor: "brand.light",
                        }}
                    />
                    <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontSize: 13 }}
                    >
                        Created by{" "}
                        <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                            {path.creatorName}
                        </Box>
                    </Typography>
                </Box>

                {/* Units */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        color: "text.tertiary",
                        fontSize: 13,
                        fontWeight: 500,
                    }}
                >
                    <SchoolIcon sx={{ fontSize: 17, color: "brand.main" }} />
                    <span>{path.units} units</span>
                </Box>
            </Box>
        </Box>
    );
}

export default CareerPathCard;