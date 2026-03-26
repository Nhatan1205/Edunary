import { useMemo, useCallback } from "react"
import { PaymentClient } from "../../web-api-client.ts"

export default function usePaymentClient() {
  const client = useMemo(() => new PaymentClient(), [])

  const createPaymentIntent = useCallback(async (command) => {
    return client.createPaymentIntent(command)
  }, [client])

  const confirmPayment = useCallback(async (paymentIntentId) => {
    return client.confirmPayment({ paymentIntentId })
  }, [client])

  const getPaymentStatus = useCallback(async (paymentIntentId) => {
    return client.getPaymentStatus(paymentIntentId)
  }, [client])

  return { createPaymentIntent, confirmPayment, getPaymentStatus }
}
