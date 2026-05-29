import {
  Box,
  Typography,
  useMediaQuery,
  Divider,
  Button,
  Skeleton,
  Popover,
  CircularProgress,
} from "@mui/material";
import {
  Star,
} from "@mui/icons-material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Lightbulb, EmojiEvents, KeyboardArrowDown } from "@mui/icons-material";
import RatingPopup from "../../../../components/RatingPopup";
import useGetLearningHeader from "../../../../hooks/course-progress-hooks/useGetLearningHeader";
import useGetCertificate from "../../../../hooks/certificate-hooks/useGetCertificate";
import useIssueCertificate from "../../../../hooks/certificate-hooks/useIssueCertificate";
import CertificateModal from "../../../../components/CertificateModal";
import { useEffect, useState } from "react";

function CourseLearnHeader() {
  const { courseId } = useParams();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");
  const { data: learningHeaderData, isLoading } = useGetLearningHeader(courseId);
  const [courseTitle, setCourseTitle] = useState("");
  const [progressData, setProgressData] = useState({ total: 0, completed: 0 });
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const { data: certificate, isLoading: isLoadingCert } = useGetCertificate(courseId);
  const issueCertificateMutation = useIssueCertificate();

  useEffect(() => {
    if (learningHeaderData) {
      setCourseTitle(learningHeaderData.title || "The Ultimate React Course 2025: React, Next.js, Redux & More");
      setProgressData({
        total: learningHeaderData.totalLectures || 0,
        completed: learningHeaderData.completedLectures || 0
      });
    }
  }, [learningHeaderData]);

  const handleClickProgress = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProgress = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Box
      sx={{
        height: { xs: "64px", md: "72px" },
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        alignItems: "center",
        px: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: 3,
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        "@keyframes headerFloatOne": {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0px)" },
        },
        "@keyframes headerFloatTwo": {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(8px)" },
          "100%": { transform: "translateY(0px)" },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "brand.main",
          opacity: 0.12,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "-60%",
          right: "-10%",
          width: { xs: "260px", md: "360px" },
          height: { xs: "260px", md: "360px" },
          borderRadius: "50%",
          bgcolor: "brand.main",
          opacity: 0.2,
          filter: "blur(8px)",
          animation: "headerFloatOne 6s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-70%",
          left: "-12%",
          width: { xs: "240px", md: "340px" },
          height: { xs: "240px", md: "340px" },
          borderRadius: "50%",
          bgcolor: "brand.dark",
          opacity: 0.18,
          filter: "blur(8px)",
          animation: "headerFloatTwo 7s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden", zIndex: 1 }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            mr: 2,
            flexShrink: 0,
          }}
        >
          <Lightbulb
            sx={{
              color: "brand.main",
              width: 32,
              height: 32,
              borderRadius: "8px",
              bgcolor: "brand.lighter",
              p: "4px",
            }}
          />
          {!isMobile && (
            <Typography
              variant="h4"
              sx={{
                fontSize: "22px",
                fontWeight: 800,
                color: "brand.main",
                ml: 1,
                letterSpacing: "0.2px",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              Edunary
            </Typography>
          )}
        </Box>

        {!isMobile && (
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              bgcolor: "divider",
              my: 1.5,
              mr: 2,
            }}
          />
        )}

        <Box sx={{ display: { xs: "none", sm: "block" }, flex: 1 }}>
          {isLoading ? (
            <Skeleton
              variant="text"
              width={isMobile ? 100 : 400}
              height={30}
              sx={{ bgcolor: "action.hover" }}
            />
          ) : (
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                fontSize: "16px",
                color: "text.main",
                fontWeight: 600,
                maxWidth: { sm: "300px", md: "500px", lg: "700px" },
                lineHeight: 1.2,
                display: "flex",
                alignItems: "center",
              }}
            >
              {courseTitle}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0, zIndex: 1 }}>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            width={isMobile ? 40 : 140}
            height={40}
            sx={{
              bgcolor: "action.hover",
              borderRadius: isMobile ? "50%" : "999px",
            }}
          />
        ) : (
          <>
            <Button
              sx={{
                textTransform: "none",
                color: "text.inverse",
                bgcolor: "brand.main",
                borderRadius: "12px",
                px: 2,
                py: 0.8,
                boxShadow: 2,
                "&:hover": {
                  color: "text.inverse",
                  bgcolor: "brand.dark",
                  boxShadow: 3,
                }
              }}
              startIcon={<Star />}
              onClick={() => setIsPopupOpen(true)}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {!isMobile && (
                  <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                    Leave a rating
                  </Typography>
                )}
              </Box>
            </Button>

            <RatingPopup
              open={isPopupOpen}
              onClose={() => setIsPopupOpen(false)}
              courseId={courseId}
            />
            <Button
              aria-describedby={id}
              onClick={handleClickProgress}
              sx={{
                textTransform: "none",
                color: "text.primary",
                ml: 1,
                borderRadius: "12px",
                px: 1.6,
                py: 0.6,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                "&:hover": {
                  color: "text.primary",
                  bgcolor: "action.hover",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "brand.lighter",
                  color: "brand.dark",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  mr: 1,
                }}
              >
                <EmojiEvents sx={{ fontSize: 18 }} />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                {!isMobile && (
                  <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                    Your progress
                  </Typography>
                )}
                <KeyboardArrowDown sx={{ ml: 0.5 }} />
              </Box>
            </Button>

            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleCloseProgress}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    boxShadow: 6,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    minWidth: "250px",
                  }
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: "text.primary",
                    mb: 0.5
                  }}
                >
                  {progressData.completed} of {progressData.total} complete.
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.9rem",
                    mb: 2
                  }}
                >
                  {progressData.completed === progressData.total && progressData.total > 0
                    ? "Click to get your certificate"
                    : "Finish course to get your certificate"}
                </Typography>

                {(progressData.completed === progressData.total && progressData.total > 0) && (
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={issueCertificateMutation.isPending || isLoadingCert}
                    onClick={() => {
                      handleCloseProgress();
                      if (certificate) {
                        setIsCertModalOpen(true);
                      } else {
                        issueCertificateMutation.mutate(courseId, {
                          onSuccess: (res) => {
                            if (res && res.result) setIsCertModalOpen(true);
                          }
                        });
                      }
                    }}
                    sx={{
                      bgcolor: "brand.main",
                      color: "text.inverse",
                      borderRadius: 2,
                      "&:hover": { bgcolor: "brand.dark" }
                    }}
                  >
                    {issueCertificateMutation.isPending ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : certificate ? (
                      "View Certificate"
                    ) : (
                      "Get Certificate"
                    )}
                  </Button>
                )}
              </Box>
            </Popover>

            <CertificateModal
              open={isCertModalOpen}
              onClose={() => setIsCertModalOpen(false)}
              certificate={certificate || (issueCertificateMutation.data?.result)}
            />
          </>
        )}
      </Box>
    </Box>
  );
}

export default CourseLearnHeader;