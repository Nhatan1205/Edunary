import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import AllInclusiveIcon from "@mui/icons-material/AllInclusive"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import BusinessIcon from "@mui/icons-material/Business"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import CloseIcon from "@mui/icons-material/Close"
import GroupIcon from "@mui/icons-material/Group"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined"
import LocalOfferIcon from "@mui/icons-material/LocalOffer"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import NotesIcon from "@mui/icons-material/Notes"
import PeopleIcon from "@mui/icons-material/People"
import PercentIcon from "@mui/icons-material/Percent"
import PersonIcon from "@mui/icons-material/Person"
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline"
import PublicIcon from "@mui/icons-material/Public"
import SchoolIcon from "@mui/icons-material/School"
import SellIcon from "@mui/icons-material/Sell"
import SpeedIcon from "@mui/icons-material/Speed"
import TagIcon from "@mui/icons-material/Tag"
import TimerOffIcon from "@mui/icons-material/TimerOff"
import TuneIcon from "@mui/icons-material/Tune"
import DefaultSelect from "../../../../components/drop-down/DefaultSelect"
import { COUPON_TYPES } from "../couponConstants"
import { fieldSx } from "../couponStyles"
import { getDiscountPreviewLabel } from "../couponUtils"
import SectionHeader from "./SectionHeader"

