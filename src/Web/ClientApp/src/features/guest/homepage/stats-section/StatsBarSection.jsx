import { Box, Typography } from "@mui/material";
import { Container, Row, Col } from "reactstrap";
import { useState, useEffect, useRef, useCallback } from "react";
import SchoolIcon from "@mui/icons-material/School";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import RouteIcon from "@mui/icons-material/Route";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

const stats = [
  { icon: <SchoolIcon sx={{ fontSize: 28 }} />, end: 200, suffix: "+", label: "Courses" },
  { icon: <PeopleAltIcon sx={{ fontSize: 28 }} />, end: 5000, suffix: "+", label: "Students Enrolled", format: true },
  { icon: <RouteIcon sx={{ fontSize: 28 }} />, end: 50, suffix: "+", label: "Career Paths" },
  { icon: <WorkspacePremiumIcon sx={{ fontSize: 28 }} />, end: 100, suffix: "+", label: "Expert Instructors" },
];

/**
 * A single stat counter component. Each stat animates independently
 * using its own IntersectionObserver so the numbers count up
 * when scrolled into view.
 */
function StatCounter({ icon, end, suffix, label, format, delay = 0 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 2500;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-in-out quartic — starts slow, speeds up in middle, slows at end
      const eased = progress < 0.5
        ? 8 * Math.pow(progress, 4)
        : 1 - Math.pow(-2 * progress + 2, 4) / 2;
      setValue(Math.round(eased * end));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    // Apply stagger delay per stat
    setTimeout(() => requestAnimationFrame(step), delay);
  }, [end, delay]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.unobserve(node);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [animate]);

  const display = format ? value.toLocaleString() : value;

  return (
    <Box
      ref={ref}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        className="icon-bounce"
        sx={{ color: "text.inverse", opacity: 0.85 }}
      >
        {icon}
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: "text.inverse",
          fontSize: { xs: "1.75rem", md: "2.25rem" },
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {display}{suffix}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "text.inverse",
          opacity: 0.8,
          fontSize: { xs: "0.85rem", md: "0.95rem" },
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function StatsBarSection() {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: "brand.dark",
        py: { xs: 4, md: 5 },
      }}
    >
      <Container>
        <Row className="align-items-center justify-content-center text-center">
          {stats.map((stat, index) => (
            <Col xs={6} md={3} key={index} className="mb-3 mb-md-0">
              <StatCounter
                icon={stat.icon}
                end={stat.end}
                suffix={stat.suffix}
                label={stat.label}
                format={stat.format}
                delay={index * 200}
              />
            </Col>
          ))}
        </Row>
      </Container>
    </Box>
  );
}

export default StatsBarSection;
