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


    //  Admin (200~)
    CreateCategory = 200,
    UpdateCategory = 201,
    DeleteCategory = 202,
    RestrictUser = 203,
    UnbanUser = 204,
    ChangeUserRole = 205,
    UpdateSystemSetting = 206,
}
