import { useCallback, useEffect, useState } from "react"
import { Alert, Box, Button, Card, TablePagination } from "@mui/material"
import { useQueryClient } from "@tanstack/react-query"
import AddIcon from "@mui/icons-material/Add"
import { toast } from "react-toastify"
import PageTitle from "../../../components/PageTitle"
import MainCard from "../../../components/instructor-layout/MainCard"
import LoadingSpinner from "../../../components/LoadingSpinner"
import useCouponClient from "../../../hooks/coupon-hooks/useCouponClient"
import useGetCoupons from "../../../hooks/coupon-hooks/useGetCoupons"
import useGetCoursesAuthor from "../../../hooks/course-hooks/useGetCoursesAuthor"
import UserFilterDialog from "../../admin/user-section/activity-logs-page/components/UserFilterDialog"
import CouponFiltersToolbar from "./components/CouponFiltersToolbar"
import CouponsTable from "./components/CouponsTable"
import CreateCouponDialog from "./components/CreateCouponDialog"
import { createDefaultCouponForm } from "./couponConstants"
import { cardSx, couponPaginationSx } from "./couponStyles"

const adminPageContainerSx = {
  px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" },
}

export default function CouponsPage({ isAdmin = false }) {
  const queryClient = useQueryClient()
  const { createCoupon, deactivateCoupon } = useCouponClient()
  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesAuthor("", 0, 1, 100)
  const myCourses = coursesData?.items || []
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
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

  useEffect(() => {
    setPage(0)
  }, [codeSearch, typeFilter, ownerFilter?.id])

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetCoupons({
    courseId: 0,
    activeOnly: false,
    ownerUserId: ownerFilter?.id ?? null,
    code: codeSearch || null,
    typeFilter,
    pageNumber: page + 1,
    pageSize: rowsPerPage,
    sortField,
    sortDir,
  })

  const coupons = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 0
  const isInitialLoading = isLoading && !data
  const safePage = totalPages > 0 ? Math.min(page, totalPages - 1) : 0

  useEffect(() => {
    if (isLoading || isFetching) {
      return
    }

    if (totalPages === 0 && page !== 0) {
      setPage(0)
      return
    }

    if (totalPages > 0 && page >= totalPages) {
      setPage(totalPages - 1)
    }
  }, [isFetching, isLoading, page, totalPages])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(direction => direction === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }

    setPage(0)
  }

  const closeDialog = () => {
    if (saving) {
      return
    }

    setDialogOpen(false)
    setForm(createDefaultCouponForm(isAdmin))
    setFormError("")
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
      setPage(0)
      void queryClient.invalidateQueries({ queryKey: ["coupons"] })
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
      void queryClient.invalidateQueries({ queryKey: ["coupons"] })
    } catch {
      toast.error("Failed to deactivate coupon")
    }
  }

  const copyCode = useCallback((code) => {
    navigator.clipboard.writeText(code)
    toast.info(`Copied: ${code}`)
  }, [])

  const openCreateDialog = () => {
    setForm(createDefaultCouponForm(isAdmin))
    setDialogOpen(true)
  }

  const showErrorAlert = isError
  const showEmptyState = !showErrorAlert && totalCount === 0

  return (
    <Box sx={isAdmin ? adminPageContainerSx : undefined}>
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

        {isInitialLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
            <LoadingSpinner />
          </Box>
        ) : (
          <Card sx={cardSx}>
            {showErrorAlert && (
              <Alert severity="error" sx={{ m: 2 }}>
                {error?.message || "Failed to load coupons"}
              </Alert>
            )}

            <CouponFiltersToolbar
              codeInput={codeInput}
              onCodeInputChange={setCodeInput}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              isAdmin={isAdmin}
              ownerFilter={ownerFilter}
              onClearOwnerFilter={() => setOwnerFilter(null)}
              onOpenOwnerDialog={() => setOwnerDialogOpen(true)}
              onRefresh={refetch}
              isRefreshing={isFetching && !isInitialLoading}
            />

            {showEmptyState ? (
              <Alert severity="info" sx={{ m: 2 }}>
                No coupons found.
              </Alert>
            ) : (
              <CouponsTable
                coupons={coupons}
                isAdmin={isAdmin}
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
                onCopyCode={copyCode}
                onDeactivate={handleDeactivate}
              />
            )}

            {totalCount > 0 && (
              <TablePagination
                component="div"
                page={safePage}
                count={totalCount}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10))
                  setPage(0)
                }}
                sx={couponPaginationSx}
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
              setPage(0)
            }}
          />
        )}
      </MainCard>
    </Box>
  )
}
