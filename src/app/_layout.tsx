import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { t } from '@/i18n'

/** Root navigation layout for the Calculator Platform wallpaper app. */
export default function RootLayout() {
  const strings = t()

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#F7F8FA' },
          headerTintColor: '#1A1D26',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: '#F7F8FA' },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: strings.app.title }}
        />
        <Stack.Screen
          name="wallpaper/index"
          options={{ title: strings.wallpaper.heading }}
        />
      </Stack>
    </>
  )
}
