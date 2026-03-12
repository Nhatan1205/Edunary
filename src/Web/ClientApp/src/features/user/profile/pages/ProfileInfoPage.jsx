import { Controller, useForm } from "react-hook-form";
import {
    Box,
    Button,
    Divider,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { Container } from "reactstrap";
import TextEditor from "../../../../components/TextEditor";

const LANGUAGE_OPTIONS = [
    { value: "en", label: "English (US)" },
    { value: "vi", label: "Tiếng Việt" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "zh", label: "Chinese" },
];

const HEADLINE_MAX = 60;

const textFieldSx = {
    "& label.Mui-focused": { color: "brand.dark" },
    "& .MuiOutlinedInput-root": {
        "&:hover fieldset": { borderColor: "brand.main" },
        "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "2px" },
    },
};

function ProfileInfoPage() {
    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            headline: "",
            biography: "",
            language: "en",
            website: "",
            facebook: "",
            instagram: "",
            linkedin: "",
            tiktok: "",
            x: "",
            youtube: "",
        },
    });

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <Container className="py-2 px-0">
            {/* Page Header */}
            <Box sx={{ textAlign: "center", mb: 3, px: 2, pb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Public profile
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Add information about yourself
                </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 6 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                        Basics:
                    </Typography>

                    {/* First Name */}
                    <Box sx={{ mb: 1.5 }}>
                        <TextField
                            {...register("firstName")}
                            fullWidth
                            placeholder="First name"
                            sx={textFieldSx}
                        />
                    </Box>

                    {/* Last Name */}
                    <Box sx={{ mb: 1.5 }}>
                        <TextField
                            {...register("lastName")}
                            fullWidth
                            placeholder="Last name"
                            sx={textFieldSx}
                        />
                    </Box>

                    {/* Headline */}
                    <Box sx={{ mb: 0.5 }}>
                        <TextField
                            {...register("headline", {
                                maxLength: {
                                    value: HEADLINE_MAX,
                                    message: `Maximum ${HEADLINE_MAX} characters`,
                                },
                            })}
                            fullWidth
                            placeholder="Headline"
                            error={!!errors.headline}
                            slotProps={{
                                htmlInput: { maxLength: HEADLINE_MAX },
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                {watch("headline")?.length || 0}
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={textFieldSx}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", mb: 2, display: "block" }}>
                        Add a professional headline like, "Instructor at Udemy" or "Architect."
                    </Typography>

                    {/* Biography */}
                    <Box sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                            Biography
                        </Typography>
                        <Controller
                            name="biography"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <TextEditor
                                    value={value}
                                    onChange={onChange}
                                    buttons={["bold", "italic"]}
                                />
                            )}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", mb: 2, display: "block" }}>
                        Links and coupon codes are not permitted in this section.
                    </Typography>

                    {/* Language */}
                    <Box sx={{ mb: 1 }}>
                        <Controller
                            name="language"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth sx={textFieldSx}>
                                    <Select {...field}>
                                        {LANGUAGE_OPTIONS.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        />
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                        Links:
                    </Typography>

                    {/* Website */}
                    <Box sx={{ mb: 1.5 }}>
                        <TextField
                            {...register("website")}
                            fullWidth
                            placeholder="Website (http(s)://..)"
                            sx={textFieldSx}
                        />
                    </Box>

                    {/* Facebook */}
                    <Box sx={{ mb: 0.5 }}>
                        <TextField
                            {...register("facebook")}
                            fullWidth
                            placeholder="Username"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                                                facebook.com/
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={textFieldSx}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ color: "brand.dark", mb: 1.5, display: "block" }}>
                        Input your Facebook username (e.g. johnsmith).
                    </Typography>

                    {/* Instagram */}
                    <Box sx={{ mb: 0.5 }}>
                        <TextField
                            {...register("instagram")}
                            fullWidth
                            placeholder="Username"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                                                instagram.com/
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={textFieldSx}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ color: "brand.dark", mb: 1.5, display: "block" }}>
                        Input your Instagram username (e.g. johnsmith).
                    </Typography>

                    {/* LinkedIn */}
                    <Box sx={{ mb: 0.5 }}>
                        <TextField
                            {...register("linkedin")}
                            fullWidth
                            placeholder="Public Profile URL"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                                                linkedin.com/
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={textFieldSx}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ color: "brand.dark", mb: 1.5, display: "block" }}>
                        Input your LinkedIn public profile URL (e.g. in/johnsmith, company/udemy).
                    </Typography>

                    {/* TikTok */}
                    <Box sx={{ mb: 0.5 }}>
                        <TextField
                            {...register("tiktok")}
                            fullWidth
                            placeholder="@Username"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                                                tiktok.com/
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={textFieldSx}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ color: "brand.dark", mb: 1.5, display: "block" }}>
                        Input your TikTok username (e.g. @johnsmith).
                    </Typography>

                    {/* X (Twitter) */}
                    <Box sx={{ mb: 0.5 }}>
                        <TextField
                            {...register("x")}
                            fullWidth
                            placeholder="Username"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                                                x.com/
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={textFieldSx}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", mb: 1.5, display: "block" }}>
                        Add your X username (e.g. johnsmith).
                    </Typography>

                    {/* YouTube */}
                    <Box sx={{ mb: 0.5 }}>
                        <TextField
                            {...register("youtube")}
                            fullWidth
                            placeholder="Username"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                                                youtube.com/
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={textFieldSx}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ color: "brand.dark", mb: 1.5, display: "block" }}>
                        Input your Youtube username (e.g. johnsmith).
                    </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        type="submit"
                        size="large"
                        sx={{
                            width: "100px",
                            bgcolor: "brand.main",
                            "&:hover": {
                                backgroundColor: "brand.dark",
                            },
                        }}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </Container >
    );
}

export default ProfileInfoPage;
