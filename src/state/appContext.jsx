import React, { createContext, useState } from 'react'

export const AppContext = createContext()

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      {children}
    </AppContext.Provider>
  )
}