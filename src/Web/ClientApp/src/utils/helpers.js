const LEVEL_MAP = {
  0: "Beginner",
  1: "Intermediate",
  2: "Advanced",
  3: "All Levels"
};

const CourseSortBy = {
  Relevant: 0,
  Newest: 1,
  Popular: 2,
  TopRated: 3,
};

const CourseManagementSortBy = {
  Newest: 0,
  Oldest: 1,
  TitleAscending: 2,
  TitleDescending: 3,
  PublishedFirst: 4,
  UnpublishedFirst: 5,
};

export function formatTimeAgo(date) {
  const now = new Date();
  const createdDate = new Date(date);
  const diffMs = now - createdDate; // chênh lệch theo mili giây
  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMs / 1000 / 60 / 60);
  const diffDays = Math.floor(diffMs / 1000 / 60 / 60 / 24);

  if (diffMinutes < 10) {
    return "Just now";
  } else if (diffMinutes < 60) {
    // Làm tròn xuống 15, 30, 45 phút
    const rounded = Math.floor(diffMinutes / 15) * 15;
    return `${rounded} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  } else {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }
}

export function formatDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function formatMonthYear(dateString) {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() trả về 0-11
  const year = date.getFullYear();
  return `${month}/${year}`;
}

export function getLevelLabel(value) {
  return LEVEL_MAP[value] || "Unknown";
}

export function getPublishDate(timeValue) {
  const now = new Date();
  let pastDate = null;

  switch (timeValue) {
    case "in_last_week":
      pastDate = new Date();
      pastDate.setDate(now.getDate() - 7);
      break;
    case "in_last_month":
      pastDate = new Date();
      pastDate.setMonth(now.getMonth() - 1);
      break;
    case "in_last_3months":
      pastDate = new Date();
      pastDate.setMonth(now.getMonth() - 3);
      break;
    case "in_last_year":
      pastDate = new Date();
      pastDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return null;
  }
  pastDate.setHours(0, 0, 0, 0);
  return pastDate.toISOString();
};

export function getCourseSortBy(value) {
  switch (value) {
    case "newest":
      return CourseSortBy.Newest;
    case "num_students":
      return CourseSortBy.Popular;
    case "highest_rated":
      return CourseSortBy.TopRated;
    case "relevant":
    default:
      return CourseSortBy.Relevant;
  }
}

export function getCourseManagementSortBy(value) {
  switch (value) {
    case "oldest":
      return CourseManagementSortBy.Oldest;
    case "titleascending":
      return CourseManagementSortBy.TitleAscending;
    case "titledescending":
      return CourseManagementSortBy.TitleDescending;
    case "publishedfirst":
      return CourseManagementSortBy.PublishedFirst;
    case "unpublishedFirst":
      return CourseManagementSortBy.UnpublishedFirst;
    case "newest":
    default:
      return CourseManagementSortBy.Newest;
  }
}


/**
 * Utility functions to convert between React Flow data and
 * the backend's RoadmapGraphData JSON structure.
 *
 * Backend GraphData (save):
 *   { nodes: [{ clientNodeId, courseId, positionX, positionY, sortOrder }],
 *     edges: [{ sourceNodeId, targetNodeId }] }
 *
 * Backend GraphResponse (fetch — enriched):
 *   { nodes: [{ clientNodeId, courseId, courseTitle, courseImageUrl, positionX, positionY, sortOrder }],
 *     edges: [{ sourceNodeId, targetNodeId }] }
 */

/**
 * Generate a unique clientNodeId for a new node.
 * Format: "node_<timestamp>_<random>"
 */
export function generateNodeId() {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Convert enriched GraphData response (from GET /roadmaps/{id})
 * into React Flow nodes + edges.
 *
 * @param {object|null} graphData - RoadmapGraphResponse from API
 * @returns {{ nodes: object[], edges: object[] }}
 */
export function graphResponseToReactFlow(graphData) {
  if (!graphData) return { nodes: [], edges: [] };

  const nodes = (graphData.nodes || []).map((n) => ({
    id: n.clientNodeId,
    type: "courseNode",
    position: { x: n.positionX, y: n.positionY },
    data: {
      course: {
        id: n.course.courseId,
        title: n.course.title,
        imageUrl: n.course.imageUrl,
        totalStudents: n.course.totalStudents,
        ratings: n.course.ratings,
      },
      sortOrder: n.sortOrder,
    },
  }));

  const edges = (graphData.edges || []).map((e) => ({
    id: `${e.sourceNodeId}-${e.targetNodeId}`,
    source: e.sourceNodeId,
    target: e.targetNodeId,
  }));

  return { nodes, edges };
}

/**
 * Convert React Flow nodes + edges into the lean GraphData JSON
 * expected by UpdateRoadmapCommand.graphData.
 *
 * @param {object[]} nodes - React Flow nodes
 * @param {object[]} edges - React Flow edges
 * @returns {{ nodes: object[], edges: object[] }}
 */
export function reactFlowToGraphData(nodes, edges) {
  const apiNodes = nodes.map((n, index) => ({
    clientNodeId: n.id,
    courseId: n.data.course.id,
    positionX: n.position.x,
    positionY: n.position.y,
    sortOrder: n.data.sortOrder ?? index,
  }));

  const apiEdges = edges.map((e) => ({
    sourceNodeId: e.source,
    targetNodeId: e.target,
  }));

  return { nodes: apiNodes, edges: apiEdges };
}
