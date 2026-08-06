# Alumni Network Portal

A comprehensive web application designed to connect alumni and students, facilitating networking, peer mentorship, job referrals, and group interactions. Built using the MERN stack with rich, polished UI aesthetics.

---

## Features

- **User Authentication**: Secure authentication via traditional credentials (email/password) or Google OAuth.
- **Dynamic Profile Management**: Custom profiles with sections for Work Experience, Achievements & Recognitions, and personal details.
- **Connections & Networking**: Peer-to-peer connection request system matching alumni and students.
- **Admin Dashboard**: Comprehensive dashboard for administrators to manage users, verify achievements, moderate job listings, review gallery content, and respond to contact submissions.
- **Interactive Group & Direct Chat**: Real-time communication powered by Socket.io, featuring persistent chat rooms, group membership verification, and search functionality.
- **Resource Panels**: Job Opportunities referral board and Events notification feed.
- **Leaderboard**: Gamified point tracking dashboard showing student activity scoreboards.

---

## Tech Stack

- **Frontend**: React (v18), Vite, TailwindCSS, Axios, React-Router-DOM, Framer Motion, Socket.io-client.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, Cloudinary (Media storage), Multer.

---

## Installation & Local Development

### Prerequisites
- Node.js (v16 or higher)
- MongoDB instance (local or Atlas)
- Cloudinary credentials

### Step-by-Step Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/varshini47/Alumni-back.git
   cd Alumni
   ```

2. **Configure Backend Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/alumni_network
   JWT_SECRET=your_jwt_secret_token
   FRONTEND_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ADMIN_EMAIL=admin@nitkkr.ac.in
   ADMIN_PASSWORD=Admin@123
   ```

3. **Configure Frontend Environment Variables**:
   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5001
   ```

4. **Install Dependencies**:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

5. **Seed the Administrator Account (Optional)**:
   ```bash
   cd ../backend
   node scripts/seedAdmin.js
   ```

6. **Start Dev Servers**:
   * Run the Backend API Server:
     ```bash
     cd backend
     npm run dev
     ```
   * Run the Frontend Development Server:
     ```bash
     cd frontend
     npm run dev
     ```

---

## Production Deployment

### Frontend (Vercel, Netlify)
- Set build command to `npm run build`.
- Set output directory to `dist`.
- Set the environment variable `VITE_API_URL` pointing to the live backend server.

### Backend (Render, Railway, Heroku)
- Set start script to `npm start`.
- Configure all environment variables (`MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
