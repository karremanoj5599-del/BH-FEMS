# FEMS — Project Architecture (Mermaid Diagrams)

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Clients["🖥️ Clients"]
        WEB["Web App<br/>(React + Vite)"]
        MOBILE["Mobile App<br/>(React Native - Future)"]
    end

    subgraph Frontend["⚛️ Frontend (React SPA)"]
        AUTH_CTX["AuthContext<br/>(JWT + Demo Mode)"]
        API_SVC["API Service<br/>(Axios + Interceptors)"]
        ROUTER["React Router<br/>(Protected Routes)"]
        LAYOUT["MainLayout<br/>(Sidebar + TopBar)"]
    end

    subgraph Backend["🐍 Backend (FastAPI)"]
        MAIN["main.py<br/>(CORS, Routing)"]
        AUTH_API["Auth API<br/>(Login, JWT)"]
        CRUD_API["CRUD APIs<br/>(Employees, Roles, etc.)"]
        DASH_API["Dashboard API<br/>(Metrics Aggregation)"]
        SEED["Seeder<br/>(Default Roles + Admin)"]
    end

    subgraph Data["🗄️ Data Layer"]
        PG["PostgreSQL<br/>(Primary DB)"]
        REDIS["Redis<br/>(Cache - Future)"]
        FILES["File Storage<br/>(S3/Local - Future)"]
    end

    WEB --> AUTH_CTX
    MOBILE -.-> API_SVC
    AUTH_CTX --> API_SVC
    API_SVC --> MAIN
    ROUTER --> LAYOUT
    MAIN --> AUTH_API
    MAIN --> CRUD_API
    MAIN --> DASH_API
    AUTH_API --> PG
    CRUD_API --> PG
    DASH_API --> PG
    SEED --> PG
```

---

## 2. Frontend Routing & Page Map

```mermaid
graph LR
    subgraph Public
        LOGIN["/login<br/>Login.jsx"]
    end

    subgraph Protected["Protected (MainLayout)"]
        DASH["/ Dashboard"]
        PORTAL["/portal Employee Portal"]

        subgraph OrgMgmt["Organization"]
            EMP["/employees"]
            DEPT["/departments"]
            TEAM["/teams"]
            ROLES["/roles"]
        end

        subgraph Workforce["Workforce"]
            SHIFTS["/shifts"]
            SITES["/sites"]
            ATTEND["/attendance"]
        end

        subgraph Operations["Operations"]
            TASKS["/tasks"]
            EXPENSES["/expenses"]
        end

        subgraph HR["HR & Compliance"]
            LEAVES["/leaves"]
            HOLIDAYS["/holidays"]
        end

        subgraph Analytics["Analytics"]
            REPORTS["/reports"]
            LOGS["/logs"]
        end
    end

    LOGIN -->|auth success| DASH
    DASH --> OrgMgmt
    DASH --> Workforce
    DASH --> Operations
    DASH --> HR
    DASH --> Analytics
