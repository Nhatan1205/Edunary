import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import PageTitle from "../../../components/PageTitle";
import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import useGetSystemSettings from "../../../hooks/system-settings-hooks/useGetSystemSettings";
import useUpdateSystemSettings from "../../../hooks/system-settings-hooks/useUpdateSystemSettings";
import { formatDate } from "../../../utils/helpers";

// ─── Config ──────────────────────────────────────────────────────────────────

const TABS = [
  {
    label: "Email",
    Icon: EmailOutlinedIcon,
    sections: [
      { header: "SMTP Configuration", keys: ["Email_Host", "Email_Port", "Email_UseSsl"] },
      { header: "Authentication", keys: ["Email_Username", "Email_Password"] },
      { header: "Sender Information", keys: ["Email_FromName", "Email_FromAddress"] },
    ],
  },
  {
    label: "Stripe",
    Icon: CreditCardOutlinedIcon,
    sections: [
      { header: "API Keys", keys: ["Stripe_PublishableKey", "Stripe_SecretKey"] },
    ],
  },
  {
    label: "Cloudinary",
    Icon: CloudOutlinedIcon,
    sections: [
      { header: "Storage Settings", keys: ["Cloudinary_CloudName", "Cloudinary_ApiKey", "Cloudinary_ApiSecret"] },
    ],
  },
  {
    label: "Digital Ocean",
    Icon: StorageOutlinedIcon,
    sections: [
      {
        header: "Spaces Configuration",
        keys: [
          "DigitalOcean_AccessKey",
          "DigitalOcean_SecretKey",
          "DigitalOcean_SpaceName",
          "DigitalOcean_SpacesRegion",
          "DigitalOcean_Endpoint",
          "DigitalOcean_CDNEndpoint",
        ],
      },
    ],
  },
  {
    label: "AI services",
    Icon: SmartToyOutlinedIcon,
    sections: [
      { header: "Chatbot service", keys: ["Chatbot_ServiceUrl"] },
    ],
  },
];

const formatLabel = (key) => {
  const withoutPrefix = key.includes("_") ? key.substring(key.indexOf("_") + 1) : key;
  return withoutPrefix
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\s+/g, " ");
};

// Detect sensitive fields by key name — no hardcoded list
const isSensitiveKey = (key) => {
  const lower = key.toLowerCase();
  return lower.includes("key") || lower.includes("secret") || lower.includes("password");
};

