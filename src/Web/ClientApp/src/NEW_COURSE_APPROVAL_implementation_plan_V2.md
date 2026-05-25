# Course Approval Workflow — Implementation Plan (v2)

## Background

Hiện tại `CourseStatus` chỉ có `Draft=0` và `Public=1`. Instructor publish trực tiếp, ko qua kiểm duyệt. Cần workflow: Instructor submit → Admin review → approve/request changes → feedback loop → publish.

---

## Confirmed Decisions

- ✅ Course tạo mới → `Unpublished` (bỏ `Draft`, merge thành `Unpublished`)
- ✅ Collaborator có `Manage` permission → được submit for review
- ✅ Unpublished → re-publish phải submit review lại (same feedback loop)
- ✅ Snapshot: tách thành individual columns + JSON columns nhỏ (ko dùng 1 JSON lớn)
- ✅ Collaborators **ko lưu** trong snapshot (ko liên quan nội dung course)
- ✅ Snapshot chỉ lưu fields liên quan editing, **bỏ**: Ratings, TotalStudents, TotalRating, TotalRatingStudent
- ✅ Email notification dùng HTML template riêng
- ✅ MediaFile snapshot lưu URL + metadata đủ để admin phân biệt video cũ/mới
- ✅ Student chỉ thấy course khi status = `Public`

---

## Proposed Changes

### Phase 1: Domain & Data Foundation

---

#### [MODIFY] [CourseStatus.cs](file:///d:/Year-4/Capstone/FinalProject/Edunary/src/Domain/Enums/CourseStatus.cs)

```csharp
public enum CourseStatus
{
    Unpublished = 0,    // Tạo mới hoặc admin rút khỏi marketplace (thay Draft)
    Public = 1,
    PendingReview = 2,  // Instructor đã submit, chờ admin
    NeedsChanges = 3,   // Admin yêu cầu sửa
}
```

> [!IMPORTANT]
> `Draft=0` → `Unpublished=0` — giá trị int giữ nguyên = 0, nên data cũ tương thích. Nhưng **tất cả code** reference `CourseStatus.Draft` phải đổi thành `CourseStatus.Unpublished`.

---

#### [NEW] `Domain/Enums/ReviewFeedbackCategory.cs`

```csharp
public enum ReviewFeedbackCategory
{
    CourseContent = 0,
    VideoQuality = 1,
    AudioQuality = 2,
    CourseLandingPage = 3,
    CourseImage = 4,
    CourseTitleSubtitle = 5,
    CourseDescription = 6,
    IntendedLearners = 7,
    InstructorProfile = 8,
    Policy = 9,
    Pricing = 10,
    Other = 99
}
```

#### [NEW] `Domain/Enums/ReviewFeedbackType.cs`

```csharp
public enum ReviewFeedbackType
{
    RequiredFix = 0,
    RecommendedImprovement = 1
}
```

#### [NEW] `Domain/Enums/ReviewSubmissionStatus.cs`

```csharp
public enum ReviewSubmissionStatus
{
    Pending = 0,
    NeedsChanges = 1,
    Approved = 2
}
```

---

#### [NEW] [CourseReviewSubmission.cs](file:///d:/Year-4/Capstone/FinalProject/Edunary/src/Domain/Entities/CourseReviewSubmission.cs)

Mỗi lần submit/resubmit = 1 record mới.

```csharp
public class CourseReviewSubmission : BaseAuditableEntity
{
    public int CourseId { get; set; }    // SubmittedByUserId → dùng CreatedBy từ BaseAuditableEntity
    public ReviewSubmissionStatus Status { get; set; }
    public string ReviewedByAdminId { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string AdminNote { get; set; }
    public int SubmissionNumber { get; set; }

    // Navigation
    public Course Course { get; set; } = null!;
    public ICollection<CourseReviewFeedback> Feedbacks { get; set; } = new List<CourseReviewFeedback>();
}
```

