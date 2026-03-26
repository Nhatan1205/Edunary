import { Controller, useForm } from "react-hook-form";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getLevelLabel } from "../../../../../utils/helpers";

// Mock data for topics — replace with API data later
const MOCK_TOPICS = [
    { id: "frontend", label: "Frontend Development" },
    { id: "backend", label: "Backend Development" },
    { id: "fullstack", label: "Full-Stack Development" },
    { id: "mobile", label: "Mobile Development" },
    { id: "devops", label: "DevOps & Cloud" },
    { id: "data-science", label: "Data Science" },
    { id: "machine-learning", label: "Machine Learning" },
    { id: "ui-ux", label: "UI / UX Design" },
    { id: "cybersecurity", label: "Cybersecurity" },
    { id: "game-dev", label: "Game Development" },
];

const inputFocusSx = {
    "& label.Mui-focused": {
        color: "brand.dark",
    },
    "& .MuiOutlinedInput-root": {
        "&:hover fieldset": {
            borderColor: "brand.main",
        },
        "&.Mui-focused fieldset": {
            borderColor: "brand.main",
            borderWidth: "3px",
        },
    },
};

export default function RoadmapMetadataDialog({
    open,
    onClose,
    defaultValues,
}) {
    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        values: defaultValues || {
            title: "",
            subtitle: "",
            description: "",
            topic: "",
            skillLevel: "",
        },
    });

    // Replace this with an API call later
    const onSubmit = (data) => {
        console.log("Roadmap metadata:", data);
        onClose(data);
    };

    const handleClose = () => {
        reset();
        onClose(null);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: "hidden",
                },
            }}
        >
            {/* ── Header ── */}
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1.5,
                    px: 3,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    Edit Roadmap Info
                </Typography>
                <IconButton size="small" onClick={handleClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            {/* ── Form Body ── */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent
                    sx={{ px: 3, pt: 2, display: "flex", flexDirection: "column", gap: 3 }}
                >
                    {/* Title */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                            Title
                        </Typography>
                        <TextField
                            {...register("title", {
                                required: "Title is required",
                                minLength: {
                                    value: 5,
                                    message: "Title must be at least 5 characters",
                                },
                            })}
                            fullWidth
                            size="small"
                            placeholder="Enter roadmap title"
                            error={!!errors.title}
                            helperText={
                                errors.title
                                    ? errors.title.message
                                    : "A short, descriptive title for your roadmap"
                            }
                            slotProps={{
                                htmlInput: { maxLength: 60 },
                                input: {
                                    endAdornment: (
                                        <Typography
                                            variant="caption"
                                            sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
                                        >
                                            {watch("title")?.length || 0}/60
                                        </Typography>
                                    ),
                                },
                            }}
                            sx={inputFocusSx}
                        />
                    </Box>

                    {/* Subtitle */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                            Subtitle
                        </Typography>
                        <TextField
                            {...register("subtitle", {
                                maxLength: {
                                    value: 90,
                                    message: "Maximum 90 characters",
                                },
                            })}
                            fullWidth
                            size="small"
                            placeholder="Enter roadmap subtitle"
                            error={!!errors.subtitle}
                            helperText={
                                errors.subtitle
                                    ? errors.subtitle.message
                                    : "A brief summary that appears below the title"
                            }
                            slotProps={{
                                htmlInput: { maxLength: 90 },
                                input: {
                                    endAdornment: (
                                        <Typography
                                            variant="caption"
                                            sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
                                        >
                                            {watch("subtitle")?.length || 0}/90
                                        </Typography>
                                    ),
                                },
                            }}
                            sx={inputFocusSx}
                        />
                    </Box>
                    {/* Topic & Skill Level — side by side */}
                    <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Topic */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                                Topic
                            </Typography>
                            <Controller
                                name="topic"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth size="small" sx={inputFocusSx}>
                                        <InputLabel>Topic</InputLabel>
                                        <Select {...field} label="Topic">
                                            <MenuItem value="">-- Select Topic --</MenuItem>
                                            {MOCK_TOPICS.map((t) => (
                                                <MenuItem key={t.id} value={t.id}>
                                                    {t.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Box>

                        {/* Skill Level */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                                Skill Level
                            </Typography>
                            <Controller
                                name="skillLevel"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth size="small" sx={inputFocusSx}>
                                        <InputLabel>Skill Level</InputLabel>
                                        <Select {...field} label="Skill Level">
                                            <MenuItem value="">-- Select Level --</MenuItem>
                                            <MenuItem value={0}>{getLevelLabel(0)}</MenuItem>
                                            <MenuItem value={1}>{getLevelLabel(1)}</MenuItem>
                                            <MenuItem value={2}>{getLevelLabel(2)}</MenuItem>
                                            <MenuItem value={3}>{getLevelLabel(3)}</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Box>
                    </Box>

                    {/* Description */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                            Description
                        </Typography>
                        <TextField
                            {...register("description")}
                            fullWidth
                            multiline
                            minRows={3}
                            maxRows={6}
                            size="small"
                            placeholder="Describe what learners will achieve with this roadmap"
                            helperText="Explain the goals and target audience of this roadmap"
                            sx={inputFocusSx}
                        />
                    </Box>


                </DialogContent>

                {/* ── Footer ── */}
                <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
                    <Button
                        onClick={handleClose}
                        sx={{
                            textTransform: "none",
                            color: "text.secondary",
                            fontWeight: 600,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            textTransform: "none",
                            bgcolor: "brand.main",
                            fontWeight: 600,
                            px: 4,
                            "&:hover": { bgcolor: "brand.dark" },
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
