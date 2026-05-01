import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Box, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import ProfileSetupHeader from "./ProfileSetupHeader";
import ProfileSetupFooter from "./ProfileSetupFooter";
import StepGoal from "./steps/StepGoal";
import StepSkillLevel from "./steps/StepSkillLevel";
import StepField from "./steps/StepField";
import StepTopics from "./steps/StepTopics";
import StepSchedule from "./steps/StepSchedule";
import useGetMyLearnerProfile from "../../../hooks/learner-profile-hooks/useGetMyLearnerProfile";
import useUpsertLearnerProfile from "../../../hooks/learner-profile-hooks/useUpsertLearnerProfile";

const TOTAL_STEPS = 5;
const MAX_CATEGORY_FIELDS = 3;

const INITIAL_FORM = {
    goal: "",
    skillLevel: "",
    preferredCategoryIds: [],
    preferredTopicIds: [],
    weeklyHours: null,
};

function ProfileSetupPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [initialized, setInitialized] = useState(false);

    // Load existing profile to pre-fill wizard
    const { data: existingProfile, isLoading: profileLoading } = useGetMyLearnerProfile();
    const upsertMutation = useUpsertLearnerProfile();

    // Pre-fill form with existing profile data once loaded
    useEffect(() => {
        if (!profileLoading && !initialized) {
            if (existingProfile) {
                setFormData({
                    goal: existingProfile.goal || "",
                    skillLevel: existingProfile.skillLevel || "",
                    preferredCategoryIds: existingProfile.preferredCategoryIds || [],
                    preferredTopicIds: existingProfile.preferredTopicIds || [],
                    weeklyHours: existingProfile.weeklyHours || null,
                });
            }
            setInitialized(true);
        }
    }, [existingProfile, profileLoading, initialized]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const buildCommand = (data) => ({
        goal: data.goal || null,
        skillLevel: data.skillLevel || null,
        preferredCategoryIds: data.preferredCategoryIds?.length > 0 ? data.preferredCategoryIds : null,
        preferredTopicIds: data.preferredTopicIds?.length > 0 ? data.preferredTopicIds : null,
        weeklyHours: data.weeklyHours ?? null,
    });

    const handleNext = async () => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep((s) => s + 1);
        } else {
            try {
                await upsertMutation.mutateAsync(buildCommand(formData));
                toast.success("Profile saved!");
                navigate("/");
            } catch {

            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep((s) => s - 1);
    };

    const handleSaveExit = async () => {
        // Save only what the user has filled so far (partial save)
        try {
            await upsertMutation.mutateAsync(buildCommand(formData));
            toast.success("Progress saved.");
            navigate("/");
        } catch {
            // error toast handled in hook
        }
    };

    const disableNext =
        currentStep === 3 &&
        (formData.preferredCategoryIds || []).length > MAX_CATEGORY_FIELDS;

    // Show spinner while loading existing profile
    if (profileLoading || !initialized) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <CircularProgress sx={{ color: "brand.main" }} />
            </Box>
        );
    }

    let stepContent;
    if (currentStep === 1) {
        stepContent = <StepGoal formData={formData} onChange={handleChange} />;
    } else if (currentStep === 2) {
        stepContent = <StepSkillLevel currentStep={currentStep} totalSteps={TOTAL_STEPS} formData={formData} onChange={handleChange} />;
    } else if (currentStep === 3) {
        stepContent = <StepField currentStep={currentStep} totalSteps={TOTAL_STEPS} formData={formData} onChange={handleChange} />;
    } else if (currentStep === 4) {
        stepContent = <StepTopics currentStep={currentStep} totalSteps={TOTAL_STEPS} formData={formData} onChange={handleChange} />;
    } else if (currentStep === 5) {
        stepContent = <StepSchedule currentStep={currentStep} totalSteps={TOTAL_STEPS} formData={formData} onChange={handleChange} />;
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
            <ProfileSetupHeader
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                onSaveExit={handleSaveExit}
                isSaving={upsertMutation.isPending}
            />

            <Box
                component="main"
                sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    overflowY: "auto",
                    py: 4,
                    px: 2,
                }}
            >
                <Box sx={{ width: "100%", maxWidth: 760 }}>{stepContent}</Box>
            </Box>

            <ProfileSetupFooter
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                onNext={handleNext}
                onBack={handleBack}
                disableNext={disableNext || upsertMutation.isPending}
                isSubmitting={upsertMutation.isPending && currentStep === TOTAL_STEPS}
            />
        </Box>
    );
}

export default ProfileSetupPage;
