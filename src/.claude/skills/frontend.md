---
name: frontend
description: Conventions, patterns, and workflows for the React frontend (Web/ClientApp)
---

# Frontend Skill — Web/ClientApp

## Stack

- **Create React App** (react-scripts 5) + React 18 + React Router v6
- **Material UI (MUI)** is the primary UI library (MUI Core + MUI X)
- **NSwag-generated** typed API client (`web-api-client.ts`)

## Dev workflow

1. `npm --prefix Web/ClientApp install` — install deps
2. `npm --prefix Web/ClientApp start` — CRA dev server (port from `.env.development`, HTTPS)
3. ASP.NET Core SPA proxy forwards to CRA in dev; prod build is `npm run build` → `wwwroot/`

## Routing

- Routes live in **`AppRoutes.jsx`** (centralized route array)
- `App.jsx` renders the route array inside `<BrowserRouter basename={...}>`
- Nav links go in **`NavMenu.jsx`**
- Role-based route groups (guest / user / instructor / admin) already exist — add new routes to the appropriate group

## State management

- **Local component state only** (`this.state` / `useState`) — no Redux, Zustand, or Context-based global store
- Data fetching: call API client in `componentDidMount` or `useEffect`, store results in local state alongside a loading flag
- Only introduce shared state when clearly justified (e.g., auth context already exists)

## API client usage

- **Never hand-edit** `web-api-client.ts` — it is auto-generated on Debug build via `Web/config.nswag` + Liquid templates
- Use the generated client classes (`*Client` in `web-api-client.ts`) for normal JSON APIs
- For **file upload flows** (`multipart/form-data`, chunk upload to presigned URLs), use manual `fetch()` + `FormData` / binary chunk body, as in:
  - `src/hooks/media-file-hooks/useCreateMediaFile.js`
  - `src/hooks/media-file-hooks/useUploadToSpaces.js`
- Response processors automatically call `followIfLoginRedirect` — do not bypass this
- After changing an endpoint contract, rebuild the .NET project in Debug to regenerate, then update call sites
- Practical rule: generated client first; use manual `fetch` in specific cases like file upload where multipart/chunk handling is needed

## Auth flow

- Backend redirects unauthenticated requests to `/Identity/Account/Login`
- Frontend detects the redirect in the API client response interceptor and navigates the user to the login page with `ReturnUrl`
- `AuthContext` and `SignalRContext` provide auth + realtime state to the component tree

## File & naming conventions

- **PascalCase** for component files (`Home.jsx`, `NavMenu.jsx`, `Layout.jsx`)
- Class components use `static displayName = ClassName.name`
- Utility helpers use camelCase (`followIfLoginRedirect.js`) inside subfolders
- Auth helpers go under `components/api-authorization/`

## API call placement

- **Never call API clients directly inside `.jsx` components**.
- All API calls must be wrapped in hooks under `src/hooks/**` (React Query hooks for query/mutation flows).
- Components should consume hook state (`data`, `isLoading`, `isError`, `mutate`) only.
- Pattern examples: `useRegister.js`, `useLogin.js`, `useGetPublicUserInfo.js`.

## Styling & theming

- **Material UI (MUI)** is the primary component library — prefer MUI components over raw HTML/CSS
- Custom theme defined in **`src/theme/theme.js`** using `createTheme`
- Always reference theme tokens via the MUI `sx` prop or `styled()` — never hard-code brand colors
- Token reference pattern: `"brand.main"`, `"brand.light"`, `"text.primary"`, `"text.secondary"`, `"grey.300"`, `"error.main"`, etc.
- Key palette groups from the theme:
  - **brand**: `brand.main` (#00A76F), `brand.light`, `brand.dark`, `brand.darker`, `brand.lighter`
  - **secondaryBrand**: `secondaryBrand.main` (#8E33FF) …
  - **semantic**: `success.main`, `info.main`, `warning.main`, `error.main` (each with lighter/light/dark/darker/contrastText)
  - **grey**: `grey.0` – `grey.900`
  - **background**: `background.default`, `background.surface`, `background.paper`, `background.alt`, `background.muted`
  - **text**: `text.primary`, `text.secondary`, `text.tertiary`, `text.disabled`, `text.inverse`
- Typography: Roboto, `h1`–`h3` defined, `button.textTransform: "none"`
- Component-scoped CSS files only when MUI's `sx` / `styled` cannot cover the case
- Default MUI field borders and button are unacceptable; customize hover/focus borders only when needed for UX consistency with surrounding screens.

## Lint & format

- ESLint with `eslint-config-react-app`; no custom `.eslintrc`
- No Prettier — rely on `.editorconfig`: 2-space indent for JS, LF line endings, final newline
- Run `npm --prefix Web/ClientApp run lint` before merging

## Testing

- Jest + jsdom via `react-scripts test`
- Place test files adjacent to components (`*.test.js`)
- Wrap router-dependent components in `MemoryRouter` when testing
- Run: `npm --prefix Web/ClientApp test` (or `-- --testNamePattern=...`)

## Things to avoid

- Editing `web-api-client.ts` directly
- Bypassing `followIfLoginRedirect` for authenticated API calls
- Introducing ad-hoc `fetch` wrappers for normal JSON endpoints when a generated client already exists (except specific cases like file upload multipart/chunk flows)
- Adding a second routing pattern — stick with React Router v6 route array mapping
- Using hard-coded hex values where theme tokens exist (use `brand.main`, `text.primary`, etc.)
- Adopting a second UI system when MUI already covers the use case
- Mixing class and function components inconsistently — prefer function components for new code
