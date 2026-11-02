export const THEME = {
  bg: '#080c14',
  cardBg: '#0f172a',
  cardBorder: '#1e293b',
  cardBorderGlow: '#00f0ff',
  primary: '#00f0ff', // Cyber cyan
  secondary: '#38bdf8', // Light sky
  accent: '#f59e0b', // Amber gold (motherboard copper/gold)
  success: '#10b981', // Emerald green
  danger: '#ef4444', // Red short-circuit alert
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textDim: '#64748b',
};

export const FPS = 30;

export interface SceneMeta {
  id: string;
  title: string;
  durationInFrames: number;
}
