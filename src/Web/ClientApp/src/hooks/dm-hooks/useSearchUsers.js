import { useQuery } from "@tanstack/react-query";
import { DirectMessagesClient } from "../../web-api-client.ts";

const useSearchUsers = (searchText = "") => {
  return useQuery({
    queryKey: ["messageable-users", { searchText }],
    queryFn: async () => {
      const client = new DirectMessagesClient();
      return await client.searchUsers(searchText ?? null);
    },
  });
};

export default useSearchUsers;
