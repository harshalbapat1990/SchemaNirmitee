import React, { useContext, useEffect } from 'react'
import { AppContext } from '../state/appContext.jsx'

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(AppContext)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <button
      style={{
        padding: '8px 16px',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        cursor: 'pointer',
        margin: '8px'
      }}
      onClick={toggleTheme}
      aria-label="Toggle dark/light mode"
    >
      {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  )
}