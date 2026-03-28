import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useRef } from "react";
import { useParams } from "react-router";
import useGetRoadmapDetail from "../hooks/roadmap-hooks/useGetRoadmapDetail";
import useUpdateRoadmap from "../hooks/roadmap-hooks/useUpdateRoadmap";
import {
    graphResponseToReactFlow,
    reactFlowToGraphData,
    generateNodeId,
} from "../utils/helpers";

export const ACTIONS = {
    // Graph data
    SET_NODES: "SET_NODES",
    SET_EDGES: "SET_EDGES",
    ADD_COURSE_NODE: "ADD_COURSE_NODE",

    // UI panels
    TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
    CLOSE_SIDEBAR: "CLOSE_SIDEBAR",
    OPEN_META_DIALOG: "OPEN_META_DIALOG",
    CLOSE_META_DIALOG: "CLOSE_META_DIALOG",
};

export const initialState = {
    nodes: [],
    edges: [],
    coursesSidebarOpen: false,
    metadataDialogOpen: false,
};

export function roadmapEditorReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_NODES:
            return { ...state, nodes: action.payload };

        case ACTIONS.SET_EDGES:
            return { ...state, edges: action.payload };

        case ACTIONS.ADD_COURSE_NODE: {
            const { course, node } = action.payload;
            if (state.nodes.some((n) => n.data.course.id === course.id)) {
                return state;
            }
            return { ...state, nodes: [...state.nodes, node] };
        }

        case ACTIONS.TOGGLE_SIDEBAR:
            return { ...state, coursesSidebarOpen: !state.coursesSidebarOpen };

        case ACTIONS.CLOSE_SIDEBAR:
            return { ...state, coursesSidebarOpen: false };

        case ACTIONS.OPEN_META_DIALOG:
            return { ...state, metadataDialogOpen: true };

        case ACTIONS.CLOSE_META_DIALOG:
            return { ...state, metadataDialogOpen: false };

        default:
            return state;
    }
}

export const RoadmapEditorContext = createContext(null);

