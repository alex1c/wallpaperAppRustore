import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

/**
 * Root navigation — single calculator screen without extra back stack.
 * Header hidden: the calculator screen provides its own title and hierarchy.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#F7F8FA' },
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="wallpaper/index"
          options={{ animation: 'none' }}
        />
      </Stack>
    </>
  )
}
