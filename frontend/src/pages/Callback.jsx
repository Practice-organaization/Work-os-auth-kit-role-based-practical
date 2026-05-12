import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function Callback() {
  const navigate = useNavigate()
  const { setUser, setToken, setRole } = useAuth()

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      axios.post('http://localhost:4000/auth/callback', { code })
        .then(res => {
          setUser(res.data.user)
          setToken(res.data.accessToken)
          setRole(res.data.role)
          navigate('/dashboard')
        })
        .catch(() => {
          navigate('/')
        })
    }
  }, [])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
      <p>Logging you in please wait...</p>
    </div>
  )
}