import type { ConfigContext, ExpoConfig } from 'expo/config'

/**
 * Expo app config — Continuous Native Generation entry.
 *
 * Production / RuStore release builds should set:
 *   APP_VARIANT=production
 * and run `npm run prebuild:android:production` so expo-dev-* packages are
 * excluded from native autolinking (see scripts/prebuild-android-production.cjs).
 *
 * Local development keeps APP_VARIANT unset and includes expo-dev-client.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
	const isProduction = process.env.APP_VARIANT === 'production'

	const plugins: NonNullable<ExpoConfig['plugins']> = [
		'expo-router',
		'expo-sharing',
	]

	if (!isProduction) {
		plugins.splice(1, 0, 'expo-dev-client')
	}

	return {
		...config,
		name: 'Калькулятор обоев',
		slug: 'wallpaper-calculator',
		version: '1.0.0',
		orientation: 'portrait',
		icon: './assets/icon.png',
		userInterfaceStyle: 'light',
		scheme: 'wallpaper-calculator',
		experiments: {
			typedRoutes: true,
		},
		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.calculatorplatform.wallpaper',
		},
		android: {
			package: 'com.calculatorplatform.wallpaper',
			versionCode: 1,
			adaptiveIcon: {
				backgroundColor: '#E6F4FE',
				foregroundImage: './assets/android-icon-foreground.png',
				backgroundImage: './assets/android-icon-background.png',
				monochromeImage: './assets/android-icon-monochrome.png',
			},
			predictiveBackGestureEnabled: false,
		},
		plugins,
		extra: {
			appVariant: isProduction ? 'production' : 'development',
		},
	}
}
