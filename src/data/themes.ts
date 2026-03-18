export type ThemeDefinition = {
  id: string;
  displayName: string;
  description: string;
  accent: string;
  palette: {
    background: string;
    surface: string;
    border: string;
    textPrimary: string;
    textMuted: string;
    glow: string;
    gradient: string;
    detail: string;
  };
};

export const themes: ThemeDefinition[] = [
  {
    id: "north-studios",
    displayName: "North Studios",
    description: "Calm, luminous, and tied to the azure palette in the inspiration art.",
    accent: "#48b5ff",
    palette: {
      background: "#030712",
      surface: "#0b1b33",
      border: "#1d2a49",
      textPrimary: "#e4ecff",
      textMuted: "#9bb1da",
      glow: "rgba(72, 181, 255, 0.35)",
      gradient: "linear-gradient(145deg,#0b1b33,#1c2b4d 65%)",
      detail: "#274070"
    }
  },
  {
    id: "cobalt-loom",
    displayName: "Cobalt Loom",
    description: "Deeper cobalt with warm gold accents for a paperlike, editorial feel.",
    accent: "#facc15",
    palette: {
      background: "#050711",
      surface: "#0c1223",
      border: "#1e1f2b",
      textPrimary: "#f3f6ff",
      textMuted: "#bec5e6",
      glow: "rgba(250, 204, 21, 0.35)",
      gradient: "linear-gradient(145deg,#050711,#1f1f34 70%)",
      detail: "#252d45"
    }
  },
  {
    id: "coastal-ink",
    displayName: "Coastal Ink",
    description: "Soft navy canvas with teal lighting and a hint of silver ink.",
    accent: "#5ddfee",
    palette: {
      background: "#040d14",
      surface: "#0d2130",
      border: "#1f3344",
      textPrimary: "#f7fbff",
      textMuted: "#8fb3c6",
      glow: "rgba(93, 223, 238, 0.35)",
      gradient: "linear-gradient(145deg,#0d2130,#182a3d 65%)",
      detail: "#1a2c3b"
    }
  }
];

export const themeMap = Object.fromEntries(themes.map((theme) => [theme.id, theme]));
