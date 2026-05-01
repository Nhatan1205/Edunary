import { useState } from "react";
import { Add, Check, Search } from "@mui/icons-material";
import { Box, Typography, InputAdornment, TextField, Skeleton } from "@mui/material";
import mascot from "../../../../assets/images/profile-setup-mascot.png";
import AlertBox from "../../../../components/AlertBox";
import useGetCategories from "../../../../hooks/category-hooks/useGetCategories";
import useDebounce from "../../../../hooks/common/useDebounce";

const MAX_FIELDS = 3;

export default function StepField({ currentStep, totalSteps, formData, onChange }) {
    const [search, setSearch] = useState("");
    const selected = formData.preferredCategoryIds || [];
    const isOverLimit = selected.length > MAX_FIELDS;

    const debouncedSearch = useDebounce(search, 300);
    const { data: categoryData, isLoading, isError } = useGetCategories(1, 12, debouncedSearch || null);
    const categories = categoryData?.items ?? [];

    const toggleItem = (id) => {
        if (selected.includes(id)) {
            onChange("preferredCategoryIds", selected.filter((x) => x !== id));
        } else {
            onChange("preferredCategoryIds", [...selected, id]);
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
                What field do you want to learn?
            </Typography>

            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3.5, maxWidth: 440, fontSize: "20px", lineHeight: 1.7 }}>
                Choose the areas you&apos;re most interested in.
            </Typography>

            <TextField
                id="field-search"
                placeholder="Find a field..."
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
                    <AlertBox severity="error">Failed to load categories. Please try again.</AlertBox>
                </Box>
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5, width: "100%", maxWidth: 600 }}>
                {isLoading
                    ? Array.from({ length: 9 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={46} sx={{ borderRadius: 2 }} />
                    ))
                    : categories.map((cat) => {
                        const isSelected = selected.includes(cat.id);
                        return (
                            <Box
                                key={cat.id}
                                onClick={() => toggleItem(cat.id)}
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
                                    {cat.title}
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

            {isOverLimit && (
                <Box sx={{ mt: 2.5, width: "100%", maxWidth: 520 }}>
                    <AlertBox severity="error">
                        You&apos;ve selected <strong>{selected.length} fields</strong> — please choose at most{" "}
                        <strong>{MAX_FIELDS}</strong>. Deselect some to continue.
                    </AlertBox>
                </Box>
            )}

            {!isOverLimit && (
                <Typography variant="caption" sx={{ mt: 2.5, color: "text.secondary", fontWeight: 500 }}>
                    {selected.length} / {MAX_FIELDS} selected
                </Typography>
            )}
        </Box>
    );
}
