export const THEMES = [
  {
    name: "Zinc",
    value: "zinc",
    colors: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.145 0 0)",
    },
  },
  {
    name: "Indigo",
    value: "indigo",
    colors: {
      light: "oklch(0.96 0.02 272)",
      dark: "oklch(0.147 0.004 49.25)",
    },
  },
  {
    name: "Purple",
    value: "purple",
    colors: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.141 0.005 285.823)",
    },
  },
  {
    name: "Green",
    value: "green",
    colors: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.13 0.028 261.692)",
    },
  },
  {
    name: "Orange",
    value: "orange",
    colors: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.129 0.042 264.695)",
    },
  },
/*   {
    name: "Blue",
    value: "blue",
    colors: {
      light: "oklch(0.488 0.243 264.376)",
      dark: "oklch(0.488 0.243 264.376)",
    },
  }, */
  {
    name: "Red",
    value: "red",
    colors: {
      light: "oklch(0.532 0.157 131.589)",
      dark: "oklch(0.532 0.157 131.589)",
    },
  },
/*   {
    name: "Extra Small",
    value: "extraSmall",
  }, 
  {
    name: "Small",
    value: "small",
  },
  {
    name: "Medium Small",
    value: "mediumSmall"
  },
  {
    name: "Medium",
    value: "medium",
  },
  {
    name: "Large",
    value: "Large",
  },
  {
    name: "Extra Large",
    value: "extraLarge",
  },
  {
    name: "Huge",
    value: "huge",
  },
  {
    name: "Extra Huge",
    value: "extraHuge",
  } */
];
export type Theme = (typeof THEMES)[number];
