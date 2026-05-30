import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Container } from "reactstrap";
import AlertBox from "../../../../../components/AlertBox";
import {
  Add,
  Close,
  Delete,
  Edit,
  EmailOutlined,
  PersonAddAlt1,
  Star,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import useGetCollaborators from "../../../../../hooks/course-collaborator-hooks/useGetCollaborators";
import useInviteCollaborator from "../../../../../hooks/course-collaborator-hooks/useInviteCollaborator";
import useUpdateCollaborator from "../../../../../hooks/course-collaborator-hooks/useUpdateCollaborator";
import useRemoveCollaborator from "../../../../../hooks/course-collaborator-hooks/useRemoveCollaborator";
import ConfirmDialog from "../../../../../components/ConfirmDialogPopup/ConfirmDialog";
import { CollaboratorInviteStatus } from "../../../../../web-api-client.ts";

// Permission flags matching backend enum
const PERMISSIONS = [
  { flag: 1, label: "View Access" },       // Can view course in dashboard (read-only)
  { flag: 2, label: "Manage Content" },    // Can edit course details, curriculum
  { flag: 4, label: "Performance" },       // Can view enrollment & revenue stats
  { flag: 8, label: "Q&A" },              // Can answer student questions
  { flag: 16, label: "Review Assignments" }, // Can review student assignments
  { flag: 32, label: "Reviews" },          // Can respond to course reviews
  { flag: 64, label: "Revenue Report" },   // Can view revenue reports
];

function permissionLabels(flags) {
  if (!flags) return ["No permissions"];
  return PERMISSIONS.filter((p) => (flags & p.flag) !== 0).map((p) => p.label);
}

// Pending and accepted collaborators reserve share capacity; declined rows do not.
function sumCollaboratorShare(collaborators, excludeId = null) {
  return (collaborators ?? [])
    .filter((c) => !c.isOwner && c.inviteStatus !== CollaboratorInviteStatus.Declined && c.id !== excludeId)
    .reduce((sum, c) => sum + (c.revenueSharePercent ?? 0), 0);
}

function CollaboratorSkeleton() {
  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1.5 }}>
      <Skeleton variant="circular" width={44} height={44} />
      <Box flex={1}>
        <Skeleton width={160} height={18} />
        <Skeleton width={120} height={14} />
      </Box>
      <Skeleton width={80} height={30} sx={{ borderRadius: 2 }} />
    </Stack>
  );
}

