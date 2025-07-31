import React, { createContext, useState, useEffect } from 'react'

export const DiagramContext = createContext()

export function DiagramProvider({ children }) {
  const [diagramCode, setDiagramCode] = useState(() => {
    return localStorage.getItem('diagramCode') || ''
  })

  useEffect(() => {
    localStorage.setItem('diagramCode', diagramCode)
  }, [diagramCode])

  return (
    <DiagramContext.Provider value={{ diagramCode, setDiagramCode }}>
      {children}
    </DiagramContext.Provider>
  )
}