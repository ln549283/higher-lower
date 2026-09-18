import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => {
      console.warn('Service worker registration failed:', error)
    })
  })
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const splash = document.getElementById('boot-splash')
    if (!splash) return
    splash.classList.add('is-hidden')
    window.setTimeout(() => splash.remove(), 240)
  })
})
