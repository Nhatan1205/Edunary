namespace Edunary.Domain.Enums;

public enum ActivityType
{
    // Auth 
    Login = 0,
    Logout = 1,
    ChangePassword = 2,

    // User interact (10~)
    CreateCourse = 10,
    UpdateCourse = 11,
    DeleteCourse = 12,
    AddToCart = 13,
    RemoveFromCart = 14,
    CompletePurchase = 15,
    UpdateCourseProgress = 16,
    RateCourse = 17,
    UpdateUserInfo = 18,
    UpdateUserAvatar = 19, 
    SendAnnouncement = 20,
    CreateRoadmap = 21, 
    UpdateRoadmap = 22, 
    DeleteRoadmap = 23, 

    AccessUserCoursesPage = 50,
    AccessUserRoadmapsPage = 51,
    AccessEnrolledCoursesPage = 52,
    AccessUserAnnouncementsPage = 53,
    AccessUserProfilePage = 54,
    ViewPublicProfile = 55,
    ViewCareerPathDetail = 56,
    AccessTaxProfile = 57,
    AccessCart = 58,
    ViewMyCareerPath = 59,
    ViewCourseOverview = 60,
    AccessCourseLearning = 61,
    AccessMessages = 62,

    ViewInstructorReport = 70,
    AccessInstructorAssignments = 71,

    CreateCourseQuestion = 24,
    CreateCourseAnswer = 25,
    GenerateQuizQuestions = 26,
    GenerateAIRoadmap = 27,
    InviteCollaborator = 28,
    SubmitCourseForReview = 29,
    UpdateTaxProfile = 30,

    //  Admin (200~)
    CreateCategory = 200,
    UpdateCategory = 201,
    DeleteCategory = 202,
    RestrictUser = 203,
    UnbanUser = 204,
    ChangeUserRole = 205,
    UpdateSystemSetting = 206,
    CreateTopic = 207,
    CreateCoupon = 208,
    ApproveCourse = 209,
    RequestCourseChanges = 210,
    ViewCourseChanges = 211,
    ViewQualityReport = 212,
    AccessFinanceDashboard = 213,
    AccessFinanceLedger = 214,
    AccessTaxRegions = 215,
}
