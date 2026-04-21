import { Box, Typography, Card, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import defaultAvatar from "../../../../../assets/images/avatar.jpg";

function UserRow({ user, rank }) {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1.5,
                px: 1,
            }}
        >
            {/* Rank */}
            <Typography
                sx={{
                    width: 24,
                    textAlign: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: rank <= 3 ? "brand.main" : "text.secondary",
                }}
            >
                {rank}
            </Typography>

            {/* Avatar */}
            <Avatar
                src={user.avatar || defaultAvatar}
                alt={user.fullName}
                sx={{ width: 36, height: 36 }}
            />

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    onClick={() => navigate(`/admin/user/${user.id}`)}
                    sx={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "text.primary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        "&:hover": {
                            color: "brand.main",
                            textDecoration: "underline",
                        },
                    }}
                >
                    {user.fullName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.2 }}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.3 }}>
                        <SchoolIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                        <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                            {user.enrolledCount} courses
                        </Typography>
                    </Box>
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.3 }}>
                        <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                        <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                            {user.lastLogin}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

function TopActiveUsers({ users, isLoading }) {
    return (
        <Card
            sx={{
                borderRadius: "18px",
                bgcolor: "#FFFFFF",
                boxShadow: "0px 2px 12px rgba(16,24,40,0.07)",
                border: "1px solid #F3F4F6",
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary", mb: 0.5 }}>
                Top Active Users
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 2 }}>
                Users with most enrolled courses
            </Typography>

            <Box sx={{ flex: 1 }}>
                {(users ?? []).map((user, idx) => (
                    <UserRow key={user.id} user={user} rank={idx + 1} />
                ))}

                {(!users || users.length === 0) && !isLoading && (
                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", textAlign: "center", py: 4 }}>
                        No data available
                    </Typography>
                )}
            </Box>
        </Card>
    );
}

export default TopActiveUsers;
