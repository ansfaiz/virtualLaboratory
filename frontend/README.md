# 🧪 Virtual Laboratory — Frontend

A production-grade React frontend for the **Virtual Laboratory** — a university online coding platform where students complete programming assignments, teachers evaluate submissions, and admins manage everything.

---

## ✨ Tech Stack

| Tool | Purpose |
|---|---|
| **React 18** | UI Framework |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Axios** | HTTP client |
| **Monaco Editor** | VS Code-quality code editor |
| **Recharts** | Analytics charts |
| **Lucide React** | Icon system |
| **date-fns** | Date formatting |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server (proxies /api to localhost:8080)
npm run dev

# Build for production
npm run build
```

> **Requires Node.js 18+**

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Button, Card, Badge, Modal, DataTable, Toast, Avatar, Spinner
│   ├── forms/           # Input, Textarea, Select, SearchInput
│   └── layout/          # AppShell, Sidebar, Topbar, ProtectedRoute
│
├── pages/
│   ├── auth/            # LoginPage
│   ├── admin/           # Dashboard, UserManagement, BatchSectionPages, Languages
│   ├── teacher/         # Dashboard, Assignments, Submissions, Performance
│   └── student/         # Dashboard, Assignments, CodingEnvironment, Submissions, Results
│
├── services/
│   ├── apiClient.js     # Axios instance with JWT interceptors & 401 handling
│   └── index.js         # All service methods for every API endpoint
│
├── context/
│   ├── AuthContext.jsx  # Auth state (user, login, logout)
│   └── ThemeContext.jsx # Dark/light theme toggle
│
├── hooks/
│   └── index.js         # useFetch, useMutation, useDebounce, useLocalStorage
│
├── utils/
│   └── index.js         # formatDate, cn, getInitials, statusColor, codeTemplates
│
└── styles/
    └── globals.css      # Tailwind base + custom components + scrollbar
```

---

## 🔐 Authentication

The `AuthContext` handles:
- JWT token stored in `localStorage`
- User object persisted across page reloads
- **Role-based routing** via `ProtectedRoute`
- Auto-redirect on 401 responses via Axios interceptor

**Roles:** `ADMIN` | `TEACHER` | `STUDENT`

Demo credentials (connect to backend or mock):
```
Admin:   admin@vlab.edu   / admin123
Teacher: teacher@vlab.edu / teacher123
Student: student@vlab.edu / student123
```

---

## 🔌 API Integration

The `apiClient.js` sets base URL from `VITE_API_URL` env var (defaults to `/api`, proxied to `localhost:8080`).

All API calls are organized in `services/index.js`:

```js
import { userService, assignmentService, submissionService } from './services'

// GET all users
const users = await userService.getAll({ page: 0, size: 20 })

// Create assignment
const assignment = await assignmentService.create({ title, description, ... })

// Submit solution
const result = await submissionService.submit({ assignmentId, code, language })
```

---

## 🧑‍💻 Coding Environment

The `CodingEnvironmentPage` features:
- **Monaco Editor** with syntax highlighting for 8+ languages
- **Language selector** with per-language starter code templates
- **Run Code** button — sends code to backend execution engine
- **Custom stdin** input for test data
- **Console output** with success/error coloring
- **Submit** button to finalize submission
- Split-panel layout: Problem Description | Editor | Console

---

## 🎨 Design System

Custom Tailwind design tokens in `tailwind.config.js`:

- **Primary color:** `lab-500` (`#0e76fd`) — blue accent
- **Font:** DM Sans (UI) + JetBrains Mono (code)
- **Theme:** Dark-first with `dark:` class toggle
- **Components:** `.card`, `.sidebar-item`, `.form-input`, `.code-chip`, `.data-table`

---

## 🗺️ Page Routing

| Path | Role | Page |
|---|---|---|
| `/login` | Public | Login |
| `/admin` | ADMIN | Admin Dashboard |
| `/admin/users` | ADMIN | User Management |
| `/admin/batches` | ADMIN | Batch Management |
| `/admin/sections` | ADMIN | Section Management |
| `/admin/languages` | ADMIN | Language Management |
| `/teacher` | TEACHER | Teacher Dashboard |
| `/teacher/assignments` | TEACHER | Assignment List |
| `/teacher/assignments/new` | TEACHER | Create Assignment |
| `/teacher/submissions` | TEACHER | Review Submissions |
| `/teacher/performance` | TEACHER | Analytics |
| `/student` | STUDENT | Student Dashboard |
| `/student/assignments` | STUDENT | Assignment List |
| `/student/assignments/:id/code` | STUDENT | Coding Environment |
| `/student/submissions` | STUDENT | Submission History |
| `/student/results` | STUDENT | Grades & Results |

---

## ⚙️ Environment Variables

Create `.env.local`:

```env
VITE_API_URL=http://localhost:8080/api
```

---

## 🏗️ Backend Integration Notes

This frontend expects a **Spring Boot REST API** with endpoints following:

```
POST   /api/auth/login
GET    /api/users
POST   /api/users
GET    /api/assignments
POST   /api/assignments
POST   /api/submissions
POST   /api/submissions/run      ← Code execution endpoint
PUT    /api/submissions/:id/grade
GET    /api/analytics/admin
```

JWT token must be returned as `{ user: {..., role: "ADMIN|TEACHER|STUDENT"}, token: "..." }` from login.

---

## 📦 Production Build

```bash
npm run build
# Output: dist/ — serve with Nginx, Vercel, or any static host
```

---

Built with ❤️ for university coding education.
