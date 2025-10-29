import React, { useEffect, useRef, useState } from 'react'

function pad(n){
  return n.toString().padStart(2,'0')
}

export default function Clock(){
  const hourRef = useRef(null)
  const minuteRef = useRef(null)
  const secondRef = useRef(null)

  const [isCustom, setIsCustom] = useState(false)
  const baseRealRef = useRef(performance.now())
  const baseTimeRef = useRef(new Date())

  const [inputH, setInputH] = useState('')
  const [inputM, setInputM] = useState('')
  const [inputS, setInputS] = useState('')

  useEffect(()=>{
    let rafId
    function tick(now){
      const realNow = performance.now()
      let current
      if(isCustom){
        const elapsed = realNow - baseRealRef.current
        current = new Date(baseTimeRef.current.getTime() + elapsed)
      } else {
        current = new Date()
      }

      const hours = current.getHours()
      const minutes = current.getMinutes()
      const seconds = current.getSeconds()
      const ms = current.getMilliseconds()

      const secondAngle = (seconds + ms/1000) * 6
      const minuteAngle = (minutes + seconds/60 + ms/60000) * 6
      const hourAngle = ((hours % 12) + minutes/60 + seconds/3600) * 30

      if(secondRef.current) secondRef.current.style.transform = `rotate(${secondAngle}deg)`
      if(minuteRef.current) minuteRef.current.style.transform = `rotate(${minuteAngle}deg)`
      if(hourRef.current) hourRef.current.style.transform = `rotate(${hourAngle}deg)`

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return ()=> cancelAnimationFrame(rafId)
  },[isCustom])

  function setCustomTime(){
    // validate
    const h = Math.max(0, Math.min(23, parseInt(inputH || '0',10)))
    const m = Math.max(0, Math.min(59, parseInt(inputM || '0',10)))
    const s = Math.max(0, Math.min(59, parseInt(inputS || '0',10)))

    const now = new Date()
    const newBase = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s, 0)
    baseTimeRef.current = newBase
    baseRealRef.current = performance.now()
    setIsCustom(true)
  }

  function useSystemTime(){
    setIsCustom(false)
    baseTimeRef.current = new Date()
    baseRealRef.current = performance.now()
  }

  // For display
  const displayTime = (()=>{
    if(isCustom){
      const elapsed = performance.now() - baseRealRef.current
      const t = new Date(baseTimeRef.current.getTime() + elapsed)
      return `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`
    }
    const t = new Date()
    return `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`
  })()

  return (
    <div className="clock-container" role="region" aria-label="Analog clock and time controls">
      <div className="clock-card">
        <div className="clock-face" role="img" aria-label={`Analog clock showing ${displayTime}`}>
          <div className="numbers" aria-hidden="true">
            {Array.from({length:12}).map((_,idx)=>{
              const n = idx+1
              // place 12 at top, 3 at right, 6 at bottom, 9 at left
              const angle = (n % 12) * 30 // 0 -> top when used with current transforms
              const style = {
                transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(calc(-1 * var(--r))) rotate(${ -angle }deg)`
              }
              return (
                <div key={n} className={`num`} style={style}>{n}</div>
              )
            })}
          </div>

          <div className="hand hour" ref={hourRef} aria-hidden="true" />
          <div className="hand minute" ref={minuteRef} aria-hidden="true" />
          <div className="hand second" ref={secondRef} aria-hidden="true" />
          <div className="center-dot" aria-hidden="true" />
        </div>

        <div className="controls">
          <div className="display" aria-live="polite">Current: <strong>{displayTime}</strong></div>
          <div className="inputs">
            <label>
              Hours
              <input aria-label="Hours to set" type="number" min="0" max="23" value={inputH} onChange={e=>setInputH(e.target.value)} placeholder="HH" />
            </label>
            <label>
              Minutes
              <input aria-label="Minutes to set" type="number" min="0" max="59" value={inputM} onChange={e=>setInputM(e.target.value)} placeholder="MM" />
            </label>
            <label>
              Seconds
              <input aria-label="Seconds to set" type="number" min="0" max="59" value={inputS} onChange={e=>setInputS(e.target.value)} placeholder="SS" />
            </label>
          </div>
          <div className="btn-group" role="group" aria-label="Time actions">
            <button type="button" className="btn" onClick={setCustomTime} aria-label="Set custom time">Set Time</button>
            <button type="button" className="btn ghost" onClick={useSystemTime} aria-label="Use system time" disabled={!isCustom}>Use System Time</button>
          </div>
        </div>
      </div>
    </div>
  )
}
