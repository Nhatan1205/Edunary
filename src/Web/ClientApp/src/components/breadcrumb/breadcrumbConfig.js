const breadcrumbConfig = {
  // Instructors
  "/instructor": "Home",
  "/instructor/courses": "Courses",
  // Communication
  "/instructor/communication": "Communication",
  "/instructor/communication/announcements": "Announcements",
  "/instructor/communication/announcements/new": "Compose Announcement",
};

// Function để kiểm tra xem segment có phải là ID không
function isId(segment) {
  // Kiểm tra nếu là số hoặc UUID hoặc các ID pattern khác
  return /^[0-9]+$/.test(segment) || /^[a-f0-9-]{36}$/i.test(segment);
}

// Function để lấy label cho dynamic routes
export function getBreadcrumbLabel(path) {
  // Kiểm tra exact match trước
  if (breadcrumbConfig[path]) {
    return breadcrumbConfig[path];
  }

  // Kiểm tra dynamic routes
  if (path.includes("/announcements/") && path.endsWith("/edit")) {
    return "Edit Announcement";
  }

  // Nếu không match, trả về segment cuối cùng (capitalize)
  const segments = path.split("/").filter(x => x);
  const lastSegment = segments[segments.length - 1];
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
}

// Function để kiểm tra xem có nên hiển thị breadcrumb này không
export function shouldShowBreadcrumb(segment) {
  return !isId(segment);
}

export default breadcrumbConfig;