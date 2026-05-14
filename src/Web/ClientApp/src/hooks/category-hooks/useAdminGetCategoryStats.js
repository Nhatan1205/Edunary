import { useQuery } from "@tanstack/react-query";
import { CategoriesClient } from "../../web-api-client.ts";

const useAdminGetCategoryStats = () => {
  return useQuery({
    queryKey: ["admin-category-stats"],
    queryFn: async () => {
      const client = new CategoriesClient();
      const result = await client.adminGetCategoryStats();
      if (!result) throw new Error("Failed to fetch category stats");
      return result;
    },
    staleTime: 60 * 1000,
  });
};

export default useAdminGetCategoryStats;
