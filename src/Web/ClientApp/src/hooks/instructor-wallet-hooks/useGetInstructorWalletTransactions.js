import { useQuery } from "@tanstack/react-query";
import { InstructorWalletClient } from "../../web-api-client.ts";

const useGetInstructorWalletTransactions = (pageNumber = 1, pageSize = 10, options = {}) => {
  const {
    type = null,
    fromDate = null,
    toDate = null,
    orderId = null,
    courseId = null,
    amountSort = null,
  } = options;

  return useQuery({
    queryKey: [
      "instructor-wallet-transactions",
      pageNumber,
      pageSize,
      type,
      fromDate,
      toDate,
      orderId,
      courseId,
      amountSort,
    ],
    queryFn: async () => {
      const client = new InstructorWalletClient();
      return await client.getTransactions(
        pageNumber,
        pageSize,
        type,
        fromDate,
        toDate,
        orderId,
        courseId,
        amountSort
      );
    },
    keepPreviousData: true,
  });
};

export default useGetInstructorWalletTransactions;