---

#### [NEW] [CourseReviewFeedback.cs](file:///d:/Year-4/Capstone/FinalProject/Edunary/src/Domain/Entities/CourseReviewFeedback.cs)

```csharp
public class CourseReviewFeedback : BaseAuditableEntity
{
    public int CourseReviewSubmissionId { get; set; }
    public ReviewFeedbackType FeedbackType { get; set; }
    public ReviewFeedbackCategory Category { get; set; }
    public string Content { get; set; }
    public bool IsResolved { get; set; }

    // Navigation
    public CourseReviewSubmission Submission { get; set; } = null!;
}
```

**Frontend UI cho feedback:**
- **Admin side**: Preview course (giao diện student) + review panel bên phải. Mỗi feedback = card chọn type/category/content. Auto-save khi admin save.
- **Instructor side**: Hiển thị 2 nhóm: "Required Fixes" (đỏ) | "Recommendations" (vàng). Mỗi item có checkbox `isResolved`. Nút Resubmit disabled khi còn required fix chưa resolved.

---

#### [NEW] [CourseApprovedSnapshot.cs](file:///d:/Year-4/Capstone/FinalProject/Edunary/src/Domain/Entities/CourseApprovedSnapshot.cs)

Tách thành individual columns cho course fields + JSON columns cho nested data.

```csharp
public class CourseApprovedSnapshot : BaseAuditableEntity
{
    public int CourseId { get; set; }
    public int CourseReviewSubmissionId { get; set; }

    // ── Course scalar fields (copy từ Course, chỉ fields liên quan editing) ──
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Description { get; set; }
    public CourseLevel Level { get; set; }
    public string LearningObjectives { get; set; }    // JSON string (same as Course)
    public string Requirements { get; set; }           // JSON string
    public string TargetAudience { get; set; }         // JSON string
    public string ImageUrl { get; set; }
    public string WelcomeMessage { get; set; }
    public string CongratulationsMessage { get; set; }
    public float Price { get; set; }
    public int CategoryId { get; set; }
    public bool AllowPlatformCoupons { get; set; }

    // ── JSON columns cho nested/complex data ──
    public string ContentJson { get; set; }            // Curriculum JSON (copy Course.Content)
    public string MediaFilesJson { get; set; }         // JSON array of media file snapshots
    public string QuizzesJson { get; set; }            // JSON array of quiz + questions + choices
    public string AssignmentsJson { get; set; }        // JSON array of assignment + questions
    public string TopicIds { get; set; }               // JSON array of int e.g. [1,5,12]

    // Navigation
    public Course Course { get; set; } = null!;
    public CourseReviewSubmission Submission { get; set; } = null!;
}
```

**JSON structures cho từng column:**

`MediaFilesJson`:
```json
[
  {
    "id": 1,
    "fileName": "intro.mp4",
    "fileUrl": "https://...",
    "contentType": "video/mp4",
    "duration": "10:30",
    "thumbnailUrl": "https://...",
    "fileSize": 52428800
  }
]
```

`QuizzesJson`:
```json
[
  {
    "id": 1,
    "title": "Quiz 1",
    "itemId": "section-1-item-2",
    "timeLimitMinutes": 30,
    "passingScore": 70,
    "maxAttempts": 3,
    "showCorrectAnswers": true,
    "randomizeQuestions": false,
    "questions": [
      {
        "name": "What is X?",
        "type": 0,
        "explanation": "...",
        "sortOrder": 1,
        "choices": [
          { "text": "A", "isCorrect": true, "sortOrder": 1 },
          { "text": "B", "isCorrect": false, "sortOrder": 2 }
        ]
      }
    ]
  }
]
```

`AssignmentsJson`:
```json
[
  {
    "id": 1,
    "title": "Assignment 1",
    "itemId": "section-2-item-1",
    "description": "...",
    "instructions": "...",
    "estimatedDurationMinutes": 60,
    "questions": [
      { "questionText": "...", "exampleAnswer": "...", "sortOrder": 1 }
    ]
  }
]
```

