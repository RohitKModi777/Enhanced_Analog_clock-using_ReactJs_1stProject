// App.js
import React from 'react'
import Clock from './Clock'
import './index.css'

export default function App(){
  return (
    <div className="app-root">
      <header>
        <h1>React Analog Clock</h1>
        <p style={{fontWeight:"bold",color:"white",fontSize:"18px"}}>Real-time analog clock with alarm feature. Set custom time or use system time.</p>
      </header>
      <main>
        <Clock />
      </main>
      <footer>
        <h1 style={{color:"white", fontWeight:"bolder",zIndex:"15"}}>Build Clock with 🧠 Responsive & smooth</h1>
      </footer>
    </div>
  )
}