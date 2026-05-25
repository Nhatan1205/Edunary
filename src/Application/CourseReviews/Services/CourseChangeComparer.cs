using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Application.CourseProgresses.Commands.UpdateCourseProgressCommand;

namespace Edunary.Application.CourseReviews.Services;

public class CourseChangeComparer
{
    public ComparisonResultDto Compare(
        CourseApprovedSnapshot snapshot,
        Course currentCourse,
        List<MediaFile> currentMedia,
        List<Quiz> currentQuizzes,
        List<Assignment> currentAssignments,
        List<Topic> currentTopics,
        List<Category> allCategories,
        List<Topic> allTopics)
    {
        if (snapshot == null)
        {
            return new ComparisonResultDto
            {
                CourseId = currentCourse.Id,
                NoSnapshot = true,
                HasChanges = false
            };
        }

        var result = new ComparisonResultDto
        {
            CourseId = currentCourse.Id,
            NoSnapshot = false,
            SnapshotTakenAt = snapshot.Created,
            ApprovedSubmissionNumber = snapshot.Submission?.SubmissionNumber ?? 0
        };

        // 1. Basic Info
        var basicInfoChanges = CompareBasicInfo(snapshot, currentCourse, allCategories);
        if (basicInfoChanges.Any())
        {
            result.ChangeGroups.Add(new ChangeGroupDto
            {
                Category = "Basic Info",
                Changes = basicInfoChanges
            });
        }

        // 2. Intended Learners
        var intendedLearnerChanges = CompareIntendedLearners(snapshot, currentCourse);
        if (intendedLearnerChanges.Any())
        {
            result.ChangeGroups.Add(new ChangeGroupDto
            {
                Category = "Intended Learners",
                Changes = intendedLearnerChanges
            });
        }

        // 3. Topics
        var topicChanges = CompareTopics(snapshot, currentTopics, allTopics);
        if (topicChanges.Any())
        {
            result.ChangeGroups.Add(new ChangeGroupDto
            {
                Category = "Topics",
                Changes = topicChanges
            });
        }

        // 4. Media
        var mediaChanges = CompareMedia(snapshot, currentMedia);
        if (mediaChanges.Any())
        {
            result.ChangeGroups.Add(new ChangeGroupDto
            {
                Category = "Media",
                Changes = mediaChanges
            });
        }

        // 5. Curriculum
        var curriculumChanges = CompareCurriculum(snapshot, currentCourse);
        if (curriculumChanges.Any())
        {
            result.ChangeGroups.Add(new ChangeGroupDto
            {
                Category = "Curriculum",
                Changes = curriculumChanges
            });
        }

        // 6. Assessment
        var assessmentChanges = CompareAssessments(snapshot, currentQuizzes, currentAssignments);
        if (assessmentChanges.Any())
        {
            result.ChangeGroups.Add(new ChangeGroupDto
            {
                Category = "Assessment",
                Changes = assessmentChanges
            });
        }

        result.TotalChanges = result.ChangeGroups.Sum(g => g.Changes.Count);
        result.HasChanges = result.TotalChanges > 0;

        return result;
    }

