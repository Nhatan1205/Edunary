# Student Note Feature Implementation (VinaAcademy)

This document explains how the **student learning note** feature is implemented end-to-end in:
- `D:/tailieu4/HK1-25-26/POSE/Store/vinaacademy-deploy/backend`
- `D:/tailieu4/HK1-25-26/POSE/Store/vinaacademy-deploy/frontend`

---

## 1) Big Picture Flow

1. Student watches lecture video in learning page.
2. Current video time (`currentTimestamp`) is tracked in frontend.
3. Student opens **Notes** tab, creates/edits/deletes note.
4. Frontend calls note APIs (`/api/v1/video-notes...`).
5. Backend resolves current user from security context.
6. Backend validates ownership + enrollment, persists note in `video_note` table.
7. Backend returns DTO wrapped in `ApiResponse<T>`.
8. Frontend updates local state and re-renders notes list.

---

## 2) Frontend Implementation

## 2.1 Entry Points and UI

- `frontend/app/(student)/learning/[slug]/lecture/[lectureId]/page.tsx`
  - Holds `currentTimestamp` state.
  - Updates timestamp from video player `onTimeUpdate`.
  - Passes timestamp to `LearningTabs`.

- `frontend/components/student/learning/LearningTabs.tsx`
  - Contains Notes tab.
  - Renders:
    - `NotesArea lectureId={lecture.id} currentTimestamp={currentTimestamp}`

- `frontend/components/student/learning/learning-tab/NotesArea.tsx`
  - Core Notes UI and local state.
  - Features:
    - View notes list
    - Create note
    - Edit note
    - Delete note

## 2.2 State and Data Flow in `NotesArea`

Local state:
- `notes: Note[]`
- `currentNote: string`
- `selectedNoteId: string | null`
- `isEditing: boolean`
- `loading: boolean`
- `error: string | null`

Lifecycle:
- On `lectureId` change, fetch notes with `getNotesByVideoId(lectureId)`.

CRUD handlers:
- **Create:** `createNote(lectureId, currentTimestamp, currentNote)` then prepend to local `notes`.
- **Edit:** `updateNote(selectedNoteId, lectureId, currentTimestamp, currentNote)` then replace item in `notes`.
- **Delete:** `deleteNote(noteId)` then filter from `notes`.

UX behavior:
- Manual save (button-driven), no autosave.
- Not optimistic; waits for API response before local update.

## 2.3 API Client Layer

- `frontend/services/noteService.ts`
  - `GET /video-notes/video/{videoId}`
  - `POST /video-notes`
  - `PUT /video-notes/{noteId}`
  - `DELETE /video-notes/{noteId}`

- `frontend/lib/apiClient.ts`
  - Base URL from `NEXT_PUBLIC_API_URL`.
  - Adds Bearer token from cookies.
  - Handles 401 refresh-token flow and retries request.

## 2.4 Frontend Types

- `frontend/types/note.ts`
  - `Note { id, noteText, timeStampSeconds, createdDate, updatedDate, videoId }`

- `frontend/types/api-response.ts`
  - `ApiResponse<T> { status, message, data, timestamp }`

---

## 3) Backend Implementation

## 3.1 Entity Model

- `backend/src/main/java/com/vinaacademy/platform/feature/video/entity/VideoNote.java`
  - `id: Long`
  - `user: User` (`ManyToOne`)
  - `video: Video` (`ManyToOne`)
  - `timeStampSeconds: Long`
  - `noteText: String`

- Inherits from `BaseEntity`:
  - `createdDate`, `updatedDate`, `createdBy`, `lastModifiedBy`
  - File: `backend/src/main/java/com/vinaacademy/platform/common/entity/BaseEntity.java`

Related associations:
- `Video` has `List<VideoNote>` (`OneToMany`, orphan removal/cascade)
- `User` has `List<VideoNote>` (`OneToMany`)

## 3.2 Repository Layer

- `backend/src/main/java/com/vinaacademy/platform/feature/video/repository/VideoNoteRepository.java`
  - `findByVideoIdAndUserId(UUID videoId, UUID userId)`
  - `findByUserId(UUID userId)`
  - `findByIdAndUserId(Long id, UUID userId)`
  - `deleteByIdAndUserId(Long id, UUID userId)`

Ownership is enforced via user-scoped repository methods.

## 3.3 Request/Response DTOs

- `VideoNoteRequestDto`
  - `@NotNull UUID videoId`
  - `@NotNull Long timeStampSeconds`
  - `@NotBlank String noteText`

- `VideoNoteDto`
  - `id, userId, videoId, timeStampSeconds, noteText, createdDate, updatedDate`

- Mapper:
  - `backend/src/main/java/com/vinaacademy/platform/feature/video/mapper/VideoNoteMapper.java`
  - MapStruct maps entity <-> dto and supports partial update.

## 3.4 Service Logic

- Interface: `VideoNoteService.java`
- Impl: `VideoNoteServiceImpl.java`

