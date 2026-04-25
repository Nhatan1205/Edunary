import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CategoriesClient, CreateCategoryCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useAdminCreateCategory = () => {
  const client = new CategoriesClient();

  return useMutation({
    mutationFn: async (data) => {
      const command = new CreateCategoryCommand({ title: data.title });
      const result = await client.adminCreateCategory(command);
      if (!result.result) throw new Error(result.message);
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

export default useAdminCreateCategory;
