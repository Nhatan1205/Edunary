import { useMemo, useCallback } from "react"
import { CouponsClient } from "../../web-api-client.ts"

export default function useCouponClient() {
  const client = useMemo(() => new CouponsClient(), [])

  const createCoupon = useCallback(async (command) => {
    return client.createCoupon(command)
  }, [client])

  const validateCoupon = useCallback(async (code, courseIds) => {
    return client.validateCoupon({ code, courseIds })
  }, [client])

  const deactivateCoupon = useCallback(async (id) => {
    return client.deactivateCoupon(id)
  }, [client])

  return { createCoupon, validateCoupon, deactivateCoupon }
}
