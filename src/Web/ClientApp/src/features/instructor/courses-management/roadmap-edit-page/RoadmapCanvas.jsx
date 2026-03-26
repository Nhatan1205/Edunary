import { useCallback, useState } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box } from "@mui/material";
import CourseNode from "../../../../components/roadmap/CourseNode"

const handleStyle = {
    background: "#3FCCB2",
    width: 10,
    height: 10,
    border: "2px solid #fff",
};

function CourseFlowNode({ data }) {
    return (
        <>
            <Handle
                type="target"
                position={Position.Top}
                style={handleStyle}
            />
            <CourseNode course={data.course} />
            <Handle
                type="source"
                position={Position.Bottom}
                style={handleStyle}
            />
        </>
    );
}

const nodeTypes = { courseNode: CourseFlowNode };

const defaultEdgeOptions = {
    style: { stroke: "#3FCCB2", strokeWidth: 2 },
    animated: true,
};

// ─── Mock courses for the roadmap editor ─────────────────────────────────────
// Replace with API data later
export const mockCourses = [
    {
        id: "c1",
        title: "Introduction to Web Development",
        description:
            "Learn the foundations of HTML, CSS, and JavaScript to build modern websites...",
        duration: "20h",
        rating: 4.7,
        status: "COMPLETED",
        thumbnail: null,
    },
    {
        id: "c2",
        title: "JavaScript Fundamentals",
        description:
            "Deep dive into ES6+, closures, async/await, and DOM manipulation...",
        duration: "25h",
        rating: 4.6,
        status: "COMPLETED",
        thumbnail: null,
    },
    {
        id: "c3",
        title: "React.js Essentials",
        description:
            "Build dynamic user interfaces with React, hooks, and component patterns...",
        duration: "30h",
        rating: 4.8,
        status: "IN_PROGRESS",
        thumbnail: null,
    },
    {
        id: "c4",
        title: "Node.js & Express Backend",
        description:
            "Create RESTful APIs and server-side applications with Node.js...",
        duration: "28h",
        rating: 4.5,
        status: null,
        thumbnail: null,
    },
    {
        id: "c5",
        title: "Database Design & SQL",
        description:
            "Master relational databases, SQL queries, and data modelling techniques...",
        duration: "18h",
        rating: 4.9,
        status: null,
        thumbnail: null,
    },
    {
        id: "c6",
        title: "Full-Stack Project & Deployment",
        description:
            "Combine everything into a production-ready full-stack application...",
        duration: "35h",
        rating: 4.7,
        status: null,
        thumbnail: null,
    },
];

// ─── Layout constants ─────────────────────────────────────────────────────────
const NODE_W = 320;
const NODE_H = 380;
const COL_GAP = 120;
const ROW_GAP = 80;
const COLS = 2;

// ─── Build initial nodes ──────────────────────────────────────────────────────
const totalWidth = COLS * NODE_W + (COLS - 1) * COL_GAP;

export const initialNodes = mockCourses.map((course, i) => {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const rowCount = Math.min(COLS, mockCourses.length - row * COLS);
    const rowWidth = rowCount * NODE_W + (rowCount - 1) * COL_GAP;
    const offsetX = (totalWidth - rowWidth) / 2;

    return {
        id: course.id,
        type: "courseNode",
        position: {
            x: offsetX + col * (NODE_W + COL_GAP),
            y: row * (NODE_H + ROW_GAP),
        },
        data: { course },
    };
});

// ─── Build initial edges ──────────────────────────────────────────────────────
const edgeStyle = { stroke: "#3FCCB2", strokeWidth: 2 };

export const initialEdges = [
    { id: "e1-2", source: "c1", target: "c2", animated: true, style: edgeStyle },
    { id: "e1-3", source: "c1", target: "c3", animated: true, style: edgeStyle },
    { id: "e2-4", source: "c2", target: "c4", animated: false, style: edgeStyle },
    { id: "e3-5", source: "c3", target: "c5", animated: false, style: edgeStyle },
    { id: "e4-6", source: "c4", target: "c6", animated: false, style: edgeStyle },
    { id: "e5-6", source: "c5", target: "c6", animated: false, style: edgeStyle },
];


export default function RoadmapCanvas() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        []
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
                <Background color="#d0e8e5" variant="dots" gap={20} size={1.5} />
                <Controls
                    style={{
                        borderRadius: 10,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    }}
                />
                <MiniMap
                    nodeColor="#3FCCB2"
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
