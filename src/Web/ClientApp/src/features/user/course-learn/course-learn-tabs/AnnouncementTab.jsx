import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Avatar,
  Typography,
  CircularProgress,
} from "@mui/material";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import useGetAnnouncementsByCourseId from "../../../../hooks/announcement-hooks/useGetAnnouncementsByCourseId";
import { formatTimeAgo } from "../../../../utils/helpers";
import CustomPagination from "../../../../components/pagination/CustomPagination";

function AnnouncementCard({ announcement }) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (announcement.instructorId) {
      navigate(`/profile/${announcement.instructorId}`);
    }
  };

  return (
    <Box
      sx={{
        py: 3.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      {/* Instructor row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Avatar
          src={announcement.instructorAvatar}
          alt={announcement.instructorName}
          onClick={handleProfileClick}
          sx={{ width: 40, height: 40, bgcolor: "brand.main", cursor: "pointer" }}
        >
          {!announcement.instructorAvatar &&
            (announcement.instructorName?.[0] ?? "I")}
        </Avatar>
        <Box>
          <Typography
            onClick={handleProfileClick}
            sx={{
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "brand.dark",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {announcement.instructorName ?? "Instructor"}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
            posted an announcement ·{" "}
            <span>{formatTimeAgo(announcement.sentAt ?? announcement.created)}</span>
          </Typography>
        </Box>
      </Box>

      {/* Subject */}
      <Typography
        variant="body1"
        sx={{ fontWeight: 700, mb: 1.5, color: "text.primary", fontSize: "1rem" }}
      >
        {announcement.subject}
      </Typography>

      {/* Content — rendered as HTML since content is rich text */}
      <Box
        sx={{
          fontSize: "0.9rem",
          lineHeight: 1.7,
          color: "text.secondary",
          "& *": { maxWidth: "100%" },
          "& a": { color: "brand.main" },
        }}
        dangerouslySetInnerHTML={{ __html: announcement.content }}
      />
    </Box>
  );
}

function AnnouncementTab({ courseId }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const { data, isLoading, isError } = useGetAnnouncementsByCourseId(
    courseId,
    page,
    PAGE_SIZE
  );

  const announcements = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <Box>
      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={32} sx={{ color: "brand.main" }} />
        </Box>
      )}

      {/* Error */}
      {isError && (
        <Typography sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
          Failed to load announcements.
        </Typography>
      )}

      {/* Empty */}
      {!isLoading && !isError && announcements.length === 0 && (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <CampaignOutlinedIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
          />
          <Typography sx={{ color: "text.secondary" }}>
            No announcements yet.
          </Typography>
        </Box>
      )}

      {/* List */}
      {!isLoading && !isError && announcements.length > 0 && (
        <>
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}

          {totalPages > 1 && (
            <CustomPagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
            />
          )}
        </>
      )}
    </Box>
  );
}

export default AnnouncementTab;
