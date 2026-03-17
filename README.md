# Grievance Redressal System 🏛️

A full-stack Grievance Redressal System with AI-powered classification, real-time notifications, and role-based access control.

## 🚀 Quick Start

```bash
# Clone/navigate to the project directory
cd Pravi_Hackathon

# Start all services
docker-compose up --build

# In a separate terminal, seed the database (wait ~30s for all services to start)
docker exec grievance-backend node src/scripts/seed.js
```

Access the app at: **http://localhost:3000**

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@demo.com | password123 |
| Officer | officer@demo.com | password123 |
| Admin | admin@demo.com | password123 |

## 🧪 How to Test the Workflow

> **Note:** For now, this testing workflow is designed to work with the **Demo Credentials** listed above due to the current database seeding limitations. Creating custom testing accounts and expecting all queues to perfectly align may require additional manual database linkage for the duration of this demo.

Follow these steps to experience the complete Grievance Redressal lifecycle:

1. **Submit a Grievance (Citizen)**
   - Log in as the Citizen (`citizen@demo.com`).
   - Go to "New Grievance".
   - **To test the AI Classification**, use specific keywords in your title or description. 
     - *Example 1:* "There is a huge water leak flooding the street" → *Auto-assigns to **Water** Dept, **High** Priority*.
     - *Example 2:* "The transformer exploded and there is a fire" → *Auto-assigns to **Electricity** Dept, **Critical** Priority*.
     - *Example 3:* "Need a new dustbin" → *Auto-assigns to **Sanitation** Dept, **Low** Priority*.

2. **Process the Grievance (Officer)**
   - Log out, then log in as the Officer (`officer@demo.com`).
   - Navigate to **"Assigned Grievances"**. You will see the grievances assigned to your department (The demo officer is in the `General` department, so grievances without specific keywords will appear here).
   - Click on a grievance, easily update its status (e.g., from *Submitted* to *In Progress*), add an internal comment, and eventually mark it as *Resolved*.

3. **Monitor the System (Admin)**
   - Log out, then log in as the System Admin (`admin@demo.com`).
   - View the **Dashboard Analytics** to see real-time charts updating with the new grievances.
   - Go to **All Grievances** to search, filter, and review every ticket in the system.
   - Go to **Departments** to add or edit departments.

## 🏗️ Architecture

```
Users → Frontend (Next.js :3000) → Backend API (Express :5000)
                                        ↓
                              Redis Cache/Queue (:6379)
                                        ↓
                              MongoDB (:27017) + Worker
                                        ↓
                              Ollama AI (:11434) [llama3]
```

## 🐳 Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | Next.js 14 Dashboard |
| backend | 5000 | Express.js API |
| mongodb | 27017 | MongoDB 7 Database |
| redis | 6379 | Redis 7 Cache & Queue |
| worker | - | BullMQ job processor |
| ollama | 11434 | AI classification (llama3) |

## 📋 Features

### Role-Based Access
- **Citizen**: Submit grievances, track status, view notifications
- **Officer**: Manage assigned grievances, update status, add resolutions
- **Admin**: Full system analytics, department management, all grievances

### AI Classification
- Automatic department and priority assignment using Ollama llama3
- Processed asynchronously via BullMQ queue
- Graceful fallback if Ollama is unavailable

### Ticket System
- Unique ticket IDs: `GRV-YYYY-XXXX`
- Status workflow: `submitted → under_review → in_progress → resolved → closed`

### Caching
- Redis cache for analytics dashboard (5-min TTL)
- Redis cache for department list (5-min TTL)

## 📂 Project Structure

```
Pravi_Hackathon/
├── docker-compose.yml
├── frontend/               # Next.js 14 + Tailwind + Recharts
│   └── src/app/
│       ├── login/
│       ├── register/
│       └── dashboard/
│           ├── submit/
│           ├── my-grievances/
│           ├── grievance/[id]/
│           ├── assigned/
│           ├── all-grievances/
│           ├── analytics/
│           ├── departments/
│           └── notifications/
├── backend/                # Express.js + MongoDB + Redis
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── middleware/
│       ├── queues/
│       └── scripts/seed.js
└── worker/                 # BullMQ job processor
    └── src/worker.js
```

## 🔧 API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/profile | Authenticated |
| POST | /api/grievances | Citizen |
| GET | /api/grievances | Authenticated |
| GET | /api/grievances/:id | Authenticated |
| PUT | /api/grievances/:id/status | Officer, Admin |
| POST | /api/grievances/:id/update | Officer, Admin |
| GET | /api/notifications | Authenticated |
| PUT | /api/notifications/:id/read | Authenticated |
| GET | /api/analytics/dashboard | Admin |
| GET | /api/departments | Public |
| POST | /api/departments | Admin |
| PUT | /api/departments/:id | Admin |

## ⚡ Rate Limiting

100 requests per 15 minutes per IP address.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS, Recharts, Lucide Icons, Axios
- **Backend**: Node.js 20, Express.js, Mongoose, JWT, bcryptjs
- **Database**: MongoDB 7
- **Cache/Queue**: Redis 7, BullMQ
- **AI**: Ollama (llama3)
- **Container**: Docker, Docker Compose
