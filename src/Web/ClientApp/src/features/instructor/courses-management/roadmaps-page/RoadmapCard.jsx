import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PublicIcon from "@mui/icons-material/Public";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import { Box, Button, Typography } from "@mui/material";
import ConfirmDialog from "../../../../components/ConfirmDialogPopup/ConfirmDialog";
import useDeleteRoadmap from "../../../../hooks/roadmap-hooks/useDeleteRoadmap";

function RoadmapCard({ roadmap }) {
    const navigate = useNavigate();
    const isPrivate = roadmap.visibility === "Private";
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const deleteRoadmapMutation = useDeleteRoadmap();

    const handleConfirmDelete = () => {
        setDeleteDialogOpen(false);
        deleteRoadmapMutation.mutate(roadmap.id);
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2.5,
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: "none" },
                }}
            >
                {/* Left: title + meta */}
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary" mb={0.75}>
                        {roadmap.title}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        {/* Visibility chip */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {isPrivate ? (
                                <LockOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                            ) : (
                                <PublicIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                            )}
                            <Typography variant="body2" color="text.secondary">
                                {roadmap.visibility}
                            </Typography>
                        </Box>

                        <Typography variant="body2" color="text.disabled">·</Typography>

                        {/* Topic count */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <AccountTreeOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                            <Typography variant="body2" color="text.secondary">
                                {roadmap.topicCount} topics
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Right: action buttons */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />}
                        onClick={() => navigate(`/instructor/roadmaps/${roadmap.id}/edit`)}
                        sx={{
                            textTransform: "none",
                            borderColor: "divider",
                            color: "text.primary",
                            lineHeight: 1,
                            py: "10px",
                            px: "14px",
                            "& .MuiButton-startIcon": { marginRight: "6px", display: "flex", alignItems: "center" },
                            "&:hover": {
                                borderColor: "divider",
                                bgcolor: "action.hover",
                            },
                        }}
                    >
                        Edit
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<DeleteOutlineIcon sx={{ fontSize: 18 }} />}
                        onClick={() => setDeleteDialogOpen(true)}
                        sx={{
                            textTransform: "none",
                            borderColor: "divider",
                            color: "error.main",
                            lineHeight: 1,
                            py: "10px",
                            px: "14px",
                            "& .MuiButton-startIcon": { marginRight: "6px", display: "flex", alignItems: "center" },
                            "&:hover": {
                                borderColor: "error.main",
                                bgcolor: "error.main",
                                color: "#fff",
                            },
                        }}
                    >
                        Delete
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            textTransform: "none",
                            borderColor: "brand.dark",
                            color: "brand.dark",
                            lineHeight: 1,
                            py: "10px",
                            px: "14px",
                            "& .MuiButton-startIcon": { marginRight: "6px", display: "flex", alignItems: "center" },
                            "&:hover": { bgcolor: "brand.dark", borderColor: "brand.dark", color: "#fff" },
                        }}
                    >
                        Visit
                    </Button>
                </Box>
            </Box>

            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Roadmap"
                message="Are you sure you want to remove this roadmap?"
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

export default RoadmapCard;