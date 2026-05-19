import { useState, useEffect, useCallback, useMemo } from "react"
import { Alert, Box, Button, Card } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { toast } from "react-toastify"
import PageTitle from "../../../components/PageTitle"
import MainCard from "../../../components/instructor-layout/MainCard"
import LoadingSpinner from "../../../components/LoadingSpinner"
import useCouponClient from "../../../hooks/coupon-hooks/useCouponClient"
import useGetCoursesAuthor from "../../../hooks/course-hooks/useGetCoursesAuthor"
import UserFilterDialog from "../../admin/user-section/activity-logs-page/components/UserFilterDialog"
import CouponFiltersToolbar from "./components/CouponFiltersToolbar"
import CouponsTable from "./components/CouponsTable"
import CreateCouponDialog from "./components/CreateCouponDialog"
import { createDefaultCouponForm } from "./couponConstants"
import { cardSx } from "./couponStyles"
import { getStatusValue } from "./couponUtils"

export default function CouponsPage({ isAdmin = false }) {
  const { getCoupons, createCoupon, deactivateCoupon } = useCouponClient()
  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesAuthor("", 0, 1, 100)
  const myCourses = coursesData?.items || []
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(() => createDefaultCouponForm(isAdmin))
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [ownerFilter, setOwnerFilter] = useState(null)
  const [ownerDialogOpen, setOwnerDialogOpen] = useState(false)
  const [codeInput, setCodeInput] = useState("")
  const [codeSearch, setCodeSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState(null)
  const [sortField, setSortField] = useState("created")
  const [sortDir, setSortDir] = useState("desc")

  useEffect(() => {
    const timer = setTimeout(() => setCodeSearch(codeInput), 300)
    return () => clearTimeout(timer)
  }, [codeInput])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCoupons(0, false, ownerFilter?.id ?? null, codeSearch || null, typeFilter)
      setCoupons(data || [])
    } catch {
      toast.error("Failed to load coupons")
    } finally {
      setLoading(false)
    }
  }, [getCoupons, ownerFilter, codeSearch, typeFilter])

  useEffect(() => {
    load()
  }, [load])

  function handleSort(field) {
    if (sortField === field) {
      setSortDir(direction => direction === "asc" ? "desc" : "asc")
      return
    }

    setSortField(field)
    setSortDir("asc")
  }

  const displayCoupons = useMemo(() => {
    return [...coupons].sort((a, b) => {
      let va
      let vb

      switch (sortField) {
        case "code":
          va = a.code
          vb = b.code
          break
        case "name":
          va = a.name
          vb = b.name
          break
        case "owner":
          va = a.ownerFullName ?? ""
          vb = b.ownerFullName ?? ""
          break
        case "type":
          va = a.type
          vb = b.type
          break
        case "discount":
          va = a.discountValue
          vb = b.discountValue
          break
        case "used":
          va = a.redemptionCount
          vb = b.redemptionCount
          break
        case "expires":
          va = new Date(a.expiresAt)
          vb = new Date(b.expiresAt)
          break
        case "status":
          va = getStatusValue(a)
          vb = getStatusValue(b)
          break
        default:
          va = new Date(a.created)
          vb = new Date(b.created)
          break
      }

      if (va < vb) return sortDir === "asc" ? -1 : 1
      if (va > vb) return sortDir === "asc" ? 1 : -1
      return 0
    })
  }, [coupons, sortField, sortDir])

  const closeDialog = () => {
    if (!saving) {
      setDialogOpen(false)
      setForm(createDefaultCouponForm(isAdmin))
      setFormError("")
    }
  }

  const handleCreate = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      setFormError("Code and name are required")
      return
    }

    setSaving(true)
    setFormError("")
    try {
      await createCoupon({
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
      })
      toast.success("Coupon created")
      closeDialog()
      load()
    } catch (err) {
      setFormError(err?.message || "Failed to create coupon")
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (id) => {
    try {
      await deactivateCoupon(id)
      toast.success("Coupon deactivated")
      load()
    } catch {
      toast.error("Failed to deactivate coupon")
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.info(`Copied: ${code}`)
  }

  const openCreateDialog = () => {
    setForm(createDefaultCouponForm(isAdmin))
    setDialogOpen(true)
  }

  return (
    <MainCard>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
        <PageTitle title="Coupons" subtitle="Create and manage discount codes for your courses" />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" }, textTransform: "none", borderRadius: "10px" }}
        >
          Create Coupon
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
          <LoadingSpinner />
        </Box>
      ) : (
        <Card sx={cardSx}>
          <CouponFiltersToolbar
            codeInput={codeInput}
            onCodeInputChange={setCodeInput}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            isAdmin={isAdmin}
            ownerFilter={ownerFilter}
            onClearOwnerFilter={() => setOwnerFilter(null)}
            onOpenOwnerDialog={() => setOwnerDialogOpen(true)}
          />
          {coupons.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>No coupons found.</Alert>
          ) : (
            <CouponsTable
              coupons={displayCoupons}
              isAdmin={isAdmin}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
              onCopyCode={copyCode}
              onDeactivate={handleDeactivate}
            />
          )}
        </Card>
      )}

      <CreateCouponDialog
        open={dialogOpen}
        form={form}
        saving={saving}
        formError={formError}
        isAdmin={isAdmin}
        myCourses={myCourses}
        coursesLoading={coursesLoading}
        onClose={closeDialog}
        onChangeForm={setForm}
        onCreate={handleCreate}
      />

      {isAdmin && (
        <UserFilterDialog
          open={ownerDialogOpen}
          onClose={() => setOwnerDialogOpen(false)}
          onSelectUser={(user) => {
            setOwnerFilter(user)
            setOwnerDialogOpen(false)
          }}
        />
      )}
    </MainCard>
  )
}
