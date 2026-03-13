import { Star } from "@mui/icons-material";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
} from "@mui/material";
import MetaChip from "../../../components/MetaChip";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import DefaultImage from "../../../assets/images/default.jpg";

export default function ProfileCourseCard({ course }) {
    return (
        <Card
            sx={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                boxShadow: "none",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                padding: 2,
                height: "100%",
                "&:hover": {
                    backgroundColor: "background.muted",
                },
            }}
        >
            {/* Image */}
            <Box sx={{ position: "relative", mb: 2 }}>
                <CardMedia
                    component="img"
                    height="160"
                    image={course.imageUrl || DefaultImage}
                    alt={course.title}
                    sx={{ objectFit: "cover", borderRadius: "8px" }}
                />
            </Box>

            {/* Content */}
            <CardContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    padding: "0 !important",
                }}
            >
                <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        mb: 1,
                        lineHeight: 1.4,
                        color: "text.primary",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        height: "2.8em",
                    }}
                >
                    {course.title}
                </Typography>

                {course.subtitle && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            fontSize: "14px",
                            mb: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {course.subtitle}
                    </Typography>
                )}

                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1, flexWrap: "wrap" }}>
                    {course.ratings > 0 && (
                        <MetaChip
                            icon={<Star sx={{ color: "#b4690e !important" }} />}
                            label={course.ratings.toFixed(1)}
                        />
                    )}
                    {course.totalStudents > 0 && (
                        <MetaChip
                            icon={<PeopleAltOutlinedIcon />}
                            label={course.totalStudents.toLocaleString()}
                        />
                    )}
                    {course.level && (
                        <MetaChip label={course.level} />
                    )}
                </Box>

                {/* Price */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: "auto" }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            fontSize: "16px",
                            color: "text.primary",
                        }}
                    >
                        {course.price === 0 ? "Free" : `$${course.price}`}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
