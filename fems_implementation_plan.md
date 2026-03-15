# FEMS — Field Employee Management System: Implementation Plan

This is a **greenfield project** for a cloud-based, desktop, and mobile-ready Field Employee Management System designed for **1,000,000+ users** with strict RBAC.

## User Review Required

> [!IMPORTANT]
> **Tech Stack Decision Required**: Before any code is written, I need your confirmation on the technology choices below. The entire architecture depends on this decision.

> [!WARNING]
> **Scope is massive** — This system has 15+ modules. I recommend building in iterative phases, getting each phase working end-to-end before moving to the next. Each phase below is designed to be independently deployable and testable.

### Key Questions for You

1. **Backend Framework**: I recommend **Python (FastAPI)** — async, high-performance, auto-generated API docs, excellent for real-time features. Alternatively: Node.js/Express or Django REST. **Which do you prefer?**

2. **Frontend Framework**: I recommend **React + Vite** for the web dashboard, with the option to add React Native for mobile later. Alternatively: Next.js (SSR), Vue.js. **Which do you prefer?**

3. **Database**: PostgreSQL (primary relational) + Redis (caching) is the clear choice. For high-velocity GPS/location data, we can start with PostgreSQL and move to TimescaleDB/InfluxDB later if needed. **Are you okay with PostgreSQL?**

4. **Authentication**: JWT-based auth with role-based middleware. **Or do you prefer OAuth2/SSO integration from day one?**

5. **Deployment Target**: Docker + Docker Compose for local development. Cloud deployment (AWS/GCP/Azure) later. **Which cloud provider are you targeting?**

6. **Phase Priority**: Do you want me to start with **Phase 1 (Foundation + RBAC + Employees CRUD)** and build up, or do you have a specific module you want first?

7. **UI Design Style**: Dark mode or light mode default? Any specific design references or brand colors?

---

## Proposed Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLIENTS                           │
│  ┌─────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │ Web App │  │ Desktop App  │  │  Mobile App   │   │
│  │ (React) │  │  (Electron)  │  │(React Native) │   │
│  └────┬────┘  └──────┬───────┘  └───────┬───────┘   │
└───────┼──────────────┼──────────────────┼────────────┘
        │              │                  │
        ▼              ▼                  ▼
┌──────────────────────────────────────────────────────┐
│              API GATEWAY / LOAD BALANCER              │
│            (Nginx / AWS ALB / Traefik)               │
└──────────────────────┬───────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ Auth     │   │ Core API │   │ Realtime │
│ Service  │   │ (FastAPI)│   │(WebSocket│
│ (JWT)    │   │          │   │  /SSE)   │
└────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │
     ▼              ▼              ▼
┌──────────────────────────────────────────────────────┐
│                  DATA LAYER                          │
│  ┌────────────┐  ┌───────┐  ┌──────────────────┐    │
│  │ PostgreSQL │  │ Redis │  │ File Storage     │    │
│  │ (Primary)  │  │(Cache)│  │ (S3/Local/MinIO) │    │
│  └────────────┘  └───────┘  └──────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## Proposed Changes

### Phase 1: Foundation & Core Identity (Start Here)

This phase establishes the entire project skeleton, database, authentication, and the first working screens.

---

#### Backend (`backend/`)

##### [NEW] `backend/requirements.txt`
Core dependencies: FastAPI, Uvicorn, SQLAlchemy, Alembic, Pydantic, python-jose (JWT), passlib, python-multipart, openpyxl, reportlab.

##### [NEW] `backend/app/main.py`
FastAPI application entry point with CORS, middleware, and router registration.

##### [NEW] `backend/app/core/config.py`
Environment-based configuration (DB URL, JWT secret, file storage paths).

##### [NEW] `backend/app/core/security.py`
JWT token creation/validation, password hashing, role-based permission decorators.

##### [NEW] `backend/app/core/database.py`
SQLAlchemy engine, session management, Base model.

##### [NEW] `backend/app/models/`
SQLAlchemy models for all 30+ tables from the ERD:
- `role.py` — ROLES
- `department.py` — DEPARTMENTS
- `team.py` — TEAMS
- `employee.py` — EMPLOYEES, SKILLS, EMPLOYEE_SKILLS
- `shift.py` — SHIFT_TYPES, SHIFTS, SHIFT_SWAP_REQUESTS, SHIFT_BIDS
- `site.py` — SITES, SITE_ASSIGNMENTS, SITE_ISSUES
- `task.py` — TASKS, TASK_PROGRESS, MATERIAL_USAGE
- `expense.py` — EXPENSES, EXPENSE_APPROVALS
- `leave.py` — LEAVE_TYPES, LEAVES, LEAVE_BALANCES
- `holiday.py` — HOLIDAYS
- `attendance.py` — ATTENDANCE, LOCATION_TRACKING, SITE_ATTENDANCE, GEOFENCE_EVENTS
- `report.py` — REPORTS, REPORT_SCHEDULES
- `notification.py` — NOTIFICATIONS, NOTIFICATION_RECIPIENTS
- `log.py` — LOGS

##### [NEW] `backend/app/schemas/`
Pydantic schemas for request/response validation per module.