```

---

## 3. Backend Data Model (ERD)

```mermaid
erDiagram
    ROLES ||--o{ EMPLOYEES : "has"
    DEPARTMENTS ||--o{ EMPLOYEES : "belongs to"
    TEAMS ||--o{ EMPLOYEES : "member of"
    EMPLOYEES ||--o| EMPLOYEES : "supervised by"

    EMPLOYEES ||--o{ EMPLOYEE_SKILLS : "has"
    SKILLS ||--o{ EMPLOYEE_SKILLS : "linked"

    EMPLOYEES ||--o{ ATTENDANCE : "records"
    EMPLOYEES ||--o{ LOCATION_TRACKING : "tracked"
    EMPLOYEES ||--o{ GEOFENCE_EVENTS : "triggers"

    SHIFT_TYPES ||--o{ SHIFTS : "defines"
    EMPLOYEES ||--o{ SHIFTS : "assigned"
    EMPLOYEES ||--o{ SHIFT_SWAP_REQUESTS : "requests"
    EMPLOYEES ||--o{ SHIFT_BIDS : "bids on"

    SITES ||--o{ SITE_ASSIGNMENTS : "has"
    EMPLOYEES ||--o{ SITE_ASSIGNMENTS : "assigned to"
    SITES ||--o{ SITE_ISSUES : "reported at"
    SITES ||--o{ SITE_ATTENDANCE : "checked in"

    EMPLOYEES ||--o{ TASKS : "assigned"
    TASKS ||--o{ TASK_PROGRESS : "updates"
    TASKS ||--o{ MATERIAL_USAGE : "uses"

    EMPLOYEES ||--o{ EXPENSES : "submits"
    EXPENSES ||--o{ EXPENSE_APPROVALS : "reviewed"

    LEAVE_TYPES ||--o{ LEAVES : "categorized"
    EMPLOYEES ||--o{ LEAVES : "applies"
    EMPLOYEES ||--o{ LEAVE_BALANCES : "has"

    EMPLOYEES ||--o{ NOTIFICATIONS : "receives"
    NOTIFICATIONS ||--o{ NOTIFICATION_RECIPIENTS : "sent to"

    EMPLOYEES ||--o{ REPORTS : "generates"
    REPORTS ||--o{ REPORT_SCHEDULES : "scheduled"

    ROLES {
        int id PK
        string name
        string permissions
    }
    EMPLOYEES {
        int id PK
        string employee_id UK
        string name
        string email UK
        int role_id FK
        int department_id FK
        int team_id FK
        int supervisor_id FK
        string status
        string employee_type
    }
    DEPARTMENTS {
        int id PK
        string name
        int manager_id FK
        string status
    }
    TEAMS {
        int id PK
        string name
        int department_id FK
        int lead_id FK
    }
    SHIFT_TYPES {
        int id PK
        string name
        time start_time
        time end_time
        int grace_minutes
        string ot_policy
    }
    SITES {
        int id PK
        string site_id UK
        string name
        float lat
        float long
        int geofence_radius
        string status
    }
    ATTENDANCE {
        int id PK
        int employee_id FK
        datetime check_in
        datetime check_out
        float lat
        float long
    }
    TASKS {
        int id PK
        string title
        int assigned_to FK
        string status
        string priority
    }
    EXPENSES {
        int id PK
        int employee_id FK
        float amount
        string category
        string status
    }
    LEAVE_TYPES {
        int id PK
        string name
        int annual_quota
    }
    LEAVES {
        int id PK
        int employee_id FK
        int leave_type_id FK
        date start_date
        date end_date
        string status
    }
```

---

## 4. Role-Based Access Control (RBAC)

```mermaid
graph TD
    subgraph Roles["🔐 System Roles"]
        ADMIN["Admin<br/>(Full Access)"]
        HR["HR<br/>(People + Leaves)"]
        SUPERVISOR["Supervisor<br/>(Team + Sites)"]
        MANAGER["Manager<br/>(Reports + Tasks)"]
        EMPLOYEE["Employee<br/>(Self-service)"]
        CUSTOM["Custom Roles<br/>(Configurable)"]
    end

    subgraph Modules["📦 Module Access"]
        M_DASH["Dashboard"]
        M_EMP["Employees"]
        M_DEPT["Departments"]
        M_TEAM["Teams"]
        M_ROLE["Roles"]
        M_SHIFT["Shifts"]
        M_SITE["Sites"]
        M_TASK["Tasks"]
        M_EXP["Expenses"]
        M_ATT["Attendance"]
        M_LEAVE["Leaves"]
        M_REP["Reports"]
        M_LOG["Logs"]
        M_PORTAL["Employee Portal"]
    end

    ADMIN --> M_DASH & M_EMP & M_DEPT & M_TEAM & M_ROLE & M_SHIFT & M_SITE & M_TASK & M_EXP & M_ATT & M_LEAVE & M_REP & M_LOG & M_PORTAL
    HR --> M_DASH & M_EMP & M_LEAVE & M_ATT & M_REP & M_PORTAL
    SUPERVISOR --> M_DASH & M_TASK & M_SITE & M_ATT & M_PORTAL
    MANAGER --> M_DASH & M_REP & M_TASK & M_EXP & M_PORTAL
    EMPLOYEE --> M_DASH & M_ATT & M_PORTAL
```

---

## 5. Frontend Component Tree

```mermaid
graph TD
    APP["App.jsx"] --> AUTH_PROVIDER["AuthProvider"]
    AUTH_PROVIDER --> BROWSER_ROUTER["BrowserRouter"]
    BROWSER_ROUTER --> LOGIN_ROUTE["Route: /login"]
    BROWSER_ROUTER --> MAIN_LAYOUT["MainLayout"]

    MAIN_LAYOUT --> SIDEBAR["Sidebar.jsx<br/>(Role-based Nav)"]
    MAIN_LAYOUT --> TOPBAR["TopBar.jsx<br/>(Search, Notifications)"]
    MAIN_LAYOUT --> OUTLET["Outlet (Pages)"]

    LOGIN_ROUTE --> LOGIN_PAGE["Login.jsx"]

    OUTLET --> DASHBOARD["Dashboard.jsx<br/>(Charts: Recharts)"]
    OUTLET --> EMPLOYEE_LIST["EmployeeList.jsx<br/>(Table + Modal)"]
    OUTLET --> SHIFTS_PAGE["ShiftsPage.jsx<br/>(Roster, Swaps, Bidding)"]
    OUTLET --> SITES_PAGE["SitesPage.jsx<br/>(Grid + Map: Leaflet)"]
    OUTLET --> ATTENDANCE_PAGE["AttendancePage.jsx<br/>(GPS + Map: Leaflet)"]
    OUTLET --> TASKS_PAGE["TasksPage.jsx<br/>(Kanban Board)"]
    OUTLET --> EXPENSES_PAGE["ExpensesPage.jsx<br/>(Receipts + Approvals)"]
    OUTLET --> LEAVES_PAGE["LeavesPage.jsx<br/>(Balances + Admin Settings)"]
    OUTLET --> HOLIDAYS_PAGE["HolidaysPage.jsx<br/>(Calendar)"]
    OUTLET --> REPORTS_PAGE["ReportsPage.jsx<br/>(Analytics + Export)"]
    OUTLET --> LOGS_PAGE["LogsPage.jsx<br/>(Audit Trail)"]
    OUTLET --> PORTAL["EmployeePortal.jsx<br/>(Personal Hub)"]
```

---

## 6. Backend Module Map

```mermaid
graph LR
    subgraph API["API Layer (FastAPI Routers)"]
        R_AUTH["auth.py"]
        R_DASH["dashboard.py"]
        R_EMP["employees.py"]
        R_DEPT["departments.py"]
        R_TEAM["teams.py"]
        R_ROLE["roles.py"]
    end

    subgraph Models["ORM Models (SQLAlchemy)"]
        M_ROLE["role.py"]
        M_DEPT["department.py"]
        M_TEAM["team.py"]
        M_EMP["employee.py"]
        M_SHIFT["shift.py"]
        M_SITE["site.py"]
        M_TASK["task.py"]
        M_EXP["expense.py"]
        M_LEAVE["leave.py"]
        M_HOL["holiday.py"]
        M_ATT["attendance.py"]
        M_REP["report.py"]
        M_NOTIF["notification.py"]
        M_LOG["log.py"]
    end

    subgraph Core["Core Services"]
        C_DB["database.py<br/>(Engine + Session)"]
        C_SEC["security.py<br/>(JWT + Hashing)"]
        C_CFG["config.py<br/>(Env Settings)"]
    end

    R_AUTH --> C_SEC
    R_AUTH --> M_EMP
    R_EMP --> M_EMP
    R_DEPT --> M_DEPT
    R_TEAM --> M_TEAM
    R_ROLE --> M_ROLE
    R_DASH --> M_EMP & M_ATT & M_SITE & M_TASK
    
    M_EMP --> C_DB
    M_DEPT --> C_DB
    M_TEAM --> C_DB
    M_ROLE --> C_DB
    C_SEC --> C_CFG
    C_DB --> C_CFG
```
