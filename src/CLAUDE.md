# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, test, and development commands

### Backend (.NET)
- Restore solution: `dotnet restore src.sln`
- Build solution: `dotnet build src.sln`
- Run web app (API + SPA proxy): `dotnet run --project Web/Web.csproj`
- Run web app with file-watch reload: `dotnet watch --project Web/Web.csproj run`

### Frontend (React app in Web/ClientApp)
- Install dependencies: `npm --prefix Web/ClientApp install`
- Start frontend dev server (used by SPA proxy): `npm --prefix Web/ClientApp start`
- Build frontend bundle: `npm --prefix Web/ClientApp run build`
- Lint frontend: `npm --prefix Web/ClientApp run lint`
- Run frontend tests once (CI mode): `npm --prefix Web/ClientApp test`
- Run a single frontend test file: `npm --prefix Web/ClientApp test -- App.test.js`
- Run tests matching a name pattern: `npm --prefix Web/ClientApp test -- --testNamePattern="pattern"`

### Database & EF Core
- Apply migrations via app startup in Development: `dotnet run --project Web/Web.csproj`
  - `Program.cs` calls `InitialiseDatabaseAsync()` only in Development, which runs migrations and seeding.
- Add migration: `dotnet ef migrations add <MigrationName> --project Infrastructure/Infrastructure.csproj --startup-project Web/Web.csproj --output-dir Data/Migrations`
- Update database explicitly: `dotnet ef database update --project Infrastructure/Infrastructure.csproj --startup-project Web/Web.csproj`

### API client generation
- `Web/Web.csproj` runs NSwag in Debug post-build (`Target Name="NSwag"`) using `Web/config.nswag`.
- Generated TypeScript client output: `Web/ClientApp/src/web-api-client.ts`.

## Architecture overview

This repository follows a layered Clean Architecture style with four projects:

- `Domain`: core entities, enums, constants, domain events, and value objects.
- `Application`: use cases (commands/queries), validators, pipeline behaviors, and service interfaces.
- `Infrastructure`: EF Core data access, Identity/JWT implementation, background jobs, external integrations (S3-compatible storage, Stripe, email), SignalR hub, and service implementations.
- `Web`: ASP.NET Core host, endpoint mapping, DI composition root, OpenAPI/Swagger setup, SPA hosting/proxy, and minimal API surface.

Dependency direction is inward: `Web -> Infrastructure + Application`, `Infrastructure -> Application`, `Application -> Domain`.

## Request flow and endpoint pattern

- App startup is composed in `Web/Program.cs` via:
  - `AddApplicationServices()`
  - `AddInfrastructureServices(configuration)`
  - `AddWebServices()`
- Endpoints are implemented as classes inheriting `EndpointGroupBase` in `Web/Endpoints/*`.
- `MapEndpoints()` scans and instantiates all endpoint groups automatically.
- Group routing convention is `/api/{EndpointClassName}` (from `Web/Infrastructure/WebApplicationExtensions.cs`).

When adding a new API area, create a new endpoint group class in `Web/Endpoints`, map routes inside `Map`, and call MediatR (`ISender`) into `Application` commands/queries.

## Cross-cutting behavior (Application layer)

MediatR pipeline behaviors are registered in `Application/DependencyInjection.cs` and run for requests:
- `UnhandledExceptionBehaviour`
- `AuthorizationBehaviour`
- `ValidationBehaviour`
- `PerformanceBehaviour`

Use FluentValidation validators in Application command/query folders to enforce request validation.

## Data, identity, and background processing

- EF Core DbContext: `Infrastructure/Data/ApplicationDbContext.cs`.
- Migrations location: `Infrastructure/Data/Migrations/`.
- Development startup applies migrations + seeds default roles/users/data (`ApplicationDbContextInitialiser`).
- Authentication uses JWT Bearer; SignalR token is read from query string for `/NotificationHub`.
- Hangfire is configured with SQL Server storage and dashboard auth at `/HangfireDashboard`.

## Frontend composition

- React entry: `Web/ClientApp/src/index.jsx` and `App.jsx`.
- Routing is centralized in `Web/ClientApp/src/AppRoutes.jsx` (guest/user/instructor/admin route groups).
- API calls are primarily through generated NSwag client: `Web/ClientApp/src/web-api-client.ts`.
- Dev proxy configuration (`setupProxy.js`) forwards `/api`, `/Identity`, `/hls`, and `/NotificationHub` to ASP.NET backend.
- Auth and realtime state are provided through context providers (`AuthContext`, `SignalRContext`).

## Student note feature decisions (V1)

Use these decisions as implementation constraints unless explicitly changed by the user:

- Scope: student notes are enabled only in learning route lecture pages (`/course/:courseId/learn/lecture/:contentId`).
- Visibility: notes are private to the current student (no sharing).
- Ownership/security: all note APIs require auth, enrollment check (`CourseId + StudentId`), and ownership check for update/delete.
- Data shape: note stores `CourseId`, `StudentId`, `VideoId`, `ItemId` (recommended), `TimestampSeconds`, and `Content`.
- Backend pattern: add a dedicated endpoint group (`Web/Endpoints/CourseNotes.cs`) and MediatR vertical slice in `Application/CourseNotes/*` with FluentValidation.
- Frontend integration: source context from `VideoPlayer.jsx` (`courseId`, `contentId`, `currentItem.videoId`, `currentTime`) and render real Notes UI in `CourseLearnTab.jsx`.
- UX baseline: create/edit/delete/list notes for current video; clicking note timestamp seeks video.
- API client: if endpoint contracts change, regenerate NSwag client; do not hand-edit `Web/ClientApp/src/web-api-client.ts`.

## Notes for working safely in this repo

- Do not hand-edit `Web/ClientApp/src/web-api-client.ts`; regenerate via NSwag build pipeline.
- Keep business logic in Application/Infrastructure; keep endpoint classes thin request-mapping layers.
- If you change endpoint shapes/contracts, rebuild Debug to regenerate the frontend API client and then update frontend call sites.
