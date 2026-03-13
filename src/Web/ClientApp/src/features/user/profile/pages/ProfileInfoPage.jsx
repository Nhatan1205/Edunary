
import { Controller, useForm } from "react-hook-form";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material";
import { Container } from "reactstrap";
import TextEditor from "../../../../components/TextEditor";
import useGetBasicUserInfo from "../../../../hooks/useGetBasicUserInfor";
import useUpdateUserInfo from "../../../../hooks/useUpdateUserInfo";

const HEADLINE_MAX = 60;

const textFieldSx = {
    "& label.Mui-focused": { color: "brand.dark" },
    "& .MuiOutlinedInput-root": {
        "&:hover fieldset": { borderColor: "brand.main" },
        "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "2px" },
    },
};

function ProfileInfoPage() {
    const { data: userInfo, isLoading } = useGetBasicUserInfo();
    const { mutate: updateUserInfo, isPending } = useUpdateUserInfo();

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        values: {
            fullName: userInfo?.fullName ?? "",
            phoneNumber: userInfo?.phoneNumber ?? "",
            headline: userInfo?.headline ?? "",
            biography: userInfo?.description ?? "",
            links: {
                website: userInfo?.links?.website ?? "",
                facebook: userInfo?.links?.facebook ?? "",
                linkedin: userInfo?.links?.linkedin ?? "",
                tiktok: userInfo?.links?.tiktok ?? "",
                youtube: userInfo?.links?.youtube ?? "",
            },
        },
    });

    const onSubmit = (data) => {
        updateUserInfo(data);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress sx={{ color: "brand.main" }} />
            </Box>
        );
    }

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

                    {/* Full Name */}
                    <Box sx={{ mb: 1.5 }}>
                        <TextField
                            {...register("fullName")}
                            fullWidth
                            placeholder="Full name"
                            sx={textFieldSx}
                        />
                    </Box>

                    {/* Phone Number */}
                    <Box sx={{ mb: 1.5 }}>
                        <TextField
                            {...register("phoneNumber")}
                            fullWidth
                            placeholder="Phone number"
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
                        Add a professional headline like, "Instructor at Edunary" or "Architect."
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
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                        Links:
                    </Typography>

                    {/* Website */}
                    <Box sx={{ mb: 1.5 }}>
                        <TextField
                            {...register("links.website")}
                            fullWidth
                            placeholder="Website (http(s)://..)"
                            sx={textFieldSx}
                        />
                    </Box>

                    {/* Facebook */}
                    <Box sx={{ mb: 0.5 }}>
                        <TextField
                            {...register("links.facebook")}
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

                    {/* LinkedIn */}
                    <Box sx={{ mb: 0.5 }}>
                        <TextField
                            {...register("links.linkedin")}
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
                        Input your LinkedIn public profile URL (e.g. in/johnsmith, company/Edunary).
                    </Typography>

                    {/* TikTok */}
                    <Box sx={{ mb: 0.5 }}>
                        <TextField
                            {...register("links.tiktok")}
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

                    {/* YouTube */}
                    <Box sx={{ mb: 0.5 }}>
                        <TextField
                            {...register("links.youtube")}
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
                        disabled={isPending}
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
