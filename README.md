# Task Management UI

React frontend for the task management.

## What this project does

- JWT-based login and logout
- View all tasks in a board layout with status columns
- Drag and drop tasks between columns to change their status
- Create, edit, and delete tasks
- Form validation before submitting
- Redirects to login automatically on session expiry

## Tech stack

- React 19
- TypeScript
- Create React App
- Material UI (MUI v5) for components and styling
- `@dnd-kit/core` for drag and drop

## Running locally

### Prerequisites

- Node 18+ (or check `.nvmrc` if present)
- The backend running at `https://localhost:7217`

### Start the app

```bash
npm install
npm run start
```

Opens at `http://localhost:3000`.

## Default login

Use the seeded credentials from the backend:

- Username: `admin`
- Password: `123456`

## What I built

- Login and logout flow with the JWT token stored in sessionStorage
- Task board with status columns (Not Started, In Progress, Completed, Cancelled)
- Drag and drop tasks between columns to update their status
- Create task form with validation — title is required
- Edit task form pre-populated with existing values
- Delete with immediate list update
- HTTP 401 handling that sends the user back to the login screen

## What I left out

- No per-user task isolation — all logged-in users see and can modify all tasks
- No filtering or sorting on the task list
- No pagination
- No user registration flow — only the seeded admin account works
- No persistent token storage — the token lives in sessionStorage, so closing the browser tab requires logging in again

## Known issues

- Data resets when the backend restarts because the backend uses an in-memory database. That is a backend constraint, not a frontend one.
- The token is stored in sessionStorage. Closing the browser tab logs the user out, but a page refresh within the same tab keeps the session active.

## If I had another day

- Make task ownership explicit — filter the task list to only show tasks belonging to the logged-in user, and block API calls to tasks owned by others
- Add filtering and sorting to the task list
- Improve error messages — right now validation errors from the API are shown generically


## Testing

A sample test suite is included using Jest and React Testing Library. Run with `npm test`.

## Repositories

- Frontend: https://github.com/ali-afzali/taskmanagement-ui
- Backend: https://github.com/ali-afzali/TaskManagementApi

The backend has CORS configured for `http://localhost:3000`, so the frontend must run on that port.
