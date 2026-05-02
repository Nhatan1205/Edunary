using FluentValidation;

namespace Edunary.Application.KnowledgeBase.Commands.UploadKnowledgeDocument;

public class UploadKnowledgeDocumentCommandValidator : AbstractValidator<UploadKnowledgeDocumentCommand>
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".docx", ".md"
    };

    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB (strict <)

    public UploadKnowledgeDocumentCommandValidator()
    {
        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("File name is required.")
            .Must(name => AllowedExtensions.Contains(Path.GetExtension(name)))
            .WithMessage("Only .pdf, .docx, and .md files are allowed.");

        RuleFor(x => x.FileSizeBytes)
            .LessThan(MaxFileSizeBytes)
            .WithMessage("File must be smaller than 10 MB.");
    }
}
