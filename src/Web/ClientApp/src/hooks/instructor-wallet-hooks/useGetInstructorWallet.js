import { useQuery } from "@tanstack/react-query";
import { InstructorWalletClient } from "../../web-api-client.ts";

const useGetInstructorWallet = () => {
  return useQuery({
    queryKey: ["instructor-wallet"],
    queryFn: async () => {
      const client = new InstructorWalletClient();
      return await client.getWallet();
    },
  });
};

export default useGetInstructorWallet;
