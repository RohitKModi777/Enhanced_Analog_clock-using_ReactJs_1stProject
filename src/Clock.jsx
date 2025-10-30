// Clock.jsx
import React, { useEffect, useRef, useState } from 'react';
import alarmSound from '../assets/funny-alarm.mp3';

function pad(n){
  return n.toString().padStart(2,'0')
}

export default function Clock(){
  const hourRef = useRef(null)
  const minuteRef = useRef(null)
  const secondRef = useRef(null)
  const alarmSoundRef = useRef(null)

  const [isCustom, setIsCustom] = useState(false)
  const baseRealRef = useRef(performance.now())
  const baseTimeRef = useRef(new Date())

  const [inputH, setInputH] = useState('')
  const [inputM, setInputM] = useState('')
  const [inputS, setInputS] = useState('')

  // Alarm states
  const [alarmTime, setAlarmTime] = useState('')
  const [isAlarmActive, setIsAlarmActive] = useState(false)
  const [isAlarmRinging, setIsAlarmRinging] = useState(false)
  const [alarmSnoozed, setAlarmSnoozed] = useState(false)

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

      // Check alarm - FIXED: Compare hours and minutes separately
      if (isAlarmActive && !isAlarmRinging && !alarmSnoozed) {
        const currentHours = pad(hours);
        const currentMinutes = pad(minutes);
        const [alarmHours, alarmMinutes] = alarmTime.split(':');
        
        if (currentHours === alarmHours && currentMinutes === alarmMinutes) {
          triggerAlarm();
        }
      }

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return ()=> cancelAnimationFrame(rafId)
  },[isCustom, isAlarmActive, isAlarmRinging, alarmTime, alarmSnoozed])

  function setCustomTime(){
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

  const triggerAlarm = () => {
    setIsAlarmRinging(true);
    if (alarmSoundRef.current) {
      // Reset audio and play
      alarmSoundRef.current.currentTime = 0;
      alarmSoundRef.current.play().catch(e => {
        console.log('Audio play failed:', e);
        // Fallback: Try creating new audio context if HTML5 audio fails
        playFallbackSound();
      });
    }
  }

  // Fallback sound using Web Audio API
  const playFallbackSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Repeat every 500ms
      const interval = setInterval(() => {
        if (!isAlarmRinging) {
          clearInterval(interval);
          return;
        }
        
        const newOscillator = audioContext.createOscillator();
        const newGainNode = audioContext.createGain();
        
        newOscillator.connect(newGainNode);
        newGainNode.connect(audioContext.destination);
        
        newOscillator.frequency.value = 800;
        newOscillator.type = 'sine';
        
        newGainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        newGainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        newOscillator.start(audioContext.currentTime);
        newOscillator.stop(audioContext.currentTime + 0.5);
      }, 500);
      
      // Cleanup interval when alarm stops
      if (!isAlarmRinging) {
        clearInterval(interval);
      }
    } catch (error) {
      console.log('Web Audio API failed:', error);
    }
  }

  const stopAlarm = () => {
    setIsAlarmRinging(false)
    setIsAlarmActive(false)
    setAlarmSnoozed(false)
    if (alarmSoundRef.current) {
      alarmSoundRef.current.pause()
      alarmSoundRef.current.currentTime = 0
    }
  }

  const snoozeAlarm = () => {
    setIsAlarmRinging(false)
    setAlarmSnoozed(true)
    if (alarmSoundRef.current) {
      alarmSoundRef.current.pause()
      alarmSoundRef.current.currentTime = 0
    }
    
    // Set timeout for 10 minutes
    setTimeout(() => {
      setAlarmSnoozed(false)
      if (isAlarmActive) {
        triggerAlarm()
      }
    }, 10 * 60 * 1000) // 10 minutes
  }

  const setAlarm = () => {
    if (alarmTime) {
      setIsAlarmActive(true)
      setAlarmSnoozed(false)
      // Test sound when setting alarm
      testAlarmSound();
    }
  }

  // Test alarm sound when setting alarm
  const testAlarmSound = () => {
    if (alarmSoundRef.current) {
      alarmSoundRef.current.currentTime = 0;
      alarmSoundRef.current.play().catch(e => {
        console.log('Test sound failed:', e);
      });
      
      // Stop after 1 second
      setTimeout(() => {
        if (alarmSoundRef.current) {
          alarmSoundRef.current.pause();
          alarmSoundRef.current.currentTime = 0;
        }
      }, 1000);
    }
  }

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
      {/* Alarm Sound - CORRECTED: Direct import from assets */}
      <audio 
        ref={alarmSoundRef} 
        loop
        preload="auto"
      >
        <source src={alarmSound} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      {/* Alarm Ringing Modal */}
      {isAlarmRinging && (
        <div className="alarm-modal-overlay">
          <div className="alarm-modal">
            <div className="alarm-icon">⏰</div>
            <h2>Alarm!</h2>
            <p>Wake up! It's {alarmTime}</p>
            <div className="alarm-controls">
              <button className="btn alarm-snooze" onClick={snoozeAlarm}>
                Snooze (10 min)
              </button>
              <button className="btn alarm-dismiss" onClick={stopAlarm}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="clock-card">
        <div className="clock-face" role="img" aria-label={`Analog clock showing ${displayTime}`}>
          <div className="numbers" aria-hidden="true">
            {Array.from({length:12}).map((_,idx)=>{
              const n = idx+1
              const angle = (n % 12) * 30
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
          
          {/* Alarm indicator */}
          {isAlarmActive && (
            <div className="alarm-indicator" title={`Alarm set for ${alarmTime}`}>
              ⏰
            </div>
          )}
        </div>

        <div className="controls">
          <div className="display" aria-live="polite">
            Current: <strong>{displayTime}</strong>
            {isAlarmActive && (
              <div className="alarm-status">
                Alarm: {alarmTime} {alarmSnoozed && "(Snoozed)"}
              </div>
            )}
          </div>
          
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

      {/* Alarm Section - Moved below the clock */}
      <div className="alarm-section-below">
        <div className="alarm-card">
          <h3>Alarm Settings</h3>
          <div className="alarm-controls-below">
            <div className="alarm-inputs-below">
              <label>
                Set Alarm Time
                <input 
                  type="time" 
                  value={alarmTime} 
                  onChange={e => setAlarmTime(e.target.value)}
                  disabled={isAlarmActive}
                />
              </label>
            </div>
            <div className="alarm-buttons-below">
              {!isAlarmActive ? (
                <button 
                  type="button" 
                  className="btn alarm-set" 
                  onClick={setAlarm}
                  disabled={!alarmTime}
                >
                  Set Alarm
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn alarm-cancel" 
                  onClick={stopAlarm}
                >
                  Cancel Alarm
                </button>
              )}
            </div>
            {isAlarmActive && (
              <div className="alarm-info">
                <span className="alarm-active-indicator"></span>
                Alarm set for <strong>{alarmTime}</strong>
                {alarmSnoozed && <span className="snooze-badge">Snoozed</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}