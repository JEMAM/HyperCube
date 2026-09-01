/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-deep": "#071526",
        "surface-canvas": "#f4f6f9",
        "border-hairline": "#d8e2ec",
        "secondary-container": "#ff5537",
        "primary-container": "#0c2340",
        "on-secondary-container": "#ffffff",
        "secondary-fixed": "#ffe4df",
        "status-success": "#2fbf71",
        "status-critical": "#e5484d",
        "status-neutral": "#8c93a6",
        
        // Stitch MCP Financial Design System Tokens (Pigment & Bloomberg Dark Fintech)
        "stitch-canvas": "#0b1326",
        "stitch-surface": "#0b1326",
        "stitch-surface-low": "#131b2e",
        "stitch-surface-card": "#171f33",
        "stitch-surface-high": "#222a3d",
        "stitch-surface-highest": "#2d3449",
        "stitch-border": "#222a3d",
        "stitch-border-hairline": "#3e484f",
        "stitch-primary": "#8ed5ff",
        "stitch-accent": "#38bdf8",
        "stitch-text": "#dae2fd",
        "stitch-text-muted": "#bdc8d1",
        "stitch-secondary": "#b9c8de",
        "stitch-success": "#52e87c",
        "stitch-success-container": "#2ccb63",
        "stitch-danger": "#ffb4ab",
        "stitch-coral": "#ff5537",
        "stitch-amber": "#f5822b",
        
        // Anaplan Official Design Tokens
        "anaplan-navy-dark": "#071526",
        "anaplan-navy": "#0c2340",
        "anaplan-navy-light": "#14335a",
        "anaplan-coral": "#ff5537",
        "anaplan-coral-hover": "#e03e22",
        "anaplan-cyan": "#00a3e0",
        "anaplan-teal": "#00b2a9",
        "anaplan-canvas": "#f4f6f9",
        "anaplan-card": "#ffffff",
        "anaplan-border": "#d8e2ec",
        "anaplan-text-muted": "#607289",
        "anaplan-text-dark": "#142436"
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      }
    },
  },
  plugins: [],
}