    private List<ChangedFieldDto> CompareBasicInfo(CourseApprovedSnapshot snapshot, Course current, List<Category> allCategories)
    {
        var changes = new List<ChangedFieldDto>();

        CompareScalar(changes, "Title", snapshot.Title, current.Title);
        CompareScalar(changes, "Subtitle", snapshot.Subtitle, current.Subtitle);
        CompareScalar(changes, "Description", snapshot.Description, current.Description);
        CompareScalar(changes, "Level", snapshot.Level.ToString(), current.Level.ToString());
        // Format price in USD instead of local OS currency
        CompareScalar(changes, "Price", snapshot.Price.ToString("C2", System.Globalization.CultureInfo.GetCultureInfo("en-US")), current.Price.ToString("C2", System.Globalization.CultureInfo.GetCultureInfo("en-US")));
        CompareScalar(changes, "Allow Platform Coupons", snapshot.AllowPlatformCoupons.ToString(), current.AllowPlatformCoupons.ToString());
        CompareScalar(changes, "Welcome Message", snapshot.WelcomeMessage, current.WelcomeMessage);
        CompareScalar(changes, "Congratulations Message", snapshot.CongratulationsMessage, current.CongratulationsMessage);
        CompareScalar(changes, "Course Image", snapshot.ImageUrl, current.ImageUrl);

        if (snapshot.CategoryId != current.CategoryId)
        {
            var oldCat = allCategories.FirstOrDefault(c => c.Id == snapshot.CategoryId)?.Title ?? $"Category #{snapshot.CategoryId}";
            var newCat = allCategories.FirstOrDefault(c => c.Id == current.CategoryId)?.Title ?? $"Category #{current.CategoryId}";
            changes.Add(new ChangedFieldDto
            {
                Field = "Category",
                ChangeType = "modified",
                OldValue = oldCat,
                NewValue = newCat,
                Summary = $"Changed category from '{oldCat}' to '{newCat}'"
            });
        }

        return changes;
    }

    private List<ChangedFieldDto> CompareIntendedLearners(CourseApprovedSnapshot snapshot, Course current)
    {
        var changes = new List<ChangedFieldDto>();

        CompareJsonList(changes, "Learning Objectives", snapshot.LearningObjectives, current.LearningObjectives);
        CompareJsonList(changes, "Requirements", snapshot.Requirements, current.Requirements);
        CompareJsonList(changes, "Target Audience", snapshot.TargetAudience, current.TargetAudience);

        return changes;
    }

    private List<ChangedFieldDto> CompareTopics(CourseApprovedSnapshot snapshot, List<Topic> currentTopics, List<Topic> allTopics)
    {
        var changes = new List<ChangedFieldDto>();
        List<int> oldTopicIds = new();
        try
        {
            if (!string.IsNullOrEmpty(snapshot.TopicIds))
            {
                oldTopicIds = JsonSerializer.Deserialize<List<int>>(snapshot.TopicIds) ?? new();
            }
        }
        catch { }

        var newTopicIds = currentTopics.Select(t => t.Id).ToList();

        var addedIds = newTopicIds.Except(oldTopicIds).ToList();
        var removedIds = oldTopicIds.Except(newTopicIds).ToList();

        if (addedIds.Any() || removedIds.Any())
        {
            var details = new List<ChangeDetailDto>();
            foreach (var id in addedIds)
            {
                var name = allTopics.FirstOrDefault(t => t.Id == id)?.Name ?? $"Topic #{id}";
                details.Add(new ChangeDetailDto { Type = "added", Value = name });
            }
            foreach (var id in removedIds)
            {
                var name = allTopics.FirstOrDefault(t => t.Id == id)?.Name ?? $"Topic #{id}";
                details.Add(new ChangeDetailDto { Type = "removed", Value = name });
            }

            changes.Add(new ChangedFieldDto
            {
                Field = "Topics",
                ChangeType = "modified",
                Summary = $"Added {addedIds.Count} topics, removed {removedIds.Count} topics",
                Details = details
            });
        }

        return changes;
    }

