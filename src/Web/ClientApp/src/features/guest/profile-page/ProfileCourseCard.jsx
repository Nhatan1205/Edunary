import { Star } from "@mui/icons-material";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
} from "@mui/material";
import { getLevelLabel } from "../../../utils/helpers";
import MetaChip from "../../../components/MetaChip";
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

export default function ProfileCourseCard({ course }) {
    return (
        <Card
            sx={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid #d1d7dc",
                borderRadius: "8px",
                boxShadow: "none",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                padding: 2,
                height: "100%",
                "&:hover": {
                    backgroundColor: "#f7f9fa",
                },
            }}
        >
            {/* 1. Image Area relative for Absolute Bestseller Badge */}
            <Box sx={{ position: "relative", mb: 2 }}>
                <CardMedia
                    component="img"
                    height="160"
                    image={course.imageUrl}
                    alt={course.title}
                    sx={{ objectFit: "cover", borderRadius: "8px" }}
                />
            </Box>

            {/* 2. Content */}
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

                <Typography
                    variant="body2"
                    sx={{
                        color: "#6a6f73",
                        fontSize: "14px",
                        mb: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {course.subtitle}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: "#6a6f73",
                        fontSize: "12px",
                        mb: 1.5,
                    }}
                >
                    {course.instructorName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
                    <MetaChip
                        label={"Bestseller"}
                        backgroundColor={"#eceb98"}
                        color={"#3d3c0a"}
                        borderColor={"#eceb98"}
                    />
                    <MetaChip
                        icon={<Star sx={{ color: '#b4690e !important  ' }} />}
                        label={"4.5"}
                    />
                    <MetaChip
                        icon={<PeopleAltOutlinedIcon />}
                        label={"45"}
                    />
                    <MetaChip
                        label={getLevelLabel(1)}
                    />
                </Box>

                {/* Price */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            fontSize: "16px",
                            color: "text.primary",
                        }}
                    >
                        $ {course.price}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
