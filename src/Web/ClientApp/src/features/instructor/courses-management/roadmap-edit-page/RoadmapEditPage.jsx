import React from "react";
import { Box } from "@mui/material";
import { ReactFlowProvider } from "@xyflow/react";
import { RoadmapEditorProvider } from "../../../../context/RoadmapEditorContext";
import { useRoadmapEditor } from "../../../../context/RoadmapEditorContext";
import RoadmapToolbar from "./RoadmapToolbar";
import RoadmapCanvas from "./RoadmapCanvas";
import RoadmapCoursesSidebar from "./courses-sidebar/RoadmapCoursesSidebar";
import RoadmapMetadataDialog from "./roadmap-meta-dialog/RoadmapMetaDialog";
import ConfirmDialog from "../../../../components/ConfirmDialogPopup/ConfirmDialog";

function RoadmapEditPageContent() {
    const {
        metadataDialogOpen,
        closeMetaDialog,
        roadmapId,
        orphanConfirmOpen,
        orphanNodeCount,
        confirmSave,
        closeOrphanConfirm,
    } = useRoadmapEditor();

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

            {/* Orphan nodes confirm dialog */}
            <ConfirmDialog
                open={orphanConfirmOpen}
                title="Unconnected Nodes Detected"
                message={`You have ${orphanNodeCount} node${orphanNodeCount > 1 ? "s" : ""} with no connections. These nodes will be removed when you save. Do you want to continue?`}
                onClose={closeOrphanConfirm}
                onConfirm={confirmSave}
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