    private List<ChangedFieldDto> CompareMedia(CourseApprovedSnapshot snapshot, List<MediaFile> currentMedia)
    {
        var changes = new List<ChangedFieldDto>();
        var oldMedia = new List<SnapshotMediaDto>();

        try
        {
            if (!string.IsNullOrEmpty(snapshot.MediaFilesJson))
            {
                oldMedia = JsonSerializer.Deserialize<List<SnapshotMediaDto>>(snapshot.MediaFilesJson) ?? new();
            }
        }
        catch { }

        var newMedia = currentMedia.Select(m => new SnapshotMediaDto
        {
            Id = m.Id,
            FileName = m.FileName,
            FileUrl = m.FileUrl,
            ContentType = m.ContentType
        }).ToList();

        var oldIds = oldMedia.Select(m => m.Id).ToList();
        var newIds = newMedia.Select(m => m.Id).ToList();

        var added = newMedia.Where(m => !oldIds.Contains(m.Id)).ToList();
        var removed = oldMedia.Where(m => !newIds.Contains(m.Id)).ToList();
        var common = newMedia.Where(m => oldIds.Contains(m.Id)).ToList();

        var details = new List<ChangeDetailDto>();

        foreach (var item in added)
        {
            details.Add(new ChangeDetailDto { Type = "added", Value = $"{item.FileName} ({item.ContentType})" });
        }

        foreach (var item in removed)
        {
            details.Add(new ChangeDetailDto { Type = "removed", Value = $"{item.FileName} ({item.ContentType})" });
        }

        foreach (var newItem in common)
        {
            var oldItem = oldMedia.First(m => m.Id == newItem.Id);
            if (oldItem.FileName != newItem.FileName || oldItem.FileUrl != newItem.FileUrl)
            {
                details.Add(new ChangeDetailDto
                {
                    Type = "modified",
                    Item = newItem.FileName,
                    OldValue = oldItem.FileUrl,
                    NewValue = newItem.FileUrl
                });
            }
        }

        if (details.Any())
        {
            changes.Add(new ChangedFieldDto
            {
                Field = "Course Media Files",
                ChangeType = "modified",
                Summary = $"Added {added.Count}, removed {removed.Count}, modified {details.Count(d => d.Type == "modified")} files",
                Details = details
            });
        }

        return changes;
    }

    private List<ChangedFieldDto> CompareCurriculum(CourseApprovedSnapshot snapshot, Course current)
    {
        var changes = new List<ChangedFieldDto>();
        CourseContentSchema oldCurriculum = null;
        CourseContentSchema newCurriculum = null;

        try
        {
            if (!string.IsNullOrEmpty(snapshot.Content))
            {
                oldCurriculum = JsonSerializer.Deserialize<CourseContentSchema>(snapshot.Content);
            }
        }
        catch { }

        try
        {
            if (!string.IsNullOrEmpty(current.Content))
            {
                newCurriculum = JsonSerializer.Deserialize<CourseContentSchema>(current.Content);
            }
        }
        catch { }

        if (oldCurriculum == null && newCurriculum == null)
        {
            return changes;
        }

        var oldSections = oldCurriculum?.Contents ?? new();
        var newSections = newCurriculum?.Contents ?? new();

        var oldSecIds = oldSections.Select(s => s.SectionId).Where(id => id != null).ToList();
        var newSecIds = newSections.Select(s => s.SectionId).Where(id => id != null).ToList();

        var addedSec = newSections.Where(s => !oldSecIds.Contains(s.SectionId)).ToList();
        var removedSec = oldSections.Where(s => !newSecIds.Contains(s.SectionId)).ToList();
        var commonSec = newSections.Where(s => oldSecIds.Contains(s.SectionId)).ToList();

        // 1. Sections changes
        foreach (var sec in addedSec)
        {
            changes.Add(new ChangedFieldDto
            {
                Field = $"Section: {sec.Title}",
                ChangeType = "added",
                Summary = $"Added new section with {sec.Items.Count} items"
            });
        }

        foreach (var sec in removedSec)
        {
            changes.Add(new ChangedFieldDto
            {
                Field = $"Section: {sec.Title}",
                ChangeType = "removed",
                Summary = $"Removed section and all its items"
            });
        }

        foreach (var newSec in commonSec)
        {
            var oldSec = oldSections.First(s => s.SectionId == newSec.SectionId);
            var secChangesDetails = new List<ChangeDetailDto>();

            if (oldSec.Title != newSec.Title)
            {
                secChangesDetails.Add(new ChangeDetailDto
                {
                    Type = "modified",
                    Item = "Section Title",
                    OldValue = oldSec.Title,
                    NewValue = newSec.Title
                });
            }

            // Compare Items inside section
            var oldItems = oldSec.Items ?? new();
            var newItems = newSec.Items ?? new();

            var oldItemIds = oldItems.Select(i => i.ItemId).Where(id => id != null).ToList();
            var newItemIds = newItems.Select(i => i.ItemId).Where(id => id != null).ToList();

            var addedItems = newItems.Where(i => !oldItemIds.Contains(i.ItemId)).ToList();
            var removedItems = oldItems.Where(i => !newItemIds.Contains(i.ItemId)).ToList();
            var commonItems = newItems.Where(i => oldItemIds.Contains(i.ItemId)).ToList();

            foreach (var item in addedItems)
            {
                secChangesDetails.Add(new ChangeDetailDto
                {
                    Type = "added",
                    Value = $"{item.Title} ({item.Type})"
                });
            }

            foreach (var item in removedItems)
            {
                secChangesDetails.Add(new ChangeDetailDto
                {
                    Type = "removed",
                    Value = $"{item.Title} ({item.Type})"
                });
            }

            foreach (var newItem in commonItems)
            {
                var oldItem = oldItems.First(i => i.ItemId == newItem.ItemId);
                var itemChanges = new List<string>();

                if (oldItem.Title != newItem.Title)
                {
                    itemChanges.Add($"Title: '{oldItem.Title}' → '{newItem.Title}'");
                }
                if (oldItem.Description != newItem.Description)
                {
                    itemChanges.Add("Description changed");
                }
                if (oldItem.Type != newItem.Type)
                {
                    itemChanges.Add($"Type: '{oldItem.Type}' → '{newItem.Type}'");
                }
                if (oldItem.VideoId != newItem.VideoId)
                {
                    itemChanges.Add("Video content updated");
                }
                if (oldItem.QuizId != newItem.QuizId)
                {
                    itemChanges.Add("Quiz reference updated");
                }
                if (oldItem.AssignmentId != newItem.AssignmentId)
                {
                    itemChanges.Add("Assignment reference updated");
                }

                if (itemChanges.Any())
                {
                    secChangesDetails.Add(new ChangeDetailDto
                    {
                        Type = "modified",
                        Item = newItem.Title,
                        Value = string.Join(", ", itemChanges)
                    });
                }
            }

            if (secChangesDetails.Any())
            {
                changes.Add(new ChangedFieldDto
                {
                    Field = $"Section: {newSec.Title}",
                    ChangeType = "modified",
                    Summary = $"Modified section content",
                    Details = secChangesDetails
                });
            }
        }

        return changes;
    }

