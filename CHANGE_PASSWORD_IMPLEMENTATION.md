# Change Password Feature Implementation Summary

## Tổng quan
Đã triển khai đầy đủ tính năng đổi mật khẩu với modal dialog cho người dùng, bao gồm xử lý trường hợp đăng nhập lần đầu (first login) khi người dùng đăng nhập bằng tài khoản social (Google/Facebook).

---

## Backend Implementation

### 1. **Command và Handler** 
📁 `src/Application/Users/Commands/ChangePasswordCommand/ChangePasswordCommand.cs`

- Tạo `ChangePasswordCommand` với 2 properties:
  - `OldPassword`: Mật khẩu cũ
  - `NewPassword`: Mật khẩu mới
  
- `ChangePasswordCommandHandler` xử lý logic:
  - Lấy `userId` từ `ICurrentUserService`
  - Kiểm tra old password qua `IIdentityService.CheckPassword()`
  - Thay đổi password qua `IIdentityService.ChangePassword()`

### 2. **Validator**
📁 `src/Application/Users/Commands/ChangePasswordCommand/ChangePasswordCommandValidator.cs`

Validation rules:
- `OldPassword`: Bắt buộc
- `NewPassword`: 
  - Bắt buộc
  - Tối thiểu 6 ký tự
  - Phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt
  - Phải khác mật khẩu cũ

### 3. **Identity Service Methods**
📁 `src/Infrastructure/Identity/IdentityService.cs`

Thêm 2 methods mới:

```csharp
// Kiểm tra mật khẩu hiện tại
public async Task<bool> CheckPassword(string userId, string password)

// Đổi mật khẩu mới
public async Task<Result> ChangePassword(string userId, string newPassword)
```

### 4. **API Endpoint**
📁 `src/Web/Endpoints/User.cs`

Thêm endpoint mới:
```csharp
.MapPost(ChangePassword, "change-password")
```

- Endpoint: `POST /api/user/change-password`
- Yêu cầu authentication
- Body: `{ "oldPassword": "string", "newPassword": "string" }`
- Response: `Result` object

### 5. **Interface Update**
📁 `src/Application/Common/Interfaces/IIdentityService.cs`

Thêm 2 method signatures:
```csharp
Task<bool> CheckPassword(string userId, string password);
Task<Result> ChangePassword(string userId, string newPassword);
```

---

## Frontend Implementation

### 1. **Token Service Enhancement**
📁 `src/Web/ClientApp/src/utils/tokenService.js`

Thêm các functions mới:

```javascript
// Lưu flag requiresPasswordChange
setRequiresPasswordChange(value)

// Lấy flag requiresPasswordChange từ localStorage
getRequiresPasswordChange()

// Xóa flag requiresPasswordChange
clearRequiresPasswordChange()

// Lấy default password từ token (cho first login)
getDefaultPassword()
```

**Logic tự động:**
- Khi `setToken()` được gọi, tự động extract và lưu `requiresPasswordChange` từ JWT token
- Khi `clearAuth()` được gọi, tự động xóa cả `requiresPasswordChange` flag

### 2. **Custom Hook**
📁 `src/Web/ClientApp/src/hooks/useChangePassword.js`

- Sử dụng `@tanstack/react-query` (useMutation)
- Gọi API `userClient.changePassword()`
- **onSuccess**: 
  - Hiển thị toast success
  - Clear `requiresPasswordChange` flag
  - Gọi callback để đóng modal
- **onError**: Hiển thị toast error

### 3. **Change Password Modal Component**
📁 `src/Web/ClientApp/src/components/change-password/ChangePassword.jsx`

**Props:**
- `open`: Boolean - Điều khiển hiển thị modal
- `onClose`: Function - Callback khi đóng modal
- `isFirstLogin`: Boolean - Xác định có phải first login không

**Features:**
- **UI/UX:**
  - Modal với theme color từ Material-UI
  - Nút close ở góc phải title
  - Icon lock và title "Change Password"
  - Warning banner khi `isFirstLogin = true`
  
- **Form Fields (react-hook-form):**
  - Old Password (ẩn khi `isFirstLogin = true`)
  - New Password
  - Confirm Password
  - Mỗi field có toggle show/hide password
  
- **Validation:**
  - Old password: Required (khi không phải first login)
  - New password: 
    - Required
    - Min 6 characters
    - Pattern: uppercase, lowercase, number, special character
  - Confirm password: Must match new password
  
