import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CategoriesClient, DeleteCategoryCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useAdminDeleteCategory = () => {
  const client = new CategoriesClient();

  return useMutation({
    mutationFn: async (id) => {
      const command = new DeleteCategoryCommand({ id });
      const result = await client.adminDeleteCategory(command);
      if (!result.succeeded) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries(["admin-categories"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export default useAdminDeleteCategory;
