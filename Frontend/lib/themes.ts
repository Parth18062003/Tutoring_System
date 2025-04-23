import { bg } from "date-fns/locale";

export const THEMES = [
  {
    name: "Zinc",
    value: "zinc",
    bg: "bg-zinc-500",
    colors: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.145 0 0)",
    },
  },
  {
    name: "Indigo",
    value: "indigo",
    bg: "bg-indigo-500",
    colors: {
      light: "oklch(0.96 0.02 272)",
      dark: "oklch(0.147 0.004 49.25)",
    },
  },
  {
    name: "Purple",
    value: "purple",
    bg: "bg-violet-500",
    colors: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.141 0.005 285.823)",
    },
  },
  {
    name: "Green",
    value: "green",
    bg: "bg-emerald-500",
    colors: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.13 0.028 261.692)",
    },
  },
  {
    name: "Orange",
    value: "orange",
    bg: "bg-orange-500",
    colors: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.129 0.042 264.695)",
    },
  },
  {
    name: "Pink",
    value: "pink",
    bg: "bg-pink-500",
    colors: {
      light: "oklch(0.488 0.243 264.376)",
      dark: "oklch(0.488 0.243 264.376)",
    },
  },
  {
    name: "Blue",
    value: "blue",
    bg: "bg-sky-500",
    colors: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.5 0.5 90)",
    },
  },
  {
    name: "Red",
    value: "red",
    bg: "bg-rose-500",
    colors: {
      light: "oklch(0.532 0.157 131.589)",
      dark: "oklch(0.532 0.157 131.589)",
    },
  },
  {
    name: "Ghibli Meadow",
    value: "ghibli-meadow",
    bg: "oklch(0.98 0.01 120)",
    colors: {
      light: "oklch(0.98 0.01 120)",
      dark: "oklch(0.23 0.01 130)",
    },
  },
  {
    name: "Whispered Sky",
    value: "whispered-sky",
    bg: "oklch(0.98 0.01 240)",
    colors: {
      light: "oklch(0.98 0.01 240)",
      dark: "oklch(0.23 0.01 240)",
    },
  },
  {
    name: "Tea House",
    value: "tea-house",
    bg: "oklch(0.98 0.01 60)",
    colors: {
      light: "oklch(0.98 0.01 60)",
      dark: "oklch(0.23 0.01 60)",
    },
  }, 
  {
    name: "Peach Blossom",
    value: "peach-blossom",
    bg: "oklch(0.98 0.01 330)",
    colors: {
      light: "oklch(0.98 0.01 330)",
      dark: "oklch(0.23 0.01 330)",
    },
  },
  {
    name: "Vintage Mint",
    value: "vintage-mint",
    bg: "oklch(0.98 0.01 150)",
    colors: {
      light: "oklch(0.98 0.01 150)",
      dark: "oklch(0.23 0.01 150)",
    },
  },
  {
    name: "Midnight Forest",
    value: "midnight-forest",
    bg: "oklch(0.98 0.01 210)",
    colors: {
      light: "oklch(0.98 0.01 210)",
      dark: "oklch(0.23 0.01 210)",
    },
  },
  {
    name: "Starlight Breeze",
    value: "starlight-breeze",
    bg: "oklch(0.98 0.01 300)",
    colors: {
      light: "oklch(0.98 0.01 300)",
      dark: "oklch(0.23 0.01 300)",
    },
  }
];
export type Theme = (typeof THEMES)[number];