- **Auto-fill Logic:**
  - Khi `isFirstLogin = true`, tự động fill `oldPassword` từ `tokenService.getDefaultPassword()`
  
- **Submit:**
  - Gọi `useChangePassword` hook
  - Disable button khi đang submit
  - Hiển thị "Changing..." khi pending

### 4. **Homepage Integration**
📁 `src/Web/ClientApp/src/features/guest/homepage/Homepage.jsx`

**Logic:**
- useEffect kiểm tra khi user authenticated:
  - Lấy `requiresPasswordChange` flag từ tokenService
  - Lấy `defaultPassword` từ token
  - Nếu `requiresPasswordChange = true`:
    - Set `isFirstLogin = true` nếu có `defaultPassword`
    - Mở modal ChangePassword
    
- **handleCloseChangePassword:**
  - Chỉ cho phép đóng modal nếu KHÔNG phải first login
  - First login user BẮT BUỘC phải đổi password mới có thể đóng modal

---

## User Flow

### Trường hợp 1: First Login (Social Account)
1. User đăng nhập bằng Google/Facebook
2. Backend tạo account với `requiresPasswordChange = true` và `defaultPassword` trong token
3. Frontend detect flag và mở modal
4. Form chỉ hiển thị New Password và Confirm Password (Old Password tự động fill)
5. User BẮT BUỘC phải đổi password
6. Sau khi đổi thành công, flag được clear và modal đóng

### Trường hợp 2: Normal Change Password
1. User đã login và muốn đổi password
2. Mở modal manually (có thể thêm button ở profile)
3. Form hiển thị đầy đủ 3 fields: Old, New, Confirm Password
4. User có thể cancel hoặc submit
5. Sau khi đổi thành công, modal đóng

---

## Security Features

1. **Old Password Verification**: Backend kiểm tra old password trước khi cho phép đổi
2. **Password Requirements**: Enforce strong password (uppercase, lowercase, number, special char)
3. **Token-based Auth**: Sử dụng JWT token để xác thực user
4. **No Bypass**: First login users không thể đóng modal mà không đổi password

---

## Technical Stack

### Backend:
- **ASP.NET Core** - Web API
- **MediatR** - CQRS pattern
- **FluentValidation** - Validation rules
- **ASP.NET Identity** - User management

### Frontend:
- **React** - UI framework
- **Material-UI (MUI)** - Component library
- **react-hook-form** - Form management
- **@tanstack/react-query** - Data fetching & caching
- **react-toastify** - Notifications

---

## Files Created/Modified

### Backend (Created):
1. `src/Application/Users/Commands/ChangePasswordCommand/ChangePasswordCommand.cs`
2. `src/Application/Users/Commands/ChangePasswordCommand/ChangePasswordCommandValidator.cs`

### Backend (Modified):
1. `src/Application/Common/Interfaces/IIdentityService.cs` - Added 2 methods
2. `src/Infrastructure/Identity/IdentityService.cs` - Implemented 2 methods
3. `src/Web/Endpoints/User.cs` - Added change-password endpoint

### Frontend (Created):
1. `src/Web/ClientApp/src/hooks/useChangePassword.js`

### Frontend (Modified):
1. `src/Web/ClientApp/src/utils/tokenService.js` - Added password change related functions
2. `src/Web/ClientApp/src/components/change-password/ChangePassword.jsx` - Complete rewrite
3. `src/Web/ClientApp/src/features/guest/homepage/Homepage.jsx` - Added modal integration

---

## Next Steps (Optional)

1. **Re-generate API Client**: 
   - Build backend project
   - Run NSwag to update `web-api-client.ts`
   
2. **Add Change Password Button**: 
   - Thêm button "Change Password" trong user profile dropdown
   - Cho phép user đổi password bất kỳ lúc nào

3. **Testing**:
   - Test first login flow với Google login
   - Test normal password change
   - Test validation errors
   - Test API error handling

---

## Notes

- Tất cả code tuân thủ theo style và pattern đã có trong project
- Không cài thêm package nào mới
- Validation rules nhất quán với CreateUserCommand
- UI/UX theo Material Design với theme colors
- Error handling đầy đủ ở cả backend và frontend

---

**Tác giả**: GitHub Copilot  
**Ngày tạo**: 2025-01-07