##### [NEW] `backend/app/api/`
API routers per module:
- `auth.py` — Login, register, token refresh
- `roles.py` — CRUD for roles + permissions
- `employees.py` — CRUD + bulk import/export
- `departments.py` — CRUD
- `teams.py` — CRUD
- `dashboard.py` — Real-time metrics aggregation

##### [NEW] `backend/alembic/`
Database migration configuration.

---

#### Frontend (`frontend/`)

##### [NEW] `frontend/` (Vite + React)
Initialized with `npx create-vite@latest ./ --template react`

##### [NEW] `frontend/src/layouts/MainLayout.jsx`
App shell: Sidebar (role-based menu), Top Bar (search, notifications, profile dropdown), Main Content Area.

##### [NEW] `frontend/src/pages/Login.jsx`
Authentication page with JWT token management.

##### [NEW] `frontend/src/pages/Dashboard.jsx`
Real-time stats cards: Active Employees, On-Site, Attendance %, Sites Visited, Pending Tasks.

##### [NEW] `frontend/src/pages/employees/EmployeeList.jsx`
Searchable, paginated table with CSV export.

##### [NEW] `frontend/src/pages/employees/EmployeeProfile.jsx`
Full employee detail form (personal details, skills, emergency contact, etc.).

##### [NEW] `frontend/src/pages/roles/RolesList.jsx`
RBAC management: Roles table with permissions checkboxes.

##### [NEW] `frontend/src/pages/departments/DepartmentList.jsx`
Department CRUD.

##### [NEW] `frontend/src/pages/teams/TeamList.jsx`
Team CRUD with member assignment.

##### [NEW] `frontend/src/components/`
Shared components: DataTable, Modal, FormField, FileUpload, StatusBadge, Charts.

##### [NEW] `frontend/src/context/AuthContext.jsx`
Authentication state management, token storage, role-based route guards.

##### [NEW] `frontend/src/services/api.js`
Axios-based API client with interceptors for JWT.

##### [NEW] `frontend/src/index.css`
Global design system: CSS variables, typography (Inter font), dark/glassmorphism theme, animations.

---

### Phase 2: Shifts & Sites (After Phase 1 is approved)
- Shift Types CRUD with all rules (grace period, breaks, OT, auto-detection)
- Shift Assignment calendar with conflict detection
- Shift Swap/Trade request workflow
- Shift Bidding system
- Sites CRUD with map integration (Leaflet)
- Geofence configuration
- Site Assignments
- Site Issues tracking

### Phase 3: Tasks & Expenses (After Phase 2)
- Tasks Kanban board with priority color-coding
- Recurring task templates
- Task progress tracking with photos
- Material usage logging
- Expense CRUD with receipt upload
- Expense approval workflow

### Phase 4: Attendance & Location (After Phase 3)
- Check-in/Check-out with GPS
- Selfie/Face recognition UI placeholder
- Geofence validation
- Site Attendance (travel + on-site tracking)
- Location polling & breadcrumb trail
- Distance calculation
- Privacy mode toggle
- Offline mode with post-shift sync

### Phase 5: Leaves & Holidays (After Phase 4)
- Leave types & policies
- Leave balance management
- Leave request workflow with approvals
- Comp-off auto-credit
- Floating/restricted holidays
- Team impact view
- Holiday calendar with public holiday API

### Phase 6: Reports & Analytics (After Phase 5)
- Daily/Monthly attendance reports
- Work reports (site-wise)
- Site reports (progress, costs, battery/network logs)
- Custom Report Builder (drag-and-drop)
- Export to PDF/Excel
- Report scheduling (auto-email)

### Phase 7: System Features (After Phase 6)
- Notifications engine (in-app, push, SMS)
- Activity Logs with search/filter/retention
- Admin Dashboard real-time via WebSockets
- Bulk operations optimization

---

## Project Structure

```
FEMS/
├── backend/
│   ├── app/
│   │   ├── api/           # Route handlers per module
│   │   ├── core/          # Config, security, database
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic validation schemas
│   │   ├── services/      # Business logic layer
│   │   └── main.py        # FastAPI app entry
│   ├── alembic/           # DB migrations
│   ├── tests/             # pytest test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Shared UI components
│   │   ├── context/       # React contexts (Auth, Theme)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # App shell layouts
│   │   ├── pages/         # Page components per module
│   │   ├── services/      # API client
│   │   └── index.css      # Global design system
│   ├── public/
│   └── package.json
└── docker-compose.yml     # Local dev: PostgreSQL, Redis, Backend, Frontend
```

---

## Verification Plan

### Phase 1 Verification

#### Automated Tests
1. **Backend unit tests**: `cd backend && python -m pytest tests/ -v`
   - Test CRUD for roles, employees, departments, teams
   - Test JWT authentication flow (login, token refresh, protected routes)
   - Test RBAC middleware (admin can access role management, employee cannot)
   - Test bulk CSV import/export for employees

2. **Frontend smoke test**: `cd frontend && npm run build` — verify no build errors

#### Browser Verification
- Navigate to login page → login with admin credentials → verify dashboard loads
- Navigate to Employees → verify list renders with pagination
- Add a new employee → verify it appears in the list
- Test role-based sidebar: login as different roles → verify menu items change
- Test CSV import: upload sample CSV → verify employees are created

#### Manual Verification
- Ask user to review the UI design and provide feedback on aesthetics
- Ask user to test the RBAC by logging in with different roles
