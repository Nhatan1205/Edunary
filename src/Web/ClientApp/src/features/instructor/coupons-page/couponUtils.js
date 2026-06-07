import { COUPON_TYPES } from "./couponConstants"

export function typeLabel(type) {
  return COUPON_TYPES.find(t => t.value === type)?.label ?? type
}

export function getCouponStatus(coupon) {
  const now = new Date()

  if (!coupon.isActive) return "inactive"
  if (new Date(coupon.expiresAt) < now) return "expired"
  if (new Date(coupon.startsAt) > now) return "scheduled"
  return "active"
}

export function getStatusValue(coupon) {
  const statusOrder = {
    inactive: 0,
    expired: 1,
    scheduled: 2,
    active: 3,
  }

  return statusOrder[getCouponStatus(coupon)]
}

export function getCouponDiscountLabel(coupon) {
  if (coupon.type === 3) return "Free"
  if (coupon.type === 0) return `${coupon.discountValue}%`
  return `$${coupon.discountValue}`
}

export function getDiscountPreviewLabel(form) {
  if (form.type === 3) return "FREE"
  if (form.type === 0) return `${form.discountValue || "0"}% OFF`
  if (form.type === 2) return `$${form.discountValue || "0"}`
  return `-$${form.discountValue || "0"}`
}

export function validateCouponForm(form) {
  const errors = []
  if (!form.code.trim()) errors.push("Code is required")
  if (!form.name.trim()) errors.push("Name is required")

  const type = Number(form.type)
  const discountValue = Number(form.discountValue)
  if (type === 0) {
    if (!discountValue || discountValue < 1 || discountValue > 100)
      errors.push("Percentage discount must be between 1 and 100")
  } else if (type === 1 || type === 2) {
    if (!discountValue || discountValue <= 0)
      errors.push("Discount value must be greater than 0")
  }

  if (Number(form.scopeType) === 0 && (!form.courseId || Number(form.courseId) === 0))
    errors.push("Please select a course")

  const now = new Date()
  const startsAt = form.startsAt ? new Date(form.startsAt) : null
  const expiresAt = form.expiresAt ? new Date(form.expiresAt) : null
  if (!startsAt || isNaN(startsAt.getTime())) errors.push("Start date is required")
  if (!expiresAt || isNaN(expiresAt.getTime())) errors.push("Expiry date is required")
  else if (expiresAt <= now) errors.push("Expiry date must be in the future")
  if (startsAt && expiresAt && !isNaN(startsAt.getTime()) && !isNaN(expiresAt.getTime()) && startsAt >= expiresAt)
    errors.push("Start date must be before expiry date")

  const maxR = Number(form.maxRedemptions)
  const maxRpu = Number(form.maxRedemptionsPerUser)
  if (!maxR || maxR < 1) errors.push("Max redemptions must be at least 1")
  if (!maxRpu || maxRpu < 1) errors.push("Max redemptions per user must be at least 1")
  if (maxR >= 1 && maxRpu >= 1 && maxRpu > maxR)
    errors.push("Max redemptions per user cannot exceed total max redemptions")

  return errors
}

export function buildCouponCommand(form) {
  return {
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    description: form.description.trim(),
    type: form.type,
    discountValue: Number(form.discountValue),
    scopeType: form.scopeType,
    courseId: Number(form.courseId) || 0,
    funderType: form.funderType,
    maxRedemptions: Number(form.maxRedemptions),
    maxRedemptionsPerUser: Number(form.maxRedemptionsPerUser),
    startsAt: new Date(form.startsAt).toISOString(),
    expiresAt: new Date(form.expiresAt).toISOString(),
  }
}
