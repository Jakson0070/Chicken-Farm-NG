import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import Home from './pages/Home'
import Register from './pages/auth/Register'
import ProductIndex from './pages/products/Index'
import './App.css'

function App() {
 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/market" element={<ProductIndex />} />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
