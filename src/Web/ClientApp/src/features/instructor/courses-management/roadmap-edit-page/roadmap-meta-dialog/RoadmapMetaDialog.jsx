
import { Controller, useForm } from "react-hook-form";
import useCreateRoadmap from "../../../../../hooks/roadmap-hooks/useCreateRoadmap";
import useUpdateRoadmap from "../../../../../hooks/roadmap-hooks/useUpdateRoadmap";
import useGetRoadmapTopics from "../../../../../hooks/roadmap-hooks/useGetRoadmapTopics";
import useGetRoadmapDetail from "../../../../../hooks/roadmap-hooks/useGetRoadmapDetail";
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
    CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getLevelLabel } from "../../../../../utils/helpers";
import AlertBox from "../../../../../components/AlertBox";


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
    roadmapId,
    mode = "edit",
}) {
    const isCreate = mode === "create";
    const createRoadmap = useCreateRoadmap();
    const updateRoadmap = useUpdateRoadmap();
    const { data: topics = [], isLoading: topicsLoading } = useGetRoadmapTopics();

    // Fetch roadmap detail when editing
    const { data: roadmapDetail, isLoading: detailLoading } = useGetRoadmapDetail(
        !isCreate && open ? roadmapId : null
    );

    const emptyValues = { title: "", subtitle: "", description: "", topic: "", skillLevel: "" };

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        values: !isCreate && roadmapDetail
            ? {
                title: roadmapDetail.title ?? "",
                subtitle: roadmapDetail.subtitle ?? "",
                description: roadmapDetail.description ?? "",
                topic: roadmapDetail.roadmapTopicId ?? "",
                skillLevel: roadmapDetail.skillLevel ?? "",
            }
            : emptyValues,
    });

    const onSubmit = (data) => {
        const payload = {
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            roadmapTopicId: Number(data.topic),
            skillLevel: Number(data.skillLevel),
        };
        if (isCreate) {
            createRoadmap.mutate(payload);
        } else {
            updateRoadmap.mutate(
                {
                    id: roadmapId,
                    ...payload,
                },
                {
                    onSuccess: () => {
                        reset(emptyValues);
                        onClose();
                    },
                }
            );
        }
    };

    const handleClose = () => {
        reset(emptyValues);
        onClose();
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
                <Typography variant="h6" component="span" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    {isCreate ? "Create New Roadmap" : "Edit Roadmap Info"}
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
                    {/* Loading state for edit mode */}
                    {!isCreate && detailLoading && (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress size={36} sx={{ color: "brand.main" }} />
                        </Box>
                    )}

                    {/* Form fields — hidden while loading in edit mode */}
                    <Box sx={{ display: !isCreate && detailLoading ? "none" : "contents" }}>
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
                                helperText={!errors.title ? "A short, descriptive title for your roadmap" : undefined}
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
                            {errors.title && (
                                <AlertBox severity="error" variant="standard" sx={{ mt: 1 }}>
                                    {errors.title.message}
                                </AlertBox>
                            )}
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
                                    rules={{ required: "Please select a topic" }}
                                    render={({ field }) => (
                                        <FormControl fullWidth size="small" sx={inputFocusSx}>
                                            <InputLabel>Topic</InputLabel>
                                            <Select
                                                {...field}
                                                label="Topic"
                                                disabled={topicsLoading}
                                                error={!!errors.topic}
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            maxHeight: 220,
                                                            overflowY: "auto",
                                                        },
                                                    },
                                                }}
                                            >
                                                <MenuItem value="">
                                                    {topicsLoading ? "Loading..." : "-- Select Topic --"}
                                                </MenuItem>
                                                {topics.map((t) => (
                                                    <MenuItem key={t.id} value={t.id}>
                                                        {t.title}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                                {errors.topic && (
                                    <AlertBox severity="error" variant="standard" sx={{ mt: 1 }}>
                                        {errors.topic.message}
                                    </AlertBox>
                                )}
                            </Box>

                            {/* Skill Level */}
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                                    Skill Level
                                </Typography>
                                <Controller
                                    name="skillLevel"
                                    control={control}
                                    rules={{ required: "Please select a skill level" }}
                                    render={({ field }) => (
                                        <FormControl fullWidth size="small" sx={inputFocusSx} error={!!errors.skillLevel}>
                                            <InputLabel>Skill Level</InputLabel>
                                            <Select {...field} label="Skill Level" error={!!errors.skillLevel}>
                                                <MenuItem value="">-- Select Level --</MenuItem>
                                                <MenuItem value={0}>{getLevelLabel(0)}</MenuItem>
                                                <MenuItem value={1}>{getLevelLabel(1)}</MenuItem>
                                                <MenuItem value={2}>{getLevelLabel(2)}</MenuItem>
                                                <MenuItem value={3}>{getLevelLabel(3)}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                                {errors.skillLevel && (
                                    <AlertBox severity="error" variant="standard" sx={{ mt: 1 }}>
                                        {errors.skillLevel.message}
                                    </AlertBox>
                                )}
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


                    </Box> {/* end conditional render wrapper */}
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
                        disabled={
                            (isCreate && createRoadmap.isPending) ||
                            (!isCreate && detailLoading) ||
                            (!isCreate && updateRoadmap.isPending)
                        }
                        sx={{
                            textTransform: "none",
                            bgcolor: "brand.main",
                            fontWeight: 600,
                            px: 4,
                            "&:hover": { bgcolor: "brand.dark" },
                        }}
                    >
                        {isCreate && createRoadmap.isPending
                            ? "Creating..."
                            : !isCreate && updateRoadmap.isPending
                                ? "Saving..."
                                : isCreate ? "Create" : "Save"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
