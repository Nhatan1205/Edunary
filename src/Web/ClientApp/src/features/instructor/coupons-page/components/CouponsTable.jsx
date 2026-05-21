import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material"
import BlockIcon from "@mui/icons-material/Block"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import CouponStatusChip from "./CouponStatusChip"
import { getCouponDiscountLabel, typeLabel } from "../couponUtils"

export default function CouponsTable({
  coupons,
  isAdmin,
  sortField,
  sortDir,
  onSort,
  onCopyCode,
  onDeactivate,
}) {
  const sortProps = (field) => ({
    sortDirection: sortField === field ? sortDir : false,
    label: {
      active: sortField === field,
      direction: sortField === field ? sortDir : "asc",
      onClick: () => onSort(field),
    },
  })

  return (
    <TableContainer sx={{ maxHeight: 500, overflow: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sortDirection={sortProps("code").sortDirection}>
              <TableSortLabel {...sortProps("code").label}>Code</TableSortLabel>
            </TableCell>
            <TableCell sortDirection={sortProps("name").sortDirection}>
              <TableSortLabel {...sortProps("name").label}>Name</TableSortLabel>
            </TableCell>
            {isAdmin && (
              <TableCell sortDirection={sortProps("owner").sortDirection}>
                <TableSortLabel {...sortProps("owner").label}>Owner</TableSortLabel>
              </TableCell>
            )}
            <TableCell sortDirection={sortProps("type").sortDirection}>
              <TableSortLabel {...sortProps("type").label}>Type</TableSortLabel>
            </TableCell>
            <TableCell sortDirection={sortProps("discount").sortDirection}>
              <TableSortLabel {...sortProps("discount").label}>Discount</TableSortLabel>
            </TableCell>
            <TableCell sortDirection={sortProps("used").sortDirection}>
              <TableSortLabel {...sortProps("used").label}>Used / Max</TableSortLabel>
            </TableCell>
            <TableCell sortDirection={sortProps("expires").sortDirection}>
              <TableSortLabel {...sortProps("expires").label}>Expires</TableSortLabel>
            </TableCell>
            <TableCell sortDirection={sortProps("status").sortDirection}>
              <TableSortLabel {...sortProps("status").label}>Status</TableSortLabel>
            </TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id} hover>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                    {coupon.code}
                  </Typography>
                  <Tooltip title="Copy code">
                    <IconButton size="small" onClick={() => onCopyCode(coupon.code)}>
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{coupon.name}</Typography>
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {coupon.ownerFullName || coupon.ownerEmail || coupon.ownerUserId}
                  </Typography>
                  {coupon.ownerEmail && coupon.ownerFullName && (
                    <Typography variant="caption" color="text.secondary">
                      {coupon.ownerEmail}
                    </Typography>
                  )}
                </TableCell>
              )}
              <TableCell>
                <Typography variant="body2">{typeLabel(coupon.type)}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{getCouponDiscountLabel(coupon)}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {coupon.redemptionCount} / {coupon.maxRedemptions}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(coupon.expiresAt).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <CouponStatusChip coupon={coupon} />
              </TableCell>
              <TableCell align="right">
                {coupon.isActive && (
                  <Tooltip title="Deactivate">
                    <IconButton size="small" color="error" onClick={() => onDeactivate(coupon.id)}>
                      <BlockIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