`TopicIdsJson`:
```json
[1, 5, 12]
```

---

#### [MODIFY] [Course.cs](file:///d:/Year-4/Capstone/FinalProject/Edunary/src/Domain/Entities/Course.cs)

Thêm navigation:
```csharp
public ICollection<CourseReviewSubmission> ReviewSubmissions { get; set; } = new List<CourseReviewSubmission>();
public ICollection<CourseApprovedSnapshot> ApprovedSnapshots { get; set; } = new List<CourseApprovedSnapshot>();
```

---

#### [MODIFY] [IApplicationDbContext.cs](file:///d:/Year-4/Capstone/FinalProject/Edunary/src/Application/Common/Interfaces/IApplicationDbContext.cs)

Thêm 3 DbSet:
```csharp
DbSet<CourseReviewSubmission> CourseReviewSubmissions { get; }
DbSet<CourseReviewFeedback> CourseReviewFeedbacks { get; }
DbSet<CourseApprovedSnapshot> CourseApprovedSnapshots { get; }
```

---

#### [NEW] EF Configurations — `Infrastructure/Data/Configurations/`

- `CourseReviewSubmissionConfiguration.cs` — FK to Course, index on `(CourseId, Status)`
- `CourseReviewFeedbackConfiguration.cs` — FK to CourseReviewSubmission, cascade delete
- `CourseApprovedSnapshotConfiguration.cs` — FK to Course + Submission. JSON columns = `nvarchar(max)`

---

#### Global: Rename `CourseStatus.Draft` → `CourseStatus.Unpublished`

Search & replace toàn project. Files affected:
- `CreateCourseCommand` — set default status
- `UpdateCourseCommand` — status check
- `GetCoursesWithPaginationQuery` — filter
- `GetHomepageCoursesQuery` — filter
- `GetPublicCourseByIdQuery` — filter
- `GetCoursesAuthorWithPaginationQuery` — nếu có filter
- Frontend `web-api-client.ts` sẽ tự regenerate

---

#### ✅ Verification Phase 1
- Migration chạy thành công
- Existing courses vẫn hoạt động (Draft=0 → Unpublished=0 tương thích)
- Seed test data

---

### Phase 2: Instructor Submit & Resubmit Flow

---

#### [NEW] `Application/CourseReviews/Commands/SubmitCourseForReviewCommand/`

**API**: `POST /api/CourseReviews/submit`

**Request**: `{ courseId: int }`

**Logic**:
1. Validate: user có `CoursePermission.Manage` qua `_courseAuth.HasCourseAccessAsync()` (Owner hoặc Collaborator)
2. Validate: `Course.Status` = `Unpublished` hoặc `NeedsChanges`
3. Nếu `NeedsChanges`: check tất cả `CourseReviewFeedback` của submission gần nhất có `FeedbackType = RequiredFix` đều `IsResolved = true`
4. Tạo `CourseReviewSubmission` (SubmissionNumber = previous count + 1)
5. Update `Course.Status = PendingReview`

**Response**: `ReturnResult<SubmittedReviewDto>` → `{ submissionId, submissionNumber, status }`

---

#### [NEW] `Application/CourseReviews/Commands/ResolveReviewFeedbackCommand/`

**API**: `PUT /api/CourseReviews/feedback/{feedbackId}/resolve`

**Request**: `{ feedbackId: int, isResolved: bool }`

**Logic**:
1. Verify feedback's submission belongs to user's course (via `_courseAuth`)
2. Update `IsResolved`
3. Return `allRequiredResolved` flag (check remaining required fixes)

---

#### [NEW] `Application/CourseReviews/Queries/GetCourseReviewStatusQuery/`

**API**: `GET /api/CourseReviews/status/{courseId}`

