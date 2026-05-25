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
        var basicChanges = CompareBasicInfo(snapshot, currentCourse, allCategories);

        // Group changes by frontend tabs
        // Tab 1: Landing Page (Basic Info fields except Price and Messages + Topics)
        var landingPageChanges = new List<ChangedFieldDto>();
        var landingFields = new[] { "Title", "Subtitle", "Description", "Level", "Course Image", "Category" };
        landingPageChanges.AddRange(basicChanges.Where(c => landingFields.Contains(c.Field)));

        var topicChanges = CompareTopics(snapshot, currentTopics, allTopics);
        landingPageChanges.AddRange(topicChanges);

        if (landingPageChanges.Any())
        {
            result.ChangeGroups.Add(new ChangeGroupDto
            {
                Category = "Landing Page",
                Changes = landingPageChanges
            });
        }

        // Tab 2: Intended Learners
        var intendedLearnerChanges = CompareIntendedLearners(snapshot, currentCourse);
        if (intendedLearnerChanges.Any())
        {
            result.ChangeGroups.Add(new ChangeGroupDto
            {
                Category = "Intended Learners",
                Changes = intendedLearnerChanges
            });
        }

        // Tab 3: Pricing
        var pricingChanges = new List<ChangedFieldDto>();
        var pricingFields = new[] { "Price", "Allow Platform Coupons" };
        pricingChanges.AddRange(basicChanges.Where(c => pricingFields.Contains(c.Field)));
        if (pricingChanges.Any())
        {
            result.ChangeGroups.Add(new ChangeGroupDto
            {
                Category = "Pricing",
                Changes = pricingChanges
            });
        }

        // Tab 4: Course Messages
        var msgChanges = new List<ChangedFieldDto>();
        var msgFields = new[] { "Welcome Message", "Congratulations Message" };
        msgChanges.AddRange(basicChanges.Where(c => msgFields.Contains(c.Field)));
        if (msgChanges.Any())
        {
            result.ChangeGroups.Add(new ChangeGroupDto
            {
                Category = "Course Messages",
                Changes = msgChanges
            });
        }

        // Deserialize snapshot media files
        var oldMedia = new List<SnapshotMediaDto>();
        try
        {
            if (!string.IsNullOrEmpty(snapshot.MediaFilesJson))
            {
                oldMedia = JsonSerializer.Deserialize<List<SnapshotMediaDto>>(snapshot.MediaFilesJson) ?? new();
            }
        }
        catch { }

        // Tab 5: Curriculum Comparison (Structured tree)
        result.CurriculumComparison = CompareCurriculum(snapshot, currentCourse, oldMedia, currentMedia);

        // Quiz and Assignment comparisons
        result.QuizComparison = CompareQuizzesDetails(snapshot, currentQuizzes);
        result.AssignmentComparison = CompareAssignmentsDetails(snapshot, currentAssignments);

        // Compute total changes
        result.TotalChanges = result.ChangeGroups.Sum(g => g.Changes.Count)
            + result.CurriculumComparison.Count(c => c.Status != "unchanged")
            + result.CurriculumComparison.SelectMany(c => c.Items).Count(i => i.Status != "unchanged")
            + result.QuizComparison.Count(q => q.Status != "unchanged")
            + result.AssignmentComparison.Count(a => a.Status != "unchanged");

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

    private List<CurriculumSectionComparisonDto> CompareCurriculum(
        CourseApprovedSnapshot snapshot,
        Course current,
        List<SnapshotMediaDto> oldMedia,
        List<MediaFile> currentMedia)
    {
        var list = new List<CurriculumSectionComparisonDto>();
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
            return list;
        }

        var oldSections = oldCurriculum?.Contents ?? new();
        var newSections = newCurriculum?.Contents ?? new();

        var oldSecIds = oldSections.Select(s => s.SectionId).Where(id => id != null).ToList();
        var newSecIds = newSections.Select(s => s.SectionId).Where(id => id != null).ToList();

        var addedSec = newSections.Where(s => !oldSecIds.Contains(s.SectionId)).ToList();
        var removedSec = oldSections.Where(s => !newSecIds.Contains(s.SectionId)).ToList();
        var commonSec = newSections.Where(s => oldSecIds.Contains(s.SectionId)).ToList();

        var oldSecIndexes = oldSections.Select((s, idx) => new { s.SectionId, Index = idx }).ToDictionary(x => x.SectionId, x => x.Index);
        var newSecIndexes = newSections.Select((s, idx) => new { s.SectionId, Index = idx }).ToDictionary(x => x.SectionId, x => x.Index);

        foreach (var sec in addedSec)
        {
            list.Add(new CurriculumSectionComparisonDto
            {
                SectionId = sec.SectionId,
                Status = "added",
                NewTitle = sec.Title,
                NewIndex = newSecIndexes.GetValueOrDefault(sec.SectionId, -1),
                OldIndex = -1,
                Items = sec.Items.Select((item, idx) => new CurriculumItemComparisonDto
                {
                    ItemId = item.ItemId,
                    Type = item.Type,
                    Status = "added",
                    NewTitle = item.Title,
                    NewIndex = idx,
                    OldIndex = -1,
                    QuizId = item.QuizId > 0 ? item.QuizId : null,
                    AssignmentId = item.AssignmentId > 0 ? item.AssignmentId : null
                }).ToList()
            });
        }

        foreach (var sec in removedSec)
        {
            list.Add(new CurriculumSectionComparisonDto
            {
                SectionId = sec.SectionId,
                Status = "removed",
                OldTitle = sec.Title,
                OldIndex = oldSecIndexes.GetValueOrDefault(sec.SectionId, -1),
                NewIndex = -1,
                Items = sec.Items.Select((item, idx) => new CurriculumItemComparisonDto
                {
                    ItemId = item.ItemId,
                    Type = item.Type,
                    Status = "removed",
                    OldTitle = item.Title,
                    OldIndex = idx,
                    NewIndex = -1,
                    QuizId = item.QuizId > 0 ? item.QuizId : null,
                    AssignmentId = item.AssignmentId > 0 ? item.AssignmentId : null
                }).ToList()
            });
        }

        foreach (var newSec in commonSec)
        {
            var oldSec = oldSections.First(s => s.SectionId == newSec.SectionId);
            var itemsCompareList = new List<CurriculumItemComparisonDto>();

            var oldItems = oldSec.Items ?? new();
            var newItems = newSec.Items ?? new();

            var oldItemIds = oldItems.Select(i => i.ItemId).Where(id => id != null).ToList();
            var newItemIds = newItems.Select(i => i.ItemId).Where(id => id != null).ToList();

            var addedItems = newItems.Where(i => !oldItemIds.Contains(i.ItemId)).ToList();
            var removedItems = oldItems.Where(i => !newItemIds.Contains(i.ItemId)).ToList();
            var commonItems = newItems.Where(i => oldItemIds.Contains(i.ItemId)).ToList();

            var oldItemIndexes = oldItems.Select((i, idx) => new { i.ItemId, Index = idx }).ToDictionary(x => x.ItemId, x => x.Index);
            var newItemIndexes = newItems.Select((i, idx) => new { i.ItemId, Index = idx }).ToDictionary(x => x.ItemId, x => x.Index);

            foreach (var item in addedItems)
            {
                var itemDto = new CurriculumItemComparisonDto
                {
                    ItemId = item.ItemId,
                    Type = item.Type,
                    Status = "added",
                    NewTitle = item.Title,
                    NewIndex = newItemIndexes.GetValueOrDefault(item.ItemId, -1),
                    OldIndex = -1,
                    QuizId = item.QuizId > 0 ? item.QuizId : null,
                    AssignmentId = item.AssignmentId > 0 ? item.AssignmentId : null
                };

                if (item.Type == "lecture")
                {
                    if (item.VideoId > 0)
                    {
                        var newVid = currentMedia.FirstOrDefault(m => m.Id == item.VideoId);
                        var newVidJson = newVid != null ? JsonSerializer.Serialize(new { fileName = newVid.FileName, duration = newVid.Duration ?? "0:00", fileSize = FormatSize(newVid.FileSize), fileUrl = newVid.FileUrl }) : "";
                        itemDto.PropertyChanges.Add(new PropertyChangeDto { PropertyName = "Video", OldValue = "", NewValue = newVidJson });
                    }
                    if (!string.IsNullOrEmpty(item.Content))
                    {
                        itemDto.PropertyChanges.Add(new PropertyChangeDto { PropertyName = "Content", OldValue = "", NewValue = item.Content });
                    }
                }

                itemsCompareList.Add(itemDto);
            }

            foreach (var item in removedItems)
            {
                itemsCompareList.Add(new CurriculumItemComparisonDto
                {
                    ItemId = item.ItemId,
                    Type = item.Type,
                    Status = "removed",
                    OldTitle = item.Title,
                    OldIndex = oldItemIndexes.GetValueOrDefault(item.ItemId, -1),
                    NewIndex = -1,
                    QuizId = item.QuizId > 0 ? item.QuizId : null,
                    AssignmentId = item.AssignmentId > 0 ? item.AssignmentId : null
                });
            }

            foreach (var newItem in commonItems)
            {
                var oldItem = oldItems.First(i => i.ItemId == newItem.ItemId);
                var propertyChanges = new List<PropertyChangeDto>();

                if (oldItem.Title != newItem.Title)
                {
                    propertyChanges.Add(new PropertyChangeDto { PropertyName = "Title", OldValue = oldItem.Title, NewValue = newItem.Title });
                }

                if (oldItem.Description != newItem.Description)
                {
                    propertyChanges.Add(new PropertyChangeDto { PropertyName = "Description", OldValue = oldItem.Description, NewValue = newItem.Description });
                }

                if (oldItem.Content != newItem.Content)
                {
                    propertyChanges.Add(new PropertyChangeDto { PropertyName = "Content", OldValue = oldItem.Content, NewValue = newItem.Content });
                }

                if (oldItem.VideoId != newItem.VideoId)
                {
                    var oldVid = oldMedia.FirstOrDefault(m => m.Id == oldItem.VideoId);
                    var newVid = currentMedia.FirstOrDefault(m => m.Id == newItem.VideoId);

                    var oldVidJson = oldVid != null ? JsonSerializer.Serialize(new { fileName = oldVid.FileName, duration = oldVid.Duration ?? "0:00", fileSize = FormatSize(oldVid.FileSize), fileUrl = oldVid.FileUrl }) : "";
                    var newVidJson = newVid != null ? JsonSerializer.Serialize(new { fileName = newVid.FileName, duration = newVid.Duration ?? "0:00", fileSize = FormatSize(newVid.FileSize), fileUrl = newVid.FileUrl }) : "";

                    propertyChanges.Add(new PropertyChangeDto { PropertyName = "Video", OldValue = oldVidJson, NewValue = newVidJson });
                }
                else if (newItem.VideoId > 0)
                {
                    var oldVid = oldMedia.FirstOrDefault(m => m.Id == oldItem.VideoId);
                    var newVid = currentMedia.FirstOrDefault(m => m.Id == newItem.VideoId);

                    if (oldVid != null && newVid != null && (oldVid.FileName != newVid.FileName || oldVid.FileUrl != newVid.FileUrl || oldVid.FileSize != newVid.FileSize))
                    {
                        var oldVidJson = JsonSerializer.Serialize(new { fileName = oldVid.FileName, duration = oldVid.Duration ?? "0:00", fileSize = FormatSize(oldVid.FileSize), fileUrl = oldVid.FileUrl });
                        var newVidJson = JsonSerializer.Serialize(new { fileName = newVid.FileName, duration = newVid.Duration ?? "0:00", fileSize = FormatSize(newVid.FileSize), fileUrl = newVid.FileUrl });
                        propertyChanges.Add(new PropertyChangeDto { PropertyName = "Video", OldValue = oldVidJson, NewValue = newVidJson });
                    }
                }

                // Compare resources
                var oldResources = oldItem.Resources ?? new();
                var newResources = newItem.Resources ?? new();

                bool resourcesChanged = oldResources.Count != newResources.Count ||
                                       oldResources.Any(or => !newResources.Any(nr => nr.Id == or.Id && nr.FileName == or.FileName && nr.FileUrl == or.FileUrl));

                if (resourcesChanged)
                {
                    var oldResJson = JsonSerializer.Serialize(oldResources.Select(r => new { id = r.Id, fileName = r.FileName, fileUrl = r.FileUrl }));
                    var newResJson = JsonSerializer.Serialize(newResources.Select(r => new { id = r.Id, fileName = r.FileName, fileUrl = r.FileUrl }));
                    propertyChanges.Add(new PropertyChangeDto { PropertyName = "Resources", OldValue = oldResJson, NewValue = newResJson });
                }

                if (oldItem.QuizId != newItem.QuizId)
                {
                    propertyChanges.Add(new PropertyChangeDto { PropertyName = "QuizReference", OldValue = oldItem.QuizId.ToString(), NewValue = newItem.QuizId.ToString() });
                }

                if (oldItem.AssignmentId != newItem.AssignmentId)
                {
                    propertyChanges.Add(new PropertyChangeDto { PropertyName = "AssignmentReference", OldValue = oldItem.AssignmentId.ToString(), NewValue = newItem.AssignmentId.ToString() });
                }

                var itemStatus = propertyChanges.Any() ? "modified" : "unchanged";

                itemsCompareList.Add(new CurriculumItemComparisonDto
                {
                    ItemId = newItem.ItemId,
                    Type = newItem.Type,
                    Status = itemStatus,
                    OldTitle = oldItem.Title,
                    NewTitle = newItem.Title,
                    OldIndex = oldItemIndexes.GetValueOrDefault(newItem.ItemId, -1),
                    NewIndex = newItemIndexes.GetValueOrDefault(newItem.ItemId, -1),
                    QuizId = newItem.QuizId > 0 ? newItem.QuizId : null,
                    AssignmentId = newItem.AssignmentId > 0 ? newItem.AssignmentId : null,
                    PropertyChanges = propertyChanges
                });
            }

            var sectionStatus = "unchanged";
            if (oldSec.Title != newSec.Title)
            {
                sectionStatus = "modified";
            }
            else if (itemsCompareList.Any(i => i.Status != "unchanged"))
            {
                sectionStatus = "modified";
            }

            list.Add(new CurriculumSectionComparisonDto
            {
                SectionId = newSec.SectionId,
                Status = sectionStatus,
                OldTitle = oldSec.Title,
                NewTitle = newSec.Title,
                OldIndex = oldSecIndexes.GetValueOrDefault(newSec.SectionId, -1),
                NewIndex = newSecIndexes.GetValueOrDefault(newSec.SectionId, -1),
                Items = itemsCompareList.OrderBy(x => x.NewIndex > 0 ? x.NewIndex : x.OldIndex).ToList()
            });
        }

        return list.OrderBy(x => x.NewIndex > 0 ? x.NewIndex : x.OldIndex).ToList();
    }

    private List<QuizComparisonDto> CompareQuizzesDetails(
        CourseApprovedSnapshot snapshot,
        List<Quiz> currentQuizzes)
    {
        var list = new List<QuizComparisonDto>();
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
            list.Add(new QuizComparisonDto
            {
                QuizId = q.Id,
                ItemId = q.ItemId,
                Status = "added",
                NewTitle = q.Title,
                Questions = q.Questions?.OrderBy(x => x.SortOrder).Select(x => new QuizQuestionComparisonDto
                {
                    QuestionId = x.Id,
                    Status = "added",
                    NewName = x.Name,
                    NewType = x.Type.ToString(),
                    NewExplanation = x.Explanation,
                    NewSortOrder = x.SortOrder,
                    Choices = x.Choices?.OrderBy(c => c.SortOrder).Select(c => new QuizChoiceComparisonDto
                    {
                        ChoiceId = c.Id,
                        Status = "added",
                        NewText = c.Text,
                        NewIsCorrect = c.IsCorrect,
                        NewSortOrder = c.SortOrder
                    }).ToList() ?? new()
                }).ToList() ?? new()
            });
        }

        foreach (var q in removedQuizzes)
        {
            list.Add(new QuizComparisonDto
            {
                QuizId = q.Id,
                ItemId = q.ItemId,
                Status = "removed",
                OldTitle = q.Title,
                Questions = q.Questions?.OrderBy(x => x.SortOrder).Select(x => new QuizQuestionComparisonDto
                {
                    QuestionId = x.Id,
                    Status = "removed",
                    OldName = x.Name,
                    OldType = ((QuestionType)x.Type).ToString(),
                    OldExplanation = x.Explanation,
                    OldSortOrder = x.SortOrder,
                    Choices = x.Choices?.OrderBy(c => c.SortOrder).Select(c => new QuizChoiceComparisonDto
                    {
                        ChoiceId = c.Id,
                        Status = "removed",
                        OldText = c.Text,
                        OldIsCorrect = c.IsCorrect,
                        OldSortOrder = c.SortOrder
                    }).ToList() ?? new()
                }).ToList() ?? new()
            });
        }

        foreach (var newQ in commonQuizzes)
        {
            var oldQ = oldQuizzes.First(q => q.Id == newQ.Id);
            var settingChanges = new List<QuizSettingChangeDto>();

            if (oldQ.TimeLimitMinutes != newQ.TimeLimitMinutes)
            {
                settingChanges.Add(new QuizSettingChangeDto { SettingName = "Time Limit", OldValue = $"{oldQ.TimeLimitMinutes} minutes", NewValue = $"{newQ.TimeLimitMinutes} minutes" });
            }
            if (oldQ.PassingScore != newQ.PassingScore)
            {
                settingChanges.Add(new QuizSettingChangeDto { SettingName = "Passing Score", OldValue = $"{oldQ.PassingScore}%", NewValue = $"{newQ.PassingScore}%" });
            }
            if (oldQ.MaxAttempts != newQ.MaxAttempts)
            {
                settingChanges.Add(new QuizSettingChangeDto { SettingName = "Max Attempts", OldValue = $"{oldQ.MaxAttempts} attempts", NewValue = $"{newQ.MaxAttempts} attempts" });
            }
            if (oldQ.RandomizeQuestions != newQ.RandomizeQuestions)
            {
                settingChanges.Add(new QuizSettingChangeDto { SettingName = "Randomize Questions", OldValue = oldQ.RandomizeQuestions.ToString(), NewValue = newQ.RandomizeQuestions.ToString() });
            }
            if ((oldQ.Description ?? "") != (newQ.Description ?? ""))
            {
                settingChanges.Add(new QuizSettingChangeDto { SettingName = "Description", OldValue = oldQ.Description ?? "—", NewValue = newQ.Description ?? "—" });
            }
            if ((oldQ.RelatedItemId ?? "") != (newQ.RelatedItemId ?? ""))
            {
                settingChanges.Add(new QuizSettingChangeDto { SettingName = "Related Lecture Item", OldValue = oldQ.RelatedItemId ?? "—", NewValue = newQ.RelatedItemId ?? "—" });
            }

            var questionsCompare = CompareQuizQuestions(oldQ.Questions ?? new(), newQ.Questions?.ToList() ?? new());

            var status = "unchanged";
            if (oldQ.Title != newQ.Title || settingChanges.Any() || questionsCompare.Any(q => q.Status != "unchanged"))
            {
                status = "modified";
            }

            list.Add(new QuizComparisonDto
            {
                QuizId = newQ.Id,
                ItemId = newQ.ItemId,
                Status = status,
                OldTitle = oldQ.Title,
                NewTitle = newQ.Title,
                SettingChanges = settingChanges,
                Questions = questionsCompare
            });
        }

        return list;
    }

    private List<QuizQuestionComparisonDto> CompareQuizQuestions(List<SnapshotQuizQuestionDto> oldQuestions, List<Question> newQuestions)
    {
        var list = new List<QuizQuestionComparisonDto>();
        var oldQuestionsMapped = oldQuestions.Select(q => q).ToList();
        var newQuestionsMapped = newQuestions.Select(q => q).ToList();

        var matchedNewIds = new HashSet<int>();
        var matchedOldIdxs = new HashSet<int>();

        // 1. Try matching by Id
        foreach (var newQ in newQuestionsMapped)
        {
            var oldQIdx = oldQuestionsMapped.FindIndex(o => o.Id > 0 && newQ.Id > 0 && o.Id == newQ.Id);
            if (oldQIdx >= 0)
            {
                matchedNewIds.Add(newQ.Id);
                matchedOldIdxs.Add(oldQIdx);
                
                var oldQ = oldQuestionsMapped[oldQIdx];
                list.Add(CompareQuizQuestion(oldQ, newQ));
            }
        }

        // 2. Fallback to SortOrder or Name
        foreach (var newQ in newQuestionsMapped)
        {
            if (matchedNewIds.Contains(newQ.Id)) continue;

            var oldQIdx = oldQuestionsMapped.FindIndex(o => !matchedOldIdxs.Contains(oldQuestionsMapped.IndexOf(o)) && o.SortOrder == newQ.SortOrder);
            if (oldQIdx < 0)
            {
                oldQIdx = oldQuestionsMapped.FindIndex(o => !matchedOldIdxs.Contains(oldQuestionsMapped.IndexOf(o)) && o.Name == newQ.Name);
            }

            if (oldQIdx >= 0)
            {
                matchedNewIds.Add(newQ.Id);
                matchedOldIdxs.Add(oldQIdx);

                var oldQ = oldQuestionsMapped[oldQIdx];
                list.Add(CompareQuizQuestion(oldQ, newQ));
            }
            else
            {
                list.Add(new QuizQuestionComparisonDto
                {
                    QuestionId = newQ.Id,
                    Status = "added",
                    NewName = newQ.Name,
                    NewType = newQ.Type.ToString(),
                    NewExplanation = newQ.Explanation,
                    NewSortOrder = newQ.SortOrder,
                    Choices = newQ.Choices?.OrderBy(c => c.SortOrder).Select(c => new QuizChoiceComparisonDto
                    {
                        ChoiceId = c.Id,
                        Status = "added",
                        NewText = c.Text,
                        NewIsCorrect = c.IsCorrect,
                        NewSortOrder = c.SortOrder
                    }).ToList() ?? new()
                });
            }
        }

        // 3. Removed
        for (int i = 0; i < oldQuestionsMapped.Count; i++)
        {
            if (matchedOldIdxs.Contains(i)) continue;
            var oldQ = oldQuestionsMapped[i];
            list.Add(new QuizQuestionComparisonDto
            {
                QuestionId = oldQ.Id,
                Status = "removed",
                OldName = oldQ.Name,
                OldType = ((QuestionType)oldQ.Type).ToString(),
                OldExplanation = oldQ.Explanation,
                OldSortOrder = oldQ.SortOrder,
                Choices = oldQ.Choices?.OrderBy(c => c.SortOrder).Select(c => new QuizChoiceComparisonDto
                {
                    ChoiceId = c.Id,
                    Status = "removed",
                    OldText = c.Text,
                    OldIsCorrect = c.IsCorrect,
                    OldSortOrder = c.SortOrder
                }).ToList() ?? new()
            });
        }

        return list.OrderBy(x => x.NewSortOrder > 0 ? x.NewSortOrder : x.OldSortOrder).ToList();
    }

    private QuizQuestionComparisonDto CompareQuizQuestion(SnapshotQuizQuestionDto oldQ, Question newQ)
    {
        var status = "unchanged";
        var oldTypeStr = ((QuestionType)oldQ.Type).ToString();
        var newTypeStr = newQ.Type.ToString();

        if (oldQ.Name != newQ.Name || oldQ.Type != (int)newQ.Type || oldQ.Explanation != newQ.Explanation || oldQ.SortOrder != newQ.SortOrder)
        {
            status = "modified";
        }

        var choicesCompare = CompareQuizChoices(oldQ.Choices ?? new(), newQ.Choices?.ToList() ?? new());
        if (choicesCompare.Any(c => c.Status != "unchanged"))
        {
            status = "modified";
        }

        return new QuizQuestionComparisonDto
        {
            QuestionId = newQ.Id,
            Status = status,
            OldName = oldQ.Name,
            NewName = newQ.Name,
            OldType = oldTypeStr,
            NewType = newTypeStr,
            OldExplanation = oldQ.Explanation,
            NewExplanation = newQ.Explanation,
            OldSortOrder = oldQ.SortOrder,
            NewSortOrder = newQ.SortOrder,
            Choices = choicesCompare
        };
    }

    private List<QuizChoiceComparisonDto> CompareQuizChoices(List<SnapshotQuizChoiceDto> oldChoices, List<Choice> newChoices)
    {
        var list = new List<QuizChoiceComparisonDto>();
        var matchedNewIds = new HashSet<int>();
        var matchedOldIdxs = new HashSet<int>();

        // 1. Try matching by Id
        foreach (var newC in newChoices)
        {
            var oldCIdx = oldChoices.FindIndex(o => o.Id > 0 && newC.Id > 0 && o.Id == newC.Id);
            if (oldCIdx >= 0)
            {
                matchedNewIds.Add(newC.Id);
                matchedOldIdxs.Add(oldCIdx);

                var oldC = oldChoices[oldCIdx];
                list.Add(CompareQuizChoice(oldC, newC));
            }
        }

        // 2. Fallback to SortOrder or Text
        foreach (var newC in newChoices)
        {
            if (matchedNewIds.Contains(newC.Id)) continue;

            var oldCIdx = oldChoices.FindIndex(o => !matchedOldIdxs.Contains(oldChoices.IndexOf(o)) && o.SortOrder == newC.SortOrder);
            if (oldCIdx < 0)
            {
                oldCIdx = oldChoices.FindIndex(o => !matchedOldIdxs.Contains(oldChoices.IndexOf(o)) && o.Text == newC.Text);
            }

            if (oldCIdx >= 0)
            {
                matchedNewIds.Add(newC.Id);
                matchedOldIdxs.Add(oldCIdx);

                var oldC = oldChoices[oldCIdx];
                list.Add(CompareQuizChoice(oldC, newC));
            }
            else
            {
                list.Add(new QuizChoiceComparisonDto
                {
                    ChoiceId = newC.Id,
                    Status = "added",
                    NewText = newC.Text,
                    NewIsCorrect = newC.IsCorrect,
                    NewSortOrder = newC.SortOrder
                });
            }
        }

        // 3. Removed
        for (int i = 0; i < oldChoices.Count; i++)
        {
            if (matchedOldIdxs.Contains(i)) continue;
            var oldC = oldChoices[i];
            list.Add(new QuizChoiceComparisonDto
            {
                ChoiceId = oldC.Id,
                Status = "removed",
                OldText = oldC.Text,
                OldIsCorrect = oldC.IsCorrect,
                OldSortOrder = oldC.SortOrder
            });
        }

        return list.OrderBy(x => x.NewSortOrder > 0 ? x.NewSortOrder : x.OldSortOrder).ToList();
    }

    private QuizChoiceComparisonDto CompareQuizChoice(SnapshotQuizChoiceDto oldC, Choice newC)
    {
        var status = "unchanged";
        if (oldC.Text != newC.Text || oldC.IsCorrect != newC.IsCorrect || oldC.SortOrder != newC.SortOrder)
        {
            status = "modified";
        }

        return new QuizChoiceComparisonDto
        {
            ChoiceId = newC.Id,
            Status = status,
            OldText = oldC.Text,
            NewText = newC.Text,
            OldIsCorrect = oldC.IsCorrect,
            NewIsCorrect = newC.IsCorrect,
            OldSortOrder = oldC.SortOrder,
            NewSortOrder = newC.SortOrder
        };
    }

    private List<AssignmentComparisonDto> CompareAssignmentsDetails(
        CourseApprovedSnapshot snapshot,
        List<Assignment> currentAssignments)
    {
        var list = new List<AssignmentComparisonDto>();
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
            list.Add(new AssignmentComparisonDto
            {
                AssignmentId = a.Id,
                ItemId = a.ItemId,
                Status = "added",
                NewTitle = a.Title,
                Questions = a.Questions?.OrderBy(x => x.SortOrder).Select(x => new AssignmentQuestionComparisonDto
                {
                    QuestionId = x.Id,
                    Status = "added",
                    NewQuestionText = x.QuestionText,
                    NewExampleAnswer = x.ExampleAnswer,
                    NewSortOrder = x.SortOrder
                }).ToList() ?? new()
            });
        }

        foreach (var a in removedAssign)
        {
            list.Add(new AssignmentComparisonDto
            {
                AssignmentId = a.Id,
                ItemId = a.ItemId,
                Status = "removed",
                OldTitle = a.Title,
                Questions = a.Questions?.OrderBy(x => x.SortOrder).Select(x => new AssignmentQuestionComparisonDto
                {
                    QuestionId = x.Id,
                    Status = "removed",
                    OldQuestionText = x.QuestionText,
                    OldExampleAnswer = x.ExampleAnswer,
                    OldSortOrder = x.SortOrder
                }).ToList() ?? new()
            });
        }

        foreach (var newA in commonAssign)
        {
            var oldA = oldAssignments.First(a => a.Id == newA.Id);
            var settingChanges = new List<AssignmentSettingChangeDto>();

            if (oldA.Description != newA.Description)
            {
                settingChanges.Add(new AssignmentSettingChangeDto { SettingName = "Description", OldValue = oldA.Description ?? "—", NewValue = newA.Description ?? "—" });
            }
            if (oldA.Instructions != newA.Instructions)
            {
                settingChanges.Add(new AssignmentSettingChangeDto { SettingName = "Instructions", OldValue = oldA.Instructions ?? "—", NewValue = newA.Instructions ?? "—" });
            }
            if (oldA.EstimatedDurationMinutes != newA.EstimatedDurationMinutes)
            {
                settingChanges.Add(new AssignmentSettingChangeDto { SettingName = "Estimated Duration", OldValue = $"{oldA.EstimatedDurationMinutes} minutes", NewValue = $"{newA.EstimatedDurationMinutes} minutes" });
            }

            var questionsCompare = CompareAssignmentQuestions(oldA.Questions ?? new(), newA.Questions?.ToList() ?? new());

            var status = "unchanged";
            if (oldA.Title != newA.Title || settingChanges.Any() || questionsCompare.Any(q => q.Status != "unchanged"))
            {
                status = "modified";
            }

            list.Add(new AssignmentComparisonDto
            {
                AssignmentId = newA.Id,
                ItemId = newA.ItemId,
                Status = status,
                OldTitle = oldA.Title,
                NewTitle = newA.Title,
                SettingChanges = settingChanges,
                Questions = questionsCompare
            });
        }

        return list;
    }

    private List<AssignmentQuestionComparisonDto> CompareAssignmentQuestions(List<SnapshotAssignmentQuestionDto> oldQuestions, List<AssignmentQuestion> newQuestions)
    {
        var list = new List<AssignmentQuestionComparisonDto>();
        var matchedNewIds = new HashSet<int>();
        var matchedOldIdxs = new HashSet<int>();

        // 1. Match by Id
        foreach (var newQ in newQuestions)
        {
            var oldQIdx = oldQuestions.FindIndex(o => o.Id > 0 && newQ.Id > 0 && o.Id == newQ.Id);
            if (oldQIdx >= 0)
            {
                matchedNewIds.Add(newQ.Id);
                matchedOldIdxs.Add(oldQIdx);

                var oldQ = oldQuestions[oldQIdx];
                list.Add(CompareAssignmentQuestion(oldQ, newQ));
            }
        }

        // 2. Fallback to SortOrder or Text
        foreach (var newQ in newQuestions)
        {
            if (matchedNewIds.Contains(newQ.Id)) continue;

            var oldQIdx = oldQuestions.FindIndex(o => !matchedOldIdxs.Contains(oldQuestions.IndexOf(o)) && o.SortOrder == newQ.SortOrder);
            if (oldQIdx < 0)
            {
                oldQIdx = oldQuestions.FindIndex(o => !matchedOldIdxs.Contains(oldQuestions.IndexOf(o)) && o.QuestionText == newQ.QuestionText);
            }

            if (oldQIdx >= 0)
            {
                matchedNewIds.Add(newQ.Id);
                matchedOldIdxs.Add(oldQIdx);

                var oldQ = oldQuestions[oldQIdx];
                list.Add(CompareAssignmentQuestion(oldQ, newQ));
            }
            else
            {
                list.Add(new AssignmentQuestionComparisonDto
                {
                    QuestionId = newQ.Id,
                    Status = "added",
                    NewQuestionText = newQ.QuestionText,
                    NewExampleAnswer = newQ.ExampleAnswer,
                    NewSortOrder = newQ.SortOrder
                });
            }
        }

        // 3. Removed
        for (int i = 0; i < oldQuestions.Count; i++)
        {
            if (matchedOldIdxs.Contains(i)) continue;
            var oldQ = oldQuestions[i];
            list.Add(new AssignmentQuestionComparisonDto
            {
                QuestionId = oldQ.Id,
                Status = "removed",
                OldQuestionText = oldQ.QuestionText,
                OldExampleAnswer = oldQ.ExampleAnswer,
                OldSortOrder = oldQ.SortOrder
            });
        }

        return list.OrderBy(x => x.NewSortOrder > 0 ? x.NewSortOrder : x.OldSortOrder).ToList();
    }

    private AssignmentQuestionComparisonDto CompareAssignmentQuestion(SnapshotAssignmentQuestionDto oldQ, AssignmentQuestion newQ)
    {
        var status = "unchanged";
        if (oldQ.QuestionText != newQ.QuestionText || oldQ.ExampleAnswer != newQ.ExampleAnswer || oldQ.SortOrder != newQ.SortOrder)
        {
            status = "modified";
        }

        return new AssignmentQuestionComparisonDto
        {
            QuestionId = newQ.Id,
            Status = status,
            OldQuestionText = oldQ.QuestionText,
            NewQuestionText = newQ.QuestionText,
            OldExampleAnswer = oldQ.ExampleAnswer,
            NewExampleAnswer = newQ.ExampleAnswer,
            OldSortOrder = oldQ.SortOrder,
            NewSortOrder = newQ.SortOrder
        };
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

    private static string FormatSize(long bytes)
    {
        string[] suffixes = { "B", "KB", "MB", "GB" };
        int counter = 0;
        decimal number = bytes;
        while (Math.Round(number / 1024) >= 1)
        {
            number /= 1024;
            counter++;
        }
        return $"{number:n1} {suffixes[counter]}";
    }

}
