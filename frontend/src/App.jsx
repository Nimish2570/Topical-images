import React from 'react'
import { BrowserRouter,Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Register from './pages/register'
import ProtectedRoutes from './components/ProtectedRoutes'


function logOut(){
  localStorage.removeItem('token')
  return Navigate('/login')
}

function registerAndLogOut(){
  localStorage.clear()
  return <Register/>
}

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    
    
  )
}

export default App