**Response** (compact — chỉ latest submission + feedbacks):
```json
{
  "courseId": 1,
  "courseStatus": "NeedsChanges",
  "latestSubmission": {
    "id": 5,
    "submissionNumber": 2,
    "status": "NeedsChanges",
    "reviewedAt": "...",
    "adminNote": "...",
    "feedbacks": [
      { "id": 10, "feedbackType": "RequiredFix", "category": "VideoQuality",
        "content": "...", "isResolved": false }
    ]
  },
  "allRequiredResolved": false,
  "canSubmit": false,
  "submissionHistory": [
    { "submissionNumber": 1, "status": "NeedsChanges", "createdAt": "...", "reviewedAt": "..." }
  ]
}
```

History chỉ trả summary, ko trả feedbacks cũ → payload nhỏ.

---

#### ✅ Verification Phase 2
- Submit: Unpublished → PendingReview ✓
- Submit: NeedsChanges + all required resolved → PendingReview ✓
- Submit: NeedsChanges + required NOT resolved → reject ✓
- Submit: Public/PendingReview → reject ✓
- Resolve feedback → flag update ✓

---

### Phase 3: Admin Review & Approve Flow

---

#### [NEW] `Application/CourseReviews/Queries/GetPendingReviewCoursesQuery/`

**API**: `GET /api/CourseReviews/admin/pending?pageNumber=1&pageSize=10`

**Response**: `PaginatedList<PendingReviewCourseDto>` — sort by `submittedAt ASC` (FIFO)
```json
{
  "items": [
    {
      "courseId": 1, "title": "...", "instructorName": "...", "instructorAvatar": "...",
      "submissionNumber": 2, "submittedAt": "...", "imageUrl": "...", "categoryName": "..."
    }
  ]
}
```

---

#### [NEW] `Application/CourseReviews/Queries/GetCoursePreviewForAdminQuery/`

**API**: `GET /api/CourseReviews/admin/preview/{courseId}`

**Response**: Course data y hệt `GetPublicCourseByIdDto` + thêm `currentFeedbacks[]` + `submissionInfo`

**Frontend layout** (student view đã có lecture sidebar bên phải — nên review panel nằm phía trên, dạng sticky top bar + collapsible panel):

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN REVIEW BAR (sticky top)                              │
│  [+ Add Feedback]  [Request Changes]  [Approve & Publish]   │
│  3 required fix · 1 recommendation                          │
└─────────────────────────────────────────────────────────────┘
┌────────────────────────────────┬────────────────────────────┐
│  COURSE CONTENT                │  LECTURE SIDEBAR           │
│  (y hệt giao diện student)     │  (giống student view)      │
│                                │                            │
│  - Video player                │  Section 1                 │
│  - Description                 │    ✓ Lecture 1             │
│  - Overview                    │    ✓ Lecture 2             │
│                                │  Section 2                 │
│                                │    > Lecture 3             │
└────────────────────────────────┴────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  REVIEW FEEDBACK PANEL (collapsible, below content)         │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 🔴 Required  │ Cat: VideoQuality │ Video blurry... │ ✎ ✕ │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 🟡 Recommend │ Cat: Description │ Add more...      │ ✎ ✕ │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

- **Approve & Publish**: disabled khi list có ≥1 RequiredFix
- **Request Changes**: cần ≥1 RequiredFix feedback mới bấm được

---

#### [NEW] `Application/CourseReviews/Commands/SaveReviewFeedbackCommand/`

**API**: `POST /api/CourseReviews/admin/feedback`

```json
{ "courseReviewSubmissionId": 5, "feedbackType": 0, "category": 1, "content": "..." }
```

#### [NEW] `UpdateReviewFeedbackCommand/` — `PUT /api/CourseReviews/admin/feedback/{id}`

#### [NEW] `DeleteReviewFeedbackCommand/` — `DELETE /api/CourseReviews/admin/feedback/{id}`

---

