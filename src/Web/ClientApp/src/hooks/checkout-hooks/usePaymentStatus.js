import { useState, useEffect } from "react"
import usePaymentClient from "./usePaymentClient"
import { toast } from "react-toastify"
import { extractApiError } from "../../utils/helpers.js"

const getErrorMessage = (error, fallback) =>
  extractApiError(error) || error?.message || fallback

export default function usePaymentStatus(paymentIntentId) {
  const { getPaymentStatus } = usePaymentClient()
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    if (!paymentIntentId) {
      setPaymentStatus(null)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false

    const fetch = async () => {
      try {
        setLoading(true)
        setError(null)
        const resp = await getPaymentStatus(paymentIntentId)
        if (!cancelled) {
          setPaymentStatus(resp)
        }
      } catch (err) {
        console.error("Error fetching payment status:", err)
        const message = getErrorMessage(err, "Failed to fetch payment status")
        if (!cancelled) {
          setError(message)
          toast.error(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetch()

    return () => {
      cancelled = true
    }
  }, [paymentIntentId, getPaymentStatus])

  return { paymentStatus, loading, error }
}