function SettingRow({ setting, isEditing, register }) {
  const [showValue, setShowValue] = useState(false);
  const [copied, setCopied] = useState(false);
  const isSensitive = isSensitiveKey(setting.key);

  const handleCopy = () => {
    if (!setting.value) return;
    navigator.clipboard.writeText(setting.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2.5,
        py: 2,
        gap: 3,
      }}
    >
      {/* Label */}
      <Typography
        variant="body2"
        fontWeight={600}
        color="text.primary"
        sx={{ width: 180, flexShrink: 0 }}
      >
        {formatLabel(setting.key)}
      </Typography>

      {/* Input */}
      <TextField
        size="small"
        type={isSensitive && !showValue ? "password" : "text"}
        placeholder="Not configured"
        {...(isEditing
          ? register(setting.key)
          : { value: setting.value || "" }
        )}
        slotProps={{
          htmlInput: {
            readOnly: !isEditing,
            autoComplete: "off",
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {/* Eye toggle — only for sensitive fields */}
                {isSensitive && (
                  <Tooltip title={showValue ? "Hide" : "Show"} placement="top">
                    <IconButton
                      size="small"
                      onClick={() => setShowValue((p) => !p)}
                      tabIndex={-1}
                      sx={{ color: "text.disabled", "&:hover": { color: "text.secondary" } }}
                    >
                      {showValue
                        ? <VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
                        : <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                      }
                    </IconButton>
                  </Tooltip>
                )}

                {/* Copy button — all fields */}
                <Tooltip title={copied ? "Copied!" : "Copy"} placement="top">
                  <IconButton
                    size="small"
                    onClick={handleCopy}
                    tabIndex={-1}
                    edge="end"
                    sx={{
                      color: copied ? "brand.main" : "text.disabled",
                      "&:hover": { color: copied ? "brand.dark" : "text.secondary" },
                      transition: "color 0.2s",
                    }}
                  >
                    {copied
                      ? <CheckOutlinedIcon sx={{ fontSize: 16 }} />
                      : <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
                    }
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          width: 360,
          flexShrink: 0,
          "& .MuiOutlinedInput-root": {
            bgcolor: isEditing ? "background.paper" : "#f5f5f5",
            transition: "background-color 0.2s",
            "& fieldset": {
              borderColor: isEditing ? "divider" : "transparent",
              transition: "border-color 0.2s",
            },
            "&:hover fieldset": {
              borderColor: isEditing ? "brand.light" : "transparent",
            },
            "&.Mui-focused fieldset": {
              borderColor: "brand.main",
              borderWidth: 1.5,
            },
          },
          "& .MuiInputBase-input": {
            fontSize: "0.875rem",
            WebkitTextFillColor: "inherit",
            color: "text.primary",
          },
        }}
      />

      {/* Last modified */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {setting.lastModified && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {`Updated at ${formatDate(setting.lastModified)}`}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function SystemSettingsPage() {
  const { data: settings } = useGetSystemSettings();
  const { mutate: updateSettings, isPending } = useUpdateSystemSettings();
  const { register, handleSubmit, reset, formState: { dirtyFields } } = useForm();

  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const settingMap = {};
  if (settings) {
    settings.forEach((s) => { settingMap[s.key] = s; });
  }

  const handleEdit = () => {
    const initial = {};
    if (settings) settings.forEach((s) => { initial[s.key] = s.value || ""; });
    reset(initial);
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const onSubmit = (data) => {
    // Chỉ gửi những field user đã thực sự thay đổi
    const payload = Object.entries(data)
      .filter(([key]) => dirtyFields[key])
      .map(([key, value]) => ({ key, value }));

    if (payload.length === 0) {
      setIsEditing(false);
      return;
    }

    updateSettings(payload, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const currentTab = TABS[activeTab];

  return (
    <Box style={{ paddingLeft: "240px", paddingRight: "240px" }}>
      <Box component={isEditing ? "form" : "div"} onSubmit={isEditing ? handleSubmit(onSubmit) : undefined}>

        {/* ── Header ── */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <PageTitle title="System Settings" />

          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            {isEditing ? (
              <>
                <Button
                  type="button"
                  size="small"
                  startIcon={<CloseOutlinedIcon />}
                  onClick={handleCancel}
                  disabled={isPending}
                  sx={{ color: "text.secondary", textTransform: "none", fontWeight: 500 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  startIcon={<SaveOutlinedIcon />}
                  disabled={isPending}
                  sx={{
                    bgcolor: "brand.main",
                    color: "text.inverse",
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "brand.dark", boxShadow: "none" },
                  }}
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={handleEdit}
                sx={{
                  borderColor: "brand.main",
                  color: "brand.dark",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { borderColor: "brand.dark", bgcolor: "brand.lighter" },
                }}
              >
                Edit
              </Button>
            )}
          </Box>
        </Box>

        {/* ── Breadcrumbs ── */}
        <CustomBreadcrumbs />

        {/* ── Tabs ── */}
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", mt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              minHeight: 42,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                color: "text.secondary",
                minHeight: 42,
                px: 2,
                "& .MuiSvgIcon-root": { fontSize: "1rem", color: "inherit" },
                "&.Mui-selected": { color: "brand.main", fontWeight: 600 },
              },
              "& .MuiTabs-indicator": { bgcolor: "brand.main", height: 2 },
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.label}
                icon={<tab.Icon fontSize="small" />}
                iconPosition="start"
                label={tab.label}
              />
            ))}
          </Tabs>
        </Box>

        {/* ── Tab Content ── */}
        <Box sx={{ pt: 2, pb: 4 }}>
          {currentTab.sections.map((section, sIdx) => (
            <Box key={sIdx} sx={{ mb: 3.5 }}>
              {/* Section header */}
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color="text.primary"
                sx={{ mb: 1.5 }}
              >
                {section.header}
              </Typography>

              {/* Card wrapping rows */}
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  "& > :last-child": { borderBottom: "none" },
                }}
              >
                {section.keys.map((key) => {
                  const setting = settingMap[key];
                  if (!setting) return null;
                  return (
                    <SettingRow
                      key={key}
                      setting={setting}
                      isEditing={isEditing}
                      register={register}
                    />
                  );
                })}
              </Paper>
            </Box>
          ))}
        </Box>

      </Box>
    </Box>
  );
}

export default SystemSettingsPage;
