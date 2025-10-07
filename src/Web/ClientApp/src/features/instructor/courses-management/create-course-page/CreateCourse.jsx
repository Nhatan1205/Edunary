import { useState } from "react";
import StepperHeader from "./StepperHeader";
import StepperFooter from "./StepperFooter";
import StepCourseCategory from "./Steps/StepCourseCategory";
import StepCourseTitle from "./Steps/StepCourseTitle";
import { useForm } from "react-hook-form";
import StepCoursePrice from "./Steps/StepCoursePrice";
import useCreateCourse from "../../../../hooks/useCreateCourse";

function CreateCourse() {
  //form data

  const createCourseMutation = useCreateCourse();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm();
  const onSubmit = (data) => {
    createCourseMutation.mutate(data);
  };

  //steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleNext = async () => {
    let valid = true;
    if (currentStep === 1) {
      valid = await trigger("title"); // "title" là tên trường bạn dùng ở StepCourseTitle
    } else if (currentStep === 2) {
      valid = await trigger("categoryId"); // ví dụ trường ở step 2
    } else if (currentStep === 3) {
      valid = await trigger("price"); // ví dụ trường ở step 3
    }

    if (!valid) return; // Nếu không hợp lệ thì không cho qua step

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  let stepContent;
  if (currentStep === 1) {
    stepContent = (
      <StepCourseTitle register={register} watch={watch} errors={errors} />
    );
  } else if (currentStep === 2) {
    stepContent = <StepCourseCategory control={control} errors={errors} />;
  } else if (currentStep === 3) {
    stepContent = <StepCoursePrice register={register} errors={errors} />;
  }

  return (
    <div className="d-flex flex-column vh-100">
      <StepperHeader currentStep={currentStep} totalSteps={totalSteps} />

      <main className="flex-fill d-flex justify-content-center py-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="text-center"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          {stepContent}
        </form>
      </main>

      <div className="mt-auto">
        <StepperFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </div>
    </div>
  );
}

export default CreateCourse;
