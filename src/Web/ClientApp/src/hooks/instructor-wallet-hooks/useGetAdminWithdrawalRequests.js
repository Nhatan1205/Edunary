import { useQuery } from "@tanstack/react-query";
import { InstructorWalletClient } from "../../web-api-client.ts";

const normalizeDateInput = (value) => {
  if (value == null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

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
      const client = new InstructorWalletClient();
      return await client.getAdminWithdrawalRequests(
        pageNumber,
        pageSize,
        status === null || status === undefined || status === "" ? null : status,
        normalizeDateInput(fromDate),
        normalizeDateInput(toDate),
        instructorName?.trim() || null,
        instructorEmail?.trim() || null,
        bankNumber?.trim() || null,
        bankAccountHolder?.trim() || null
      );
    },
    keepPreviousData: true,
  });
};

export default useGetAdminWithdrawalRequests;
