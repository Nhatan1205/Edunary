import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../../web-api-client.ts";

const useGetPublishedCoursesForAdmin = (params) => {
  const client = new CoursesClient();

  return useQuery({
    queryKey: ["admin-published-courses", params],
    queryFn: async () => {
      return await client.getPublishedCoursesForAdmin(
        params.pageNumber ?? 1,
        params.pageSize ?? 10,
        params.searchQuery ?? "",
        params.categoryId ?? null,
        params.modifiedOnly ?? false,
        params.sortBy ?? ""
      );
    },
  });
};

export default useGetPublishedCoursesForAdmin;
