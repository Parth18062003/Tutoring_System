"use client"

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

const COOKIE_NAME = "font_size"
const DEFAULT_FONT_SIZE = 100

function setThemeCookie(theme: number) {
  if (typeof window === "undefined") return

  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${window.location.protocol === "https:" ? "Secure;" : ""}`
}

type ThemeContextType = {
  fontSize: number
  setFontSize: (theme: number) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function FontSizeProvider({
  children,
  initialFontSize,
}: {
  children: ReactNode
  initialFontSize?: number
}) {
  const [fontSize, setFontSize] = useState<number>(
    () => initialFontSize || DEFAULT_FONT_SIZE
  )

  useEffect(() => {
    setThemeCookie(fontSize)

    document.body.classList.forEach((className) => {
      if (className.startsWith("fontSize-")) {
        document.body.classList.remove(className)
      }
    })
    document.body.classList.add(`fontSize-${fontSize}`)
  }, [fontSize])

  return (
    <ThemeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useFontSizeConfig() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useFontSizeConfig must be used within an fontSizeProvider")
  }
  return context
}