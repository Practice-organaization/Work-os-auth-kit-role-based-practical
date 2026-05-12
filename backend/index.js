// What this backend does — explained simply:

// requireRole function — this is your security guard. You put it on any route and tell it which roles are allowed. If the user's role is not in the allowed list, they get blocked with a 403 error. They never get the data.
// /auth/login — gives the WorkOS login URL to the frontend
// /auth/callback — after login, gets user info and their role from WorkOS metadata
// /users — only admin can call this. Returns all users from WorkOS
// /users/:id/role — only admin can call this. Updates a user's role in WorkOS
// /vehicles — admin and fleet manager see all, technician sees only their own
// /workorders — technician is completely blocked from this endpoint

const express = require('express')
const cors = require('cors')
const { WorkOS } = require('@workos-inc/node')
require('dotenv').config()

const app = express()
const workos = new WorkOS(process.env.WORKOS_API_KEY)

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

// This middleware runs on every protected route
// It reads the role from the request header and blocks if not allowed
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.headers['x-user-role']
    if (!role) return res.status(401).json({ error: 'No role provided' })
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'You do not have permission' })
    }
    next()
  }
}

// Step 1 - Frontend calls this to get the WorkOS login URL
app.get('/auth/login', (req, res) => {
  const authUrl = workos.userManagement.getAuthorizationUrl({
    clientId: process.env.WORKOS_CLIENT_ID,
    redirectUri: 'http://localhost:3000/callback',
    provider: 'authkit',
  })
  res.json({ url: authUrl })
})

// Step 2 - After WorkOS login, frontend sends the code here
// We exchange it for user info and get their role from WorkOS
app.post('/auth/callback', async (req, res) => {
  const { code } = req.body
  try {
    const { user, accessToken } = await workos.userManagement.authenticateWithCode({
      clientId: process.env.WORKOS_CLIENT_ID,
      code,
    })

    // Get the user's role from WorkOS
    const workosUser = await workos.userManagement.getUser(user.id)
    
    // Get organization memberships to find role
    const memberships = await workos.userManagement.listOrganizationMemberships({
      userId: user.id
    })

    // For now we store role in user metadata
    // We will use a simple approach - check WorkOS roles
    let role = 'technician' // default role

    if (workosUser.metadata && workosUser.metadata.role) {
      role = workosUser.metadata.role
    }

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }, 
      accessToken, 
      role 
    })
  } catch (error) {
    console.log(error)
    res.status(401).json({ error: 'Authentication failed' })
  }
})

// Get all users - only admin can do this
app.get('/users', requireRole('admin'), async (req, res) => {
  try {
    const { data } = await workos.userManagement.listUsers()
    const users = data.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.metadata?.role || 'technician'
    }))
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Update a user's role - only admin can do this
app.patch('/users/:id/role', requireRole('admin'), async (req, res) => {
  const { id } = req.params
  const { role } = req.body
  try {
    await workos.userManagement.updateUser({
      userId: id,
      metadata: { role }
    })
    res.json({ success: true, message: 'Role updated' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' })
  }
})

// Get vehicles - admin and fleet_manager see all, technician sees limited
app.get('/vehicles', (req, res) => {
  const role = req.headers['x-user-role']
  const email = req.headers['x-user-email']

  const allVehicles = [
    { id: 1, reg: 'CAA-1234', type: 'Truck', status: 'Available', assignedTo: 'navodaoshini@gmail.com' },
    { id: 2, reg: 'CAB-5678', type: 'Van', status: 'Under Maintenance', assignedTo: 'other@gmail.com' },
    { id: 3, reg: 'CAC-9012', type: 'Car', status: 'Available', assignedTo: 'other@gmail.com' }
  ]

  if (role === 'admin' || role === 'fleet_manager') {
    res.json(allVehicles)
  } else {
    // Technician only sees their assigned vehicle
    res.json(allVehicles.filter(v => v.assignedTo === email))
  }
})

// Work orders - technician cannot see this at all
app.get('/workorders', requireRole('admin', 'fleet_manager'), (req, res) => {
  res.json([
    { id: 1, vehicle: 'CAA-1234', issue: 'Engine check', status: 'Open' },
    { id: 2, vehicle: 'CAB-5678', issue: 'Brake replacement', status: 'In Progress' }
  ])
})

app.listen(process.env.PORT, () => {
  console.log('Backend running on port 4000')
})