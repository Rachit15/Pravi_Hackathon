Grievance Redressal System - Task Checklist
Phase 1: Project Setup & Docker
 Create root project structure (frontend/, backend/, worker/)
 Create docker-compose.yml with all 6 services
 Create Dockerfiles for frontend, backend, worker

Phase 2: Backend - Core Setup
 Initialize Node.js project with dependencies
 Setup Express app with middleware (CORS, rate limiting, error handling)
 Connect to MongoDB via Mongoose
 Connect to Redis
 Setup JWT auth middleware
 Setup role-based authorization middleware

Phase 3: Backend - Database Models
 User model
 Grievance model (with ticket ID generation)
 Notification model
 Update model
 Department model
 AuditLog model

Phase 4: Backend - Services & Controllers
 Auth service (register, login)
 Grievance service (CRUD, status workflow)
 Notification service
 AI Classification service (Ollama integration)
 Analytics service
 All route controllers

Phase 5: Backend - Queue System
 BullMQ queue setup (notification queue, AI classification queue)
 Worker service for processing jobs

Phase 6: Backend - Caching
 Redis cache for dashboard stats
 Redis cache for department list (TTL: 5 min)

Phase 7: Frontend - Next.js Setup
 Initialize Next.js 14 project
 Configure TailwindCSS + Shadcn UI
 Setup Axios with auth interceptors
 Setup authentication context/state

Phase 8: Frontend - Pages & Components
 Login page
 Register page
 Citizen dashboard (submit, my grievances, track, notifications)
 Officer dashboard (assigned, update status, resolutions)
 Admin dashboard (analytics, departments, all grievances)
 Sidebar layout component
 Notification bell component
 Analytics charts (Recharts)
 
Phase 9: Verification
 Verify docker-compose.yml is correct
 Verify all environment variables are set
 Verify all API routes work end-to-end
 Verify frontend connects to backend
