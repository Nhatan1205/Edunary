import { ActivityType } from "../web-api-client.ts";

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
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
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

/**
 * Format a date as short readable form.
 * e.g. "Nov 17 2024"
 */
export function formatShortDate(date) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

export function formatMonthYear(dateString) {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() trả về 0-11
  const year = date.getFullYear();
  return `${month}/${year}`;
}

/**
 * Format a number as USD currency string.
 * e.g. 12500 → "$12,500"  |  12500.5 → "$12,500.50"
 */
export function formatCurrency(value) {
  if (value == null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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


export const getActivityTypeLabel = (value) => ActivityType[value] ?? "Unknown";

/**
 * Strip HTML tags from a string, returning plain text.
 */
export function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Compute a recommendation score for a Q&A question.
 * Used to sort questions by relevance (recency + engagement).
 */
export function getRecommendedScore(q) {
  const diff = Date.now() - new Date(q.created).getTime();
  const hrs = diff / 3600000;
  const recency = hrs < 24 ? 5 : hrs < 168 ? 3 : hrs < 720 ? 1 : 0;
  return q.upvoteCount * 2 + q.answerCount * 1.5 + recency;
}

export function buildItemLabelMap(sidebarData) {
  const map = {};
  if (!sidebarData) return map;

  let progress = sidebarData.progress;
  if (typeof progress === "string") {
    try { progress = JSON.parse(progress); } catch { return map; }
  }

  let globalIndex = 1;
  for (const section of progress?.contents ?? []) {
    for (const item of section.items ?? []) {
      const kind = (item.type || "lecture").toLowerCase();
      map[item.itemId] = kind === "quiz" ? `Quiz ${globalIndex}` : `Lecture ${globalIndex}`;
      globalIndex++;
    }
  }
  return map;
}

export const ASSIGNMENT_STATUS = {
  DRAFT: 0,
  SUBMITTED: 1,
};

export function assignmentStatusLabel(status) {
  if (status === null || status === undefined) return "Not started";
  if (status === ASSIGNMENT_STATUS.DRAFT) return "Draft";
  if (status === ASSIGNMENT_STATUS.SUBMITTED) return "Submitted";
  return "Unknown";
}
/**
 * Extracts a readable error message from NSwag ApiException objects.
 * Parses the JSON string in `error.response` if present.
 */
export function extractApiError(error) {
  if (!error) return "An unexpected error occurred.";
  if (error.response) {
    try {
      const parsed = JSON.parse(error.response);
      if (parsed.errors) {
        if (Array.isArray(parsed.errors)) {
          return parsed.errors.join(", ");
        } else if (typeof parsed.errors === "object") {
          return Object.values(parsed.errors).flat().join(", ");
        }
      }
      if (parsed.detail) return parsed.detail;
      if (parsed.title) return parsed.title;
    } catch (e) {
      // Not JSON. Prevent toasting huge HTML error pages
      if (typeof error.response === "string") {
        if (error.response.trim().startsWith("<")) {
          return "An unexpected server error occurred.";
        }
        if (error.response.length > 150) {
          return error.response.substring(0, 150) + "...";
        }
      }
      return error.response;
    }
    return error.message || "An unexpected error occurred.";
  }
}