#### [NEW] `Application/CourseReviews/Commands/RequestChangesCommand/`

**API**: `POST /api/CourseReviews/admin/request-changes`

**Logic**:
1. Admin role check
2. Submission status = Pending, có ≥1 RequiredFix feedback
3. Update: submission `Status = NeedsChanges`, `ReviewedByAdminId`, `ReviewedAt`
4. Update: `Course.Status = NeedsChanges`
5. **Notify**: in-app (SignalR via `INotifyService.NotifyUserAsync`) + email (HTML template via `IEmailService.SendEmailAsync`)

---

#### [NEW] `Application/CourseReviews/Commands/ApproveCourseCommand/`

**API**: `POST /api/CourseReviews/admin/approve`

**Logic**:
1. Admin role check
2. Submission status = Pending, **ko** RequiredFix feedback (trống hoặc chỉ Recommend)
3. Update: submission `Status = Approved`, `Course.Status = Public`
4. **Tạo snapshot** — copy từng field:

```csharp
// Fetch data
var course = await _context.Courses
    .Include(c => c.MediaFiles.Where(m => !m.IsDeleted))
    .Include(c => c.Topics)
    .FirstOrDefaultAsync(c => c.Id == courseId);

var quizzes = await _context.Quizzes
    .Where(q => q.CourseId == courseId)
    .Include(q => q.Questions).ThenInclude(q => q.Choices)
    .ToListAsync();

var assignments = await _context.Assignments
    .Where(a => a.CourseId == courseId)
    .Include(a => a.Questions)
    .ToListAsync();

// Create snapshot
var snapshot = new CourseApprovedSnapshot
{
    CourseId = courseId,
    CourseReviewSubmissionId = submissionId,
    // Scalar fields
    Title = course.Title,
    Subtitle = course.Subtitle,
    Description = course.Description,
    Level = course.Level,
    LearningObjectives = course.LearningObjectives,
    Requirements = course.Requirements,
    TargetAudience = course.TargetAudience,
    ImageUrl = course.ImageUrl,
    WelcomeMessage = course.WelcomeMessage,
    CongratulationsMessage = course.CongratulationsMessage,
    Price = course.Price,
    CategoryId = course.CategoryId,
    AllowPlatformCoupons = course.AllowPlatformCoupons,
    // JSON columns
    ContentJson = course.Content,
    TopicIds = JsonSerializer.Serialize(course.Topics.Select(t => t.Id)),
    MediaFilesJson = JsonSerializer.Serialize(course.MediaFiles.Select(m => new {
        m.Id, m.FileName, m.FileUrl, m.ContentType, m.Duration, m.ThumbnailUrl, m.FileSize
    })),
    QuizzesJson = JsonSerializer.Serialize(quizzes.Select(q => new {
        q.Id, q.Title, q.ItemId, q.TimeLimitMinutes, q.PassingScore,
        q.MaxAttempts, q.ShowCorrectAnswers, q.RandomizeQuestions,
        Questions = q.Questions.OrderBy(x => x.SortOrder).Select(x => new {
            x.Name, Type = (int)x.Type, x.Explanation, x.SortOrder,
            Choices = x.Choices.OrderBy(c => c.SortOrder).Select(c => new {
                c.Text, c.IsCorrect, c.SortOrder
            })
        })
    })),
    AssignmentsJson = JsonSerializer.Serialize(assignments.Select(a => new {
        a.Id, a.Title, a.ItemId, a.Description, a.Instructions, a.EstimatedDurationMinutes,
        Questions = a.Questions.OrderBy(x => x.SortOrder).Select(x => new {
            x.QuestionText, x.ExampleAnswer, x.SortOrder
        })
    }))
};
```

5. **Notify**: in-app + email (HTML template "Course Approved")

---

#### [NEW] Email Templates — `Infrastructure/Services/EmailTemplates/`

