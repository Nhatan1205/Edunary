import { useQuery } from "@tanstack/react-query";

const useGetAdminWithdrawalRequests = (pageNumber = 1, pageSize = 10, options = {}) => {
  const {
    status = null,
    fromDate = null,
    toDate = null,
    instructorName = null,
    instructorEmail = null,
    bankNumber = null,
    bankAccountHolder = null,
  } = options;

  return useQuery({
    queryKey: [
      "admin-withdrawal-requests",
      pageNumber,
      pageSize,
      status,
      fromDate,
      toDate,
      instructorName,
      instructorEmail,
      bankNumber,
      bankAccountHolder,
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

      const trimmedName = instructorName?.trim();
      if (trimmedName) {
        params.set("InstructorName", trimmedName);
      }

      const trimmedEmail = instructorEmail?.trim();
      if (trimmedEmail) {
        params.set("InstructorEmail", trimmedEmail);
      }

      const trimmedBankNumber = bankNumber?.trim();
      if (trimmedBankNumber) {
        params.set("BankNumber", trimmedBankNumber);
      }

      const trimmedHolder = bankAccountHolder?.trim();
      if (trimmedHolder) {
        params.set("BankAccountHolder", trimmedHolder);
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
