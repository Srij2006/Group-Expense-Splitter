import './App.css'
import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import { getCurrentUser } from './apis/user.api'
import Groups from './pages/Groups'

function App() {
  const [user, setuser] = useState(null)
  const [loading, setloading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const data = await getCurrentUser()
      setuser(data?.user)
      setloading(false)
    }
    getUser();
  }, [])
  
  if(loading){
    return(
      <div className='fixed top-0 left-0 w-full z-[9999]'>
        <div className='h-1 bg-black animate-pulse w-full'>
        </div>
      </div>
    )
  }

  return (
    <>
      <Routes>
        {/* <Route path='/' element={ user? <Navigate to="/dashboard" replace/> : 
          <Home setuser={setuser}/>
          }/>
        <Route path='/dashboard' element={ user ? <Dashboard user={user} setuser={setuser} /> : <Navigate to="/" replace/> }/> */}
        <Route path='/dashboard' element=<Dashboard/> />
        <Route path='/groups' element=<Groups/> />
      </Routes>
    </>
  )
}

export default App
