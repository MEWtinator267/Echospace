import React from 'react'
import { Outlet } from 'react-router-dom'
import HeaderLoggedIn from '../components/HeaderLoggedIn'
import Footer from '../components/Footer'

function HF2() {
  return (
    <div>
        <HeaderLoggedIn/>
        <Outlet/>
        <Footer/>
    </div>
  )
}

export default HF2