export function RoadmapEditorProvider({ children }) {
    const { roadmapId } = useParams();
    const numericId = roadmapId ? Number(roadmapId) : undefined;

    const [state, dispatch] = useReducer(roadmapEditorReducer, initialState);

    // Ref keeps latest state
    const stateRef = useRef(state);
    stateRef.current = state;

    // Data fetching 
    const { data: roadmapDetail } = useGetRoadmapDetail(numericId);
    const updateRoadmap = useUpdateRoadmap();

    // ── Hydrate nodes/edges from API response ───────────────────────────
    useEffect(() => {
        if (roadmapDetail?.graphData) {
            const { nodes: apiNodes, edges: apiEdges } =
                graphResponseToReactFlow(roadmapDetail.graphData);
            dispatch({ type: ACTIONS.SET_NODES, payload: apiNodes });
            dispatch({ type: ACTIONS.SET_EDGES, payload: apiEdges });
        }
    }, [roadmapDetail]);

    const setNodes = useCallback((nodesOrFn) => {
        const current = stateRef.current.nodes;
        const next = typeof nodesOrFn === "function" ? nodesOrFn(current) : nodesOrFn;
        dispatch({ type: ACTIONS.SET_NODES, payload: next });
    }, []);

    const setEdges = useCallback((edgesOrFn) => {
        const current = stateRef.current.edges;
        const next = typeof edgesOrFn === "function" ? edgesOrFn(current) : edgesOrFn;
        dispatch({ type: ACTIONS.SET_EDGES, payload: next });
    }, []);

    // ── Add course node ─────────────────────────────────────────────────
    const addCourseNode = useCallback((course, position) => {
        const currentNodes = stateRef.current.nodes;
        const node = {
            id: generateNodeId(),
            type: "courseNode",
            position: position ?? {
                x: 100 + currentNodes.length * 40,
                y: 100 + currentNodes.length * 40,
            },
            data: {
                course: {
                    id: course.id,
                    title: course.title,
                    imageUrl: course.imageUrl,
                    ratings: course.ratings,
                    totalStudents: course.totalStudents,
                    status: course.status,
                },
                sortOrder: currentNodes.length,
            },
        };

        dispatch({
            type: ACTIONS.ADD_COURSE_NODE,
            payload: { course, node },
        });
    }, []);

    // ── Save roadmap ────────────────────────────────────────────────────
    const handleSave = useCallback(() => {
        if (!roadmapDetail) return;

        const { nodes: currentNodes, edges: currentEdges } = stateRef.current;

        // Remove orphan nodes (no edges connected)
        const connectedNodeIds = new Set(
            currentEdges.flatMap((e) => [e.source, e.target])
        );
        const connectedNodes = currentNodes.filter((n) =>
            connectedNodeIds.has(n.id)
        );

        // Update canvas state to reflect cleanup
        dispatch({ type: ACTIONS.SET_NODES, payload: connectedNodes });

        const graphData = reactFlowToGraphData(connectedNodes, currentEdges);

        updateRoadmap.mutate({
            id: numericId,
            title: roadmapDetail.title,
            subtitle: roadmapDetail.subtitle,
            description: roadmapDetail.description,
            roadmapTopicId: roadmapDetail.roadmapTopicId,
            skillLevel: roadmapDetail.skillLevel,
            isPublic: roadmapDetail.isPublic,
            graphData: JSON.stringify(graphData),
        });
    }, [roadmapDetail, numericId, updateRoadmap]);

    // ── UI toggle actions ───────────────────────────────────────────────
    const toggleSidebar = useCallback(
        () => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR }),
        []
    );
    const closeSidebar = useCallback(
        () => dispatch({ type: ACTIONS.CLOSE_SIDEBAR }),
        []
    );
    const openMetaDialog = useCallback(
        () => dispatch({ type: ACTIONS.OPEN_META_DIALOG }),
        []
    );
    const closeMetaDialog = useCallback(
        () => dispatch({ type: ACTIONS.CLOSE_META_DIALOG }),
        []
    );

    // ── Computed: set of courseIds already on canvas ─────────────────────
    const addedCourseIds = useMemo(
        () => new Set(state.nodes.map((n) => n.data.course.id)),
        [state.nodes]
    );

    // ── Context value ───────────────────────────────────────────────────
    const value = useMemo(
        () => ({
            // State
            nodes: state.nodes,
            edges: state.edges,
            coursesSidebarOpen: state.coursesSidebarOpen,
            metadataDialogOpen: state.metadataDialogOpen,

            // Data
            roadmapDetail,
            roadmapId: numericId,

            // Computed
            addedCourseIds,

            // Node/Edge setters (support callback pattern for React Flow)
            setNodes,
            setEdges,

            // Actions
            addCourseNode,
            handleSave,
            isSaving: updateRoadmap.isPending,

            // UI toggles
            toggleSidebar,
            closeSidebar,
            openMetaDialog,
            closeMetaDialog,
        }),
        [
            state,
            roadmapDetail,
            numericId,
            addedCourseIds,
            setNodes,
            setEdges,
            addCourseNode,
            handleSave,
            updateRoadmap.isPending,
            toggleSidebar,
            closeSidebar,
            openMetaDialog,
            closeMetaDialog,
        ]
    );

    return (
        <RoadmapEditorContext.Provider value={value}>
            {children}
        </RoadmapEditorContext.Provider>
    );
}

// ─── Hook ───────────────────────────────────────────────────────────────────
/**
 * Shortcut hook — gọi 1 dòng là có toàn bộ state + actions của roadmap editor.
 *
 * Usage:
 *   const { nodes, edges, addCourseNode, handleSave, ... } = useRoadmapEditor();
 */
export const useRoadmapEditor = () => {
    const context = useContext(RoadmapEditorContext);
    if (!context) {
        throw new Error(
            "useRoadmapEditor must be used within <RoadmapEditorProvider>"
        );
    }
    return context;
};
