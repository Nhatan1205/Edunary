import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CouponsClient } from "../../web-api-client.ts"

const useGetCoupons = (options = {}) => {
  const {
    courseId = 0,
    activeOnly = false,
    ownerUserId = null,
    code = null,
    typeFilter = null,
    pageNumber = 1,
    pageSize = 10,
    sortField = "created",
    sortDir = "desc",
  } = options

  const normalizedOwnerUserId = ownerUserId?.trim() || null
  const normalizedCode = code?.trim() || null
  const normalizedSortField = sortField || "created"
  const normalizedSortDir = sortDir || "desc"

  return useQuery({
    queryKey: [
      "coupons",
      courseId,
      activeOnly,
      normalizedOwnerUserId,
      normalizedCode,
      typeFilter,
      pageNumber,
      pageSize,
      normalizedSortField,
      normalizedSortDir,
    ],
    queryFn: async () => {
      const client = new CouponsClient()
      const result = await client.getCoupons(
        courseId,
        activeOnly,
        normalizedOwnerUserId,
        normalizedCode,
        typeFilter,
        pageNumber,
        pageSize,
        normalizedSortField,
        normalizedSortDir
      )

      if (!result) {
        throw new Error("Failed to fetch coupons")
      }

      return {
        items: result.items ?? [],
        pageNumber: result.pageNumber ?? pageNumber,
        totalPages: result.totalPages ?? 0,
        totalCount: result.totalCount ?? 0,
        hasPreviousPage: result.hasPreviousPage ?? (result.pageNumber ?? pageNumber) > 1,
        hasNextPage: result.hasNextPage ?? (result.pageNumber ?? pageNumber) < (result.totalPages ?? 0),
      }
    },
    placeholderData: keepPreviousData,
  })
}

export default useGetCoupons
