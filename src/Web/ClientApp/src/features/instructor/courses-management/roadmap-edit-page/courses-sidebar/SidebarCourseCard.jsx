import { Box, Card, Typography } from "@mui/material";
import DefaultImage from "../../../../../assets/images/default.jpg";

export default function SidebarCourseCard({ course }) {
    return (
        <Card
            variant="outlined"
            sx={{
                cursor: "grab",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
                transition: "box-shadow 0.2s, border-color 0.2s",
                "&:hover": {
                    borderColor: "brand.main",
                    boxShadow: "0 2px 12px rgba(63,204,178,0.15)",
                },
            }}
        >
            <Box
                component="img"
                src={course.imageUrl || DefaultImage}
                alt={course.title}
                sx={{
                    width: "100%",
                    height: 90,
                    objectFit: "cover",
                }}
            />
            <Box sx={{ px: 1.5, py: 1 }}>
                <Typography
                    sx={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "text.primary",
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {course.title}
                </Typography>
            </Box>
        </Card>
    );
}