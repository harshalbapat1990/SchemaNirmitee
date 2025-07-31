import React, { createContext, useState, useEffect } from 'react'

export const EditorContext = createContext()

export function EditorProvider({ children }) {
  const [dbml, setDbml] = useState(() => {
    return localStorage.getItem('dbmlContent') || ''
  })

  useEffect(() => {
    localStorage.setItem('dbmlContent', dbml)
  }, [dbml])

  return (
    <EditorContext.Provider value={{ dbml, setDbml }}>
      {children}
    </EditorContext.Provider>
  )
}