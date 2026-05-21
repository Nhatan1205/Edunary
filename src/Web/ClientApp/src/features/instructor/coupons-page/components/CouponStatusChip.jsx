import { Chip } from "@mui/material"
import { getCouponStatus } from "../couponUtils"

export default function CouponStatusChip({ coupon }) {
  const status = getCouponStatus(coupon)

  if (status === "inactive") return <Chip label="Inactive" size="small" color="default" />
  if (status === "expired") return <Chip label="Expired" size="small" color="error" />
  if (status === "scheduled") return <Chip label="Scheduled" size="small" color="info" />
  return <Chip label="Active" size="small" color="success" />
}
