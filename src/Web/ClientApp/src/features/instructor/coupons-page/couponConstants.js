export const COUPON_TYPES = [
  { value: 0, label: "Percentage" },
  { value: 1, label: "Fixed Amount" },
  { value: 2, label: "Custom Price" },
  { value: 3, label: "Free" },
]

export function createDefaultCouponForm(isAdmin = false) {
  return {
    code: "",
    name: "",
    description: "",
    type: 0,
    discountValue: "",
    scopeType: 0,
    courseId: 0,
    funderType: isAdmin ? 1 : 0,
    maxRedemptions: 100,
    maxRedemptionsPerUser: 1,
    startsAt: new Date().toISOString().slice(0, 16),
    expiresAt: new Date(Date.now() + 31 * 86400000).toISOString().slice(0, 16),
  }
}
