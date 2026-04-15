import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
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
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatLabel = (key) => {
  const withoutPrefix = key.includes("_") ? key.substring(key.indexOf("_") + 1) : key;
  return withoutPrefix
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\s+/g, " ");
};

function SettingRow({ setting, isEditing, register }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", py: 2, gap: 3 }}>
      {/* Label */}
      <Typography
        variant="body2"
        fontWeight={600}
        color="text.primary"
        sx={{ width: 180, flexShrink: 0 }}
      >
        {formatLabel(setting.key)}
      </Typography>

      {/* Input — plain text, no masking */}
      <TextField
        size="small"
        type="text"
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

      {/* Last modified — fills remaining space */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {setting.lastModified && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {`Update at ${formatDate(setting.lastModified)}`}
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
            <Box key={sIdx} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                {section.header}
              </Typography>
              <Divider sx={{ mb: 0.5 }} />

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
            </Box>
          ))}
        </Box>

      </Box>
    </Box>
  );
}

export default SystemSettingsPage;