Tham khảo template hiện tại, tạo 2 HTML templates:
- `CourseReviewNeedsChanges.html` — "Your course needs changes" + link to course management
- `CourseApproved.html` — "Congratulations! Course published" + link to public course
- `CourseUnpublished.html` — "Your course has been unpublished" + reason

---

#### [NEW] `Web/Endpoints/CourseReviews.cs`

```
// Instructor (RequireAuthorization)
POST   /api/CourseReviews/submit
GET    /api/CourseReviews/status/{courseId}
PUT    /api/CourseReviews/feedback/{feedbackId}/resolve

// Admin (RequireAuthorization + role check in handler)
GET    /api/CourseReviews/admin/pending
GET    /api/CourseReviews/admin/preview/{courseId}
POST   /api/CourseReviews/admin/feedback
PUT    /api/CourseReviews/admin/feedback/{id}
DELETE /api/CourseReviews/admin/feedback/{id}
POST   /api/CourseReviews/admin/request-changes
POST   /api/CourseReviews/admin/approve
```

---

#### ✅ Verification Phase 3
- Full flow: submit → create feedbacks → request changes → resolve → resubmit → approve
- Snapshot JSON contains correct quiz/assignment/media data
- Notifications delivered (SignalR + email)

---

### Phase 4: Post-Publish Diff Comparison & Unpublish

---

#### [NEW] `Application/CourseReviews/Queries/GetCourseChangesComparisonQuery/`

**API**: `GET /api/CourseReviews/admin/compare/{courseId}`

**Logic**:
1. Lấy snapshot mới nhất (`OrderByDescending(Created).First()`)
2. Fetch current Course + MediaFiles + Quizzes + Assignments + Topics
3. So sánh từng field → trả diff

**Kỹ thuật so sánh chi tiết:**

```csharp
public class CourseChangeComparer
{
    public ComparisonResult Compare(CourseApprovedSnapshot snapshot, Course current,
        List<MediaFileSnapshot> currentMedia, List<QuizSnapshot> currentQuizzes,
        List<AssignmentSnapshot> currentAssignments, List<int> currentTopicIds)
    {
        var changes = new List<ChangedField>();

        // 1. Scalar fields — direct compare
        CompareField(changes, "Title", "Basic Info", snapshot.Title, current.Title);
        CompareField(changes, "Subtitle", "Basic Info", snapshot.Subtitle, current.Subtitle);
        CompareField(changes, "Description", "Basic Info", snapshot.Description, current.Description);
        CompareField(changes, "Price", "Pricing", snapshot.Price, current.Price);
        CompareField(changes, "ImageUrl", "Course Image", snapshot.ImageUrl, current.ImageUrl);
        CompareField(changes, "Level", "Basic Info", snapshot.Level, current.Level);
        CompareField(changes, "CategoryId", "Basic Info", snapshot.CategoryId, current.CategoryId);
        CompareField(changes, "WelcomeMessage", "Messages", snapshot.WelcomeMessage, current.WelcomeMessage);
        CompareField(changes, "CongratulationsMessage", "Messages",
            snapshot.CongratulationsMessage, current.CongratulationsMessage);
        CompareField(changes, "AllowPlatformCoupons", "Pricing",
            snapshot.AllowPlatformCoupons, current.AllowPlatformCoupons);

        // 2. JSON string fields — parse then compare lists
        CompareJsonList(changes, "LearningObjectives", "Intended Learners",
            snapshot.LearningObjectives, current.LearningObjectives);
        CompareJsonList(changes, "Requirements", "Intended Learners",
            snapshot.Requirements, current.Requirements);
        CompareJsonList(changes, "TargetAudience", "Intended Learners",
            snapshot.TargetAudience, current.TargetAudience);

        // 3. Topics — compare int lists
        CompareIntList(changes, "Topics", "Basic Info",
            JsonSerializer.Deserialize<List<int>>(snapshot.TopicIds),
            currentTopicIds);

        // 4. Curriculum — parse Content JSON → diff sections/lectures
        CompareCurriculum(changes, snapshot.ContentJson, current.Content);

        // 5. MediaFiles — match by Id, detect added/removed/changed
        CompareMediaFiles(changes,
            JsonSerializer.Deserialize<List<MediaFileSnapshotModel>>(snapshot.MediaFilesJson),
            currentMedia);

        // 6. Quizzes — match by Id, diff questions/choices
        CompareQuizzes(changes,
            JsonSerializer.Deserialize<List<QuizSnapshotModel>>(snapshot.QuizzesJson),
            currentQuizzes);

        // 7. Assignments — match by Id, diff questions
        CompareAssignments(changes,
            JsonSerializer.Deserialize<List<AssignmentSnapshotModel>>(snapshot.AssignmentsJson),
            currentAssignments);

        return new ComparisonResult { HasChanges = changes.Any(), Changes = changes };
    }
}
```

