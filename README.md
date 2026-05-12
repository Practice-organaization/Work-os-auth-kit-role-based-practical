# WorkOS Role Based Access Control - Practical 2

A full stack authentication system with role based access control built with WorkOS, React, and Node.js Express. This project extends basic WorkOS login to demonstrate how different user roles see different content, how pages are protected at the route level, and how an admin can manage and change user roles in real time.

---

## What This Project Does

- Login via WorkOS with Google, Microsoft, GitHub, or Apple
- Three roles with completely different experiences after login
- Admin sees all vehicles, work orders with approve buttons, edit and retire actions, and a user management page
- Fleet Manager sees vehicles and work orders but no admin controls
- Technician sees only their assigned vehicle and nothing else
- Buttons visible only to certain roles
- Pages protected at the route level - wrong role sees Access Denied
- Admin can change any user's role in real time from the UI
- Role is read from WorkOS user metadata after every login

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js with Express |
| Authentication | WorkOS AuthKit |
| Role storage | WorkOS user metadata |
| HTTP requests | Axios with interceptors |
| Routing | React Router DOM |

---

## Project Structure

```
vmms-roles/
  backend/
    index.js        - Express server with auth, role middleware, and API endpoints
    .env            - Environment variables (not committed to git)
    package.json
  frontend/
    src/
      context/
        AuthContext.jsx       - Stores user, token, and role. Contains shared Axios instance
      pages/
        Login.jsx             - Login button page
        Callback.jsx          - Handles WorkOS redirect, saves role
        Dashboard.jsx         - Role based dashboard with different content per role
        AdminUsers.jsx        - Admin only page to view and change user roles
      components/
        Navbar.jsx            - Navigation bar showing different options per role
        ProtectedRoute.jsx    - Security guard component that blocks wrong roles
      App.js                  - Routes with role based protection
    package.json
```

---

## Prerequisites

- Node.js installed on your machine
- A free WorkOS account at workos.com
- A separate WorkOS environment from Practical 1

---

## WorkOS Setup

1. Log into workos.com
2. Click the environment dropdown at the top and create a new environment called `vmms-roles-practical`
3. Go to Authorization then Roles on the left sidebar
4. Create two new roles:
   - Name: Fleet Manager, Slug: `fleet_manager`
   - Name: Technician, Slug: `technician`
5. Go to Redirects and add `http://localhost:3000/callback`
6. Go to API Keys and copy your Secret Key and Client ID for this new environment

> You cannot assign yourself admin before logging in. Your user account does not exist in the new environment until you log in for the first time. Log in first, then come back to WorkOS to assign your role.

---

## How to Run

### 1. Clone the repo

```bash
git clone your-repo-url
cd vmms-roles
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```
WORKOS_API_KEY=your_new_environment_secret_key
WORKOS_CLIENT_ID=your_new_environment_client_id
PORT=4000
```

Start the backend:

```bash
node index.js
```

You should see: `Backend running on port 4000`

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Browser opens automatically at `http://localhost:3000`

---

## Assign Yourself Admin After First Login

1. Log into your app once with any account
2. Go to WorkOS dashboard
3. Click Users on the left sidebar - your account now appears
4. Click on your account
5. Scroll to the Metadata section
6. Add key: `role` and value: `admin`
7. Save it
8. Close the browser tab completely
9. Open a fresh tab at `http://localhost:3000` and log in again
10. You now have admin role and see all admin features

---

## How to See the Output

### As Admin
1. Open `http://localhost:3000` and log in
2. You see a purple Admin badge on the dashboard
3. Navbar shows both Dashboard and Manage Users buttons
4. Dashboard shows Admin Controls section with Create Vehicle, Create User, View Reports buttons
5. Work Orders section shows an Approve button on each order
6. Vehicles table shows Edit and Retire buttons on each row
7. Click Manage Users in the navbar to go to the user management page
8. Change any user's role from the dropdown - takes effect on their next login

### As Fleet Manager
1. Go to WorkOS dashboard, find your user, change metadata role to `fleet_manager`
2. Close browser tab and log in fresh
3. You see a green Fleet Manager badge
4. No Manage Users button in navbar
5. Work Orders visible but no Approve button
6. Vehicles table visible but no Edit or Retire buttons

### As Technician
1. Go to WorkOS dashboard, find your user, change metadata role to `technician`
2. Close browser tab and log in fresh
3. You see an orange Technician badge
4. Only your assigned vehicle appears in the table
5. No work orders section at all
6. Try typing `/users` in the URL - you see Access Denied

---

## How Role Protection Works

### Frontend - hides buttons and UI sections

```jsx
// Only admin sees this button
{role === 'admin' && (
  <button>Edit</button>
)}
```

### Backend - blocks API calls regardless of frontend

```javascript
// Only admin and fleet_manager can reach this endpoint
app.get('/workorders', requireRole('admin', 'fleet_manager'), handler)
```

Both layers work together. The frontend hides the button so the user does not see it. The backend blocks the request so even if someone tries to call the API directly they get a 403 Forbidden error.

---

## API Endpoints

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| GET | /auth/login | Everyone | Returns WorkOS login URL |
| POST | /auth/callback | Everyone | Exchanges code for user, token, and role |
| GET | /vehicles | All logged in | Admin and Fleet Manager see all, Technician sees assigned only |
| GET | /workorders | Admin, Fleet Manager | Returns work orders list |
| GET | /users | Admin only | Returns all users from WorkOS |
| PATCH | /users/:id/role | Admin only | Updates a user's role in WorkOS |

---

## Key Concepts Demonstrated

| Concept | Where to See It |
|---|---|
| Role based UI | Dashboard.jsx - different sections per role |
| Hiding buttons by role | Dashboard.jsx and Navbar.jsx |
| Protecting entire pages | ProtectedRoute.jsx and App.js |
| Backend role middleware | requireRole function in index.js |
| Shared Axios instance | AuthContext.jsx - api object with interceptors |
| Admin changing user roles | AdminUsers.jsx |
