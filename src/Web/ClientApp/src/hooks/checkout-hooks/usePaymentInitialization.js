import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { toast } from "react-toastify"
import usePaymentClient from "./usePaymentClient"

export default function usePaymentInitialization(courses = []) {
  const navigate = useNavigate()
  const { createPaymentIntent, confirmPayment } = usePaymentClient()

  const [loading, setLoading] = useState(true)
  const [clientSecret, setClientSecret] = useState("")
  const [paymentIntentId, setPaymentIntentId] = useState("")
  const [initError, setInitError] = useState("")
  const [redirecting, setRedirecting] = useState(false)

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

        const response = await createPaymentIntent({ courseIds })
        if (!response?.result) {
          if (!cancelled) {
            toast.error(response?.message)
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
          // confirmation failed; stop redirecting and show error
          if (!cancelled) {
            setRedirecting(false)
            toast.error(confirmResponse?.message || 'Failed to confirm free checkout')
            navigate("/")
          }
          return
        }
        if (!cancelled) {
          setClientSecret(paymentResult.clientSecret)
          setPaymentIntentId(paymentResult.paymentIntentId)
        }
      } catch (err) {
        console.error("Error initializing payment:", err)
        if (!cancelled) {
          toast.error("Failed to initialize payment. Please try again.")
          setInitError("Failed to initialize payment. Please try again.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [courses, createPaymentIntent, confirmPayment, navigate])

  return { loading, clientSecret, paymentIntentId, initError, redirecting }
}
