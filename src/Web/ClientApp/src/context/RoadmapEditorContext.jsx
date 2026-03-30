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

    // Orphan confirm dialog
    OPEN_ORPHAN_CONFIRM: "OPEN_ORPHAN_CONFIRM",
    CLOSE_ORPHAN_CONFIRM: "CLOSE_ORPHAN_CONFIRM",
};

export const initialState = {
    nodes: [],
    edges: [],
    coursesSidebarOpen: false,
    metadataDialogOpen: false,
    orphanConfirmOpen: false,
    orphanNodeCount: 0,
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

        case ACTIONS.OPEN_ORPHAN_CONFIRM:
            return { ...state, orphanConfirmOpen: true, orphanNodeCount: action.payload };

        case ACTIONS.CLOSE_ORPHAN_CONFIRM:
            return { ...state, orphanConfirmOpen: false, orphanNodeCount: 0 };

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

    // ── Internal: actually execute the save ─────────────────────────────
    const executeSave = useCallback((nodes, edges) => {
        if (!roadmapDetail) return;

        const connectedNodeIds = new Set(
            edges.flatMap((e) => [e.source, e.target])
        );
        const connectedNodes = nodes.filter((n) => connectedNodeIds.has(n.id));

        // Update canvas to reflect orphan removal
        dispatch({ type: ACTIONS.SET_NODES, payload: connectedNodes });

        const graphData = reactFlowToGraphData(connectedNodes, edges);

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

    // ── handleSave: check for orphans first ─────────────────────────────
    const handleSave = useCallback(() => {
        if (!roadmapDetail) return;

        const { nodes: currentNodes, edges: currentEdges } = stateRef.current;

        const connectedNodeIds = new Set(
            currentEdges.flatMap((e) => [e.source, e.target])
        );
        const orphanCount = currentNodes.filter(
            (n) => !connectedNodeIds.has(n.id)
        ).length;

        if (orphanCount > 0) {
            // Show confirm dialog instead of silently dropping them
            dispatch({ type: ACTIONS.OPEN_ORPHAN_CONFIRM, payload: orphanCount });
            return;
        }

        executeSave(currentNodes, currentEdges);
    }, [roadmapDetail, executeSave]);

    // ── confirmSave: called when user clicks "Yes" on orphan dialog ──────
    const confirmSave = useCallback(() => {
        const { nodes: currentNodes, edges: currentEdges } = stateRef.current;
        dispatch({ type: ACTIONS.CLOSE_ORPHAN_CONFIRM });
        executeSave(currentNodes, currentEdges);
    }, [executeSave]);

    const closeOrphanConfirm = useCallback(
        () => dispatch({ type: ACTIONS.CLOSE_ORPHAN_CONFIRM }),
        []
    );

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
            orphanConfirmOpen: state.orphanConfirmOpen,
            orphanNodeCount: state.orphanNodeCount,

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
            confirmSave,
            closeOrphanConfirm,
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
            confirmSave,
            closeOrphanConfirm,
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
