//admin manages users and changes roles

// What this page does:
// Admin sees all users in a table. Each user has a dropdown to change their role. When admin selects a new role from the dropdown, it calls the backend which updates the role in WorkOS. Next time that user logs in they have the new role.


import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'

export default function AdminUsers() {
  const { api } = useAuth()
  const [users, setUsers] = useState([])
  const [message, setMessage] = useState(null)

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data))
  }, [])

  const changeRole = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole })
      setMessage('Role updated successfully')
      // Refresh user list
      const res = await api.get('/users')
      setUsers(res.data)
    } catch {
      setMessage('Failed to update role')
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: 32 }}>
        <h2>Manage Users</h2>

        {message && (
          <div style={{ 
            padding: 12, 
            marginBottom: 16, 
            backgroundColor: '#dcfce7', 
            borderRadius: 8,
            color: '#166534'
          }}>
            {message}
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Current Role</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: 12 }}>{u.email}</td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 12,
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  <select 
                    defaultValue={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: 4 }}
                  >
                    <option value="admin">Admin</option>
                    <option value="fleet_manager">Fleet Manager</option>
                    <option value="technician">Technician</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}