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
