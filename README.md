# 🌿 SewaConnect

> Bridging verified NGOs, passionate volunteers, and generous donors to create lasting social impact across India.

![SewaConnect](https://img.shields.io/badge/SewaConnect-v1.0-16a34a?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-MERN-16a34a?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-059669?style=for-the-badge)

---

## 📋 Overview

**SewaConnect** is a full-stack MERN platform designed to bridge the gap between NGOs, volunteers, and donors through a secure, role-based system with specialized dashboards and real-time workflows.

---

## ✨ Features

### 🔑 Authentication & Security
- JWT-based authentication with 7-day tokens
- Role-Based Access Control (RBAC): `admin`, `ngo`, `volunteer`
- Protected routes on both frontend and backend
- Bcrypt password hashing + rate limiting

### 🏢 NGO Management
- NGO registration, profile management & photo uploads (Cloudinary)
- Admin verification/rejection workflow with automated emails
- Public NGO directory with category filters & search

### 📅 Event System
- NGOs can create, manage, and close events
- Volunteers can browse and apply for events
- Application status tracking (pending → approved/rejected)
- Email notifications at every stage (Nodemailer)

### 💝 Donation System
- Monetary (₹) and item-based donations
- Photo support for item donations
- NGO-targeted or platform-wide donations

### 📊 Dashboards & Analytics
- **Admin**: Global stats, user management, NGO verification, Chart.js graphs
- **NGO**: NGO-specific stats, event management, volunteer applications
- **Volunteer**: Contribution history, donation records, application tracking

### 🗺️ Map Integration
- Leaflet + OpenStreetMap for NGO & event location display

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router v7, Axios |
| Styling | Vanilla CSS (custom design system) |
| Backend | Node.js, Express.js 5 |
| Database | MongoDB (Mongoose 9) |
| Auth | JWT + Bcryptjs |
| Storage | Cloudinary (images) |
| Email | Nodemailer (Gmail SMTP) |
| Charts | Chart.js + react-chartjs-2 |
| Maps | Leaflet + react-leaflet |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB URI (Atlas or local)
- Cloudinary account
- Gmail account with App Password

### 1. Clone the repo
```bash
git clone https://github.com/Yashvar22/SewaConnect.git
cd SewaConnect
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev
```

**Backend `.env` variables:**
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
PORT=5000
```

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env   # fill in your values
npm install
npm run dev
```

**Frontend `.env` variables:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Open in browser
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 👤 Demo Roles

| Role | How to get it |
|---|---|
| **Volunteer** | Register normally (default role) |
| **NGO** | Register → select "NGO Representative" |
| **Admin** | Manually set `role: "admin"` in MongoDB |

---

## 📁 Project Structure

```
SewaConnect/
├── backend/
│   ├── config/          # Cloudinary setup
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, upload, error
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── seed/            # Demo data seeders
│   ├── utils/           # Email service
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Navbar, Footer, Charts, Map…
        ├── context/     # AuthContext
        ├── pages/       # All route pages
        ├── services/    # Axios API client
        └── utils/
```

---

## 🌱 Made with 💚 for social good — Made in India 🇮🇳
