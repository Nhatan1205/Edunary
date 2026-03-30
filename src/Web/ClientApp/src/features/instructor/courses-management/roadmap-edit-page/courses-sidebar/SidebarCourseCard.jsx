import { Box, Card, Typography } from "@mui/material";
import DefaultImage from "../../../../../assets/images/default.jpg";
import { useRoadmapEditor } from "../../../../../context/RoadmapEditorContext";

export default function SidebarCourseCard({ course, disabled }) {
    const { addCourseNode } = useRoadmapEditor();

    const handleDragStart = (event) => {
        if (disabled) {
            event.preventDefault();
            return;
        }
        event.dataTransfer.setData(
            "application/edunary-course",
            JSON.stringify(course)
        );
        event.dataTransfer.effectAllowed = "move";
    };

    const handleDoubleClick = () => {
        if (disabled) return;
        addCourseNode(course);
    };

    return (
        <Card
            variant="outlined"
            draggable={!disabled}
            onDragStart={handleDragStart}
            onDoubleClick={handleDoubleClick}
            sx={{
                cursor: disabled ? "default" : "grab",
                borderColor: disabled ? "divider" : "divider",
                borderRadius: 2,
                overflow: "hidden",
                opacity: disabled ? 0.45 : 1,
                transition: "box-shadow 0.2s, border-color 0.2s, opacity 0.2s",
                pointerEvents: disabled ? "none" : "auto",
                "&:hover": disabled
                    ? {}
                    : {
                          borderColor: "brand.main",
                          boxShadow: "0 2px 12px rgba(63,204,178,0.15)",
                      },
                "&:active": disabled
                    ? {}
                    : {
                          cursor: "grabbing",
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
                        color: disabled ? "text.disabled" : "text.primary",
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