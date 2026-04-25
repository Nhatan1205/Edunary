import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CategoriesClient } from "../../web-api-client.ts";

const useAdminGetCategories = (searchText, pageNumber, pageSize) => {
  return useQuery({
    queryKey: ["admin-categories", searchText, pageNumber, pageSize],
    queryFn: async () => {
      const client = new CategoriesClient();
      const result = await client.adminGetCategories(searchText || null, pageNumber, pageSize);

      if (!result) throw new Error("Failed to fetch categories");

      return {
        items: result.items,
        pageNumber: result.pageNumber,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasPreviousPage: result.hasPreviousPage,
        hasNextPage: result.hasNextPage,
      };
    },
    placeholderData: keepPreviousData,
  });
};

export default useAdminGetCategories;
