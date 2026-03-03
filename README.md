# 🏢 PropAI OS — AI-Powered Property Management Platform

> Dubai's Smart Property Ecosystem — A full-stack SaaS platform with AI-driven maintenance triage, smart rent pricing, RAG chatbot, and real-time notifications.

![Django](https://img.shields.io/badge/Django-5.2-green?logo=django)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38bdf8?logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![AI](https://img.shields.io/badge/AI-Groq%20Llama%204%20%2B%203.3-ff6f00)
![Cost](https://img.shields.io/badge/AI%20Cost-%240%20Free-brightgreen)
![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway)

---

## ✨ Features

### 🤖 AI-Powered Capabilities
- **Visual Triage AI** — Upload a photo of damage → Llama 4 Scout Vision AI analyzes severity, auto-sets priority (Emergency/High/Medium/Low), generates title & description
- **Smart Rent Pricing Engine** — AI analyzes unit type, area, bedrooms, location against Dubai market data → recommends optimal rent with confidence score
- **RAG Chatbot Concierge** — Groq Llama 3.3 70B with full property context. Tenants ask about payments, leases, rules. Admins query across entire portfolio
- **Building Rules RAG** — Chatbot answers tenant policy questions (pets, parking, visitors, noise, gym, pool) from manager-defined rules & regulations
- **AI Auto-assign Technicians** — Detects ticket category (Plumbing/Electrical/HVAC/etc.) and assigns to the best available technician based on specialty + workload

### 🏢 4 Role-Based Portals

| Portal | Role | Key Features |
|--------|------|-------------|
| **Admin Dashboard** | Owner / Super Admin | Full portfolio overview, financial stats, analytics charts, property management |
| **Manager Dashboard** | Property Manager | Per-property view, unit/tenant management, rules editor, inquiry handling, tenant onboarding |
| **Technician Dashboard** | Maintenance Staff | Assigned job queue, status updates, resolution notes, priority alerts |
| **Tenant App** | Tenant | Maintenance requests, payment history, lease details, AI chatbot, notifications |

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
- Click-to-navigate notifications (routes to relevant page)
- Severity levels: Emergency, High, Medium, Low
- Auto-triggers on: ticket created, assigned, resolved, emergency
- Polls every 15 seconds for real-time feel

### 🌐 Public Property Listing
- Public-facing property pages (no login required)
- Vacant unit listings with rent, type, bedrooms, bathrooms, sqft
- Customer inquiry form with WhatsApp integration
- One-click tenant onboarding from inquiry (auto-creates user, lease, credentials)
- WhatsApp credential delivery to new tenants

### 🎨 Luxury UI/UX
- Dark/Light theme system with amber accents (Plus Jakarta Sans font)
- Full theme support across all 38+ components
- Responsive design for desktop and mobile
- Smooth transitions, animations, gold shimmer effects

### 🏗️ Core Platform
- Multi-tenant SaaS architecture (Organization-level data isolation)
- Full CRUD for properties, units, tenants, leases, cheques
- Role-based access control (8 roles)
- JWT authentication with smart role-based redirects
- Manager can add units directly from dashboard (visible to super admin)
- Emergency email alerts for high-priority tickets

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Django 5.x, Django REST Framework, SimpleJWT |
| **Database** | PostgreSQL 16 (pgvector-ready) |
| **AI / LLM** | Groq Llama 4 Scout 17B Vision (triage), Groq Llama 3.3 70B (chatbot + pricing) — 100% FREE |
| **PDF Engine** | ReportLab |
| **Task Queue** | Celery + Redis |
| **Static Files** | Whitenoise (production) |
| **WSGI Server** | Gunicorn (production) |
| **DevOps** | Docker Compose (5 containers), Railway (production) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Git
- Groq API Key ([Get it here — FREE](https://console.groq.com/keys))

### 1. Clone & Setup

```bash
git clone https://github.com/Fahis7/PropAI-OS.git
cd PropAI-OS
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Django
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
POSTGRES_DB=propos_db
POSTGRES_USER=propos_user
POSTGRES_PASSWORD=propos_password
POSTGRES_HOST=db
POSTGRES_PORT=5432

# AI (Groq is 100% FREE)
GROQ_API_KEY=your-groq-api-key

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
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

### 5. Setup Demo Data (Optional)

```bash
docker-compose exec backend python setup_manager.py
docker-compose exec backend python setup_techs.py
```

### 6. Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

---

## 👥 Demo Accounts

After running `setup_manager.py` and `setup_techs.py`, these accounts are available:

| Role | Username | Password | Portal |
|------|----------|----------|--------|
| 🏢 Owner / Admin | `betterhomes` | `owner123` | `/dashboard` |
| 🏠 Property Manager | `manager1` | `manager123` | `/manager/dashboard` |
| 🔧 General Technician | `technician1` | `tech123` | `/tech/dashboard` |
| 🔧 Plumber | `tech_plumber` | `tech123` | `/tech/dashboard` |
| 🔧 Electrician | `tech_electric` | `tech123` | `/tech/dashboard` |
| 🔧 HVAC Technician | `tech_hvac` | `tech123` | `/tech/dashboard` |
| 👤 Tenant | `ahmed@gmail.com` | `tenant123` | `/tenant/dashboard` |

> **Note:** The super admin account is created separately via `createsuperuser`. Demo accounts above are for testing role-based features.

---

## 📁 Project Structure

```
PropAI-OS/
├── backend/
│   ├── config/              # Django settings, URLs, WSGI, Celery
│   ├── core/                # User model (8 roles), Organization, auth, dashboard stats
│   ├── properties/          # Property & Unit models, AI pricing engine, public APIs
│   ├── tenants/             # Tenant, Lease models, Ejari PDF generator
│   ├── finance/             # Cheque management (Dubai post-dated cheque system)
│   ├── maintenance/         # Tickets, AI triage, image analysis, auto-assign
│   ├── communication/       # RAG Chatbot (Groq), Notifications, Inquiries, Chat logs
│   ├── Dockerfile
│   ├── Procfile             # Railway deployment command
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # API client with JWT interceptors
│   │   ├── context/ThemeContext.jsx  # Dark/Light luxury theme system
│   │   ├── components/
│   │   │   ├── admin/            # Super admin pages (13 components)
│   │   │   ├── manager/          # Manager dashboard with unit management
│   │   │   ├── technician/       # Technician job queue dashboard
│   │   │   ├── tenant/           # Tenant portal (8 components)
│   │   │   ├── Chatbot.jsx       # AI chatbot widget (all portals)
│   │   │   ├── NotificationBell.jsx  # Real-time notification bell
│   │   │   └── ThemeToggle.jsx   # Dark/Light mode toggle
│   │   └── pages/                # Login, Layout, PublicHome, PropertyPublic
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # 5 services: db, backend, redis, ai_worker, frontend
├── railway.json              # Railway deployment config
├── .env.example              # Environment variable template
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
| PATCH | `/api/properties/{id}/rules/` | Update building rules |

### Tenants & Leases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/tenants/` | List/Create tenants |
| GET/POST | `/api/leases/` | List/Create leases |
| GET | `/api/leases/{id}/ejari/` | Download Ejari PDF |

### Finance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/cheques/` | List/Create cheques |
| PATCH | `/api/cheques/{id}/` | Update cheque status |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/maintenance/` | List/Create tickets |
| PATCH | `/api/maintenance/{id}/` | Update ticket status |
| GET | `/api/technician/stats/` | Technician workload |

### AI & Communication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/` | AI Chatbot (RAG powered) |
| GET | `/api/notifications/` | User notifications |
| GET | `/api/notifications/count/` | Unread count |
| POST | `/api/notifications/{id}/read/` | Mark as read |

### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats/` | Admin overview stats |
| GET | `/api/analytics/` | Charts & analytics data |
| GET | `/api/manager/stats/` | Manager property stats |
| GET | `/api/manager/inquiries/` | Customer inquiries |
| POST | `/api/manager/onboard-tenant/` | Onboard tenant from inquiry |

### Public (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/properties/` | Public property listings |
| GET | `/api/public/properties/{id}/` | Property detail + vacant units |
| POST | `/api/public/inquiries/` | Submit customer inquiry |

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

## 📊 Data Models

```
Organization
  └── Property (name, address, city, type, image, rules_and_regulations)
        ├── Unit (number, type, rent, bedrooms, bathrooms, sqft, status)
        │     └── Lease (tenant, start/end dates, rent, is_active)
        │           └── Cheque (amount, date, number, status, image, bank)
        ├── MaintenanceTicket (title, desc, priority, status, ai_category, image, assigned_to)
        └── Inquiry (customer_name, phone, email, message, status)

User (username, role, organization, managed_property, specialty)
  ├── Roles: SUPER_ADMIN, OWNER, MANAGER, FINANCE, AGENT, MAINTENANCE, SECURITY, TENANT
  └── Tenant (name, email, phone, nationality, passport_number)

Notification (recipient, type, title, message, severity, is_read)
ChatLog (organization, user_message, ai_response)
```

---

## 🚀 Production Deployment (Railway)

### Architecture

```
┌──────────────────────────────────────────────┐
│               RAILWAY PROJECT                │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Frontend │  │ Backend  │  │  Redis   │   │
│  │ (React)  │  │ (Django) │  │ (Queue)  │   │
│  │  serve   │  │ gunicorn │  │          │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │         │
│       │         ┌────┴─────┐        │         │
│       │         │PostgreSQL│        │         │
│       │         │(Database)│        │         │
│       │         └──────────┘        │         │
│       │                             │         │
│  .up.railway.app  .up.railway.app            │
└──────────────────────────────────────────────┘
```

### Services Required
1. **PostgreSQL** — Railway database (auto-provides `DATABASE_URL`)
2. **Redis** — Railway Redis (auto-provides `REDIS_URL`)
3. **Backend** — Django + Gunicorn (root directory: `backend`)
4. **Frontend** — React static build (root directory: `frontend`)

### Backend Environment Variables
```
DJANGO_SECRET_KEY=<random-64-char-string>
DEBUG=False
GROQ_API_KEY=<your-groq-key>
CELERY_BROKER_URL=${{Redis.REDIS_URL}}
CELERY_RESULT_BACKEND=${{Redis.REDIS_URL}}
CORS_ALLOWED_ORIGINS=https://<frontend>.up.railway.app
CSRF_TRUSTED_ORIGINS=https://<backend>.up.railway.app
FRONTEND_URL=https://<frontend>.up.railway.app
```

### Frontend Build Variables
```
VITE_API_URL=https://<backend>.up.railway.app/api/
VITE_MEDIA_URL=https://<backend>.up.railway.app
```

### Post-Deploy
```bash
# In Railway backend shell:
python manage.py createsuperuser
python setup_manager.py
python setup_techs.py
```

---

## 🌍 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DJANGO_SECRET_KEY` | Yes | Django secret key |
| `DEBUG` | No | `True` for dev, `False` for production |
| `GROQ_API_KEY` | Yes | Groq API key for AI features ([free](https://console.groq.com)) |
| `DATABASE_URL` | Prod | PostgreSQL connection string (Railway auto-provides) |
| `POSTGRES_DB/USER/PASSWORD/HOST` | Dev | Individual DB credentials for Docker |
| `CELERY_BROKER_URL` | Yes | Redis URL for Celery task queue |
| `CORS_ALLOWED_ORIGINS` | Prod | Comma-separated allowed frontend origins |
| `CSRF_TRUSTED_ORIGINS` | Prod | Backend URL for CSRF protection |
| `FRONTEND_URL` | Prod | Frontend URL (used in WhatsApp onboarding messages) |
| `VITE_API_URL` | Yes | Backend API URL for frontend |
| `VITE_MEDIA_URL` | Yes | Backend URL for serving media/images |

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
