// security guard for pages

// What this does:
// Every protected page wraps itself in this component. You tell it which roles are allowed. If the user's role is not allowed, they see Access Denied instead of the page. This protects entire pages not just buttons.


import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role } = useAuth()

  if (!user) return <Navigate to="/" />
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    )
  }

  return children
}