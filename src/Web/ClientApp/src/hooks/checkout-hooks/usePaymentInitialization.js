import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { toast } from "react-toastify"
import usePaymentClient from "./usePaymentClient"
import { extractApiError } from "../../utils/helpers.js"

const getErrorMessage = (error, fallback) =>
  extractApiError(error) || error?.message || fallback

export default function usePaymentInitialization(courses = [], couponCode = "", billingCountryCode = "") {
  const navigate = useNavigate()
  const { createPaymentIntent, confirmPayment } = usePaymentClient()

  const [loading, setLoading] = useState(true)
  const [clientSecret, setClientSecret] = useState("")
  const [paymentIntentId, setPaymentIntentId] = useState("")
  const [initError, setInitError] = useState("")
  const [redirecting, setRedirecting] = useState(false)
  const [vatAmount, setVatAmount] = useState(0)
  const [vatRate, setVatRate] = useState(0)

  useEffect(() => {
    if (!courses || courses.length === 0) {
      setLoading(false)
      return
    }

    let cancelled = false

    const init = async () => {
      try {
        setLoading(true)
        const courseIds = courses
          .map((c) => Number(c.id || c.courseId))
          .filter((id) => Number.isFinite(id) && id > 0)

        const response = await createPaymentIntent({
          courseIds,
          couponCode: couponCode || undefined,
          billingCountryCode: billingCountryCode || undefined,
        })
        if (!response?.result) {
          const message = response?.message || "Failed to initialize payment. Please try again."
          if (!cancelled) {
            setInitError(message)
            toast.error(message)
            navigate("/")
          }
          return
        }

        const paymentResult = response.result
        // Free checkout: Stripe does not create PaymentIntents for $0.
        if (!paymentResult?.clientSecret) {
          if (cancelled) return
          setRedirecting(true)
          // confirm free checkout on server
          try {
            const confirmResponse = await confirmPayment(paymentResult.paymentIntentId)
            if (confirmResponse?.success) {
              if (!cancelled) {
                navigate('/payment-success', {
                  state: {
                    paymentIntentId: paymentResult.paymentIntentId,
                    courses,
                    totalAmount: courses.reduce((s, c) => s + (c.price || 0), 0),
                    orderId: confirmResponse.orderId,
                  },
                })
              }
              return
            }
            const message = confirmResponse?.message || 'Failed to confirm free checkout'
            if (!cancelled) {
              setRedirecting(false)
              setInitError(message)
              toast.error(message)
              navigate("/")
            }
            return
          } catch (error) {
            const message = getErrorMessage(error, 'Failed to confirm free checkout')
            if (!cancelled) {
              setRedirecting(false)
              setInitError(message)
              toast.error(message)
              navigate("/")
            }
          }
          return
        }
        if (!cancelled) {
          setClientSecret(paymentResult.clientSecret)
          setPaymentIntentId(paymentResult.paymentIntentId)
          setVatAmount(paymentResult?.vatAmount ?? 0)
          setVatRate(paymentResult?.vatRate ?? 0)
        }
      } catch (err) {
        console.error("Error initializing payment:", err)
        const message = getErrorMessage(err, "Failed to initialize payment. Please try again.")
        if (!cancelled) {
          setRedirecting(false)
          setInitError(message)
          toast.error(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [courses, couponCode, billingCountryCode, createPaymentIntent, confirmPayment, navigate])

  return { loading, clientSecret, paymentIntentId, initError, redirecting, vatAmount, vatRate }
}
