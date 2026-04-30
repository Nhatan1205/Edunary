import { useState } from "react";
import { Add, Check, Search } from "@mui/icons-material";
import { Box, Typography, InputAdornment, TextField, Skeleton } from "@mui/material";
import mascot from "../../../../assets/images/profile-setup-mascot.png";
import AlertBox from "../../../../components/AlertBox";
import useGetTopics from "../../../../hooks/topic-hooks/useGetTopics";
import useDebounce from "../../../../hooks/common/useDebounce";

export default function StepTopics({ currentStep, totalSteps, formData, onChange }) {
  const [search, setSearch] = useState("");
  const selected = formData.preferredTopicIds || [];

  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = useGetTopics(debouncedSearch || null, 1, 200);
  const topics = data?.items ?? [];

  const toggleItem = (id) => {
    if (selected.includes(id)) {
      onChange("preferredTopicIds", selected.filter((x) => x !== id));
    } else {
      onChange("preferredTopicIds", [...selected, id]);
    }
  };

  const searchFieldSx = {
    width: "100%",
    maxWidth: 520,
    mb: 3,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "background.paper",
      fontSize: "14px",
      transition: "background-color 0.18s ease",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "brand.main",
    },
  };

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
      <Box sx={{ mb: 2 }}>
        <img src={mascot} alt="Edunary assistant" style={{ width: 72, height: 72, objectFit: "contain" }} />
      </Box>

      <Typography variant="subtitle1" sx={{ color: "text.secondary", fontWeight: 500, mb: 0.5, fontSize: "14px" }}>
        Step {currentStep} of {totalSteps}
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", mb: 1, fontSize: "24px" }}>
        Select the skills you&apos;d like to develop
      </Typography>

      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3.5, maxWidth: 440, fontSize: "20px", lineHeight: 1.7 }}>
        Choose the specific skills you want to focus on.

      </Typography>

      <TextField
        id="topic-search"
        placeholder="Find a skill..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={searchFieldSx}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: "text.secondary", fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      {isError && (
        <Box sx={{ mb: 2, width: "100%", maxWidth: 520 }}>
          <AlertBox severity="error">Failed to load topics. Please try again.</AlertBox>
        </Box>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5, width: "100%", maxWidth: 600 }}>
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={46} sx={{ borderRadius: 2 }} />
          ))
          : topics.map((topic) => {
            const isSelected = selected.includes(topic.id);
            return (
              <Box
                key={topic.id}
                onClick={() => toggleItem(topic.id)}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: "12px 14px",
                  cursor: "pointer",
                  borderRadius: 2,
                  border: "1.5px solid",
                  borderColor: isSelected ? "brand.main" : "divider",
                  bgcolor: "background.paper",
                  transition: "border-color 0.18s ease",
                  "&:hover": { borderColor: isSelected ? "brand.main" : "brand.light" },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 400, fontSize: "13px", color: "text.primary", textAlign: "left", lineHeight: 1.3 }}>
                  {topic.name}
                </Typography>
                <Box
                  sx={{
                    flexShrink: 0,
                    ml: 1,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "1.5px solid",
                    borderColor: isSelected ? "brand.main" : "divider",
                    bgcolor: isSelected ? "brand.main" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.18s ease",
                  }}
                >
                  {isSelected ? <Check sx={{ fontSize: 14, color: "white" }} /> : <Add sx={{ fontSize: 14, color: "text.disabled" }} />}
                </Box>
              </Box>
            );
          })}
      </Box>

      {selected.length > 0 && (
        <Typography variant="caption" sx={{ mt: 2.5, color: "text.secondary", fontWeight: 500 }}>
          {selected.length} skill{selected.length > 1 ? "s" : ""} selected
        </Typography>
      )}
    </Box>
  );
}
