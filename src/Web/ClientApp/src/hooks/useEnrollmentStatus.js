import { useState, useEffect, useCallback } from 'react'
import { EnrollmentClient } from '../web-api-client.ts'
import { useAuth } from '../context/AuthContext'

export const useEnrollmentStatus = (courseId) => {
  const { isAuthenticated } = useAuth()
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkEnrollment = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const enrollmentsClient = new EnrollmentClient()
      const response = await enrollmentsClient.checkEnrollment(courseId)
      setIsEnrolled(response.isEnrolled || false)
    } catch (err) {
      console.error('Error checking enrollment:', err)
      setError(err)
      setIsEnrolled(false)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    if (isAuthenticated && courseId) {
      checkEnrollment()
    } else {
      // Reset state when not authenticated
      setIsEnrolled(false)
      setLoading(false)
      setError(null)
    }
  }, [isAuthenticated, courseId, checkEnrollment])

  return {
    isEnrolled,
    loading,
    error,
    refetch: checkEnrollment
  }
}