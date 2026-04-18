import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CategoriesClient, UpdateCategoryCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useAdminUpdateCategory = () => {
  const client = new CategoriesClient();

  return useMutation({
    mutationFn: async (data) => {
      const command = new UpdateCategoryCommand({ id: data.id, title: data.title });
      const result = await client.adminUpdateCategory(command);
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

export default useAdminUpdateCategory;
