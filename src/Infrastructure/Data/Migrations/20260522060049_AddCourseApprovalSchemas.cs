using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edunary.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseApprovalSchemas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourseReviewSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<int>(type: "int", nullable: false),
                    ReviewedByAdminId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ReviewedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    AdminNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubmissionNumber = table.Column<int>(type: "int", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseReviewSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseReviewSubmissions_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourseApprovedSnapshots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<int>(type: "int", nullable: false),
                    CourseReviewSubmissionId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subtitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Level = table.Column<int>(type: "int", nullable: false),
                    LearningObjectives = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Requirements = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TargetAudience = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WelcomeMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CongratulationsMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Price = table.Column<float>(type: "real", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    AllowPlatformCoupons = table.Column<bool>(type: "bit", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TopicIds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MediaFilesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QuizzesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssignmentsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseApprovedSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseApprovedSnapshots_CourseReviewSubmissions_CourseReviewSubmissionId",
                        column: x => x.CourseReviewSubmissionId,
                        principalTable: "CourseReviewSubmissions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CourseApprovedSnapshots_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourseReviewFeedbacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseReviewSubmissionId = table.Column<int>(type: "int", nullable: false),
                    FeedbackType = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    IsResolved = table.Column<bool>(type: "bit", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseReviewFeedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseReviewFeedbacks_CourseReviewSubmissions_CourseReviewSubmissionId",
                        column: x => x.CourseReviewSubmissionId,
                        principalTable: "CourseReviewSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseApprovedSnapshots_CourseId",
                table: "CourseApprovedSnapshots",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseApprovedSnapshots_CourseReviewSubmissionId",
                table: "CourseApprovedSnapshots",
                column: "CourseReviewSubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseReviewFeedbacks_CourseReviewSubmissionId",
                table: "CourseReviewFeedbacks",
                column: "CourseReviewSubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseReviewSubmissions_CourseId",
                table: "CourseReviewSubmissions",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseReviewSubmissions_CourseId_Status",
                table: "CourseReviewSubmissions",
                columns: new[] { "CourseId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourseApprovedSnapshots");

            migrationBuilder.DropTable(
                name: "CourseReviewFeedbacks");

            migrationBuilder.DropTable(
                name: "CourseReviewSubmissions");
        }
    }
}