Core rules in service:
1. Resolve note/video records.
2. Enforce **enrollment** check before create/update/list-by-video.
3. Enforce **ownership** check using `findByIdAndUserId` for update/get/delete.
4. Save entity and return mapped DTO.

Enrollment check source:
- `VideoRepository.isUserEnrolledInCourse(...)`

## 3.5 Controller Endpoints

- `backend/src/main/java/com/vinaacademy/platform/feature/video/controller/VideoNoteController.java`
- Base path: `/api/v1/video-notes`

Endpoints:
- `POST /api/v1/video-notes` -> create note
- `PUT /api/v1/video-notes/{noteId}` -> update note
- `GET /api/v1/video-notes/video/{videoId}` -> list notes for one video (current user)
- `GET /api/v1/video-notes` -> list all notes for current user
- `GET /api/v1/video-notes/{noteId}` -> get one note
- `DELETE /api/v1/video-notes/{noteId}` -> delete note

All responses are wrapped with `ApiResponse<T>`.

## 3.6 Authentication and Authorization

Current user resolution:
- `SecurityHelper.getCurrentUser()`
- File: `backend/src/main/java/com/vinaacademy/platform/feature/user/auth/helpers/SecurityHelper.java`

Authorization model:
- Ownership: note must belong to current user for update/read-one/delete.
- Enrollment: current user must be enrolled in course containing target video for create/update/list-by-video.

## 3.7 Validation and Error Handling

Validation:
- DTO bean validation via `@Valid` in controller.

Global exception mapping:
- `GlobalExceptionHandler.java`
  - 400 for validation/bad request
  - 401 for unauthorized/auth failures
  - 403 for access denied
  - 404 for not found
  - 500 fallback

## 3.8 Persistence / Migration Strategy

No explicit Flyway/Liquibase SQL migrations found for note table.
Schema appears managed by Hibernate with `ddl-auto: update` (dev/prd profiles).

---

## 4) API Contract Used by Frontend

## Create Note
- `POST /api/v1/video-notes`
- Body:
```json
{
  "videoId": "<uuid>",
  "timeStampSeconds": 123,
  "noteText": "My note"
}
```

## Update Note
- `PUT /api/v1/video-notes/{noteId}`
- Body same as create.

## Get Notes By Video
- `GET /api/v1/video-notes/video/{videoId}`

## Delete Note
- `DELETE /api/v1/video-notes/{noteId}`

Response wrapper shape:
```json
{
  "status": "OK",
  "message": "...",
  "data": { },
  "timestamp": "..."
}
```

---

## 5) End-to-End Sequence (Condensed)

1. Student opens lecture page.
2. Video player emits time updates.
3. Student opens Notes tab and enters content.
4. Frontend sends authenticated note request.
5. Backend resolves current user.
6. Backend checks video existence + enrollment + ownership (as needed).
7. Backend saves/deletes note.
8. Backend returns DTO.
9. Frontend updates local notes state and refreshes UI.

---

## 6) Key File Index

Frontend:
- `frontend/app/(student)/learning/[slug]/lecture/[lectureId]/page.tsx`
- `frontend/components/student/learning/LearningTabs.tsx`
- `frontend/components/student/learning/learning-tab/NotesArea.tsx`
- `frontend/services/noteService.ts`
- `frontend/lib/apiClient.ts`
- `frontend/types/note.ts`
- `frontend/types/api-response.ts`

Backend:
- `backend/src/main/java/com/vinaacademy/platform/feature/video/controller/VideoNoteController.java`
- `backend/src/main/java/com/vinaacademy/platform/feature/video/service/impl/VideoNoteServiceImpl.java`
- `backend/src/main/java/com/vinaacademy/platform/feature/video/service/VideoNoteService.java`
- `backend/src/main/java/com/vinaacademy/platform/feature/video/repository/VideoNoteRepository.java`
- `backend/src/main/java/com/vinaacademy/platform/feature/video/repository/VideoRepository.java`
- `backend/src/main/java/com/vinaacademy/platform/feature/video/entity/VideoNote.java`
- `backend/src/main/java/com/vinaacademy/platform/feature/video/dto/VideoNoteRequestDto.java`
- `backend/src/main/java/com/vinaacademy/platform/feature/video/dto/VideoNoteDto.java`
- `backend/src/main/java/com/vinaacademy/platform/feature/video/mapper/VideoNoteMapper.java`
- `backend/src/main/java/com/vinaacademy/platform/feature/user/auth/helpers/SecurityHelper.java`
- `backend/src/main/java/com/vinaacademy/platform/exception/GlobalExceptionHandler.java`
- `backend/src/main/java/com/vinaacademy/platform/common/entity/BaseEntity.java`

---

## 7) Notes for Study

- The feature is implemented with a clean controller -> service -> repository layering on backend.
- Frontend currently uses local component state for notes (no global state library).
- Authorization is enforced mostly in service logic (ownership + enrollment), with current user provided by security helper.
