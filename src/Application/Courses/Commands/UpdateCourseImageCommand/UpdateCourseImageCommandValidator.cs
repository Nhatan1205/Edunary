using FluentValidation;

namespace Edunary.Application.Courses.Commands.UpdateCourseImageCommand;
public class UpdateCourseImageCommandValidator : AbstractValidator<UpdateCourseImageCommand>
{
    public UpdateCourseImageCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0.");
        When(x => x.Image != null, () =>
        {
            RuleFor(x => x.Image.FileName)
                .NotEmpty().WithMessage("File name is required.")
                .Must(HaveSafeFileName).WithMessage("Invalid file name.");

            RuleFor(x => x.Image.Length)
                .LessThanOrEqualTo(5 * 1024 * 1024) 
                .WithMessage("File size must not exceed 5MB.");

            RuleFor(x => x.Image.FileName)
                .Must(HaveValidExtension)
                .WithMessage("Invalid file type. Allowed: jpg, jpeg, png, gif.");
        });
    }
    private bool HaveSafeFileName(string fileName)
    {
        return !string.IsNullOrWhiteSpace(fileName)
            && fileName.IndexOfAny(Path.GetInvalidFileNameChars()) < 0;
    }

    private bool HaveValidExtension(string fileName)
    {
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return allowedExtensions.Contains(ext);
    }
}
