# 🏢 PropAI OS — AI-Powered Property Management Platform

> Dubai's Smart Property Ecosystem — A full-stack SaaS platform with AI-driven maintenance triage, smart rent pricing, RAG chatbot, and real-time notifications.

![Django](https://img.shields.io/badge/Django-5.2-green?logo=django)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38bdf8?logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![AI](https://img.shields.io/badge/AI-Groq%20Llama%204%20%2B%203.3-ff6f00)
![Cost](https://img.shields.io/badge/AI%20Cost-%240%20Free-brightgreen)

---

## ✨ Features

### 🤖 AI-Powered Capabilities
- **Visual Triage AI** — Upload a photo of damage → Llama 4 Scout Vision AI analyzes severity, auto-sets priority (Emergency/High/Medium/Low), generates title & description
- **Smart Rent Pricing Engine** — AI analyzes unit type, area, bedrooms, location against Dubai market data → recommends optimal rent with confidence score
- **RAG Chatbot Concierge** — Groq Llama 3.3 70B with full property context. Tenants ask about payments, leases, rules. Admins query across entire portfolio
- **AI Auto-assign Technicians** — Detects ticket category (Plumbing/Electrical/HVAC/etc.) and assigns to the best available technician based on specialty + workload

### 🏢 4 Role-Based Portals

| Portal | Role | Key Features |
|--------|------|-------------|
| **Admin Dashboard** | Owner / Super Admin | Full portfolio overview, financial stats, analytics charts, property management |
| **Manager Dashboard** | Property Manager | Per-property view, unit/tenant management, rules & regulations editor |
| **Technician Dashboard** | Maintenance Staff | Assigned job queue, status updates, resolution notes, priority alerts |
| **Tenant App** | Tenant | Maintenance requests, payment history, lease details, AI chatbot |

### 📊 Analytics & Insights
- Revenue trend charts (monthly bar graph)
- Payment status breakdown (donut chart)
- Maintenance tickets by category (horizontal bar)
- Priority distribution (pie chart)
- Tickets over time (line chart)
- Revenue by property comparison
- Technician performance & resolve rates
- Expiring leases tracker (90-day alert)

### 📄 Document Generation
- **Ejari Contract PDF** — RERA-style Dubai tenancy contracts with bilingual headers (English/Arabic), payment schedules, terms & conditions, signature blocks

### 🔔 Smart Notification System
- Bell icon with unread badge on every portal
- Toast popup alerts for new events
- Auto-triggers on: ticket created, assigned, resolved, emergency
- Polls every 15 seconds for real-time feel

### 🏗️ Core Platform
- Multi-tenant SaaS architecture (Organization-level data isolation)
- Full CRUD for properties, units, tenants, leases, cheques
- Role-based access control (8 roles)
- JWT authentication with smart role-based redirects
- Emergency email alerts for high-priority tickets

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Django 5.2, Django REST Framework, SimpleJWT |
| **Database** | PostgreSQL 16 (pgvector-ready) |
| **AI / LLM** | Groq Llama 4 Scout 17B Vision (triage), Groq Llama 3.3 70B (chatbot + pricing) — 100% FREE |
| **PDF Engine** | ReportLab |
| **Task Queue** | Celery + Redis |
| **DevOps** | Docker Compose (5 containers) |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Groq API Key ([Get it here — FREE](https://console.groq.com/keys))

### 1. Clone & Setup

```bash
git clone https://github.com/Fahis7/PropAI-OS.git
cd PropAI-OS
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# Django
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=propos_db
DB_USER=propos_user
DB_PASSWORD=propos_password
DB_HOST=db
DB_PORT=5432

# AI Keys (Groq is 100% FREE)
GROQ_API_KEY=your-groq-api-key

# Email (optional)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### 3. Launch

```bash
docker-compose up --build
```

### 4. Initialize Database

```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### 5. Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

---

## 👥 Demo Accounts

| Role | Username | Password | Portal URL |
|------|----------|----------|-----------|
| 🏢 Owner/Admin | `betterhomes` | `owner123` | `/dashboard` |
| 🏠 Manager | `manager1` | `manager123` | `/manager/dashboard` |
| 🔧 Technician | `technician1` | `tech123` | `/tech/dashboard` |
| 🔧 Plumber | `tech_plumber` | `tech123` | `/tech/dashboard` |
| 🔧 Electrician | `tech_electric` | `tech123` | `/tech/dashboard` |
| 🔧 HVAC Tech | `tech_hvac` | `tech123` | `/tech/dashboard` |
| 👤 Tenant | `ahmed@gmail.com` | `tenant123` | `/tenant/dashboard` |

---

## 📁 Project Structure

```
PropAI-OS/
├── backend/
│   ├── config/              # Django settings, URLs, ASGI/WSGI
│   ├── core/                # User model (8 roles), Organization, auth
│   ├── properties/          # Property & Unit models, AI pricing engine
│   ├── tenants/             # Tenant, Lease models, Ejari PDF generator
│   ├── finance/             # Cheque management (Dubai post-dated system)
│   ├── maintenance/         # Tickets, AI triage, auto-assign, category detection
│   ├── communication/       # RAG Chatbot, Notifications, Chat logs
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/       # Dashboard, properties, units, finance, analytics
│   │   │   ├── manager/     # Manager per-property dashboard
│   │   │   ├── technician/  # Technician job queue
│   │   │   ├── tenant/      # Tenant app (requests, payments, profile)
│   │   │   ├── Chatbot.jsx  # AI chatbot (all portals)
│   │   │   └── NotificationBell.jsx  # Real-time notification system
│   │   ├── pages/           # Login, Layout (sidebar)
│   │   └── api/axios.js     # API client with JWT interceptors
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # 5 services: db, backend, redis, ai_worker, frontend
├── .env                     # API keys (not committed)
└── .gitignore
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/token/` | JWT Login |
| POST | `/api/token/refresh/` | Refresh token |
| GET | `/api/me/` | Current user profile |

### Properties & Units
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/properties/` | List/Create properties |
| GET/POST | `/api/units/` | List/Create units |
| GET | `/api/units/{id}/smart-pricing/` | AI rent recommendation |

### Tenants & Leases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/tenants/` | List/Create tenants |
| GET/POST | `/api/leases/` | List/Create leases |
| GET | `/api/leases/{id}/ejari/` | Download Ejari PDF |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/maintenance/` | List/Create tickets |
| PATCH | `/api/maintenance/{id}/` | Update ticket status |
| GET | `/api/technician/stats/` | Technician workload |

### AI & Communication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/` | AI Chatbot (RAG) |
| GET | `/api/notifications/` | User notifications |
| GET | `/api/notifications/count/` | Unread count |
| POST | `/api/notifications/{id}/read/` | Mark as read |

### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats/` | Admin overview stats |
| GET | `/api/analytics/` | Charts & analytics data |
| GET | `/api/manager/stats/` | Manager property stats |
| PATCH | `/api/properties/{id}/rules/` | Update building rules |

---

## 🧠 AI Pipeline

```
Tenant submits ticket (with optional photo)
         │
         ▼
   ┌─────────────┐
   │ Llama 4 Scout│ ← Analyzes damage photo (FREE via Groq)
   │  Vision AI   │ → Sets priority, generates description
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  Category    │ ← Keyword detection engine
   │  Detection   │ → PLUMBING / ELECTRICAL / HVAC / etc.
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Auto-Assign  │ ← Matches specialty + workload balancing
   │ Technician   │ → Assigns least-busy matching technician
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Notifications│ ← Alerts admin, manager, technician
   │ + Email      │ → Emergency email for HIGH/EMERGENCY
   └─────────────┘
```

---

## 🇦🇪 Dubai-Specific Features

This platform is built specifically for the Dubai/UAE property market:

- **Ejari Integration** — Auto-generates RERA-style tenancy contracts with Ejari numbers
- **Post-dated Cheque System** — Tracks cheque payment plans (1/2/4/6/12 cheques per year)
- **AED Currency** — All financials in UAE Dirhams
- **Dubai Market Data** — AI pricing uses real Dubai area-wise rent benchmarks
- **Bilingual Support** — Ejari contracts include Arabic headers
- **Emirates ID & Passport** — Tenant profiles store UAE-specific identification

---

## 📄 License

This project is built for educational and portfolio purposes.

---

## 👨‍💻 Author

**Fahis** — Full-Stack Developer

- GitHub: [@Fahis7](https://github.com/Fahis7)

---

<p align="center">
  Built with ❤️ and ☕ in Dubai 🇦🇪
</p>
