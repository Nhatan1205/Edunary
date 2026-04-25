import { useQuery } from "@tanstack/react-query";

/**
 * Fetch category stats for the admin Category List Page overview.
 * Calls: GET /api/Categories/admin/stats
 *
 * Response shape:
 * {
 *   totalCategories: number,
 *   activeCategories: number,
 *   emptyCategories: number,
 *   avgCoursesPerCategory: number,
 *   categoriesComparison: Array<{ categoryId, title, courseCount, enrollmentCount }>
 * }
 */
const useAdminGetCategoryStats = () => {
  return useQuery({
    queryKey: ["admin-category-stats"],
    queryFn: async () => {
      const response = await fetch("/api/Categories/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch category stats");
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute — stats don't change that often
  });
};

export default useAdminGetCategoryStats;
