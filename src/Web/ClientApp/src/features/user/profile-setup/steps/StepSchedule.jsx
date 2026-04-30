import { Box, Typography } from "@mui/material";
import mascot from "../../../../assets/images/profile-setup-mascot.png";


const SCHEDULE_OPTIONS = [
  {
    value: 5,
    label: "~5 hrs / week",
    badge: "Casual",
    description: "Learning at your own pace, fitting it around life.",
  },
  {
    value: 10,
    label: "~10 hrs / week",
    badge: "Steady",
    description: "Consistent progress without overwhelming yourself.",
  },
  {
    value: 15,
    label: "~15 hrs / week",
    badge: "Dedicated",
    description: "Serious commitment — you'll see results fast.",
  },
  {
    value: 20,
    label: "20+ hrs / week",
    badge: "Full Focus",
    description: "All in — ideal for career change or intensive upskilling.",
  },
];

export default function StepSchedule({ currentStep, totalSteps, formData, onChange }) {
  const selected = formData.weeklyHours;

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
      <Box sx={{ mb: 2 }}>
        <img
          src={mascot}
          alt="Edunary assistant"
          style={{ width: 72, height: 72, objectFit: "contain" }}
        />
      </Box>

      <Typography
        variant="subtitle1"
        sx={{ color: "text.secondary", fontWeight: 500, mb: 0.5, fontSize: "14px" }}
      >
        Step {currentStep} of {totalSteps}
      </Typography>

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "text.primary", mb: 1, fontSize: "24px" }}
      >
        How much time can you commit each week?
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mb: 5,
          maxWidth: 400,
          fontSize: "20px",
          lineHeight: 1.7,
        }}
      >
        This helps us understand your availability and set a realistic learning pace.

      </Typography>

      {/* Vertical card list */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          width: "100%",
          maxWidth: 480,
        }}
      >
        {SCHEDULE_OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;

          return (
            <Box
              key={opt.value}
              onClick={() => onChange("weeklyHours", opt.value)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: "16px 20px",
                cursor: "pointer",
                borderRadius: 2.5,
                border: "2px solid",
                borderColor: isSelected ? "brand.main" : "divider",
                bgcolor: "background.paper",
                transition: "border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                },
              }}
            >
              {/* Left: label + description */}
              <Box sx={{ textAlign: "left" }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    fontSize: "15px",
                    color: "text.primary",
                    mb: 0.3,
                  }}
                >
                  {opt.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "13px",
                    color: "text.secondary",
                    lineHeight: 1.5,
                  }}
                >
                  {opt.description}
                </Typography>
              </Box>

              {/* Right: badge */}
              <Box
                sx={{
                  flexShrink: 0,
                  ml: 2,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: isSelected ? "brand.main" : "divider",
                  bgcolor: isSelected ? "brand.lighter" : "background.muted",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: isSelected ? "brand.dark" : "text.secondary",
                    whiteSpace: "nowrap",
                  }}
                >
                  {opt.badge}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
