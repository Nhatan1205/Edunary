import { useMemo, useCallback } from "react"
import { CouponsClient } from "../../web-api-client.ts"

export default function useCouponClient() {
  const client = useMemo(() => new CouponsClient(), [])

  const getCoupons = useCallback(async (courseId = 0, activeOnly = false, ownerUserId = null, code = null, typeFilter = null) => {
    return client.getCoupons(courseId, activeOnly, ownerUserId ?? undefined, code ?? undefined, typeFilter ?? undefined)
  }, [client])

  const createCoupon = useCallback(async (command) => {
    return client.createCoupon(command)
  }, [client])

  const validateCoupon = useCallback(async (code, courseIds) => {
    return client.validateCoupon({ code, courseIds })
  }, [client])

  const deactivateCoupon = useCallback(async (id) => {
    return client.deactivateCoupon(id)
  }, [client])

  return { getCoupons, createCoupon, validateCoupon, deactivateCoupon }
}
