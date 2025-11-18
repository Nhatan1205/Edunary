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
