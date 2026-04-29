using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edunary.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLearnerProfileSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourseCourseTopic");

            migrationBuilder.DropTable(
                name: "CourseTopics");

            migrationBuilder.AddColumn<string>(
                name: "AiMetadata",
                table: "Roadmaps",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAiGenerated",
                table: "Roadmaps",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "UserRating",
                table: "Roadmaps",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LearnerProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Goal = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SkillLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    KnownSkills = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Interests = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreferredCategoryIds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreferredTopicIds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WeeklyHours = table.Column<int>(type: "int", nullable: false),
                    TimelineMonths = table.Column<int>(type: "int", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearnerProfiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Topics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Topics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CourseTopic",
                columns: table => new
                {
                    CoursesId = table.Column<int>(type: "int", nullable: false),
                    TopicsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseTopic", x => new { x.CoursesId, x.TopicsId });
                    table.ForeignKey(
                        name: "FK_CourseTopic_Courses_CoursesId",
                        column: x => x.CoursesId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourseTopic_Topics_TopicsId",
                        column: x => x.TopicsId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseTopic_TopicsId",
                table: "CourseTopic",
                column: "TopicsId");

            migrationBuilder.CreateIndex(
                name: "IX_LearnerProfiles_StudentId",
                table: "LearnerProfiles",
                column: "StudentId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourseTopic");

            migrationBuilder.DropTable(
                name: "LearnerProfiles");

            migrationBuilder.DropTable(
                name: "Topics");

            migrationBuilder.DropColumn(
                name: "AiMetadata",
                table: "Roadmaps");

            migrationBuilder.DropColumn(
                name: "IsAiGenerated",
                table: "Roadmaps");

            migrationBuilder.DropColumn(
                name: "UserRating",
                table: "Roadmaps");

            migrationBuilder.CreateTable(
                name: "CourseTopics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseTopics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CourseCourseTopic",
                columns: table => new
                {
                    CoursesId = table.Column<int>(type: "int", nullable: false),
                    TopicsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseCourseTopic", x => new { x.CoursesId, x.TopicsId });
                    table.ForeignKey(
                        name: "FK_CourseCourseTopic_CourseTopics_TopicsId",
                        column: x => x.TopicsId,
                        principalTable: "CourseTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourseCourseTopic_Courses_CoursesId",
                        column: x => x.CoursesId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseCourseTopic_TopicsId",
                table: "CourseCourseTopic",
                column: "TopicsId");
        }
    }
}
