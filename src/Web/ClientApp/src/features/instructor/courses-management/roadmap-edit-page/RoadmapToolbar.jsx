import React, { useState } from "react";
import { Box, Typography, Button, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SaveIcon from "@mui/icons-material/SaveAlt";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";

const TOOLBAR_H = 64;

export default function RoadmapToolbar({ onToggleCourses, onEditMetadata }) {
    const [isPublic, setIsPublic] = useState(false);

    const dividerSx = {
        width: "1px",
        alignSelf: "stretch",
        bgcolor: "divider",
    };

    const actionBtnBase = {
        height: TOOLBAR_H,
        borderRadius: 0,
        textTransform: "none",
        fontWeight: 500,
        fontSize: "0.875rem",
        px: 2.5,
        whiteSpace: "nowrap",
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "stretch",
                justifyContent: "space-between",
                bgcolor: "background.paper",
                borderBottom: "1px solid",
                borderColor: "divider",
                height: TOOLBAR_H,
                overflow: "hidden",
            }}
        >
            {/* ── Left: Close + Title ── */}
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
                {/* Close button */}
                <Button
                    sx={{
                        ...actionBtnBase,
                        px: 2,
                        minWidth: 0,
                        color: "text.secondary",
                        "&:hover": { bgcolor: "background.muted" },
                        borderRight: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <CloseIcon sx={{ fontSize: "1.2rem" }} />
                </Button>

                {/* Title & Subtitle */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 2,
                    }}
                >
                    <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: "1.05rem",
                                    color: "text.primary",
                                    lineHeight: 1.3,
                                }}
                            >
                                Full-Stack Roadmap
                            </Typography>
                            <Tooltip title="Edit roadmap info">
                                <IconButton size="small" onClick={onEditMetadata} sx={{ color: "text.disabled", p: 0.4 }}>
                                    <EditIcon sx={{ fontSize: "0.95rem" }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.tertiary",
                                fontSize: "0.78rem",
                                lineHeight: 1.3,
                            }}
                        >
                            Learn Full-Stack from beginning to advanced
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* ── Right: Action button group ── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "stretch",
                    height: TOOLBAR_H,
                    borderLeft: "1px solid",
                    borderColor: "divider",
                }}
            >
                {/* 1. Add Your Course */}
                <Button
                    startIcon={<AddIcon />}
                    onClick={onToggleCourses}
                    sx={{
                        ...actionBtnBase,
                        color: "brand.main",
                        "&:hover": { bgcolor: "brand.lighter" },
                    }}
                >
                    Add Your Course
                </Button>

                <Box sx={dividerSx} />

                {/* 2. Public / Private toggle */}
                <Button
                    startIcon={isPublic ? <PublicIcon /> : <LockIcon />}
                    endIcon={<KeyboardArrowDownIcon />}
                    onClick={() => setIsPublic((p) => !p)}
                    sx={{
                        ...actionBtnBase,
                        color: "text.secondary",
                        "&:hover": { bgcolor: "background.muted" },
                    }}
                >
                    {isPublic ? "Public" : "Only visible to me"}
                </Button>

                <Box sx={dividerSx} />

                {/* 3. Live View */}
                <Button
                    startIcon={<VisibilityIcon sx={{ fontSize: "1.1rem" }} />}
                    sx={{
                        ...actionBtnBase,
                        color: "text.secondary",
                        "&:hover": { bgcolor: "background.muted" },
                    }}
                >
                    Live View
                </Button>

                {/* 4. Save Roadmap */}
                <Button
                    startIcon={<SaveIcon />}
                    sx={{
                        ...actionBtnBase,
                        bgcolor: "brand.main",
                        color: "text.inverse",
                        px: 3,
                        fontWeight: 600,
                        "&:hover": { bgcolor: "brand.dark" },
                    }}
                >
                    Save Roadmap
                </Button>
            </Box>
        </Box>
    );
}
