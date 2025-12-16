# Secure File Sharing Application

A full-stack secure file sharing application built with React, Express, and MongoDB.

## Tech Stack

**Frontend:** React, React Router, Axios, Tailwind CSS, Vite

**Backend:** Node.js, Express, MongoDB, JWT, Multer, Bcrypt

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## Running the App Locally

### 1. Clone and Install

```bash
git clone <your-repository-url>
cd secure-file-sharing-app

# Install dependencies
cd client && npm install
cd ../server && npm install
```

### 2. Environment Variables

Create `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/file-sharing-app
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

### 3. Run the Application

**Development Mode:**

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Visit `http://localhost:3000`

**Production Mode:**

```bash
cd client && npm run build
cd ../server && npm start
```

Visit `http://localhost:5000`
