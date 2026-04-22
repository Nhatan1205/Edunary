import { useQuery } from "@tanstack/react-query";

const useGetAdminWithdrawalRequests = (pageNumber = 1, pageSize = 10, options = {}) => {
  const {
    status = null,
    fromDate = null,
    toDate = null,
  } = options;

  return useQuery({
    queryKey: [
      "admin-withdrawal-requests",
      pageNumber,
      pageSize,
      status,
      fromDate,
      toDate,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("PageNumber", String(pageNumber));
      params.set("PageSize", String(pageSize));

      if (status !== null && status !== undefined && status !== "") {
        params.set("Status", String(status));
      }

      if (fromDate) {
        params.set("FromDate", new Date(fromDate).toISOString());
      }

      if (toDate) {
        params.set("ToDate", new Date(toDate).toISOString());
      }

      const response = await fetch(`/api/InstructorWallet/admin/withdrawal-requests?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch withdrawal requests.");
      }

      return response.json();
    },
    keepPreviousData: true,
  });
};

export default useGetAdminWithdrawalRequests;
