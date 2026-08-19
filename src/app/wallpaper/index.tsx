import { Redirect } from 'expo-router'

/** Legacy wallpaper route — redirect to root calculator. */
export default function WallpaperRedirectRoute() {
  return <Redirect href="/" />
}
