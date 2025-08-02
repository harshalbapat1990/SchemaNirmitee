import React, { useState } from 'react'
import '../styles/main.css'

export default function LayoutContainer({ leftPane, rightPane }) {
  const [divider, setDivider] = useState(30) // percent

  function handleDrag(e) {
    document.body.style.cursor = 'col-resize'
    const startX = e.clientX
    const startDivider = divider

    function onMove(ev) {
      const delta = ev.clientX - startX
      const newDivider = Math.min(80, Math.max(20, startDivider + delta * 100 / window.innerWidth))
      setDivider(newDivider)
    }
    function onUp() {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div style={{ display: 'flex', height: '100%', width: '100vw', overflow: 'hidden' }}>
      <div style={{ width: `${divider}%`, minWidth: 0, height: '100%', overflow: 'auto' }}>
        {leftPane}
      </div>
      <div
        style={{
          width: '6px',
          cursor: 'col-resize',
          background: 'var(--border-color)',
          zIndex: 1,
          height: '100vh'
        }}
        onMouseDown={handleDrag}
      />
      <div style={{ width: `${100 - divider}%`, minWidth: 0, height: '100%', overflow: 'auto' }}>
        {rightPane}
      </div>
    </div>
  )
}