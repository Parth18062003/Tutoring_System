"use client"

import { useThemeConfig } from "@/components/active-theme"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { THEMES } from "@/lib/themes"

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig()

  return (
    <Select value={activeTheme} onValueChange={setActiveTheme}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent align="end">
        {THEMES.map((theme) => (
          <SelectItem key={theme.name} value={theme.value}>
            <div className={`h-4 w-4 rounded-full bg-${theme.value}-500`} />
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}