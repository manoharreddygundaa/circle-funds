# Circle Funds — P2P Lending Platform

A production-grade peer-to-peer lending platform built with the MERN stack. Connects borrowers and lenders directly, with real-time risk scoring, EMI calculation, and role-based dashboards.

---

## Demo Credentials

| Role     | Email                | Password  |
|----------|----------------------|-----------|
| Admin    | admin@demo.com       | Demo1234  |
| Borrower | borrower@demo.com    | Demo1234  |
| Lender   | lender@demo.com      | Demo1234  |

Run `npm run seed` to populate these accounts.

---

## Tech Stack

### Frontend
- **React 18** + Vite
- **Tailwind CSS** — utility-first styling
- **React Router DOM v6** — client-side routing
- **Recharts** — charts and analytics
- **Axios** — HTTP client with interceptors
- **Context API** — auth, theme, toast state

### Backend
- **Node.js** + **Express.js**
- **MongoDB Atlas** + **Mongoose ODM**
- **JWT** — stateless authentication
- **bcryptjs** — password hashing
- **Helmet** — secure HTTP headers
- **express-rate-limit** — brute-force protection
- **express-validator** — input validation

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone and install
```bash
git clone https://github.com/your-username/circle-funds.git
cd circle-funds
npm run install:all
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/circle-funds
JWT_SECRET=your_min_32_char_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed demo data
```bash
npm run seed
```

### 4. Start development servers
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

---

## Folder Structure

```
circle-funds/
├── client/                        # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/            # AreaChartWidget, PieChartWidget
│   │   │   ├── loans/             # LoanCard, EMICalculator, RepaymentScheduleTable
│   │   │   ├── shared/            # Navbar, Sidebar, StatCard, EmptyState, ErrorBoundary
│   │   │   └── ui/                # Button, Input, Badge, Loader, Modal
│   │   ├── context/               # AuthContext, ThemeContext, ToastContext
│   │   ├── hooks/                 # useFetch, useLoans
│   │   ├── layouts/               # AuthLayout, DashboardLayout
│   │   ├── pages/
│   │   │   ├── auth/              # Login, Register
│   │   │   ├── borrower/          # Dashboard, ApplyLoan, MyLoans, Repayments
│   │   │   ├── lender/            # Dashboard, BrowseLoans, MyInvestments
│   │   │   ├── admin/             # Dashboard, AdminLoans, AdminUsers
│   │   │   └── Settings, NotFound
│   │   ├── routes/                # AppRouter, PrivateRoute, RoleRoute
│   │   ├── services/              # api.js (Axios), loan.service.js
│   │   └── utils/                 # formatCurrency, calcEMI
│   └── vercel.json
│
└── server/                        # Express backend
    ├── config/                    # MongoDB connection
    ├── controllers/               # Business logic
    ├── middleware/                # auth, role, errorHandler
    ├── models/                    # User, Loan, Repayment, Transaction, Notification
    ├── routes/                    # auth, loans, users, admin, repayments
    ├── scripts/                   # seed.js
    ├── services/                  # emiService, riskScoreService, notificationService
    ├── utils/                     # ApiError, asyncHandler, generateToken
    ├── validators/                # auth.validator, loan.validator
    └── render.yaml
```

---

## API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-app.onrender.com/api`

### Authentication

| Method | Endpoint              | Auth | Description         |
|--------|-----------------------|------|---------------------|
| POST   | /auth/register        | —    | Create account      |
| POST   | /auth/login           | —    | Login, get JWT      |
| GET    | /auth/me              | JWT  | Get current user    |
| PATCH  | /auth/update-profile  | JWT  | Update profile      |
| PATCH  | /auth/change-password | JWT  | Change password     |

### Loans

| Method | Endpoint         | Role     | Description              |
|--------|-----------------|----------|--------------------------|
| GET    | /loans          | All      | List loans (role-filtered)|
| GET    | /loans/:id      | All      | Loan details + repayments|
| POST   | /loans          | Borrower | Apply for loan           |
| POST   | /loans/:id/fund | Lender   | Fund a loan              |

**GET /loans query params:**
- `status` — pending | approved | active | completed | rejected
- `riskLevel` — low | medium | high
- `minAmount`, `maxAmount` — number filters
- `page`, `limit` — pagination (default 1, 10)

### Repayments

| Method | Endpoint                           | Role     | Description           |
|--------|------------------------------------|----------|-----------------------|
| GET    | /repayments/my                     | Borrower | My EMI schedule       |
| POST   | /repayments/:id/pay                | Borrower | Pay an installment    |
| GET    | /repayments/notifications          | All      | User notifications    |
| PATCH  | /repayments/notifications/read-all | All      | Mark all read         |

### Admin

| Method | Endpoint                    | Role  | Description         |
|--------|-----------------------------|-------|---------------------|
| GET    | /admin/stats                | Admin | Platform analytics  |
| GET    | /admin/loans                | Admin | All loans           |
| PATCH  | /admin/loans/:id/status     | Admin | Approve/reject loan |
| GET    | /admin/users                | Admin | All users           |
| PATCH  | /admin/users/:id/block      | Admin | Block/unblock user  |

### Response Format
All responses follow this structure:
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

---

## Key Features

### Risk Scoring Engine
Located at `server/services/riskScore.service.js`. Calculates a 0–100 risk score based on:
- Credit score (300–900)
- Missed payment history
- Loan frequency
- Loan amount vs history
- Account age

### EMI Calculation
Standard reducing-balance method:
```
EMI = P × r × (1+r)^n / ((1+r)^n - 1)
where r = annual_rate / 12 / 100
```

### Role-Based Access
Three roles with separate dashboards:
- **Borrower** — Apply, track, repay
- **Lender** — Browse, fund, track investments
- **Admin** — Approve/reject, manage users, analytics

---

## Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Push to GitHub, connect repo in Vercel
# Set environment variable: VITE_API_URL=https://your-api.onrender.com/api
```

### Backend → Render
1. Push to GitHub
2. Create new Web Service on Render
3. Connect your repository, point to `/server`
4. Set environment variables from `server/.env.example`
5. Build command: `npm install`
6. Start command: `npm start`

### MongoDB Atlas
1. Create free cluster at mongodb.com
2. Add database user
3. Whitelist `0.0.0.0/0` for Render
4. Copy connection string to `MONGO_URI`

---

## Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens with configurable expiry
- Rate limiting — 100 req/15min globally, 20 req/15min on auth routes
- Helmet sets 11 secure HTTP headers
- `select: false` on password field prevents accidental exposure
- Admin role cannot be set via registration endpoint
- Intentionally vague login error messages (prevents user enumeration)

---


