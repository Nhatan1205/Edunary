import { Box, Typography, Avatar, Skeleton } from "@mui/material";
import { Container, Row, Col } from "reactstrap";
import useScrollAnimation from "../../../../hooks/common/useScrollAnimation";
import useGetTopInstructors from "../../../../hooks/user-hooks/useGetTopInstructors";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import { Link } from "react-router";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=random";

const testimonial = {
  quote: "The instructors here don't just teach — they share real-world experiences that prepare you for the industry. It completely changed how I approach problem solving.",
  author: "Minh Nguyen",
  role: "Software Engineer",
};

/** Reusable truncation style */
const truncateSx = (lines = 1) => ({
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  wordBreak: "break-word",
});

function InstructorCard({ instructor }) {
  const avatarSrc = instructor.avatar || DEFAULT_AVATAR;
  const name = instructor.fullName || "Instructor";
  const headline = instructor.headline || "";

  return (
    <Link
      to={`/profile/${instructor.id}`}
      style={{ textDecoration: "none" }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1.5px solid",
          borderColor: "divider",
          borderRadius: "16px",
          padding: "28px 16px",
          textAlign: "center",
          transition: "border-color 0.2s ease, background-color 0.2s ease",
          "&:hover": {
            borderColor: "brand.main",
            bgcolor: "background.muted",
          },
        }}
      >
        {/* Avatar */}
        <Avatar
          src={avatarSrc}
          alt={name}
          sx={{
            width: 72,
            height: 72,
            mx: "auto",
            mb: 1.75,
            border: "2px solid",
            borderColor: "brand.lighter",
          }}
        />

        {/* Name — 1 line max */}
        <Typography
          variant="subtitle1"
          sx={{
            color: "text.primary",
            fontWeight: 700,
            fontSize: "0.95rem",
            mb: 0.4,
            ...truncateSx(1),
          }}
          title={name}
        >
          {name}
        </Typography>

        {/* Headline — 2 lines max */}
        <Typography
          variant="body2"
          sx={{
            color: "text.tertiary",
            fontSize: "0.82rem",
            mb: 1.5,
            minHeight: "2.7em",
            ...truncateSx(2),
          }}
          title={headline}
        >
          {headline || "—"}
        </Typography>

        {/* Stats row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          {/* Total Learners badge */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "background.muted",
              color: "text.secondary",
              borderRadius: "20px",
              px: 1.5,
              py: 0.4,
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
          >
            <PeopleOutlineIcon sx={{ fontSize: 15 }} />
            {instructor.totalLearners?.toLocaleString() ?? 0} Learners
          </Box>
        </Box>
      </Box>
    </Link>
  );
}

/** Skeleton placeholder while loading */
function InstructorCardSkeleton() {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1.5px solid",
        borderColor: "divider",
        borderRadius: "16px",
        padding: "28px 16px",
        textAlign: "center",
      }}
    >
      <Skeleton variant="circular" width={72} height={72} sx={{ mx: "auto", mb: 1.75 }} />
      <Skeleton variant="text" width="60%" sx={{ mx: "auto", mb: 0.4 }} />
      <Skeleton variant="text" width="80%" sx={{ mx: "auto", mb: 1.5 }} />
      <Skeleton variant="rounded" width="70%" height={28} sx={{ mx: "auto", borderRadius: "20px" }} />
    </Box>
  );
}

function InstructorSection() {
  const leftRef = useScrollAnimation("fade-in-left");
  const rightRef = useScrollAnimation("fade-in-right");
  const { data: instructors, isLoading } = useGetTopInstructors(3);

  // Hide section entirely if no instructors after loading
  if (!isLoading && (!instructors || instructors.length === 0)) return null;

  return (
    <Box
      component="section"
      sx={{
        bgcolor: "background.default",
        py: { xs: 6, md: 9 },
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container>
        <Row className="align-items-center gy-5">
          {/* Left column — text */}
          <Col lg={5}>
            <Box ref={leftRef}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 1.5,
                  fontSize: { xs: "1.6rem", md: "2rem" },
                  lineHeight: 1.2,
                }}
              >
                Learn from Industry Experts
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "text.tertiary",
                  mb: 3.5,
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  maxWidth: 400,
                }}
              >
                Our instructors bring years of real-world experience to help you
                learn practical, in-demand skills that employers look for.
              </Typography>

              {/* Testimonial card */}
              <Box
                sx={{
                  bgcolor: "background.muted",
                  borderRadius: "14px",
                  padding: "20px 24px",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <FormatQuoteIcon sx={{ color: "brand.main", fontSize: 28, mb: 0.75 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontStyle: "italic",
                    lineHeight: 1.65,
                    mb: 1.5,
                    fontSize: "0.92rem",
                  }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.85rem" }}>
                  — {testimonial.author}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                  {testimonial.role}
                </Typography>
              </Box>
            </Box>
          </Col>

          {/* Right column — instructor cards */}
          <Col lg={7}>
            <Box ref={rightRef}>
              <Row className="g-3 justify-content-center">
                {isLoading
                  ? [1, 2, 3].map((i) => (
                    <Col xs={12} sm={4} key={i}>
                      <InstructorCardSkeleton />
                    </Col>
                  ))
                  : instructors.map((instructor) => (
                    <Col xs={12} sm={4} key={instructor.id}>
                      <InstructorCard instructor={instructor} />
                    </Col>
                  ))}
              </Row>
            </Box>
          </Col>
        </Row>
      </Container>
    </Box>
  );
}

export default InstructorSection;
