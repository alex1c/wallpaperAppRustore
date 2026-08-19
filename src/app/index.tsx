import { WallpaperCalculatorScreen } from '@/features/wallpaper/wallpaper-calculator-screen'

/**
 * Root route — single-function app launches directly into Quick Calculator.
 * No intermediate Calculator Platform home screen.
 */
export default function RootCalculatorRoute() {
  return <WallpaperCalculatorScreen />
}