**Response DTO:**
```json
{
  "courseId": 1,
  "snapshotTakenAt": "...",
  "hasChanges": true,
  "changes": [
    {
      "field": "Title",
      "category": "Basic Info",
      "oldValue": "React Basics",
      "newValue": "React Mastery 2026"
    },
    {
      "field": "Curriculum",
      "category": "Content",
      "summary": "Added 2 sections, removed 1 lecture",
      "oldValue": "...",
      "newValue": "..."
    },
    {
      "field": "Quiz: Quiz 1",
      "category": "Assessment",
      "summary": "Added 3 questions, modified 1",
      "details": [
        { "type": "added", "item": "Question: What is JSX?" },
        { "type": "modified", "item": "Question: What is state?", "oldValue": "...", "newValue": "..." }
      ]
    },
    {
      "field": "MediaFiles",
      "category": "Media",
      "summary": "Added 1 video, removed 1 video",
      "details": [
        { "type": "added", "item": "new_intro.mp4 (5:30, 25MB)" },
        { "type": "removed", "item": "old_intro.mp4 (3:20, 15MB)" }
      ]
    }
  ]
}
```

---

#### [NEW] `Application/CourseReviews/Commands/UnpublishCourseCommand/`

**API**: `POST /api/CourseReviews/admin/unpublish`

**Request**: `{ courseId: int, reason: string }`

**Logic**:
1. Admin role check
2. Course status = `Public`
3. `Course.Status = Unpublished`
4. Notify instructor (in-app + email "Course Unpublished" template)
5. **Impact**: enrolled students vẫn học bình thường, course biến mất khỏi marketplace

**Re-publish flow**: Instructor muốn re-publish → phải submit review lại → same feedback loop (Phase 2).

---

#### Thêm vào `CourseReviews.cs`:
```
GET    /api/CourseReviews/admin/compare/{courseId}
POST   /api/CourseReviews/admin/unpublish
```

---

#### ✅ Verification Phase 4
- Edit course after publish → compare → verify diff chính xác từng field
- Unpublish → enrolled student truy cập OK, marketplace ko hiển thị
- Re-publish flow: Unpublished → submit → PendingReview → approve → Public
- Edge case: course chưa có snapshot → "No approved snapshot available"

---

### Phase 5: Existing Code Modifications

---

#### [MODIFY] [UpdateCourseCommand.cs](file:///d:/Year-4/Capstone/FinalProject/Edunary/src/Application/Courses/Commands/UpdateCourseCommand/UpdateCourseCommand.cs)

```diff
- entity.Status = (CourseStatus)request.Status;
+ // Status managed by review workflow only — no longer settable via UpdateCourse
```

Instructor edit course bình thường sau publish. Student thấy changes liền. Status ko đổi.

---

#### Global `CourseStatus.Draft` → `CourseStatus.Unpublished` rename

Grep toàn project cho `CourseStatus.Draft` hoặc `Draft` trong context CourseStatus → đổi thành `Unpublished`.