    private List<ChangedFieldDto> CompareAssessments(
        CourseApprovedSnapshot snapshot,
        List<Quiz> currentQuizzes,
        List<Assignment> currentAssignments)
    {
        var changes = new List<ChangedFieldDto>();

        // Compare Quizzes
        var oldQuizzes = new List<SnapshotQuizDto>();
        try
        {
            if (!string.IsNullOrEmpty(snapshot.QuizzesJson))
            {
                oldQuizzes = JsonSerializer.Deserialize<List<SnapshotQuizDto>>(snapshot.QuizzesJson) ?? new();
            }
        }
        catch { }

        var oldQuizIds = oldQuizzes.Select(q => q.Id).ToList();
        var newQuizIds = currentQuizzes.Select(q => q.Id).ToList();

        var addedQuizzes = currentQuizzes.Where(q => !oldQuizIds.Contains(q.Id)).ToList();
        var removedQuizzes = oldQuizzes.Where(q => !newQuizIds.Contains(q.Id)).ToList();
        var commonQuizzes = currentQuizzes.Where(q => oldQuizIds.Contains(q.Id)).ToList();

        foreach (var q in addedQuizzes)
        {
            changes.Add(new ChangedFieldDto
            {
                Field = $"Quiz: {q.Title}",
                ChangeType = "added",
                Summary = $"Added new quiz with {q.Questions?.Count ?? 0} questions"
            });
        }

        foreach (var q in removedQuizzes)
        {
            changes.Add(new ChangedFieldDto
            {
                Field = $"Quiz: {q.Title}",
                ChangeType = "removed",
                Summary = "Removed quiz"
            });
        }

        foreach (var newQ in commonQuizzes)
        {
            var oldQ = oldQuizzes.First(q => q.Id == newQ.Id);
            var quizChanges = new List<ChangeDetailDto>();

            if (oldQ.Title != newQ.Title)
            {
                quizChanges.Add(new ChangeDetailDto { Type = "modified", Item = "Title", OldValue = oldQ.Title, NewValue = newQ.Title });
            }
            if (oldQ.TimeLimitMinutes != newQ.TimeLimitMinutes)
            {
                quizChanges.Add(new ChangeDetailDto { Type = "modified", Item = "Time Limit", OldValue = $"{oldQ.TimeLimitMinutes}m", NewValue = $"{newQ.TimeLimitMinutes}m" });
            }
            if (oldQ.PassingScore != newQ.PassingScore)
            {
                quizChanges.Add(new ChangeDetailDto { Type = "modified", Item = "Passing Score", OldValue = $"{oldQ.PassingScore}%", NewValue = $"{newQ.PassingScore}%" });
            }
            if (oldQ.MaxAttempts != newQ.MaxAttempts)
            {
                quizChanges.Add(new ChangeDetailDto { Type = "modified", Item = "Max Attempts", OldValue = oldQ.MaxAttempts.ToString(), NewValue = newQ.MaxAttempts.ToString() });
            }

            // Compare questions list
            var oldQuestions = oldQ.Questions ?? new List<SnapshotQuizQuestionDto>();
            var newQuestions = newQ.Questions?.OrderBy(x => x.SortOrder).ToList() ?? new List<Question>();

            if (oldQuestions.Count != newQuestions.Count)
            {
                quizChanges.Add(new ChangeDetailDto
                {
                    Type = "modified",
                    Item = "Questions Count",
                    OldValue = oldQuestions.Count.ToString(),
                    NewValue = newQuestions.Count.ToString()
                });
            }
            else
            {
                for (int i = 0; i < newQuestions.Count; i++)
                {
                    var oldQuest = oldQuestions[i];
                    var newQuest = newQuestions[i];
                    if (oldQuest.Name != newQuest.Name)
                    {
                        quizChanges.Add(new ChangeDetailDto
                        {
                            Type = "modified",
                            Item = $"Question #{i + 1}",
                            OldValue = oldQuest.Name,
                            NewValue = newQuest.Name
                        });
                    }
                }
            }

            if (quizChanges.Any())
            {
                changes.Add(new ChangedFieldDto
                {
                    Field = $"Quiz: {newQ.Title}",
                    ChangeType = "modified",
                    Summary = "Modified quiz settings or questions",
                    Details = quizChanges
                });
            }
        }

        // Compare Assignments
        var oldAssignments = new List<SnapshotAssignmentDto>();
        try
        {
            if (!string.IsNullOrEmpty(snapshot.AssignmentsJson))
            {
                oldAssignments = JsonSerializer.Deserialize<List<SnapshotAssignmentDto>>(snapshot.AssignmentsJson) ?? new();
            }
        }
        catch { }

        var oldAssignIds = oldAssignments.Select(a => a.Id).ToList();
        var newAssignIds = currentAssignments.Select(a => a.Id).ToList();

        var addedAssign = currentAssignments.Where(a => !oldAssignIds.Contains(a.Id)).ToList();
        var removedAssign = oldAssignments.Where(a => !newAssignIds.Contains(a.Id)).ToList();
        var commonAssign = currentAssignments.Where(a => oldAssignIds.Contains(a.Id)).ToList();

        foreach (var a in addedAssign)
        {
            changes.Add(new ChangedFieldDto
            {
                Field = $"Assignment: {a.Title}",
                ChangeType = "added",
                Summary = "Added new assignment"
            });
        }

        foreach (var a in removedAssign)
        {
            changes.Add(new ChangedFieldDto
            {
                Field = $"Assignment: {a.Title}",
                ChangeType = "removed",
                Summary = "Removed assignment"
            });
        }

        foreach (var newA in commonAssign)
        {
            var oldA = oldAssignments.First(a => a.Id == newA.Id);
            var assignChanges = new List<ChangeDetailDto>();

            if (oldA.Title != newA.Title)
            {
                assignChanges.Add(new ChangeDetailDto { Type = "modified", Item = "Title", OldValue = oldA.Title, NewValue = newA.Title });
            }
            if (oldA.Description != newA.Description)
            {
                assignChanges.Add(new ChangeDetailDto { Type = "modified", Item = "Description", OldValue = "Modified description", NewValue = "Modified description" });
            }
            if (oldA.Instructions != newA.Instructions)
            {
                assignChanges.Add(new ChangeDetailDto { Type = "modified", Item = "Instructions", OldValue = "Modified instructions", NewValue = "Modified instructions" });
            }
            if (oldA.EstimatedDurationMinutes != newA.EstimatedDurationMinutes)
            {
                assignChanges.Add(new ChangeDetailDto { Type = "modified", Item = "Estimated Duration", OldValue = $"{oldA.EstimatedDurationMinutes}m", NewValue = $"{newA.EstimatedDurationMinutes}m" });
            }

            if (assignChanges.Any())
            {
                changes.Add(new ChangedFieldDto
                {
                    Field = $"Assignment: {newA.Title}",
                    ChangeType = "modified",
                    Summary = "Modified assignment details",
                    Details = assignChanges
                });
            }
        }

        return changes;
    }

