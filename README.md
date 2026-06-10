# SS Workout Tracker — Frontend

A React frontend for the Starting Strength workout tracker app, deployed on Vercel.

## Tech Stack

- **React 18**
- **Vite**
- **Tailwind CSS 4**
- **React Router 7**
- **Recharts** — progress charts

## Features

- JWT authentication — login with auto logout on token expiry
- Calendar view — browse workouts by date, orange dots on workout days
- Workout logging — log exercises, sets, reps, and weight
- Progress charts — visualize weight progression over time per exercise
- Responsive — works on desktop and mobile

## Local Setup

### Prerequisites
- Node.js
- The backend API running locally

### 1. Clone the repo
```bash
git clone https://github.com/RedBull012/StartingStrengthFrontend.git
cd StartingStrengthFrontend/starting-strength-ui
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a .env file
Create `starting-strength-ui/.env` (this file is gitignored — never commit it):

```env
VITE_API_URL=http://localhost:8080
```

### 4. Run the app
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Deployment

This app is deployed on **Vercel**. Set the following environment variable in the Vercel dashboard:

- `VITE_API_URL` — your Railway backend URL (e.g. `https://ss-workout-tracker-production.up.railway.app`)

After updating environment variables, redeploy for changes to take effect.

## Backend

The Spring Boot backend for this project lives at [StartingStrength](https://github.com/RedBull012/StartingStrength) and is deployed on Railway.
