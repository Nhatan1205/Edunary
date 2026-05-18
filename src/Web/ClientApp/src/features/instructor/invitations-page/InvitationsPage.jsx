import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircleOutline, HighlightOff, MailOutline } from "@mui/icons-material";
import useGetMyInvitations from "../../../hooks/course-collaborator-hooks/useGetMyInvitations";
import useAcceptInvitation from "../../../hooks/course-collaborator-hooks/useAcceptInvitation";
import useDeclineInvitation from "../../../hooks/course-collaborator-hooks/useDeclineInvitation";
import { formatTimeAgo } from "../../../utils/helpers";
import MainCard from "../../../components/instructor-layout/MainCard";
import PageTitle from "../../../components/PageTitle";

const PERMISSION_FLAGS = [
  { flag: 1, label: "Manage" },
  { flag: 2, label: "Q&A" },
  { flag: 4, label: "Assignments" },
  { flag: 8, label: "Visible" },
  { flag: 16, label: "Performance" },
  { flag: 32, label: "Reviews" },
  { flag: 64, label: "Revenue" },
];

function permissionLabels(flags) {
  if (!flags) return [];
  return PERMISSION_FLAGS.filter((p) => (flags & p.flag) !== 0).map((p) => p.label);
}

function InvitationCard({ invitation }) {
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();

  const labels = permissionLabels(invitation.permissions);
  const ago = formatTimeAgo(invitation.invitedAt);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" } }}>
      {/* Course thumbnail strip */}
      {invitation.courseImageUrl && (
        <Box
          component="img"
          src={invitation.courseImageUrl}
          alt={invitation.courseTitle}
          sx={{ width: "100%", height: 120, objectFit: "cover" }}
        />
      )}

      <Box sx={{ p: 2.5 }}>
        {/* Inviter info */}
        <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
          <Avatar src={invitation.ownerAvatarUrl} sx={{ width: 36, height: 36, bgcolor: "brand.main" }}>
            {invitation.ownerName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{invitation.ownerName}</Typography>
            <Typography variant="caption" color="text.secondary">invited you • {ago}</Typography>
          </Box>
        </Stack>

        {/* Course title */}
        <Typography variant="subtitle2" fontWeight={700} mb={1} noWrap>
          {invitation.courseTitle}
        </Typography>

        {/* Permissions */}
        {labels.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.5} mb={2}>
            {labels.map((l) => (
              <Chip key={l} label={l} size="small"
                sx={{ height: 20, fontSize: "0.68rem", bgcolor: "brand.lighter", color: "brand.darker", fontWeight: 600 }} />
            ))}
          </Stack>
        )}

        {invitation.isVisible && (
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            You will be listed as a visible instructor on the course page.
          </Typography>
        )}

        {/* Actions */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={accept.isPending ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <CheckCircleOutline />}
            disabled={accept.isPending || decline.isPending}
            onClick={() => accept.mutate(invitation.collaboratorId)}
            sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" }, textTransform: "none", fontWeight: 600, borderRadius: 1.5 }}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            startIcon={decline.isPending ? <CircularProgress size={14} /> : <HighlightOff />}
            disabled={accept.isPending || decline.isPending}
            onClick={() => decline.mutate(invitation.collaboratorId)}
            sx={{ borderColor: "divider", color: "text.secondary", textTransform: "none", borderRadius: 1.5, "&:hover": { borderColor: "error.main", color: "error.main" } }}
          >
            Decline
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

function InvitationsPage() {
  const { data: invitations, isLoading } = useGetMyInvitations();

  return (
    <MainCard>
      <PageTitle title="Collaboration Invitations" />
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Instructors who want you to collaborate on their courses will appear here.
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Paper key={i} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Skeleton variant="rectangular" height={120} />
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1.5} mb={1.5}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box flex={1}><Skeleton width="60%" /><Skeleton width="40%" height={12} /></Box>
                </Stack>
                <Skeleton width="80%" height={20} sx={{ mb: 1 }} />
                <Skeleton width="50%" height={14} sx={{ mb: 2 }} />
                <Skeleton height={36} />
              </Box>
            </Paper>
          ))}
        </Box>
      ) : invitations?.length ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
          {invitations.map((inv) => (
            <InvitationCard key={inv.collaboratorId} invitation={inv} />
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <MailOutline sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" fontWeight={600} color="text.secondary">No pending invitations</Typography>
          <Typography variant="body2" color="text.disabled" mt={1}>
            When an instructor invites you to collaborate, it will appear here.
          </Typography>
        </Box>
      )}
    </MainCard>
  );
}

export default InvitationsPage;
