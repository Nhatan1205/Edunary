using Edunary.Domain.Constants;
using Edunary.Domain.Entities;
using Edunary.Infrastructure.Data;
using Edunary.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Data.Seeds;

/// <summary>
/// Seeds test data for AI Roadmap feature testing.
/// Fully idempotent — safe to run on any DB state (empty, partial, or full with unrelated data).
/// </summary>
public static class RoadmapTestSeedData
{
    private const string DefaultPassword = "Test@12345";

    public static async Task SeedAsync(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        // 1. Ensure users first (EnsureUser is always idempotent — checks by email)
        var instructor1 = await EnsureUser(userManager, new ApplicationUser
        {
            UserName       = "instructor.alex@edunary.com",
            Email          = "instructor.alex@edunary.com",
            FullName       = "Alex Chen",
            Headline       = "Full-Stack & Web Development Instructor",
            EmailConfirmed = true,
        }, Roles.User);

        var instructor2 = await EnsureUser(userManager, new ApplicationUser
        {
            UserName       = "instructor.sarah@edunary.com",
            Email          = "instructor.sarah@edunary.com",
            FullName       = "Sarah Nguyen",
            Headline       = "Data Science & AI Instructor",
            EmailConfirmed = true,
        }, Roles.User);

        var instructor3 = await EnsureUser(userManager, new ApplicationUser
        {
            UserName       = "instructor.james@edunary.com",
            Email          = "instructor.james@edunary.com",
            FullName       = "James Park",
            Headline       = "Cloud & DevOps Instructor",
            EmailConfirmed = true,
        }, Roles.User);

        var studentMinh = await EnsureUser(userManager, new ApplicationUser
        {
            UserName       = "student.minh@edunary.com",
            Email          = "student.minh@edunary.com",
            FullName       = "Nguyen Van Minh",
            Headline       = "Software Engineering Student",
            EmailConfirmed = true,
        }, Roles.User);

        var studentLan = await EnsureUser(userManager, new ApplicationUser
        {
            UserName       = "student.lan@edunary.com",
            Email          = "student.lan@edunary.com",
            FullName       = "Tran Thi Lan",
            Headline       = "Data Analyst transitioning to ML",
            EmailConfirmed = true,
        }, Roles.User);

        var studentKhoa = await EnsureUser(userManager, new ApplicationUser
        {
            UserName       = "student.khoa@edunary.com",
            Email          = "student.khoa@edunary.com",
            FullName       = "Le Van Khoa",
            Headline       = "Senior Developer — Cloud enthusiast",
            EmailConfirmed = true,
        }, Roles.User);

        // User D — intentionally no LearnerProfile (Scenario 4 edge case)
        var studentTrang = await EnsureUser(userManager, new ApplicationUser
        {
            UserName       = "student.trang@edunary.com",
            Email          = "student.trang@edunary.com",
            FullName       = "Pham Thi Trang",
            Headline       = "Complete beginner",
            EmailConfirmed = true,
        }, Roles.User);

        var studentHung = await EnsureUser(userManager, new ApplicationUser
        {
            UserName       = "student.hung@edunary.com",
            Email          = "student.hung@edunary.com",
            FullName       = "Vo Quoc Hung",
            Headline       = "Frontend dev going full-stack",
            EmailConfirmed = true,
        }, Roles.User);

        // 2. Guard for the REST of seeding — check by THIS seed's specific student ID
        // Why here (after EnsureUser): users are always safe to ensure.
        // But profiles/courses/enrollments must only be seeded once.
        // Using studentMinh.Id (our seed marker) — unrelated old LearnerProfiles won't trigger this.
        var alreadySeeded = await context.LearnerProfiles
            .AnyAsync(p => p.StudentId == studentMinh.Id);

        if (alreadySeeded)
        {
            return;
        }

        // 3. Resolve Categories (idempotent)
        var categories = await EnsureCategories(context);
        int catWeb   = categories["Web Development"];
        int catDS    = categories["Data Science & AI"];
        int catCloud = categories["Cloud & DevOps"];

        // 4. Resolve Topics by name from initialiser seeds
        var topics = await context.Topics.ToDictionaryAsync(t => t.Name, t => t.Id);
        int tPython = GetOrDefault(topics, "Python");
        int tJS     = GetOrDefault(topics, "JavaScript");
        int tReact  = GetOrDefault(topics, "React");
        int tNode   = GetOrDefault(topics, "Node.js");
        int tSQL    = GetOrDefault(topics, "Database Management");
        int tDocker = GetOrDefault(topics, "DevOps");
        int tAWS    = GetOrDefault(topics, "Cloud Computing");
        int tML     = GetOrDefault(topics, "Machine Learning");
        int tDL     = GetOrDefault(topics, "Deep Learning");
        int tCS     = GetOrDefault(topics, "C#");
        int tDA     = GetOrDefault(topics, "Business Analytics");
        int tTS     = GetOrDefault(topics, "TypeScript");

        // 5. Seed 100 courses (CourseSeedData has its own idempotent guard by title)
        var courses = await CourseSeedData.SeedCoursesAsync(
            context,
            catWeb, catDS, catCloud,
            tPython, tJS, tReact, tNode, tSQL, tDocker, tAWS, tML, tDL, tCS, tDA, tTS,
            instructor1.Id, instructor2.Id, instructor3.Id);

        // 6. Seed LearnerProfiles — skip per-student if already exists
        await EnsureLearnerProfile(context, new LearnerProfile
        {
            StudentId            = studentMinh.Id,
            Goal                 = "Start Career",
            SkillLevel           = "Beginner",
            PreferredCategoryIds = Serialize(new[] { catWeb }),
            PreferredTopicIds    = Serialize(new[] { tJS, tSQL, tCS }),
            WeeklyHours          = 15,
        });

        await EnsureLearnerProfile(context, new LearnerProfile
        {
            StudentId            = studentLan.Id,
            Goal                 = "Change Career",
            SkillLevel           = "Intermediate",
            PreferredCategoryIds = Serialize(new[] { catDS }),
            PreferredTopicIds    = Serialize(new[] { tPython, tML, tDL, tDA }),
            WeeklyHours          = 10,
        });

        await EnsureLearnerProfile(context, new LearnerProfile
        {
            StudentId            = studentKhoa.Id,
            Goal                 = "Grow in Role",
            SkillLevel           = "Advanced",
            PreferredCategoryIds = Serialize(new[] { catCloud }),
            PreferredTopicIds    = Serialize(new[] { tDocker, tAWS }),
            WeeklyHours          = 5,
        });

        // studentTrang: NO profile — intentional

        await EnsureLearnerProfile(context, new LearnerProfile
        {
            StudentId            = studentHung.Id,
            Goal                 = "Explore Topics",
            SkillLevel           = "Intermediate",
            PreferredCategoryIds = Serialize(new[] { catWeb, catDS }),
            PreferredTopicIds    = Serialize(new[] { tPython, tJS, tReact, tNode, tSQL }),
            WeeklyHours          = 20,
        });

        await context.SaveChangesAsync();

        // 7. Seed Enrollments — lookup by title, skip if already enrolled
        var courseByTitle = courses.ToDictionary(c => c.Title);

        // Load existing enrollments for our seed students to avoid duplicates
        var seedStudentIds = new[]
        {
            studentMinh.Id, studentLan.Id, studentKhoa.Id,
            studentTrang.Id, studentHung.Id,
        };
        var existingEnrollments = (await context.Enrollments
            .Where(e => seedStudentIds.Contains(e.StudentId))
            .Select(e => new { e.StudentId, e.CourseId })
            .ToListAsync())
            .Select(e => $"{e.StudentId}:{e.CourseId}")
            .ToHashSet();


        void Enroll(string studentId, string courseTitle)
        {
            if (!courseByTitle.TryGetValue(courseTitle, out var course))
            {
                return;
            }

            var key = $"{studentId}:{course.Id}";
            if (existingEnrollments.Contains(key))
            {
                return; // already enrolled — skip
            }

            context.Enrollments.Add(new Enrollment
            {
                StudentId = studentId,
                CourseId  = course.Id,
            });
            existingEnrollments.Add(key); // prevent in-batch duplicates
        }

        Enroll(studentMinh.Id,  "C# Fundamentals");
        Enroll(studentLan.Id,   "Python for Data Science");
        Enroll(studentLan.Id,   "Machine Learning Fundamentals");
        Enroll(studentKhoa.Id,  "Docker Fundamentals");
        Enroll(studentKhoa.Id,  "AWS Cloud Practitioner");
        Enroll(studentKhoa.Id,  "Linux System Admin");
        Enroll(studentHung.Id,  "JavaScript for Beginners");
        Enroll(studentHung.Id,  "React Complete Guide");

        await context.SaveChangesAsync();
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static async Task<ApplicationUser> EnsureUser(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string role)
    {
        var existing = await userManager.FindByEmailAsync(user.Email!);
        if (existing != null)
        {
            return existing;
        }

        var result = await userManager.CreateAsync(user, DefaultPassword);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(user, role);
        }

        return user;
    }

    private static async Task EnsureLearnerProfile(
        ApplicationDbContext context,
        LearnerProfile profile)
    {
        var exists = await context.LearnerProfiles
            .AnyAsync(p => p.StudentId == profile.StudentId);

        if (!exists)
        {
            context.LearnerProfiles.Add(profile);
        }
    }

    private static async Task<Dictionary<string, int>> EnsureCategories(
        ApplicationDbContext context)
    {
        var names = new[] { "Web Development", "Data Science & AI", "Cloud & DevOps" };
        var existing = await context.Categories
            .Where(c => names.Contains(c.Title))
            .ToDictionaryAsync(c => c.Title, c => c.Id);

        foreach (var name in names)
        {
            if (!existing.ContainsKey(name))
            {
                var cat = new Category { Title = name };
                context.Categories.Add(cat);
                await context.SaveChangesAsync();
                existing[name] = cat.Id;
            }
        }

        return existing;
    }

    private static string Serialize(int[] ids)
    {
        return System.Text.Json.JsonSerializer.Serialize(ids);
    }

    private static int GetOrDefault(Dictionary<string, int> dict, string key)
    {
        return dict.TryGetValue(key, out var id) ? id : 0;
    }
}