function InviteDialog({ open, onClose, courseId, collaborators }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { email: "", permissions: 3, isVisible: true, revenueSharePercent: 0 },
  });
  const invite = useInviteCollaborator(courseId);

  const [selectedFlags, setSelectedFlags] = useState(3); // View(1) always on by default

  // View Access (flag=1) is always required and cannot be removed
  const toggleFlag = (flag) => {
    if (flag === 1) return; // View is locked
    setSelectedFlags((prev) => prev ^ flag);
  };

  const onSubmit = (data) => {
    invite.mutate(
      { email: data.email, permissions: selectedFlags, isVisible: data.isVisible, revenueSharePercent: data.revenueSharePercent },
      {
        onSuccess: () => {
          reset();
          setSelectedFlags(3);
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonAddAlt1 sx={{ color: "brand.main" }} />
            <Typography fontWeight={700}>Invite Collaborator</Typography>
          </Stack>
          <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Controller
            name="email"
            control={control}
            rules={{ required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email address"
                size="small"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "brand.main" },
                    "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "2px" },
                  },
                }}
              />
            )}
          />

          <Box>
            <Typography variant="body2" fontWeight={600} mb={1}>Permissions</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {PERMISSIONS.map((p) => {
                const active = (selectedFlags & p.flag) !== 0;
                const isLocked = p.flag === 1; // View Access is always on
                return (
                  <Chip
                    key={p.flag}
                    label={p.label}
                    size="small"
                    onClick={() => toggleFlag(p.flag)}
                    variant={active ? "filled" : "outlined"}
                    sx={{
                      cursor: isLocked ? "default" : "pointer",
                      bgcolor: active ? "brand.main" : "transparent",
                      color: active ? "#fff" : "text.secondary",
                      borderColor: active ? "brand.main" : "divider",
                      fontWeight: active ? 600 : 400,
                      opacity: isLocked ? 0.75 : 1,
                      "&:hover": { bgcolor: isLocked ? "brand.main" : active ? "brand.dark" : "brand.lighter", borderColor: "brand.main" },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Controller
              name="isVisible"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} size="small" sx={{ "& .MuiSwitch-thumb": { bgcolor: field.value ? "brand.main" : undefined } }} />}
                  label={<Typography variant="body2">Show on course page</Typography>}
                />
              )}
            />

            <Controller
              name="revenueSharePercent"
              control={control}
              // Chặn vượt 100%: phần đã chia (Pending+Accepted, trừ owner) + giá trị mới
              rules={{
                min: { value: 0, message: "Must be ≥ 0" },
                validate: (v) => {
                  const remaining = 100 - sumCollaboratorShare(collaborators);
                  return Number(v) <= remaining || `Exceeds limit — only ${remaining}% left to share`;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Revenue share %"
                  type="number"
                  size="small"
                  sx={{ width: 180 }}
                  error={!!errors.revenueSharePercent}
                  helperText={errors.revenueSharePercent?.message}
                  inputProps={{ min: 0, max: 100, step: 1 }}
                />
              )}
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} size="small" sx={{ color: "text.secondary" }}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          size="small"
          disabled={invite.isPending}
          startIcon={invite.isPending ? <CircularProgress size={14} /> : <PersonAddAlt1 />}
          sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" }, textTransform: "none" }}
        >
          Send Invitation
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EditCollaboratorDialog({ open, onClose, collaborator, courseId, collaborators }) {
  const [selectedFlags, setSelectedFlags] = useState((collaborator?.permissions ?? 0) | 1); // ensure View(1) always on
  const [isVisible, setIsVisible] = useState(collaborator?.isVisible ?? true);
  const [revenueShare, setRevenueShare] = useState(collaborator?.revenueSharePercent ?? 0);
  const update = useUpdateCollaborator(courseId);

  // % còn lại được phép chia (loại trừ chính collaborator đang sửa)
  const remainingShare = 100 - sumCollaboratorShare(collaborators, collaborator?.id);
  const shareError = revenueShare < 0 || revenueShare > remainingShare;
  const shareHelperText = revenueShare < 0
    ? "Must be >= 0"
    : shareError
      ? `Exceeds limit - only ${remainingShare}% left to share`
      : "";

  // View Access (flag=1) is always required and cannot be removed
  const toggleFlag = (flag) => {
    if (flag === 1) return;
    setSelectedFlags((prev) => prev ^ flag);
  };

  const handleSave = () => {
    // Không submit khi tổng % vượt 100
    if (shareError) return;
    update.mutate(
      { collaboratorId: collaborator.id, permissions: selectedFlags, isVisible, revenueSharePercent: revenueShare },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar src={collaborator?.avatarUrl} sx={{ width: 34, height: 34, bgcolor: "brand.main" }}>
              {collaborator?.fullName?.[0]}
            </Avatar>
            <Box>
              <Typography fontWeight={700} fontSize="0.95rem">{collaborator?.fullName}</Typography>
              <Typography variant="caption" color="text.secondary">{collaborator?.email}</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="body2" fontWeight={600} mb={1}>Permissions</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {PERMISSIONS.map((p) => {
                const active = (selectedFlags & p.flag) !== 0;
                const isLocked = p.flag === 1; // View Access is always on
                return (
                  <Chip key={p.flag} label={p.label} size="small" onClick={() => toggleFlag(p.flag)}
                    variant={active ? "filled" : "outlined"}
                    sx={{
                      cursor: isLocked ? "default" : "pointer",
                      bgcolor: active ? "brand.main" : "transparent",
                      color: active ? "#fff" : "text.secondary",
                      borderColor: active ? "brand.main" : "divider",
                      fontWeight: active ? 600 : 400,
                      opacity: isLocked ? 0.75 : 1,
                      "&:hover": { bgcolor: isLocked ? "brand.main" : active ? "brand.dark" : "brand.lighter", borderColor: "brand.main" },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={<Switch checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} size="small" />}
              label={<Typography variant="body2">Show on course page</Typography>}
            />
            <TextField
              label="Revenue share %"
              type="number"
              size="small"
              value={revenueShare}
              onChange={(e) => setRevenueShare(Number(e.target.value))}
              error={shareError}
              helperText={shareHelperText}
              sx={{ width: 180 }}
              inputProps={{ min: 0, max: 100, step: 1 }}
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} size="small" sx={{ color: "text.secondary" }}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" size="small"
          disabled={update.isPending || shareError}
          startIcon={update.isPending ? <CircularProgress size={14} /> : <Edit />}
          sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" }, textTransform: "none" }}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CollaboratorRow({ collab, courseId, isOwner, collaborators }) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeId, setRemoveId] = useState(null);
  const remove = useRemoveCollaborator(courseId);

  const statusColor = {
    [CollaboratorInviteStatus.Pending]: { bg: "warning.lighter", text: "warning.darker", label: "Pending" },
    [CollaboratorInviteStatus.Accepted]: { bg: "success.lighter", text: "success.darker", label: "Accepted" },
    [CollaboratorInviteStatus.Declined]: { bg: "error.lighter", text: "error.main", label: "Declined" },
  }[collab.inviteStatus] ?? { bg: "grey.100", text: "text.secondary", label: "Unknown" };

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={2}
        sx={{ py: 1.5, px: 1, borderRadius: 2, "&:hover": { bgcolor: "background.muted" }, transition: "background 0.15s" }}>
        <Avatar src={collab.avatarUrl} sx={{ width: 44, height: 44, bgcolor: "brand.main", fontWeight: 700 }}>
          {collab.fullName?.[0]}
        </Avatar>

        <Box flex={1} minWidth={0}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" fontWeight={600} noWrap>{collab.fullName}</Typography>
            {collab.isOwner && (
              <Chip icon={<Star sx={{ fontSize: 12 }} />} label="Owner" size="small"
                sx={{ height: 20, fontSize: "0.7rem", bgcolor: "brand.lighter", color: "brand.darker", fontWeight: 600 }} />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" noWrap>{collab.email}</Typography>
          {!collab.isOwner && (
            <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
              {permissionLabels(collab.permissions).map((label) => (
                <Chip key={label} label={label} size="small"
                  sx={{ height: 18, fontSize: "0.65rem", bgcolor: "background.alt", color: "text.secondary" }} />
              ))}
            </Stack>
          )}
        </Box>

        {!collab.isOwner && (
          <Chip label={statusColor.label} size="small"
            sx={{ bgcolor: statusColor.bg, color: statusColor.text, fontWeight: 600, fontSize: "0.72rem" }} />
        )}

        {!collab.isOwner && isOwner && (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit permissions">
              <IconButton size="small" onClick={() => setEditOpen(true)}
                sx={{ color: "text.secondary", "&:hover": { color: "brand.main", bgcolor: "brand.lighter" } }}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove collaborator">
              <IconButton size="small" onClick={() => setRemoveId(collab.id)}
                sx={{ color: "text.secondary", "&:hover": { color: "error.main", bgcolor: "error.lighter" } }}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      {editOpen && (
        <EditCollaboratorDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          collaborator={collab}
          courseId={courseId}
          collaborators={collaborators}
        />
      )}

      <ConfirmDialog
        open={removeId !== null}
        title="Remove Collaborator"
        message={`Remove "${collab.fullName}" from this course?`}
        onClose={() => setRemoveId(null)}
        onConfirm={() => remove.mutate(removeId, { onSuccess: () => setRemoveId(null) })}
      />
    </>
  );
}

function CourseAccessiblity() {
  const { courseId } = useParams();
  const id = Number(courseId);
  const { data: collaborators, isLoading } = useGetCollaborators(id);
  const [inviteOpen, setInviteOpen] = useState(false);
  const currentUserIsOwner = collaborators?.find((c) => c.isOwner)?.isOwner ?? false;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.75,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 22,
              borderRadius: "4px",
              background: "linear-gradient(180deg, #3FCCB2 0%, #49BBBD 100%)",
              flexShrink: 0,
            }}
          />
          <Typography variant="h5" fontWeight={600}>
            Collaborators
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setInviteOpen(true)}
          sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" }, textTransform: "none", borderRadius: 2, fontWeight: 600 }}
        >
          Invite Collaborator
        </Button>
      </Box>
      <Divider />

      <Container className="py-2">
        <AlertBox severity="info" sx={{ mb: 3 }}>
          Invite co-instructors or teaching assistants to collaborate on this course. You can assign specific permissions like managing content, answering Q&As, or reviewing assignments.
        </AlertBox>

      {/* Collaborator list */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: "background.alt", borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
            {isLoading ? "Loading..." : `${collaborators?.length ?? 0} member${(collaborators?.length ?? 0) !== 1 ? "s" : ""}`}
          </Typography>
        </Box>

        <Box sx={{ px: 2 }}>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <CollaboratorSkeleton key={i} />)
            : collaborators?.length
              ? collaborators.map((c, i) => (
                  <Box key={c.id ?? c.userId}>
                    <CollaboratorRow collab={c} courseId={id} isOwner={currentUserIsOwner} collaborators={collaborators} />
                    {i < collaborators.length - 1 && <Divider />}
                  </Box>
                ))
              : (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <PersonAddAlt1 sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">No collaborators yet. Invite someone to get started.</Typography>
                </Box>
              )}
        </Box>
      </Paper>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} courseId={id} collaborators={collaborators} />
      </Container>
    </>
  );
}

export default CourseAccessiblity;
