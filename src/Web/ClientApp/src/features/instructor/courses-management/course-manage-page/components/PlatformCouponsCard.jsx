import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import useUpdateCourse from "../../../../../hooks/course-hooks/useUpdateCourse";

function PlatformCouponsCard({ courseData, disabled = false }) {
  const updatecourseMutation = useUpdateCourse();
  const [allowPlatformCoupons, setAllowPlatformCoupons] = useState(true);

  useEffect(() => {
    setAllowPlatformCoupons(courseData?.allowPlatformCoupons ?? true);
  }, [courseData?.allowPlatformCoupons]);

  const isUpdating =
    updatecourseMutation.isPending || updatecourseMutation.isLoading;
  const isDisabled = !courseData || isUpdating || disabled;

  const buildUpdatePayload = (overrides = {}) => ({
    ...courseData,
    topicIds:
      courseData?.topicIds ?? (courseData?.topics || []).map((topic) => topic.id),
    ...overrides,
  });

  const handleTogglePlatformCoupons = (_, checked) => {
    if (isDisabled) return;

    const previousValue = allowPlatformCoupons;
    setAllowPlatformCoupons(checked);

    updatecourseMutation.mutate(
      {
        ...buildUpdatePayload(),
        allowPlatformCoupons: checked,
      },
      {
        onError: () => {
          setAllowPlatformCoupons(previousValue);
        },
      }
    );
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
          Deals Program / Platform coupons
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Let Edunary include this course in platform-funded promotions to reach
          more price-sensitive learners and improve enrollment opportunities.
          Your own instructor coupons still work as usual.
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={allowPlatformCoupons}
              onChange={handleTogglePlatformCoupons}
              disabled={isDisabled}
            />
          }
          label={
            allowPlatformCoupons
              ? "Join platform coupon campaigns"
              : "Do not join platform coupon campaigns"
          }
        />
        <Alert severity={allowPlatformCoupons ? "info" : "warning"} sx={{ mt: 2 }}>
          {allowPlatformCoupons
            ? "Recommended: Edunary can fund discounts for this course, helping it appear in more promotion opportunities without changing your instructor coupons."
            : "This course will stay at its original price during Edunary-funded campaigns, which may reduce its chance to attract promotion-driven learners."}
        </Alert>
      </CardContent>
    </Card>
  );
}

export default PlatformCouponsCard;
