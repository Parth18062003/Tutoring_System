"use client"

import { useThemeConfig } from "@/hooks/use-active-theme"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { THEMES } from "@/lib/themes"
import { cn } from "@/lib/utils"

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig()
  return (
    <Select value={activeTheme} onValueChange={setActiveTheme}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent align="end">
        {THEMES.map((theme) => (
          <SelectItem key={theme.name} value={theme.value} defaultValue={activeTheme}>
           <div className={cn(`h-4 w-4 rounded-full`, `${theme.bg}`)} />
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}