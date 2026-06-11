# Accessibility Analyzer

A single-page Accessibility Analyzer frontend with a Node.js + Express + MongoDB backend for user accounts, saved analyses, and stats.

## Project Structure

```
quizapp/
├── index.html          # Frontend (single file)
├── README.md
└── server/
    ├── server.js
    ├── .env
    ├── package.json
    ├── models/
    │   ├── User.js
    │   └── Analysis.js
    ├── routes/
    │   ├── auth.js
    │   └── analyses.js
    └── middleware/
        └── auth.js
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string

## Backend Setup

1. Open a terminal in the `server` folder:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Update `server/.env`:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/a11y-analyzer
   JWT_SECRET=your-long-random-secret-key
   PORT=5000
   ```

4. Start MongoDB locally, or replace `MONGO_URI` with your Atlas connection string.

5. Start the API server:

   ```bash
   npm start
   ```

   The API runs at `http://localhost:5000`.

6. Verify the server:

   ```bash
   curl http://localhost:5000/api/health
   ```

## Frontend Setup

1. Open `index.html` with Live Server, or serve the project root with any static file server.
2. Make sure the backend is running on port `5000`.
3. Register or log in from the auth screen.
4. Use the analyzer as before — analyses, history, and stats are now saved to your account.

## API Endpoints

### Auth

- `POST /api/auth/register` — create account
- `POST /api/auth/login` — log in
- `GET /api/auth/me` — get current user (JWT required)
- `POST /api/auth/forgot-password` — request password reset
- `POST /api/auth/change-password` — change password (JWT required)

### Analyses

- `POST /api/analyses` — save an analysis (JWT required)
- `GET /api/analyses` — get last 10 analyses (JWT required)
- `GET /api/analyses/stats` — get user stats (JWT required)
- `PATCH /api/analyses/latest/suggestions` — update latest suggestions (JWT required)
- `DELETE /api/analyses` — clear history (JWT required)

## Notes

- JWT tokens are stored in `localStorage` under the key `token`.
- Theme, mood, and motion preferences still use their existing local storage keys.
- If the backend is unavailable, the login screen will show a friendly connection error.
