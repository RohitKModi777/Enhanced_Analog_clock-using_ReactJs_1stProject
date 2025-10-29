import React from 'react'
import Clock from './Clock'

export default function App(){
  return (
    <div className="app-root">
      <header>
        <h1>React Analog Clock</h1>
        <p style={{fontWeight:"bold",color:"white",fontSize:"18PX"}}>Real-time analog clock. Set a custom time or use system time.</p>
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
