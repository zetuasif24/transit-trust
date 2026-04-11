# 🚌 Transit Trust
### Public Transport Fare, Safety & Service Rating System

> A full-stack web application that empowers passengers to verify official bus fares, report overcharges, submit safety concerns, and rate transport services across Bangladesh.

---

## 📋 Table of Contents
- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Team](#team)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)

---

## About the Project

Transit Trust is a capstone project developed for **SE 331 - Software Engineering Design** at **Daffodil International University**, Department of Software Engineering.

The system addresses real problems faced by public transport passengers in Bangladesh — fare overcharging, unsafe routes, and lack of service accountability — by providing a digital platform for reporting, rating, and community engagement.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Python, Django 4.2.7, Django REST Framework |
| Database | PostgreSQL 18 |
| AI Chatbot | Groq API (Llama 3.3 70B) |
| Version Control | Git, GitHub |

---

## Features

### Passenger Features
- ✅ Register and login with secure password hashing (PBKDF2)
- ✅ Smart fare calculator — select From/To location, system shows official BRTA fare (Tk 2.42/km)
- ✅ Detect and report fare overcharges with bus details
- ✅ Submit service ratings (1–5 stars) with comments
- ✅ Report safety issues and unsafe locations with image attachments
- ✅ Community engagement — agree/disagree and comment on safety reports
- ✅ View personal activity (ratings given, reports submitted)
- ✅ Update profile information

### Admin Features
- ✅ Admin-only dashboard (role-based access control)
- ✅ View all overcharge and safety reports
- ✅ Update report status (Pending → Reviewed → Resolved)
- ✅ Filter reports by route and status
- ✅ Export reports as CSV or PDF
- ✅ Safety heatmap — visual risk level per route
- ✅ Live statistics (total users, ratings, reports, average rating)

### AI Assistant
- ✅ Built-in AI chatbot powered by Groq (Llama 3.3 70B)
- ✅ Answers questions about fares, routes, safety tips
- ✅ Supports both English and Bengali

---

## Project Structure

```
transit-trust/
├── apps/
│   ├── accounts/          # User authentication & AI chat
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── chat_views.py  # Groq AI chatbot endpoint
│   │   └── chat_urls.py
│   ├── routes/            # Routes, buses & fare data
│   ├── ratings/           # Service ratings
│   ├── reports/           # Overcharge reports
│   └── safety/            # Safety reports, votes & comments
├── transit_trust/         # Django settings & main URLs
├── frontend/              # React + Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── MainApp.jsx
│       ├── components/
│       │   ├── FarePage.jsx
│       │   ├── RatingPage.jsx
│       │   ├── SafetyPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── ProfilePage.jsx
│       │   └── Chatbot.jsx
│       └── api/
│           └── index.js
├── manage.py
├── requirements.txt
├── .env                   # API keys (not committed to GitHub)
└── .gitignore
```

---

## Team

| Name | Role | Responsibility |
|---|---|---|
| Md Asif Ul Alam Zetu | Frontend Developer | React UI, components, API integration |
| Towsif | Backend Developer | Django REST API, views, serializers, URLs |
| Fariha | Database Developer | Models, migrations, seed data |

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 18
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/zetuasif24/transit-trust.git
cd transit-trust
```

### 2. Backend Setup

**Install Python packages:**
```bash
pip install -r requirements.txt
pip install python-dotenv
```

**Create `.env` file in the root folder:**
```
GROQ_API_KEY=your_groq_api_key_here
```

**Create PostgreSQL database:**
- Open pgAdmin 4
- Create a new database named `transit_trust`

**Set your PostgreSQL password in `transit_trust/settings.py`:**
```python
'PASSWORD': 'your_postgresql_password',
```

**Run migrations:**
```bash
python manage.py makemigrations accounts ratings reports routes safety
python manage.py migrate
```

**Seed the database:**
```bash
python manage.py seed
```

**Start Django server:**
```bash
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Open in Browser
```
http://localhost:5173
```

---

## Demo Accounts

| Role | Phone | Password |
|---|---|---|
| Passenger | 01711000001 | demo123 |
| Admin | 01711000002 | admin123 |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login |
| GET | `/api/auth/stats/` | Dashboard statistics |
| GET | `/api/routes/` | List all routes |
| GET | `/api/routes/locations/` | All unique locations |
| GET | `/api/routes/find/` | Find route by from/to |
| POST | `/api/ratings/submit/` | Submit service rating |
| POST | `/api/reports/submit/` | Submit overcharge report |
| GET | `/api/reports/export/` | Export reports as CSV |
| POST | `/api/safety/submit/` | Submit safety report |
| POST | `/api/safety/<id>/vote/` | Vote on safety report |
| POST | `/api/safety/<id>/comment/` | Comment on safety report |
| POST | `/api/chat/` | AI chatbot |

---

## Environment Variables

Create a `.env` file in the root directory:

```
GROQ_API_KEY=your_groq_api_key_here
```

Get a free Groq API key at: https://console.groq.com

> ⚠️ Never commit your `.env` file to GitHub. It is already added to `.gitignore`.

---

## License

This project was developed as an academic capstone project at Daffodil International University. All rights reserved by the development team.
