---
name: backend
description: Conventions, patterns, and workflows for the .NET backend (Domain/Application/Infrastructure/Web)
---

# Backend Skill — Domain / Application / Infrastructure / Web

## Clean architecture layers

Dependency direction is inward: `Web → Infrastructure + Application`, `Infrastructure → Application`, `Application → Domain`.

| Layer | Responsibility |
|-------|---------------|
| **Domain** | Entities, enums, constants, value objects, domain events |
| **Application** | Commands, queries, validators, pipeline behaviors, service interfaces |
| **Infrastructure** | EF Core DbContext, Identity/JWT, external integrations, background jobs, SignalR hubs, service implementations |
| **Web** | ASP.NET Core host, endpoint groups, DI composition root, OpenAPI/SPA setup |

## Request flow

1. **Endpoint** receives HTTP → calls `ISender.Send(command/query)`
2. **Pipeline behaviors** run in order: `UnhandledExceptionBehaviour` → `AuthorizationBehaviour` → `ValidationBehaviour` → `PerformanceBehaviour`
3. **MediatR handler** executes business logic via `IApplicationDbContext`
4. **EF interceptors** apply auditing (`AuditableEntityInterceptor`) and dispatch domain events (`DispatchDomainEventsInterceptor`)
5. Optional **domain event handlers** trigger side effects (notifications, background jobs)
6. Endpoint returns `IResult` / `Result` / `ReturnResult<T>`

## Endpoint pattern

- Create a class inheriting **`EndpointGroupBase`** in `Web/Endpoints/`
- Define routes inside `Map()` — endpoints are thin: validate route/body, then `sender.Send(...))`
- Auto-discovered via reflection; route convention: `/api/{ClassName}`
- Use `.RequireAuthorization()` on groups or individual routes
- Add `[Authorize("Policy")]` on MediatR requests for fine-grained AuthZ

### Example skeleton

```csharp
public class Courses : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet("/", GetCourses)
            .MapPost("/", CreateCourse);
    }

    public async Task<IResult> GetCourses(ISender sender) =>
        Results.Ok(await sender.Send(new GetCoursesQuery()));
}
```

## CQRS with MediatR

- **Commands/Queries** are `record` types implementing `IRequest<T>`
- **Handlers** live in the same feature folder or are nested in the same file
- **Validators**: FluentValidation, co-located (`*CommandValidator.cs`, `*QueryValidator.cs`)
- Validation failure: throws `ValidationException` normally, converts to `Result.Failure(...)` when return type is `Result`

### Feature folder convention

```
Application/
  TodoLists/
    Commands/
      CreateTodoList/
        CreateTodoList.cs        ← record + handler + validator
    Queries/
      GetTodoLists/
        GetTodoLists.cs          ← record + handler
```

## DI registration

Three extension methods compose the app in `Program.cs`:

- `AddApplicationServices()` — MediatR, FluentValidation, pipeline behaviors
- `AddInfrastructureServices(configuration)` — DbContext, Identity, Hangfire, S3, Stripe, email, SignalR
- `AddWebServices()` — CORS, Swagger, SPA, exception handler

Register new services in the appropriate layer's `DependencyInjection.cs`. Prefer **constructor injection**; use scoped lifetime by default.

## Persistence (EF Core)

- `ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>, IApplicationDbContext`
- Entity configurations in `Infrastructure/Data/Configurations/`
- Migrations in `Infrastructure/Data/Migrations/`
- Add migration: `dotnet ef migrations add <Name> --project Infrastructure/Infrastructure.csproj --startup-project Web/Web.csproj --output-dir Data/Migrations`
- Dev startup auto-applies migrations + seeds via `ApplicationDbContextInitialiser`
- Interceptors handle audit fields and domain event dispatch — do not set `Created`/`LastModified` manually

## Auth & authorization

- **JWT Bearer** authentication; token key from `AppSettings.AccessTokenKey`
- **SignalR** reads token from query string `access_token` on `/NotificationHub`
- Policies defined in `Domain/Constants/Policies.cs`; roles in `Domain/Constants/Roles.cs`
- Currently `CanPurge` and `SuperAdmin` both map to Administrator role

## Error handling

- `CustomExceptionHandler` maps: validation → 400, not-found → 404, unauthorized → 401, forbidden → 403
- **Important interop note (NSwag generation)**: endpoints returning bare `IResult` are often generated as `void` methods in `web-api-client.ts`; this limits frontend access to response payload details (including custom error body parsing)
- For endpoints consumed by frontend with structured success/error handling, prefer returning typed contracts (`Result`, `ReturnResult<T>`, DTOs) instead of bare `IResult`.
- **Watch out**: codebase mixes `IResult`, `Result`, `ReturnResult<T>`, and exception-based responses — keep response shape deliberate per endpoint consumer needs

## Email template placement

- Do not build HTML email bodies inline inside services.
- Add/maintain email HTML templates in `Application/Common/Models/EmailTemplates.cs`.
- Services should call `EmailTemplates.*` methods and pass dynamic values only.

## Background jobs & realtime

- **Hangfire** with SQL Server storage; dashboard at `/HangfireDashboard`
- Enqueue jobs via `IBackgroundJobClient` or domain event handlers
- **SignalR** `NotificationHub` manages per-user connections + course groups
- `NotifyService` sends messages through `IHubContext<NotificationHub>`

## Coding style

- **net9.0**, nullable enabled, implicit usings, warnings-as-errors
- **File-scoped namespaces**
- Explicit typing preferred (`var` generally discouraged by `.editorconfig`)
- 4-space indent, LF line endings (from `.editorconfig`)
- Structured logging with `ILogger<T>` — never `Console.WriteLine`

## Testing

- **NUnit** across unit / functional / acceptance tests
- Functional tests: `WebApplicationFactory<Program>` with test DB + service overrides
- Unit tests: validators, mapping configs, behaviors
- Acceptance tests: SpecFlow + Playwright (BDD step definitions + page objects)
- Run: `dotnet test` from repo root

## Things to avoid

- Using bare `IResult` by default for endpoints that require typed payload/error details on the frontend; this may generate `void` client methods and reduce error-data visibility
- Duplicate DI registrations for the same interface across layers
- `Console.WriteLine` in services — use `ILogger<T>`
- Leaving pipeline behaviors unregistered (e.g., `LoggingBehaviour` exists but is not wired)
- Setting audit fields manually — let `AuditableEntityInterceptor` handle it
- Placing business logic in endpoint classes — keep them thin, dispatch to MediatR
- Hand-editing `web-api-client.ts` — always regenerate via build