    private void CompareScalar(List<ChangedFieldDto> changes, string fieldName, string oldVal, string newVal)
    {
        if (oldVal != newVal && !(string.IsNullOrEmpty(oldVal) && string.IsNullOrEmpty(newVal)))
        {
            changes.Add(new ChangedFieldDto
            {
                Field = fieldName,
                ChangeType = "modified",
                OldValue = oldVal ?? string.Empty,
                NewValue = newVal ?? string.Empty,
                Summary = $"Changed {fieldName}"
            });
        }
    }

    private void CompareJsonList(List<ChangedFieldDto> changes, string fieldName, string oldJson, string newJson)
    {
        List<string> oldList = new();
        List<string> newList = new();

        try
        {
            if (!string.IsNullOrEmpty(oldJson))
            {
                oldList = JsonSerializer.Deserialize<List<string>>(oldJson) ?? new();
            }
        }
        catch { }

        try
        {
            if (!string.IsNullOrEmpty(newJson))
            {
                newList = JsonSerializer.Deserialize<List<string>>(newJson) ?? new();
            }
        }
        catch { }

        var added = newList.Except(oldList).ToList();
        var removed = oldList.Except(newList).ToList();

        if (added.Any() || removed.Any())
        {
            var details = new List<ChangeDetailDto>();
            foreach (var item in added)
            {
                details.Add(new ChangeDetailDto { Type = "added", Value = item });
            }
            foreach (var item in removed)
            {
                details.Add(new ChangeDetailDto { Type = "removed", Value = item });
            }

            changes.Add(new ChangedFieldDto
            {
                Field = fieldName,
                ChangeType = "modified",
                Summary = $"Added {added.Count}, removed {removed.Count} items",
                Details = details
            });
        }
    }

    // Helper classes for deserialization of snapshots
    private class SnapshotMediaDto
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public string ContentType { get; set; }
    }

    private class SnapshotQuizDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string ItemId { get; set; }
        public int TimeLimitMinutes { get; set; }
        public int PassingScore { get; set; }
        public int MaxAttempts { get; set; }
        public bool ShowCorrectAnswers { get; set; }
        public bool RandomizeQuestions { get; set; }
        public List<SnapshotQuizQuestionDto> Questions { get; set; }
    }

    private class SnapshotQuizQuestionDto
    {
        public string Name { get; set; }
        public int Type { get; set; }
        public string Explanation { get; set; }
        public int SortOrder { get; set; }
        public List<SnapshotQuizChoiceDto> Choices { get; set; }
    }

    private class SnapshotQuizChoiceDto
    {
        public string Text { get; set; }
        public bool IsCorrect { get; set; }
        public int SortOrder { get; set; }
    }

    private class SnapshotAssignmentDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string ItemId { get; set; }
        public string Description { get; set; }
        public string Instructions { get; set; }
        public int EstimatedDurationMinutes { get; set; }
    }
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
