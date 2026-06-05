# Complaion Academy — Frontend

React 18 single-page application for the Complaion Academy demo. Handles course listing, video completion, quiz flow, and certificate display.

## Stack

- **React 18** + **TypeScript** — component logic and type safety
- **Vite** — dev server and build tooling
- **Tailwind CSS 4** — utility-first styling
- **React Router v6** — client-side routing

## Pages

| Route | Component | Description |
|---|---|---|
| `/` | `Login` | JWT authentication |
| `/courses` | `CourseList` | Assigned courses with status and actions |
| `/courses/:id/quiz` | `Quiz` | Timed quiz with attempt tracking |
| `/courses/:id/result` | `Result` | Score, pass/fail state, retry or back |

## API

All backend calls are in [`src/api.ts`](src/api.ts). The base URL is read from `VITE_API_URL` (defaults to `http://localhost:8000`). JWT is stored in `localStorage` and attached as a `Bearer` token on every authenticated request. A 401 response clears the token and redirects to login.

## Development

```bash
npm install
npm run dev   # http://localhost:5173
```

The backend must be running at `http://localhost:8000`. See the root `README.md` for full setup instructions.
