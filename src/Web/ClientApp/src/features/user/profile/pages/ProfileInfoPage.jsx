
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
import AlertBox from "../../../../components/AlertBox";
import useGetBasicUserInfo from "../../../../hooks/auth-hooks/useGetBasicUserInfor";
import useUpdateUserInfo from "../../../../hooks/auth-hooks/useUpdateUserInfo";

const HEADLINE_MAX = 60;

const textFieldSx = {
    "& label.Mui-focused": { color: "brand.dark" },
    "& .MuiOutlinedInput-root": {
        "&:hover fieldset": { borderColor: "brand.main" },
        "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "2px" },
        pl: 0,
    },
};

const adornmentSx = {
    alignSelf: "stretch",
    maxHeight: "none",
    height: "auto",
    bgcolor: "grey.100",
    borderRight: "1px solid",
    borderColor: "divider",
    px: 1.5,
    mr: 1,
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
                facebook: userInfo?.links?.facebook?.replace(/^facebook\.com\//, "") ?? "",
                linkedin: userInfo?.links?.linkedin?.replace(/^linkedin\.com\//, "") ?? "",
                twitter: userInfo?.links?.twitter?.replace(/^x\.com\//, "") ?? "",
                youtube: userInfo?.links?.youtube?.replace(/^youtube\.com\//, "") ?? "",
            },
        },
    });

    const onSubmit = (data) => {
        const { links } = data;
        const transformed = {
            ...data,
            links: {
                website: links.website,
                facebook: links.facebook ? `facebook.com/${links.facebook}` : "",
                linkedin: links.linkedin ? `linkedin.com/${links.linkedin}` : "",
                twitter: links.twitter ? `x.com/${links.twitter}` : "",
                youtube: links.youtube ? `youtube.com/${links.youtube}` : "",
            },
        };
        updateUserInfo(transformed);
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
                            {...register("fullName", {
                                required: "Full name is required",
                            })}
                            fullWidth
                            placeholder="Full name"
                            error={!!errors.fullName}
                            sx={textFieldSx}
                        />
                        {errors.fullName && (
                            <AlertBox severity="error" variant="standard" sx={{ mt: 1 }}>
                                {errors.fullName.message}
                            </AlertBox>
                        )}
                    </Box>

                    {/* Phone Number */}
                    <Box sx={{ mb: 1.5 }}>
                        <TextField
                            {...register("phoneNumber", {
                                required: "Phone number is required",
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: "Please enter a valid phone number",
                                },
                            })}
                            fullWidth
                            placeholder="Phone number"
                            error={!!errors.phoneNumber}
                            sx={textFieldSx}
                        />
                        {errors.phoneNumber && (
                            <AlertBox severity="error" variant="standard" sx={{ mt: 1 }}>
                                {errors.phoneNumber.message}
                            </AlertBox>
                        )}
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
                    {/* Website */}
                    <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                            Website
                        </Typography>
                        <TextField
                            {...register("links.website")}
                            fullWidth
                            placeholder="Website (http(s)://..)"
                            sx={textFieldSx}
                        />
                    </Box>

                    {/* Facebook */}
                    <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                            Facebook
                        </Typography>
                        <TextField
                            {...register("links.facebook")}
                            fullWidth
                            placeholder="Username"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start" sx={adornmentSx}>
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

                    {/* LinkedIn */}
                    <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                            LinkedIn
                        </Typography>
                        <TextField
                            {...register("links.linkedin")}
                            fullWidth
                            placeholder="Public Profile URL"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start" sx={adornmentSx}>
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

                    {/* Twitter */}
                    <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                            X (Twitter)
                        </Typography>
                        <TextField
                            {...register("links.twitter")}
                            fullWidth
                            placeholder="Username"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start" sx={adornmentSx}>
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

                    {/* YouTube */}
                    <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                            YouTube
                        </Typography>
                        <TextField
                            {...register("links.youtube")}
                            fullWidth
                            placeholder="Username"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start" sx={adornmentSx}>
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
