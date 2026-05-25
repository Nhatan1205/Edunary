using System;
using System.Collections.Generic;

namespace Edunary.Application.CourseReviews.Services;

// Helper classes for deserialization of snapshots
public class SnapshotMediaDto
{
    public int Id { get; set; }
    public string FileName { get; set; }
    public string FileUrl { get; set; }
    public string ContentType { get; set; }
    public string Duration { get; set; }
    public long FileSize { get; set; }
}

public class SnapshotQuizDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string RelatedItemId { get; set; }
    public string ItemId { get; set; }
    public int TimeLimitMinutes { get; set; }
    public int PassingScore { get; set; }
    public int MaxAttempts { get; set; }
    public bool ShowCorrectAnswers { get; set; }
    public bool RandomizeQuestions { get; set; }
    public List<SnapshotQuizQuestionDto> Questions { get; set; }
}

public class SnapshotQuizQuestionDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Type { get; set; }
    public string Explanation { get; set; }
    public int SortOrder { get; set; }
    public List<SnapshotQuizChoiceDto> Choices { get; set; }
}

public class SnapshotQuizChoiceDto
{
    public int Id { get; set; }
    public string Text { get; set; }
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }
}

public class SnapshotAssignmentDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string ItemId { get; set; }
    public string Description { get; set; }
    public string Instructions { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public List<SnapshotAssignmentQuestionDto> Questions { get; set; }
}

public class SnapshotAssignmentQuestionDto
{
    public int Id { get; set; }
    public string QuestionText { get; set; }
    public string ExampleAnswer { get; set; }
    public int SortOrder { get; set; }
}

public class ComparisonResultDto
{
    public int CourseId { get; set; }
    public string CourseTitle { get; set; }
    public string CourseSubtitle { get; set; }
    public string CourseImageUrl { get; set; }
    public bool HasChanges { get; set; }
    public bool NoSnapshot { get; set; }
    public DateTimeOffset? SnapshotTakenAt { get; set; }
    public int? ApprovedSubmissionNumber { get; set; }
    public int TotalChanges { get; set; }
    public List<ChangeGroupDto> ChangeGroups { get; set; } = new();
    public List<CurriculumSectionComparisonDto> CurriculumComparison { get; set; } = new();
    public List<QuizComparisonDto> QuizComparison { get; set; } = new();
    public List<AssignmentComparisonDto> AssignmentComparison { get; set; } = new();
}

public class ChangeGroupDto
{
    public string Category { get; set; }
    public List<ChangedFieldDto> Changes { get; set; } = new();
}

public class ChangedFieldDto
{
    public string Field { get; set; }
    public string ChangeType { get; set; }
    public string OldValue { get; set; }
    public string NewValue { get; set; }
    public string Summary { get; set; }
    public List<ChangeDetailDto> Details { get; set; } = new();
}

public class ChangeDetailDto
{
    public string Type { get; set; }
    public string Value { get; set; }
    public string Item { get; set; }
    public string OldValue { get; set; }
    public string NewValue { get; set; }
}

public class CurriculumSectionComparisonDto
{
    public string SectionId { get; set; }
    public string Status { get; set; }
    public string OldTitle { get; set; }
    public string NewTitle { get; set; }
    public int OldIndex { get; set; }
    public int NewIndex { get; set; }
    public List<CurriculumItemComparisonDto> Items { get; set; } = new();
}

public class CurriculumItemComparisonDto
{
    public string ItemId { get; set; }
    public string Type { get; set; }
    public string Status { get; set; }
    public string OldTitle { get; set; }
    public string NewTitle { get; set; }
    public int OldIndex { get; set; }
    public int NewIndex { get; set; }
    public int? QuizId { get; set; }
    public int? AssignmentId { get; set; }
    public List<PropertyChangeDto> PropertyChanges { get; set; } = new();
}

public class PropertyChangeDto
{
    public string PropertyName { get; set; }
    public string OldValue { get; set; }
    public string NewValue { get; set; }
}

public class QuizComparisonDto
{
    public int QuizId { get; set; }
    public string ItemId { get; set; }
    public string Status { get; set; }
    public string OldTitle { get; set; }
    public string NewTitle { get; set; }
    public List<QuizSettingChangeDto> SettingChanges { get; set; } = new();
    public List<QuizQuestionComparisonDto> Questions { get; set; } = new();
}

public class QuizSettingChangeDto
{
    public string SettingName { get; set; }
    public string OldValue { get; set; }
    public string NewValue { get; set; }
}

public class QuizQuestionComparisonDto
{
    public int QuestionId { get; set; }
    public string Status { get; set; }
    public string OldName { get; set; }
    public string NewName { get; set; }
    public string OldType { get; set; }
    public string NewType { get; set; }
    public string OldExplanation { get; set; }
    public string NewExplanation { get; set; }
    public int OldSortOrder { get; set; }
    public int NewSortOrder { get; set; }
    public List<QuizChoiceComparisonDto> Choices { get; set; } = new();
}

public class QuizChoiceComparisonDto
{
    public int ChoiceId { get; set; }
    public string Status { get; set; }
    public string OldText { get; set; }
    public string NewText { get; set; }
    public bool OldIsCorrect { get; set; }
    public bool NewIsCorrect { get; set; }
    public int OldSortOrder { get; set; }
    public int NewSortOrder { get; set; }
}

public class AssignmentComparisonDto
{
    public int AssignmentId { get; set; }
    public string ItemId { get; set; }
    public string Status { get; set; }
    public string OldTitle { get; set; }
    public string NewTitle { get; set; }
    public List<AssignmentSettingChangeDto> SettingChanges { get; set; } = new();
    public List<AssignmentQuestionComparisonDto> Questions { get; set; } = new();
}

public class AssignmentSettingChangeDto
{
    public string SettingName { get; set; }
    public string OldValue { get; set; }
    public string NewValue { get; set; }
}

public class AssignmentQuestionComparisonDto
{
    public int QuestionId { get; set; }
    public string Status { get; set; }
    public string OldQuestionText { get; set; }
    public string NewQuestionText { get; set; }
    public string OldExampleAnswer { get; set; }
    public string NewExampleAnswer { get; set; }
    public int OldSortOrder { get; set; }
    public int NewSortOrder { get; set; }
}
