import { useQuery } from "@tanstack/react-query";
import { CategoriesClient } from "../../web-api-client.ts";

const useGetCategories = (pageNumber = 1, pageSize = 10, searchText = null) => {
  return useQuery({
    queryKey: ["categories", pageNumber, pageSize, searchText],
    queryFn: async () => {
      const client = new CategoriesClient();
      const result = await client.getCategories(pageNumber, pageSize, searchText || null);

      if (!result) {
        throw new Error("Failed to fetch categories");
      }

      return {
        items: result.items,
        pageNumber: result.pageNumber,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasPreviousPage: result.hasPreviousPage,
        hasNextPage: result.hasNextPage,
      };
    },
  });
};

export default useGetCategories;
