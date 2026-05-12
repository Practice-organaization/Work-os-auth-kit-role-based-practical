// What this does: shows different options based on role
// The Manage Users button only appears if role is admin. Fleet manager and technician never see that button. This is how you hide features in the navbar.

import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#1e293b',
    color: 'white'
  }

  const btnStyle = {
    padding: '6px 12px',
    marginLeft: 8,
    cursor: 'pointer',
    backgroundColor: '#334155',
    color: 'white',
    border: 'none',
    borderRadius: 4
  }

  return (
    <div style={navStyle}>
      <span>VMMS - {role?.toUpperCase()}</span>
      <div>
        <button style={btnStyle} onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>

        {/* Only admin sees the Users button */}
        {role === 'admin' && (
          <button style={btnStyle} onClick={() => navigate('/users')}>
            Manage Users
          </button>
        )}

        <span style={{ marginLeft: 16, fontSize: 14 }}>{user?.email}</span>
        <button 
          style={{ ...btnStyle, backgroundColor: '#dc2626' }} 
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  )
}