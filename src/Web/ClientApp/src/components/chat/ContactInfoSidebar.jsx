import React from "react";
import DOMPurify from "dompurify";
import { 
  Box, 
  Avatar, 
  Typography, 
  Stack, 
  Divider, 
  IconButton,
  Tooltip,
  Button
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import XIcon from '@mui/icons-material/X';
import defaultAvatar from "../../assets/images/avatar.jpg";

function ensureAbsoluteUrl(url) {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function SocialButton({ icon, label, href }) {
  return (
    <Tooltip title={label}>
      <IconButton
        component="a"
        href={ensureAbsoluteUrl(href)}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          border: "1.5px solid",
          borderColor: "brand.main",
          color: "brand.main",
          width: 38,
          height: 38,
          "&:hover": {
            backgroundColor: "brand.main",
            color: "#fff",
          },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
}

export default function ContactInfoSidebar({ recipient }) {
  let social = {};
  if (recipient?.links) {
    if (typeof recipient.links === "string") {
      try {
        social = JSON.parse(recipient.links);
      } catch (e) {
        social = {};
      }
    } else {
      social = recipient.links;
    }
  }


  return (
    <Box 
      sx={{ 
        width: 300, 
        borderLeft: "1px solid", 
        borderColor: "divider", 
        display: "flex", 
        flexDirection: "column", 
        height: "100%", 
        bgcolor: "background.paper",
        overflowY: "auto"
      }}
    >
      {/* Contact Head */}
      <Stack alignItems="center" spacing={2} sx={{ p: 4, textAlign: "center" }}>
        <Avatar 
          src={recipient.avatar || defaultAvatar} 
          alt={recipient.fullName}
          onError={(e) => {
            e.target.src = defaultAvatar;
          }}
          sx={{ width: 96, height: 96 }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            {recipient.fullName}
          </Typography>
          <Typography variant="body2" color="brand.main" fontWeight={600} sx={{ mt: 0.5 }}>
            {recipient.role}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => window.open(`/profile/${recipient.id}`, "_blank")}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            borderColor: "brand.main",
            color: "brand.main",
            px: 3,
            "&:hover": {
              bgcolor: "rgba(0, 167, 111, 0.08)",
              borderColor: "brand.main",
            },
          }}
        >
          Profile
        </Button>
      </Stack>

      <Divider />

      {/* Profile Details Content */}
      <Stack spacing={2.5} sx={{ p: 3 }}>
        {recipient.headline && (
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", display: "block", mb: 0.5 }}>
              Headline
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ fontStyle: "italic" }}>
              {recipient.headline}
            </Typography>
          </Box>
        )}

        {recipient.description && (
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", display: "block", mb: 0.5 }}>
              About
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(recipient.description),
              }}
            />
          </Box>
        )}

        {/* Social Links */}
        {Object.keys(social).length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", display: "block", mb: 1.5 }}>
              Social Profiles
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {social.website && (
                <SocialButton
                  icon={<LanguageIcon fontSize="small" />}
                  label="Website"
                  href={social.website}
                />
              )}
              {social.facebook && (
                <SocialButton
                  icon={<FacebookIcon fontSize="small" />}
                  label="Facebook"
                  href={social.facebook}
                />
              )}
              {social.linkedin && (
                <SocialButton
                  icon={<LinkedInIcon fontSize="small" />}
                  label="LinkedIn"
                  href={social.linkedin}
                />
              )}
              {social.youtube && (
                <SocialButton
                  icon={<YouTubeIcon fontSize="small" />}
                  label="YouTube"
                  href={social.youtube}
                />
              )}
              {social.twitter && (
                <SocialButton
                  icon={<XIcon fontSize="small" />}
                  label="X"
                  href={social.twitter}
                />
              )}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
