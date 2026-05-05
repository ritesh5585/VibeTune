# VibeTune

Music Mood AI is a full-stack web application that detects user emotion via facial-expression analysis and plays music tailored to the detected mood.

## Contents
- Overview
- Features
- Tech stack
- Project layout
- Getting started (backend & frontend)
- Environment variables
- API surface
- Contributing

## Features

- Real-time facial-expression detection (MediaPipe integration)
- Mood-driven music playback and recommendations
- User authentication with JWT and secure cookies
- Poster/media uploads using ImageKit
- Redis caching for token blacklisting and performance

## Tech Stack

- Frontend: React + Vite + Sass
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Cache: Redis (ioredis)
- Auth: JWT, bcrypt
- Storage: ImageKit

## Project layout (high level)

frontend/
- React app built with Vite. Key entry: `src/main.jsx` and `src/App.jsx`.

backend/
- Express server entry: `server.js` (loads `src/app.js`).
- API routes live under `backend/src/routes` (notably `/api/auth` and `/api/songs`).

Full workspace: see top-level folders `frontend/` and `backend/`.

## Getting started

Prerequisites
- Node.js (v16+ recommended, v18+ preferred)
- MongoDB instance (local or cloud)
- Redis (optional but required for token blacklisting)

Backend (server)
1. Open a terminal and install dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` file in `backend/` with (at minimum) the variables listed in the Environment section below.

3. Start the server:

Windows (cmd/powershell):

```powershell
set PORT=4000
set MONGO_URI=<your-mongo-uri>
set JWT_SECRET=<your-secret>
node server.js
```

Or simply (if environment variables are set in your shell):

```bash
node server.js
```

The server listens on `process.env.PORT` and mounts the API under `/api`.

Frontend (client)
1. Install dependencies and start the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```

2. By default Vite serves at `http://localhost:5173` (or another port if 5173 is in use). Ensure the backend `frontend_url` env value matches the URL shown by Vite for CORS to work.

## Environment variables (backend)

The backend reads configuration from environment variables. Set these in `backend/.env` or your shell.

- `PORT` — port to run the Express server (e.g., `4000`).
- `MONGO_URI` — MongoDB connection string.
- `JWT_SECRET` — secret used to sign JWT tokens.
- `frontend_url` — front-end origin used by CORS (e.g., `http://localhost:5173`).
- `REDIS_HOST` — Redis host (if using Redis).
- `REDIS_PORT` — Redis port.
- `REDIS_PASSWORD` — Redis password (if required).
- `IMAGEKIT_PRIVATE_KEY` — ImageKit private key used by the upload service.

Optional / helpful:
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_URL_ENDPOINT` — if you use ImageKit public endpoints in the frontend.

## Important API endpoints

- Authentication: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/getme`, `POST /api/auth/logout` (cookies used for session token)
- Songs: endpoints under `/api/songs` (see `backend/src/routes/song.routes.js` for details)

Notes
- The backend sets a secure, HTTP-only cookie named `token` after login/registration. The app uses Redis to blacklist tokens on logout.
- File uploads use `multer` and `ImageKit` for storage (see `backend/src/services/storage.service.js`).

## Contributing

- Follow existing code patterns in `frontend/src/features` and `backend/src`.
- Open issues for bugs or feature requests.

## License

This repository does not include a license file; add one if you plan to open-source or share the project publicly.