---

#### Verify public queries filter correctly

Files check:
- [GetCoursesWithPaginationQuery](file:///d:/Year-4/Capstone/FinalProject/Edunary/src/Application/Courses/Queries/GetCoursesWithPaginationQuery) — marketplace
- [GetHomepageCoursesQuery](file:///d:/Year-4/Capstone/FinalProject/Edunary/src/Application/Courses/Queries/GetHomepageCoursesQuery) — homepage
- [GetPublicCourseByIdQuery](file:///d:/Year-4/Capstone/FinalProject/Edunary/src/Application/Courses/Queries/GetPublicCourseByIdQuery) — detail
- [GetPublicCoursesByUserIdQuery](file:///d:/Year-4/Capstone/FinalProject/Edunary/src/Application/Courses/Queries/GetPublicCoursesByUserIdQuery) — instructor profile

Tất cả phải filter `Status == CourseStatus.Public` only. `Unpublished`, `PendingReview`, `NeedsChanges` đều bị loại khỏi public.

---

#### Impact Assessment

| System | Impact | Action |
|--------|--------|--------|
| **MediaFile** | Ko ảnh hưởng. Upload/delete hoạt động bất kể status. Snapshot lưu URL+metadata. | None |
| **CourseCollaborator** | Collaborator với Manage → được submit. | Sử dụng `_courseAuth.HasCourseAccessAsync()` existing |
| **CourseProgress** | Ko ảnh hưởng. Progress track bằng itemId, link CourseId. Student thêm progress vẫn OK. | None |
| **Quiz/Assignment** | Ko ảnh hưởng runtime. `QuizAttemptSnapshot` đã capture câu hỏi lúc attempt → safe. Assignment submission đã lưu answers JSON → safe. | None |
| **Enrollment** | Unpublished course: enrolled student vẫn có enrollment record → vẫn truy cập. | Verify `GetCourseByIdQuery` (auth) ko filter status |
| **Cart** | Course ko Public → nên **chặn** add to cart. | Verify cart logic check `Status == Public` |

---

#### ✅ Verification Phase 5
- UpdateCourse ko thay đổi status nữa
- Public queries chỉ trả `Public` courses
- Cart reject non-Public courses
- Enrolled student access Unpublished course OK

---

## Business Recommendations

> [!TIP]
> **Thêm `Course.FirstPublishedAt`** (nullable DateTimeOffset) — track khi nào course lần đầu publish. Hữu ích cho sort "Newest", analytics, phân biệt first publish vs re-publish.

> [!TIP]
> **Pending queue sort FIFO** (`submittedAt ASC`) — fair cho instructor submit trước.

> [!TIP]
> **Future**: Nếu scale lớn, cân nhắc auto-flag khi thay đổi >30% content sau publish → admin nhận alert tự động.

---

## Phase Summary

| Phase | Scope | Deliverables |
|-------|-------|--------------|
| **1** | Domain + Migration | 3 entities, 3 enums, CourseStatus change, EF configs, migration |
| **2** | Instructor flow | Submit, resolve feedback, get review status APIs |
| **3** | Admin flow | Pending list, preview, CRUD feedback, request changes, approve + snapshot, email templates |
| **4** | Post-publish | Diff comparison engine, unpublish + re-publish flow |
| **5** | Fix existing code | UpdateCourse fix, Draft→Unpublished rename, public query verification |

---

## Verification Plan

### Per-Phase Testing
- Mỗi phase xong → test trước khi qua phase kế

### End-to-End Flow
1. Create course (Unpublished) → Submit → PendingReview
2. Admin creates RequiredFix feedbacks → Request Changes → NeedsChanges
3. Instructor resolves all → Resubmit → PendingReview
4. Admin approves → Public + snapshot created
5. Instructor edits after publish → Admin compares diff
6. Admin unpublishes → Unpublished → Instructor re-submits → repeat
