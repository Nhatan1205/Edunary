using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using FluentValidation;

namespace Edunary.Application.Courses.Commands.UpdateCourse;
public class UpdateCourseCommandValidator : AbstractValidator<UpdateCourseCommand>
{
    public UpdateCourseCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Id must be greater than 0.");
        RuleFor(x => x.Title)
            .MinimumLength(5).WithMessage("Title must be at least 5 characters.")
            .MaximumLength(60).WithMessage("Title must not exceed 60 characters.");
        RuleFor(x => x.Subtitle)
            .MinimumLength(5).WithMessage("Subtitle must be at least 5 characters.")
            .MaximumLength(120).WithMessage("Subtitle must not exceed 120 characters.");
        RuleFor(x => x.Description)
            .MinimumLength(200).WithMessage("Description must be at least 200 characters.");
        RuleFor(x => x.ImageUrl)
            .MinimumLength(5).WithMessage("ImageUrl must be at least 5 characters.");
        RuleFor(x => x.WelcomeMessage)
            .MaximumLength(500).WithMessage("Welcome message must not exceed 500 characters.");
        RuleFor(x => x.CongratulationsMessage)
            .MaximumLength(500).WithMessage("Congratulations message must not exceed 500 characters.");
        RuleFor(c => c.CategoryId)
           .GreaterThan(0).WithMessage("CategoryId must be greater than 0.");
        RuleFor(c => c.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be 0 or greater.");
        RuleFor(x => x.Content)
            .Must(ValidateCurriculumContent).WithMessage("All sections and curriculum items must have titles.");
    }

    private bool ValidateCurriculumContent(string content)
    {
        // Content is optional - only validate if provided
        if (string.IsNullOrEmpty(content))
        {
            return true;
        }

        try
        {
            using (JsonDocument doc = JsonDocument.Parse(content))
            {
                var root = doc.RootElement;
                
                // Check if "contents" array exists
                if (!root.TryGetProperty("contents", out JsonElement contentsElement))
                {
                    return true; // No contents, validation passes
                }

                if (contentsElement.ValueKind != JsonValueKind.Array)
                {
                    return true; // Not an array, skip validation
                }

                // Iterate through each section
                foreach (var sectionElement in contentsElement.EnumerateArray())
                {
                    // Validate section title
                    if (!sectionElement.TryGetProperty("title", out JsonElement titleElement))
                    {
                        return false;
                    }

                    string sectionTitle = titleElement.GetString();
                    if (string.IsNullOrWhiteSpace(sectionTitle))
                    {
                        return false;
                    }

                    // Validate items in section
                    if (sectionElement.TryGetProperty("items", out JsonElement itemsElement) && 
                        itemsElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var itemElement in itemsElement.EnumerateArray())
                        {
                            if (!itemElement.TryGetProperty("title", out JsonElement itemTitleElement))
                            {
                                return false;
                            }

                            string itemTitle = itemTitleElement.GetString();
                            if (string.IsNullOrWhiteSpace(itemTitle))
                            {
                                return false;
                            }
                        }
                    }
                }

                return true;
            }
        }
        catch
        {
            // If JSON parsing fails, skip validation (let other handlers deal with invalid JSON)
            return true;
        }
    }
}
