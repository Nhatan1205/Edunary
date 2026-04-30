import { MenuBook, School, WorkspacePremium } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import mascot from "../../../../assets/images/profile-setup-mascot.png";

const LEVELS = [
  {
    value: "Beginner",
    label: "Beginner",
    description: "Just starting out, little to no experience",
    icon: MenuBook,
  },
  {
    value: "Intermediate",
    label: "Intermediate",
    description: "Some hands-on experience, looking to go deeper",
    icon: School,
  },
  {
    value: "Advanced",
    label: "Advanced",
    description: "Deep professional experience, want to specialise",
    icon: WorkspacePremium,
  },
];

export default function StepSkillLevel({ currentStep, totalSteps, formData, onChange }) {
  const selected = formData.skillLevel;

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
        What&apos;s your current skill level?
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mb: 5,
          maxWidth: 420,
          fontSize: "20px",
          lineHeight: 1.7,
        }}
      >
        This helps us recommend courses that match where you are right now.
      </Typography>

      {/* Level cards */}
      <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", justifyContent: "center" }}>
        {LEVELS.map((level) => {
          const Icon = level.icon;
          const isSelected = selected === level.value;

          return (
            <Box
              key={level.value}
              onClick={() => onChange("skillLevel", level.value)}
              sx={{
                width: 180,
                cursor: "pointer",
                borderRadius: 2.5,
                border: "2px solid",
                p: 1,
                borderColor: isSelected ? "brand.main" : "divider",
                overflow: "hidden",
                bgcolor: "background.paper",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                transition: "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
                "&:hover": {
                  transform: "scale(1.04)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
                },
              }}
            >
              {/* Icon area */}
              <Box
                sx={{
                  height: 90,
                  bgcolor: "background.muted",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                }}
              >
                <Icon sx={{ fontSize: 38, color: "brand.main" }} />
              </Box>

              {/* Text */}
              <Box sx={{ py: 2, textAlign: "left" }}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, fontSize: "15px", color: "text.primary", mb: 0.5 }}
                >
                  {level.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "12px",
                    color: "text.secondary",
                    lineHeight: 1.5,
                  }}
                >
                  {level.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
