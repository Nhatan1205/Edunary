import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CategoriesClient } from "../web-api-client.ts";
import queryClient from "../configs/reactQuery.js";

export function useGetCategories({ pageNumber, pageSize }) {
  const categoriesClient = new CategoriesClient(); // Hoặc inject qua props/context

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories", pageNumber, pageSize], // Include params trong queryKey để cache riêng biệt
    queryFn: () => categoriesClient.getCategories(pageNumber, pageSize),
    onSuccess: (data) => {
      if (data) {
        toast.success("Categories fetched successfully!");
        queryClient.invalidateQueries(["categories"]);
      }
    },
    onError: (error) => {
      const msg =
        error?.response || error?.message || "Failed to fetch categories.";
      toast.error(msg);
    },
  });

  return {
    categories,
    isLoading,
    error,
  };
}
