import React, { useState } from "react";
import { Box } from "@mui/material";
import { ReactFlowProvider } from "@xyflow/react";
import RoadmapToolbar from "./RoadmapToolbar";
import RoadmapCanvas from "./RoadmapCanvas";
import RoadmapCoursesSidebar from "./courses-sidebar/RoadmapCoursesSidebar";
import RoadmapMetadataDialog from "./roadmap-meta-dialog/RoadmapMetaDialog";

export default function RoadmapEditPage() {
    const [coursesSidebarOpen, setCoursesSidebarOpen] = useState(false);
    const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);

    // Replace defaultValues with API data later
    const handleMetadataClose = (data) => {
        if (data) {
            console.log("Saved metadata:", data);
            // TODO: call API to update roadmap metadata
        }
        setMetadataDialogOpen(false);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                width: "100%",
                overflow: "hidden",
            }}
        >
            <RoadmapToolbar
                onToggleCourses={() => setCoursesSidebarOpen((prev) => !prev)}
                onEditMetadata={() => setMetadataDialogOpen(true)}
            />

            {/* Canvas area — sidebar overlays inside here */}
            <Box sx={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <ReactFlowProvider>
                    <RoadmapCanvas />
                </ReactFlowProvider>

                <RoadmapCoursesSidebar
                    open={coursesSidebarOpen}
                    onClose={() => setCoursesSidebarOpen(false)}
                />
            </Box>

            {/* Roadmap Metadata Dialog */}
            <RoadmapMetadataDialog
                open={metadataDialogOpen}
                onClose={handleMetadataClose}
            />
        </Box>
    );
}