export default function CreateCouponDialog({
  open,
  form,
  saving,
  formError,
  isAdmin,
  myCourses,
  coursesLoading,
  onClose,
  onChangeForm,
  onCreate,
}) {
  const discountPreviewLabel = getDiscountPreviewLabel(form)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          boxShadow: "0px 8px 16px -4px rgba(16,24,40,0.12), 0px 20px 40px -8px rgba(16,24,40,0.10)",
          overflow: "hidden",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box sx={{
        px: 3,
        py: 2.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexShrink: 0,
        bgcolor: "background.paper",
      }}>
        <Box sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: "brand.lighter",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <LocalOfferIcon sx={{ color: "brand.dark", fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.3 }}>
            Create New Coupon
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Set up a discount code for your courses
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={saving}
          sx={{ color: "#9CA3AF", borderRadius: "8px", "&:hover": { bgcolor: "#F3F4F6", color: "#374151" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <SectionHeader
              icon={<InfoOutlinedIcon sx={{ fontSize: 14, color: "brand.main" }} />}
              label="Basic Information"
            />
            <Stack spacing={2}>
              <TextField
                label="Coupon Code"
                size="small"
                value={form.code}
                onChange={(event) => onChangeForm(current => ({ ...current, code: event.target.value.toUpperCase().slice(0, 15) }))}
                helperText={`${form.code.length}/15 - Uppercase letters, numbers, underscores`}
                required
                fullWidth
                slotProps={{
                  input: {
                    maxLength: 15,
                    startAdornment: (
                      <InputAdornment position="start">
                        <TagIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                    style: { fontFamily: "monospace", fontWeight: 700, letterSpacing: 2 },
                  },
                }}
                sx={fieldSx}
              />
              <TextField
                label="Name"
                size="small"
                value={form.name}
                onChange={(event) => onChangeForm(current => ({ ...current, name: event.target.value }))}
                required
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LabelOutlinedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={fieldSx}
              />
              <TextField
                label="Description"
                size="small"
                value={form.description}
                onChange={(event) => onChangeForm(current => ({ ...current, description: event.target.value }))}
                multiline
                rows={2}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: "9px" }}>
                        <NotesIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={fieldSx}
              />
            </Stack>
          </Box>

          <Box>
            <SectionHeader
              icon={<SellIcon sx={{ fontSize: 14, color: "brand.main" }} />}
              label="Discount"
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: 1.5,
              }}
            >
              <Box sx={{ maxWidth: 230, flexShrink: 0 }}>
                <DefaultSelect
                  data={COUPON_TYPES}
                  value={COUPON_TYPES.filter((item) => item.value === form.type)}
                  defaultLabel="Select type"
                  onChange={(selected) => {
                    const nextType = selected[0]?.value
                    if (nextType !== undefined) {
                      onChangeForm(current => ({ ...current, type: nextType }))
                    }
                  }}
                />
              </Box>
            </Box>

            {form.type !== 3 && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  label={form.type === 0 ? "Discount Percentage" : form.type === 2 ? "Custom Price" : "Discount Amount"}
                  size="small"
                  type="number"
                  value={form.discountValue}
                  onChange={(event) => onChangeForm(current => ({ ...current, discountValue: event.target.value }))}
                  inputProps={{ min: 0, max: form.type === 0 ? 100 : undefined, step: "0.01" }}
                  required
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          {form.type === 0
                            ? <PercentIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                            : <AttachMoneyIcon sx={{ fontSize: 16, color: "text.disabled" }} />}
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={fieldSx}
                />
              </Box>
            )}
          </Box>

          <Box>
            <SectionHeader
              icon={<TuneIcon sx={{ fontSize: 14, color: "brand.main" }} />}
              label="Scope & Funding"
            />
            <Stack spacing={2}>
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>Scope</InputLabel>
                <Select
                  value={form.scopeType}
                  label="Scope"
                  onChange={(event) => onChangeForm(current => ({ ...current, scopeType: event.target.value }))}
                >
                  <MenuItem value={0}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <MenuBookIcon sx={{ fontSize: 17, color: "text.secondary" }} />
                      <span>Specific Course</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <AllInclusiveIcon sx={{ fontSize: 17, color: "text.secondary" }} />
                      <span>All My Courses</span>
                    </Box>
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem value={2}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <PublicIcon sx={{ fontSize: 17, color: "text.secondary" }} />
                        <span>Platform (Admin only)</span>
                      </Box>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

              {form.scopeType === 0 && (
                <FormControl fullWidth size="small" required sx={fieldSx}>
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={form.courseId || ""}
                    label="Course"
                    onChange={(event) => onChangeForm(current => ({ ...current, courseId: event.target.value }))}
                    disabled={coursesLoading}
                    endAdornment={coursesLoading ? (
                      <InputAdornment position="end" sx={{ mr: 2 }}>
                        <CircularProgress size={14} />
                      </InputAdornment>
                    ) : null}
                  >
                    {myCourses.length === 0 && !coursesLoading ? (
                      <MenuItem disabled value="">
                        <Typography variant="body2" color="text.secondary">No courses found</Typography>
                      </MenuItem>
                    ) : (
                      myCourses.map(course => (
                        <MenuItem key={course.id} value={course.id}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.25 }}>
                            <SchoolIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                                {course.title}
                              </Typography>
                              <Typography variant="caption" color="text.disabled">
                                ID: {course.id}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  <FormHelperText>Select the course this coupon applies to</FormHelperText>
                </FormControl>
              )}

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 1 }}>
                  Funded by
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  {[
                    ...(isAdmin
                      ? [{ value: 1, label: "Platform", sublabel: "Platform: 63% / Instructor: 37%", icon: <BusinessIcon sx={{ fontSize: 20 }} /> }]
                      : [{ value: 0, label: "Instructor", sublabel: "Instructor: 97% / Platform: 3%", icon: <PeopleIcon sx={{ fontSize: 20 }} /> }]
                    ),
                  ].map(({ value, label, sublabel, icon }) => {
                    const selected = form.funderType === value

                    return (
                      <Paper
                        key={value}
                        variant="outlined"
                        onClick={() => onChangeForm(current => ({ ...current, funderType: value }))}
                        sx={{
                          flex: 1,
                          p: 1.5,
                          cursor: "pointer",
                          borderRadius: "12px",
                          borderWidth: 2,
                          borderColor: selected ? "brand.main" : "divider",
                          bgcolor: selected ? "brand.lighter" : "background.paper",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 0.5,
                          transition: "all 0.15s ease",
                          "&:hover": {
                            borderColor: selected ? "brand.main" : "brand.light",
                            bgcolor: selected ? "brand.lighter" : "grey.50",
                          },
                        }}
                      >
                        <Box sx={{ color: selected ? "brand.main" : "text.secondary" }}>{icon}</Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: selected ? "brand.dark" : "text.primary" }}>
                          {label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", lineHeight: 1.3 }}>
                          {sublabel}
                        </Typography>
                      </Paper>
                    )
                  })}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Box sx={{
          width: 300,
          flexShrink: 0,
          bgcolor: "grey.50",
          borderLeft: "1px solid",
          borderColor: "divider",
          px: 2.5,
          py: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          overflowY: "auto",
        }}>
          <Box>
            <Typography variant="caption" sx={{
              display: "block",
              mb: 1.5,
              color: "text.secondary",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}>
              Preview
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                borderStyle: "dashed",
                borderColor: "brand.light",
                borderWidth: 2,
                borderRadius: "16px",
                p: 2.5,
                bgcolor: "#fff",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: -12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  bgcolor: "grey.50",
                  border: "2px dashed",
                  borderColor: "brand.light",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  right: -12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  bgcolor: "grey.50",
                  border: "2px dashed",
                  borderColor: "brand.light",
                },
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "center", textAlign: "center" }}>
                <Box sx={{
                  bgcolor: "brand.main",
                  color: "#fff",
                  px: 2,
                  py: 0.75,
                  borderRadius: "8px",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  letterSpacing: 0.5,
                }}>
                  {discountPreviewLabel}
                </Box>
                <Typography sx={{
                  fontFamily: "monospace",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: form.code ? "brand.dark" : "text.disabled",
                  letterSpacing: 2,
                  lineHeight: 1.2,
                }}>
                  {form.code || "YOUR-CODE"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {form.name || "Coupon name appears here"}
                </Typography>
                <Typography variant="caption" sx={{
                  color: "text.disabled",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}>
                  {COUPON_TYPES.find(type => type.value === form.type)?.label}
                </Typography>
              </Box>
            </Paper>
          </Box>

          <Box>
            <SectionHeader
              icon={<SpeedIcon sx={{ fontSize: 14, color: "brand.main" }} />}
              label="Usage Limits"
            />
            <Stack spacing={2}>
              <TextField
                label="Max Redemptions"
                size="small"
                type="number"
                value={form.maxRedemptions}
                onChange={(event) => onChangeForm(current => ({ ...current, maxRedemptions: event.target.value }))}
                inputProps={{ min: 1 }}
                fullWidth
                helperText="Total uses allowed"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={fieldSx}
              />
              <TextField
                label="Max Per User"
                size="small"
                type="number"
                value={form.maxRedemptionsPerUser}
                onChange={(event) => onChangeForm(current => ({ ...current, maxRedemptionsPerUser: event.target.value }))}
                inputProps={{ min: 1 }}
                fullWidth
                helperText="Per-user limit"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={fieldSx}
              />
            </Stack>
          </Box>

          <Box>
            <SectionHeader
              icon={<CalendarMonthIcon sx={{ fontSize: 14, color: "brand.main" }} />}
              label="Schedule"
            />
            <Stack spacing={2}>
              <TextField
                label="Starts At"
                size="small"
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => onChangeForm(current => ({ ...current, startsAt: event.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PlayCircleOutlineIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={fieldSx}
              />
              <TextField
                label="Expires At"
                size="small"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(event) => onChangeForm(current => ({ ...current, expiresAt: event.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <TimerOffIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={fieldSx}
              />
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box sx={{
        px: 3,
        py: 2,
        borderTop: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        bgcolor: "background.paper",
        gap: 2,
      }}>
        <Box sx={{ flex: 1 }}>
          {formError && (
            <Alert severity="error" sx={{ borderRadius: "10px", py: 0.5 }}>{formError}</Alert>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
          <Button
            onClick={onClose}
            disabled={saving}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#6B7280",
              borderRadius: "10px",
              px: 2.5,
              "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onCreate}
            disabled={saving}
            startIcon={saving
              ? <CircularProgress size={14} sx={{ color: "inherit" }} />
              : <LocalOfferIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              borderRadius: "10px",
              bgcolor: "brand.main",
              boxShadow: "none",
              "&:hover": { bgcolor: "brand.dark", boxShadow: "none" },
              "&.Mui-disabled": { bgcolor: "#D1D5DB", color: "#9CA3AF" },
            }}
          >
            {saving ? "Creating..." : "Create Coupon"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}
