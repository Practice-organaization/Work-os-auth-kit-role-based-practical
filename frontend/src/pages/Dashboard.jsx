//different UI for each role



import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { role, api } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [workOrders, setWorkOrders] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    // Everyone can try to get vehicles
    api.get('/vehicles')
      .then(res => setVehicles(res.data))
      .catch(() => setVehicles([]))

    // Only admin and fleet manager get work orders
    if (role === 'admin' || role === 'fleet_manager') {
      api.get('/workorders')
        .then(res => setWorkOrders(res.data))
        .catch(() => setWorkOrders([]))
    }
  }, [role])

  const cardStyle = {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    border: '1px solid #e2e8f0'
  }

  const btnStyle = (color) => ({
    padding: '6px 12px',
    marginRight: 8,
    cursor: 'pointer',
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: 4,
    fontSize: 13
  })

  return (
    <div>
      <Navbar />
      <div style={{ padding: 32 }}>

        {/* Role badge */}
        <div style={{ 
          display: 'inline-block',
          padding: '4px 12px', 
          backgroundColor: role === 'admin' ? '#4F46E5' : role === 'fleet_manager' ? '#059669' : '#D97706',
          color: 'white',
          borderRadius: 20,
          marginBottom: 24,
          fontSize: 13
        }}>
          {role}
        </div>

        {/* Admin only section */}
        {role === 'admin' && (
          <div style={{ ...cardStyle, borderLeft: '4px solid #4F46E5' }}>
            <h3>Admin Controls</h3>
            <p>You have full access to everything in the system.</p>
            <button style={btnStyle('#4F46E5')}>Create Vehicle</button>
            <button style={btnStyle('#4F46E5')}>Create User</button>
            <button style={btnStyle('#4F46E5')}>View Reports</button>
          </div>
        )}

        {/* Fleet manager section */}
        {(role === 'admin' || role === 'fleet_manager') && (
          <div style={{ ...cardStyle, borderLeft: '4px solid #059669' }}>
            <h3>Work Orders</h3>
            {workOrders.length === 0 
              ? <p>No work orders</p>
              : workOrders.map(wo => (
                <div key={wo.id} style={{ marginBottom: 8 }}>
                  <span>{wo.vehicle} - {wo.issue} - </span>
                  <span style={{ 
                    color: wo.status === 'Open' ? '#dc2626' : '#059669' 
                  }}>
                    {wo.status}
                  </span>
                  {/* Only admin can approve */}
                  {role === 'admin' && (
                    <button style={{ ...btnStyle('#059669'), marginLeft: 8 }}>
                      Approve
                    </button>
                  )}
                </div>
              ))
            }
          </div>
        )}

        {/* Vehicles - everyone sees this but different data */}
        <div style={{ ...cardStyle, borderLeft: '4px solid #D97706' }}>
          <h3>Vehicles</h3>
          {vehicles.length === 0 
            ? <p>No vehicles assigned to you</p>
            : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={{ padding: 8, textAlign: 'left' }}>Registration</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>Type</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                    {/* Edit and retire buttons only for admin */}
                    {role === 'admin' && (
                      <th style={{ padding: 8, textAlign: 'left' }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(v => (
                    <tr key={v.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={{ padding: 8 }}>{v.reg}</td>
                      <td style={{ padding: 8 }}>{v.type}</td>
                      <td style={{ padding: 8 }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontSize: 12,
                          backgroundColor: v.status === 'Available' ? '#dcfce7' : '#fee2e2',
                          color: v.status === 'Available' ? '#166534' : '#991b1b'
                        }}>
                          {v.status}
                        </span>
                      </td>
                      {role === 'admin' && (
                        <td style={{ padding: 8 }}>
                          <button style={btnStyle('#4F46E5')}>Edit</button>
                          <button style={btnStyle('#dc2626')}>Retire</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        {/* Report fault - only technician and fleet manager see this */}
        {(role === 'technician' || role === 'fleet_manager') && (
          <div style={{ ...cardStyle, borderLeft: '4px solid #dc2626' }}>
            <h3>Report a Fault</h3>
            <button style={btnStyle('#dc2626')}>Report Vehicle Fault</button>
          </div>
        )}

      </div>
    </div>
  )
}