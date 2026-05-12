import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh' 
    }}>
      <h1>VMMS Fleet System</h1>
      <p>Vehicle Maintenance Management System</p>
      <button 
        onClick={login} 
        style={{ 
          padding: '12px 24px', 
          fontSize: 16, 
          cursor: 'pointer',
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: 8
        }}
      >
        Log in with WorkOS
      </button>
    </div>
  )
}