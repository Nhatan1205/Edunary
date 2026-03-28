import React from "react";
import { Box } from "@mui/material";
import { ReactFlowProvider } from "@xyflow/react";
import { RoadmapEditorProvider } from "../../../../context/RoadmapEditorContext";
import { useRoadmapEditor } from "../../../../context/RoadmapEditorContext";
import RoadmapToolbar from "./RoadmapToolbar";
import RoadmapCanvas from "./RoadmapCanvas";
import RoadmapCoursesSidebar from "./courses-sidebar/RoadmapCoursesSidebar";
import RoadmapMetadataDialog from "./roadmap-meta-dialog/RoadmapMetaDialog";

function RoadmapEditPageContent() {
    const { metadataDialogOpen, closeMetaDialog, roadmapId } =
        useRoadmapEditor();

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
            <RoadmapToolbar />

            {/* Canvas area — sidebar overlays inside here */}
            <Box
                sx={{
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <ReactFlowProvider>
                    <RoadmapCanvas />
                </ReactFlowProvider>

                <RoadmapCoursesSidebar />
            </Box>

            {/* Roadmap Metadata Dialog */}
            <RoadmapMetadataDialog
                open={metadataDialogOpen}
                onClose={closeMetaDialog}
                roadmapId={roadmapId}
            />
        </Box>
    );
}

export default function RoadmapEditPage() {
    return (
        <RoadmapEditorProvider>
            <RoadmapEditPageContent />
        </RoadmapEditorProvider>
    );
}
