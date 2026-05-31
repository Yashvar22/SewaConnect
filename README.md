# SewaConnect

SewaConnect is a web platform that connects non-governmental organizations (NGOs), volunteers, and donors in India. It helps verified organizations coordinate volunteer events and receive both monetary and item donations.

## Features

- Role-based accounts for administrators, NGO managers, and volunteers.
- Registration and verification system for NGOs managed by admins.
- Event creation and volunteer application tracking.
- Secure money donations using Razorpay integration.
- Item donation system with support for uploaded images and pickup coordinates.
- Interactive maps to view NGO locations and event venues.
- Email notifications sent for NGO verification, event approvals, and volunteer updates.
- Analytical dashboards showing metrics and trends using Chart.js.

## Tech Stack

- Frontend: React, Vite, React Router, Leaflet Maps, and Chart.js.
- Styling: Custom vanilla CSS.
- Backend: Node.js, Express, and Mongoose (MongoDB).
- File Storage: Cloudinary (for NGO logos and item photos).
- Emails: Nodemailer.
- Payments: Razorpay.

## Setup Instructions

### Prerequisites
Make sure you have Node.js and MongoDB installed on your computer.

### Backend Setup
1. Open the backend directory:
   cd backend
2. Create a .env file based on .env.example and fill in your database, email, Cloudinary, and Razorpay details.
3. Install dependencies:
   npm install
4. Start the server in development mode:
   npm run dev

### Frontend Setup
1. Open the frontend directory:
   cd frontend
2. Create a .env file based on .env.example and configure VITE_API_URL and VITE_RAZORPAY_KEY_ID.
3. Install dependencies:
   npm install
4. Start the Vite development server:
   npm run dev

### Accessing the App
Open http://localhost:5173 in your web browser. The backend server runs on http://localhost:5000.
