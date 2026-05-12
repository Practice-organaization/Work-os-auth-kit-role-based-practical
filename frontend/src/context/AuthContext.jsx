 //What is new here:
// The api object is an axios instance that automatically adds your token and role to every single request. You never have to manually add headers again. Every page just calls api.get('/vehicles') and the headers are added automatically.

import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)

  const login = async () => {
    const res = await axios.get('http://localhost:4000/auth/login')
    window.location.href = res.data.url
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setRole(null)
    window.location.href = '/'
  }

  // This is the axios instance every page uses
  // It automatically adds the token and role to every request
  const api = axios.create({
    baseURL: 'http://localhost:4000'
  })

  api.interceptors.request.use(config => {
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    if (role) config.headers['x-user-role'] = role
    if (user?.email) config.headers['x-user-email'] = user.email
    return config
  })

  return (
    <AuthContext.Provider value={{ user, token, role, setUser, setToken, setRole, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}