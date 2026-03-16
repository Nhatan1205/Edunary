import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { Container } from "reactstrap";
import { toast } from "react-toastify";
import useUpdateUserAvatar from "../../../../hooks/useUpdateUserAvatar";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import useGetBasicUserInfo from "../../../../hooks/useGetBasicUserInfor";

function ProfilePhotoPage() {
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const { data: userInfo, isLoading: isLoadingUserInfo } = useGetBasicUserInfo();

  const updateAvatarMutation = useUpdateUserAvatar();
  const isSaving = updateAvatarMutation.isPending || updateAvatarMutation.isLoading;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and GIF images are allowed!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      setSelectedImageUrl(reader.result.toString());
    };
  };

  const handleSave = () => {
    if (!selectedImageUrl) {
      toast.warn("Please select an image first.");
      return;
    }
    updateAvatarMutation.mutate(selectedImageUrl);
  };

  return (
    <Container className="py-2 px-0">
      {/* Page Header */}
      <Box
        sx={{
          textAlign: "center",
          mb: 3,
          px: 2,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Photo
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Add a nice photo of yourself to help other users recognize you.
        </Typography>
      </Box>

      <Box sx={{ px: 6, pt: 2 }}>
        {/* Image Preview */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Image preview
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              height: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "background.alt",
              overflow: "hidden",
            }}
          >
            {isLoadingUserInfo ? (
              <LoadingSpinner size={40} color="brand.main" />
            ) : selectedImageUrl || userInfo?.avatar ? (
              <Box
                component="img"
                src={selectedImageUrl || userInfo?.avatar}
                alt="Profile preview"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <AccountCircleOutlinedIcon
                sx={{ fontSize: 160, color: "text.disabled" }}
              />
            )}
          </Paper>
        </Box>

        {/* Add / Change Image */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Add / Change Image
          </Typography>

          <Box sx={{ display: "flex", gap: 0, alignItems: "stretch" }}>
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              id="upload-avatar"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {/* Upload button */}
            <Button
              variant="outlined"
              component="label"
              htmlFor="upload-avatar"
              sx={{
                borderColor: "brand.main",
                border: "1px solid",
                color: "brand.main",
                backgroundColor: "background.default",
                "&:hover": {
                  borderColor: "brand.dark",
                  color: "brand.dark",
                },
              }}
            >
              Choose Image
            </Button>
          </Box>
        </Box>

        {/* Save Button */}
        <Box>
          <Button
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={isSaving}
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
    </Container>
  );
}

export default ProfilePhotoPage;
