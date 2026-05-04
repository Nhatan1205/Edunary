import {
    ReactFlow,
    Background,
    Handle,
    Position,
    Controls,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CourseNode from '../../../../components/roadmap/CourseNode';
import theme from '../../../../theme/theme';

function CourseFlowNode({ data }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (data.course?.id) {
            navigate(`/course/${data.course.id}`);
        }
    };

    return (
        <>
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: theme.palette.secondaryBrand.main, width: 10, height: 10, border: '2px solid #fff' }}
            />
            <Box onClick={handleClick} sx={{ cursor: 'pointer' }}>
                <CourseNode course={data.course} />
            </Box>
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: theme.palette.secondaryBrand.main, width: 10, height: 10, border: '2px solid #fff' }}
            />
        </>
    );
}

const nodeTypes = { courseNode: CourseFlowNode };

const NODE_H = 380; // approximate height of a single CourseNode card

/**
 * Dynamically calculate canvas height from actual node positions.
 * Takes the bottom-most node's Y + node height + padding.
 */
function calcCanvasHeight(nodes) {
    if (!nodes || nodes.length === 0) return 500;
    const maxY = Math.max(...nodes.map((n) => (n.position?.y ?? 0)));
    return maxY + NODE_H + 100; // extra padding at the bottom
}

export default function CareerPathFlow({ nodes, edges }) {
    const canvasHeight = calcCanvasHeight(nodes);

    if (!nodes || nodes.length === 0) {
        return null;
    }

    return (
        <Box sx={{ py: 6, px: { xs: 2, md: 4 } }}>
            {/* <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                Learning Roadmap
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.tertiary', mb: 4 }}>
                Follow this guided path to master every skill needed for your career.
            </Typography> */}

            <Box
                sx={{
                    width: '100%',
                    height: canvasHeight,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    bgcolor: '#fbf9fa',
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
                    fitView
                    fitViewOptions={{ padding: 0.05 }}
                    proOptions={{ hideAttribution: true }}
                    nodesDraggable={true}
                    nodesConnectable={false}
                    elementsSelectable={false}
                >
                    <Controls
                        style={{
                            borderRadius: 10,
                            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                        }}
                    />
                    <Background color="#d0e8e5" variant="dots" gap={20} size={2} />
                </ReactFlow>
            </Box>
        </Box>
    );
}