import { useCallback } from "react";
import theme from "../../../../theme/theme";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Handle,
    Position,
    useReactFlow,
    MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box, IconButton, Tooltip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CourseNode from "../../../../components/roadmap/CourseNode";
import { useRoadmapEditor } from "../../../../context/RoadmapEditorContext";

const handleStyle = {
    background: theme.palette.brand.main,
    width: 10,
    height: 10,
    border: "2px solid #fff",
};

function CourseFlowNode({ data }) {
    return (
        <Box
            sx={{
                position: "relative",
                "&:hover .node-context-menu": { opacity: 1, pointerEvents: "auto" },
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
                style={handleStyle}
            />

            <Box
                className="node-context-menu"
                sx={{
                    position: "absolute",
                    top: -36,
                    right: 0,
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "background.paper",
                    borderRadius: "10px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    border: "1px solid",
                    borderColor: "divider",
                    p: 0.3,
                    opacity: 0,
                    pointerEvents: "none",
                    transition: "opacity 0.15s ease",
                }}
            >
                <Tooltip title="Delete node" placement="top" arrow>
                    <IconButton
                        size="small"
                        className="node-delete-btn"
                        sx={{
                            color: "error.main",
                            "&:hover": { bgcolor: "error.lighter", color: "error.dark" },
                        }}
                    >
                        <DeleteOutlineIcon sx={{ fontSize: "1.15rem" }} />
                    </IconButton>
                </Tooltip>
            </Box>

            <CourseNode course={data.course} />
            <Handle
                type="source"
                position={Position.Bottom}
                style={handleStyle}
            />
        </Box>
    );
}

const nodeTypes = { courseNode: CourseFlowNode };

const defaultEdgeOptions = {
    style: { stroke: theme.palette.brand.main, strokeWidth: 3 },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: theme.palette.brand.main,
        width: 15,
        height: 15,
    },
};

export default function RoadmapCanvas() {
    const { nodes, edges, setNodes, setEdges, addCourseNode } = useRoadmapEditor();
    const { screenToFlowPosition, deleteElements } = useReactFlow();

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    const onConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges]
    );

    // ─── Node click — handle delete button ────────────────────────────────
    const onNodeClick = useCallback(
        (event, node) => {
            const target = event.target;
            if (target.closest(".node-delete-btn")) {
                deleteElements({ nodes: [{ id: node.id }] });
            }
        },
        [deleteElements]
    );

    // ─── Drag-and-drop from sidebar ──────────────────────────────────────
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const courseJson = event.dataTransfer.getData(
                "application/edunary-course"
            );
            if (!courseJson) return;

            const course = JSON.parse(courseJson);
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            addCourseNode(course, position);
        },
        [screenToFlowPosition, addCourseNode]
    );

    return (
        <Box
            sx={{
                flex: 1,
                width: "100%",
                bgcolor: "background.alt",
                overflow: "hidden",
            }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onDragOver={onDragOver}
                onDrop={onDrop}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                proOptions={{ hideAttribution: true }}
                nodesDraggable
                nodesConnectable
                elementsSelectable
                snapToGrid
                snapGrid={[20, 20]}
            >
                <Background color="#d0e8e5" variant="dots" gap={20} size={4} />
                <Controls
                    style={{
                        borderRadius: 10,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    }}
                />
                <MiniMap
                    nodeColor={theme.palette.brand.main}
                    maskColor="rgba(244,247,246,0.7)"
                    style={{
                        borderRadius: 10,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    }}
                />
            </ReactFlow>
        </Box>
    );
}
