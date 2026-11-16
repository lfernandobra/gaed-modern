# GAED Modern — Sistema de Gestão Escolar

[![GAED Modern CI](https://github.com/lfernandobra/gaed-modern/actions/workflows/ci.yml/badge.svg)](https://github.com/lfernandobra/gaed-modern/actions/workflows/ci.yml)

Full-stack modernization of the **GAED** academic management system built as a monorepo with **React 19 + TypeScript + Vite + Tailwind CSS v4** on the frontend and **Node.js + Express + TypeScript + Prisma ORM + PostgreSQL 16** on the backend.

---

## 1. Architecture & Stack

| Layer | Technologies | Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, TanStack Query v5, Axios, React Router v7 | Role-aware dashboard, protected routes, CRUD tables (`DataTable`), pagination, file uploads |
| **Backend API** | Node.js, Express 4, TypeScript, Zod, JWT (`jsonwebtoken`), `bcrypt`, `multer` | REST endpoints (`/api/*`), request validation, RBAC authorization, static upload handling |
| **Database** | PostgreSQL 16, Prisma ORM (`prisma/schema.prisma`, `prisma/seed.ts`) | 18 normalized models across address lookup, user management, classes, report cards, incidents, assignments, and gallery |
| **CI/CD** | GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) | ESLint strict check + production Vite build + PostgreSQL 16 service migration, seed, TypeScript build, and API smoke suite |

---

## 2. Repository Structure

```text
├── .github/workflows/ci.yml   # Frontend lint/build + Postgres 16 backend seed & API smoke CI
├── docker-compose.yml         # Local PostgreSQL 16 container
├── docs/swagger/openapi.yaml  # OpenAPI 3.0.3 endpoint summary
├── backend/
│   ├── .env.example           # Local database & JWT environment template
│   ├── prisma/
│   │   ├── schema.prisma      # Relational schema (Role enum + 18 models)
│   │   └── seed.ts            # Idempotent dev seed across all 6 user roles
│   └── src/
│       ├── middleware/        # JWT authMiddleware, requireRole RBAC, multer upload
│       ├── routes/            # auth, usuarios, enderecos, escola, boletins, ocorrencias, tarefas, imagens
│       └── server.ts          # Express entrypoint & /api/health
└── frontend/
    ├── eslint.config.js       # TypeScript + React Hooks + React Refresh rules
    └── src/
        ├── components/        # Layout shell (Sidebar) & reusable DataTable/Button UI
        ├── contexts/          # AuthProvider + useAuth context state
        └── pages/             # Login, Dashboard, Usuarios, Turmas, Disciplinas, Series/Periodos, Boletins, Tarefas, Ocorrencias, Galeria
```

---

## 3. Role-Based Access Control (RBAC)

`backend/prisma/seed.ts` provisions development accounts across all 6 roles (`ADMIN`, `GESTOR`, `SECRETARIA`, `PROFESSOR`, `RESPONSAVEL`, `ALUNO`) using password `123456` for local testing:

| Role | Seed Login | Access Scope |
| :--- | :--- | :--- |
| `ADMIN` / `GESTOR` / `SECRETARIA` | `admin`, `gestor`, `secretaria` | Full academic structure management, user administration, report card creation, gallery uploads |
| `PROFESSOR` | `prof.joao`, `prof.maria` | Grades/attendance entry, assignments, and student incident records |
| `RESPONSAVEL` | `resp.carlos` | Guardian view for student progress, incidents, and assignments |
| `ALUNO` | `aluno.pedro`, `aluno.julia`, `aluno.lucas` | Student access to assignments, grades, and schedules |

---

## 4. Running Locally

### Prerequisites
* **Node.js 22+ or 24+**
* **Docker** (or local PostgreSQL 16 instance)

### 1. Start PostgreSQL & Setup Backend
```bash
docker compose up -d

cd backend
cp .env.example .env
npm ci
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```
The API listens on `http://localhost:3001` (`GET /api/health`). See [`docs/swagger/openapi.yaml`](docs/swagger/openapi.yaml) for the REST endpoint specification.

### 2. Start Frontend
```bash
cd frontend
npm ci
npm run dev
```
Vite serves the UI at `http://localhost:5173` proxying `/api` requests to the backend.

### Quality Checks
```bash
# Frontend lint & production build
cd frontend && npm run lint && npm run build

# Backend TypeScript compilation
cd backend && npm run build
```

---

## 5. Author

**Luis Fernando Brandão**  
* [GitHub](https://github.com/lfernandobra)  
* [LinkedIn](https://linkedin.com/in/lfernandobra)
