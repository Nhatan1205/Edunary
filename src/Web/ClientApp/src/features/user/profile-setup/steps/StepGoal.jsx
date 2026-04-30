import {
  RocketLaunch,
  SwapHoriz,
  TrendingUp,
  Explore,
} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import mascot from "../../../../assets/images/profile-setup-mascot.png";

const GOALS = [
  { value: "Start Career", label: "Start my career", icon: RocketLaunch },
  { value: "Change Career", label: "Change my career", icon: SwapHoriz },
  { value: "Grow in Role", label: "Grow in my current role", icon: TrendingUp },
  { value: "Explore Topics", label: "Explore topics outside of work", icon: Explore },
];

export default function StepGoal({ formData, onChange }) {
  const selected = formData.goal;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        px: 2,
        pt: 4,
        pb: 2,
      }}
    >
      {/* Mascot */}
      <Box sx={{ mb: 2.5 }}>
        <img
          src={mascot}
          alt="Edunary assistant"
          style={{ width: 76, height: 76, objectFit: "contain" }}
        />
      </Box>

      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: "text.primary", mb: 1.5, fontSize: "26px" }}
      >
        Hello! 👋
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          mb: 5,
          maxWidth: 520,
          fontSize: "24px",
          lineHeight: 1.7,
        }}
      >
        Tell me a little about yourself so I can make the best recommendations.
        <br />
        <strong>First, what&apos;s your goal?</strong>
      </Typography>

      {/* Goal cards */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        {GOALS.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selected === goal.value;

          return (
            <Box
              key={goal.value}
              onClick={() => onChange("goal", goal.value)}
              sx={{
                width: 155,
                cursor: "pointer",
                borderRadius: 2.5,
                border: "2px solid",
                p: 1,
                borderColor: isSelected ? "brand.main" : "divider",
                overflow: "hidden",
                bgcolor: "background.paper",
                transition: "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
                boxShadow: isSelected
                  ? "0 0 0 3px rgba(0,0,0,0.06)"
                  : "0 1px 6px rgba(0,0,0,0.06)",
                "&:hover": {
                  transform: "scale(1.04)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
                },
              }}
            >
              {/* Icon area */}
              <Box
                sx={{
                  height: 100,
                  bgcolor: "background.muted",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                }}
              >
                <Icon sx={{ fontSize: 42, color: "brand.main" }} />
              </Box>

              {/* Label */}
              <Box sx={{ p: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "text.primary",
                    lineHeight: 1.4,
                  }}
                >
                  {goal.label}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
