import { useState } from 'react';
import {
    ReactFlow,
    Background,
    Handle,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Typography } from '@mui/material';
import CourseNode from '../../../../components/roadmap/CourseNode';
const mockCourses = [
    {
        id: 'c1',
        title: 'Introduction to UI/UX Design',
        description: 'Learn the foundations of user-centred design and product thinking...',
        duration: '20h',
        rating: 4.7,
        status: 'COMPLETED',
        thumbnail: null,
    },
    {
        id: 'c2',
        title: 'User Research & Usability Testing',
        description: 'Conduct interviews, surveys and usability tests to validate ideas...',
        duration: '25h',
        rating: 4.6,
        status: 'COMPLETED',
        thumbnail: null,
    },
    {
        id: 'c3',
        title: 'Wireframing & Prototyping',
        description: 'Create low-fi and hi-fi prototypes using industry-standard tools...',
        duration: '30h',
        rating: 4.8,
        status: 'IN_PROGRESS',
        thumbnail: null,
    },
    {
        id: 'c4',
        title: 'Design Systems & Component Libraries',
        description: 'Build scalable, consistent design systems from the ground up...',
        duration: '28h',
        rating: 4.5,
        status: null,
        thumbnail: null,
    },
    {
        id: 'c5',
        title: 'AI Tools for Designers',
        description: 'Accelerate your design workflow using the latest AI-powered tools...',
        duration: '18h',
        rating: 4.9,
        status: null,
        thumbnail: null,
    },
    {
        id: 'c6',
        title: 'Portfolio Building & Job Readiness',
        description: 'Present your work professionally and land your first design role...',
        duration: '15h',
        rating: 4.7,
        status: null,
        thumbnail: null,
    },
];

function CourseFlowNode({ data }) {
    return (
        <>
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: '#3FCCB2', width: 10, height: 10, border: '2px solid #fff' }}
            />
            <CourseNode course={data.course} />
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#3FCCB2', width: 10, height: 10, border: '2px solid #fff' }}
            />
        </>
    );
}

const nodeTypes = { courseNode: CourseFlowNode };

const NODE_W = 320;
const NODE_H = 380;
const COL_GAP = 80;
const ROW_GAP = 60;
const COLS = 2;

/**
 * Tính vị trí node tự động theo lưới COLS cột.
 * Row lẻ (ít hơn COLS node) sẽ được căn giữa.
 * Không phụ thuộc vào id hay thứ tự cụ thể.
 */
function buildNodes(courses) {
    const totalWidth = COLS * NODE_W + (COLS - 1) * COL_GAP;

    return courses.map((course, i) => {
        const row = Math.floor(i / COLS);
        const col = i % COLS;

        const rowCount = Math.min(COLS, courses.length - row * COLS);
        const rowWidth = rowCount * NODE_W + (rowCount - 1) * COL_GAP;
        const offsetX = (totalWidth - rowWidth) / 2;

        return {
            id: course.id,
            type: 'courseNode',
            position: {
                x: offsetX + col * (NODE_W + COL_GAP),
                y: row * (NODE_H + ROW_GAP),
            },
            data: { course },
            draggable: true,
        };
    });
}

/**
 * Tính chiều cao canvas vừa đủ chứa toàn bộ roadmap.
 * Không hardcode, tự co giãn theo số lượng course.
 */
function calcCanvasHeight(courseCount) {
    const rows = Math.ceil(courseCount / COLS);
    return rows * NODE_H + (rows - 1) * ROW_GAP + 80;
}

const edgeStyle = { stroke: '#3FCCB2', strokeWidth: 2 };

const initialEdges = [
    { id: 'e1-2', source: 'c1', target: 'c2', animated: true, style: edgeStyle },
    { id: 'e1-3', source: 'c1', target: 'c3', animated: true, style: edgeStyle },
    { id: 'e2-4', source: 'c2', target: 'c4', animated: false, style: edgeStyle },
    { id: 'e3-5', source: 'c3', target: 'c5', animated: false, style: edgeStyle },
    { id: 'e4-6', source: 'c4', target: 'c6', animated: false, style: edgeStyle },
    { id: 'e5-6', source: 'c5', target: 'c6', animated: false, style: edgeStyle },
];

export default function CareerPathFlow() {
    const [nodes, setNodes] = useState(() => buildNodes(mockCourses));
    const [edges, setEdges] = useState(initialEdges);

    const canvasHeight = calcCanvasHeight(mockCourses.length);

    return (
        <Box sx={{ py: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                Learning Roadmap
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.tertiary', mb: 4 }}>
                Follow this guided path to master every skill needed for your career.
            </Typography>

            <Box
                sx={{
                    width: '100%',
                    height: canvasHeight,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#F4F7F6',
                    boxShadow: '0 4px 32px 0 rgba(31,60,57,0.08)',
                }}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    preventScrolling={false}
                    zoomOnScroll={false}
                    zoomOnPinch={false}
                    zoomOnDoubleClick={false}
                    minZoom={1}
                    maxZoom={1}
                    fitView
                    fitViewOptions={{ padding: 0.05 }}
                    proOptions={{ hideAttribution: true }}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                >
                    <Background color="#d0e8e5" gap={20} size={1.5} />
                </ReactFlow>
            </Box>
        </Box>
    );
}