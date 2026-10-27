# Recipe Book — MERN Stack

A responsive CRUD Recipe Book using React + Vite, Node.js, Express, Mongoose, and MongoDB Atlas.

## Requirements
- Node.js LTS installed
- MongoDB Atlas account and a database connection string

## 1. Configure the backend
Open a terminal in the `backend` folder:

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your MongoDB Atlas connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/recipebook?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
```

Replace the username, password, and cluster address with the values from your own MongoDB Atlas account. Do not upload the real `.env` file to GitHub.

Start the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

## 2. Start the frontend
Open a second terminal in the `frontend` folder:

```bash
npm install
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`.

## 3. MongoDB Atlas setup
1. Sign in to MongoDB Atlas and create a free cluster.
2. Under Database Access, create a database user and password.
3. Under Network Access, allow your current IP address for local testing.
4. Choose Connect → Drivers and copy the Node.js connection string.
5. Put that string in `backend/.env`, replacing the placeholders.
6. The app creates the `recipes` collection when the first recipe is saved.

For temporary classroom testing only, Atlas may offer `0.0.0.0/0` network access. This allows connections from any IP, so use a strong database password and restrict access again when possible.

## API endpoints
- `GET /api/health` — backend status
- `GET /api/recipes` — list recipes
- `GET /api/recipes/:id` — one recipe
- `POST /api/recipes` — create recipe
- `PUT /api/recipes/:id` — update recipe
- `DELETE /api/recipes/:id` — delete recipe

## Deploying on Render
Deploy the backend and frontend as separate Web Services/Static Site:
- Backend Root Directory: `backend`
- Backend Build Command: `npm install`
- Backend Start Command: `npm start`
- Backend environment variables: `MONGODB_URI`, `CLIENT_ORIGIN` (your deployed frontend URL), and optionally `NODE_ENV=production`
- Frontend Root Directory: `frontend`
- Frontend Build Command: `npm install && npm run build`
- Frontend Publish Directory: `dist`
- Frontend environment variable: `VITE_API_URL=https://YOUR-BACKEND-SERVICE.onrender.com/api`

After deploying, update the backend `CLIENT_ORIGIN` to the frontend URL. Redeploy both if needed.

## Security note
`.env` is intentionally not included. `.env.example` is safe to commit; never commit database passwords or secrets.
